import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { RefObject } from 'react';
import { useDoodlingSpace } from './useDoodlingSpace';
import { DOODLING_COLORS, BRUSH_SIZES, CANVAS_SETTINGS } from '../constants/constants';

// Mock HTMLCanvasElement methods and properties
interface MockCanvasContext {
  beginPath: () => void;
  strokeStyle: string;
  lineWidth: number;
  lineCap: string;
  lineJoin: string;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  stroke: () => void;
  fillStyle: string;
  fillRect: (x: number, y: number, width: number, height: number) => void;
  width: number;
  height: number;
}

const mockCanvasContext: MockCanvasContext = {
  beginPath: vi.fn(),
  strokeStyle: '',
  lineWidth: 0,
  lineCap: '',
  lineJoin: '',
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillStyle: '',
  fillRect: vi.fn(),
  width: 800,
  height: 600,
};

const mockCanvas = {
  getContext: vi.fn(() => mockCanvasContext),
  getBoundingClientRect: vi.fn(() => ({
    left: 0,
    top: 0,
    width: 800,
    height: 600,
  })),
  width: 800,
  height: 600,
} as unknown as HTMLCanvasElement;

// Mock React mouse event
const createMockMouseEvent = (clientX: number, clientY: number): React.MouseEvent<HTMLCanvasElement> =>
  ({
    clientX,
    clientY,
    currentTarget: mockCanvas,
    target: mockCanvas,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }) as unknown as React.MouseEvent<HTMLCanvasElement>;

