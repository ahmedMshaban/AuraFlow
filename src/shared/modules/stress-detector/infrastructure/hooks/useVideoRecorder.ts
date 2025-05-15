/**
 * A custom hook that handles video recording functionality
 */
import { useState, useCallback, useEffect } from 'react';
import { videoRecorder } from '../services/VideoRecorder';
import type { UseVideoRecorderProps, VideoRecorderState } from '../types/VideoRecorder.types';

export const useVideoRecorder = ({
  recordingDuration = 5000,
  onRecordingComplete,
}: UseVideoRecorderProps): VideoRecorderState => {
  // State for recording process
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState<number | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

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
    videoRecorder.setup(stream);
    setCameraReady(true);
  }, []);

  /**
   * Start the recording process with a countdown
   */
  const startRecordingWithCountdown = useCallback(async () => {
    if (!cameraReady) return;

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

    // Start recording
    setIsRecording(true);
    setCountdown(null);
    setRecordingTime(Math.floor(recordingDuration / 1000));

    try {
      const result = await videoRecorder.startRecording({
        duration: recordingDuration,
      });

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
  }, [cameraReady, recordingDuration, onRecordingComplete]);

  return {
    isRecording,
    isProcessing,
    countdown,
    recordingTime,
    cameraReady,
    startRecordingWithCountdown,
    setupRecorder,
  };
};
