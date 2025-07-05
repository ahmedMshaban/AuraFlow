import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TaskItem from './TaskItem';
import type { Task, TaskItemProps } from '@/shared/types/task.types';
import type { ReactNode } from 'react';

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <span {...props}>{children}</span>,
  Button: ({
    children,
    onClick,
    size,
    colorScheme,
    variant,
    ...props
  }: {
    children: ReactNode;
    onClick?: () => void;
    size?: string;
    colorScheme?: string;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      data-size={size}
      data-colorscheme={colorScheme}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
  HStack: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <div
      data-testid="hstack"
      {...props}
    >
      {children}
    </div>
  ),
  VStack: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <div
      data-testid="vstack"
      {...props}
    >
      {children}
    </div>
  ),
  Badge: ({
    children,
    colorScheme,
    size,
    ...props
  }: {
    children: ReactNode;
    colorScheme?: string;
    size?: string;
    [key: string]: unknown;
  }) => (
    <span
      data-testid="badge"
      data-colorscheme={colorScheme}
      data-size={size}
      {...props}
    >
      {children}
    </span>
  ),
}));

// Mock helper functions
vi.mock('../../infrastructure/helpers/getStatusColor', () => ({
  default: (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'overdue':
        return 'red';
      case 'pending':
        return 'blue';
      default:
        return 'gray';
    }
  },
}));

vi.mock('../../infrastructure/helpers/getPriorityColor', () => ({
  default: (priority: string) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  },
}));

vi.mock('../../infrastructure/helpers/formatTasksDate', () => ({
  default: (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  },
}));

