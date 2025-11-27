import React from 'react';
import { SessionSummary as SessionSummaryType } from '../types';
import './SessionSummary.css';

interface SessionSummaryProps {
  summary: SessionSummaryType;
  onStartNewSession: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  summary,
  onStartNewSession,
}) => {
  const formatDuration = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getScoreClass = (score: number): string => {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'fair';
    return 'needs-improvement';
  };

  const calculateTrend = (): string => {
    if (summary.exchanges.length < 2) return 'neutral';
    
    const firstHalf = summary.exchanges.slice(0, Math.floor(summary.exchanges.length / 2));
    const secondHalf = summary.exchanges.slice(Math.floor(summary.exchanges.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, ex) => sum + ex.assessment.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, ex) => sum + ex.assessment.score, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  };

  const trend = calculateTrend();

  return (
    <div className="session-summary" role="region" aria-label="Interview session summary">
      <div className="summary-header">
        <h2>Interview Session Complete!</h2>
        <p className="session-category">Category: {summary.category}</p>
      </div>

      <div className="summary-statistics" role="group" aria-label="Session statistics">
        <div className="stat-card">
          <div className="stat-icon" aria-hidden="true">📊</div>
          <div className="stat-content">
            <div className="stat-label">Total Questions</div>
            <div className="stat-value" aria-label={`${summary.totalQuestions} questions completed`}>
              {summary.totalQuestions}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" aria-hidden="true">⭐</div>
          <div className="stat-content">
            <div className="stat-label">Average Score</div>
            <div 
              className={`stat-value score-${getScoreClass(summary.averageScore)}`}
              aria-label={`Average score: ${summary.averageScore.toFixed(1)} out of 10`}
            >
              {summary.averageScore.toFixed(1)}/10
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" aria-hidden="true">⏱️</div>
          <div className="stat-content">
            <div className="stat-label">Duration</div>
            <div className="stat-value" aria-label={`Session duration: ${formatDuration(summary.duration)}`}>
              {formatDuration(summary.duration)}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" aria-hidden="true">
            {trend === 'improving' ? '📈' : trend === 'declining' ? '📉' : '➡️'}
          </div>
          <div className="stat-content">
            <div className="stat-label">Trend</div>
            <div className={`stat-value trend-${trend}`} aria-label={`Performance trend: ${trend}`}>
              {trend === 'improving' ? 'Improving' : trend === 'declining' ? 'Declining' : 'Stable'}
            </div>
          </div>
        </div>
      </div>

      {summary.overallStrengths.length > 0 && (
        <div className="summary-section strengths-section" role="complementary" aria-label="Overall strengths">
          <h3><span aria-hidden="true">🎯</span> Overall Strengths</h3>
          <ul className="summary-list">
            {summary.overallStrengths.map((strength, index) => (
              <li key={index} className="strength-item">{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {summary.overallImprovements.length > 0 && (
        <div className="summary-section improvements-section" role="complementary" aria-label="Areas for improvement">
          <h3><span aria-hidden="true">💡</span> Areas for Improvement</h3>
          <ul className="summary-list">
            {summary.overallImprovements.map((improvement, index) => (
              <li key={index} className="improvement-item">{improvement}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="exchanges-section" role="region" aria-label="Question and answer history">
        <h3><span aria-hidden="true">📝</span> Question & Answer History</h3>
        <div className="exchanges-list">
          {summary.exchanges.map((exchange, index) => (
            <article key={index} className="exchange-card" aria-label={`Question ${index + 1} details`}>
              <div className="exchange-header">
                <span className="exchange-number">Question {index + 1}</span>
                <span 
                  className={`exchange-score score-${getScoreClass(exchange.assessment.score)}`}
                  aria-label={`Score: ${exchange.assessment.score} out of 10`}
                >
                  {exchange.assessment.score}/10
                </span>
              </div>
              
              <div className="exchange-content">
                <div className="exchange-question">
                  <strong>Q:</strong> {exchange.question}
                </div>
                <div className="exchange-answer">
                  <strong>A:</strong> {exchange.answer}
                </div>
              </div>

              <div className="exchange-assessment">
                <div className="assessment-feedback-text">
                  {exchange.assessment.detailedFeedback}
                </div>
                
                {exchange.assessment.strengths.length > 0 && (
                  <div className="mini-feedback strengths">
                    <strong>Strengths:</strong>
                    <ul>
                      {exchange.assessment.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {exchange.assessment.improvements.length > 0 && (
                  <div className="mini-feedback improvements">
                    <strong>Improvements:</strong>
                    <ul>
                      {exchange.assessment.improvements.map((improvement, idx) => (
                        <li key={idx}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="summary-actions">
        <button 
          className="new-session-button" 
          onClick={onStartNewSession}
          aria-label="Start a new interview session"
        >
          Start New Session
        </button>
      </div>
    </div>
  );
};
