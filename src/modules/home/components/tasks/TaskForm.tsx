import { Box, Button, Input, Textarea, VStack, Text, HStack } from '@chakra-ui/react';

import type { TaskFormProps } from '@/shared/types/task.types';
import useTaskForm from '../../infrastructure/hooks/useTaskForm';
import getTomorrowDate from '../../infrastructure/helpers/getTomorrowDate';

const TaskForm = ({ isOpen, onClose, onSubmit, isLoading = false }: TaskFormProps) => {
  const { formData, errors, handleInputChange, handleSubmit, handleClose } = useTaskForm(onSubmit, onClose);

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
        <form onSubmit={handleSubmit}>
          <Text
            fontSize="xl"
            fontWeight="bold"
            mb={4}
          >
            Create New Task
          </Text>

          {errors.length > 0 && (
            <Box
              mb={4}
              p={3}
              bg="red.50"
              borderRadius="md"
              border="1px solid"
              borderColor="red.200"
            >
              {errors.map((error, index) => (
                <Text
                  key={index}
                  color="red.600"
                  fontSize="sm"
                >
                  {error}
                </Text>
              ))}
            </Box>
          )}

          <VStack
            gap={4}
            align="stretch"
          >
            <Box>
              <Text
                mb={2}
                fontWeight="medium"
              >
                Title *
              </Text>
              <Input
                placeholder="Enter task title"
                value={formData.title}
                onChange={handleInputChange('title')}
                autoFocus
              />
            </Box>

            <Box>
              <Text
                mb={2}
                fontWeight="medium"
              >
                Description
              </Text>
              <Textarea
                placeholder="Enter task description (optional)"
                value={formData.description}
                onChange={handleInputChange('description')}
                rows={3}
              />
            </Box>

            <Box>
              <Text
                mb={2}
                fontWeight="medium"
              >
                Due Date *
              </Text>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange('dueDate')}
                min={getTomorrowDate()}
              />
            </Box>

            <Box>
              <Text
                mb={2}
                fontWeight="medium"
              >
                Priority *
              </Text>
              <select
                value={formData.priority}
                onChange={handleInputChange('priority')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '16px',
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Box>
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
              loading={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </HStack>
        </form>
      </Box>
    </Box>
  );
};

export default TaskForm;
