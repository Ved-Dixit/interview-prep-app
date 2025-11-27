import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionProgress } from './SessionProgress';
import { SessionState } from '../types';

describe('SessionProgress', () => {
  const mockOnEndSession = jest.fn();
  const mockOnPauseSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Stage Display', () => {
    it('should display correct stage label for CATEGORY_SELECTION', () => {
      render(
        <SessionProgress
          currentState={SessionState.CATEGORY_SELECTION}
          questionsCompleted={0}
          onEndSession={mockOnEndSession}
        />
      );

      expect(screen.getByText('Category Selection')).toBeInTheDocument();
      expect(screen.getByText('Stage 1 of 4')).toBeInTheDocument();
    });

    it('should display correct stage label for INTRODUCTORY_PITCH', () => {
      render(
        <SessionProgress
          currentState={SessionState.INTRODUCTORY_PITCH}
          questionsCompleted={0}
          onEndSession={mockOnEndSession}
        />
      );

      expect(screen.getByText('Introductory Pitch')).toBeInTheDocument();
      expect(screen.getByText('Stage 2 of 4')).toBeInTheDocument();
    });

    it('should display correct stage label for QUESTION_ANSWER', () => {
      render(
        <SessionProgress
          currentState={SessionState.QUESTION_ANSWER}
          questionsCompleted={3}
          onEndSession={mockOnEndSession}
        />
      );

      expect(screen.getByText('Interview Questions')).toBeInTheDocument();
      expect(screen.getByText('Stage 3 of 4')).toBeInTheDocument();
    });

    it('should display correct stage label for SESSION_END', () => {
      render(
        <SessionProgress
          currentState={SessionState.SESSION_END}
          questionsCompleted={5}
          onEndSession={mockOnEndSession}
        />
      );

      expect(screen.getByText('Session Complete')).toBeInTheDocument();
      expect(screen.getByText('Stage 4 of 4')).toBeInTheDocument();
    });
  });

  describe('Questions Counter', () => {
    it('should display zero questions completed initially', () => {
      render(
        <SessionProgress
          currentState={SessionState.INTRODUCTORY_PITCH}
          questionsCompleted={0}
          onEndSession={mockOnEndSession}
        />
      );

      expect(screen.getByText('Questions Completed')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display correct number of questions completed', () => {
      render(
        <SessionProgress
          currentState={SessionState.QUESTION_ANSWER}
          questionsCompleted={7}
          onEndSession={mockOnEndSession}
        />
      );

      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should update questions completed when prop changes', () => {
      const { rerender } = render(
        <SessionProgress
          currentState={SessionState.QUESTION_ANSWER}
          questionsCompleted={3}
          onEndSession={mockOnEndSession}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();

      rerender(
        <SessionProgress
          currentState={SessionState.QUESTION_ANSWER}
          questionsCompleted={5}
          onEndSession={mockOnEndSession}
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should show 25% progress for CATEGORY_SELECTION', () => {
      render(
        <SessionProgress
          currentState={SessionState.CATEGORY_SELECTION}
          questionsCompleted={0}
          onEndSession={mockOnEndSession}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '1');
      expect(progressBar).toHaveAttribute('aria-valuemax', '4');
      expect(progressBar).toHaveStyle({ width: '25%' });
    });

    it('should show 50% progress for INTRODUCTORY_PITCH', () => {
      render(
        <SessionProgress
          currentState={SessionState.INTRODUCTORY_PITCH}
          questionsCompleted={0}
          onEndSession={mockOnEndSession}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '2');
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('should show 75% progress for QUESTION_ANSWER', () => {
      render(
        <SessionProgress
          currentState={SessionState.QUESTION_ANSWER}
          questionsCompleted={3}
          onEndSession={mockOnEndSession}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '3');
      expect(progressBar).toHaveStyle({ width: '75%' });
    });

    it('should show 100% progress for SESSION_END', () => {
      render(
        <SessionProgress
          currentState={SessionState.SESSION_END}
          questionsCompleted={5}
          onEndSession={mockOnEndSession}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '4');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('Control Buttons', () => {
    it('should display end session button', () => {
      render(
        <SessionProgress
          currentState={SessionState.QUESTION_ANSWER}
          questionsCompleted={2}
          onEndSession={mockOnEndSession}
        />
      );

      const endButton = screen.getByLabelText('End interview session');
      expect(endButton).toBeInTheDocument();
      expect(endButton).toHaveTextContent('End Session');
    });

    it('should call onEndSession when end button is clicked', () => {
      render(
        <SessionProgress
          currentState={SessionState.QUESTION_ANSWER}
          questionsCompleted={2}
          onEndSession={mockOnEndSession}
        />
      );

      const endButton = screen.getByLabelText('End interview session');
      fireEvent.click(endButton);

      expect(mockOnEndSession).toHaveBeenCalledTimes(1);
    });

    it('should display pause button when in QUESTION_ANSWER state and onPauseSession is provided', () => {
      render(
        <SessionProgress
          currentState={SessionState.QUESTION_ANSWER}
          questionsCompleted={2}
          onEndSession={mockOnEndSession}
          onPauseSession={mockOnPauseSession}
        />
      );

      const pauseButton = screen.getByLabelText('Pause interview session');
      expect(pauseButton).toBeInTheDocument();
      expect(pauseButton).toHaveTextContent('Pause');
    });

    it('should call onPauseSession when pause button is clicked', () => {
      render(
        <SessionProgress
          currentState={SessionState.QUESTION_ANSWER}
          questionsCompleted={2}
          onEndSession={mockOnEndSession}
          onPauseSession={mockOnPauseSession}
        />
      );

      const pauseButton = screen.getByLabelText('Pause interview session');
      fireEvent.click(pauseButton);

      expect(mockOnPauseSession).toHaveBeenCalledTimes(1);
    });

    it('should not display pause button when not in QUESTION_ANSWER state', () => {
      render(
        <SessionProgress
          currentState={SessionState.INTRODUCTORY_PITCH}
          questionsCompleted={0}
          onEndSession={mockOnEndSession}
          onPauseSession={mockOnPauseSession}
        />
      );

      const pauseButton = screen.queryByLabelText('Pause interview session');
      expect(pauseButton).not.toBeInTheDocument();
    });

    it('should not display pause button when onPauseSession is not provided', () => {
      render(
        <SessionProgress
          currentState={SessionState.QUESTION_ANSWER}
          questionsCompleted={2}
          onEndSession={mockOnEndSession}
        />
      );

      const pauseButton = screen.queryByLabelText('Pause interview session');
      expect(pauseButton).not.toBeInTheDocument();
    });

    it('should not display end button when session is ended', () => {
      render(
        <SessionProgress
          currentState={SessionState.SESSION_END}
          questionsCompleted={5}
          onEndSession={mockOnEndSession}
        />
      );

      const endButton = screen.queryByLabelText('End interview session');
      expect(endButton).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on progress bar', () => {
      render(
        <SessionProgress
          currentState={SessionState.QUESTION_ANSWER}
          questionsCompleted={3}
          onEndSession={mockOnEndSession}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Interview progress: stage 3 of 4');
      expect(progressBar).toHaveAttribute('aria-valuenow', '3');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '4');
    });

    it('should have proper ARIA labels on buttons', () => {
      render(
        <SessionProgress
          currentState={SessionState.QUESTION_ANSWER}
          questionsCompleted={2}
          onEndSession={mockOnEndSession}
          onPauseSession={mockOnPauseSession}
        />
      );

      expect(screen.getByLabelText('Pause interview session')).toBeInTheDocument();
      expect(screen.getByLabelText('End interview session')).toBeInTheDocument();
    });
  });
});
