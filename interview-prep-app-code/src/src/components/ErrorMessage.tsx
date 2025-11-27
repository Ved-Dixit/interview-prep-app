import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

/**
 * ErrorMessage component for displaying user-friendly error messages
 * Can be used inline within other components
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
  type = 'error',
}) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`error-message error-message-${type}`} role="alert">
      <div className="error-message-content">
        <span className="error-message-icon">
          {type === 'error' && '⚠️'}
          {type === 'warning' && '⚡'}
          {type === 'info' && 'ℹ️'}
        </span>
        <span className="error-message-text">{message}</span>
      </div>
      {onDismiss && (
        <button
          className="error-message-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
};
