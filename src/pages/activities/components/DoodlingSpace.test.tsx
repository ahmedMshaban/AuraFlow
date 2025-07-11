import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import DoodlingSpace from './DoodlingSpace';

// Mock the custom hook
vi.mock('../infrastructure/hooks/useDoodlingSpace', () => ({
  useDoodlingSpace: vi.fn(() => ({
    canvasRef: { current: null },
    isDrawing: false,
    currentColor: '#000000',
    currentBrushSize: 10,
    strokes: [],
    startDrawing: vi.fn(),
    draw: vi.fn(),
    stopDrawing: vi.fn(),
    clearCanvas: vi.fn(),
    changeColor: vi.fn(),
    changeBrushSize: vi.fn(),
    undo: vi.fn(),
    initializeCanvas: vi.fn(),
    availableColors: ['#000000', '#FF0000', '#00FF00', '#0000FF'],
    availableBrushSizes: [2, 5, 10, 15],
  })),
}));

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaPalette: () => <svg data-testid="palette-icon" />,
  FaUndo: () => <svg data-testid="undo-icon" />,
  FaTrash: () => <svg data-testid="trash-icon" />,
}));

import { useDoodlingSpace } from '../infrastructure/hooks/useDoodlingSpace';

const mockUseDoodlingSpace = vi.mocked(useDoodlingSpace);

