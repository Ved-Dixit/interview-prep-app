// Core data models and types for the Interview Prep App

export enum SessionState {
  CATEGORY_SELECTION = 'CATEGORY_SELECTION',
  INTRODUCTORY_PITCH = 'INTRODUCTORY_PITCH',
  QUESTION_ANSWER = 'QUESTION_ANSWER',
  SESSION_END = 'SESSION_END',
}

export interface Assessment {
  score: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
}

export interface QuestionAnswerPair {
  question: string;
  answer: string;
  assessment: Assessment;
  timestamp: Date;
}

export interface Session {
  id: string;
  category: string;
  startTime: Date;
  introductoryPitch?: string;
  exchanges: QuestionAnswerPair[];
  currentState: SessionState;
}

export interface SessionContext {
  category: string;
  introductoryPitch?: string;
  previousExchanges: QuestionAnswerPair[];
  extractedTopics: string[];
}

export interface PitchAnalysis {
  keyTopics: string[];
  experience: string[];
  skills: string[];
  interests: string[];
}

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  context: string;
  questionTemplates: string[];
}

export interface SessionSummary {
  sessionId: string;
  category: string;
  totalQuestions: number;
  averageScore: number;
  overallStrengths: string[];
  overallImprovements: string[];
  exchanges: QuestionAnswerPair[];
  duration: number;
}

// Error types
export class HuggingFaceError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'HuggingFaceError';
  }
}

export class SpeechRecognitionError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'SpeechRecognitionError';
  }
}

export class SessionStateError extends Error {
  constructor(message: string, public readonly currentState?: SessionState) {
    super(message);
    this.name = 'SessionStateError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
