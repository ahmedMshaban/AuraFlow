import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { stressMonitoringService } from '../services/stressMonitoringService';
import StressMonitor from '../services/StressMonitor';
import StressAdaptations from '../adaptations/StressAdaptation';
import type { AuthContextType } from '../types/authContext';

/**
 * Component that initializes and renders stress monitoring components
 * only when a user is authenticated
 */
export const AuthenticatedStressMonitoring: React.FC = () => {
  const { currentUser } = useAuth() as AuthContextType;

  // Initialize stress monitoring only when user is logged in
  useEffect(() => {
    if (currentUser) {
      console.log('User is logged in, initializing stress monitoring');
      stressMonitoringService.initialize();
    }

    // Cleanup when component unmounts or user logs out
    return () => {
      // Stop any active monitoring
      if (stressMonitoringService && typeof stressMonitoringService.clearAllScheduledTests === 'function') {
        stressMonitoringService.clearAllScheduledTests();
      }
    };
  }, [currentUser]);

  // Only render stress monitoring components if user is authenticated
  if (!currentUser) {
    return null;
  }

  return (
    <>
      <StressMonitor />
      <StressAdaptations />
    </>
  );
};

export default AuthenticatedStressMonitoring;
