import { useEffect } from 'react';
import { FaPalette, FaUndo, FaTrash } from 'react-icons/fa';
import { useDoodlingSpace } from '../infrastructure/hooks/useDoodlingSpace';
import styles from '../infrastructure/styles/DoodlingSpace.module.css';

/**
 * Props for the DoodlingSpace component.
 */
interface DoodlingSpaceProps {
  /** Optional CSS class name for styling customization */
  className?: string;
}

/**
 * A digital drawing canvas component for creative expression and stress relief.
 * Provides a full-featured drawing interface with color selection, brush controls,
 * and canvas management tools for therapeutic doodling and artistic expression.
 *
 * Features:
 * - Interactive drawing canvas with mouse/touch support
 * - Multiple color options and brush sizes
 * - Undo functionality for mistake correction
 * - Clear canvas option for fresh starts
 * - Stroke persistence and management
 * - Responsive design for various screen sizes
 * - Performance-optimized rendering
 *
 * Therapeutic Benefits:
 * - Stress reduction through creative expression
 * - Mindfulness through focused drawing activity
 * - Emotional release and self-expression
 * - Improved focus and concentration
 *
 * @param props - The component props
 * @param props.className - Optional CSS class for styling customization
 * @returns A complete digital doodling interface
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DoodlingSpace />
 *
 * // With custom styling
 * <DoodlingSpace className="custom-doodle-space" />
 * ```
 *
 * @note The canvas automatically initializes on component mount
 * @note All drawings are temporary and not persisted between sessions
 * @see {@link useDoodlingSpace} For drawing logic and canvas management
 */
const DoodlingSpace: React.FC<DoodlingSpaceProps> = ({ className }) => {
  const {
    canvasRef,
    isDrawing,
    currentColor,
    currentBrushSize,
    strokes,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    changeColor,
    changeBrushSize,
    undo,
    initializeCanvas,
    availableColors,
    availableBrushSizes,
  } = useDoodlingSpace();

  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  return (
    <div className={`${styles.doodlingContainer} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Doodling Space</h3>
        <p className={styles.subtitle}>Express yourself through digital art and free your mind</p>
      </div>

      <div className={styles.canvasSection}>
        <div className={styles.toolbar}>
          {/* Color Picker */}
          <div className={styles.toolGroup}>
            <label className={styles.toolLabel}>
              <FaPalette className={styles.toolIcon} />
              Colors
            </label>
            <div className={styles.colorPalette}>
              {availableColors.map((color) => (
                <button
                  key={color}
                  className={`${styles.colorButton} ${currentColor === color ? styles.active : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => changeColor(color)}
                  title={`Select ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div className={styles.toolGroup}>
            <label className={styles.toolLabel}>Brush Size</label>
            <div className={styles.brushSizes}>
              {availableBrushSizes.map((size) => (
                <button
                  key={size}
                  className={`${styles.brushButton} ${currentBrushSize === size ? styles.active : ''}`}
                  onClick={() => changeBrushSize(size)}
                  title={`Brush size ${size}px`}
                >
                  <div
                    className={styles.brushPreview}
                    style={{
                      width: `${Math.min(size, 20)}px`,
                      height: `${Math.min(size, 20)}px`,
                      backgroundColor: currentColor,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.toolGroup}>
            <label className={styles.toolLabel}>Actions</label>
            <div className={styles.actionButtons}>
              <button
                className={`${styles.actionButton} ${styles.undoButton}`}
                onClick={undo}
                disabled={strokes.length === 0}
                title="Undo last stroke"
              >
                <FaUndo />
                <span>Undo</span>
              </button>
              <button
                className={`${styles.actionButton} ${styles.clearButton}`}
                onClick={clearCanvas}
                disabled={strokes.length === 0}
                title="Clear canvas"
              >
                <FaTrash />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          {strokes.length === 0 && !isDrawing && (
            <div className={styles.canvasPlaceholder}>
              <FaPalette className={styles.placeholderIcon} />
              <p>Start drawing to express your creativity!</p>
              <p className={styles.placeholderHint}>Click and drag to draw</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Strokes:</span>
          <span className={styles.statValue}>{strokes.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Current Tool:</span>
          <span className={styles.statValue}>
            <div
              className={styles.currentColorIndicator}
              style={{ backgroundColor: currentColor }}
            />
            {currentBrushSize}px Brush
          </span>
        </div>
      </div>
    </div>
  );
};

export default DoodlingSpace;
