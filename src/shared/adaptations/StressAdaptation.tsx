import React from 'react';
import { useStressAdaptation } from './StressAdaptationContext';

/**
 * Component that displays and applies stress adaptations
 */
export const StressAdaptations: React.FC = () => {
  const { theme, simplifyUI, motivationalMessage, isBreakSuggested, dismissBreakSuggestion } = useStressAdaptation();

  // Apply theme class to the document body
  React.useEffect(() => {
    document.body.classList.remove('theme-default', 'theme-calm', 'theme-focus');
    document.body.classList.add(`theme-${theme}`);

    return () => {
      document.body.classList.remove(`theme-${theme}`);
    };
  }, [theme]);

  // Theme label for display
  const themeLabel = {
    default: 'Standard',
    calm: 'Calming',
    focus: 'Focus Mode',
  }[theme];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isBreakSuggested ? '20px' : '-200px',
        right: '20px',
        transition: 'bottom 0.5s ease-in-out',
        backgroundColor: theme === 'calm' ? '#e3f2fd' : theme === 'focus' ? '#f5f5f5' : '#ffffff',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        maxWidth: '350px',
        zIndex: 1000,
      }}
    >
      {isBreakSuggested && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>AuraFlow Suggestion</h3>
            <button
              onClick={dismissBreakSuggestion}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '5px',
              }}
            >
              ✕
            </button>
          </div>

          <p style={{ margin: '10px 0', fontSize: '14px' }}>{motivationalMessage}</p>

          <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            <p>Current adaptations:</p>
            <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
              <li>Theme: {themeLabel}</li>
              {simplifyUI && <li>Simplified Interface</li>}
            </ul>
          </div>

          <div
            style={{
              marginTop: '15px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            <button
              onClick={dismissBreakSuggestion}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Take a Break
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StressAdaptations;