describe('DoodlingSpace', () => {
  const defaultHookReturn = {
    canvasRef: { current: null },
    isDrawing: false,
    currentColor: '#000000',
    currentBrushSize: 10,
    strokes: [],
    startDrawing: vi.fn(),
    draw: vi.fn(),
    stopDrawing: vi.fn(),
    clearCanvas: vi.fn(),
    changeColor: vi.fn(),
    changeBrushSize: vi.fn(),
    undo: vi.fn(),
    initializeCanvas: vi.fn(),
    availableColors: ['#000000', '#FF0000', '#00FF00', '#0000FF'],
    availableBrushSizes: [2, 5, 10, 15],
    canvasSettings: {
      width: 800,
      height: 600,
      backgroundColor: '#FFFFFF',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDoodlingSpace.mockReturnValue(defaultHookReturn);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the component structure correctly', () => {
    render(<DoodlingSpace />);

    expect(screen.getByText('Doodling Space')).toBeDefined();
    expect(screen.getByText('Express yourself through digital art and free your mind')).toBeDefined();
    expect(screen.getByText('Colors')).toBeDefined();
    expect(screen.getByText('Brush Size')).toBeDefined();
    expect(screen.getByText('Actions')).toBeDefined();
  });

  it('renders color palette correctly', () => {
    render(<DoodlingSpace />);

    // Check if color buttons are rendered
    const colorButtons = screen.getAllByTitle(/Select #/);
    expect(colorButtons).toHaveLength(4);
  });

  it('renders brush size options correctly', () => {
    render(<DoodlingSpace />);

    // Check if brush size buttons are rendered
    const brushButtons = screen.getAllByTitle(/Brush size \d+px/);
    expect(brushButtons).toHaveLength(4);
  });

  it('calls changeColor when color button is clicked', () => {
    const mockChangeColor = vi.fn();
    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      changeColor: mockChangeColor,
    });

    render(<DoodlingSpace />);

    const redColorButton = screen.getByTitle('Select #FF0000');
    fireEvent.click(redColorButton);

    expect(mockChangeColor).toHaveBeenCalledWith('#FF0000');
  });

  it('calls changeBrushSize when brush size button is clicked', () => {
    const mockChangeBrushSize = vi.fn();
    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      changeBrushSize: mockChangeBrushSize,
    });

    render(<DoodlingSpace />);

    const brushButton = screen.getByTitle('Brush size 5px');
    fireEvent.click(brushButton);

    expect(mockChangeBrushSize).toHaveBeenCalledWith(5);
  });

  it('calls undo when undo button is clicked', () => {
    const mockUndo = vi.fn();
    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      undo: mockUndo,
      strokes: [{ points: [], color: '#000000', size: 10, timestamp: Date.now() }],
    });

    render(<DoodlingSpace />);

    const undoButton = screen.getByText('Undo').closest('button');
    fireEvent.click(undoButton!);

    expect(mockUndo).toHaveBeenCalledTimes(1);
  });

  it('calls clearCanvas when clear button is clicked', () => {
    const mockClearCanvas = vi.fn();
    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      clearCanvas: mockClearCanvas,
      strokes: [{ points: [], color: '#000000', size: 10, timestamp: Date.now() }],
    });

    render(<DoodlingSpace />);

    const clearButton = screen.getByText('Clear').closest('button');
    fireEvent.click(clearButton!);

    expect(mockClearCanvas).toHaveBeenCalledTimes(1);
  });

  it('disables undo and clear buttons when no strokes exist', () => {
    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      strokes: [],
    });

    render(<DoodlingSpace />);

    const undoButton = screen.getByText('Undo').closest('button');
    const clearButton = screen.getByText('Clear').closest('button');

    expect(undoButton).toHaveProperty('disabled', true);
    expect(clearButton).toHaveProperty('disabled', true);
  });

  it('enables undo and clear buttons when strokes exist', () => {
    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      strokes: [{ points: [], color: '#000000', size: 10, timestamp: Date.now() }],
    });

    render(<DoodlingSpace />);

    const undoButton = screen.getByText('Undo').closest('button');
    const clearButton = screen.getByText('Clear').closest('button');

    expect(undoButton).toHaveProperty('disabled', false);
    expect(clearButton).toHaveProperty('disabled', false);
  });

  it('shows canvas placeholder when no strokes exist and not drawing', () => {
    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      strokes: [],
      isDrawing: false,
    });

    render(<DoodlingSpace />);

    expect(screen.getByText('Start drawing to express your creativity!')).toBeDefined();
    expect(screen.getByText('Click and drag to draw')).toBeDefined();
    expect(screen.getAllByTestId('palette-icon')).toHaveLength(2); // One in toolbar, one in placeholder
  });

  it('hides canvas placeholder when strokes exist', () => {
    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      strokes: [{ points: [], color: '#000000', size: 10, timestamp: Date.now() }],
      isDrawing: false,
    });

    render(<DoodlingSpace />);

    expect(screen.queryByText('Start drawing to express your creativity!')).toBeNull();
  });

  it('hides canvas placeholder when drawing', () => {
    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      strokes: [],
      isDrawing: true,
    });

    render(<DoodlingSpace />);

    expect(screen.queryByText('Start drawing to express your creativity!')).toBeNull();
  });

  it('displays current stats correctly', () => {
    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      strokes: [
        { points: [], color: '#000000', size: 10, timestamp: Date.now() },
        { points: [], color: '#FF0000', size: 5, timestamp: Date.now() },
      ],
      currentColor: '#FF0000',
      currentBrushSize: 15,
    });

    render(<DoodlingSpace />);

    expect(screen.getByText('Strokes:')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('Current Tool:')).toBeDefined();
    expect(screen.getByText('15px Brush')).toBeDefined();
  });

  it('highlights active color button', () => {
    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      currentColor: '#FF0000',
    });

    render(<DoodlingSpace />);

    const redColorButton = screen.getByTitle('Select #FF0000');
    expect(redColorButton.className).toContain('active');
  });

  it('highlights active brush size button', () => {
    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      currentBrushSize: 5,
    });

    render(<DoodlingSpace />);

    const brushButton = screen.getByTitle('Brush size 5px');
    expect(brushButton.className).toContain('active');
  });

  it('calls mouse event handlers on canvas', () => {
    const mockStartDrawing = vi.fn();
    const mockDraw = vi.fn();
    const mockStopDrawing = vi.fn();

    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      startDrawing: mockStartDrawing,
      draw: mockDraw,
      stopDrawing: mockStopDrawing,
    });

    render(<DoodlingSpace />);

    const canvas = document.querySelector('canvas');
    expect(canvas).toBeDefined();

    if (canvas) {
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      expect(mockStartDrawing).toHaveBeenCalledTimes(1);

      fireEvent.mouseMove(canvas, { clientX: 110, clientY: 110 });
      expect(mockDraw).toHaveBeenCalledTimes(1);

      fireEvent.mouseUp(canvas);
      expect(mockStopDrawing).toHaveBeenCalledTimes(1);

      fireEvent.mouseLeave(canvas);
      expect(mockStopDrawing).toHaveBeenCalledTimes(2);
    }
  });

  it('applies className prop correctly', () => {
    render(<DoodlingSpace className="custom-class" />);

    const container = screen.getByText('Doodling Space').closest('div')?.parentElement;
    expect(container?.className).toContain('custom-class');
  });

  it('renders without className prop', () => {
    render(<DoodlingSpace />);

    const container = screen.getByText('Doodling Space').closest('div');
    expect(container).toBeDefined();
  });

  it('calls initializeCanvas on mount', () => {
    const mockInitializeCanvas = vi.fn();
    mockUseDoodlingSpace.mockReturnValue({
      ...defaultHookReturn,
      initializeCanvas: mockInitializeCanvas,
    });

    render(<DoodlingSpace />);

    expect(mockInitializeCanvas).toHaveBeenCalledTimes(1);
  });
});
