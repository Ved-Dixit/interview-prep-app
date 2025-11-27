import React, { useState } from 'react';
import { PitchAnalysis } from '../types';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';
import './IntroductoryPitch.css';

interface IntroductoryPitchProps {
  onPitchSubmit: (pitch: string) => void;
  pitchAnalysis?: PitchAnalysis;
  isLoading?: boolean;
  error?: string;
}

export const IntroductoryPitch: React.FC<IntroductoryPitchProps> = ({
  onPitchSubmit,
  pitchAnalysis,
  isLoading = false,
  error,
}) => {
  const [pitch, setPitch] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  const handleSubmit = () => {
    if (!pitch.trim()) {
      setValidationError('Please enter your introductory pitch');
      return;
    }

    setValidationError('');
    onPitchSubmit(pitch);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="introductory-pitch" role="region" aria-label="Introductory pitch section">
      <div className="introductory-pitch-header">
        <h2>Introduce Yourself</h2>
        <p>Start your interview with a brief introduction about yourself, your background, and your goals.</p>
      </div>

      <div className="pitch-input-section">
        <label htmlFor="pitch-textarea" className="visually-hidden">
          Enter your introductory pitch
        </label>
        <textarea
          id="pitch-textarea"
          className="pitch-textarea"
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell me about yourself... (Press Ctrl+Enter to submit)"
          rows={8}
          disabled={isLoading}
          aria-label="Introductory pitch"
          aria-describedby="pitch-instructions"
        />
        <span id="pitch-instructions" className="visually-hidden">
          Enter your introduction and press Ctrl+Enter to submit, or use the submit button below
        </span>

        {validationError && (
          <ErrorMessage message={validationError} type="warning" onDismiss={() => setValidationError('')} />
        )}

        {error && (
          <ErrorMessage message={error} type="error" />
        )}

        <button
          className="submit-pitch-button"
          onClick={handleSubmit}
          disabled={isLoading}
          aria-label={isLoading ? 'Analyzing your introduction' : 'Submit introduction'}
        >
          {isLoading ? 'Analyzing...' : 'Submit Introduction'}
        </button>
      </div>

      {isLoading && (
        <LoadingSpinner message="Analyzing your introduction..." size="medium" />
      )}

      {pitchAnalysis && !isLoading && (
        <div className="pitch-analysis-results" role="region" aria-label="Pitch analysis results">
          <h3>Analysis Results</h3>
          
          {pitchAnalysis.keyTopics.length > 0 && (
            <div className="analysis-section">
              <h4>Key Topics</h4>
              <ul aria-label="Key topics identified">
                {pitchAnalysis.keyTopics.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>
          )}

          {pitchAnalysis.experience.length > 0 && (
            <div className="analysis-section">
              <h4>Experience Mentioned</h4>
              <ul aria-label="Experience mentioned">
                {pitchAnalysis.experience.map((exp, index) => (
                  <li key={index}>{exp}</li>
                ))}
              </ul>
            </div>
          )}

          {pitchAnalysis.skills.length > 0 && (
            <div className="analysis-section">
              <h4>Skills Highlighted</h4>
              <ul aria-label="Skills highlighted">
                {pitchAnalysis.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {pitchAnalysis.interests.length > 0 && (
            <div className="analysis-section">
              <h4>Interests</h4>
              <ul aria-label="Interests">
                {pitchAnalysis.interests.map((interest, index) => (
                  <li key={index}>{interest}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