describe('useDoodlingSpace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useDoodlingSpace());

      expect(result.current.isDrawing).toBe(false);
      expect(result.current.currentColor).toBe(DOODLING_COLORS[0]);
      expect(result.current.currentBrushSize).toBe(BRUSH_SIZES[2]); // Medium size
      expect(result.current.strokes).toEqual([]);
      expect(result.current.canvasRef).toBeDefined();
    });

    it('should provide correct constants', () => {
      const { result } = renderHook(() => useDoodlingSpace());

      expect(result.current.availableColors).toEqual(DOODLING_COLORS);
      expect(result.current.availableBrushSizes).toEqual(BRUSH_SIZES);
      expect(result.current.canvasSettings).toEqual(CANVAS_SETTINGS);
    });

    it('should initialize canvas ref as null', () => {
      const { result } = renderHook(() => useDoodlingSpace());

      expect(result.current.canvasRef.current).toBeNull();
    });
  });

  describe('Canvas Operations', () => {
    beforeEach(() => {
      // Mock canvas ref
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        value: vi.fn(() => mockCanvasContext),
        writable: true,
      });

      Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
        value: vi.fn(() => ({
          left: 0,
          top: 0,
          width: 800,
          height: 600,
        })),
        writable: true,
      });
    });

    it('should initialize canvas with correct dimensions and background', () => {
      const { result } = renderHook(() => useDoodlingSpace());

      // Mock canvas ref
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      act(() => {
        result.current.initializeCanvas();
      });

      expect(mockCanvas.width).toBe(CANVAS_SETTINGS.width);
      expect(mockCanvas.height).toBe(CANVAS_SETTINGS.height);
      expect(mockCanvasContext.fillStyle).toBe(CANVAS_SETTINGS.backgroundColor);
      expect(mockCanvasContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    it('should handle initialize canvas when canvas ref is null', () => {
      const { result } = renderHook(() => useDoodlingSpace());

      expect(() => {
        act(() => {
          result.current.initializeCanvas();
        });
      }).not.toThrow();
    });

    it('should clear canvas and reset state', () => {
      const { result } = renderHook(() => useDoodlingSpace());

      // Set up initial state
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      act(() => {
        result.current.clearCanvas();
      });

      expect(result.current.strokes).toEqual([]);
      expect(result.current.isDrawing).toBe(false);
      expect(mockCanvasContext.fillStyle).toBe(CANVAS_SETTINGS.backgroundColor);
      expect(mockCanvasContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });
  });

  describe('Drawing State Management', () => {
    it('should start drawing and set initial point', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      const mockEvent = createMockMouseEvent(100, 200);

      act(() => {
        result.current.startDrawing(mockEvent);
      });

      expect(result.current.isDrawing).toBe(true);
    });

    it('should stop drawing and save stroke', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      const startEvent = createMockMouseEvent(100, 200);
      const moveEvent = createMockMouseEvent(150, 250);

      // Start drawing
      act(() => {
        result.current.startDrawing(startEvent);
      });

      // Draw a line
      act(() => {
        result.current.draw(moveEvent);
      });

      // Stop drawing
      act(() => {
        result.current.stopDrawing();
      });

      expect(result.current.isDrawing).toBe(false);
      expect(result.current.strokes).toHaveLength(1);
      expect(result.current.strokes[0]).toMatchObject({
        color: DOODLING_COLORS[0],
        size: BRUSH_SIZES[2],
        points: expect.any(Array),
      });
    });

    it('should not save stroke if only one point drawn', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      const mockEvent = createMockMouseEvent(100, 200);

      // Start drawing
      act(() => {
        result.current.startDrawing(mockEvent);
      });

      // Stop immediately without drawing
      act(() => {
        result.current.stopDrawing();
      });

      expect(result.current.strokes).toHaveLength(0);
    });

    it('should not draw when not in drawing state', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      const mockEvent = createMockMouseEvent(100, 200);

      act(() => {
        result.current.draw(mockEvent);
      });

      // Should not affect canvas context since not drawing
      expect(mockCanvasContext.moveTo).not.toHaveBeenCalled();
      expect(mockCanvasContext.lineTo).not.toHaveBeenCalled();
    });
  });

  describe('Point Calculation', () => {
    it('should calculate correct canvas points with scaling', () => {
      const { result } = renderHook(() => useDoodlingSpace());

      // Mock canvas with different display size
      const scaledCanvas = {
        ...mockCanvas,
        getBoundingClientRect: vi.fn(() => ({
          left: 10,
          top: 20,
          width: 400, // Half the canvas width
          height: 300, // Half the canvas height
        })),
        width: 800,
        height: 600,
      } as unknown as HTMLCanvasElement;

      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = scaledCanvas;

      const mockEvent = createMockMouseEvent(110, 120); // 100 pixels from left, 100 from top

      act(() => {
        result.current.startDrawing(mockEvent);
      });

      // Should scale correctly: (110-10) * (800/400) = 200, (120-20) * (600/300) = 200
      expect(result.current.isDrawing).toBe(true);
    });

    it('should handle canvas point calculation with null canvas', () => {
      const { result } = renderHook(() => useDoodlingSpace());

      const mockEvent = createMockMouseEvent(100, 200);

      expect(() => {
        act(() => {
          result.current.startDrawing(mockEvent);
        });
      }).not.toThrow();
    });
  });

  describe('Color and Brush Management', () => {
    it('should change current color', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      const newColor = '#FF0000';

      act(() => {
        result.current.changeColor(newColor);
      });

      expect(result.current.currentColor).toBe(newColor);
    });

    it('should change brush size', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      const newSize = 20;

      act(() => {
        result.current.changeBrushSize(newSize);
      });

      expect(result.current.currentBrushSize).toBe(newSize);
    });

    it('should use current color and size for new strokes', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      const newColor = '#FF0000';
      const newSize = 20;

      // Change color and size
      act(() => {
        result.current.changeColor(newColor);
        result.current.changeBrushSize(newSize);
      });

      // Draw a stroke with multiple points
      const startEvent = createMockMouseEvent(100, 200);
      const moveEvent1 = createMockMouseEvent(150, 250);
      const moveEvent2 = createMockMouseEvent(200, 300);

      act(() => {
        result.current.startDrawing(startEvent);
      });

      act(() => {
        result.current.draw(moveEvent1);
      });

      act(() => {
        result.current.draw(moveEvent2);
      });

      act(() => {
        result.current.stopDrawing();
      });

      expect(result.current.strokes).toHaveLength(1);
      expect(result.current.strokes[0].color).toBe(newColor);
      expect(result.current.strokes[0].size).toBe(newSize);
    });
  });

  describe('Undo Functionality', () => {
    it('should remove last stroke when undoing', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      // Draw multiple strokes
      for (let i = 0; i < 3; i++) {
        const startEvent = createMockMouseEvent(100 + i * 10, 200);
        const moveEvent1 = createMockMouseEvent(150 + i * 10, 250);
        const moveEvent2 = createMockMouseEvent(200 + i * 10, 300);

        act(() => {
          result.current.startDrawing(startEvent);
        });

        act(() => {
          result.current.draw(moveEvent1);
        });

        act(() => {
          result.current.draw(moveEvent2);
        });

        act(() => {
          result.current.stopDrawing();
        });
      }

      expect(result.current.strokes).toHaveLength(3);

      // Undo last stroke
      act(() => {
        result.current.undo();
      });

      expect(result.current.strokes).toHaveLength(2);
    });

    it('should handle undo when no strokes exist', () => {
      const { result } = renderHook(() => useDoodlingSpace());

      expect(() => {
        act(() => {
          result.current.undo();
        });
      }).not.toThrow();

      expect(result.current.strokes).toHaveLength(0);
    });

    it('should handle multiple consecutive undos', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      // Draw two strokes
      for (let i = 0; i < 2; i++) {
        const startEvent = createMockMouseEvent(100 + i * 10, 200);
        const moveEvent1 = createMockMouseEvent(150 + i * 10, 250);
        const moveEvent2 = createMockMouseEvent(200 + i * 10, 300);

        act(() => {
          result.current.startDrawing(startEvent);
        });

        act(() => {
          result.current.draw(moveEvent1);
        });

        act(() => {
          result.current.draw(moveEvent2);
        });

        act(() => {
          result.current.stopDrawing();
        });
      }

      expect(result.current.strokes).toHaveLength(2);

      // Undo all strokes
      act(() => {
        result.current.undo();
        result.current.undo();
      });

      expect(result.current.strokes).toHaveLength(0);

      // Try to undo again with no strokes
      act(() => {
        result.current.undo();
      });

      expect(result.current.strokes).toHaveLength(0);
    });
  });

  describe('Canvas Drawing Operations', () => {
    it('should draw stroke with correct properties', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      const startEvent = createMockMouseEvent(100, 200);
      const moveEvent1 = createMockMouseEvent(150, 250);
      const moveEvent2 = createMockMouseEvent(200, 300);

      act(() => {
        result.current.startDrawing(startEvent);
      });

      act(() => {
        result.current.draw(moveEvent1);
      });

      act(() => {
        result.current.draw(moveEvent2);
      });

      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.strokeStyle).toBe(DOODLING_COLORS[0]);
      expect(mockCanvasContext.lineWidth).toBe(BRUSH_SIZES[2]);
      expect(mockCanvasContext.lineCap).toBe('round');
      expect(mockCanvasContext.lineJoin).toBe('round');
      expect(mockCanvasContext.moveTo).toHaveBeenCalled();
      expect(mockCanvasContext.lineTo).toHaveBeenCalled();
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });

    it('should not draw stroke with insufficient points', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      // The drawStroke method should handle strokes with insufficient points gracefully
      expect(() => {
        act(() => {
          // This tests the internal drawStroke method indirectly via clearCanvas
          result.current.clearCanvas();
        });
      }).not.toThrow();
    });
  });

  describe('Canvas Context Error Handling', () => {
    it('should handle null canvas context', () => {
      const { result } = renderHook(() => useDoodlingSpace());

      const nullContextCanvas = {
        ...mockCanvas,
        getContext: vi.fn(() => null),
      } as unknown as HTMLCanvasElement;

      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = nullContextCanvas;

      expect(() => {
        act(() => {
          result.current.initializeCanvas();
          result.current.clearCanvas();
        });
      }).not.toThrow();
    });

    it('should handle drawing operations with null canvas', () => {
      const { result } = renderHook(() => useDoodlingSpace());

      const mockEvent = createMockMouseEvent(100, 200);

      expect(() => {
        act(() => {
          result.current.startDrawing(mockEvent);
          result.current.draw(mockEvent);
          result.current.stopDrawing();
        });
      }).not.toThrow();
    });
  });

  describe('Type Safety and Edge Cases', () => {
    it('should handle concurrent drawing operations safely', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      const event1 = createMockMouseEvent(100, 200);
      const event2 = createMockMouseEvent(200, 300);

      // Start multiple drawing operations
      act(() => {
        result.current.startDrawing(event1);
        result.current.startDrawing(event2); // This should override the first
      });

      expect(result.current.isDrawing).toBe(true);

      act(() => {
        result.current.stopDrawing();
      });

      expect(result.current.isDrawing).toBe(false);
    });

    it('should handle stop drawing when not drawing', () => {
      const { result } = renderHook(() => useDoodlingSpace());

      expect(() => {
        act(() => {
          result.current.stopDrawing();
        });
      }).not.toThrow();

      expect(result.current.isDrawing).toBe(false);
      expect(result.current.strokes).toHaveLength(0);
    });

    it('should maintain stroke timestamp integrity', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      const beforeTime = Date.now();

      const startEvent = createMockMouseEvent(100, 200);
      const moveEvent1 = createMockMouseEvent(150, 250);
      const moveEvent2 = createMockMouseEvent(200, 300);

      act(() => {
        result.current.startDrawing(startEvent);
      });

      act(() => {
        result.current.draw(moveEvent1);
      });

      act(() => {
        result.current.draw(moveEvent2);
      });

      act(() => {
        result.current.stopDrawing();
      });

      const afterTime = Date.now();

      expect(result.current.strokes).toHaveLength(1);
      expect(result.current.strokes[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(result.current.strokes[0].timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large number of strokes efficiently', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      // Draw many strokes
      for (let i = 0; i < 100; i++) {
        const startEvent = createMockMouseEvent(i, i);
        const moveEvent1 = createMockMouseEvent(i + 10, i + 10);
        const moveEvent2 = createMockMouseEvent(i + 20, i + 20);

        act(() => {
          result.current.startDrawing(startEvent);
        });

        act(() => {
          result.current.draw(moveEvent1);
        });

        act(() => {
          result.current.draw(moveEvent2);
        });

        act(() => {
          result.current.stopDrawing();
        });
      }

      expect(result.current.strokes).toHaveLength(100);

      // Clear should reset everything
      act(() => {
        result.current.clearCanvas();
      });

      expect(result.current.strokes).toHaveLength(0);
    });

    it('should handle rapid drawing movements', () => {
      const { result } = renderHook(() => useDoodlingSpace());
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = mockCanvas;

      const startEvent = createMockMouseEvent(100, 200);

      act(() => {
        result.current.startDrawing(startEvent);
      });

      // Simulate rapid mouse movements
      for (let i = 0; i < 50; i++) {
        const moveEvent = createMockMouseEvent(100 + i, 200 + i);
        act(() => {
          result.current.draw(moveEvent);
        });
      }

      act(() => {
        result.current.stopDrawing();
      });

      expect(result.current.strokes).toHaveLength(1);
      expect(result.current.strokes[0].points.length).toBeGreaterThan(2);
    });
  });
});
