import { FaLungs, FaOm } from 'react-icons/fa';

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
    id: 'meditation-placeholder',
    title: 'Guided Meditation',
    description:
      'A peaceful meditation session to help you relax, focus your mind, and reduce anxiety. Perfect for beginners and experienced practitioners.',
    iconKey: 'FaOm',
    duration: '10-20 min',
    difficulty: 'Easy' as const,
    category: 'Mindfulness',
    componentKey: 'MeditationPlaceholder',
  },
];

export const ACTIVITY_ICONS = {
  FaLungs,
  FaOm,
};

export const PHASE_DURATION = 4000; // 4 seconds for breath box
export const PHASE_LABELS = {
  inhale: 'Breathe In',
  hold1: 'Hold',
  exhale: 'Breathe Out',
  hold2: 'Hold',
};
