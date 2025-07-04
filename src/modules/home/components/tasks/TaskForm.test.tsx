import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import TaskForm from './TaskForm';
import type { TaskFormProps, CreateTaskData } from '@/shared/types/task.types';
import type { ReactNode } from 'react';

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
}));

// Import the mocked useForm
import { useForm } from 'react-hook-form';

// Get reference to the mocked function
const mockUseForm = vi.mocked(useForm);

// Create individual mock functions
const mockRegister = vi.fn();
const mockHandleSubmit = vi.fn();
const mockReset = vi.fn();

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  Button: ({
    children,
    onClick,
    type,
    colorScheme,
    variant,
    disabled,
    ...props
  }: {
    children: ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    colorScheme?: string;
    variant?: string;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      data-colorscheme={colorScheme}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
  Input: (props: React.InputHTMLAttributes<HTMLInputElement> & { autoFocus?: boolean }) => (
    <input
      {...props}
      autoFocus={props.autoFocus}
    />
  ),
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
  VStack: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <div
      data-testid="vstack"
      {...props}
    >
      {children}
    </div>
  ),
  Text: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <span {...props}>{children}</span>,
  HStack: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <div
      data-testid="hstack"
      {...props}
    >
      {children}
    </div>
  ),
  Field: {
    Root: ({ children, invalid, required }: { children: ReactNode; invalid?: boolean; required?: boolean }) => (
      <div
        data-invalid={invalid}
        data-required={required}
      >
        {children}
      </div>
    ),
    Label: ({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) => (
      <label htmlFor={htmlFor}>{children}</label>
    ),
    ErrorText: ({ children }: { children?: ReactNode }) => (children ? <span role="alert">{children}</span> : null),
  },
}));

// Mock the helper function
vi.mock('../../infrastructure/helpers/getTodayDate', () => ({
  default: () => '2025-06-26', // Mock today's date
}));

