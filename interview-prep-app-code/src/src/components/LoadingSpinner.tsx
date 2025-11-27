import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

/**
 * LoadingSpinner component for displaying loading states
 * Can be used inline or as a full-screen overlay
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
}) => {
  const content = (
    <div className={`loading-spinner-content loading-spinner-${size}`}>
      <div className="loading-spinner" role="status" aria-live="polite">
        <div className="spinner"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-spinner-overlay">
        {content}
      </div>
    );
  }

  return content;
};
