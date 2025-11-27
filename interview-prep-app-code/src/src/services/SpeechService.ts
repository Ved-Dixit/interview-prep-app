import { SpeechRecognitionError } from '../types';

// Extend Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private isRecording: boolean = false;
  private transcriptBuffer: string = '';
  private resolveTranscript: ((transcript: string) => void) | null = null;
  private rejectTranscript: ((error: Error) => void) | null = null;

  /**
   * Check if speech recognition is supported in the current browser
   */
  isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Initialize the speech recognition instance
   */
  private initializeRecognition(): void {
    if (!this.isSupported()) {
      throw new SpeechRecognitionError(
        'Speech recognition is not supported in this browser',
        'NOT_SUPPORTED'
      );
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionAPI();
    
    // Configure recognition settings
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Set up event handlers
    this.recognition.onresult = this.handleResult.bind(this);
    this.recognition.onerror = this.handleError.bind(this);
    this.recognition.onend = this.handleEnd.bind(this);
  }

  /**
   * Start recording audio and transcribing speech
   */
  startRecording(): void {
    if (this.isRecording) {
      throw new SpeechRecognitionError(
        'Recording is already in progress',
        'ALREADY_RECORDING'
      );
    }

    if (!this.isSupported()) {
      throw new SpeechRecognitionError(
        'Speech recognition is not supported in this browser',
        'NOT_SUPPORTED'
      );
    }

    try {
      this.initializeRecognition();
      this.transcriptBuffer = '';
      this.isRecording = true;
      this.recognition!.start();
    } catch (error) {
      this.isRecording = false;
      if (error instanceof Error) {
        throw new SpeechRecognitionError(
          `Failed to start recording: ${error.message}`,
          'START_FAILED'
        );
      }
      throw error;
    }
  }

  /**
   * Stop recording and return the transcribed text
   */
  stopRecording(): Promise<string> {
    if (!this.isRecording) {
      throw new SpeechRecognitionError(
        'No recording in progress',
        'NOT_RECORDING'
      );
    }

    return new Promise((resolve, reject) => {
      this.resolveTranscript = resolve;
      this.rejectTranscript = reject;

      try {
        this.recognition!.stop();
      } catch (error) {
        this.isRecording = false;
        if (error instanceof Error) {
          reject(new SpeechRecognitionError(
            `Failed to stop recording: ${error.message}`,
            'STOP_FAILED'
          ));
        } else {
          reject(error);
        }
      }
    });
  }

  /**
   * Get current recording status
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Handle speech recognition results
   */
  private handleResult(event: SpeechRecognitionEvent): void {
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript + ' ';
      }
    }

    if (finalTranscript) {
      this.transcriptBuffer += finalTranscript;
    }
  }

  /**
   * Handle speech recognition errors
   */
  private handleError(event: SpeechRecognitionErrorEvent): void {
    this.isRecording = false;

    let errorMessage = 'Speech recognition error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech was detected';
        errorCode = 'NO_SPEECH';
        break;
      case 'audio-capture':
        errorMessage = 'No microphone was found or microphone access was denied';
        errorCode = 'AUDIO_CAPTURE';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone permission was denied';
        errorCode = 'PERMISSION_DENIED';
        break;
      case 'network':
        errorMessage = 'Network error occurred during speech recognition';
        errorCode = 'NETWORK_ERROR';
        break;
      case 'aborted':
        errorMessage = 'Speech recognition was aborted';
        errorCode = 'ABORTED';
        break;
      default:
        errorMessage = `Speech recognition error: ${event.error}`;
        errorCode = event.error.toUpperCase().replace(/-/g, '_');
    }

    const error = new SpeechRecognitionError(errorMessage, errorCode);

    if (this.rejectTranscript) {
      this.rejectTranscript(error);
      this.rejectTranscript = null;
      this.resolveTranscript = null;
    }
  }

  /**
   * Handle speech recognition end event
   */
  private handleEnd(): void {
    this.isRecording = false;

    if (this.resolveTranscript) {
      const transcript = this.transcriptBuffer.trim();
      this.resolveTranscript(transcript);
      this.resolveTranscript = null;
      this.rejectTranscript = null;
    }

    // Clean up
    this.transcriptBuffer = '';
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.recognition) {
      try {
        if (this.isRecording) {
          this.recognition.stop();
        }
        this.recognition = null;
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    this.isRecording = false;
    this.transcriptBuffer = '';
    this.resolveTranscript = null;
    this.rejectTranscript = null;
  }
}
