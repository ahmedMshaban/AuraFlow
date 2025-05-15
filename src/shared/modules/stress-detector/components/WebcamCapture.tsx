/**
 *
 * This component handles the webcam capture functionality.
 * It uses the MediaStream API to access the webcam and draw the video feed onto a canvas.
 */

import React from 'react';

import { useWebcam } from '../infrastructure/hooks/useWebcam';
import { useCanvasRenderer } from '../infrastructure/hooks/useCanvasRenderer';
import type { WebcamCaptureProps } from '../infrastructure/types/WebcamCapture.types';

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCaptureReady, onStreamAvailable }) => {
  const { videoRef, stream, isActive, error, startCamera, stopCamera } = useWebcam({
    onCaptureReady,
    onStreamAvailable,
  });

  const { canvasRef, clearCanvas } = useCanvasRenderer({
    videoRef,
    stream,
    isActive,
  });

  // Handle stop camera with canvas clearing
  const handleStopCamera = () => {
    clearCanvas();
    stopCamera();
  };

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
        <canvas
          ref={canvasRef}
          className="face-canvas"
          style={{ display: isActive ? 'block' : 'none' }}
        />
      </div>

      {error && <div className="error">{error}</div>}

      <div className="start-camera">
        {!stream ? (
          <button
            className="camera-button"
            onClick={startCamera}
          >
            Start Camera
          </button>
        ) : (
          <button
            className="camera-button"
            onClick={handleStopCamera}
          >
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
