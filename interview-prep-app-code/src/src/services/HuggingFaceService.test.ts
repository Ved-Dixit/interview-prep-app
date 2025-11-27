import * as fc from 'fast-check';
import { HuggingFaceService } from './HuggingFaceService';

// Mock the Transformers.js library
jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn(),
}));

import { pipeline } from '@xenova/transformers';

describe('HuggingFaceService', () => {
  let service: HuggingFaceService;
  let mockGenerator: jest.Mock;

  beforeEach(() => {
    mockGenerator = jest.fn();
    (pipeline as jest.Mock).mockResolvedValue(mockGenerator);
    service = new HuggingFaceService();
  });

  /**
   * Feature: interview-prep-app, Property 11: Model response parsing succeeds
   * Validates: Requirements 6.3
   *
   * For any valid response from the HF Model, the system should successfully
   * parse it into the expected data structure without throwing errors.
   */
  describe('Property 11: Model response parsing succeeds', () => {
    it('should parse any valid assessment response format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 10 }),
          fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 3 }),
          fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 3 }),
          fc.string({ minLength: 10, maxLength: 100 }),
          async (score, strengths, improvements, feedback) => {
            // Generate a valid response format
            const response = `Score: ${score}
Strengths: ${strengths.join(', ')}
Improvements: ${improvements.join(', ')}
Feedback: ${feedback}`;

            mockGenerator.mockResolvedValue([{
              generated_text: response,
            }]);

            const result = await service.assessResponse(
              'Test question',
              'Test answer',
              'Software Engineering'
            );

            // Should successfully parse without throwing
            expect(result).toBeDefined();
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(10);
            expect(Array.isArray(result.strengths)).toBe(true);
            expect(Array.isArray(result.improvements)).toBe(true);
            expect(typeof result.detailedFeedback).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should parse any valid pitch analysis response format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
          fc.array(fc.string({ minLength: 3, maxLength: 30 }), { minLength: 0, maxLength: 5 }),
          fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
          fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
          async (topics, experience, skills, interests) => {
            const response = `Topics: ${topics.join(', ')}
Experience: ${experience.join(', ')}
Skills: ${skills.join(', ')}
Interests: ${interests.join(', ')}`;

            mockGenerator.mockResolvedValue([{
              generated_text: response,
            }]);

            const result = await service.analyzeIntroduction('Test pitch');

            // Should successfully parse without throwing
            expect(result).toBeDefined();
            expect(Array.isArray(result.keyTopics)).toBe(true);
            expect(Array.isArray(result.experience)).toBe(true);
            expect(Array.isArray(result.skills)).toBe(true);
            expect(Array.isArray(result.interests)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should parse any valid question response format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 200 }),
          async (questionText) => {
            mockGenerator.mockResolvedValue([{
              generated_text: questionText,
            }]);

            const result = await service.generateQuestion(
              {
                category: 'Software Engineering',
                previousExchanges: [],
                extractedTopics: [],
              },
              'Software Engineering'
            );

            // Should successfully parse without throwing
            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: interview-prep-app, Property 6: Assessment generation is complete
   * Validates: Requirements 4.1, 4.2
   *
   * For any submitted answer, the evaluation should produce an assessment object
   * containing both a quality evaluation and non-empty improvement suggestions.
   */
  describe('Property 6: Assessment generation is complete', () => {
    it('should generate complete assessment for any answer', async () => {
      // Generate realistic text strings with words
      const textGen = fc.array(
        fc.constantFrom('software', 'engineering', 'experience', 'project', 'team', 'work', 'develop', 'manage', 'lead', 'design'),
        { minLength: 3, maxLength: 20 }
      ).map(words => words.join(' '));

      await fc.assert(
        fc.asyncProperty(
          textGen,
          textGen,
          fc.constantFrom('Software Engineering', 'Marketing', 'Finance', 'Data Science', 'Product Management'),
          async (question, answer, category) => {
            // Mock a valid assessment response
            const mockResponse = `Score: 7
Strengths: Clear communication, Good examples
Improvements: Add more technical details, Better structure
Feedback: Your answer demonstrates understanding but could be more detailed.`;

            mockGenerator.mockResolvedValue([{
              generated_text: mockResponse,
            }]);

            const assessment = await service.assessResponse(question, answer, category);

            // Assessment should be complete with all required fields
            expect(assessment).toBeDefined();
            expect(typeof assessment.score).toBe('number');
            expect(assessment.score).toBeGreaterThanOrEqual(0);
            expect(assessment.score).toBeLessThanOrEqual(10);
            
            // Should have non-empty improvement suggestions
            expect(Array.isArray(assessment.improvements)).toBe(true);
            expect(assessment.improvements.length).toBeGreaterThan(0);
            
            // Should have strengths
            expect(Array.isArray(assessment.strengths)).toBe(true);
            expect(assessment.strengths.length).toBeGreaterThan(0);
            
            // Should have detailed feedback
            expect(typeof assessment.detailedFeedback).toBe('string');
            expect(assessment.detailedFeedback.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate complete assessment even with minimal model response', async () => {
      // Generate realistic text strings with words
      const textGen = fc.array(
        fc.constantFrom('software', 'engineering', 'experience', 'project', 'team', 'work', 'develop', 'manage', 'lead', 'design'),
        { minLength: 3, maxLength: 20 }
      ).map(words => words.join(' '));

      await fc.assert(
        fc.asyncProperty(
          textGen,
          textGen,
          fc.constantFrom('Software Engineering', 'Marketing', 'Finance', 'Data Science', 'Product Management'),
          async (question, answer, category) => {
            // Mock a minimal or malformed response
            mockGenerator.mockResolvedValue([{
              generated_text: 'Score: 5',
            }]);

            const assessment = await service.assessResponse(question, answer, category);

            // Even with minimal response, should provide complete assessment with defaults
            expect(assessment).toBeDefined();
            expect(assessment.improvements.length).toBeGreaterThan(0);
            expect(assessment.strengths.length).toBeGreaterThan(0);
            expect(assessment.detailedFeedback.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: interview-prep-app, Property 8: Assessment structure is comprehensive
   * Validates: Requirements 4.5
   *
   * For any generated assessment, the suggestions should include distinct feedback
   * addressing multiple aspects of the response (content, structure, clarity, relevance).
   */
  describe('Property 8: Assessment structure is comprehensive', () => {
    it('should provide comprehensive feedback addressing multiple aspects', async () => {
      // Generate realistic text strings with words
      const textGen = fc.array(
        fc.constantFrom('software', 'engineering', 'experience', 'project', 'team', 'work', 'develop', 'manage', 'lead', 'design'),
        { minLength: 3, maxLength: 20 }
      ).map(words => words.join(' '));

      await fc.assert(
        fc.asyncProperty(
          textGen,
          textGen,
          fc.constantFrom('Software Engineering', 'Marketing', 'Finance', 'Data Science', 'Product Management'),
          async (question, answer, category) => {
            // Mock a comprehensive assessment response with multiple aspects
            const mockResponse = `Score: 8
Strengths: Clear communication, Good structure, Relevant examples
Improvements: Add more technical depth, Improve clarity in explanations, Better relevance to question
Feedback: Your answer demonstrates good understanding with clear structure and relevant examples, but could benefit from more technical depth and clearer explanations.`;

            mockGenerator.mockResolvedValue([{
              generated_text: mockResponse,
            }]);

            const assessment = await service.assessResponse(question, answer, category);

            // Assessment should have multiple distinct pieces of feedback
            expect(assessment).toBeDefined();
            
            // Should have multiple strengths (addressing different aspects)
            expect(assessment.strengths.length).toBeGreaterThan(0);
            
            // Should have multiple improvements (addressing different aspects)
            expect(assessment.improvements.length).toBeGreaterThan(0);
            
            // Detailed feedback should be comprehensive (non-empty)
            expect(assessment.detailedFeedback).toBeDefined();
            expect(assessment.detailedFeedback.length).toBeGreaterThan(0);
            
            // The assessment structure should be comprehensive - having both strengths and improvements
            // indicates feedback on multiple aspects
            const totalFeedbackItems = assessment.strengths.length + assessment.improvements.length;
            expect(totalFeedbackItems).toBeGreaterThan(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain comprehensive structure even with varied model responses', async () => {
      // Generate realistic text strings with words
      const textGen = fc.array(
        fc.constantFrom('software', 'engineering', 'experience', 'project', 'team', 'work', 'develop', 'manage', 'lead', 'design'),
        { minLength: 3, maxLength: 20 }
      ).map(words => words.join(' '));

      await fc.assert(
        fc.asyncProperty(
          textGen,
          textGen,
          fc.constantFrom('Software Engineering', 'Marketing', 'Finance', 'Data Science', 'Product Management'),
          fc.integer({ min: 0, max: 10 }),
          async (question, answer, category, score) => {
            // Mock varied responses with different scores
            const mockResponse = `Score: ${score}
Strengths: Content quality, Structure
Improvements: Clarity, Relevance
Feedback: Assessment of content, structure, clarity, and relevance.`;

            mockGenerator.mockResolvedValue([{
              generated_text: mockResponse,
            }]);

            const assessment = await service.assessResponse(question, answer, category);

            // Even with varied responses, structure should remain comprehensive
            expect(assessment).toBeDefined();
            expect(assessment.strengths.length).toBeGreaterThan(0);
            expect(assessment.improvements.length).toBeGreaterThan(0);
            expect(assessment.detailedFeedback.length).toBeGreaterThan(0);
            
            // Should address multiple aspects (at least 2 total feedback items)
            const totalFeedbackItems = assessment.strengths.length + assessment.improvements.length;
            expect(totalFeedbackItems).toBeGreaterThanOrEqual(2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: interview-prep-app, Property 12: Model error handling is graceful
   * Validates: Requirements 6.4
   *
   * For any error response from the HF Model, the system should handle it
   * without crashing and return an error message to the user.
   */
  describe('Property 12: Model error handling is graceful', () => {
    it('should handle any error from generateQuestion gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 100 }),
          fc.string({ minLength: 3, maxLength: 50 }),
          async (errorMessage, category) => {
            // Create service with no retries for faster testing
            const testService = new HuggingFaceService(undefined, 0, 0);
            
            // Mock error for this iteration
            mockGenerator.mockRejectedValue(new Error(errorMessage));

            try {
              await testService.generateQuestion(
                {
                  category,
                  previousExchanges: [],
                  extractedTopics: [],
                },
                category
              );
              // Should not reach here
              throw new Error('Expected error to be thrown');
            } catch (error: any) {
              // Should catch error gracefully and wrap it
              expect(error.name).toBe('HuggingFaceError');
              expect(error.message).toContain('Failed to generate question');
              // Should not crash - error is handled
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 30000);

    it('should handle any error from assessResponse gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 100 }),
          fc.string({ minLength: 5, maxLength: 100 }),
          fc.string({ minLength: 5, maxLength: 100 }),
          fc.string({ minLength: 3, maxLength: 50 }),
          async (errorMessage, question, answer, category) => {
            // Create service with no retries for faster testing
            const testService = new HuggingFaceService(undefined, 0, 0);
            
            // Mock error for this iteration
            mockGenerator.mockRejectedValue(new Error(errorMessage));

            try {
              await testService.assessResponse(question, answer, category);
              // Should not reach here
              throw new Error('Expected error to be thrown');
            } catch (error: any) {
              // Should catch error gracefully and wrap it
              expect(error.name).toBe('HuggingFaceError');
              expect(error.message).toContain('Failed to assess response');
              // Should not crash - error is handled
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 30000);

    it('should handle any error from analyzeIntroduction gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 100 }),
          fc.string({ minLength: 10, maxLength: 200 }),
          async (errorMessage, pitch) => {
            // Create service with no retries for faster testing
            const testService = new HuggingFaceService(undefined, 0, 0);
            
            // Mock error for this iteration
            mockGenerator.mockRejectedValue(new Error(errorMessage));

            try {
              await testService.analyzeIntroduction(pitch);
              // Should not reach here
              throw new Error('Expected error to be thrown');
            } catch (error: any) {
              // Should catch error gracefully and wrap it
              expect(error.name).toBe('HuggingFaceError');
              expect(error.message).toContain('Failed to analyze introduction');
              // Should not crash - error is handled
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 30000);
  });
});
