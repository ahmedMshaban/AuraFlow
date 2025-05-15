/**
 * A custom hook for rendering a video stream to a canvas element
 */
import { useRef, useEffect } from 'react';

interface UseCanvasRendererProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isActive: boolean;
}

interface UseCanvasRendererResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  clearCanvas: () => void;
}

export const useCanvasRenderer = ({ videoRef, stream, isActive }: UseCanvasRendererProps): UseCanvasRendererResult => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
  }, [stream, isActive, videoRef]);

  // Function to clear the canvas
  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  return {
    canvasRef,
    clearCanvas,
  };
};
