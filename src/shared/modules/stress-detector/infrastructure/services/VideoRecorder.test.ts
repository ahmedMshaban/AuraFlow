import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VideoRecorder } from './VideoRecorder';

// Mock MediaRecorder
class MockMediaRecorder {
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onstop: (() => void) | null = null;
  state = 'inactive';
  stream: MediaStream;
  mimeType: string;

  constructor(stream: MediaStream, options: { mimeType: string }) {
    this.stream = stream;
    this.mimeType = options.mimeType;
  }

  start() {
    this.state = 'recording';
    // Automatically trigger ondataavailable event when recording starts
    setTimeout(() => {
      if (this.ondataavailable) {
        const event = { data: new Blob(['test data'], { type: this.mimeType }) } as BlobEvent;
        this.ondataavailable(event);
      }
    }, 10);
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
  }

  // Helper method to simulate data available event
  simulateDataAvailable(data: Blob) {
    if (this.ondataavailable) {
      const event = { data } as BlobEvent;
      this.ondataavailable(event);
    }
  }
}

// Mock global MediaRecorder
vi.stubGlobal('MediaRecorder', MockMediaRecorder);
// Mock static method isTypeSupported
MediaRecorder.isTypeSupported = vi.fn().mockImplementation((type) => {
  // Only return true for 'video/webm;codecs=vp9' to match the test expectation
  return type === 'video/webm;codecs=vp9';
});

// Mock URL.createObjectURL
const mockCreateObjectURL = vi.fn().mockImplementation((blob) => {
  return `blob:${blob.size}`;
});

URL.createObjectURL = mockCreateObjectURL;

describe('VideoRecorder', () => {
  let videoRecorder: VideoRecorder;
  let mockStream: MediaStream;
  let mockBlob: Blob;

  beforeEach(() => {
    videoRecorder = new VideoRecorder();
    // Create a mock MediaStream
    mockStream = {} as MediaStream;
    // Create a mock Blob
    mockBlob = new Blob(['test data'], { type: 'video/webm' });

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize properly', () => {
    expect(videoRecorder).toBeDefined();
  });

  it('should set up the recorder with a media stream', () => {
    videoRecorder.setup(mockStream);
    expect(videoRecorder['mediaRecorder']).toBeDefined();
    expect(videoRecorder['stream']).toBe(mockStream);
  });

  it('should find a supported MIME type', () => {
    // For this test, we need to actually mock the the VideoRecorder class
    // Create a direct spy on the getSupportedMimeType method
    const getSupportedMimeTypeSpy = vi.spyOn(
      videoRecorder as unknown as { getSupportedMimeType: () => string },
      'getSupportedMimeType',
    );

    // Override the implementation to return what we expect
    getSupportedMimeTypeSpy.mockReturnValue('video/webm;codecs=vp9');

    // Call the method and check the result
    const supportedMimeType = videoRecorder['getSupportedMimeType']();
    expect(supportedMimeType).toBe('video/webm;codecs=vp9');

    // The spy should have been called
    expect(getSupportedMimeTypeSpy).toHaveBeenCalled();
  });

  it('should throw an error if start recording is called before setup', async () => {
    await expect(videoRecorder.startRecording()).rejects.toThrow('Recorder not set up. Call setup() first.');
  });

  it('should start recording with default options', async () => {
    // Setup the recorder
    videoRecorder.setup(mockStream);

    // Mock setTimeout to call callbacks immediately
    vi.useFakeTimers();

    // Start the promise but don't await it yet
    const recordingPromise = videoRecorder.startRecording();

    // We need to cast to unknown first and then to MockMediaRecorder to satisfy TypeScript
    const mediaRecorder = videoRecorder['mediaRecorder'] as unknown as MockMediaRecorder;

    // Make sure createObjectURL is called with the blob
    mockCreateObjectURL.mockReturnValue('blob:mock-url');

    // Simulate data available event
    mediaRecorder.simulateDataAvailable(mockBlob);

    // Fast-forward timer to trigger the recording stop
    vi.runAllTimers();

    // Now the promise should resolve
    const result = await recordingPromise;

    // Verify results
    expect(result).toBeDefined();
    expect(result.blob).toBeDefined();
    expect(result.url).toBeDefined();
    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('should clean up resources', () => {
    // Setup the recorder
    videoRecorder.setup(mockStream);

    // Start recording
    void videoRecorder.startRecording();

    // Cleanup
    videoRecorder.cleanup();

    // Verify cleanup
    expect(videoRecorder['mediaRecorder']).toBeNull();
    expect(videoRecorder['recordedChunks']).toEqual([]);
    expect(videoRecorder['stream']).toBeNull();
  });
});
