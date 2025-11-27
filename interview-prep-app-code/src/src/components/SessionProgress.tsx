import React from 'react';
import { SessionState } from '../types';
import './SessionProgress.css';

interface SessionProgressProps {
  currentState: SessionState;
  questionsCompleted: number;
  onEndSession: () => void;
  onPauseSession?: () => void;
}

export const SessionProgress: React.FC<SessionProgressProps> = ({
  currentState,
  questionsCompleted,
  onEndSession,
  onPauseSession,
}) => {
  const getStageLabel = (state: SessionState): string => {
    switch (state) {
      case SessionState.CATEGORY_SELECTION:
        return 'Category Selection';
      case SessionState.INTRODUCTORY_PITCH:
        return 'Introductory Pitch';
      case SessionState.QUESTION_ANSWER:
        return 'Interview Questions';
      case SessionState.SESSION_END:
        return 'Session Complete';
      default:
        return 'Unknown';
    }
  };

  const getStageNumber = (state: SessionState): number => {
    switch (state) {
      case SessionState.CATEGORY_SELECTION:
        return 1;
      case SessionState.INTRODUCTORY_PITCH:
        return 2;
      case SessionState.QUESTION_ANSWER:
        return 3;
      case SessionState.SESSION_END:
        return 4;
      default:
        return 0;
    }
  };

  const currentStageNumber = getStageNumber(currentState);
  const totalStages = 4;

  return (
    <div className="session-progress" role="region" aria-label="Session progress">
      <div className="progress-header">
        <h3>Session Progress</h3>
      </div>

      <div className="progress-content">
        <div className="stage-indicator" role="status" aria-live="polite">
          <div className="stage-label">Current Stage</div>
          <div className="stage-value" aria-label={`Current stage: ${getStageLabel(currentState)}`}>
            {getStageLabel(currentState)}
          </div>
          <div className="stage-counter" aria-label={`Stage ${currentStageNumber} of ${totalStages}`}>
            Stage {currentStageNumber} of {totalStages}
          </div>
        </div>

        <div className="progress-bar-container" aria-label="Progress bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${(currentStageNumber / totalStages) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentStageNumber}
            aria-valuemin={0}
            aria-valuemax={totalStages}
            aria-label={`Interview progress: stage ${currentStageNumber} of ${totalStages}`}
          />
        </div>

        <div className="questions-counter" role="status">
          <div className="counter-icon" aria-hidden="true">💬</div>
          <div className="counter-content">
            <div className="counter-label">Questions Completed</div>
            <div className="counter-value" aria-label={`${questionsCompleted} questions completed`}>
              {questionsCompleted}
            </div>
          </div>
        </div>
      </div>

      <div className="progress-controls" role="group" aria-label="Session controls">
        {onPauseSession && currentState === SessionState.QUESTION_ANSWER && (
          <button
            className="control-button pause-button"
            onClick={onPauseSession}
            aria-label="Pause interview session"
          >
            <span aria-hidden="true">⏸</span> Pause
          </button>
        )}
        {currentState !== SessionState.SESSION_END && (
          <button
            className="control-button end-button"
            onClick={onEndSession}
            aria-label="End interview session"
          >
            <span aria-hidden="true">⏹</span> End Session
          </button>
        )}
      </div>
    </div>
  );
};
