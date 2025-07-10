/**
 * A custom hook for managing webcam functionality
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import type { UseWebcamProps, UseWebcamResult } from '../types/WebcamCapture.types';

export const useWebcam = ({ onCaptureReady, onStreamAvailable }: UseWebcamProps = {}): UseWebcamResult => {
  // Core state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
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
      setStream(mediaStream);

      // Notify parent component that stream is available
      if (onStreamAvailable) {
        onStreamAvailable(mediaStream);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Add event listeners to ensure video is ready
        videoRef.current.onloadedmetadata = () => {
          // Ensure video plays after metadata is loaded
          videoRef.current
            ?.play()
            .then(() => {
              setIsActive(true);
              if (onCaptureReady) onCaptureReady();
            })
            .catch((err) => {
              console.error('Error playing video:', err);
            });
        };

        videoRef.current.onloadeddata = () => {};

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
  }, [onCaptureReady, onStreamAvailable]);

  // Stop the webcam
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  return {
    videoRef,
    stream,
    isActive,
    error,
    startCamera,
    stopCamera,
  };
};
