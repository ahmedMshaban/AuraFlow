/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ActivityLibrary from './ActivityLibrary';
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';

// Mock the custom hook
vi.mock('../infrastructure/hooks/useActivityLibrary', () => ({
  useActivityLibrary: vi.fn(),
}));

// Mock child components
vi.mock('./ActivityCard', () => ({
  default: ({
    title,
    description,
    onClick,
    icon,
    duration,
    difficulty,
    category,
  }: {
    title: string;
    description: string;
    onClick: () => void;
    icon: ReactNode;
    duration?: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
  }) => (
    <div
      data-testid="activity-card"
      onClick={onClick}
    >
      <h3>{title}</h3>
      <p>{description}</p>
      <span>{duration}</span>
      <span>{difficulty}</span>
      <span>{category}</span>
      <div>{icon}</div>
    </div>
  ),
}));

vi.mock('./Modal', () => ({
  default: ({
    isOpen,
    onClose,
    title,
    children,
    size,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: string;
  }) =>
    isOpen ? (
      <div
        data-testid="modal"
        data-size={size}
      >
        <h2>{title}</h2>
        <button
          onClick={onClose}
          data-testid="modal-close"
        >
          Close
        </button>
        <div data-testid="modal-content">{children}</div>
      </div>
    ) : null,
}));

vi.mock('./BreathBox', () => ({
  default: () => <div data-testid="breath-box">BreathBox Component</div>,
}));

vi.mock('./DoodlingSpace', () => ({
  default: () => <div data-testid="doodling-space">DoodlingSpace Component</div>,
}));

import { useActivityLibrary } from '../infrastructure/hooks/useActivityLibrary';

const mockUseActivityLibrary = vi.mocked(useActivityLibrary);

// Mock icon component for testing
const MockIcon: IconType = () => <svg data-testid="mock-icon" />;

