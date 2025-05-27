import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import FaceAnalysis from '../modules/stress-detector/FaceAnalysis';
import { stressMonitoringService } from './stressMonitoringService';
import { recordStressResult } from '../store/slices/stressMonitoringSlice';
import type { StressAnalysisResult } from '../modules/stress-detector/infrastructure/types/FaceExpressions.types';

/**
 * Component that wraps the FaceAnalysis component and handles stress monitoring
 */
export const StressMonitor: React.FC = () => {
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const dispatch = useDispatch();

  // Listen for stress test triggers
  useEffect(() => {
    const handleTriggerStressTest = () => {
      console.log('StressMonitor received triggerStressTest event');
      setShowAnalysis(true);
    };

    // Add event listener
    window.addEventListener('triggerStressTest', handleTriggerStressTest);

    // Clean up on unmount
    return () => {
      window.removeEventListener('triggerStressTest', handleTriggerStressTest);
    };
  }, []);
  // Handle analysis completion
  const handleAnalysisComplete = (result: StressAnalysisResult) => {
    console.log('Stress analysis completed with result:', result);

    // Serialize the result before sending to Redux
    const serializedResult = {
      ...result,
      // Convert FaceExpressions object to a plain object with numeric values
      expressions: result.expressions
        ? Object.fromEntries(Object.entries(result.expressions).map(([key, value]) => [key, Number(value)]))
        : {},
      // Ensure timestamp is a number, not a Date object
      timestamp:
        result.timestamp instanceof Date
          ? result.timestamp.getTime()
          : typeof result.timestamp === 'number'
            ? result.timestamp
            : Date.now(),
    };

    // Record the serialized result in Redux
    dispatch(recordStressResult(serializedResult));

    // Also record in the service to schedule the next test
    stressMonitoringService.recordTestResult(serializedResult);

    // Hide the analysis component
    setShowAnalysis(false);
  };

  return <>{showAnalysis && <FaceAnalysis onAnalysisComplete={handleAnalysisComplete} />}</>;
};

export default StressMonitor;
