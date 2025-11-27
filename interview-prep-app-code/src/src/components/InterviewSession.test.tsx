import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { SessionManager } from '../services/SessionManager';
import { HuggingFaceService } from '../services/HuggingFaceService';
import { Assessment } from '../types';
import { InterviewSession } from './InterviewSession';

/**
 * Feature: interview-prep-app, Property 4: Answer analysis produces topic extraction
 * Validates: Requirements 3.1
 * 
 * For any non-empty answer string, analyzing the response should produce 
 * a non-empty set of extracted topics or key details.
 */
describe('Property 4: Answer analysis produces topic extraction', () => {
  it('should extract topics from any non-empty answer', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0),
        async (answer) => {
          const sessionManager = new SessionManager();
          
          // Initialize session and add a pitch
          sessionManager.initializeSession('Software Engineering');
          sessionManager.storePitch('I am a software engineer with 5 years of experience.');
          
          // Add a dummy exchange to have something to analyze
          const dummyAssessment: Assessment = {
            score: 5,
            strengths: ['Good response'],
            improvements: ['Could be better'],
            detailedFeedback: 'Feedback',
          };
          sessionManager.addExchange('Tell me about yourself?', answer, dummyAssessment);
          
          // Get context which should include extracted topics
          const context = sessionManager.getContext();
          
          // The extracted topics should be non-empty since we provided a non-empty answer
          expect(context.extractedTopics).toBeDefined();
          expect(Array.isArray(context.extractedTopics)).toBe(true);
          expect(context.extractedTopics.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: interview-prep-app, Property 7: Assessment history is maintained
 * Validates: Requirements 4.4
 * 
 * For any session with multiple assessed answers, all assessment results 
 * should be retrievable from the session history in chronological order.
 */
describe('Property 7: Assessment history is maintained', () => {
  it('should maintain all assessments in chronological order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            question: fc.string({ minLength: 10, maxLength: 200 }),
            answer: fc.string({ minLength: 10, maxLength: 500 }),
            score: fc.integer({ min: 0, max: 10 }),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        async (exchanges) => {
          const sessionManager = new SessionManager();
          
          // Initialize session
          sessionManager.initializeSession('Software Engineering');
          sessionManager.storePitch('I am a software engineer.');
          
          // Add all exchanges
          const addedAssessments: Assessment[] = [];
          for (const exchange of exchanges) {
            const assessment: Assessment = {
              score: exchange.score,
              strengths: ['Strength 1', 'Strength 2'],
              improvements: ['Improvement 1'],
              detailedFeedback: 'Detailed feedback',
            };
            
            sessionManager.addExchange(
              exchange.question,
              exchange.answer,
              assessment
            );
            addedAssessments.push(assessment);
          }
          
          // Get the session and verify all assessments are present
          const session = sessionManager.getCurrentSession();
          expect(session).not.toBeNull();
          expect(session!.exchanges.length).toBe(exchanges.length);
          
          // Verify assessments are in chronological order
          for (let i = 0; i < exchanges.length; i++) {
            expect(session!.exchanges[i].assessment).toEqual(addedAssessments[i]);
            expect(session!.exchanges[i].question).toBe(exchanges[i].question.trim());
            expect(session!.exchanges[i].answer).toBe(exchanges[i].answer.trim());
            
            // Verify chronological order by timestamp
            if (i > 0) {
              expect(session!.exchanges[i].timestamp.getTime()).toBeGreaterThanOrEqual(
                session!.exchanges[i - 1].timestamp.getTime()
              );
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Unit tests for InterviewSession component
 */
describe('InterviewSession Component', () => {
  it('should render and initialize session', async () => {
    const mockOnSessionEnd = jest.fn();
    
    render(
      <InterviewSession
        category="Software Engineering"
        onSessionEnd={mockOnSessionEnd}
      />
    );

    // Should show session progress
    await waitFor(() => {
      expect(screen.getByText(/Session Progress/i)).toBeInTheDocument();
    });

    // Should show introductory pitch stage
    await waitFor(() => {
      expect(screen.getByText(/Introduce Yourself/i)).toBeInTheDocument();
    });
  });

  it('should initialize with correct category', async () => {
    const mockOnSessionEnd = jest.fn();
    
    const { container } = render(
      <InterviewSession
        category="Marketing"
        onSessionEnd={mockOnSessionEnd}
      />
    );

    // Session should be initialized (component renders without errors)
    await waitFor(() => {
      expect(container.querySelector('.interview-session')).toBeInTheDocument();
    });
  });
});
