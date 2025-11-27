export class SpeechService {
  isSupported(): boolean {
    return true;
  }

  startRecording(): void {
    // Mock implementation
  }

  async stopRecording(): Promise<string> {
    return 'Test transcription';
  }

  getIsRecording(): boolean {
    return false;
  }

  cleanup(): void {
    // Mock implementation
  }
}
