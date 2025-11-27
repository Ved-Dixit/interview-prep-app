import {
  Session,
  SessionState,
  SessionContext,
  QuestionAnswerPair,
  Assessment,
  SessionSummary,
  SessionStateError,
  ValidationError,
} from '../types';

export class SessionManager {
  private session: Session | null = null;

  /**
   * Initialize a new interview session with the selected category
   */
  initializeSession(category: string): Session {
    if (!category || category.trim() === '') {
      throw new ValidationError('Category cannot be empty', 'category');
    }

    this.session = {
      id: this.generateSessionId(),
      category: category.trim(),
      startTime: new Date(),
      exchanges: [],
      currentState: SessionState.INTRODUCTORY_PITCH,
    };

    return this.session;
  }

  /**
   * Store the introductory pitch and transition to question-answer state
   */
  storePitch(pitch: string): void {
    this.ensureSessionExists();
    
    if (this.session!.currentState !== SessionState.INTRODUCTORY_PITCH) {
      throw new SessionStateError(
        `Cannot store pitch in state: ${this.session!.currentState}`,
        this.session!.currentState
      );
    }

    if (!pitch || pitch.trim() === '') {
      throw new ValidationError('Pitch cannot be empty', 'pitch');
    }

    this.session!.introductoryPitch = pitch.trim();
    this.session!.currentState = SessionState.QUESTION_ANSWER;
  }

  /**
   * Add a question-answer exchange with assessment to the session
   */
  addExchange(question: string, answer: string, assessment: Assessment): void {
    this.ensureSessionExists();

    if (this.session!.currentState !== SessionState.QUESTION_ANSWER) {
      throw new SessionStateError(
        `Cannot add exchange in state: ${this.session!.currentState}`,
        this.session!.currentState
      );
    }

    if (!question || question.trim() === '') {
      throw new ValidationError('Question cannot be empty', 'question');
    }

    if (!answer || answer.trim() === '') {
      throw new ValidationError('Answer cannot be empty', 'answer');
    }

    const exchange: QuestionAnswerPair = {
      question: question.trim(),
      answer: answer.trim(),
      assessment,
      timestamp: new Date(),
    };

    this.session!.exchanges.push(exchange);
  }

  /**
   * Build context from session history for generating next question
   */
  getContext(): SessionContext {
    this.ensureSessionExists();

    const extractedTopics = this.extractTopicsFromExchanges();

    return {
      category: this.session!.category,
      introductoryPitch: this.session!.introductoryPitch,
      previousExchanges: [...this.session!.exchanges],
      extractedTopics,
    };
  }

  /**
   * Get the current session
   */
  getCurrentSession(): Session | null {
    return this.session ? { ...this.session } : null;
  }

  /**
   * Transition to session end state
   */
  endSession(): SessionSummary {
    this.ensureSessionExists();

    this.session!.currentState = SessionState.SESSION_END;

    const duration = Date.now() - this.session!.startTime.getTime();
    const totalQuestions = this.session!.exchanges.length;
    
    const averageScore = totalQuestions > 0
      ? this.session!.exchanges.reduce((sum, ex) => sum + ex.assessment.score, 0) / totalQuestions
      : 0;

    const allStrengths = this.session!.exchanges.flatMap(ex => ex.assessment.strengths);
    const allImprovements = this.session!.exchanges.flatMap(ex => ex.assessment.improvements);

    const summary: SessionSummary = {
      sessionId: this.session!.id,
      category: this.session!.category,
      totalQuestions,
      averageScore,
      overallStrengths: Array.from(new Set(allStrengths)),
      overallImprovements: Array.from(new Set(allImprovements)),
      exchanges: [...this.session!.exchanges],
      duration,
    };

    return summary;
  }

  /**
   * Check if session can transition to a specific state
   */
  canTransitionTo(targetState: SessionState): boolean {
    if (!this.session) {
      return targetState === SessionState.CATEGORY_SELECTION;
    }

    const currentState = this.session.currentState;

    // Define valid state transitions
    const validTransitions: Record<SessionState, SessionState[]> = {
      [SessionState.CATEGORY_SELECTION]: [SessionState.INTRODUCTORY_PITCH],
      [SessionState.INTRODUCTORY_PITCH]: [SessionState.QUESTION_ANSWER],
      [SessionState.QUESTION_ANSWER]: [SessionState.SESSION_END],
      [SessionState.SESSION_END]: [],
    };

    return validTransitions[currentState]?.includes(targetState) ?? false;
  }

  /**
   * Reset the session manager
   */
  reset(): void {
    this.session = null;
  }

  private ensureSessionExists(): void {
    if (!this.session) {
      throw new SessionStateError('No active session');
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractTopicsFromExchanges(): string[] {
    if (!this.session || this.session.exchanges.length === 0) {
      return [];
    }

    // Simple topic extraction: extract key words from questions and answers
    const topics = new Set<string>();

    this.session.exchanges.forEach(exchange => {
      // Extract meaningful words (longer than 3 characters)
      const words = [
        ...exchange.question.toLowerCase().split(/\W+/),
        ...exchange.answer.toLowerCase().split(/\W+/),
      ].filter(word => word.length > 3);

      words.forEach(word => topics.add(word));
    });

    return Array.from(topics);
  }
}
