import { useState } from 'react';
import { Box, Button, VStack, HStack, Text, Spinner } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';

import type { TasksProps, Task, CreateTaskData } from '@/shared/types/task.types';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import getTabsForMode from '../../infrastructure/helpers/getTasksTabsForMode';

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
              colorScheme={tab.color}
              onClick={() => setActiveTab(tab.key)}
              title={tab.description}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
          <Button
            colorScheme="blue"
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
                <Text color="gray.500">No {currentTab.label.toLowerCase()} tasks</Text>
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
                      colorScheme="blue"
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
