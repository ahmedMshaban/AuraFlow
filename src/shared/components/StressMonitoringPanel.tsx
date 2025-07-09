import React from 'react';
import { Button, HStack } from '@chakra-ui/react';
import { FaPlay, FaToggleOn, FaToggleOff, FaExclamationTriangle, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { useStressMonitoring } from '../hooks/useStressMonitoring';
import { useStressAdaptation } from '../adaptations/StressAdaptationContext';
import styles from './StressMonitoringPanel.module.css';

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
    isManualStressModeEnabled,
    triggerStressTest,
    setInterval,
    setAutoTest,
    toggleManualStressMode,
    clearHistory,
  } = useStressMonitoring();

  const { theme } = useStressAdaptation();

  // Format time remaining until next test
  const formatTimeRemaining = () => {
    if (!timeUntilNextTest) return 'N/A';

    const minutes = Math.floor(timeUntilNextTest / (60 * 1000));
    const seconds = Math.floor((timeUntilNextTest % (60 * 1000)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // Get stress level indicator color
  const getStressIndicatorClass = (stressLevel: number) => {
    if (stressLevel >= 80) return styles.stressHigh;
    if (stressLevel >= 60) return styles.stressMedium;
    return styles.stressLow;
  };

  const handleManualStressToggle = () => {
    toggleManualStressMode();
  };

  return (
    <div className={styles.stressPanel}>
      <h2 className={styles.panelTitle}>Stress Monitoring</h2>

      <div>
        <h3 className={styles.sectionTitle}>Current Status</h3>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Auto-testing</span>
            <span className={styles.statusValue}>{autoTestEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Manual Stress Mode</span>
            <span className={`${styles.statusValue} ${isManualStressModeEnabled ? styles.manualStressModeActive : ''}`}>
              {isManualStressModeEnabled ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Test Interval</span>
            <span className={styles.statusValue}>{testInterval} minutes</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Next test in</span>
            <span className={styles.statusValue}>{formatTimeRemaining()}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Last test</span>
            <span className={styles.statusValue}>{lastTestTime ? lastTestTime.toLocaleString() : 'Never'}</span>
          </div>
        </div>

        {lastStressResult && (
          <div className={styles.resultCard}>
            <h3 className={styles.sectionTitle}>Last Result</h3>
            <div className={styles.statusGrid}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Dominant Expression</span>
                <span className={styles.statusValue}>{lastStressResult.dominantExpression}</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Is Stressed</span>
                <span className={styles.statusValue}>{lastStressResult.isStressed ? 'Yes' : 'No'}</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Current Theme</span>
                <span className={styles.statusValue}>{theme}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.controlsSection}>
        <h3 className={styles.sectionTitle}>Controls</h3>
        <HStack
          gap={3}
          mb={4}
          flexWrap="wrap"
        >
          <Button
            onClick={triggerStressTest}
            size="sm"
            className={styles.testNowButton}
          >
            <FaPlay style={{ marginRight: '0.5rem' }} />
            Test Now
          </Button>

          <Button
            onClick={() => setAutoTest(!autoTestEnabled)}
            size="sm"
            className={autoTestEnabled ? styles.disableAutoButton : styles.enableAutoButton}
          >
            {autoTestEnabled ? (
              <>
                <FaToggleOff style={{ marginRight: '0.5rem' }} />
                Disable Auto-Test
              </>
            ) : (
              <>
                <FaToggleOn style={{ marginRight: '0.5rem' }} />
                Enable Auto-Test
              </>
            )}
          </Button>

          <Button
            onClick={handleManualStressToggle}
            size="sm"
            className={isManualStressModeEnabled ? styles.exitStressButton : styles.triggerStressButton}
          >
            {isManualStressModeEnabled ? (
              <>
                <FaCheckCircle style={{ marginRight: '0.5rem' }} />
                Exit Stress Mode
              </>
            ) : (
              <>
                <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
                Trigger Stress Mode
              </>
            )}
          </Button>
        </HStack>

        <HStack
          gap={3}
          mb={4}
          align="center"
        >
          <label
            htmlFor="intervalSelect"
            className={styles.statusLabel}
          >
            Test Interval:
          </label>
          <select
            id="intervalSelect"
            value={testInterval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className={styles.select}
          >
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </HStack>

        <Button
          onClick={clearHistory}
          size="sm"
          className={styles.clearHistoryButton}
        >
          <FaTrash style={{ marginRight: '0.5rem' }} />
          Clear History
        </Button>
      </div>

      {stressHistory.length > 0 && (
        <div className={styles.historySection}>
          <h3 className={styles.sectionTitle}>History</h3>
          <div className={styles.historyContainer}>
            {stressHistory.map((entry, index) => (
              <div
                key={index}
                className={styles.historyItem}
              >
                <div className={styles.historyTime}>{new Date(entry.timestamp).toLocaleString()}</div>
                <div className={styles.historyDetails}>
                  <span className={`${styles.stressIndicator} ${getStressIndicatorClass(entry.stressLevel)}`}></span>
                  <strong>{entry.dominantExpression}</strong>
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