describe('TaskItem', () => {
  const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-1',
    title: 'Test Task Title',
    description: 'Test task description',
    dueDate: new Date('2025-06-30'),
    status: 'pending',
    priority: 'medium',
    createdAt: new Date('2025-06-26'),
    updatedAt: new Date('2025-06-26'),
    userId: 'user-1',
    ...overrides,
  });

  const defaultProps: TaskItemProps = {
    task: createMockTask(),
    onToggleStatus: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders task with basic information', () => {
    render(<TaskItem {...defaultProps} />);

    expect(screen.getByText('Test Task Title')).toBeDefined();
    expect(screen.getByText('Test task description')).toBeDefined();
    expect(screen.getByText(/Due: Jun 30, 2025/)).toBeDefined();
  });

  it('displays priority and status badges', () => {
    render(<TaskItem {...defaultProps} />);

    const badges = screen.getAllByTestId('badge');
    expect(badges).toHaveLength(2);

    // Check priority badge
    const priorityBadge = badges.find((badge) => badge.textContent === 'medium');
    expect(priorityBadge).toBeDefined();
    expect(priorityBadge?.getAttribute('data-colorscheme')).toBe('yellow');

    // Check status badge
    const statusBadge = badges.find((badge) => badge.textContent === 'pending');
    expect(statusBadge).toBeDefined();
    expect(statusBadge?.getAttribute('data-colorscheme')).toBe('blue');
  });

  it('renders high priority task correctly', () => {
    const highPriorityTask = createMockTask({ priority: 'high' });
    render(
      <TaskItem
        {...defaultProps}
        task={highPriorityTask}
      />,
    );

    const priorityBadge = screen.getAllByTestId('badge').find((badge) => badge.textContent === 'high');
    expect(priorityBadge).toBeDefined();
    expect(priorityBadge?.getAttribute('data-colorscheme')).toBe('red');
  });

  it('renders low priority task correctly', () => {
    const lowPriorityTask = createMockTask({ priority: 'low' });
    render(
      <TaskItem
        {...defaultProps}
        task={lowPriorityTask}
      />,
    );

    const priorityBadge = screen.getAllByTestId('badge').find((badge) => badge.textContent === 'low');
    expect(priorityBadge).toBeDefined();
    expect(priorityBadge?.getAttribute('data-colorscheme')).toBe('green');
  });

  it('renders completed task with appropriate styling', () => {
    const completedTask = createMockTask({ status: 'completed' });
    render(
      <TaskItem
        {...defaultProps}
        task={completedTask}
      />,
    );

    const statusBadge = screen.getAllByTestId('badge').find((badge) => badge.textContent === 'completed');
    expect(statusBadge).toBeDefined();
    expect(statusBadge?.getAttribute('data-colorscheme')).toBe('green');

    // Check that the button text changes to "Undo" for completed tasks
    expect(screen.getByText('Undo')).toBeDefined();
  });

  it('renders overdue task correctly', () => {
    const overdueTask = createMockTask({ status: 'overdue' });
    render(
      <TaskItem
        {...defaultProps}
        task={overdueTask}
      />,
    );

    const statusBadge = screen.getAllByTestId('badge').find((badge) => badge.textContent === 'overdue');
    expect(statusBadge).toBeDefined();
    expect(statusBadge?.getAttribute('data-colorscheme')).toBe('red');
  });

  it('does not render description when not provided', () => {
    const taskWithoutDescription = createMockTask({ description: undefined });
    render(
      <TaskItem
        {...defaultProps}
        task={taskWithoutDescription}
      />,
    );

    expect(screen.getByText('Test Task Title')).toBeDefined();
    expect(screen.queryByText('Test task description')).toBeNull();
  });

  it('renders empty description correctly', () => {
    const taskWithEmptyDescription = createMockTask({ description: '' });
    render(
      <TaskItem
        {...defaultProps}
        task={taskWithEmptyDescription}
      />,
    );

    expect(screen.getByText('Test Task Title')).toBeDefined();
    expect(screen.queryByText('Test task description')).toBeNull();
  });

  it('calls onToggleStatus when Complete button is clicked', () => {
    const mockOnToggleStatus = vi.fn();
    render(
      <TaskItem
        {...defaultProps}
        onToggleStatus={mockOnToggleStatus}
      />,
    );

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    expect(mockOnToggleStatus).toHaveBeenCalledTimes(1);
    expect(mockOnToggleStatus).toHaveBeenCalledWith('task-1', 'pending');
  });

  it('calls onToggleStatus when Undo button is clicked for completed task', () => {
    const mockOnToggleStatus = vi.fn();
    const completedTask = createMockTask({ status: 'completed' });

    render(
      <TaskItem
        {...defaultProps}
        task={completedTask}
        onToggleStatus={mockOnToggleStatus}
      />,
    );

    const undoButton = screen.getByText('Undo');
    fireEvent.click(undoButton);

    expect(mockOnToggleStatus).toHaveBeenCalledTimes(1);
    expect(mockOnToggleStatus).toHaveBeenCalledWith('task-1', 'completed');
  });

  it('calls onDelete when Delete button is clicked', () => {
    const mockOnDelete = vi.fn();
    render(
      <TaskItem
        {...defaultProps}
        onDelete={mockOnDelete}
      />,
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('task-1');
  });

  it('renders action buttons with correct styling', () => {
    render(<TaskItem {...defaultProps} />);

    // Complete button
    const completeButton = screen.getByText('Complete');
    expect(completeButton.getAttribute('data-size')).toBe('sm');
    expect(completeButton.getAttribute('data-colorscheme')).toBe('green');
    expect(completeButton.getAttribute('data-variant')).toBe('outline');

    // Delete button
    const deleteButton = screen.getByText('Delete');
    expect(deleteButton.getAttribute('data-size')).toBe('sm');
    expect(deleteButton.getAttribute('data-colorscheme')).toBe('red');
    expect(deleteButton.getAttribute('data-variant')).toBe('outline');
  });

  it('renders undo button with correct styling for completed task', () => {
    const completedTask = createMockTask({ status: 'completed' });
    render(
      <TaskItem
        {...defaultProps}
        task={completedTask}
      />,
    );

    const undoButton = screen.getByText('Undo');
    expect(undoButton.getAttribute('data-size')).toBe('sm');
    expect(undoButton.getAttribute('data-colorscheme')).toBe('yellow');
    expect(undoButton.getAttribute('data-variant')).toBe('outline');
  });

  it('formats due date correctly', () => {
    const taskWithSpecificDate = createMockTask({ dueDate: new Date('2025-12-25') });
    render(
      <TaskItem
        {...defaultProps}
        task={taskWithSpecificDate}
      />,
    );

    expect(screen.getByText(/Due: Dec 25, 2025/)).toBeDefined();
  });

  it('handles tasks with long titles', () => {
    const taskWithLongTitle = createMockTask({
      title:
        'This is a very long task title that should be displayed properly in the component even when it contains many words',
    });
    render(
      <TaskItem
        {...defaultProps}
        task={taskWithLongTitle}
      />,
    );

    expect(
      screen.getByText(
        'This is a very long task title that should be displayed properly in the component even when it contains many words',
      ),
    ).toBeDefined();
  });

  it('handles tasks with long descriptions', () => {
    const taskWithLongDescription = createMockTask({
      description:
        'This is a very long task description that contains multiple sentences and should be displayed properly. It should wrap appropriately and maintain readability even with extensive content.',
    });
    render(
      <TaskItem
        {...defaultProps}
        task={taskWithLongDescription}
      />,
    );

    expect(
      screen.getByText(
        'This is a very long task description that contains multiple sentences and should be displayed properly. It should wrap appropriately and maintain readability even with extensive content.',
      ),
    ).toBeDefined();
  });

  it('renders without crashing when all props are provided', () => {
    const complexTask = createMockTask({
      title: 'Complex Task',
      description: 'Complex description with multiple lines\nand special characters!@#$%',
      status: 'overdue',
      priority: 'high',
      dueDate: new Date('2025-01-01'),
    });

    const props: TaskItemProps = {
      task: complexTask,
      onToggleStatus: vi.fn(),
      onDelete: vi.fn(),
      onEdit: vi.fn(),
    };

    expect(() => render(<TaskItem {...props} />)).not.toThrow();
  });

  it('maintains task ID consistency in callbacks', () => {
    const mockOnToggleStatus = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnEdit = vi.fn();
    const customTask = createMockTask({ id: 'custom-task-id-123' });

    render(
      <TaskItem
        task={customTask}
        onToggleStatus={mockOnToggleStatus}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    );

    const completeButton = screen.getByText('Complete');
    const deleteButton = screen.getByText('Delete');

    fireEvent.click(completeButton);
    fireEvent.click(deleteButton);

    expect(mockOnToggleStatus).toHaveBeenCalledWith('custom-task-id-123', 'pending');
    expect(mockOnDelete).toHaveBeenCalledWith('custom-task-id-123');
  });

  it('displays all task statuses correctly', () => {
    const testStatuses: Array<{ status: 'pending' | 'completed' | 'overdue'; expectedColor: string }> = [
      { status: 'pending', expectedColor: 'blue' },
      { status: 'completed', expectedColor: 'green' },
      { status: 'overdue', expectedColor: 'red' },
    ];

    testStatuses.forEach(({ status, expectedColor }) => {
      const task = createMockTask({ status });
      const { unmount } = render(
        <TaskItem
          {...defaultProps}
          task={task}
        />,
      );

      const statusBadge = screen.getAllByTestId('badge').find((badge) => badge.textContent === status);
      expect(statusBadge).toBeDefined();
      expect(statusBadge?.getAttribute('data-colorscheme')).toBe(expectedColor);

      unmount();
    });
  });

  it('displays all task priorities correctly', () => {
    const testPriorities: Array<{ priority: 'low' | 'medium' | 'high'; expectedColor: string }> = [
      { priority: 'low', expectedColor: 'green' },
      { priority: 'medium', expectedColor: 'yellow' },
      { priority: 'high', expectedColor: 'red' },
    ];

    testPriorities.forEach(({ priority, expectedColor }) => {
      const task = createMockTask({ priority });
      const { unmount } = render(
        <TaskItem
          {...defaultProps}
          task={task}
        />,
      );

      const priorityBadge = screen.getAllByTestId('badge').find((badge) => badge.textContent === priority);
      expect(priorityBadge).toBeDefined();
      expect(priorityBadge?.getAttribute('data-colorscheme')).toBe(expectedColor);

      unmount();
    });
  });

  describe('Edit functionality', () => {
    it('renders edit button', () => {
      render(<TaskItem {...defaultProps} />);

      expect(screen.getByText('Edit')).toBeDefined();
    });

    it('calls onEdit with task when edit button is clicked', () => {
      const mockOnEdit = vi.fn();
      const task = createMockTask({ id: 'edit-test-task' });

      render(
        <TaskItem
          {...defaultProps}
          task={task}
          onEdit={mockOnEdit}
        />,
      );

      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(task);
    });

    it('edit button has correct styling', () => {
      render(<TaskItem {...defaultProps} />);

      const editButton = screen.getByText('Edit');
      expect(editButton.getAttribute('data-size')).toBe('sm');
      expect(editButton.getAttribute('data-variant')).toBe('outline');
      expect(editButton.getAttribute('data-colorscheme')).toBe('blue');
    });
  });
});
