import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  getFirestore,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { app } from '@/shared/auth/firebase/firebase';
import type { Task, CreateTaskData, UpdateTaskData, TaskStatus, TaskFilters, TaskStats } from '../types/task.types';

const db = getFirestore(app);
const TASKS_COLLECTION = 'tasks';

class TaskService {
  // Create a new task
  async createTask(user: User, taskData: CreateTaskData): Promise<string> {
    try {
      const now = new Date();
      const task = {
        title: taskData.title,
        description: taskData.description || '',
        dueDate: Timestamp.fromDate(taskData.dueDate),
        priority: taskData.priority,
        status: 'pending' as TaskStatus,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        userId: user.uid,
      };

      const docRef = await addDoc(collection(db, TASKS_COLLECTION), task);
      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Get all tasks for a user
  async getUserTasks(user: User, filters?: TaskFilters): Promise<Task[]> {
    try {
      const q = query(collection(db, TASKS_COLLECTION), where('userId', '==', user.uid), orderBy('dueDate', 'asc'));

      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const task: Task = {
          id: doc.id,
          title: data.title,
          description: data.description,
          dueDate: data.dueDate.toDate(),
          status: this.calculateTaskStatus(data.dueDate.toDate(), data.status),
          priority: data.priority,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          userId: data.userId,
          completedAt: data.completedAt?.toDate(),
        };
        tasks.push(task);
      });

      return this.applyFilters(tasks, filters);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  } // Update a task
  async updateTask(taskId: string, updateData: UpdateTaskData): Promise<void> {
    try {
      const taskRef = doc(db, TASKS_COLLECTION, taskId);

      // Build update object with proper typing
      const fieldsToUpdate: Partial<{
        title: string;
        description: string;
        priority: string;
        status: string;
        dueDate: Timestamp;
        completedAt: Timestamp | null;
        updatedAt: Timestamp;
      }> = {
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Add only defined fields to the update
      if (updateData.title !== undefined) fieldsToUpdate.title = updateData.title;
      if (updateData.description !== undefined) fieldsToUpdate.description = updateData.description;
      if (updateData.priority !== undefined) fieldsToUpdate.priority = updateData.priority;
      if (updateData.status !== undefined) fieldsToUpdate.status = updateData.status;

      if (updateData.dueDate) {
        fieldsToUpdate.dueDate = Timestamp.fromDate(updateData.dueDate);
      }

      if (updateData.status === 'completed') {
        fieldsToUpdate.completedAt = Timestamp.fromDate(new Date());
      } else if (updateData.status === 'pending') {
        fieldsToUpdate.completedAt = null;
      }

      await updateDoc(taskRef, fieldsToUpdate);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Get tasks by date range (for view filtering)
  getTasksByDateRange(tasks: Task[], viewType: 'my-day' | 'my-week' | 'my-month'): Task[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate: Date;
    let endDate: Date;

    switch (viewType) {
      case 'my-day':
        startDate = today;
        endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'my-week':
        startDate = today;
        endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'my-month':
        startDate = today;
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        break;
      default:
        return tasks;
    }

    return tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= startDate && taskDate < endDate;
    });
  }

  // Get task statistics
  getTaskStats(tasks: Task[]): TaskStats {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      overdue: tasks.filter((t) => t.status === 'overdue').length,
      todayDue: tasks.filter((t) => {
        const taskDate = new Date(t.dueDate);
        return taskDate >= today && taskDate < tomorrow && t.status !== 'completed';
      }).length,
      thisWeekDue: tasks.filter((t) => {
        const taskDate = new Date(t.dueDate);
        return taskDate >= today && taskDate < weekFromNow && t.status !== 'completed';
      }).length,
      thisMonthDue: tasks.filter((t) => {
        const taskDate = new Date(t.dueDate);
        return taskDate >= today && taskDate < monthFromNow && t.status !== 'completed';
      }).length,
    };
  }

  // Calculate task status based on due date and current status
  private calculateTaskStatus(dueDate: Date, currentStatus: TaskStatus): TaskStatus {
    if (currentStatus === 'completed') {
      return 'completed';
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (dueDate < today) {
      return 'overdue';
    }

    return 'pending';
  }

  // Apply filters to tasks
  private applyFilters(tasks: Task[], filters?: TaskFilters): Task[] {
    if (!filters) return tasks;

    let filteredTasks = [...tasks];

    if (filters.status && filters.status.length > 0) {
      filteredTasks = filteredTasks.filter((task) => filters.status!.includes(task.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filteredTasks = filteredTasks.filter((task) => filters.priority!.includes(task.priority));
    }

    if (filters.dateRange) {
      filteredTasks = filteredTasks.filter((task) => {
        const taskDate = new Date(task.dueDate);
        return taskDate >= filters.dateRange!.start && taskDate <= filters.dateRange!.end;
      });
    }

    return filteredTasks;
  }

  // Categorize tasks into upcoming, overdue, and completed
  categorizeTasks(tasks: Task[]) {
    return {
      upcoming: tasks.filter((task) => task.status === 'pending'),
      overdue: tasks.filter((task) => task.status === 'overdue'),
      completed: tasks.filter((task) => task.status === 'completed'),
    };
  }
}

export const taskService = new TaskService();
