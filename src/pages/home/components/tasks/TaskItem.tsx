import { Box, Text, Button, HStack, VStack, Badge } from '@chakra-ui/react';

import type { TaskItemProps } from '@/shared/types/task.types';
import getStatusColor from '../../infrastructure/helpers/getStatusColor';
import getPriorityColor from '../../infrastructure/helpers/getPriorityColor';
import formatTasksDate from '../../infrastructure/helpers/formatTasksDate';

/**
 * An individual task display component with comprehensive management controls and visual indicators.
 * Provides interactive task management with priority/status badges, completion toggling,
 * and editing capabilities in a user-friendly card layout.
 *
 * Features:
 * - Color-coded priority and status badges for quick identification
 * - Interactive completion toggling with visual state changes
 * - Task editing and deletion controls
 * - Responsive date formatting with due date display
 * - Visual feedback for completed tasks (strikethrough, opacity)
 * - Hover effects and smooth transitions
 * - Accessible button controls with clear labeling
 *
 * Visual States:
 * - Active tasks: Full opacity, normal text decoration
 * - Completed tasks: Reduced opacity, strikethrough text
 * - Priority badges: Color-coded (red/yellow/green) for urgency
 * - Status badges: Color-coded status indication
 * - Hover effects: Enhanced shadow and visual feedback
 *
 * Task Management:
 * - Toggle completion status with appropriate button text
 * - Edit task details via callback handler
 * - Delete task with confirmation workflow
 * - Due date display with relative formatting
 * - Priority and status visual indicators
 *
 * @param props - The component props
 * @param props.task - Task data object with all task properties
 * @param props.onToggleStatus - Handler for toggling task completion status
 * @param props.onDelete - Handler for deleting the task
 * @param props.onEdit - Handler for editing task details
 * @returns An interactive task item with management controls
 *
 * @example
 * ```tsx
 * const task = {
 *   id: '1',
 *   title: 'Review project proposal',
 *   description: 'Go through the Q3 proposal...',
 *   priority: 'high',
 *   status: 'pending',
 *   dueDate: new Date('2025-07-15')
 * };
 *
 * <TaskItem
 *   task={task}
 *   onToggleStatus={(id, status) => updateTaskStatus(id, status)}
 *   onDelete={(id) => deleteTask(id)}
 *   onEdit={(task) => openEditModal(task)}
 * />
 * ```
 *
 * @note Component provides visual feedback for completed vs. active tasks
 * @note All interactions are handled via callback props for flexibility
 * @see {@link TaskItemProps} For detailed prop interface
 * @see {@link getStatusColor} For status-based color coding
 * @see {@link getPriorityColor} For priority-based color coding
 * @see {@link formatTasksDate} For due date formatting
 */
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
