import {
  generateUserMessage,
  isRecoverableError,
  getSuggestedAction,
} from './errorMessages';
import {
  HuggingFaceError,
  SpeechRecognitionError,
  SessionStateError,
  ValidationError,
  SessionState,
} from '../types';

describe('errorMessages utility', () => {
  describe('generateUserMessage', () => {
    test('generates message for HuggingFaceError', () => {
      const error = new HuggingFaceError('API failed');
      const message = generateUserMessage(error);
      
      expect(message).toBe('We encountered an issue with the AI service. Please try again.');
    });

    test('generates message for SpeechRecognitionError with NOT_SUPPORTED code', () => {
      const error = new SpeechRecognitionError('Not supported', 'NOT_SUPPORTED');
      const message = generateUserMessage(error);
      
      expect(message).toContain('not supported');
      expect(message).toContain('text input');
    });

    test('generates message for SpeechRecognitionError with PERMISSION_DENIED code', () => {
      const error = new SpeechRecognitionError('Permission denied', 'PERMISSION_DENIED');
      const message = generateUserMessage(error);
      
      expect(message).toContain('permission');
      expect(message).toContain('microphone');
    });

    test('generates message for SpeechRecognitionError with NO_SPEECH code', () => {
      const error = new SpeechRecognitionError('No speech', 'NO_SPEECH');
      const message = generateUserMessage(error);
      
      expect(message).toContain('No speech');
    });

    test('generates message for SessionStateError', () => {
      const error = new SessionStateError('Invalid state', SessionState.QUESTION_ANSWER);
      const message = generateUserMessage(error);
      
      expect(message).toContain('session');
      expect(message).toContain('restart');
    });

    test('generates message for ValidationError with field', () => {
      const error = new ValidationError('Invalid input', 'email');
      const message = generateUserMessage(error);
      
      expect(message).toContain('email');
      expect(message).toContain('Invalid input');
    });

    test('generates message for ValidationError without field', () => {
      const error = new ValidationError('Invalid input');
      const message = generateUserMessage(error);
      
      expect(message).toContain('Invalid input');
    });

    test('generates generic message for unknown error', () => {
      const error = new Error('Unknown error');
      const message = generateUserMessage(error);
      
      expect(message).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('isRecoverableError', () => {
    test('returns true for HuggingFaceError', () => {
      const error = new HuggingFaceError('API failed');
      expect(isRecoverableError(error)).toBe(true);
    });

    test('returns true for SpeechRecognitionError with recoverable code', () => {
      const error = new SpeechRecognitionError('No speech', 'NO_SPEECH');
      expect(isRecoverableError(error)).toBe(true);
    });

    test('returns false for SpeechRecognitionError with NOT_SUPPORTED code', () => {
      const error = new SpeechRecognitionError('Not supported', 'NOT_SUPPORTED');
      expect(isRecoverableError(error)).toBe(false);
    });

    test('returns true for ValidationError', () => {
      const error = new ValidationError('Invalid input');
      expect(isRecoverableError(error)).toBe(true);
    });

    test('returns false for SessionStateError', () => {
      const error = new SessionStateError('Invalid state');
      expect(isRecoverableError(error)).toBe(false);
    });

    test('returns true for unknown error', () => {
      const error = new Error('Unknown');
      expect(isRecoverableError(error)).toBe(true);
    });
  });

  describe('getSuggestedAction', () => {
    test('suggests retry for HuggingFaceError', () => {
      const error = new HuggingFaceError('API failed');
      const action = getSuggestedAction(error);
      
      expect(action).toContain('Try submitting');
    });

    test('suggests text mode for NOT_SUPPORTED speech error', () => {
      const error = new SpeechRecognitionError('Not supported', 'NOT_SUPPORTED');
      const action = getSuggestedAction(error);
      
      expect(action).toContain('text input');
    });

    test('suggests enabling permissions for PERMISSION_DENIED speech error', () => {
      const error = new SpeechRecognitionError('Permission denied', 'PERMISSION_DENIED');
      const action = getSuggestedAction(error);
      
      expect(action).toContain('permissions');
    });

    test('suggests correction for ValidationError', () => {
      const error = new ValidationError('Invalid input');
      const action = getSuggestedAction(error);
      
      expect(action).toContain('Correct');
    });

    test('suggests restart for SessionStateError', () => {
      const error = new SessionStateError('Invalid state');
      const action = getSuggestedAction(error);
      
      expect(action).toContain('Restart');
    });

    test('suggests refresh for unknown error', () => {
      const error = new Error('Unknown');
      const action = getSuggestedAction(error);
      
      expect(action).toContain('Refresh');
    });
  });
});
