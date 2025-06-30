import { useState } from 'react';

const useFaceAnalysisModal = (onClose: () => void | undefined) => {
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

  return {
    open,
    setOpen,
    step,
    setStep,
    handleNextStep,
    handleSkip,
  };
};

export default useFaceAnalysisModal;
