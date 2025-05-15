/**
 *
 * A component that analyzes facial expressions from a 5-second video
 * and provides stress level feedback.
 */

import React, { useState, useEffect, useCallback } from 'react';

import VideoCapture from './components/VideoCapture';
import { faceAnalyzer } from './infrastructure/services/FaceAnalyzer';
import type { StressAnalysisResult } from './infrastructure/types/FaceExpressions';
import './infrastructure/styles/StressDetector.css';

interface StressDetectorProps {
  /** Called when stress analysis is complete */
  onAnalysisComplete?: (result: StressAnalysisResult) => void;
}

const StressDetector: React.FC<StressDetectorProps> = ({ onAnalysisComplete }) => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StressAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  /**
   * Load face-api.js models when component mounts
   */
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        await faceAnalyzer.loadModels();
        setModelsLoaded(true);
        setError(null);
      } catch (err) {
        setError('Failed to load facial analysis models. Please check your connection and try again.');
        console.error('Error loading models:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  /**
   * Handle when recording is complete
   */
  const handleRecordingComplete = useCallback(
    async (recordingResult) => {
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

  /**
   * Format stress level as text
   */
  const getStressLevelText = (level: number): string => {
    if (level < 30) return 'Low';
    if (level < 65) return 'Moderate';
    return 'High';
  };

  /**
   * Get recommendations based on stress level
   */
  const getRecommendations = (result: StressAnalysisResult): string[] => {
    const baseRecommendations = ['Take slow, deep breaths for 2 minutes', 'Stretch your body gently', 'Stay hydrated'];

    if (result.stressLevel > 65) {
      return [
        ...baseRecommendations,
        'Consider taking a short break from your current task',
        'Try a quick meditation exercise',
        'If stress persists, consider speaking with a professional',
      ];
    } else if (result.stressLevel > 30) {
      return [...baseRecommendations, 'Take a short walk if possible', 'Consider doing a brief mindfulness exercise'];
    } else {
      return [
        ...baseRecommendations,
        'Continue with your current activities',
        'Schedule regular breaks to maintain your wellbeing',
      ];
    }
  };

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
