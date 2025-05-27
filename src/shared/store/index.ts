import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage

import stressMonitoringReducer from './slices/stressMonitoringSlice';

// Configure persistence for stress monitoring
const stressMonitoringPersistConfig = {
  key: 'stressMonitoring',
  storage,
  // Only persist certain fields
  whitelist: ['lastStressResult', 'lastTestTimestamp', 'stressHistory', 'config'],
};

// Combine all reducers
const rootReducer = combineReducers({
  stressMonitoring: persistReducer(stressMonitoringPersistConfig, stressMonitoringReducer),
  // Add other reducers here as needed
});

// Create store with middleware
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in the redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore non-serializable values in specific paths
        ignoredPaths: ['stressMonitoring.lastStressResult.timestamp', 'stressMonitoring.lastStressResult.expressions'],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
