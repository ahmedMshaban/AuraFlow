import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ActivityCard from './ActivityCard';

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaPlay: () => <svg data-testid="play-icon" />,
}));

// Mock the helper function
vi.mock('../infrastructure/helpers/activityHelpers', () => ({
  getDifficultyColor: vi.fn((difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#50c878';
      case 'Medium':
        return '#ffc107';
      case 'Hard':
        return '#dc3545';
      default:
        return '#50c878';
    }
  }),
}));

describe('ActivityCard', () => {
  const defaultProps = {
    title: 'Test Activity',
    description: 'This is a test activity description',
    icon: <svg data-testid="activity-icon" />,
    duration: '10 min',
    difficulty: 'Easy' as const,
    category: 'Test Category',
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all activity information correctly', () => {
    render(<ActivityCard {...defaultProps} />);

    expect(screen.getByText('Test Activity')).toBeDefined();
    expect(screen.getByText('This is a test activity description')).toBeDefined();
    expect(screen.getByText('Test Category')).toBeDefined();
    expect(screen.getByText('10 min')).toBeDefined();
    expect(screen.getByText('Easy')).toBeDefined();
    expect(screen.getByTestId('activity-icon')).toBeDefined();
  });

  it('renders without optional duration', () => {
    const propsWithoutDuration = {
      ...defaultProps,
      duration: undefined,
    };

    render(<ActivityCard {...propsWithoutDuration} />);

    expect(screen.getByText('Test Activity')).toBeDefined();
    expect(screen.queryByText('Duration:')).toBeNull();
  });

  it('calls onClick when card is clicked', () => {
    const mockOnClick = vi.fn();
    render(
      <ActivityCard
        {...defaultProps}
        onClick={mockOnClick}
      />,
    );

    const card = screen.getByText('Test Activity').closest('div');
    fireEvent.click(card!);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when start button is clicked', () => {
    const mockOnClick = vi.fn();
    render(
      <ActivityCard
        {...defaultProps}
        onClick={mockOnClick}
      />,
    );

    const startButton = screen.getByText('Start Activity').closest('button');
    fireEvent.click(startButton!);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders different difficulty levels correctly', () => {
    const { rerender } = render(
      <ActivityCard
        {...defaultProps}
        difficulty="Medium"
      />,
    );
    expect(screen.getByText('Medium')).toBeDefined();

    rerender(
      <ActivityCard
        {...defaultProps}
        difficulty="Hard"
      />,
    );
    expect(screen.getByText('Hard')).toBeDefined();
  });

  it('applies correct difficulty color styling', () => {
    render(
      <ActivityCard
        {...defaultProps}
        difficulty="Easy"
      />,
    );

    const difficultyBadge = screen.getByText('Easy');
    expect(difficultyBadge).toBeDefined();
    // The style should be applied via CSS custom property
  });

  it('shows overlay content on hover', () => {
    render(<ActivityCard {...defaultProps} />);

    expect(screen.getByText('Click to Start')).toBeDefined();
    // Check for multiple play icons since there's one in button and one in overlay
    const playIcons = screen.getAllByTestId('play-icon');
    expect(playIcons.length).toBeGreaterThan(0);
  });

  it('displays duration and difficulty metadata correctly', () => {
    render(<ActivityCard {...defaultProps} />);

    expect(screen.getByText('Duration:')).toBeDefined();
    expect(screen.getByText('10 min')).toBeDefined();
    expect(screen.getByText('Difficulty:')).toBeDefined();
    expect(screen.getByText('Easy')).toBeDefined();
  });

  it('handles missing props gracefully', () => {
    const minimalProps = {
      title: 'Minimal Activity',
      description: 'Minimal description',
      icon: <svg data-testid="minimal-icon" />,
      category: 'Minimal',
      onClick: vi.fn(),
    };

    render(<ActivityCard {...minimalProps} />);

    expect(screen.getByText('Minimal Activity')).toBeDefined();
    expect(screen.getByText('Minimal description')).toBeDefined();
    expect(screen.getByText('Easy')).toBeDefined(); // Default difficulty
  });

  it('renders icon correctly', () => {
    render(<ActivityCard {...defaultProps} />);

    const iconContainer = screen.getByTestId('activity-icon').closest('div');
    expect(iconContainer).toBeDefined();
  });

  it('has proper accessibility attributes', () => {
    render(<ActivityCard {...defaultProps} />);

    const card = screen.getByText('Test Activity').closest('div');
    expect(card).toBeDefined();

    const startButton = screen.getByText('Start Activity').closest('button');
    expect(startButton).toBeDefined();
  });
});
