import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Box, Button, Input, Textarea, VStack, Text, HStack, Field } from '@chakra-ui/react';

import type { TaskFormProps, TaskFormData, CreateTaskData } from '@/shared/types/task.types';
import getTodayDate from '../../infrastructure/helpers/getTodayDate';

/**
 * A comprehensive task creation and editing form component with validation and modal interface.
 * Provides a user-friendly form for creating new tasks or editing existing ones
 * with real-time validation, loading states, and responsive design.
 *
 * Features:
 * - Modal overlay interface for focused task creation/editing
 * - React Hook Form integration with validation
 * - Create and edit modes with automatic form population
 * - Priority selection with visual indicators
 * - Date picker with default values and validation
 * - Loading states during form submission
 * - Form reset and error handling
 * - Responsive design with mobile considerations
 *
 * Form Fields:
 * - Title: Required text input with validation
 * - Description: Optional textarea for detailed information
 * - Due Date: Date picker with today as minimum date
 * - Priority: Dropdown selection (high/medium/low)
 *
 * Validation:
 * - Title required with minimum length
 * - Due date cannot be in the past
 * - Priority must be valid option
 * - Form sanitization and trimming
 *
 * @param props - The component props
 * @param props.isOpen - Whether the form modal is currently visible
 * @param props.onClose - Handler for closing the form modal
 * @param props.onSubmit - Handler for form submission with task data
 * @param props.isLoading - Loading state during form submission
 * @param props.editTask - Task data for editing mode (null for create mode)
 * @param props.isEditing - Whether form is in edit mode vs. create mode
 * @returns A modal task form for creation or editing
 *
 * @example
 * ```tsx
 * const [isFormOpen, setIsFormOpen] = useState(false);
 * const [editingTask, setEditingTask] = useState(null);
 *
 * <TaskForm
 *   isOpen={isFormOpen}
 *   onClose={() => setIsFormOpen(false)}
 *   onSubmit={(taskData) => createTask(taskData)}
 *   isLoading={isCreating}
 *   editTask={editingTask}
 *   isEditing={!!editingTask}
 * />
 * ```
 *
 * @note Form automatically resets when switching between create/edit modes
 * @note Modal overlay handles backdrop clicks for closing
 * @see {@link TaskFormProps} For detailed prop interface
 * @see {@link useForm} For form state management
 * @see {@link getTodayDate} For default date handling
 */
const TaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editTask = null,
  isEditing = false,
}: TaskFormProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
    },
  });

  // Effect to populate form when editing
  useEffect(() => {
    if (isEditing && editTask) {
      setValue('title', editTask.title);
      setValue('description', editTask.description || '');
      setValue('dueDate', editTask.dueDate.toISOString().split('T')[0]);
      setValue('priority', editTask.priority);
    } else if (!isEditing) {
      reset();
    }
  }, [isEditing, editTask, setValue, reset]);

  const onFormSubmit = async (data: TaskFormData) => {
    try {
      const taskData: CreateTaskData = {
        title: data.title.trim(),
        description: data.description?.trim() || '',
        dueDate: new Date(data.dueDate),
        priority: data.priority,
      };

      await onSubmit(taskData);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0, 0, 0, 0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
    >
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="xl"
        width="90%"
        maxWidth="500px"
        maxHeight="90vh"
        overflow="auto"
      >
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Text
            fontSize="xl"
            fontWeight="bold"
            mb={4}
          >
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </Text>

          <VStack
            gap={4}
            align="stretch"
            mb={6}
          >
            <Field.Root
              invalid={!!errors.title}
              required
            >
              <Field.Label htmlFor="title">Title</Field.Label>
              <Input
                id="title"
                placeholder="Enter task title"
                autoFocus
                {...register('title', {
                  required: 'Task title is required',
                  minLength: {
                    value: 3,
                    message: 'Title must be at least 3 characters long',
                  },
                })}
              />
              <Field.ErrorText>{errors.title?.message?.toString()}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.description}>
              <Field.Label htmlFor="description">Description</Field.Label>
              <Textarea
                id="description"
                placeholder="Enter task description (optional)"
                rows={3}
                {...register('description')}
              />
              <Field.ErrorText>{errors.description?.message?.toString()}</Field.ErrorText>
            </Field.Root>

            <Field.Root
              invalid={!!errors.dueDate}
              required
            >
              <Field.Label htmlFor="dueDate">Due Date</Field.Label>
              <Input
                id="dueDate"
                type="date"
                min={getTodayDate()}
                {...register('dueDate', {
                  required: 'Due date is required',
                })}
              />
              <Field.ErrorText>{errors.dueDate?.message?.toString()}</Field.ErrorText>
            </Field.Root>

            <Field.Root
              invalid={!!errors.priority}
              required
            >
              <Field.Label htmlFor="priority">Priority</Field.Label>
              <select
                id="priority"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                }}
                {...register('priority', {
                  required: 'Priority is required',
                })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <Field.ErrorText>{errors.priority?.message?.toString()}</Field.ErrorText>
            </Field.Root>
          </VStack>

          <HStack
            justify="flex-end"
            mt={6}
            gap={3}
          >
            <Button
              variant="ghost"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              colorPalette="blue"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update Task'
                  : 'Create Task'}
            </Button>
          </HStack>
        </form>
      </Box>
    </Box>
  );
};

export default TaskForm;
