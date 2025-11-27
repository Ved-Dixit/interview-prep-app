import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuestionDisplay } from './QuestionDisplay';

describe('QuestionDisplay', () => {
  it('renders question with number and category', () => {
    render(
      <QuestionDisplay
        question="What are your greatest strengths?"
        questionNumber={1}
        category="Software Engineering"
        isLoading={false}
      />
    );

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Software Engineering')).toBeInTheDocument();
    expect(screen.getByText('What are your greatest strengths?')).toBeInTheDocument();
  });

  it('displays loading state when isLoading is true', () => {
    render(
      <QuestionDisplay
        question=""
        questionNumber={1}
        category="Software Engineering"
        isLoading={true}
      />
    );

    expect(screen.getByText('Generating your next question...')).toBeInTheDocument();
    expect(screen.queryByText('Question 1')).not.toBeInTheDocument();
  });

  it('renders different question numbers correctly', () => {
    const { rerender } = render(
      <QuestionDisplay
        question="First question"
        questionNumber={1}
        category="Marketing"
        isLoading={false}
      />
    );

    expect(screen.getByText('Question 1')).toBeInTheDocument();

    rerender(
      <QuestionDisplay
        question="Second question"
        questionNumber={2}
        category="Marketing"
        isLoading={false}
      />
    );

    expect(screen.getByText('Question 2')).toBeInTheDocument();
  });

  it('renders different categories correctly', () => {
    const { rerender } = render(
      <QuestionDisplay
        question="Test question"
        questionNumber={1}
        category="Finance"
        isLoading={false}
      />
    );

    expect(screen.getByText('Finance')).toBeInTheDocument();

    rerender(
      <QuestionDisplay
        question="Test question"
        questionNumber={1}
        category="Healthcare"
        isLoading={false}
      />
    );

    expect(screen.getByText('Healthcare')).toBeInTheDocument();
  });

  it('renders long questions correctly', () => {
    const longQuestion = 'Can you describe a challenging project you worked on, the obstacles you faced, how you overcame them, and what you learned from the experience?';
    
    render(
      <QuestionDisplay
        question={longQuestion}
        questionNumber={3}
        category="Project Management"
        isLoading={false}
      />
    );

    expect(screen.getByText(longQuestion)).toBeInTheDocument();
  });

  it('defaults isLoading to false when not provided', () => {
    render(
      <QuestionDisplay
        question="What motivates you?"
        questionNumber={1}
        category="General"
      />
    );

    expect(screen.getByText('What motivates you?')).toBeInTheDocument();
    expect(screen.queryByText('Generating your next question...')).not.toBeInTheDocument();
  });
});
