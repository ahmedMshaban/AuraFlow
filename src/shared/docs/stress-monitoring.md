# Stress Monitoring System

This system monitors user stress levels using facial expression analysis and adapts the UI accordingly.

## Architecture

The stress monitoring system is built using the following components:

1. **Face Analysis** - Uses face-api.js to detect stress indicators through facial expressions
2. **Redux Store** - Manages stress data state and persists it in localStorage
3. **Stress Monitoring Service** - Schedules and manages periodic stress tests
4. **Stress Adaptations** - Adapts the UI based on detected stress levels

## Key Features

- **Periodic Testing**: Tests stress levels every 30 minutes (configurable)
- **Data Persistence**: Stores stress history in localStorage via Redux-Persist
- **Analytics**: Provides stress trends and insights
- **Adaptive UI**: Changes theme, simplifies UI, and suggests breaks based on stress levels

## Components

### Redux Store

- `stressMonitoringSlice.ts` - Redux slice for stress monitoring state
- `store/index.ts` - Redux store configuration with persistence

### Services

- `stressMonitoringService.ts` - Schedules and manages stress tests
- `StressMonitor.tsx` - Component that shows the FaceAnalysis UI
- `StoreProvider.tsx` - Provider component for Redux store and stress monitoring

### Hooks

- `useStressMonitoring.ts` - Hook for accessing stress monitoring data
- `useStressAnalytics.ts` - Hook for analyzing stress data trends

### Adaptations

- `stressAdaptations.ts` - Functions for adapting UI based on stress
- `StressAdaptationContext.tsx` - Context provider for stress adaptations
- `StressAdaptations.tsx` - Component that shows adaptation effects
- `themes.css` - CSS for different stress-based themes

## Usage

The system works automatically once initialized through the `StoreProvider`:

1. The `stressMonitoringService` schedules tests at regular intervals
2. When a test is due, a `triggerStressTest` event is fired
3. The `StressMonitor` component shows the face analysis UI
4. Results are stored in Redux and localStorage
5. UI adaptations are applied based on stress levels

## Configuration

You can configure several aspects of the stress monitoring system:

- Test interval (default: 30 minutes)
- Maximum history size (default: 100 items)
- Auto-test enabling/disabling
- Stress thresholds for adaptations

## Development Panel

For development purposes, a `StressMonitoringPanel` is available to:

- View current stress data
- Manually trigger stress tests
- Configure test intervals
- Enable/disable automatic testing
- Clear stress history

## Implementation Notes

1. The face analysis uses a 3-second video to detect stress indicators
2. Stress is detected by identifying negative emotions (angry, fearful, disgusted, sad)
3. The system only stores results, not actual video or image data
4. All processing happens locally in the browser
