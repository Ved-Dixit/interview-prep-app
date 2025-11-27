import React from 'react';
import { Assessment } from '../types';
import './AssessmentFeedback.css';

interface AssessmentFeedbackProps {
  assessment: Assessment;
  isLoading?: boolean;
}

export const AssessmentFeedback: React.FC<AssessmentFeedbackProps> = ({
  assessment,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="assessment-feedback loading">
        <div className="loading-spinner" />
        <p>Evaluating your response...</p>
      </div>
    );
  }

  // Determine quality indicator based on score
  const getQualityClass = (score: number): string => {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'fair';
    return 'needs-improvement';
  };

  const qualityClass = getQualityClass(assessment.score);

  return (
    <div className={`assessment-feedback ${qualityClass}`} role="region" aria-label="Assessment feedback">
      <div className="assessment-header">
        <h3>Assessment</h3>
        <div className={`score-badge ${qualityClass}`} role="status" aria-label={`Score: ${assessment.score} out of 10`}>
          <span className="score-value">{assessment.score}</span>
          <span className="score-max">/10</span>
        </div>
      </div>

      <div className="assessment-content">
        {assessment.detailedFeedback && (
          <div className="feedback-section detailed-feedback" role="article">
            <p>{assessment.detailedFeedback}</p>
          </div>
        )}

        {assessment.strengths.length > 0 && (
          <div className="feedback-section strengths" role="complementary" aria-label="Strengths">
            <h4>Strengths</h4>
            <ul>
              {assessment.strengths.map((strength, index) => (
                <li key={index} className="strength-item">
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {assessment.improvements.length > 0 && (
          <div className="feedback-section improvements" role="complementary" aria-label="Areas for improvement">
            <h4>Areas for Improvement</h4>
            <ul>
              {assessment.improvements.map((improvement, index) => (
                <li key={index} className="improvement-item">
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
