import { Box, Text, Button, HStack, VStack, Badge } from '@chakra-ui/react';

import type { TaskItemProps } from '@/shared/types/task.types';
import getStatusColor from '../../infrastructure/helpers/getStatusColor';
import getPriorityColor from '../../infrastructure/helpers/getPriorityColor';
import formatTasksDate from '../../infrastructure/helpers/formatTasksDate';

const TaskItem = ({ task, onToggleStatus, onDelete, onEdit }: TaskItemProps) => {
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
              colorPalette={getPriorityColor(task.priority)}
              size="sm"
            >
              {task.priority}
            </Badge>
            <Badge
              colorPalette={getStatusColor(task.status)}
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
            Due: {formatTasksDate(task.dueDate)}
          </Text>

          <HStack gap={2}>
            <Button
              size="sm"
              colorPalette="blue"
              variant="outline"
              onClick={() => onEdit(task)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              colorPalette={task.status === 'completed' ? 'yellow' : 'green'}
              variant="outline"
              onClick={() => onToggleStatus(task.id, task.status)}
            >
              {task.status === 'completed' ? 'Undo' : 'Complete'}
            </Button>
            <Button
              size="sm"
              colorPalette="red"
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
