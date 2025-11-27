import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';
import { HuggingFaceService } from './services/HuggingFaceService';
import { SpeechService } from './services/SpeechService';

// Mock services
jest.mock('./services/HuggingFaceService');
jest.mock('./services/SpeechService');

const MockedHuggingFaceService = HuggingFaceService as jest.MockedClass<typeof HuggingFaceService>;
const MockedSpeechService = SpeechService as jest.MockedClass<typeof SpeechService>;

describe('App Integration Tests - Requirements 8.1, 8.2, 8.3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    MockedHuggingFaceService.prototype.generateQuestion = jest.fn().mockResolvedValue(
      'Tell me about your experience with React?'
    );
    
    MockedHuggingFaceService.prototype.assessResponse = jest.fn().mockResolvedValue({
      score: 8,
      strengths: ['Clear explanation', 'Good examples'],
      improvements: ['Could add more technical details'],
      detailedFeedback: 'Great response with clear structure.',
    });
    
    MockedHuggingFaceService.prototype.analyzeIntroduction = jest.fn().mockResolvedValue({
      keyTopics: ['React', 'JavaScript', 'Frontend'],
      experience: ['5 years'],
      skills: ['React', 'TypeScript'],
      interests: ['Web development'],
    });
    
    MockedSpeechService.prototype.isSupported = jest.fn().mockReturnValue(true);
    MockedSpeechService.prototype.startRecording = jest.fn();
    MockedSpeechService.prototype.stopRecording = jest.fn().mockResolvedValue('Test transcription');
  });

  describe('Complete Interview Flow - Requirement 8.1', () => {
    test('should render category selection on initial load', () => {
      render(<App />);
      expect(screen.getByText(/Choose Your Interview Category/i)).toBeInTheDocument();
      expect(screen.getByText(/Software Engineering/i)).toBeInTheDocument();
    });

    test('should transition from category selection to interview session', async () => {
      render(<App />);

      // Select a category
      const softwareCategory = screen.getByText(/Software Engineering/i);
      fireEvent.click(softwareCategory);
      
      // Click start interview button
      const startButton = screen.getByRole('button', { name: /Start Interview/i });
      fireEvent.click(startButton);

      // Should show introductory pitch screen
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Introduce Yourself/i })).toBeInTheDocument();
      });
    });

    test('should complete pitch and move to questions', async () => {
      render(<App />);

      // Navigate to interview session
      fireEvent.click(screen.getByText(/Software Engineering/i));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));

      // Submit pitch
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Introduce Yourself/i })).toBeInTheDocument();
      });
      
      const pitchInput = screen.getByRole('textbox');
      fireEvent.change(pitchInput, { target: { value: 'I am a software engineer with 5 years of experience.' } });
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

      // Should show question
      await waitFor(() => {
        expect(screen.getByText(/Tell me about your experience with React/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should display session summary after ending session', async () => {
      render(<App />);

      // Navigate through flow
      fireEvent.click(screen.getByText(/Software Engineering/i));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Introduce Yourself/i })).toBeInTheDocument();
      });
      
      const pitchInput = screen.getByRole('textbox');
      fireEvent.change(pitchInput, { target: { value: 'I am a developer.' } });
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/Tell me about your experience with React/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Answer the question
      const responseInput = screen.getByRole('textbox');
      fireEvent.change(responseInput, { target: { value: 'I have 5 years of React experience.' } });
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

      // Wait for assessment
      await waitFor(() => {
        expect(screen.getByText(/Great response with clear structure/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // End session
      const endButton = screen.getByRole('button', { name: /End interview session/i });
      fireEvent.click(endButton);

      // Should show summary
      await waitFor(() => {
        expect(screen.getByText(/Interview Session Complete/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Scenarios and Recovery - Requirement 8.2', () => {
    test('should prevent starting interview without category selection', () => {
      render(<App />);

      // Start button should be disabled when no category is selected
      const startButton = screen.getByRole('button', { name: /Start Interview/i });
      expect(startButton).toBeDisabled();

      // Should stay on category selection
      expect(screen.getByText(/Choose Your Interview Category/i)).toBeInTheDocument();
    });

    test('should handle API errors gracefully without crashing', async () => {
      // Mock API error for question generation
      MockedHuggingFaceService.prototype.generateQuestion = jest.fn()
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValue('Tell me about your experience with React?');

      render(<App />);

      // Navigate to interview session
      fireEvent.click(screen.getByText(/Software Engineering/i));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Introduce Yourself/i })).toBeInTheDocument();
      });
      
      const pitchInput = screen.getByRole('textbox');
      fireEvent.change(pitchInput, { target: { value: 'I am a developer.' } });
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

      // Should not crash - verify the app is still functional
      await waitFor(() => {
        // The question display component should still be rendered
        expect(screen.getByText(/Question/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // App should still be responsive
      expect(screen.getByRole('button', { name: /End interview session/i })).toBeInTheDocument();
    });

    test('should display error message when pitch analysis fails', async () => {
      // Mock pitch analysis error
      MockedHuggingFaceService.prototype.analyzeIntroduction = jest.fn().mockRejectedValue(
        new Error('Analysis failed')
      );

      render(<App />);

      fireEvent.click(screen.getByText(/Software Engineering/i));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Introduce Yourself/i })).toBeInTheDocument();
      });
      
      const pitchInput = screen.getByRole('textbox');
      fireEvent.change(pitchInput, { target: { value: 'I am a developer.' } });
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

      // Should show error message
      await waitFor(() => {
        const errorElements = screen.queryAllByText(/error/i);
        expect(errorElements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  describe('Mode Switching During Active Session - Requirement 8.3', () => {
    test('should allow switching between text and voice input modes', async () => {
      render(<App />);

      // Navigate to question screen
      fireEvent.click(screen.getByText(/Software Engineering/i));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Introduce Yourself/i })).toBeInTheDocument();
      });
      
      const pitchInput = screen.getByRole('textbox');
      fireEvent.change(pitchInput, { target: { value: 'I am a developer.' } });
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/Tell me about your experience with React/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Should have mode switching buttons
      const voiceModeButton = screen.getByRole('button', { name: /Voice/i });
      const textModeButton = screen.getByRole('button', { name: /Text/i });
      
      expect(voiceModeButton).toBeInTheDocument();
      expect(textModeButton).toBeInTheDocument();

      // Switch to voice mode
      fireEvent.click(voiceModeButton);

      // Verify voice controls appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Start Recording/i })).toBeInTheDocument();
      });

      // Switch back to text mode
      fireEvent.click(textModeButton);

      // Verify text input appears
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Session State Transitions - Requirement 8.1, 8.2', () => {
    test('should allow starting new session from summary', async () => {
      render(<App />);

      // Complete a session
      fireEvent.click(screen.getByText(/Software Engineering/i));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Introduce Yourself/i })).toBeInTheDocument();
      });
      
      const pitchInput = screen.getByRole('textbox');
      fireEvent.change(pitchInput, { target: { value: 'I am a developer.' } });
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/Tell me about your experience with React/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Answer question
      const responseInput = screen.getByRole('textbox');
      fireEvent.change(responseInput, { target: { value: 'I have React experience.' } });
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/Great response with clear structure/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // End session
      const endButton = screen.getByRole('button', { name: /End interview session/i });
      fireEvent.click(endButton);

      await waitFor(() => {
        expect(screen.getByText(/Interview Session Complete/i)).toBeInTheDocument();
      });

      // Start new session
      const newSessionButton = screen.getByRole('button', { name: /Start.*new.*session/i });
      fireEvent.click(newSessionButton);

      // Should return to category selection
      expect(screen.getByText(/Choose Your Interview Category/i)).toBeInTheDocument();
    });

    test('should maintain context across question-answer cycles', async () => {
      render(<App />);

      // Navigate through flow
      fireEvent.click(screen.getByText(/Software Engineering/i));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Introduce Yourself/i })).toBeInTheDocument();
      });
      
      const pitchInput = screen.getByRole('textbox');
      fireEvent.change(pitchInput, { target: { value: 'I am a React developer.' } });
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

      // First question
      await waitFor(() => {
        expect(screen.getByText(/Tell me about your experience with React/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const responseInput1 = screen.getByRole('textbox');
      fireEvent.change(responseInput1, { target: { value: 'I have built many React applications.' } });
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

      // Wait for assessment
      await waitFor(() => {
        expect(screen.getByText(/Great response with clear structure/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Second question should be generated with context
      await waitFor(() => {
        expect(MockedHuggingFaceService.prototype.generateQuestion).toHaveBeenCalledTimes(2);
      }, { timeout: 5000 });

      // Verify context includes previous exchanges
      const generateQuestionCalls = (MockedHuggingFaceService.prototype.generateQuestion as jest.Mock).mock.calls;
      if (generateQuestionCalls.length >= 2) {
        const secondCallContext = generateQuestionCalls[1][0];
        expect(secondCallContext.previousExchanges).toHaveLength(1);
      }
    });
  });
});
