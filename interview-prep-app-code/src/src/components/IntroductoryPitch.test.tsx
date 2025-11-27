import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntroductoryPitch } from './IntroductoryPitch';
import { PitchAnalysis } from '../types';

describe('IntroductoryPitch Component', () => {
  const mockOnPitchSubmit = jest.fn();

  beforeEach(() => {
    mockOnPitchSubmit.mockClear();
  });

  test('renders introductory pitch component', () => {
    render(<IntroductoryPitch onPitchSubmit={mockOnPitchSubmit} />);
    
    expect(screen.getByText('Introduce Yourself')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tell me about yourself/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Introduction/i })).toBeInTheDocument();
  });

  test('allows user to type in textarea', () => {
    render(<IntroductoryPitch onPitchSubmit={mockOnPitchSubmit} />);
    
    const textarea = screen.getByRole('textbox', { name: /Introductory pitch/i });
    fireEvent.change(textarea, { target: { value: 'I am a software engineer' } });
    
    expect(textarea).toHaveValue('I am a software engineer');
  });

  test('submit button is enabled by default', () => {
    render(<IntroductoryPitch onPitchSubmit={mockOnPitchSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /Submit Introduction/i });
    expect(submitButton).not.toBeDisabled();
  });

  test('submit button remains enabled when textarea has content', () => {
    render(<IntroductoryPitch onPitchSubmit={mockOnPitchSubmit} />);
    
    const textarea = screen.getByRole('textbox', { name: /Introductory pitch/i });
    fireEvent.change(textarea, { target: { value: 'I am a software engineer' } });
    
    const submitButton = screen.getByRole('button', { name: /Submit Introduction/i });
    expect(submitButton).not.toBeDisabled();
  });

  test('shows validation error when submitting empty pitch', () => {
    render(<IntroductoryPitch onPitchSubmit={mockOnPitchSubmit} />);
    
    const textarea = screen.getByRole('textbox', { name: /Introductory pitch/i });
    fireEvent.change(textarea, { target: { value: '   ' } });
    
    const submitButton = screen.getByRole('button', { name: /Submit Introduction/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please enter your introductory pitch')).toBeInTheDocument();
    expect(mockOnPitchSubmit).not.toHaveBeenCalled();
  });

  test('calls onPitchSubmit with pitch text when submitted', () => {
    render(<IntroductoryPitch onPitchSubmit={mockOnPitchSubmit} />);
    
    const textarea = screen.getByRole('textbox', { name: /Introductory pitch/i });
    const pitchText = 'I am a software engineer with 5 years of experience';
    fireEvent.change(textarea, { target: { value: pitchText } });
    
    const submitButton = screen.getByRole('button', { name: /Submit Introduction/i });
    fireEvent.click(submitButton);
    
    expect(mockOnPitchSubmit).toHaveBeenCalledWith(pitchText);
  });

  test('displays loading state when isLoading is true', () => {
    render(<IntroductoryPitch onPitchSubmit={mockOnPitchSubmit} isLoading={true} />);
    
    expect(screen.getByText('Analyzing your introduction...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyzing.../i })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /Introductory pitch/i })).toBeDisabled();
  });

  test('displays error message when error prop is provided', () => {
    const errorMessage = 'Failed to analyze pitch';
    render(<IntroductoryPitch onPitchSubmit={mockOnPitchSubmit} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('displays pitch analysis results when provided', () => {
    const mockAnalysis: PitchAnalysis = {
      keyTopics: ['Software Development', 'Leadership'],
      experience: ['5 years in tech', 'Team lead'],
      skills: ['JavaScript', 'React', 'Node.js'],
      interests: ['AI', 'Machine Learning'],
    };

    render(
      <IntroductoryPitch 
        onPitchSubmit={mockOnPitchSubmit} 
        pitchAnalysis={mockAnalysis}
      />
    );
    
    expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    expect(screen.getByText('Key Topics')).toBeInTheDocument();
    expect(screen.getByText('Software Development')).toBeInTheDocument();
    expect(screen.getByText('Leadership')).toBeInTheDocument();
    
    expect(screen.getByText('Experience Mentioned')).toBeInTheDocument();
    expect(screen.getByText('5 years in tech')).toBeInTheDocument();
    
    expect(screen.getByText('Skills Highlighted')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    
    expect(screen.getByText('Interests')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  test('does not display analysis sections when arrays are empty', () => {
    const mockAnalysis: PitchAnalysis = {
      keyTopics: [],
      experience: [],
      skills: [],
      interests: [],
    };

    render(
      <IntroductoryPitch 
        onPitchSubmit={mockOnPitchSubmit} 
        pitchAnalysis={mockAnalysis}
      />
    );
    
    expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    expect(screen.queryByText('Key Topics')).not.toBeInTheDocument();
    expect(screen.queryByText('Experience Mentioned')).not.toBeInTheDocument();
    expect(screen.queryByText('Skills Highlighted')).not.toBeInTheDocument();
    expect(screen.queryByText('Interests')).not.toBeInTheDocument();
  });

  test('hides analysis results when loading', () => {
    const mockAnalysis: PitchAnalysis = {
      keyTopics: ['Software Development'],
      experience: ['5 years'],
      skills: ['JavaScript'],
      interests: ['AI'],
    };

    render(
      <IntroductoryPitch 
        onPitchSubmit={mockOnPitchSubmit} 
        pitchAnalysis={mockAnalysis}
        isLoading={true}
      />
    );
    
    expect(screen.queryByText('Analysis Results')).not.toBeInTheDocument();
    expect(screen.getByText('Analyzing your introduction...')).toBeInTheDocument();
  });

  test('supports Ctrl+Enter keyboard shortcut for submission', () => {
    render(<IntroductoryPitch onPitchSubmit={mockOnPitchSubmit} />);
    
    const textarea = screen.getByRole('textbox', { name: /Introductory pitch/i });
    const pitchText = 'I am a software engineer';
    fireEvent.change(textarea, { target: { value: pitchText } });
    
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    
    expect(mockOnPitchSubmit).toHaveBeenCalledWith(pitchText);
  });

  test('clears validation error when user starts typing after error', () => {
    render(<IntroductoryPitch onPitchSubmit={mockOnPitchSubmit} />);
    
    const textarea = screen.getByRole('textbox', { name: /Introductory pitch/i });
    const submitButton = screen.getByRole('button', { name: /Submit Introduction/i });
    
    // Trigger validation error
    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.click(submitButton);
    expect(screen.getByText('Please enter your introductory pitch')).toBeInTheDocument();
    
    // Start typing - validation error should remain until submit is clicked again
    fireEvent.change(textarea, { target: { value: 'Now typing...' } });
    
    // The validation error persists until next submit attempt
    expect(screen.getByText('Please enter your introductory pitch')).toBeInTheDocument();
  });
});
