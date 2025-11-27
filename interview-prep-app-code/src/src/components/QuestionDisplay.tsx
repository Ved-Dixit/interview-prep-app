import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import './QuestionDisplay.css';

interface QuestionDisplayProps {
  question: string;
  questionNumber: number;
  category: string;
  isLoading?: boolean;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionNumber,
  category,
  isLoading = false,
}) => {
  return (
    <div className="question-display" role="region" aria-label="Interview question">
      {isLoading ? (
        <LoadingSpinner message="Generating your next question..." size="medium" />
      ) : (
        <>
          <div className="question-header">
            <span className="question-number" aria-label={`Question number ${questionNumber}`}>
              Question {questionNumber}
            </span>
            <span className="question-category" aria-label={`Category: ${category}`}>
              {category}
            </span>
          </div>
          
          <div className="question-content" role="article">
            <p>{question}</p>
          </div>
        </>
      )}
    </div>
  );
};
