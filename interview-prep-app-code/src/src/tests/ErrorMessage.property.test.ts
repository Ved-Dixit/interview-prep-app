/**
 * Property-Based Tests for Error Message Generation
 * Feature: interview-prep-app, Property 14: Errors produce user messages
 * Validates: Requirements 7.5
 */

import * as fc from 'fast-check';
import {
  HuggingFaceError,
  SpeechRecognitionError,
  SessionStateError,
  ValidationError,
  SessionState,
} from '../types';

describe('Property 14: Errors produce user messages', () => {
  /**
   * For any error that occurs during session operations,
   * the system should generate and display a user-friendly error message.
   */

  // Helper function to generate user-friendly error message
  const generateUserMessage = (error: Error): string => {
    if (error instanceof HuggingFaceError) {
      return 'We encountered an issue with the AI service. Please try again.';
    } else if (error instanceof SpeechRecognitionError) {
      if (error.code === 'NOT_SUPPORTED') {
        return 'Speech recognition is not supported in your browser. Please use text input.';
      } else if (error.code === 'PERMISSION_DENIED') {
        return 'Microphone access was denied. Please enable microphone permissions to use voice input.';
      } else if (error.code === 'NO_SPEECH') {
        return 'No speech was detected. Please try speaking again.';
      }
      return 'Speech recognition failed. Please try again or use text input.';
    } else if (error instanceof SessionStateError) {
      return 'Invalid session state. Please restart your interview session.';
    } else if (error instanceof ValidationError) {
      return `Invalid input${error.field ? ` for ${error.field}` : ''}. Please check your entry.`;
    }
    return 'An unexpected error occurred. Please try again.';
  };

  test('HuggingFaceError produces user-friendly message', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 100 }),
        async (errorMessage) => {
          const error = new HuggingFaceError(errorMessage);
          const userMessage = generateUserMessage(error);

          // Verify a message is generated
          expect(userMessage).toBeTruthy();
          expect(typeof userMessage).toBe('string');
          expect(userMessage.length).toBeGreaterThan(0);

          // Verify it's user-friendly (doesn't expose technical details)
          expect(userMessage).not.toContain('undefined');
          expect(userMessage).not.toContain('null');
          
          // Should contain helpful guidance
          expect(userMessage.toLowerCase()).toMatch(/try again|service|issue/);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('SpeechRecognitionError produces appropriate message for each error code', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'NOT_SUPPORTED',
          'PERMISSION_DENIED',
          'NO_SPEECH',
          'AUDIO_CAPTURE',
          'NETWORK_ERROR',
          'ABORTED',
          'UNKNOWN_ERROR'
        ),
        fc.string({ minLength: 5, maxLength: 100 }),
        async (errorCode, errorMessage) => {
          const error = new SpeechRecognitionError(errorMessage, errorCode);
          const userMessage = generateUserMessage(error);

          // Verify a message is generated
          expect(userMessage).toBeTruthy();
          expect(typeof userMessage).toBe('string');
          expect(userMessage.length).toBeGreaterThan(0);

          // Verify message is contextual to the error code
          if (errorCode === 'NOT_SUPPORTED') {
            expect(userMessage.toLowerCase()).toContain('not supported');
          } else if (errorCode === 'PERMISSION_DENIED') {
            expect(userMessage.toLowerCase()).toMatch(/permission|microphone/);
          } else if (errorCode === 'NO_SPEECH') {
            expect(userMessage.toLowerCase()).toContain('no speech');
          }

          // Should provide actionable guidance
          expect(userMessage.toLowerCase()).toMatch(/try|please|use/);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('SessionStateError produces user-friendly message', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          SessionState.CATEGORY_SELECTION,
          SessionState.INTRODUCTORY_PITCH,
          SessionState.QUESTION_ANSWER,
          SessionState.SESSION_END
        ),
        fc.string({ minLength: 5, maxLength: 100 }),
        async (state, errorMessage) => {
          const error = new SessionStateError(errorMessage, state);
          const userMessage = generateUserMessage(error);

          // Verify a message is generated
          expect(userMessage).toBeTruthy();
          expect(typeof userMessage).toBe('string');
          expect(userMessage.length).toBeGreaterThan(0);

          // Should provide guidance about session state
          expect(userMessage.toLowerCase()).toMatch(/session|state|restart/);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('ValidationError produces message with field context when available', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.option(fc.string({ minLength: 3, maxLength: 20 }), { nil: undefined }),
        fc.string({ minLength: 5, maxLength: 100 }),
        async (field, errorMessage) => {
          const error = new ValidationError(errorMessage, field);
          const userMessage = generateUserMessage(error);

          // Verify a message is generated
          expect(userMessage).toBeTruthy();
          expect(typeof userMessage).toBe('string');
          expect(userMessage.length).toBeGreaterThan(0);

          // If field is provided, message should reference it
          if (field) {
            expect(userMessage.toLowerCase()).toContain(field.toLowerCase());
          }

          // Should provide guidance about validation
          expect(userMessage.toLowerCase()).toMatch(/invalid|check|entry/);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('all error types produce non-empty user messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.string({ minLength: 5, maxLength: 50 }).map(msg => new HuggingFaceError(msg)),
          fc.string({ minLength: 5, maxLength: 50 }).map(msg => new SpeechRecognitionError(msg, 'UNKNOWN_ERROR')),
          fc.string({ minLength: 5, maxLength: 50 }).map(msg => new SessionStateError(msg)),
          fc.string({ minLength: 5, maxLength: 50 }).map(msg => new ValidationError(msg)),
          fc.string({ minLength: 5, maxLength: 50 }).map(msg => new Error(msg))
        ),
        async (error: Error) => {
          const userMessage = generateUserMessage(error);

          // Every error should produce a message
          expect(userMessage).toBeTruthy();
          expect(typeof userMessage).toBe('string');
          expect(userMessage.length).toBeGreaterThan(0);

          // Message should be user-friendly
          expect(userMessage).not.toContain('undefined');
          expect(userMessage).not.toContain('null');
          expect(userMessage).not.toMatch(/\[object Object\]/);

          // Should contain helpful words
          expect(userMessage.toLowerCase()).toMatch(/please|try|error|issue|failed/);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('error messages are consistent for same error type', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 5, maxLength: 100 }),
        async (message1, message2) => {
          // Create two errors of the same type with different messages
          const error1 = new HuggingFaceError(message1);
          const error2 = new HuggingFaceError(message2);

          const userMessage1 = generateUserMessage(error1);
          const userMessage2 = generateUserMessage(error2);

          // User messages should be the same for the same error type
          // (we don't expose internal error details to users)
          expect(userMessage1).toBe(userMessage2);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('error message generation never throws', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.anything(),
        async (randomValue) => {
          // Try to generate a message from any value
          let didThrow = false;
          let message = '';

          try {
            // Create an error with random properties
            const error = new Error('Test error');
            (error as any).randomProp = randomValue;
            message = generateUserMessage(error);
          } catch (e) {
            didThrow = true;
          }

          // Should never throw, always produce a message
          expect(didThrow).toBe(false);
          expect(message).toBeTruthy();
          expect(typeof message).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });
});
