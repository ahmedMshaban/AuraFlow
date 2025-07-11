import { useState, useRef, useCallback, useEffect } from 'react';
import { DOODLING_COLORS, BRUSH_SIZES, CANVAS_SETTINGS } from '../constants/constants';
import type { Point, DrawingStroke } from '../types/activities.types';

/**
 * Custom hook for managing a digital doodling/drawing canvas.
 * Provides comprehensive drawing functionality including stroke management,
 * color/brush selection, canvas operations, and undo capabilities.
 *
 * Features:
 * - Real-time drawing with mouse events
 * - Multiple colors and brush sizes
 * - Stroke management and persistence
 * - Undo functionality
 * - Canvas scaling and coordinate transformation
 * - Performance optimized rendering
 *
 * @returns {Object} Doodling space state and controls
 * @returns {React.RefObject<HTMLCanvasElement>} canvasRef - Reference to the canvas element
 * @returns {boolean} isDrawing - Whether user is currently drawing
 * @returns {string} currentColor - Currently selected drawing color
 * @returns {number} currentBrushSize - Currently selected brush size
 * @returns {DrawingStroke[]} strokes - Array of completed drawing strokes
 * @returns {Function} startDrawing - Start drawing handler for mouse down
 * @returns {Function} draw - Continue drawing handler for mouse move
 * @returns {Function} stopDrawing - Stop drawing handler for mouse up
 * @returns {Function} clearCanvas - Clear all strokes and reset canvas
 * @returns {Function} changeColor - Change the current drawing color
 * @returns {Function} changeBrushSize - Change the current brush size
 * @returns {Function} undo - Remove the last drawn stroke
 * @returns {Function} initializeCanvas - Initialize canvas dimensions and background
 * @returns {string[]} availableColors - Array of available drawing colors
 * @returns {number[]} availableBrushSizes - Array of available brush sizes
 * @returns {Object} canvasSettings - Canvas configuration settings
 *
 * @example
 * ```typescript
 * const {
 *   canvasRef,
 *   isDrawing,
 *   currentColor,
 *   currentBrushSize,
 *   strokes,
 *   startDrawing,
 *   draw,
 *   stopDrawing,
 *   clearCanvas,
 *   changeColor,
 *   changeBrushSize,
 *   undo,
 *   initializeCanvas,
 *   availableColors,
 *   availableBrushSizes
 * } = useDoodlingSpace();
 *
 * // Initialize canvas on mount
 * useEffect(() => {
 *   initializeCanvas();
 * }, [initializeCanvas]);
 *
 * // Render canvas with event handlers
 * <canvas
 *   ref={canvasRef}
 *   onMouseDown={startDrawing}
 *   onMouseMove={draw}
 *   onMouseUp={stopDrawing}
 *   onMouseLeave={stopDrawing}
 * />
 *
 * // Color picker
 * {availableColors.map(color => (
 *   <button
 *     key={color}
 *     onClick={() => changeColor(color)}
 *     style={{ backgroundColor: color }}
 *   />
 * ))}
 * ```
 *
 * @see {@link Point} For point coordinate structure
 * @see {@link DrawingStroke} For stroke data structure
 * @see {@link DOODLING_COLORS} For available color constants
 * @see {@link BRUSH_SIZES} For available brush size constants
 * @see {@link CANVAS_SETTINGS} For canvas configuration constants
 */
export const useDoodlingSpace = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(DOODLING_COLORS[0]);
  const [currentBrushSize, setCurrentBrushSize] = useState(BRUSH_SIZES[2]); // Default to medium size
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  const getCanvasPoint = useCallback((event: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }, []);

  const drawStroke = useCallback((stroke: DrawingStroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (stroke.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = CANVAS_SETTINGS.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw all strokes
    strokes.forEach((stroke) => drawStroke(stroke));
  }, [strokes, drawStroke]);

  const startDrawing = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDrawing(true);
      const point = getCanvasPoint(event);
      setCurrentStroke([point]);
    },
    [getCanvasPoint],
  );

  const draw = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const point = getCanvasPoint(event);
      const newStroke = [...currentStroke, point];
      setCurrentStroke(newStroke);

      // Draw the current stroke in real-time
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (newStroke.length >= 2) {
        const lastPoint = newStroke[newStroke.length - 2];
        const currentPoint = newStroke[newStroke.length - 1];

        ctx.beginPath();
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentBrushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
      }
    },
    [isDrawing, currentStroke, getCanvasPoint, currentColor, currentBrushSize],
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (currentStroke.length > 1) {
      const newStroke: DrawingStroke = {
        points: currentStroke,
        color: currentColor,
        size: currentBrushSize,
        timestamp: Date.now(),
      };
      setStrokes((prev) => [...prev, newStroke]);
    }

    setCurrentStroke([]);
  }, [isDrawing, currentStroke, currentColor, currentBrushSize]);

  const clearCanvas = useCallback(() => {
    setStrokes([]);
    setCurrentStroke([]);
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = CANVAS_SETTINGS.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const changeColor = useCallback((color: string) => {
    setCurrentColor(color);
  }, []);

  const changeBrushSize = useCallback((size: number) => {
    setCurrentBrushSize(size);
  }, []);

  const undo = useCallback(() => {
    if (strokes.length === 0) return;

    setStrokes((prev) => prev.slice(0, -1));
  }, [strokes.length]);

  // Initialize canvas
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_SETTINGS.width;
    canvas.height = CANVAS_SETTINGS.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = CANVAS_SETTINGS.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Auto-redraw canvas when strokes change (for undo functionality)
  useEffect(() => {
    redrawCanvas();
  }, [strokes, redrawCanvas]);

  return {
    // State
    canvasRef,
    isDrawing,
    currentColor,
    currentBrushSize,
    strokes,

    // Actions
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    changeColor,
    changeBrushSize,
    undo,
    initializeCanvas,

    // Constants
    availableColors: DOODLING_COLORS,
    availableBrushSizes: BRUSH_SIZES,
    canvasSettings: CANVAS_SETTINGS,
  };
};
