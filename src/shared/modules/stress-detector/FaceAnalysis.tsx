import { useState } from 'react';
import { Button, CloseButton, Dialog, Portal } from '@chakra-ui/react';

import StressDetector from './components/StressDetector';

const FaceAnalysis = () => {
  const [open, setOpen] = useState(true);

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
              <Dialog.Title>Dialog Title</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <StressDetector
                onAnalysisComplete={(result) => {
                  console.log('Analysis complete:', result);
                }}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button>Save</Button>
            </Dialog.Footer>
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
