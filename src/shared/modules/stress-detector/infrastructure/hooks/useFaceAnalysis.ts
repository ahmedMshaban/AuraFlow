/**
 * A custom hook for analyzing facial expressions from video recordings
 */
import { useState, useCallback } from 'react';

import { faceAnalyzer } from '../services/FaceAnalyzer';
import type { StressAnalysisResult } from '../types/FaceExpressions.types';
import type { RecordingResult } from '../types/VideoRecorder.types';
import type { UseFaceAnalysisProps, UseFaceAnalysisResult } from '../types/FaceAnalysis.types';

export const useFaceAnalysis = ({ onAnalysisComplete }: UseFaceAnalysisProps = {}): UseFaceAnalysisResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StressAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle when recording is complete
   */
  const handleRecordingComplete = useCallback(
    async (recordingResult: RecordingResult) => {
      if (!recordingResult || !recordingResult.blob) {
        setError('Recording failed or was empty.');
        return;
      }

      try {
        setIsLoading(true);
        setAnalysisResult(null);

        // Create a video element to analyze
        const video = document.createElement('video');
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;

        // Create object URL from recorded blob
        const videoUrl = URL.createObjectURL(recordingResult.blob);
        video.src = videoUrl;

        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => {
            video.play().then(() => resolve());
          };
        });

        // Capture facial expressions from the video
        const detectionResult = await faceAnalyzer.detectExpressions(video);

        // Clean up resources
        video.pause();
        URL.revokeObjectURL(videoUrl);

        if (!detectionResult || !detectionResult.expressions) {
          setError('No face detected in the video. Please try again with good lighting and facing the camera.');
          setIsLoading(false);
          return;
        }

        // Analyze stress from expressions
        const stressResult = faceAnalyzer.analyzeStress(detectionResult.expressions);
        setAnalysisResult(stressResult);

        // Call callback if provided
        if (onAnalysisComplete) {
          onAnalysisComplete(stressResult);
        }
      } catch (err) {
        console.error('Error analyzing facial expressions:', err);
        setError('An error occurred while analyzing your facial expressions.');
      } finally {
        setIsLoading(false);
      }
    },
    [onAnalysisComplete],
  );

  /**
   * Reset the analysis result to start over
   */
  const handleReset = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
  }, []);

  return {
    isLoading,
    analysisResult,
    error,
    handleRecordingComplete,
    handleReset,
  };
};
