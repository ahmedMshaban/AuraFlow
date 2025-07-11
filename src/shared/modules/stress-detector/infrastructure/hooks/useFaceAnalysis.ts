/**
 * Advanced hook for analyzing facial expressions from video recordings and calculating stress levels.
 * Processes recorded video data through facial recognition models to extract expression patterns.
 * Converts expression data into stress metrics and provides comprehensive analysis results.
 *
 * Analysis Features:
 * - Frame-by-frame facial expression detection
 * - Multi-expression pattern analysis (anger, sadness, fear, etc.)
 * - Stress level calculation based on expression combinations
 * - Confidence scoring for analysis reliability
 * - Dominant expression identification
 *
 * Processing Workflow:
 * - Receive video blob from recording component
 * - Create video element for frame analysis
 * - Extract facial expressions using face-api.js
 * - Analyze expression patterns for stress indicators
 * - Calculate comprehensive stress metrics
 * - Provide results with confidence scores
 *
 * Error Handling:
 * - No face detection scenarios
 * - Poor video quality issues
 * - Model processing failures
 * - Analysis timeout handling
 *
 * @param onAnalysisComplete - Optional callback function for handling completed analysis
 * @returns Object containing analysis state, results, and control functions
 *
 * @example
 * ```tsx
 * function StressAnalysisProcessor() {
 *   const {
 *     isLoading,
 *     analysisResult,
 *     error,
 *     handleRecordingComplete,
 *     handleReset
 *   } = useFaceAnalysis({
 *     onAnalysisComplete: (result) => {
 *       console.log('Stress Analysis:', {
 *         stressLevel: result.stressLevel,
 *         dominantExpression: result.dominantExpression,
 *         confidence: result.confidence,
 *         expressions: result.expressions
 *       });
 *
 *       // Update UI adaptations based on stress level
 *       updateStressAdaptations(result);
 *     }
 *   });
 *
 *   return (
 *     <div>
 *       {isLoading && <AnalysisProgress />}
 *       {error && <ErrorDisplay error={error} onRetry={handleReset} />}
 *       {analysisResult && <StressResults result={analysisResult} />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @note Requires face-api.js models to be loaded before analysis
 * @see {@link useFaceModel} for model loading requirements
 * @see {@link faceAnalyzer} for underlying analysis algorithms
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
