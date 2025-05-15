/**
 *
 * A component that extends WebcamCapture with video recording capabilities.
 * Specifically focused on capturing 5-second video segments for stress analysis.
 */

import React, { useState, useCallback, useEffect } from 'react';

import WebcamCapture from './WebcamCapture';
import { videoRecorder } from '../infrastructure/services/VideoRecorder';
import type { VideoCaptureProps } from '../infrastructure/types/VideoCapture.types';
import '../infrastructure/styles/VideoCapture.css';

const VideoCapture: React.FC<VideoCaptureProps> = ({ recordingDuration = 5000, onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState<number | null>(null);

  /**
   * Handle when webcam is ready
   */
  const handleCaptureReady = useCallback(() => {
    setCameraReady(true);
  }, []);

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

  /**
   * Handle when a webcam stream becomes available
   */
  const handleStreamAvailable = useCallback((stream: MediaStream) => {
    videoRecorder.setup(stream);
  }, []);

  return (
    <div className="video-capture">
      {/* Use WebcamCapture as the base for video input */}
      <WebcamCapture
        onCaptureReady={handleCaptureReady}
        onStreamAvailable={handleStreamAvailable}
      />

      <div className="controls">
        {/* Recording controls */}
        {cameraReady && !isRecording && !isProcessing && (
          <button
            className="record-button"
            onClick={startRecordingWithCountdown}
            disabled={!cameraReady || isRecording || isProcessing}
          >
            Record 5-Second Video
          </button>
        )}

        {/* Countdown display */}
        {countdown !== null && (
          <div className="countdown">
            <span>Recording in {countdown}...</span>
          </div>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="recording-indicator">
            <span>Recording... {recordingTime !== null ? `${recordingTime}s remaining` : ''}</span>
            <div className="recording-dot"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCapture;
