import { Dialog, Portal } from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import styles from '../infrastructure/styles/Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  return (
    <Dialog.Root
      lazyMount
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) {
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop className={styles.modalBackdrop} />
        <Dialog.Positioner className={styles.modalPositioner}>
          <Dialog.Content className={`${styles.modalContent} ${styles[size]}`}>
            <div className={styles.modalHeader}>
              <Dialog.Title className={styles.modalTitle}>{title}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <button
                  className={styles.closeButton}
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
              </Dialog.CloseTrigger>
            </div>
            <div className={styles.modalBody}>{children}</div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default Modal;
