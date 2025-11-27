import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionSummary } from './SessionSummary';
import { SessionSummary as SessionSummaryType, Assessment } from '../types';

describe('SessionSummary', () => {
  const mockAssessment: Assessment = {
    score: 8,
    strengths: ['Clear communication', 'Good examples'],
    improvements: ['Add more details', 'Structure better'],
    detailedFeedback: 'Overall good response with room for improvement.',
  };

  const mockSummary: SessionSummaryType = {
    sessionId: 'test-session-123',
    category: 'Software Engineering',
    totalQuestions: 3,
    averageScore: 7.5,
    overallStrengths: ['Clear communication', 'Good examples', 'Technical knowledge'],
    overallImprovements: ['Add more details', 'Structure better', 'Time management'],
    exchanges: [
      {
        question: 'Tell me about yourself?',
        answer: 'I am a software engineer with 5 years of experience.',
        assessment: { ...mockAssessment, score: 7 },
        timestamp: new Date('2024-01-01T10:00:00'),
      },
      {
        question: 'What is your biggest strength?',
        answer: 'My biggest strength is problem-solving.',
        assessment: { ...mockAssessment, score: 8 },
        timestamp: new Date('2024-01-01T10:05:00'),
      },
      {
        question: 'Describe a challenging project.',
        answer: 'I worked on a distributed system that required careful design.',
        assessment: { ...mockAssessment, score: 8 },
        timestamp: new Date('2024-01-01T10:10:00'),
      },
    ],
    duration: 600000, // 10 minutes
  };

  const mockOnStartNewSession = jest.fn();

  beforeEach(() => {
    mockOnStartNewSession.mockClear();
  });

  it('renders session summary with statistics', () => {
    render(<SessionSummary summary={mockSummary} onStartNewSession={mockOnStartNewSession} />);

    expect(screen.getByText('Interview Session Complete!')).toBeInTheDocument();
    expect(screen.getByText(/Category: Software Engineering/)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Total questions
    expect(screen.getByText('7.5/10')).toBeInTheDocument(); // Average score
  });

  it('displays overall strengths', () => {
    render(<SessionSummary summary={mockSummary} onStartNewSession={mockOnStartNewSession} />);

    expect(screen.getByText('Overall Strengths')).toBeInTheDocument();
    
    const strengthsSection = screen.getByText('Overall Strengths').closest('.summary-section');
    expect(strengthsSection).toHaveTextContent('Clear communication');
    expect(strengthsSection).toHaveTextContent('Good examples');
    expect(strengthsSection).toHaveTextContent('Technical knowledge');
  });

  it('displays overall improvements', () => {
    render(<SessionSummary summary={mockSummary} onStartNewSession={mockOnStartNewSession} />);

    expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
    
    const improvementsSection = screen.getByText('Areas for Improvement').closest('.summary-section');
    expect(improvementsSection).toHaveTextContent('Add more details');
    expect(improvementsSection).toHaveTextContent('Structure better');
    expect(improvementsSection).toHaveTextContent('Time management');
  });

  it('displays all question-answer exchanges', () => {
    render(<SessionSummary summary={mockSummary} onStartNewSession={mockOnStartNewSession} />);

    expect(screen.getByText('Question & Answer History')).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByText('Question 3')).toBeInTheDocument();

    expect(screen.getByText(/Tell me about yourself/)).toBeInTheDocument();
    expect(screen.getByText(/What is your biggest strength/)).toBeInTheDocument();
    expect(screen.getByText(/Describe a challenging project/)).toBeInTheDocument();
  });

  it('displays assessments for each exchange', () => {
    render(<SessionSummary summary={mockSummary} onStartNewSession={mockOnStartNewSession} />);

    const feedbackTexts = screen.getAllByText('Overall good response with room for improvement.');
    expect(feedbackTexts.length).toBe(3);
  });

  it('calls onStartNewSession when button is clicked', () => {
    render(<SessionSummary summary={mockSummary} onStartNewSession={mockOnStartNewSession} />);

    const button = screen.getByText('Start New Session');
    fireEvent.click(button);

    expect(mockOnStartNewSession).toHaveBeenCalledTimes(1);
  });

  it('formats duration correctly', () => {
    render(<SessionSummary summary={mockSummary} onStartNewSession={mockOnStartNewSession} />);

    expect(screen.getByText('10m 0s')).toBeInTheDocument();
  });

  it('shows improving trend when scores increase', () => {
    const improvingSummary: SessionSummaryType = {
      ...mockSummary,
      exchanges: [
        {
          ...mockSummary.exchanges[0],
          assessment: { ...mockAssessment, score: 5 },
        },
        {
          ...mockSummary.exchanges[1],
          assessment: { ...mockAssessment, score: 8 },
        },
      ],
    };

    render(<SessionSummary summary={improvingSummary} onStartNewSession={mockOnStartNewSession} />);

    expect(screen.getByText('Improving')).toBeInTheDocument();
  });

  it('shows declining trend when scores decrease', () => {
    const decliningSummary: SessionSummaryType = {
      ...mockSummary,
      exchanges: [
        {
          ...mockSummary.exchanges[0],
          assessment: { ...mockAssessment, score: 8 },
        },
        {
          ...mockSummary.exchanges[1],
          assessment: { ...mockAssessment, score: 5 },
        },
      ],
    };

    render(<SessionSummary summary={decliningSummary} onStartNewSession={mockOnStartNewSession} />);

    expect(screen.getByText('Declining')).toBeInTheDocument();
  });

  it('shows stable trend when scores remain similar', () => {
    const stableSummary: SessionSummaryType = {
      ...mockSummary,
      exchanges: [
        {
          ...mockSummary.exchanges[0],
          assessment: { ...mockAssessment, score: 7 },
        },
        {
          ...mockSummary.exchanges[1],
          assessment: { ...mockAssessment, score: 7.2 },
        },
      ],
    };

    render(<SessionSummary summary={stableSummary} onStartNewSession={mockOnStartNewSession} />);

    expect(screen.getByText('Stable')).toBeInTheDocument();
  });

  it('handles empty strengths gracefully', () => {
    const summaryWithoutStrengths: SessionSummaryType = {
      ...mockSummary,
      overallStrengths: [],
    };

    render(<SessionSummary summary={summaryWithoutStrengths} onStartNewSession={mockOnStartNewSession} />);

    expect(screen.queryByText('🎯 Overall Strengths')).not.toBeInTheDocument();
  });

  it('handles empty improvements gracefully', () => {
    const summaryWithoutImprovements: SessionSummaryType = {
      ...mockSummary,
      overallImprovements: [],
    };

    render(<SessionSummary summary={summaryWithoutImprovements} onStartNewSession={mockOnStartNewSession} />);

    expect(screen.queryByText('💡 Areas for Improvement')).not.toBeInTheDocument();
  });

  it('applies correct score class for excellent scores', () => {
    const excellentSummary: SessionSummaryType = {
      ...mockSummary,
      averageScore: 9.0,
    };

    const { container } = render(
      <SessionSummary summary={excellentSummary} onStartNewSession={mockOnStartNewSession} />
    );

    const scoreElement = container.querySelector('.score-excellent');
    expect(scoreElement).toBeInTheDocument();
  });

  it('applies correct score class for fair scores', () => {
    const fairSummary: SessionSummaryType = {
      ...mockSummary,
      averageScore: 5.0,
    };

    const { container } = render(
      <SessionSummary summary={fairSummary} onStartNewSession={mockOnStartNewSession} />
    );

    const scoreElement = container.querySelector('.score-fair');
    expect(scoreElement).toBeInTheDocument();
  });
});
