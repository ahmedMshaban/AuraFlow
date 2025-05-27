import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { stressMonitoringService } from './stressMonitoringService';
import { StressAdaptationProvider } from '../adaptations/StressAdaptationContext';
import StressAdaptations from '../adaptations/StressAdaptation';
import StressMonitor from './StressMonitor';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes Redux and the stress monitoring service
 */
export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // Initialize the stress monitoring service when the app starts
  useEffect(() => {
    stressMonitoringService.initialize();
  }, []);
  return (
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <StressAdaptationProvider>
          {children}
          <StressMonitor />
          <StressAdaptations />
        </StressAdaptationProvider>
      </PersistGate>
    </Provider>
  );
};

export default StoreProvider;
