import React from 'react';
import { render, screen } from '@testing-library/react';
import { AssessmentFeedback } from './AssessmentFeedback';
import { Assessment } from '../types';

describe('AssessmentFeedback Component', () => {
  const mockAssessment: Assessment = {
    score: 7,
    strengths: ['Clear communication', 'Good examples', 'Well structured'],
    improvements: ['Add more technical details', 'Better time management'],
    detailedFeedback: 'Your answer demonstrates good understanding of the topic with clear communication and relevant examples. Consider adding more technical depth and managing your response time better.',
  };

  test('renders assessment feedback component', () => {
    render(<AssessmentFeedback assessment={mockAssessment} />);
    
    expect(screen.getByText('Assessment')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('/10')).toBeInTheDocument();
  });

  test('displays detailed feedback', () => {
    render(<AssessmentFeedback assessment={mockAssessment} />);
    
    expect(screen.getByText(mockAssessment.detailedFeedback)).toBeInTheDocument();
  });

  test('displays all strengths', () => {
    render(<AssessmentFeedback assessment={mockAssessment} />);
    
    expect(screen.getByText('Strengths')).toBeInTheDocument();
    mockAssessment.strengths.forEach(strength => {
      expect(screen.getByText(strength)).toBeInTheDocument();
    });
  });

  test('displays all improvements', () => {
    render(<AssessmentFeedback assessment={mockAssessment} />);
    
    expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
    mockAssessment.improvements.forEach(improvement => {
      expect(screen.getByText(improvement)).toBeInTheDocument();
    });
  });

  test('applies correct quality class for excellent score', () => {
    const excellentAssessment: Assessment = {
      ...mockAssessment,
      score: 9,
    };
    
    const { container } = render(<AssessmentFeedback assessment={excellentAssessment} />);
    const feedbackDiv = container.querySelector('.assessment-feedback');
    
    expect(feedbackDiv).toHaveClass('excellent');
  });

  test('applies correct quality class for good score', () => {
    const goodAssessment: Assessment = {
      ...mockAssessment,
      score: 7,
    };
    
    const { container } = render(<AssessmentFeedback assessment={goodAssessment} />);
    const feedbackDiv = container.querySelector('.assessment-feedback');
    
    expect(feedbackDiv).toHaveClass('good');
  });

  test('applies correct quality class for fair score', () => {
    const fairAssessment: Assessment = {
      ...mockAssessment,
      score: 5,
    };
    
    const { container } = render(<AssessmentFeedback assessment={fairAssessment} />);
    const feedbackDiv = container.querySelector('.assessment-feedback');
    
    expect(feedbackDiv).toHaveClass('fair');
  });

  test('applies correct quality class for needs-improvement score', () => {
    const poorAssessment: Assessment = {
      ...mockAssessment,
      score: 3,
    };
    
    const { container } = render(<AssessmentFeedback assessment={poorAssessment} />);
    const feedbackDiv = container.querySelector('.assessment-feedback');
    
    expect(feedbackDiv).toHaveClass('needs-improvement');
  });

  test('displays loading state when isLoading is true', () => {
    render(<AssessmentFeedback assessment={mockAssessment} isLoading={true} />);
    
    expect(screen.getByText('Evaluating your response...')).toBeInTheDocument();
    expect(screen.queryByText('Assessment')).not.toBeInTheDocument();
  });

  test('does not display strengths section when empty', () => {
    const assessmentWithoutStrengths: Assessment = {
      ...mockAssessment,
      strengths: [],
    };
    
    render(<AssessmentFeedback assessment={assessmentWithoutStrengths} />);
    
    expect(screen.queryByText('Strengths')).not.toBeInTheDocument();
  });

  test('does not display improvements section when empty', () => {
    const assessmentWithoutImprovements: Assessment = {
      ...mockAssessment,
      improvements: [],
    };
    
    render(<AssessmentFeedback assessment={assessmentWithoutImprovements} />);
    
    expect(screen.queryByText('Areas for Improvement')).not.toBeInTheDocument();
  });

  test('does not display detailed feedback section when empty', () => {
    const assessmentWithoutFeedback: Assessment = {
      ...mockAssessment,
      detailedFeedback: '',
    };
    
    render(<AssessmentFeedback assessment={assessmentWithoutFeedback} />);
    
    // Should still show Assessment header and score
    expect(screen.getByText('Assessment')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  test('renders multiple strengths correctly', () => {
    render(<AssessmentFeedback assessment={mockAssessment} />);
    
    const strengthsList = screen.getByText('Strengths').nextElementSibling;
    const strengthItems = strengthsList?.querySelectorAll('li');
    
    expect(strengthItems).toHaveLength(mockAssessment.strengths.length);
  });

  test('renders multiple improvements correctly', () => {
    render(<AssessmentFeedback assessment={mockAssessment} />);
    
    const improvementsList = screen.getByText('Areas for Improvement').nextElementSibling;
    const improvementItems = improvementsList?.querySelectorAll('li');
    
    expect(improvementItems).toHaveLength(mockAssessment.improvements.length);
  });

  test('displays score badge with correct styling', () => {
    const { container } = render(<AssessmentFeedback assessment={mockAssessment} />);
    const scoreBadge = container.querySelector('.score-badge');
    
    expect(scoreBadge).toBeInTheDocument();
    expect(scoreBadge).toHaveClass('good');
  });

  test('handles edge case of score 0', () => {
    const zeroScoreAssessment: Assessment = {
      ...mockAssessment,
      score: 0,
    };
    
    render(<AssessmentFeedback assessment={zeroScoreAssessment} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('handles edge case of score 10', () => {
    const perfectScoreAssessment: Assessment = {
      ...mockAssessment,
      score: 10,
    };
    
    render(<AssessmentFeedback assessment={perfectScoreAssessment} />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
