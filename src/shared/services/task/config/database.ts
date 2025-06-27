import { getFirestore } from 'firebase/firestore';
import { app } from '@/shared/auth/firebase/firebase';

export const db = getFirestore(app);
export const TASKS_COLLECTION = 'tasks';
