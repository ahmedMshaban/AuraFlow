/**
 * A custom hook that handles webcam setup for the VideoCapture component
 */
import { useCallback } from 'react';

import type { UseWebcamSetupProps, WebcamSetupHandlers } from '../types/WebcamCapture.types';

export const useWebcamSetup = ({ onCaptureReady, onStreamAvailable }: UseWebcamSetupProps): WebcamSetupHandlers => {
  /**
   * Handle when webcam is ready
   */
  const handleCaptureReady = useCallback(() => {
    if (onCaptureReady) {
      onCaptureReady();
    }
  }, [onCaptureReady]);

  /**
   * Handle when a webcam stream becomes available
   */
  const handleStreamAvailable = useCallback(
    (stream: MediaStream) => {
      if (onStreamAvailable) {
        onStreamAvailable(stream);
      }
    },
    [onStreamAvailable],
  );

  return {
    handleCaptureReady,
    handleStreamAvailable,
  };
};
