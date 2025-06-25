import { useState } from 'react';
import { Box, Button, VStack, HStack, Text, Spinner } from '@chakra-ui/react';

import type { TasksProps } from '@/shared/types/task.types';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';

const Tasks = ({
  upcomingTasks,
  overdueTasks,
  completedTasks,
  taskStats,
  isLoading,
  error,
  createTask,
  deleteTask,
  toggleTaskStatus,
  isCreating,
}: TasksProps) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'completed'>('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabs = [
    {
      key: 'upcoming' as const,
      label: 'Upcoming',
      count: taskStats.pending,
      tasks: upcomingTasks,
      color: 'blue',
    },
    {
      key: 'overdue' as const,
      label: 'Overdue',
      count: taskStats.overdue,
      tasks: overdueTasks,
      color: 'red',
    },
    {
      key: 'completed' as const,
      label: 'Completed',
      count: taskStats.completed,
      tasks: completedTasks,
      color: 'green',
    },
  ];

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
      <HStack
        gap={2}
        mb={4}
      >
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            variant={activeTab === tab.key ? 'solid' : 'outline'}
            colorScheme={tab.color}
            onClick={() => setActiveTab(tab.key)}
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
              <Text color="gray.500">No {currentTab.label.toLowerCase()} tasks</Text>
            </Box>
          ) : (
            currentTab.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleStatus={toggleTaskStatus}
                onDelete={deleteTask}
              />
            ))
          )}
        </VStack>
      </Box>

      {/* Create Task Modal */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createTask}
        isLoading={isCreating}
      />
    </Box>
  );
};

export default Tasks;
