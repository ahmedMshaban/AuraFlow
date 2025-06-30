import styles from '../infrastructure/styles/FaceAnalysis.module.css';

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
