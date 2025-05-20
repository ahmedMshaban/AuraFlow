/**
 * A custom hook that handles video recording functionality
 */
import { useState, useCallback, useEffect } from 'react';
import { videoRecorder } from '../services/VideoRecorder';
import type { UseVideoRecorderProps, VideoRecorderState } from '../types/VideoRecorder.types';

export const useVideoRecorder = ({
  recordingDuration = 3000,
  onRecordingComplete,
}: UseVideoRecorderProps): VideoRecorderState => {
  // State for recording process
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState<number | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);

  /**
   * Update recording timer during recording
   */
  useEffect(() => {
    let timerId: number;

    if (isRecording && recordingTime !== null) {
      timerId = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timerId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRecording, recordingTime]);
  /**
   * Setup the recorder with a media stream
   */
  const setupRecorder = useCallback((stream: MediaStream) => {
    try {
      // Check if the stream is valid and has video tracks
      if (!stream || stream.getVideoTracks().length === 0) {
        console.error('Invalid media stream: No video tracks found');
        return;
      }

      // Setup the recorder
      videoRecorder.setup(stream);
      console.log('Video recorder setup complete');
      setCameraReady(true);
    } catch (error) {
      console.error('Failed to setup video recorder:', error);
      setCameraReady(false);
    }
  }, []);
  /**
   * Start the recording process with a countdown
   */
  const startRecordingWithCountdown = useCallback(async () => {
    // Prevent recording multiple times
    if (hasRecorded) {
      console.log('Recording already completed. No need to record again.');
      return;
    }

    // Check if camera is ready to record
    if (!cameraReady) {
      console.error('Camera is not ready. Please ensure camera access is granted.');
      return;
    }

    // Start countdown
    setIsProcessing(true);
    setCountdown(3);

    // Create a promise that resolves after the countdown
    await new Promise<void>((resolve) => {
      let seconds = 3;
      const countdownInterval = setInterval(() => {
        seconds -= 1;
        setCountdown(seconds);

        if (seconds <= 0) {
          clearInterval(countdownInterval);
          resolve();
        }
      }, 1000);
    });

    // Set recording state first
    setIsRecording(true);
    setCountdown(null);
    setRecordingTime(Math.floor(recordingDuration / 1000));

    try {
      console.log('Starting recording with duration:', recordingDuration);

      // Make sure we have a short delay before starting recording to ensure states have updated
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await videoRecorder.startRecording({
        duration: recordingDuration,
      });

      console.log('Recording completed successfully');

      // Mark as recorded to prevent further recordings
      setHasRecorded(true);

      // Call the callback if provided
      if (onRecordingComplete) {
        onRecordingComplete(result);
      }
    } catch (error) {
      console.error('Recording failed:', error);
    } finally {
      setIsRecording(false);
      setIsProcessing(false);
      setRecordingTime(null);
    }
  }, [cameraReady, recordingDuration, onRecordingComplete, hasRecorded]);
  /**
   * Reset recording state to allow recording again
   */
  const resetRecording = useCallback(() => {
    setHasRecorded(false);
    setIsRecording(false);
    setIsProcessing(false);
    setCountdown(null);
    setRecordingTime(null);
  }, []);

  return {
    isRecording,
    isProcessing,
    countdown,
    recordingTime,
    cameraReady,
    hasRecorded,
    startRecordingWithCountdown,
    setupRecorder,
    resetRecording,
  };
};
