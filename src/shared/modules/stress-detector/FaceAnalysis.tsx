import { Dialog, Portal } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

import StressDetector from './components/StressDetector';
import type { FaceAnalysisProps } from './infrastructure/types/FaceAnalysis.types';
import { selectStressHistory } from '../../store/slices/stressMonitoringSlice';
import RenderStepIndicator from './components/RenderStepIndicator';
import useFaceAnalysisModal from './infrastructure/hooks/useFaceAnalysisModal';
import styles from './infrastructure/styles/FaceAnalysis.module.css';

const FaceAnalysis = ({ onAnalysisComplete, onClose }: FaceAnalysisProps) => {
  const stressHistory = useSelector(selectStressHistory);
  const { open, setOpen, step, setStep, handleSkip, handleNextStep } = useFaceAnalysisModal(onClose || (() => {}));

  // Check if user has previous check-in history
  const hasHistory = stressHistory && stressHistory.length > 0;

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
                {step === 0 && (hasHistory ? 'Quick Wellness Check-In' : "Let's Make AuraFlow Work Better for You!")}
                {step === 1 && (hasHistory ? 'Checking your current state...' : '3 seconds to calibrate!')}
                {step === 2 && 'All Set!'}
              </h1>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.stepsContainer}>
                <div className={styles.stepsList}>
                  {[0, 1].map((index) => (
                    <div key={index}>{RenderStepIndicator(index, step)}</div>
                  ))}
                </div>

                <div className={styles.stepContent}>
                  {step === 0 && (
                    <div className={styles.introContent}>
                      {hasHistory ? (
                        // Text for returning users
                        <>
                          <p>Welcome back! Time for another quick wellness check-in.</p>
                          <ol>
                            <li>
                              <span>Quick Re-calibration (3 sec):</span> Let's refresh your emotional baseline to keep
                              AuraFlow working perfectly for you.
                            </li>
                            <li>
                              <span>Continuous Care:</span> Your workspace will continue adapting based on your current
                              state.
                            </li>
                            <li>
                              <span>Privacy First:</span> As always, nothing is stored and your privacy remains
                              protected.
                            </li>
                          </ol>
                          <p>Ready for a quick check-in?</p>
                        </>
                      ) : (
                        // Text for first-time users
                        <>
                          <p>To help you stay focused and calm, AuraFlow can adapt to your needs. Here's how:</p>
                          <ol>
                            <li>
                              <span>Quick Calibration (3 sec):</span> We'll take a short video to understand your
                              emotion state
                            </li>
                            <li>
                              <span>Periodic Monitoring:</span> We'll check your emotional state occasionally to keep
                              things personalized (your camera isn't always on).
                            </li>
                            <li>
                              <span>Adapt Just for You:</span> If we sense stress, we'll simplify tasks or suggest
                              breaks.
                            </li>
                          </ol>
                          <p>We never store your video or track what you type. You can adjust settings anytime.</p>
                          <p>Ready to try it?</p>
                        </>
                      )}

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
                          {hasHistory ? "Yes, let's check in!" : "Yes, let's calibrate!"}
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className={styles.detectorContainer}>
                      <p>
                        {hasHistory
                          ? "Just a moment while we check how you're feeling..."
                          : "Stay still — we're snapping your calm vibe!"}
                      </p>
                      <StressDetector
                        onAnalysisComplete={(result) => {
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
