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
        console.log('Cleaning up camera stream');
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Start webcam
  const startCamera = useCallback(async () => {
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

      console.log('Camera stopped');
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
