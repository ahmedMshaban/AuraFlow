import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Modal from './Modal';
import type { ReactNode } from 'react';

// Mock Chakra UI components
let mockOnClose: (() => void) | undefined;

vi.mock('@chakra-ui/react', () => ({
  Dialog: {
    Root: ({
      open,
      children,
      onOpenChange,
    }: {
      open: boolean;
      children: ReactNode;
      onOpenChange: (details: { open: boolean }) => void;
    }) => {
      // Store the onOpenChange callback so we can call it from CloseTrigger
      if (onOpenChange) {
        mockOnClose = () => onOpenChange({ open: false });
      }
      return open ? <div data-testid="dialog-root">{children}</div> : null;
    },
    Backdrop: ({ children }: { children: ReactNode }) => <div data-testid="dialog-backdrop">{children}</div>,
    Positioner: ({ children }: { children: ReactNode }) => <div data-testid="dialog-positioner">{children}</div>,
    Content: ({ children }: { children: ReactNode }) => <div data-testid="dialog-content">{children}</div>,
    Title: ({ children }: { children: ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
    CloseTrigger: ({ children }: { children: ReactNode }) => (
      <div
        data-testid="dialog-close-trigger"
        onClick={() => {
          // Call the stored onOpenChange callback to simulate closing
          if (mockOnClose) {
            mockOnClose();
          }
        }}
      >
        {children}
      </div>
    ),
  },
  Portal: ({ children }: { children: ReactNode }) => <div data-testid="portal">{children}</div>,
}));

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaTimes: () => <svg data-testid="close-icon" />,
}));

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div data-testid="modal-content">Modal Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByTestId('dialog-root')).toBeDefined();
    expect(screen.getByText('Test Modal')).toBeDefined();
    expect(screen.getByTestId('modal-content')).toBeDefined();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal
        {...defaultProps}
        isOpen={false}
      />,
    );

    expect(screen.queryByTestId('dialog-root')).toBeNull();
    expect(screen.queryByText('Test Modal')).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <Modal
        {...defaultProps}
        onClose={mockOnClose}
      />,
    );

    const closeButton = screen.getByTestId('dialog-close-trigger');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <Modal
        {...defaultProps}
        size="small"
      />,
    );
    expect(screen.getByTestId('dialog-content')).toBeDefined();

    rerender(
      <Modal
        {...defaultProps}
        size="medium"
      />,
    );
    expect(screen.getByTestId('dialog-content')).toBeDefined();

    rerender(
      <Modal
        {...defaultProps}
        size="large"
      />,
    );
    expect(screen.getByTestId('dialog-content')).toBeDefined();
  });

  it('renders with default size when size is not specified', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByTestId('dialog-content')).toBeDefined();
  });

  it('renders title correctly', () => {
    render(
      <Modal
        {...defaultProps}
        title="Custom Title"
      />,
    );

    expect(screen.getByText('Custom Title')).toBeDefined();
  });

  it('renders children content correctly', () => {
    const customContent = <div data-testid="custom-content">Custom Content</div>;
    render(<Modal {...defaultProps}>{customContent}</Modal>);

    expect(screen.getByTestId('custom-content')).toBeDefined();
    expect(screen.getByText('Custom Content')).toBeDefined();
  });

  it('renders backdrop and positioner', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByTestId('dialog-backdrop')).toBeDefined();
    expect(screen.getByTestId('dialog-positioner')).toBeDefined();
  });

  it('renders inside a portal', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByTestId('portal')).toBeDefined();
  });

  it('has proper structure with header, body, and close button', () => {
    render(<Modal {...defaultProps} />);

    // Check header
    expect(screen.getByText('Test Modal')).toBeDefined();

    // Check close button
    expect(screen.getByTestId('close-icon')).toBeDefined();

    // Check content
    expect(screen.getByTestId('modal-content')).toBeDefined();
  });

  it('handles complex children content', () => {
    const complexContent = (
      <div>
        <h2>Complex Content</h2>
        <p>This is a paragraph</p>
        <button>Action Button</button>
      </div>
    );

    render(<Modal {...defaultProps}>{complexContent}</Modal>);

    expect(screen.getByText('Complex Content')).toBeDefined();
    expect(screen.getByText('This is a paragraph')).toBeDefined();
    expect(screen.getByText('Action Button')).toBeDefined();
  });
});
