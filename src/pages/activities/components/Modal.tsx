import { Dialog, Portal } from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import styles from '../infrastructure/styles/Modal.module.css';

/**
 * Props for the Modal component.
 */
interface ModalProps {
  /** Whether the modal is currently open/visible */
  isOpen: boolean;
  /** Callback function triggered when the modal should close */
  onClose: () => void;
  /** Title text displayed in the modal header */
  title: string;
  /** Content to be rendered inside the modal body */
  children: React.ReactNode;
  /** Size variant of the modal affecting width and height */
  size?: 'small' | 'medium' | 'large';
}

/**
 * A reusable modal component built on Chakra UI's Dialog system.
 * Provides a centered overlay interface for displaying activities, forms,
 * or other interactive content with proper accessibility features.
 *
 * Features:
 * - Accessible dialog implementation with ARIA attributes
 * - Backdrop click and escape key closing
 * - Multiple size variants for different content types
 * - Portal rendering for proper z-index layering
 * - Lazy mounting for performance optimization
 * - Customizable header with close button
 *
 * @param props - The component props
 * @param props.isOpen - Controls modal visibility state
 * @param props.onClose - Handler for closing the modal (ESC, backdrop, X button)
 * @param props.title - Header title text
 * @param props.children - Modal content to be displayed
 * @param props.size - Size variant ('small', 'medium', 'large')
 * @returns A styled modal dialog component
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Activity Details"
 *   size="large"
 * >
 *   <ActivityComponent />
 * </Modal>
 * ```
 *
 * @note Uses Chakra UI Dialog for accessibility and keyboard navigation
 * @note Automatically handles focus management and scroll locking
 * @see {@link Dialog} From Chakra UI for underlying dialog functionality
 */
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
