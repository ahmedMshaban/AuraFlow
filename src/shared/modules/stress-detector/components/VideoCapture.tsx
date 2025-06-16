/**
 *
 * A component that extends WebcamCapture with video recording capabilities.
 * Specifically focused on capturing 3-second video segments for stress analysis.
 */

import React, { useEffect } from 'react';

import WebcamCapture from './WebcamCapture';
import { useVideoRecorder } from '../infrastructure/hooks/useVideoRecorder';
import { useWebcamSetup } from '../infrastructure/hooks/useWebcamSetup';
import type { VideoCaptureProps } from '../infrastructure/types/VideoCapture.types';
import '../infrastructure/styles/VideoCapture.css';

const VideoCapture: React.FC<VideoCaptureProps> = ({ recordingDuration = 3000, onRecordingComplete, currentStep }) => {
  // Use our custom hooks for video recording and webcam setup
  const {
    isRecording,
    isProcessing,
    cameraReady,
    countdown,
    recordingTime,
    startRecordingWithCountdown,
    setupRecorder,
  } = useVideoRecorder({
    recordingDuration,
    onRecordingComplete,
  });

  // Setup webcam handlers
  const { handleCaptureReady, handleStreamAvailable } = useWebcamSetup({
    onStreamAvailable: setupRecorder,
  });

  useEffect(() => {
    if (currentStep === 1 && cameraReady && !isRecording && !isProcessing) {
      startRecordingWithCountdown();
    }

    // Cleanup function to stop the camera when the component unmounts
  }, [currentStep, cameraReady, isRecording, isProcessing, startRecordingWithCountdown]);

  return (
    <div className="video-capture">
      {/* Use WebcamCapture as the base for video input */}
      <WebcamCapture
        onCaptureReady={handleCaptureReady}
        onStreamAvailable={handleStreamAvailable}
        currentStep={currentStep}
      />

      <div className="controls">
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
