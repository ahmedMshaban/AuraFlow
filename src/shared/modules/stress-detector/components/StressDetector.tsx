/**
 *
 * A component that analyzes facial expressions from a 5-second video
 * and provides stress level feedback.
 */

import React from 'react';

import VideoCapture from './VideoCapture';
import { useFaceModel } from '../infrastructure/hooks/useFaceModel';
import { useFaceAnalysis } from '../infrastructure/hooks/useFaceAnalysis';
import { useStressAnalysisUtils } from '../infrastructure/hooks/useStressAnalysisUtils';
import type { StressDetectorProps } from '../infrastructure/types/StressDetector.types';
import '../infrastructure/styles/StressDetector.css';

const StressDetector: React.FC<StressDetectorProps> = ({ onAnalysisComplete }) => {
  const { isLoading: modelsLoading, modelsLoaded, error: modelError } = useFaceModel();

  const {
    isLoading: analysisLoading,
    analysisResult,
    error: analysisError,
    handleRecordingComplete,
    handleReset,
  } = useFaceAnalysis({ onAnalysisComplete });

  const { getStressLevelText, getRecommendations } = useStressAnalysisUtils();

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
            recordingDuration={5000}
            onRecordingComplete={handleRecordingComplete}
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

          <div className="stress-level">
            <div className="stress-meter">
              <div
                className="stress-indicator"
                style={{ width: `${analysisResult.stressLevel}%` }}
              ></div>
            </div>
            <p>
              Stress Level:{' '}
              <span className={`stress-${getStressLevelText(analysisResult.stressLevel).toLowerCase()}`}>
                {getStressLevelText(analysisResult.stressLevel)} ({analysisResult.stressLevel}%)
              </span>
            </p>
          </div>

          <div className="expressions">
            <h3>Expression Analysis</h3>
            <p>
              Dominant expression: <strong>{analysisResult.dominantExpression}</strong>
            </p>
            <div className="expression-bars">
              {Object.entries(analysisResult.expressions).map(([expression, value]) => (
                <div
                  className="expression-bar"
                  key={expression}
                >
                  <span className="expression-name">{expression}</span>
                  <div className="expression-meter">
                    <div
                      className="expression-indicator"
                      style={{ width: `${value * 100}%` }}
                    ></div>
                  </div>
                  <span className="expression-value">{Math.round(value * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="recommendations">
            <h3>Recommendations</h3>
            <ul>
              {getRecommendations(analysisResult).map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>

          <button
            className="reset-button"
            onClick={handleReset}
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
};

export default StressDetector;
