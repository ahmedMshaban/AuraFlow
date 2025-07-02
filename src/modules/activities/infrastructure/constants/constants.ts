import { FaLungs, FaPalette, FaOm } from 'react-icons/fa';
import type { Activity } from '../types/activities.types';

export const ACTIVITIES_DATA = [
  {
    id: 'breath-box',
    title: 'Box Breathing',
    description:
      'A calming breathing technique used by Navy SEALs to reduce stress and improve focus. Follow the 4-4-4-4 pattern for optimal relaxation.',
    iconKey: 'FaLungs',
    duration: '5-10 min',
    difficulty: 'Easy' as const,
    category: 'Breathing',
    componentKey: 'BreathBox',
  },
  {
    id: 'doodling-space',
    title: 'Doodling Space',
    description:
      'Express yourself through digital art and doodling. A free-form creative space to help clear your mind and reduce stress through artistic expression.',
    iconKey: 'FaPalette',
    duration: 'Unlimited',
    difficulty: 'Easy' as const,
    category: 'Creative',
    componentKey: 'DoodlingSpace',
  },
];

export const ACTIVITY_ICONS = {
  FaLungs,
  FaPalette,
  'breath-box': FaLungs,
  'meditation-placeholder': FaOm,
};

export const PHASE_DURATION = 4000; // 4 seconds for breath box
export const PHASE_LABELS = {
  inhale: 'Breathe In',
  hold1: 'Hold',
  exhale: 'Breathe Out',
  hold2: 'Hold',
};

// Doodling Space Constants
export const DOODLING_COLORS = [
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
  '#808080', // Gray
];

export const BRUSH_SIZES = [2, 5, 10, 15, 20, 30];

export const CANVAS_SETTINGS = {
  width: 800,
  height: 600,
  backgroundColor: '#FFFFFF',
};

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
