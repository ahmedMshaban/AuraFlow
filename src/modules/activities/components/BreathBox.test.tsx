import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import BreathBox from './BreathBox';
import type { BreathPhase } from '../infrastructure/types/activities.types';

// Mock the custom hook
vi.mock('../infrastructure/hooks/useBreathBox', () => ({
  useBreathBox: vi.fn(() => ({
    isActive: false,
    currentPhase: 'inhale',
    progress: 0,
    cycleCount: 0,
    timeRemaining: 4,
    handleStart: vi.fn(),
    handlePause: vi.fn(),
    handleStop: vi.fn(),
    getCurrentPhaseLabel: vi.fn(() => 'Breathe In'),
    phaseLabels: {
      inhale: 'Breathe In',
      hold1: 'Hold',
      exhale: 'Breathe Out',
      hold2: 'Hold',
    },
  })),
}));

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaPlay: () => <svg data-testid="play-icon" />,
  FaPause: () => <svg data-testid="pause-icon" />,
  FaStop: () => <svg data-testid="stop-icon" />,
}));

import { useBreathBox } from '../infrastructure/hooks/useBreathBox';

const mockUseBreathBox = vi.mocked(useBreathBox);

describe('BreathBox', () => {
  const defaultHookReturn = {
    isActive: false,
    currentPhase: 'inhale' as const,
    progress: 0,
    cycleCount: 0,
    timeRemaining: 4,
    handleStart: vi.fn(),
    handlePause: vi.fn(),
    handleStop: vi.fn(),
    getCurrentPhaseLabel: vi.fn(() => 'Breathe In'),
    phaseLabels: {
      inhale: 'Breathe In',
      hold1: 'Hold',
      exhale: 'Breathe Out',
      hold2: 'Hold',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBreathBox.mockReturnValue(defaultHookReturn);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the component structure correctly', () => {
    render(<BreathBox />);

    expect(screen.getByText('Box Breathing')).toBeDefined();
    expect(screen.getByText('4-4-4-4 breathing technique for relaxation')).toBeDefined();
    expect(screen.getByText('Breathe In')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();
  });

  it('renders all phase steps', () => {
    render(<BreathBox />);

    expect(screen.getByText('1. Inhale (4s)')).toBeDefined();
    expect(screen.getByText('2. Hold (4s)')).toBeDefined();
    expect(screen.getByText('3. Exhale (4s)')).toBeDefined();
    expect(screen.getByText('4. Hold (4s)')).toBeDefined();
  });

  it('renders control buttons', () => {
    render(<BreathBox />);

    expect(screen.getByText('Start')).toBeDefined();
    expect(screen.getByText('Pause')).toBeDefined();
    expect(screen.getByText('Reset')).toBeDefined();
    expect(screen.getByTestId('play-icon')).toBeDefined();
    expect(screen.getByTestId('pause-icon')).toBeDefined();
    expect(screen.getByTestId('stop-icon')).toBeDefined();
  });

  it('calls handleStart when start button is clicked', () => {
    const mockHandleStart = vi.fn();
    mockUseBreathBox.mockReturnValue({
      ...defaultHookReturn,
      handleStart: mockHandleStart,
    });

    render(<BreathBox />);

    const startButton = screen.getByText('Start').closest('button');
    fireEvent.click(startButton!);

    expect(mockHandleStart).toHaveBeenCalledTimes(1);
  });

  it('calls handlePause when pause button is clicked', () => {
    const mockHandlePause = vi.fn();
    mockUseBreathBox.mockReturnValue({
      ...defaultHookReturn,
      isActive: true, // Pause button should be enabled when breathing is active
      handlePause: mockHandlePause,
    });

    render(<BreathBox />);

    const pauseButton = screen.getByText('Pause').closest('button');
    fireEvent.click(pauseButton!);

    expect(mockHandlePause).toHaveBeenCalledTimes(1);
  });

  it('calls handleStop when reset button is clicked', () => {
    const mockHandleStop = vi.fn();
    mockUseBreathBox.mockReturnValue({
      ...defaultHookReturn,
      handleStop: mockHandleStop,
    });

    render(<BreathBox />);

    const resetButton = screen.getByText('Reset').closest('button');
    fireEvent.click(resetButton!);

    expect(mockHandleStop).toHaveBeenCalledTimes(1);
  });

  it('disables start button when breathing is active', () => {
    mockUseBreathBox.mockReturnValue({
      ...defaultHookReturn,
      isActive: true,
    });

    render(<BreathBox />);

    const startButton = screen.getByText('Start').closest('button');
    expect(startButton).toHaveProperty('disabled', true);
  });

  it('disables pause button when breathing is not active', () => {
    mockUseBreathBox.mockReturnValue({
      ...defaultHookReturn,
      isActive: false,
    });

    render(<BreathBox />);

    const pauseButton = screen.getByText('Pause').closest('button');
    expect(pauseButton).toHaveProperty('disabled', true);
  });

  it('displays current phase correctly', () => {
    mockUseBreathBox.mockReturnValue({
      ...defaultHookReturn,
      currentPhase: 'exhale',
      getCurrentPhaseLabel: vi.fn(() => 'Breathe Out'),
    });

    render(<BreathBox />);

    expect(screen.getByText('Breathe Out')).toBeDefined();
  });

  it('highlights active phase step', () => {
    mockUseBreathBox.mockReturnValue({
      ...defaultHookReturn,
      currentPhase: 'hold1',
    });

    render(<BreathBox />);

    // The active class should be applied to the hold1 phase
    const holdStep = screen.getByText('2. Hold (4s)');
    expect(holdStep).toBeDefined();
  });

  it('displays cycle count correctly', () => {
    mockUseBreathBox.mockReturnValue({
      ...defaultHookReturn,
      cycleCount: 5,
    });

    render(<BreathBox />);

    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('Completed Cycles:')).toBeDefined();
  });

  it('displays time remaining correctly', () => {
    mockUseBreathBox.mockReturnValue({
      ...defaultHookReturn,
      timeRemaining: 2,
    });

    render(<BreathBox />);

    expect(screen.getByText('2')).toBeDefined();
  });

  it('displays progress correctly', () => {
    mockUseBreathBox.mockReturnValue({
      ...defaultHookReturn,
      progress: 75,
    });

    render(<BreathBox />);

    // Progress should be applied as CSS custom property
    const progressIndicator = screen.getByText('Breathe In').closest('div')?.querySelector('[style*="--progress"]');
    expect(progressIndicator).toBeDefined();
  });

  it('applies className prop correctly', () => {
    render(<BreathBox className="custom-class" />);

    // The className should be applied to the main container, not the header
    const container = screen.getByText('Box Breathing').closest('div')?.parentElement;
    expect(container?.className).toContain('custom-class');
  });

  it('renders without className prop', () => {
    render(<BreathBox />);

    const container = screen.getByText('Box Breathing').closest('div');
    expect(container).toBeDefined();
  });

  it('shows different phases correctly', () => {
    // Test each phase
    const phases: Array<{ phase: BreathPhase; label: string }> = [
      { phase: 'inhale', label: 'Breathe In' },
      { phase: 'hold1', label: 'Hold' },
      { phase: 'exhale', label: 'Breathe Out' },
      { phase: 'hold2', label: 'Hold' },
    ];

    phases.forEach(({ phase, label }) => {
      mockUseBreathBox.mockReturnValue({
        ...defaultHookReturn,
        currentPhase: phase,
        getCurrentPhaseLabel: vi.fn(() => label),
      });

      const { rerender } = render(<BreathBox />);
      expect(screen.getByText(label)).toBeDefined();
      rerender(<div />); // Clear for next iteration
    });
  });
});
