import * as fc from 'fast-check';
import { SessionManager } from './SessionManager';
import { SessionState, Assessment } from '../types';

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: interview-prep-app, Property 1: Category selection initializes session
     * Validates: Requirements 1.2
     */
    test('Property 1: For any valid category, selecting that category should initialize a new interview session', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (category) => {
            const manager = new SessionManager();
            const session = manager.initializeSession(category);

            // Session should be initialized with the selected category
            expect(session).toBeDefined();
            expect(session.category).toBe(category.trim());
            expect(session.id).toBeDefined();
            expect(session.startTime).toBeInstanceOf(Date);
            expect(session.exchanges).toEqual([]);
            expect(session.currentState).toBe(SessionState.INTRODUCTORY_PITCH);
            expect(session.introductoryPitch).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: interview-prep-app, Property 5: Context accumulation includes all exchanges
     * Validates: Requirements 3.2
     */
    test('Property 5: For any sequence of question-answer pairs, context should include all previous exchanges', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.array(
            fc.record({
              question: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              answer: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
              assessment: fc.record({
                score: fc.integer({ min: 0, max: 100 }),
                strengths: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 5 }),
                improvements: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 5 }),
                detailedFeedback: fc.string({ minLength: 0, maxLength: 200 }),
              }),
            }),
            { minLength: 0, maxLength: 10 }
          ),
          (category, exchanges) => {
            const manager = new SessionManager();
            manager.initializeSession(category);
            manager.storePitch('Test pitch');

            // Add all exchanges
            exchanges.forEach(ex => {
              manager.addExchange(ex.question, ex.answer, ex.assessment);
            });

            // Get context
            const context = manager.getContext();

            // Context should include all exchanges
            expect(context.previousExchanges).toHaveLength(exchanges.length);
            expect(context.category).toBe(category.trim());
            expect(context.introductoryPitch).toBe('Test pitch');

            // Verify all exchanges are present
            exchanges.forEach((ex, index) => {
              expect(context.previousExchanges[index].question).toBe(ex.question.trim());
              expect(context.previousExchanges[index].answer).toBe(ex.answer.trim());
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: interview-prep-app, Property 15: Session flow follows correct sequence
     * Validates: Requirements 8.1
     */
    test('Property 15: For any interview session, state transitions should follow correct sequence', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
          fc.array(
            fc.record({
              question: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              answer: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
              assessment: fc.record({
                score: fc.integer({ min: 0, max: 100 }),
                strengths: fc.array(fc.string({ minLength: 1, maxLength: 50 })),
                improvements: fc.array(fc.string({ minLength: 1, maxLength: 50 })),
                detailedFeedback: fc.string({ maxLength: 200 }),
              }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (category, pitch, exchanges) => {
            const manager = new SessionManager();

            // State 1: After initialization, should be in INTRODUCTORY_PITCH
            const session = manager.initializeSession(category);
            expect(session.currentState).toBe(SessionState.INTRODUCTORY_PITCH);

            // State 2: After storing pitch, should be in QUESTION_ANSWER
            manager.storePitch(pitch);
            const afterPitch = manager.getCurrentSession();
            expect(afterPitch?.currentState).toBe(SessionState.QUESTION_ANSWER);

            // State 3: Should remain in QUESTION_ANSWER during exchanges
            exchanges.forEach(ex => {
              manager.addExchange(ex.question, ex.answer, ex.assessment);
              const current = manager.getCurrentSession();
              expect(current?.currentState).toBe(SessionState.QUESTION_ANSWER);
            });

            // State 4: After ending session, should be in SESSION_END
            manager.endSession();
            const ended = manager.getCurrentSession();
            expect(ended?.currentState).toBe(SessionState.SESSION_END);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: interview-prep-app, Property 16: State transitions preserve context
     * Validates: Requirements 8.2, 8.3
     */
    test('Property 16: For any transition between stages, all previously collected data should remain accessible', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
          fc.array(
            fc.record({
              question: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              answer: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
              assessment: fc.record({
                score: fc.integer({ min: 0, max: 100 }),
                strengths: fc.array(fc.string({ minLength: 1, maxLength: 50 })),
                improvements: fc.array(fc.string({ minLength: 1, maxLength: 50 })),
                detailedFeedback: fc.string({ maxLength: 200 }),
              }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (category, pitch, exchanges) => {
            const manager = new SessionManager();

            // Initialize and verify category is preserved
            manager.initializeSession(category);
            let session = manager.getCurrentSession();
            expect(session?.category).toBe(category.trim());

            // Store pitch and verify both category and pitch are preserved
            manager.storePitch(pitch);
            session = manager.getCurrentSession();
            expect(session?.category).toBe(category.trim());
            expect(session?.introductoryPitch).toBe(pitch.trim());

            // Add exchanges and verify all data is preserved
            exchanges.forEach((ex, index) => {
              manager.addExchange(ex.question, ex.answer, ex.assessment);
              session = manager.getCurrentSession();
              
              expect(session?.category).toBe(category.trim());
              expect(session?.introductoryPitch).toBe(pitch.trim());
              expect(session?.exchanges).toHaveLength(index + 1);
            });

            // End session and verify all data is still accessible
            const summary = manager.endSession();
            expect(summary.category).toBe(category.trim());
            expect(summary.exchanges).toHaveLength(exchanges.length);
            
            session = manager.getCurrentSession();
            expect(session?.category).toBe(category.trim());
            expect(session?.introductoryPitch).toBe(pitch.trim());
            expect(session?.exchanges).toHaveLength(exchanges.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    test('should initialize session with valid category', () => {
      const session = sessionManager.initializeSession('Software Engineering');
      
      expect(session.category).toBe('Software Engineering');
      expect(session.id).toBeDefined();
      expect(session.startTime).toBeInstanceOf(Date);
      expect(session.exchanges).toEqual([]);
      expect(session.currentState).toBe(SessionState.INTRODUCTORY_PITCH);
    });

    test('should throw error when initializing with empty category', () => {
      expect(() => sessionManager.initializeSession('')).toThrow('Category cannot be empty');
      expect(() => sessionManager.initializeSession('   ')).toThrow('Category cannot be empty');
    });

    test('should store pitch and transition to QUESTION_ANSWER state', () => {
      sessionManager.initializeSession('Marketing');
      sessionManager.storePitch('I am a marketing professional with 5 years of experience');
      
      const session = sessionManager.getCurrentSession();
      expect(session?.introductoryPitch).toBe('I am a marketing professional with 5 years of experience');
      expect(session?.currentState).toBe(SessionState.QUESTION_ANSWER);
    });

    test('should throw error when storing pitch without session', () => {
      expect(() => sessionManager.storePitch('Test pitch')).toThrow('No active session');
    });

    test('should throw error when storing empty pitch', () => {
      sessionManager.initializeSession('Finance');
      expect(() => sessionManager.storePitch('')).toThrow('Pitch cannot be empty');
    });

    test('should add exchange with assessment', () => {
      sessionManager.initializeSession('Data Science');
      sessionManager.storePitch('I am a data scientist');
      
      const assessment: Assessment = {
        score: 85,
        strengths: ['Clear explanation', 'Good examples'],
        improvements: ['Add more technical details'],
        detailedFeedback: 'Good answer overall',
      };

      sessionManager.addExchange(
        'What is your experience with machine learning?',
        'I have worked with various ML algorithms',
        assessment
      );

      const session = sessionManager.getCurrentSession();
      expect(session?.exchanges).toHaveLength(1);
      expect(session?.exchanges[0].question).toBe('What is your experience with machine learning?');
      expect(session?.exchanges[0].answer).toBe('I have worked with various ML algorithms');
      expect(session?.exchanges[0].assessment).toEqual(assessment);
    });

    test('should build context from session history', () => {
      sessionManager.initializeSession('Product Management');
      sessionManager.storePitch('I am a product manager');

      const assessment: Assessment = {
        score: 80,
        strengths: ['Good structure'],
        improvements: ['More details'],
        detailedFeedback: 'Solid answer',
      };

      sessionManager.addExchange('Tell me about your product strategy', 'I focus on user needs', assessment);
      sessionManager.addExchange('How do you prioritize features?', 'I use data-driven approach', assessment);

      const context = sessionManager.getContext();
      
      expect(context.category).toBe('Product Management');
      expect(context.introductoryPitch).toBe('I am a product manager');
      expect(context.previousExchanges).toHaveLength(2);
      expect(context.extractedTopics.length).toBeGreaterThan(0);
    });

    test('should end session and generate summary', () => {
      sessionManager.initializeSession('Sales');
      sessionManager.storePitch('I am a sales professional');

      const assessment1: Assessment = {
        score: 75,
        strengths: ['Confident'],
        improvements: ['More examples'],
        detailedFeedback: 'Good start',
      };

      const assessment2: Assessment = {
        score: 85,
        strengths: ['Detailed', 'Confident'],
        improvements: ['Better structure'],
        detailedFeedback: 'Excellent',
      };

      sessionManager.addExchange('What is your sales approach?', 'I focus on relationships', assessment1);
      sessionManager.addExchange('How do you handle objections?', 'I listen and address concerns', assessment2);

      const summary = sessionManager.endSession();

      expect(summary.category).toBe('Sales');
      expect(summary.totalQuestions).toBe(2);
      expect(summary.averageScore).toBe(80);
      expect(summary.exchanges).toHaveLength(2);
      expect(summary.overallStrengths).toContain('Confident');
      expect(summary.overallStrengths).toContain('Detailed');
    });

    test('should validate state transitions', () => {
      sessionManager.initializeSession('Design');
      
      // Cannot add exchange before storing pitch
      const assessment: Assessment = {
        score: 80,
        strengths: [],
        improvements: [],
        detailedFeedback: '',
      };
      
      expect(() => sessionManager.addExchange('Question?', 'Answer', assessment))
        .toThrow('Cannot add exchange in state: INTRODUCTORY_PITCH');
    });
  });
});
