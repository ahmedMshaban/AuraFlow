import { FaLungs, FaOm } from 'react-icons/fa';
import type { Activity } from '../types/activities.types';

export const ACTIVITIES: Omit<Activity, 'icon' | 'component'>[] = [
  {
    id: 'breath-box',
    title: 'Box Breathing',
    description:
      'A calming breathing technique used by Navy SEALs to reduce stress and improve focus. Follow the 4-4-4-4 pattern for optimal relaxation.',
    duration: '5-10 min',
    difficulty: 'Easy',
    category: 'Breathing',
  },
  {
    id: 'meditation-placeholder',
    title: 'Guided Meditation',
    description:
      'A peaceful meditation session to help you relax, focus your mind, and reduce anxiety. Perfect for beginners and experienced practitioners.',
    duration: '10-20 min',
    difficulty: 'Easy',
    category: 'Mindfulness',
  },
];

export const ACTIVITY_ICONS = {
  'breath-box': FaLungs,
  'meditation-placeholder': FaOm,
} as const;
