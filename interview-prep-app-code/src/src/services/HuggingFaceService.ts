import { pipeline } from '@xenova/transformers';

// Type for the pipeline - using any to avoid type issues with different pipeline types
type GeneratorPipeline = any;
import {
  Assessment,
  PitchAnalysis,
  SessionContext,
  HuggingFaceError,
} from '../types';

export class HuggingFaceService {
  private generator: GeneratorPipeline | null = null;
  private maxRetries: number;
  private retryDelay: number;
  private isInitialized: boolean = false;

  constructor(apiKey?: string, maxRetries = 3, retryDelay = 1000) {
    // apiKey parameter kept for compatibility but not used with local models
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Use a smaller, faster model that works well in the browser
      // Flan-T5-small is a good balance of size and capability
      this.generator = await pipeline('text2text-generation', 'Xenova/flan-t5-small');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize model:', error);
      throw new HuggingFaceError(
        'Failed to initialize local model',
        error as Error
      );
    }
  }

  private async ensureModelLoaded(): Promise<GeneratorPipeline> {
    if (!this.isInitialized || !this.generator) {
      await this.initializeModel();
    }
    if (!this.generator) {
      throw new HuggingFaceError('Model not initialized');
    }
    return this.generator;
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retries = this.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * (this.maxRetries - retries + 1))
        );
        return this.retryWithBackoff(operation, retries - 1);
      }
      throw error;
    }
  }

  async generateQuestion(
    context: SessionContext,
    category: string
  ): Promise<string> {
    try {
      const prompt = this.buildQuestionPrompt(context, category);
      const generator = await this.ensureModelLoaded();

      const result = await this.retryWithBackoff(async () => {
        const response = await generator(prompt, {
          max_new_tokens: 100,
          temperature: 0.7,
        });
        return response;
      });

      // Transformers.js returns an array with generated_text property
      const generatedText = Array.isArray(result) ? result[0].generated_text : result.generated_text;
      return this.parseQuestionResponse(generatedText);
    } catch (error) {
      throw new HuggingFaceError(
        'Failed to generate question',
        error as Error
      );
    }
  }

  async assessResponse(
    question: string,
    answer: string,
    category: string
  ): Promise<Assessment> {
    try {
      const prompt = this.buildAssessmentPrompt(question, answer, category);
      const generator = await this.ensureModelLoaded();

      const result = await this.retryWithBackoff(async () => {
        const response = await generator(prompt, {
          max_new_tokens: 250,
          temperature: 0.5,
        });
        return response;
      });

      const generatedText = Array.isArray(result) ? result[0].generated_text : result.generated_text;
      return this.parseAssessmentResponse(generatedText);
    } catch (error) {
      throw new HuggingFaceError(
        'Failed to assess response',
        error as Error
      );
    }
  }

  async analyzeIntroduction(pitch: string): Promise<PitchAnalysis> {
    try {
      const prompt = this.buildPitchAnalysisPrompt(pitch);
      const generator = await this.ensureModelLoaded();

      const result = await this.retryWithBackoff(async () => {
        const response = await generator(prompt, {
          max_new_tokens: 200,
          temperature: 0.3,
        });
        return response;
      });

      const generatedText = Array.isArray(result) ? result[0].generated_text : result.generated_text;
      return this.parsePitchAnalysisResponse(generatedText);
    } catch (error) {
      throw new HuggingFaceError(
        'Failed to analyze introduction',
        error as Error
      );
    }
  }

  private buildQuestionPrompt(
    context: SessionContext,
    category: string
  ): string {
    let prompt = `Generate an interview question for a ${category} position. `;

    if (context.introductoryPitch) {
      prompt += `The candidate introduced themselves as: "${context.introductoryPitch}". `;
    }

    if (context.previousExchanges.length > 0) {
      prompt += `Previous questions and answers: `;
      context.previousExchanges.forEach((exchange, index) => {
        prompt += `Q${index + 1}: ${exchange.question} A${index + 1}: ${exchange.answer}. `;
      });
    }

    if (context.extractedTopics.length > 0) {
      prompt += `Focus on topics: ${context.extractedTopics.join(', ')}. `;
    }

    prompt += `Generate a relevant follow-up question:`;
    return prompt;
  }

  private buildAssessmentPrompt(
    question: string,
    answer: string,
    category: string
  ): string {
    return `Assess this interview answer for a ${category} position.
Question: ${question}
Answer: ${answer}

Provide assessment in this format:
Score: [0-10]
Strengths: [list strengths]
Improvements: [list improvements]
Feedback: [detailed feedback]`;
  }

  private buildPitchAnalysisPrompt(pitch: string): string {
    return `Analyze this introduction pitch and extract key information:
"${pitch}"

Extract:
Topics: [key topics mentioned]
Experience: [work experience mentioned]
Skills: [skills mentioned]
Interests: [interests mentioned]`;
  }

  private parseQuestionResponse(response: string): string {
    // Clean up the response and extract the question
    const cleaned = response.trim();
    // If response contains multiple sentences, take the first one as the question
    const question = cleaned.split('\n')[0].trim();
    return question || 'What are your key strengths for this role?';
  }

  private parseAssessmentResponse(response: string): Assessment {
    try {
      const lines = response.split('\n').filter((line) => line.trim());

      let score = 5; // default
      const strengths: string[] = [];
      const improvements: string[] = [];
      let detailedFeedback = '';

      for (const line of lines) {
        if (line.toLowerCase().includes('score:')) {
          const scoreMatch = line.match(/\d+/);
          if (scoreMatch) {
            score = Math.min(10, Math.max(0, parseInt(scoreMatch[0])));
          }
        } else if (line.toLowerCase().includes('strength')) {
          const content = line.split(':')[1]?.trim();
          if (content) strengths.push(content);
        } else if (line.toLowerCase().includes('improvement')) {
          const content = line.split(':')[1]?.trim();
          if (content) improvements.push(content);
        } else if (line.toLowerCase().includes('feedback:')) {
          detailedFeedback = line.split(':')[1]?.trim() || '';
        }
      }

      // Ensure we have at least some feedback
      if (strengths.length === 0) {
        strengths.push('Response provided relevant information');
      }
      if (improvements.length === 0) {
        improvements.push('Consider providing more specific examples');
      }
      if (!detailedFeedback) {
        detailedFeedback = 'Your answer addresses the question. Consider elaborating with specific examples.';
      }

      return {
        score,
        strengths,
        improvements,
        detailedFeedback,
      };
    } catch (error) {
      // Return default assessment if parsing fails
      return {
        score: 5,
        strengths: ['Response provided'],
        improvements: ['Consider providing more detail'],
        detailedFeedback: 'Unable to fully assess response. Please try again.',
      };
    }
  }

  private parsePitchAnalysisResponse(response: string): PitchAnalysis {
    try {
      const lines = response.split('\n').filter((line) => line.trim());

      const analysis: PitchAnalysis = {
        keyTopics: [],
        experience: [],
        skills: [],
        interests: [],
      };

      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.includes('topic')) {
          const content = line.split(':')[1]?.trim();
          if (content) analysis.keyTopics = content.split(',').map((s) => s.trim());
        } else if (lower.includes('experience')) {
          const content = line.split(':')[1]?.trim();
          if (content) analysis.experience = content.split(',').map((s) => s.trim());
        } else if (lower.includes('skill')) {
          const content = line.split(':')[1]?.trim();
          if (content) analysis.skills = content.split(',').map((s) => s.trim());
        } else if (lower.includes('interest')) {
          const content = line.split(':')[1]?.trim();
          if (content) analysis.interests = content.split(',').map((s) => s.trim());
        }
      }

      return analysis;
    } catch (error) {
      // Return empty analysis if parsing fails
      return {
        keyTopics: [],
        experience: [],
        skills: [],
        interests: [],
      };
    }
  }
}
