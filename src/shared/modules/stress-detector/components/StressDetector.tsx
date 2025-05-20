/**
 *
 * A component that analyzes facial expressions from a 5-second video
 * and provides stress level feedback.
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
