import { useState } from 'react';
import { Box, Button, VStack, HStack, Text, Spinner } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';

import type { TasksProps, Task, CreateTaskData } from '@/shared/types/task.types';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import getTabsForMode from '../../infrastructure/helpers/getTasksTabsForMode';
import { getFilterDescription } from '../../infrastructure/helpers/getFilterDescription';

/**
 * A comprehensive task management component with stress-adaptive behavior and intelligent organization.
 * Provides tabbed interface for different task categories, CRUD operations, and wellness-focused
 * task management with stress-responsive features.
 *
 * Key Features:
 * - Stress-adaptive tab organization and priorities
 * - Tabbed interface for different task categories (upcoming, overdue, completed)
 * - Full CRUD operations (create, read, update, delete)
 * - Modal-based task creation and editing
 * - Task status toggling with visual feedback
 * - Home page vs. full page modes with different limits
 * - Time-based filtering integration
 * - Loading states and error handling
 *
 * Stress-Adaptive Behavior:
 * - When stressed: Prioritizes manageable tasks, shows priority tab
 * - When calm: Shows all task categories with full productivity features
 * - Tab organization adapts based on stress level and task distribution
 * - Messaging emphasizes wellbeing over pure productivity
 * - Task recommendations adapt to stress state
 *
 * Task Organization:
 * - Upcoming: Tasks due soon, organized by priority
 * - Overdue: Past due tasks requiring attention
 * - Completed: Finished tasks for progress tracking
 * - Priority: High-priority tasks when stress detected
 * - Adaptive tab visibility based on task counts and stress
 *
 * @param props - The component props
 * @param props.upcomingTasks - Array of upcoming/pending tasks
 * @param props.overdueTasks - Array of overdue tasks
 * @param props.completedTasks - Array of completed tasks
 * @param props.taskStats - Task statistics for tab organization
 * @param props.isLoading - Loading state for task operations
 * @param props.error - Error state for task operations
 * @param props.createTask - Handler for creating new tasks
 * @param props.updateTask - Handler for updating existing tasks
 * @param props.deleteTask - Handler for deleting tasks
 * @param props.toggleTaskStatus - Handler for toggling task completion
 * @param props.isCreating - Loading state for task creation
 * @param props.isCurrentlyStressed - Current user stress state
 * @param props.isHomePage - Whether displayed on home page (affects limits)
 * @param props.currentView - Current time-based filter view
 * @returns A complete task management interface
 *
 * @example
 * ```tsx
 * const taskProps = {
 *   upcomingTasks: tasks.filter(t => t.status === 'pending'),
 *   overdueTasks: tasks.filter(t => isOverdue(t)),
 *   completedTasks: tasks.filter(t => t.status === 'completed'),
 *   // ... other task hook props
 * };
 *
 * <Tasks {...taskProps} />
 * ```
 *
 * @note Component adapts its interface based on stress levels for better UX
 * @note Integrates with time-based filtering for contextual task management
 * @see {@link TasksProps} For detailed prop interface
 * @see {@link useTasks} For task management functionality
 * @see {@link getTabsForMode} For stress-adaptive tab organization
 */
const Tasks = ({
  upcomingTasks,
  overdueTasks,
  completedTasks,
  taskStats,
  isLoading,
  error,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  isCreating,
  isCurrentlyStressed,
  isHomePage = true, // Default to home page mode
  currentView = 'my-day', // Default to day view
}: TasksProps) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'completed' | 'priority'>('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const tabs = getTabsForMode(upcomingTasks, overdueTasks, completedTasks, taskStats, isCurrentlyStressed, isHomePage);

  // Handler for opening edit modal
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Handler for closing modal and resetting edit state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingTask(null);
  };

  // Handler for submitting task (create or update)
  const handleSubmitTask = async (data: CreateTaskData) => {
    if (isEditing && editingTask) {
      // Update existing task
      await updateTask(editingTask.id, data);
    } else {
      // Create new task
      await createTask(data);
    }
    handleCloseModal();
  };

  // Reset active tab if it doesn't exist in current mode
  const validTab = tabs.find((tab) => tab.key === activeTab);
  if (!validTab && tabs.length > 0) {
    setActiveTab(tabs[0].key);
  }

  if (isLoading) {
    return (
      <VStack
        gap={4}
        py={8}
      >
        <Spinner
          size="lg"
          color="blue.500"
        />
        <Text color="gray.500">Loading your tasks...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Box
        p={4}
        bg="red.50"
        borderRadius="md"
        border="1px solid"
        borderColor="red.200"
      >
        <Text color="red.600">{error}</Text>
      </Box>
    );
  }

  const currentTab = tabs.find((tab) => tab.key === activeTab) || tabs[0];

  return (
    <Box
      w="100%"
      h="100%"
    >
      {/* Tab Navigation */}
      <VStack
        gap={3}
        mb={4}
      >
        {/* Stress Mode Helper Text */}
        {isCurrentlyStressed && (
          <Box
            p={3}
            bg="orange.50"
            borderRadius="md"
            border="1px solid"
            borderColor="orange.200"
            w="100%"
          >
            <Text
              fontSize="sm"
              color="orange.700"
              textAlign="center"
            >
              🧘‍♀️ Focus Mode: Showing overdue tasks + high-priority upcoming tasks only
            </Text>
          </Box>
        )}

        <HStack
          gap={2}
          w="100%"
        >
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              size="sm"
              variant={activeTab === tab.key ? 'solid' : 'outline'}
              colorPalette={tab.color}
              onClick={() => setActiveTab(tab.key)}
              title={tab.description}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
          <Button
            colorPalette="blue"
            size="sm"
            ml="auto"
            onClick={() => setIsModalOpen(true)}
          >
            + New Task
          </Button>
        </HStack>
      </VStack>

      {/* Task List */}
      <Box>
        <VStack
          gap={3}
          align="stretch"
        >
          {currentTab.tasks.length === 0 ? (
            <Box
              textAlign="center"
              py={8}
            >
              {isCurrentlyStressed ? (
                <Text color="green.600">🎉 No priority tasks right now - you're doing great!</Text>
              ) : (
                <Text color="gray.500">
                  No {currentTab.label.toLowerCase()} tasks {getFilterDescription(currentView)}
                  {!isHomePage && currentView !== 'my-month' && (
                    <Text
                      as="span"
                      color="blue.500"
                      fontSize="sm"
                      display="block"
                      mt={1}
                    >
                      Try switching to a different time period to see more tasks
                    </Text>
                  )}
                </Text>
              )}
            </Box>
          ) : (
            <>
              {currentTab.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleStatus={toggleTaskStatus}
                  onDelete={deleteTask}
                  onEdit={handleEditTask} // Pass the handler to TaskItem
                />
              ))}

              {/* Show "View All" link when on home page and there are more tasks */}
              {isHomePage && currentTab.hasMore && (
                <Box
                  textAlign="center"
                  py={3}
                >
                  <RouterLink to="/tasks">
                    <Button
                      colorPalette="blue"
                      size="sm"
                    >
                      View All {currentTab.label} Tasks ({currentTab.count})
                    </Button>
                  </RouterLink>
                </Box>
              )}
            </>
          )}
        </VStack>
      </Box>

      {/* Create/Edit Task Modal */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTask}
        isLoading={isCreating}
        editTask={editingTask}
        isEditing={isEditing}
      />
    </Box>
  );
};

export default Tasks;