describe('ActivityLibrary', () => {
  const createMockActivity = (
    id: string,
    title: string,
    difficulty: 'Easy' | 'Medium' | 'Hard',
    componentKey: string,
  ) => ({
    id,
    title,
    description: `${title} description`,
    icon: MockIcon,
    iconKey: 'FaLungs',
    duration: '5 min',
    difficulty,
    category: 'Test',
    componentKey,
  });

  const defaultHookReturn = {
    activities: [
      createMockActivity('test-activity-1', 'Test Activity 1', 'Easy', 'TestComponent1'),
      {
        ...createMockActivity('test-activity-2', 'Test Activity 2', 'Medium', 'TestComponent2'),
        duration: '10 min',
      },
    ],
    selectedActivity: null,
    isModalOpen: false,
    handleActivityClick: vi.fn(),
    handleCloseModal: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseActivityLibrary.mockReturnValue(defaultHookReturn);
  });

  afterEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the library header correctly', () => {
    render(<ActivityLibrary />);

    expect(screen.getByText('Wellness Activities')).toBeDefined();
    expect(screen.getByText('Choose from our collection of stress-relief and wellness activities')).toBeDefined();
  });

  it('renders all activities from the hook', () => {
    render(<ActivityLibrary />);

    expect(screen.getByText('Test Activity 1')).toBeDefined();
    expect(screen.getByText('Test Activity 2')).toBeDefined();
    expect(screen.getByText('Test Activity 1 description')).toBeDefined();
    expect(screen.getByText('Test Activity 2 description')).toBeDefined();
  });

  it('renders ActivityCard components for each activity', () => {
    render(<ActivityLibrary />);

    const activityCards = screen.getAllByTestId('activity-card');
    expect(activityCards).toHaveLength(2);
  });

  it('calls handleActivityClick when activity card is clicked', () => {
    const mockHandleActivityClick = vi.fn();
    mockUseActivityLibrary.mockReturnValue({
      ...defaultHookReturn,
      handleActivityClick: mockHandleActivityClick,
    } as any);

    render(<ActivityLibrary />);

    const firstActivityCard = screen.getAllByTestId('activity-card')[0];
    fireEvent.click(firstActivityCard);

    expect(mockHandleActivityClick).toHaveBeenCalledTimes(1);
    expect(mockHandleActivityClick).toHaveBeenCalledWith(defaultHookReturn.activities[0]);
  });

  it('does not render modal when isModalOpen is false', () => {
    mockUseActivityLibrary.mockReturnValue({
      ...defaultHookReturn,
      isModalOpen: false,
    } as any);

    render(<ActivityLibrary />);

    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('renders modal when isModalOpen is true', () => {
    mockUseActivityLibrary.mockReturnValue({
      ...defaultHookReturn,
      isModalOpen: true,
      selectedActivity: defaultHookReturn.activities[0],
    } as any);

    render(<ActivityLibrary />);

    expect(screen.getByTestId('modal')).toBeDefined();
    // Check the modal title specifically within the modal
    const modal = screen.getByTestId('modal');
    expect(modal.querySelector('h2')?.textContent).toBe('Test Activity 1');
  });

  it('calls handleCloseModal when modal close button is clicked', () => {
    const mockHandleCloseModal = vi.fn();
    mockUseActivityLibrary.mockReturnValue({
      ...defaultHookReturn,
      isModalOpen: true,
      selectedActivity: defaultHookReturn.activities[0],
      handleCloseModal: mockHandleCloseModal,
    } as any);

    render(<ActivityLibrary />);

    const closeButton = screen.getByTestId('modal-close');
    fireEvent.click(closeButton);

    expect(mockHandleCloseModal).toHaveBeenCalledTimes(1);
  });

  it('renders BreathBox component when componentKey is BreathBox', () => {
    mockUseActivityLibrary.mockReturnValue({
      ...defaultHookReturn,
      isModalOpen: true,
      selectedActivity: {
        ...defaultHookReturn.activities[0],
        componentKey: 'BreathBox',
      },
    } as any);

    render(<ActivityLibrary />);

    expect(screen.getByTestId('breath-box')).toBeDefined();
    expect(screen.getByText('BreathBox Component')).toBeDefined();
  });

  it('renders DoodlingSpace component when componentKey is DoodlingSpace', () => {
    mockUseActivityLibrary.mockReturnValue({
      ...defaultHookReturn,
      isModalOpen: true,
      selectedActivity: {
        ...defaultHookReturn.activities[0],
        componentKey: 'DoodlingSpace',
      },
    } as any);

    render(<ActivityLibrary />);

    expect(screen.getByTestId('doodling-space')).toBeDefined();
    expect(screen.getByText('DoodlingSpace Component')).toBeDefined();
  });

  it('renders placeholder component when componentKey is MeditationPlaceholder', () => {
    mockUseActivityLibrary.mockReturnValue({
      ...defaultHookReturn,
      isModalOpen: true,
      selectedActivity: {
        ...defaultHookReturn.activities[0],
        componentKey: 'MeditationPlaceholder',
      },
    } as any);

    render(<ActivityLibrary />);

    expect(screen.getByText('Guided Meditation')).toBeDefined();
    expect(screen.getByText('This meditation component will be implemented next!')).toBeDefined();
  });

  it('renders null for unknown componentKey', () => {
    mockUseActivityLibrary.mockReturnValue({
      ...defaultHookReturn,
      isModalOpen: true,
      selectedActivity: {
        ...defaultHookReturn.activities[0],
        componentKey: 'UnknownComponent',
      },
    } as any);

    render(<ActivityLibrary />);

    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toBeDefined();
    expect(modalContent.children).toHaveLength(0);
  });

  it('renders modal with large size', () => {
    mockUseActivityLibrary.mockReturnValue({
      ...defaultHookReturn,
      isModalOpen: true,
      selectedActivity: defaultHookReturn.activities[0],
    } as any);

    render(<ActivityLibrary />);

    const modal = screen.getByTestId('modal');
    expect(modal).toHaveAttribute('data-size', 'large');
  });

  it('handles empty activities array', () => {
    mockUseActivityLibrary.mockReturnValue({
      ...defaultHookReturn,
      activities: [],
    } as any);

    render(<ActivityLibrary />);

    expect(screen.getByText('Wellness Activities')).toBeDefined();
    expect(screen.queryByTestId('activity-card')).toBeNull();
  });

  it('handles selectedActivity being null in modal', () => {
    mockUseActivityLibrary.mockReturnValue({
      ...defaultHookReturn,
      isModalOpen: true,
      selectedActivity: null,
    } as any);

    render(<ActivityLibrary />);

    const modal = screen.getByTestId('modal');
    expect(modal).toBeDefined();
    // Check the h2 element specifically
    const titleElement = modal.querySelector('h2');
    expect(titleElement?.textContent).toBe('');
  });

  it('passes correct props to ActivityCard components', () => {
    render(<ActivityLibrary />);

    const activityCards = screen.getAllByTestId('activity-card');

    // Check first activity via card container
    const firstCard = activityCards[0];
    expect(firstCard.querySelector('h3')?.textContent).toBe('Test Activity 1');
    expect(firstCard.querySelector('p')?.textContent).toBe('Test Activity 1 description');
    expect(firstCard.textContent).toContain('5 min');
    expect(firstCard.textContent).toContain('Easy');
    expect(firstCard.textContent).toContain('Test');

    // Check second activity via card container
    const secondCard = activityCards[1];
    expect(secondCard.querySelector('h3')?.textContent).toBe('Test Activity 2');
    expect(secondCard.querySelector('p')?.textContent).toBe('Test Activity 2 description');
    expect(secondCard.textContent).toContain('Medium');
  });
});
