import { useState } from 'react';
import { Dialog, Portal } from '@chakra-ui/react';

import StressDetector from './components/StressDetector';
import type { StressAnalysisResult } from './infrastructure/types/FaceExpressions.types';
import styles from './infrastructure/styles/FaceAnalysis.module.css';

interface FaceAnalysisProps {
  onAnalysisComplete?: (result: StressAnalysisResult) => void;
  onClose?: () => void;
}

const FaceAnalysis: React.FC<FaceAnalysisProps> = ({ onAnalysisComplete, onClose }) => {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);

  const handleSkip = () => {
    setOpen(false);
    // Also notify the parent component to hide this component
    if (onClose) {
      onClose();
    }
  };

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const renderStepIndicator = (index: number) => {
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

  return (
    <Dialog.Root
      lazyMount
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      size={'lg'}
    >
      <Portal>
        <Dialog.Backdrop className={styles.modalBackdrop} />
        <div className={styles.modalPositioner}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeButton}
              onClick={handleSkip}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className={styles.modalHeader}>
              <h1 className={styles.modalTitle}>
                {step === 0 && "Let's Make AuraFlow Work Better for You!"}
                {step === 1 && '3 seconds to calibrate!'}
                {step === 2 && 'All Set!'}
              </h1>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.stepsContainer}>
                <div className={styles.stepsList}>{[0, 1].map((index) => renderStepIndicator(index))}</div>

                <div className={styles.stepContent}>
                  {step === 0 && (
                    <div className={styles.introContent}>
                      <p>To help you stay focused and calm, AuraFlow can adapt to your needs. Here's how:</p>
                      <ol>
                        <li>
                          <span>Quick Calibration (3 sec):</span> We'll take a short video to understand your emotion
                          state
                        </li>
                        <li>
                          <span>Gentle Check-ins:</span> We'll briefly check in (no camera always on!).
                        </li>
                        <li>
                          <span>Adapt Just for You:</span> If we sense stress, we'll simplify tasks or suggest breaks.
                        </li>
                      </ol>
                      <p>We never store your video or track what you type. You can adjust settings anytime.</p>

                      <p>Ready to try it?</p>

                      <div className={styles.buttonGroup}>
                        <button
                          className={`${styles.button} ${styles.outline}`}
                          onClick={handleSkip}
                        >
                          Skip for now
                        </button>
                        <button
                          className={`${styles.button} ${styles.solid}`}
                          onClick={handleNextStep}
                        >
                          Yes, let's calibrate!
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className={styles.detectorContainer}>
                      <p>Stay still — we're snapping your calm vibe!</p>
                      <StressDetector
                        onAnalysisComplete={(result) => {
                          console.log('Analysis complete:', result);
                          if (onAnalysisComplete) {
                            onAnalysisComplete(result);
                          }
                          setStep(2);
                        }}
                        currentStep={step}
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className={styles.finalContent}>
                      <p>All set! Your workspace will now adapt to keep you in the zone.</p>
                      <div className={styles.buttonGroup}>
                        <button
                          className={`${styles.button} ${styles.solid}`}
                          onClick={handleSkip}
                        >
                          Get Started
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </Dialog.Root>
  );
};

export default FaceAnalysis;
