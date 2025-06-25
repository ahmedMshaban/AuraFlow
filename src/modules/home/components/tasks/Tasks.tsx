import React, { useState } from 'react';
import { Box, Button, Badge, VStack, HStack, Text, Spinner } from '@chakra-ui/react';

import { useAuth } from '@/shared/hooks/useAuth';
import { useTasks } from '../../infrastructure/hooks/useTasks';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import type { ViewType } from '../../infrastructure/types/home.types';

interface TasksProps {
  selectedView?: ViewType;
}

const Tasks: React.FC<TasksProps> = ({ selectedView }) => {
  const authContext = useAuth();
  const currentUser = authContext?.currentUser;
  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'completed'>('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
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
  } = useTasks(selectedView);

  if (!currentUser) {
    return (
      <VStack
        gap={4}
        py={8}
      >
        <Text
          color="gray.500"
          textAlign="center"
        >
          Please sign in to manage your tasks
        </Text>
      </VStack>
    );
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

  const currentTab = tabs.find((tab) => tab.key === activeTab) || tabs[0];

  return (
    <Box
      w="100%"
      h="100%"
    >
      {/* Header with Create Task Button */}
      <HStack
        justify="space-between"
        mb={4}
      >
        <Text
          fontSize="lg"
          fontWeight="semibold"
          color="gray.700"
        >
          Task Management
        </Text>
        <Button
          colorScheme="blue"
          size="sm"
          onClick={() => setIsModalOpen(true)}
        >
          + New Task
        </Button>
      </HStack>

      {/* Task Stats Summary */}
      <HStack
        gap={4}
        mb={6}
      >
        <Badge
          colorScheme="blue"
          p={2}
          borderRadius="md"
        >
          <Text fontSize="xs">
            <strong>{taskStats.todayDue}</strong> due today
          </Text>
        </Badge>
        <Badge
          colorScheme="orange"
          p={2}
          borderRadius="md"
        >
          <Text fontSize="xs">
            <strong>{taskStats.thisWeekDue}</strong> this week
          </Text>
        </Badge>
        <Badge
          colorScheme="purple"
          p={2}
          borderRadius="md"
        >
          <Text fontSize="xs">
            <strong>{taskStats.total}</strong> total tasks
          </Text>
        </Badge>
      </HStack>

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
