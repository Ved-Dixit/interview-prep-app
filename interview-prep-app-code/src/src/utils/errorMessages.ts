/**
 * Utility functions for generating user-friendly error messages
 * Validates: Requirements 7.5
 */

import {
  HuggingFaceError,
  SpeechRecognitionError,
  SessionStateError,
  ValidationError,
} from '../types';

/**
 * Generate a user-friendly error message from any error type
 * Ensures all errors produce helpful, actionable messages for users
 */
export const generateUserMessage = (error: Error): string => {
  if (error instanceof HuggingFaceError) {
    return 'We encountered an issue with the AI service. Please try again.';
  }

  if (error instanceof SpeechRecognitionError) {
    return getSpeechRecognitionMessage(error);
  }

  if (error instanceof SessionStateError) {
    return 'Invalid session state. Please restart your interview session.';
  }

  if (error instanceof ValidationError) {
    return getValidationMessage(error);
  }

  // Generic fallback for unknown errors
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Get specific message for speech recognition errors
 */
const getSpeechRecognitionMessage = (error: SpeechRecognitionError): string => {
  switch (error.code) {
    case 'NOT_SUPPORTED':
      return 'Speech recognition is not supported in your browser. Please use text input.';
    
    case 'PERMISSION_DENIED':
      return 'Microphone access was denied. Please enable microphone permissions to use voice input.';
    
    case 'NO_SPEECH':
      return 'No speech was detected. Please try speaking again.';
    
    case 'AUDIO_CAPTURE':
      return 'No microphone was found. Please check your microphone connection and try again.';
    
    case 'NETWORK_ERROR':
      return 'Network error during speech recognition. Please check your connection and try again.';
    
    case 'ABORTED':
      return 'Speech recognition was cancelled. Please try again.';
    
    default:
      return 'Speech recognition failed. Please try again or use text input.';
  }
};

/**
 * Get specific message for validation errors
 */
const getValidationMessage = (error: ValidationError): string => {
  if (error.field) {
    return `Invalid input for ${error.field}. Please check your entry.`;
  }
  return 'Invalid input. Please check your entry.';
};

/**
 * Check if an error is recoverable (user can retry)
 */
export const isRecoverableError = (error: Error): boolean => {
  if (error instanceof HuggingFaceError) {
    return true; // Can retry API calls
  }

  if (error instanceof SpeechRecognitionError) {
    // Some speech errors are recoverable
    return error.code !== 'NOT_SUPPORTED';
  }

  if (error instanceof ValidationError) {
    return true; // User can correct input
  }

  if (error instanceof SessionStateError) {
    return false; // Need to restart session
  }

  return true; // Assume recoverable by default
};

/**
 * Get suggested action for an error
 */
export const getSuggestedAction = (error: Error): string => {
  if (error instanceof HuggingFaceError) {
    return 'Try submitting your response again';
  }

  if (error instanceof SpeechRecognitionError) {
    if (error.code === 'NOT_SUPPORTED') {
      return 'Switch to text input mode';
    }
    if (error.code === 'PERMISSION_DENIED') {
      return 'Enable microphone permissions in your browser settings';
    }
    return 'Try recording again or switch to text input';
  }

  if (error instanceof ValidationError) {
    return 'Correct your input and try again';
  }

  if (error instanceof SessionStateError) {
    return 'Restart your interview session';
  }

  return 'Refresh the page and try again';
};
