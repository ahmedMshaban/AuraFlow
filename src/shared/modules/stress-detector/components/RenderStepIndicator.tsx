import styles from '../infrastructure/styles/FaceAnalysis.module.css';

/**
 * Visual step indicator component for the facial analysis workflow.
 * Provides clear progress feedback and visual guidance through the analysis process.
 * Displays current, completed, and upcoming steps with appropriate styling.
 *
 * Indicator Features:
 * - Visual progress representation with step numbers and checkmarks
 * - Dynamic styling based on step completion status
 * - Clear visual separation between steps
 * - Accessible progress indication for screen readers
 *
 * Visual States:
 * - Current: Highlighted step currently in progress
 * - Completed: Steps finished with checkmark indicators
 * - Upcoming: Steps yet to be completed with step numbers
 * - Connected: Visual connectors between sequential steps
 *
 * @param index - Zero-based index of the step to render
 * @param step - Current active step in the process
 * @returns JSX element representing the step indicator
 *
 * @example
 * ```tsx
 * function AnalysisProgress() {
 *   const [currentStep, setCurrentStep] = useState(0);
 *   const totalSteps = 3;
 *
 *   return (
 *     <div className="steps-container">
 *       {Array.from({ length: totalSteps }, (_, index) =>
 *         RenderStepIndicator(index, currentStep)
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @note Uses CSS modules for styling consistency
 * @see {@link FaceAnalysis} for step progression logic
 */
const RenderStepIndicator = (index: number, step: number) => {
  const isCompleted = index < step;
  const isCurrent = index === step;
  const indicatorClass = `${styles.stepIndicator} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`;
  const separatorClass = `${styles.stepSeparator} ${isCompleted ? styles.completed : ''}`;

  return (
    <div
      key={index}
      className={styles.stepItem}
    >
      <div className={indicatorClass}>{isCompleted ? '✓' : index + 1}</div>
      <div className={styles.stepTitle}>Step {index + 1}</div>
      {index < 1 && <div className={separatorClass} />}
    </div>
  );
};

export default RenderStepIndicator;
