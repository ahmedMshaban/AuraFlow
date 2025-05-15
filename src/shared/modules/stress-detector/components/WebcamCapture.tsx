/**
 *
 * This component handles the webcam capture functionality.
 * It uses the MediaStream API to access the webcam and draw the video feed onto a canvas.
 */

import { useState, useRef, useEffect } from 'react';

import type { WebcamCaptureProps } from '../infrastructure/types/WebcamCapture.types';

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCaptureReady, onStreamAvailable }) => {
  // Core state and refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        console.log('Cleaning up camera stream');
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Effect to draw video to canvas continuously
  useEffect(() => {
    if (!stream || !videoRef.current || !canvasRef.current || !isActive) return;

    let animationFrameId = 0;

    // Function to draw the current video frame to the canvas
    const updateCanvas = () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Only proceed if video is playing and has dimensions
        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          // Ensure canvas dimensions match video
          if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
          if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Mirror the video horizontally for selfie view
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();
          }
        }
      }
      // Continue the animation loop
      animationFrameId = window.requestAnimationFrame(updateCanvas);
    };

    // Start the animation loop
    updateCanvas();

    // Clean up on unmount or when dependencies change
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stream, isActive]);

  // Start webcam
  const startCamera = async () => {
    try {
      console.log('Requesting camera access...');

      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support camera access');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 },
        },
      });
      console.log('✅ Camera access granted');
      setStream(mediaStream);

      // Notify parent component that stream is available
      if (onStreamAvailable) {
        onStreamAvailable(mediaStream);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Add event listeners to ensure video is ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');

          // Ensure video plays after metadata is loaded
          videoRef.current
            ?.play()
            .then(() => {
              console.log('Video playback started');
              setIsActive(true);
              if (onCaptureReady) onCaptureReady();
            })
            .catch((err) => {
              console.error('Error playing video:', err);
            });
        };

        videoRef.current.onloadeddata = () => {
          console.log(`Video ready with dimensions: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`);
        };

        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
        };
      } else {
        console.error('Video reference is not available');
      }

      setError(null);
    } catch (err) {
      console.error('❌ Error accessing camera:', err);
      setError(
        'Unable to access camera. Please ensure you have granted camera permissions and that no other app is using the camera.',
      );
    }
  };

  // Stop the webcam
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Clear the canvas when stopping the camera
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }

      console.log('Camera stopped');
    }
  };

  console.log('WebcamCapture component mounted');

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
            onClick={stopCamera}
          >
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
