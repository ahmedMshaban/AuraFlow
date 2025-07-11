import React from 'react';
import { useStressAdaptation } from './StressAdaptationContext';

/**
 * A dynamic stress adaptation display component that provides real-time stress management suggestions.
 * Shows contextual break suggestions, theme adaptations, and motivational messaging based on
 * the user's current stress level and behavioral patterns.
 *
 * Features:
 * - Animated break suggestion notifications with slide-in/out transitions
 * - Dynamic theme application to document body for visual stress reduction
 * - Motivational messaging tailored to stress level and context
 * - Adaptive interface simplification during high stress periods
 * - Dismissible notifications with user control
 * - Visual adaptation indicators showing current applied changes
 * - Accessible design with proper contrast and readable typography
 *
 * Visual Adaptations:
 * - Theme switching between standard and calming color palettes
 * - Background colors adapt based on stress level
 * - Simplified UI elements when stress is detected
 * - Smooth transitions for non-jarring user experience
 *
 * Break Management:
 * - Intelligent break suggestions based on stress patterns
 * - Contextual motivational messages for stress relief
 * - User-controlled dismissal of break suggestions
 * - Visual indicators of current adaptive measures
 * - Call-to-action buttons for break engagement
 *
 * @returns A floating stress adaptation interface with dynamic suggestions
 *
 * @example
 * ```tsx
 * // Basic usage - renders adaptive stress management interface
 * <StressAdaptations />
 *
 * // The component automatically:
 * // - Monitors stress levels from context
 * // - Applies appropriate theme adaptations
 * // - Shows break suggestions when needed
 * // - Provides motivational messaging
 * // - Manages visual transitions and animations
 * ```
 *
 * @note Component applies theme classes directly to document.body for global theming
 * @note Break suggestions appear as floating notifications with smooth animations
 * @note All adaptations are user-dismissible while maintaining adaptive behavior
 * @see {@link useStressAdaptation} For stress adaptation context and state management
 * @see {@link StressAdaptationContext} For global stress adaptation state
 */
export const StressAdaptations: React.FC = () => {
  const { theme, simplifyUI, motivationalMessage, isBreakSuggested, dismissBreakSuggestion } = useStressAdaptation();
  // Apply theme class to the document body
  React.useEffect(() => {
    document.body.classList.remove('theme-default', 'theme-calm');
    document.body.classList.add(`theme-${theme}`);

    return () => {
      document.body.classList.remove(`theme-${theme}`);
    };
  }, [theme]);

  // Theme label for display
  const themeLabel = {
    default: 'Standard',
    calm: 'Calming',
  }[theme];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isBreakSuggested ? '20px' : '-200px',
        right: '20px',
        transition: 'bottom 0.5s ease-in-out',
        backgroundColor: theme === 'calm' ? '#e3f2fd' : '#ffffff',
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
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>AuraFlow Suggestion</h3>
            <button
              onClick={dismissBreakSuggestion}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.125rem',
                padding: '5px',
              }}
            >
              ✕
            </button>
          </div>

          <p style={{ margin: '10px 0', fontSize: '0.875rem' }}>{motivationalMessage}</p>

          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '10px' }}>
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
                fontSize: '0.8125rem',
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
