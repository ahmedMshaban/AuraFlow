/**
 * VideoRecorder.ts
 *
 * A service for recording short video segments from a given MediaStream.
 * Used for capturing 3-second clips for stress detection analysis.
 */

import type { RecordingResult, RecordingOptions } from '../types/VideoRecorder.types';

/**
 * Records a short video clip from a given MediaStream
 */
export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private startTime: number = 0;
  private stream: MediaStream | null = null;

  /**
   * Default recording options
   */
  private defaultOptions: RecordingOptions = {
    duration: 3000, // 3 seconds
    mimeType: 'video/webm;codecs=vp9',
  };

  /**
   * Sets up the recorder with a media stream
   * @param stream The MediaStream to record from
   */
  public setup(stream: MediaStream): void {
    this.stream = stream;

    // Find a supported MIME type
    const mimeType = this.getSupportedMimeType();

    try {
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });

      // Configure event handlers
      this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
    } catch (error) {
      console.error('Failed to create MediaRecorder:', error);
      throw error;
    }
  }

  /**
   * Finds a MIME type supported by the browser
   */
  private getSupportedMimeType(): string {
    const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    console.warn('None of the preferred MIME types are supported');
    return '';
  }

  /**
   * Starts recording
   * @param options Recording options
   * @returns Promise that resolves when recording is complete
   */
  public async startRecording(options?: RecordingOptions): Promise<RecordingResult> {
    if (!this.mediaRecorder || !this.stream) {
      throw new Error('Recorder not set up. Call setup() first.');
    }

    // Combine default options with provided options
    const finalOptions = { ...this.defaultOptions, ...options };

    // Reset recorded chunks
    this.recordedChunks = [];

    // Create a promise that will resolve when recording is complete
    return new Promise<RecordingResult>((resolve, reject) => {
      try {
        // Setup stop event to resolve the promise
        this.mediaRecorder!.onstop = () => {
          const duration = Date.now() - this.startTime;
          const blob = new Blob(this.recordedChunks, { type: finalOptions.mimeType });
          const url = URL.createObjectURL(blob);

          resolve({
            blob,
            url,
            duration,
          });
        };

        // Start recording
        this.mediaRecorder!.start();
        this.startTime = Date.now();

        // Set timer to stop recording after specified duration
        setTimeout(() => {
          if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
          }
        }, finalOptions.duration);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handles data available events from the MediaRecorder
   */
  private handleDataAvailable(event: BlobEvent): void {
    if (event.data && event.data.size > 0) {
      this.recordedChunks.push(event.data);
    }
  }

  /**
   * Cleans up resources
   */
  public cleanup(): void {
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      this.mediaRecorder = null;
    }

    this.recordedChunks = [];
    this.stream = null;
  }
}

// Export a singleton instance
export const videoRecorder = new VideoRecorder();
