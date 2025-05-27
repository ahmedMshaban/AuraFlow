import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { StressAdaptationProvider } from '../adaptations/StressAdaptationContext';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes Redux and the stress monitoring service
 * only when user is logged in
 */
export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // We can't use useAuth here directly because it needs to be inside the AuthProvider
  // We'll modify the App.tsx structure instead
  return (
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <StressAdaptationProvider>
          {children}
        </StressAdaptationProvider>
      </PersistGate>
    </Provider>
  );
};

export default StoreProvider;
