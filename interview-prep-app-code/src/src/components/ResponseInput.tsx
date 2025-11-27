import React, { useState, useEffect } from 'react';
import { SpeechService } from '../services/SpeechService';
import { SpeechRecognitionError } from '../types';
import { ErrorMessage } from './ErrorMessage';
import { generateUserMessage } from '../utils/errorMessages';
import './ResponseInput.css';

export type InputMode = 'text' | 'voice';

interface ResponseInputProps {
  onResponseSubmit: (response: string) => void;
  isLoading?: boolean;
  error?: string;
  disabled?: boolean;
}

export const ResponseInput: React.FC<ResponseInputProps> = ({
  onResponseSubmit,
  isLoading = false,
  error,
  disabled = false,
}) => {
  const [mode, setMode] = useState<InputMode>('text');
  const [textResponse, setTextResponse] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>('');
  const [speechService] = useState(() => new SpeechService());
  const [voiceError, setVoiceError] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);

  useEffect(() => {
    // Check speech recognition support on mount
    setIsSpeechSupported(speechService.isSupported());

    // Cleanup on unmount
    return () => {
      speechService.cleanup();
    };
  }, [speechService]);

  const handleModeSwitch = (newMode: InputMode) => {
    if (newMode === 'voice' && !isSpeechSupported) {
      setVoiceError('Speech recognition is not supported in your browser. Please use text mode.');
      return;
    }

    setMode(newMode);
    setVoiceError('');
    setValidationError('');
  };

  const handleStartRecording = async () => {
    try {
      setVoiceError('');
      setTranscription('');
      speechService.startRecording();
      setIsRecording(true);
    } catch (error) {
      if (error instanceof Error) {
        setVoiceError(generateUserMessage(error));
      } else {
        setVoiceError('Failed to start recording. Please try again.');
      }
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      const transcript = await speechService.stopRecording();
      setIsRecording(false);
      setTranscription(transcript);
      
      if (!transcript.trim()) {
        setVoiceError('No speech detected. Please try again.');
      }
    } catch (error) {
      setIsRecording(false);
      if (error instanceof Error) {
        setVoiceError(generateUserMessage(error));
      } else {
        setVoiceError('Failed to process recording. Please try again.');
      }
    }
  };

  const handleSubmit = () => {
    const response = mode === 'text' ? textResponse : transcription;

    if (!response.trim()) {
      setValidationError('Please provide a response before submitting');
      return;
    }

    setValidationError('');
    onResponseSubmit(response);
    
    // Clear inputs after submission
    setTextResponse('');
    setTranscription('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const currentResponse = mode === 'text' ? textResponse : transcription;
  const isSubmitDisabled = disabled || isLoading || isRecording || !currentResponse.trim();

  return (
    <div className="response-input" role="region" aria-label="Response input section">
      <div className="mode-selector" role="group" aria-label="Input mode selection">
        <button
          className={`mode-button ${mode === 'text' ? 'active' : ''}`}
          onClick={() => handleModeSwitch('text')}
          disabled={disabled || isLoading || isRecording}
          aria-label="Switch to text mode"
          aria-pressed={mode === 'text'}
        >
          Text
        </button>
        <button
          className={`mode-button ${mode === 'voice' ? 'active' : ''}`}
          onClick={() => handleModeSwitch('voice')}
          disabled={disabled || isLoading || isRecording || !isSpeechSupported}
          aria-label="Switch to voice mode"
          aria-pressed={mode === 'voice'}
          title={!isSpeechSupported ? 'Speech recognition not supported' : ''}
        >
          Voice
        </button>
      </div>

      {mode === 'text' && (
        <div className="text-input-section">
          <label htmlFor="response-textarea" className="visually-hidden">
            Enter your text response
          </label>
          <textarea
            id="response-textarea"
            className="response-textarea"
            value={textResponse}
            onChange={(e) => setTextResponse(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response here... (Press Ctrl+Enter to submit)"
            rows={6}
            disabled={disabled || isLoading}
            aria-label="Text response input"
            aria-describedby="response-instructions"
          />
          <span id="response-instructions" className="visually-hidden">
            Type your response and press Ctrl+Enter to submit, or use the submit button below
          </span>
        </div>
      )}

      {mode === 'voice' && (
        <div className="voice-input-section">
          <div className="recording-controls">
            {!isRecording ? (
              <button
                className="record-button"
                onClick={handleStartRecording}
                disabled={disabled || isLoading}
                aria-label="Start recording your voice response"
              >
                <span className="record-icon" aria-hidden="true">🎤</span>
                Start Recording
              </button>
            ) : (
              <button
                className="record-button recording"
                onClick={handleStopRecording}
                aria-label="Stop recording"
              >
                <span className="record-icon recording-pulse" aria-hidden="true">⏺</span>
                Stop Recording
              </button>
            )}
          </div>

          {isRecording && (
            <div className="recording-status" role="status" aria-live="polite">
              <span className="recording-indicator">Recording...</span>
            </div>
          )}

          {transcription && !isRecording && (
            <div className="transcription-display" role="region" aria-label="Voice transcription">
              <h4>Transcription:</h4>
              <p>{transcription}</p>
            </div>
          )}

          {voiceError && (
            <ErrorMessage message={voiceError} type="error" onDismiss={() => setVoiceError('')} />
          )}
        </div>
      )}

      {validationError && (
        <ErrorMessage message={validationError} type="warning" onDismiss={() => setValidationError('')} />
      )}

      {error && (
        <ErrorMessage message={error} type="error" />
      )}

      <button
        className="submit-response-button"
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        aria-label={isLoading ? 'Processing your response' : 'Submit your response'}
      >
        {isLoading ? 'Processing...' : 'Submit Response'}
      </button>
    </div>
  );
};
