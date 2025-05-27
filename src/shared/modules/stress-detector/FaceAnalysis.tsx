import { useState } from 'react';
import { Button, CloseButton, Dialog, Portal, ButtonGroup, Steps } from '@chakra-ui/react';

import StressDetector from './components/StressDetector';
import type { StressAnalysisResult } from './infrastructure/types/FaceExpressions.types';

interface FaceAnalysisProps {
  onAnalysisComplete?: (result: StressAnalysisResult) => void;
}

const FaceAnalysis: React.FC<FaceAnalysisProps> = ({ onAnalysisComplete }) => {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);

  return (
    <Dialog.Root
      lazyMount
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      size={'lg'}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {step === 0 && 'Let’s Make AuraFlow Work Better for You!'}
                {step === 1 && '5 seconds to calibrate!'}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Steps.Root
                step={step}
                onStepChange={(e) => setStep(e.step)}
                count={3}
              >
                <Steps.List>
                  {[0, 1].map((index) => (
                    <Steps.Item
                      key={index}
                      index={index}
                      title={`Step ${index + 1}`}
                    >
                      <Steps.Indicator />
                      <Steps.Title>step {index}</Steps.Title>
                      <Steps.Separator />
                    </Steps.Item>
                  ))}
                </Steps.List>

                {[0, 1, 2].map((index) => (
                  <Steps.Content
                    key={index}
                    index={index}
                  >
                    {/* Introduction Step */}
                    {index === 0 && (
                      <div>
                        <p>To help you stay focused and calm, AuraFlow can adapt to your needs. Here’s how:</p>
                        <br />
                        <br />
                        <ol>
                          <li>
                            <span>Quick Calibration (5 sec):</span>We’ll take a short video to understand your emotion
                            state
                            <br />
                            <br />
                          </li>
                          <li>
                            <span>Gentle Check-ins:</span>Every 30 minutes, we’ll briefly check in (no camera always
                            on!).
                            <br />
                            <br />
                          </li>
                          <li>
                            <span>Adapt Just for You:</span> If we sense stress, we’ll simplify tasks or suggest breaks.
                            <br />
                            <br />
                          </li>
                        </ol>
                        <p>We never store your video or track what you type. You can adjust settings anytime.</p>
                        <br />
                        <br />
                        <p>Ready to try it?</p>

                        <ButtonGroup
                          size="sm"
                          variant="outline"
                        >
                          <Dialog.ActionTrigger asChild>
                            <Button>Skip for now</Button>
                          </Dialog.ActionTrigger>
                          <Steps.NextTrigger asChild>
                            <Button>Yes, let’s calibrate!</Button>
                          </Steps.NextTrigger>
                        </ButtonGroup>
                      </div>
                    )}

                    {index === 1 && (
                      <>
                        <p>Stay still — we’re snapping your calm vibe! </p>{' '}
                        <StressDetector
                          onAnalysisComplete={(result) => {
                            console.log('Analysis complete:', result);
                            // Call the parent callback if provided
                            if (onAnalysisComplete) {
                              onAnalysisComplete(result);
                            }
                            setStep(2);
                          }}
                          currentStep={step}
                        />
                      </>
                    )}

                    {index === 2 && (
                      <div>
                        <p>All set! Your workspace will now adapt to keep you in the zone.</p>
                      </div>
                    )}
                  </Steps.Content>
                ))}
              </Steps.Root>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default FaceAnalysis;
