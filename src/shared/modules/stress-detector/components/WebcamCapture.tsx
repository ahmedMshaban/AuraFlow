/**
 *
 * This component handles the webcam capture functionality.
 * It uses the MediaStream API to access the webcam and draw the video feed onto a canvas.
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
