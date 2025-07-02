import { useState, useRef, useCallback } from 'react';
import { DOODLING_COLORS, BRUSH_SIZES, CANVAS_SETTINGS } from '../constants/constants';
import type { Point, DrawingStroke } from '../types/activities.types';

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

    // Redraw canvas without the last stroke
    setTimeout(redrawCanvas, 0);
  }, [strokes, redrawCanvas]);

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
