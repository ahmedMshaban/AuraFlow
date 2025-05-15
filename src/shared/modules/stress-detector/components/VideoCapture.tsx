/**
 *
 * A component that extends WebcamCapture with video recording capabilities.
 * Specifically focused on capturing 5-second video segments for stress analysis.
 */

import React from 'react';

import WebcamCapture from './WebcamCapture';
import { useVideoRecorder } from '../infrastructure/hooks/useVideoRecorder';
import { useWebcamSetup } from '../infrastructure/hooks/useWebcamSetup';
import type { VideoCaptureProps } from '../infrastructure/types/VideoCapture.types';
import '../infrastructure/styles/VideoCapture.css';

const VideoCapture: React.FC<VideoCaptureProps> = ({ recordingDuration = 5000, onRecordingComplete }) => {
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
