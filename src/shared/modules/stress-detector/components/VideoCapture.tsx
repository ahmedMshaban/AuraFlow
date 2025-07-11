/**
 * Enhanced video capture component for stress analysis with automated recording workflow.
 * Extends basic webcam functionality with timed recording capabilities and user guidance.
 * Manages the complete video capture process for facial expression analysis.
 *
 * Component Features:
 * - Automatic 3-second video recording for optimal analysis duration
 * - Countdown timer and recording progress feedback
 * - Seamless integration with webcam setup and permissions
 * - Processing state management during analysis
 * - Camera readiness detection and validation
 *
 * Recording Workflow:
 * - Initialize webcam and wait for camera readiness
 * - Start countdown sequence when analysis step begins
 * - Record 3-second video segment of user's face
 * - Process and validate recording quality
 * - Pass video data to analysis pipeline
 *
 * User Experience:
 * - Clear countdown feedback before recording starts
 * - Real-time recording progress indication
 * - Processing feedback during analysis
 * - Error handling for camera and recording issues
 *
 * @param recordingDuration - Duration in milliseconds for video recording (default: 3000ms)
 * @param onRecordingComplete - Callback function to handle completed recording data
 * @param currentStep - Current step in analysis process to trigger recording
 *
 * @example
 * ```tsx
 * function StressAnalysisCapture() {
 *   const [step, setStep] = useState(0);
 *
 *   const handleRecordingComplete = (recordingData) => {
 *     console.log('Recording completed:', {
 *       duration: recordingData.duration,
 *       blob: recordingData.blob,
 *       timestamp: recordingData.timestamp
 *     });
 *
 *     // Process recording for facial analysis
 *     analyzeRecording(recordingData);
 *   };
 *
 *   return (
 *     <VideoCapture
 *       recordingDuration={3000}
 *       onRecordingComplete={handleRecordingComplete}
 *       currentStep={step}
 *     />
 *   );
 * }
 * ```
 *
 * @note Optimal recording duration is 3 seconds for accurate stress analysis
 * @see {@link WebcamCapture} for base camera functionality
 * @see {@link useVideoRecorder} for recording state management
 * @see {@link useWebcamSetup} for camera initialization
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
