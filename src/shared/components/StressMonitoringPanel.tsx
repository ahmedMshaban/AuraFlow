import React from 'react';
import { useStressMonitoring } from '../hooks/useStressMonitoring';

/**
 * Component that displays stress monitoring information and controls
 * This is useful for testing and for user configuration
 */
export const StressMonitoringPanel: React.FC = () => {
  const {
    lastStressResult,
    lastTestTime,
    timeUntilNextTest,
    stressHistory,
    testInterval,
    autoTestEnabled,
    triggerStressTest,
    setInterval,
    setAutoTest,
    clearHistory,
  } = useStressMonitoring();

  // Format time remaining until next test
  const formatTimeRemaining = () => {
    if (!timeUntilNextTest) return 'N/A';

    const minutes = Math.floor(timeUntilNextTest / (60 * 1000));
    const seconds = Math.floor((timeUntilNextTest % (60 * 1000)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '20px 0' }}>
      <h2 style={{ marginTop: 0 }}>Stress Monitoring</h2>

      <div>
        <h3>Current Status</h3>
        <p>
          Auto-testing: <strong>{autoTestEnabled ? 'Enabled' : 'Disabled'}</strong>
        </p>
        <p>
          Test Interval: <strong>{testInterval} minutes</strong>
        </p>
        <p>
          Next test in: <strong>{formatTimeRemaining()}</strong>
        </p>
        <p>
          Last test: <strong>{lastTestTime ? lastTestTime.toLocaleString() : 'Never'}</strong>
        </p>

        {lastStressResult && (
          <>
            <h3>Last Result</h3>
            <p>
              Stress Level: <strong>{lastStressResult.stressLevel}%</strong>
            </p>
            <p>
              Dominant Expression: <strong>{lastStressResult.dominantExpression}</strong>
            </p>
            <p>
              Is Stressed: <strong>{lastStressResult.isStressed ? 'Yes' : 'No'}</strong>
            </p>
          </>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Controls</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button
            onClick={triggerStressTest}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Test Now
          </button>

          <button
            onClick={() => setAutoTest(!autoTestEnabled)}
            style={{
              padding: '8px 16px',
              backgroundColor: autoTestEnabled ? '#f44336' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {autoTestEnabled ? 'Disable Auto-Test' : 'Enable Auto-Test'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <label htmlFor="intervalSelect">Test Interval:</label>
          <select
            id="intervalSelect"
            value={testInterval}
            onChange={(e) => setInterval(Number(e.target.value))}
            style={{ padding: '8px', borderRadius: '4px' }}
          >
            <option value="1">1 minute (for testing)</option>
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>

        <button
          onClick={clearHistory}
          style={{
            padding: '8px 16px',
            backgroundColor: '#9E9E9E',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear History
        </button>
      </div>

      {stressHistory.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>History</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
            {stressHistory.map((entry, index) => (
              <div
                key={index}
                style={{ marginBottom: '5px', padding: '5px', borderBottom: '1px solid #eee' }}
              >
                <small>{new Date(entry.timestamp).toLocaleString()}</small>
                <div>
                  <strong>{entry.dominantExpression}</strong> - Level: {entry.stressLevel}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StressMonitoringPanel;
