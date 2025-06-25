import React from 'react';
import { Box, Text, Button, HStack, VStack, Badge } from '@chakra-ui/react';
import type { Task } from '../../infrastructure/types/task.types';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (taskId: string, currentStatus: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleStatus, onDelete }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getPriorityColor = (priority: string) => {
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
  };

  const getStatusColor = (status: string) => {
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
  };

  return (
    <Box
      p={4}
      bg="white"
      borderRadius="md"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.200"
      _hover={{ boxShadow: 'md' }}
      transition="all 0.2s"
    >
      <VStack
        align="stretch"
        gap={3}
      >
        <HStack justify="space-between">
          <Text
            fontWeight="semibold"
            fontSize="md"
            textDecoration={task.status === 'completed' ? 'line-through' : 'none'}
            opacity={task.status === 'completed' ? 0.7 : 1}
          >
            {task.title}
          </Text>
          <HStack gap={2}>
            <Badge
              colorScheme={getPriorityColor(task.priority)}
              size="sm"
            >
              {task.priority}
            </Badge>
            <Badge
              colorScheme={getStatusColor(task.status)}
              size="sm"
            >
              {task.status}
            </Badge>
          </HStack>
        </HStack>

        {task.description && (
          <Text
            fontSize="sm"
            color="gray.600"
            textDecoration={task.status === 'completed' ? 'line-through' : 'none'}
            opacity={task.status === 'completed' ? 0.7 : 1}
          >
            {task.description}
          </Text>
        )}

        <HStack
          justify="space-between"
          align="center"
        >
          <Text
            fontSize="sm"
            color="gray.500"
          >
            Due: {formatDate(task.dueDate)}
          </Text>

          <HStack gap={2}>
            <Button
              size="sm"
              colorScheme={task.status === 'completed' ? 'yellow' : 'green'}
              variant="outline"
              onClick={() => onToggleStatus(task.id, task.status)}
            >
              {task.status === 'completed' ? 'Undo' : 'Complete'}
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </Button>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export default TaskItem;
