export type FaceExpressions = {
  angry: number;
  disgusted: number;
  fearful: number;
  happy: number;
  neutral: number;
  sad: number;
  surprised: number;
};

export type StressAnalysisResult = {
  /** Overall stress level from 0-100 */
  stressLevel: number;
  /** Dominant expression detected */
  dominantExpression: string;
  /** Raw expression scores */
  expressions: FaceExpressions | Record<string, number>;
  /** Whether stress level is considered high */
  isStressed: boolean;
  /** Timestamp when analysis was performed - can be Date or number for serialization */
  timestamp: Date | number;
};