describe('TaskForm', () => {
  const defaultProps: TaskFormProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    mockUseForm.mockReturnValue({
      handleSubmit: mockHandleSubmit,
      register: mockRegister,
      formState: {
        errors: {},
        isSubmitting: false,
      } as never,
      reset: mockReset,
    } as never);

    // Reset react-hook-form mocks
    mockRegister.mockImplementation((name: string) => ({
      name,
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    }));

    mockHandleSubmit.mockImplementation((fn: (data: unknown) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      fn({
        title: 'Test Task',
        description: 'Test Description',
        dueDate: '2025-06-26',
        priority: 'medium',
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders form when isOpen is true', () => {
    render(<TaskForm {...defaultProps} />);

    expect(screen.getByText('Create New Task')).toBeDefined();
    expect(screen.getByLabelText('Title')).toBeDefined();
    expect(screen.getByLabelText('Description')).toBeDefined();
    expect(screen.getByLabelText('Due Date')).toBeDefined();
    expect(screen.getByLabelText('Priority')).toBeDefined();
    expect(screen.getByRole('button', { name: /create task/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined();
  });

  it('does not render when isOpen is false', () => {
    render(
      <TaskForm
        {...defaultProps}
        isOpen={false}
      />,
    );

    expect(screen.queryByText('Create New Task')).toBeNull();
  });

  it('displays all form fields with correct properties', () => {
    render(<TaskForm {...defaultProps} />);

    // Title field
    const titleInput = screen.getByLabelText('Title');
    expect(titleInput).toBeDefined();
    expect(titleInput.getAttribute('placeholder')).toBe('Enter task title');

    // Description field
    const descriptionInput = screen.getByLabelText('Description');
    expect(descriptionInput).toBeDefined();
    expect(descriptionInput.getAttribute('placeholder')).toBe('Enter task description (optional)');
    expect(descriptionInput.getAttribute('rows')).toBe('3');

    // Due date field
    const dueDateInput = screen.getByLabelText('Due Date');
    expect(dueDateInput).toBeDefined();
    expect(dueDateInput.getAttribute('type')).toBe('date');
    expect(dueDateInput.getAttribute('min')).toBe('2025-06-26');

    // Priority field
    const prioritySelect = screen.getByLabelText('Priority');
    expect(prioritySelect).toBeDefined();
    expect(prioritySelect.tagName).toBe('SELECT');
  });

  it('displays priority options correctly', () => {
    render(<TaskForm {...defaultProps} />);

    const prioritySelect = screen.getByLabelText('Priority');
    const options = prioritySelect.querySelectorAll('option');

    expect(options).toHaveLength(3);
    expect(options[0].textContent).toBe('Low');
    expect(options[0].getAttribute('value')).toBe('low');
    expect(options[1].textContent).toBe('Medium');
    expect(options[1].getAttribute('value')).toBe('medium');
    expect(options[2].textContent).toBe('High');
    expect(options[2].getAttribute('value')).toBe('high');
  });

  it('calls onClose when cancel button is clicked', async () => {
    const mockOnClose = vi.fn();
    render(
      <TaskForm
        {...defaultProps}
        onClose={mockOnClose}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit with correct data when form is submitted', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    const mockOnClose = vi.fn();

    render(
      <TaskForm
        {...defaultProps}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />,
    );

    const form = screen.getByText('Create New Task').closest('form');
    expect(form).toBeDefined();

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    // Verify the data structure passed to onSubmit
    const expectedData: CreateTaskData = {
      title: 'Test Task',
      description: 'Test Description',
      dueDate: new Date('2025-06-26'),
      priority: 'medium',
    };

    expect(mockOnSubmit).toHaveBeenCalledWith(expectedData);
    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <TaskForm
        {...defaultProps}
        isLoading={true}
      />,
    );

    const submitButton = screen.getByRole('button', { name: /creating/i });
    expect(submitButton).toBeDefined();
    expect(submitButton).toHaveProperty('disabled', true);
    expect(screen.getByText('Creating...')).toBeDefined();
  });

  it('shows loading state when form is submitting', () => {
    // Mock form state to show submitting
    mockUseForm.mockReturnValue({
      handleSubmit: mockHandleSubmit,
      register: mockRegister,
      formState: {
        errors: {},
        isSubmitting: true,
      } as never,
      reset: mockReset,
    } as never);

    render(<TaskForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /creating/i });
    expect(submitButton).toBeDefined();
    expect(submitButton).toHaveProperty('disabled', true);
  });

  it('displays form validation errors', () => {
    // Mock form state with errors
    mockUseForm.mockReturnValue({
      handleSubmit: mockHandleSubmit,
      register: mockRegister,
      formState: {
        errors: {
          title: { message: 'Task title is required' } as never,
          dueDate: { message: 'Due date is required' } as never,
        },
        isSubmitting: false,
      } as never,
      reset: mockReset,
    } as never);

    render(<TaskForm {...defaultProps} />);

    expect(screen.getByText('Task title is required')).toBeDefined();
    expect(screen.getByText('Due date is required')).toBeDefined();
  });

  it('handles form submission error gracefully', async () => {
    const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TaskForm
        {...defaultProps}
        onSubmit={mockOnSubmit}
      />,
    );

    const form = screen.getByText('Create New Task').closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to create task:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('registers form fields with correct validation rules', () => {
    render(<TaskForm {...defaultProps} />);

    // Check that register was called with correct validation for title
    expect(mockRegister).toHaveBeenCalledWith('title', {
      required: 'Task title is required',
      minLength: {
        value: 3,
        message: 'Title must be at least 3 characters long',
      },
    });

    // Check that register was called for description (optional)
    expect(mockRegister).toHaveBeenCalledWith('description');

    // Check that register was called with correct validation for dueDate
    expect(mockRegister).toHaveBeenCalledWith('dueDate', {
      required: 'Due date is required',
    });

    // Check that register was called with correct validation for priority
    expect(mockRegister).toHaveBeenCalledWith('priority', {
      required: 'Priority is required',
    });
  });

  it('trims title and description before submission', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    // Mock handleSubmit to return data with whitespace
    mockHandleSubmit.mockImplementation((fn: (data: unknown) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      fn({
        title: '  Test Task  ',
        description: '  Test Description  ',
        dueDate: '2025-06-26',
        priority: 'high',
      });
    });

    render(
      <TaskForm
        {...defaultProps}
        onSubmit={mockOnSubmit}
      />,
    );

    const form = screen.getByText('Create New Task').closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    // Verify trimmed data
    const expectedData: CreateTaskData = {
      title: 'Test Task',
      description: 'Test Description',
      dueDate: new Date('2025-06-26'),
      priority: 'high',
    };

    expect(mockOnSubmit).toHaveBeenCalledWith(expectedData);
  });

  it('handles empty description correctly', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    // Mock handleSubmit to return data with empty description
    mockHandleSubmit.mockImplementation((fn: (data: unknown) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      fn({
        title: 'Test Task',
        description: '',
        dueDate: '2025-06-26',
        priority: 'low',
      });
    });

    render(
      <TaskForm
        {...defaultProps}
        onSubmit={mockOnSubmit}
      />,
    );

    const form = screen.getByText('Create New Task').closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    // Verify empty description becomes empty string
    const expectedData: CreateTaskData = {
      title: 'Test Task',
      description: '',
      dueDate: new Date('2025-06-26'),
      priority: 'low',
    };

    expect(mockOnSubmit).toHaveBeenCalledWith(expectedData);
  });

  it('renders with modal-like styling', () => {
    const { container } = render(<TaskForm {...defaultProps} />);

    // Check for modal overlay (since we're mocking Chakra UI, we can't test actual styles)
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toBeDefined();

    // Check that the modal structure is rendered correctly
    const modalContent = overlay.firstChild as HTMLElement;
    expect(modalContent).toBeDefined();

    // Check that the form is inside the modal
    const form = container.querySelector('form');
    expect(form).toBeDefined();
  });

  it('renders without crashing when all props are provided', () => {
    const props: TaskFormProps = {
      isOpen: true,
      onClose: vi.fn(),
      onSubmit: vi.fn(),
      isLoading: true,
    };

    expect(() => render(<TaskForm {...props} />)).not.toThrow();
  });
});
