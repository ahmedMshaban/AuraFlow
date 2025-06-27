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
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Task, CreateTaskData, UpdateTaskData, TaskStatus } from '@/shared/types/task.types';
import { db, TASKS_COLLECTION } from '../config/database';
import { calculateTaskStatus } from '../utils/dateUtils';

/**
 * Create a new task in the database
 */
export async function createTask(user: User, taskData: CreateTaskData): Promise<string> {
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

/**
 * Get all tasks for a user from the database
 */
export async function getUserTasksFromDb(user: User): Promise<Task[]> {
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
        status: calculateTaskStatus(data.dueDate.toDate(), data.status),
        priority: data.priority,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        userId: data.userId,
        completedAt: data.completedAt?.toDate(),
      };
      tasks.push(task);
    });

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

/**
 * Update a task in the database
 */
export async function updateTask(taskId: string, updateData: UpdateTaskData): Promise<void> {
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

/**
 * Delete a task from the database
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}
