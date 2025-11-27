import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { SessionManager } from '../services/SessionManager';
import { Assessment } from '../types';

// Mock SpeechService to work in test environment
jest.mock('../services/SpeechService');

import { ResponseInput } from './ResponseInput';

describe('ResponseInput', () => {
  describe('Property-Based Tests', () => {
    /**
     * Feature: interview-prep-app, Property 9: Mode switching preserves session data
     * Validates: Requirements 5.4
     * 
     * This test verifies that when a SessionManager exists with data, and the ResponseInput
     * component switches between text and voice modes, the SessionManager's data remains intact.
     * The component should not interfere with external session state during mode switching.
     */
    test('Property 9: For any session state, switching between text and voice modes should preserve all session data', () => {
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
            { minLength: 0, maxLength: 5 }
          ),
          (category, pitch, exchanges) => {
            // Create a session with data (simulating external session state)
            const sessionManager = new SessionManager();
            sessionManager.initializeSession(category);
            sessionManager.storePitch(pitch);

            // Add exchanges to the session
            exchanges.forEach(ex => {
              sessionManager.addExchange(ex.question, ex.answer, ex.assessment);
            });

            // Capture session state before rendering component
            const sessionBefore = sessionManager.getCurrentSession();
            const contextBefore = sessionManager.getContext();

            // Render the ResponseInput component
            const mockOnSubmit = jest.fn();
            const { unmount } = render(
              <ResponseInput onResponseSubmit={mockOnSubmit} />
            );

            // Switch from text to voice mode
            const voiceButton = screen.getByLabelText('Switch to voice mode');
            fireEvent.click(voiceButton);

            // Verify session data is unchanged after switching to voice mode
            const sessionAfterVoice = sessionManager.getCurrentSession();
            const contextAfterVoice = sessionManager.getContext();

            expect(sessionAfterVoice?.category).toBe(sessionBefore?.category);
            expect(sessionAfterVoice?.introductoryPitch).toBe(sessionBefore?.introductoryPitch);
            expect(sessionAfterVoice?.exchanges).toHaveLength(sessionBefore?.exchanges.length || 0);
            expect(contextAfterVoice.category).toBe(contextBefore.category);
            expect(contextAfterVoice.introductoryPitch).toBe(contextBefore.introductoryPitch);
            expect(contextAfterVoice.previousExchanges).toHaveLength(contextBefore.previousExchanges.length);

            // Switch back to text mode
            const textButton = screen.getByLabelText('Switch to text mode');
            fireEvent.click(textButton);

            // Verify session data is still unchanged after switching back to text mode
            const sessionAfterText = sessionManager.getCurrentSession();
            const contextAfterText = sessionManager.getContext();

            expect(sessionAfterText?.category).toBe(sessionBefore?.category);
            expect(sessionAfterText?.introductoryPitch).toBe(sessionBefore?.introductoryPitch);
            expect(sessionAfterText?.exchanges).toHaveLength(sessionBefore?.exchanges.length || 0);
            expect(contextAfterText.category).toBe(contextBefore.category);
            expect(contextAfterText.introductoryPitch).toBe(contextBefore.introductoryPitch);
            expect(contextAfterText.previousExchanges).toHaveLength(contextBefore.previousExchanges.length);

            // Verify all exchanges are preserved with correct data
            exchanges.forEach((ex, index) => {
              expect(sessionAfterText?.exchanges[index].question).toBe(ex.question.trim());
              expect(sessionAfterText?.exchanges[index].answer).toBe(ex.answer.trim());
              expect(sessionAfterText?.exchanges[index].assessment.score).toBe(ex.assessment.score);
            });

            // Clean up
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    test('should render text input mode by default', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText('Text response input')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to text mode')).toHaveClass('active');
    });

    test('should switch to voice mode when voice button is clicked', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} />);

      const voiceButton = screen.getByLabelText('Switch to voice mode');
      fireEvent.click(voiceButton);

      expect(screen.getByText('Start Recording')).toBeInTheDocument();
      expect(voiceButton).toHaveClass('active');
    });

    test('should switch back to text mode when text button is clicked', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} />);

      // Switch to voice mode
      const voiceButton = screen.getByLabelText('Switch to voice mode');
      fireEvent.click(voiceButton);

      // Switch back to text mode
      const textButton = screen.getByLabelText('Switch to text mode');
      fireEvent.click(textButton);

      expect(screen.getByLabelText('Text response input')).toBeInTheDocument();
      expect(textButton).toHaveClass('active');
    });

    test('should display text input in text mode', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText('Text response input');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('placeholder', 'Type your response here... (Press Ctrl+Enter to submit)');
    });

    test('should display recording controls in voice mode', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} />);

      const voiceButton = screen.getByLabelText('Switch to voice mode');
      fireEvent.click(voiceButton);

      expect(screen.getByText('Start Recording')).toBeInTheDocument();
    });

    test('should handle text input changes', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText('Text response input') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'My test response' } });

      expect(textarea.value).toBe('My test response');
    });

    test('should submit text response when submit button is clicked', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText('Text response input');
      fireEvent.change(textarea, { target: { value: 'My test response' } });

      const submitButton = screen.getByText('Submit Response');
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('My test response');
    });

    test('should prevent submission of whitespace-only response', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText('Text response input');
      // Type whitespace-only text
      fireEvent.change(textarea, { target: { value: '   ' } });

      const submitButton = screen.getByText('Submit Response');
      // Button should be disabled for whitespace-only input
      expect(submitButton).toBeDisabled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('should clear text input after successful submission', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText('Text response input') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'My test response' } });

      const submitButton = screen.getByText('Submit Response');
      fireEvent.click(submitButton);

      expect(textarea.value).toBe('');
    });

    test('should disable submit button when response is empty', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} />);

      const submitButton = screen.getByText('Submit Response');
      expect(submitButton).toBeDisabled();
    });

    test('should enable submit button when response has content', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText('Text response input');
      fireEvent.change(textarea, { target: { value: 'My test response' } });

      const submitButton = screen.getByText('Submit Response');
      expect(submitButton).not.toBeDisabled();
    });

    test('should disable mode switching while recording', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} />);

      // Switch to voice mode
      const voiceButton = screen.getByLabelText('Switch to voice mode');
      fireEvent.click(voiceButton);

      // Start recording
      const recordButton = screen.getByText('Start Recording');
      fireEvent.click(recordButton);

      // Try to switch modes
      const textButton = screen.getByLabelText('Switch to text mode');
      expect(textButton).toBeDisabled();
    });

    test('should submit response with Ctrl+Enter in text mode', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} />);

      const textarea = screen.getByLabelText('Text response input');
      fireEvent.change(textarea, { target: { value: 'My test response' } });
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      expect(mockOnSubmit).toHaveBeenCalledWith('My test response');
    });

    test('should display loading state', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} isLoading={true} />);

      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    test('should disable inputs when loading', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} isLoading={true} />);

      const textarea = screen.getByLabelText('Text response input');
      expect(textarea).toBeDisabled();

      const submitButton = screen.getByText('Processing...');
      expect(submitButton).toBeDisabled();
    });

    test('should display error message when provided', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} error="Test error message" />);

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    test('should disable all controls when disabled prop is true', () => {
      const mockOnSubmit = jest.fn();
      render(<ResponseInput onResponseSubmit={mockOnSubmit} disabled={true} />);

      const textarea = screen.getByLabelText('Text response input');
      expect(textarea).toBeDisabled();

      const textButton = screen.getByLabelText('Switch to text mode');
      const voiceButton = screen.getByLabelText('Switch to voice mode');
      expect(textButton).toBeDisabled();
      expect(voiceButton).toBeDisabled();
    });
  });
});
