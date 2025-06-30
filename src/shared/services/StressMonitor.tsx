import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

import FaceAnalysis from '../modules/stress-detector/FaceAnalysis';
import { stressMonitoringService } from './stressMonitoringService';
import { recordStressResult } from '../store/slices/stressMonitoringSlice';
import type { StressAnalysisResult } from '../modules/stress-detector/infrastructure/types/FaceExpressions.types';

/**
 * Component that wraps the FaceAnalysis component and handles stress monitoring
 */
export const StressMonitor = () => {
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

    // Show appropriate toast based on stress level
    if (result.isStressed) {
      // Show stressed toast and redirect to activities page
      toast.success('🌿 Take a moment to breathe. Let\'s find some calming activities for you.', {
        duration: 5000,
        style: {
          background: '#fed6e3',
          color: '#2c5282',
          border: '1px solid #bee3f8',
          borderRadius: '100px',
          padding: '16px 24px',
          fontSize: '14px',
          fontWeight: '500',
        },
        icon: '🧘‍♀️',
      });

      // Redirect to activities page after a short delay
      setTimeout(() => {
        navigate('/activities');
      }, 1500);
    } else {
      // Show not stressed toast
      toast.success('✨ You\'re in a great headspace! Keep up the amazing work.', {
        duration: 5000,
        style: {
          background: '#f0f8ff',
          color: '#2c5282',
          border: '1px solid #bee3f8',
          borderRadius: '100px',
          padding: '16px 24px',
          fontSize: '14px',
          fontWeight: '500',
        },
        icon: '😊',
      });
    }
  };

  const handleClose = () => {
    setShowAnalysis(false);
  };

  return (
    <>
      {showAnalysis && (
        <FaceAnalysis
          onAnalysisComplete={handleAnalysisComplete}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default StressMonitor;
