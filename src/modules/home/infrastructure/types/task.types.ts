export type TaskStatus = 'pending' | 'completed' | 'overdue';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  completedAt?: Date;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate: Date;
  priority: TaskPriority;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface TaskStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  todayDue: number;
  thisWeekDue: number;
  thisMonthDue: number;
}

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string; // For form handling
  priority: TaskPriority;
}
