/**
 * Core stress detection component that analyzes facial expressions from video input.
 * Orchestrates the complete stress analysis workflow from model loading to result display.
 * Provides real-time feedback and error handling for the facial analysis process.
 *
 * Component Features:
 * - Automatic facial analysis model loading and management
 * - 3-second video recording for expression capture
 * - Real-time facial expression detection and analysis
 * - Stress level calculation based on expression patterns
 * - Comprehensive error handling and user feedback
 *
 * Analysis Workflow:
 * - Load facial recognition models (face detection, landmarks, expressions)
 * - Initialize camera and video capture
 * - Record 3-second video segment of user's face
 * - Analyze facial expressions frame by frame
 * - Calculate stress levels from expression data
 * - Provide results and insights to user
 *
 * Error Handling:
 * - Model loading failures with retry options
 * - Camera access issues and permissions
 * - Poor lighting or face detection problems
 * - Analysis processing errors
 *
 * @param onAnalysisComplete - Callback function to handle completed analysis results
 * @param currentStep - Current step in the analysis process for UI coordination
 *
 * @example
 * ```tsx
 * function StressAnalysisModal() {
 *   const [currentStep, setCurrentStep] = useState(0);
 *
 *   const handleAnalysisComplete = (result) => {
 *     console.log('Analysis complete:', {
 *       stressLevel: result.stressLevel,
 *       dominantExpression: result.dominantExpression,
 *       confidence: result.confidence
 *     });
 *
 *     // Process results for UI adaptations
 *     updateStressAdaptations(result);
 *   };
 *
 *   return (
 *     <StressDetector
 *       onAnalysisComplete={handleAnalysisComplete}
 *       currentStep={currentStep}
 *     />
 *   );
 * }
 * ```
 *
 * @note Requires webcam access and adequate lighting for accurate results
 * @see {@link VideoCapture} for video recording functionality
 * @see {@link useFaceModel} for model loading management
 * @see {@link useFaceAnalysis} for expression analysis logic
 */

import React from 'react';

import VideoCapture from './VideoCapture';
import { useFaceModel } from '../infrastructure/hooks/useFaceModel';
import { useFaceAnalysis } from '../infrastructure/hooks/useFaceAnalysis';
import type { StressDetectorProps } from '../infrastructure/types/StressDetector.types';
import '../infrastructure/styles/StressDetector.css';

const StressDetector: React.FC<StressDetectorProps> = ({ onAnalysisComplete, currentStep }) => {
  const { isLoading: modelsLoading, modelsLoaded, error: modelError } = useFaceModel();

  const {
    isLoading: analysisLoading,
    analysisResult,
    error: analysisError,
    handleRecordingComplete,
    handleReset,
  } = useFaceAnalysis({ onAnalysisComplete });

  // Combine errors from different sources
  const error = modelError || analysisError;
  const isLoading = modelsLoading || analysisLoading;

  return (
    <div className="stress-detector">
      {!modelsLoaded && (
        <div className="loading-models">
          <p>Loading facial analysis models...</p>
          <div className="loading-spinner"></div>
        </div>
      )}

      {modelsLoaded && !analysisResult && (
        <>
          <VideoCapture
            recordingDuration={3000}
            onRecordingComplete={handleRecordingComplete}
            currentStep={currentStep}
          />

          {isLoading && (
            <div className="analysis-loading">
              <p>Analyzing facial expressions...</p>
              <div className="loading-spinner"></div>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleReset}>Try Again</button>
        </div>
      )}

      {analysisResult && (
        <div className="analysis-result">
          <h2>Stress Analysis Results</h2>
        </div>
      )}
    </div>
  );
};

export default StressDetector;
