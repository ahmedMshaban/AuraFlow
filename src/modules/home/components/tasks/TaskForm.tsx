import { useForm } from 'react-hook-form';
import { Box, Button, Input, Textarea, VStack, Text, HStack, Field } from '@chakra-ui/react';

import type { TaskFormProps, TaskFormData, CreateTaskData } from '@/shared/types/task.types';
import getTomorrowDate from '../../infrastructure/helpers/getTomorrowDate';

const TaskForm = ({ isOpen, onClose, onSubmit, isLoading = false }: TaskFormProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
    },
  });

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
            Create New Task
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
                min={getTomorrowDate()}
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
                  fontSize: '16px',
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
              colorScheme="blue"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </HStack>
        </form>
      </Box>
    </Box>
  );
};

export default TaskForm;
