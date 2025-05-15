export interface RecordingOptions {
  /** Recording duration in milliseconds */
  duration?: number;
  /** MIME type for the recording */
  mimeType?: string;
}

export interface RecordingResult {
  /** The recorded media as a Blob */
  blob: Blob;
  /** URL that can be used to view the recording */
  url: string;
  /** Duration of the recording in milliseconds */
  duration: number;
}
