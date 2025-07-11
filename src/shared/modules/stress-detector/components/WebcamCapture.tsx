/**
 * Foundation webcam component that provides camera access and video stream management.
 * Handles MediaStream API integration and video rendering for facial analysis applications.
 * Designed to be unobtrusive to avoid influencing user's natural facial expressions.
 *
 * Component Features:
 * - MediaStream API integration for camera access
 * - Automatic camera permissions handling
 * - Hidden video preview to avoid user self-consciousness
 * - Canvas rendering for frame capture and analysis
 * - Stream lifecycle management and cleanup
 *
 * Technical Implementation:
 * - Uses getUserMedia for camera access
 * - Hidden video element to prevent user behavior modification
 * - Canvas-based frame rendering for analysis
 * - Proper stream cleanup on component unmount
 * - Error handling for camera access issues
 *
 * Privacy Considerations:
 * - Camera preview is hidden to maintain natural expressions
 * - Users might adjust behavior if they see themselves
 * - Video data is processed locally for analysis
 * - No video data is stored or transmitted
 *
 * @param onCaptureReady - Callback when camera capture is ready for use
 * @param onStreamAvailable - Callback when video stream becomes available
 * @param currentStep - Current analysis step to control camera activation
 *
 * @example
 * ```tsx
 * function FacialAnalysisSetup() {
 *   const [streamReady, setStreamReady] = useState(false);
 *
 *   const handleCaptureReady = () => {
 *     console.log('Camera capture is ready');
 *     setStreamReady(true);
 *   };
 *
 *   const handleStreamAvailable = (stream) => {
 *     console.log('Video stream available:', stream);
 *     // Initialize recording or analysis pipeline
 *   };
 *
 *   return (
 *     <WebcamCapture
 *       onCaptureReady={handleCaptureReady}
 *       onStreamAvailable={handleStreamAvailable}
 *       currentStep={1}
 *     />
 *   );
 * }
 * ```
 *
 * @note Video is hidden to prevent influencing user's natural expressions
 * @see {@link useWebcam} for camera access logic
 * @see {@link useCanvasRenderer} for frame rendering functionality
 */

import React, { useEffect } from 'react';

import { useWebcam } from '../infrastructure/hooks/useWebcam';
import { useCanvasRenderer } from '../infrastructure/hooks/useCanvasRenderer';
import type { WebcamCaptureProps } from '../infrastructure/types/WebcamCapture.types';

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCaptureReady, onStreamAvailable, currentStep }) => {
  const { videoRef, stream, isActive, error, startCamera, stopCamera } = useWebcam({
    onCaptureReady,
    onStreamAvailable,
  });

  const { canvasRef } = useCanvasRenderer({
    videoRef,
    stream,
    isActive,
  });

  useEffect(() => {
    if (!stream && currentStep === 1) {
      startCamera();
    }
    // Cleanup function to stop the camera when the component unmounts
    return () => {
      if (stream) {
        stopCamera();
      }
    };
  }, [stream, currentStep, startCamera, stopCamera]);

  return (
    <div className="face-analyzer">
      <div className="video-container">
        {/* Hide the video element but keep it functional */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ display: 'none' }}
        />
        {/* 
        Hide the camera from the user but keep it functional for capturing frames
        if users sees them self on the camera, they might smile or adjust their face
        which can affect the results of the analysis
        */}

        <canvas
          ref={canvasRef}
          className="face-canvas"
          style={{ display: 'none' }}
        />
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default WebcamCapture;
