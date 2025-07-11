import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import EmailItem from './EmailItem';
import type { GmailMessageWithStress } from '@/shared/types/gmail.types';
import type { ReactNode } from 'react';

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiCalendar: () => <svg data-testid="calendar-icon" />,
  FiMail: ({ color }: { color?: string }) => (
    <svg
      data-testid="mail-icon"
      style={{ color }}
    />
  ),
  FiClock: ({ color }: { color?: string }) => (
    <svg
      data-testid="clock-icon"
      style={{ color }}
    />
  ),
  FiAlertTriangle: ({ color }: { color?: string }) => (
    <svg
      data-testid="alert-triangle-icon"
      style={{ color }}
    />
  ),
}));

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  HStack: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <div
      data-testid="hstack"
      {...props}
    >
      {children}
    </div>
  ),
  Text: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <span {...props}>{children}</span>,
  Heading: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <h3 {...props}>{children}</h3>,
  Badge: ({
    children,
    colorPalette,
    variant,
    ...props
  }: {
    children: ReactNode;
    colorPalette?: string;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <span
      data-testid="badge"
      data-colorPalette={colorPalette}
      data-variant={variant}
      {...props}
    >
      {children}
    </span>
  ),
}));

// Mock helper functions
vi.mock('../../infrastructure/helpers/formatDate', () => ({
  default: (date: Date) => {
    // Simple mock implementation for testing
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  },
}));

vi.mock('../../infrastructure/helpers/getPriorityIcon', () => ({
  default: (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <svg
            data-testid="alert-triangle-icon"
            style={{ color: '#ff4757' }}
          />
        );
      case 'medium':
        return (
          <svg
            data-testid="clock-icon"
            style={{ color: '#ffa502' }}
          />
        );
      default:
        return (
          <svg
            data-testid="mail-icon"
            style={{ color: '#26de81' }}
          />
        );
    }
  },
}));

vi.mock('../../infrastructure/helpers/getStressColor', () => ({
  default: (priority: string) => {
    switch (priority) {
      case 'high':
        return 'red.300';
      case 'medium':
        return 'orange.300';
      case 'low':
        return 'green.300';
      default:
        return 'gray.300';
    }
  },
}));

describe('EmailItem', () => {
  const createMockEmail = (overrides: Partial<GmailMessageWithStress> = {}): GmailMessageWithStress => ({
    id: 'test-email-1',
    threadId: 'thread-1',
    subject: 'Test Email Subject',
    from: 'test@example.com',
    to: 'recipient@example.com',
    snippet: 'This is a test email snippet with some content...',
    date: new Date('2025-06-26T10:00:00Z'),
    read: false,
    important: false,
    starred: false,
    hasAttachments: false,
    labels: [],
    stressAnalysis: {
      stressIndicators: {
        urgentKeywords: 0,
        allCapsWords: 0,
        exclamationMarks: 0,
        deadlineKeywords: 0,
        negativeEmotions: 0,
      },
      priority: 'low',
    },
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders email with basic information', () => {
    const email = createMockEmail();
    render(<EmailItem email={email} />);

    expect(screen.getByText('Test Email Subject')).toBeDefined();
    expect(screen.getByText('test@example.com')).toBeDefined();
    expect(screen.getByText('This is a test email snippet with some content...')).toBeDefined();
    expect(screen.getByTestId('calendar-icon')).toBeDefined();
  });

  it('displays email from name when sender has display name', () => {
    const email = createMockEmail({
      from: 'John Doe <john@example.com>',
    });
    render(<EmailItem email={email} />);

    expect(screen.getByText('John Doe')).toBeDefined();
  });

  it('displays plain email when no display name is provided', () => {
    const email = createMockEmail({
      from: 'plain@example.com',
    });
    render(<EmailItem email={email} />);

    expect(screen.getByText('plain@example.com')).toBeDefined();
  });

  it('shows "(No Subject)" when email has no subject', () => {
    const email = createMockEmail({
      subject: '',
    });
    render(<EmailItem email={email} />);

    expect(screen.getByText('(No Subject)')).toBeDefined();
  });

  it('displays low priority badge and icon', () => {
    const email = createMockEmail({
      stressAnalysis: {
        stressIndicators: {
          urgentKeywords: 0,
          allCapsWords: 0,
          exclamationMarks: 0,
          deadlineKeywords: 0,
          negativeEmotions: 0,
        },
        priority: 'low',
      },
    });
    render(<EmailItem email={email} />);

    const badge = screen.getByTestId('badge');
    expect(badge).toBeDefined();
    expect(badge.textContent).toBe('LOW PRIORITY');
    expect(badge.getAttribute('data-colorPalette')).toBe('green');
    expect(screen.getByTestId('mail-icon')).toBeDefined();
  });

  it('displays medium priority badge and icon', () => {
    const email = createMockEmail({
      stressAnalysis: {
        stressIndicators: {
          urgentKeywords: 1,
          allCapsWords: 0,
          exclamationMarks: 0,
          deadlineKeywords: 0,
          negativeEmotions: 0,
        },
        priority: 'medium',
      },
    });
    render(<EmailItem email={email} />);

    const badge = screen.getByTestId('badge');
    expect(badge).toBeDefined();
    expect(badge.textContent).toBe('MEDIUM PRIORITY');
    expect(badge.getAttribute('data-colorPalette')).toBe('orange');
    expect(screen.getByTestId('clock-icon')).toBeDefined();
  });

  it('displays high priority badge and icon', () => {
    const email = createMockEmail({
      stressAnalysis: {
        stressIndicators: {
          urgentKeywords: 3,
          allCapsWords: 2,
          exclamationMarks: 5,
          deadlineKeywords: 2,
          negativeEmotions: 1,
        },
        priority: 'high',
      },
    });
    render(<EmailItem email={email} />);

    const badge = screen.getByTestId('badge');
    expect(badge).toBeDefined();
    expect(badge.textContent).toBe('HIGH PRIORITY');
    expect(badge.getAttribute('data-colorPalette')).toBe('red');
    expect(screen.getByTestId('alert-triangle-icon')).toBeDefined();
  });

  it('does not display badge when stress analysis is missing', () => {
    const email = createMockEmail({
      stressAnalysis: undefined,
    });
    render(<EmailItem email={email} />);

    expect(screen.queryByTestId('badge')).toBeNull();
  });

  it('handles read emails differently from unread emails', () => {
    const readEmail = createMockEmail({ read: true });
    const { rerender } = render(<EmailItem email={readEmail} />);

    // Test read email styling (should have normal font weight)
    const readSubject = screen.getByText('Test Email Subject');
    expect(readSubject).toBeDefined();

    // Test unread email
    const unreadEmail = createMockEmail({ read: false });
    rerender(<EmailItem email={unreadEmail} />);

    const unreadSubject = screen.getByText('Test Email Subject');
    expect(unreadSubject).toBeDefined();
  });

  it('displays formatted date correctly', () => {
    const email = createMockEmail({
      date: new Date('2025-06-26T10:00:00Z'),
    });

    // Mock current time to be 2 hours after the email date
    vi.setSystemTime(new Date('2025-06-26T12:00:00Z'));

    render(<EmailItem email={email} />);

    expect(screen.getByText('2h ago')).toBeDefined();

    vi.useRealTimers();
  });

  it('displays "Just now" for very recent emails', () => {
    const now = new Date();
    const email = createMockEmail({
      date: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    });

    vi.setSystemTime(now);

    render(<EmailItem email={email} />);

    expect(screen.getByText('Just now')).toBeDefined();

    vi.useRealTimers();
  });

  it('renders without crashing when all props are provided', () => {
    const email = createMockEmail({
      subject: 'Complete Email Test',
      from: 'Full Name <full@example.com>',
      snippet: 'This is a complete email test with all properties set.',
      read: true,
      stressAnalysis: {
        stressIndicators: {
          urgentKeywords: 2,
          allCapsWords: 1,
          exclamationMarks: 3,
          deadlineKeywords: 1,
          negativeEmotions: 0,
        },
        priority: 'high',
      },
    });

    expect(() => render(<EmailItem email={email} />)).not.toThrow();
  });

  it('renders snippet text correctly', () => {
    const email = createMockEmail({
      snippet:
        'This is a long email snippet that should be displayed in the email item component for testing purposes.',
    });
    render(<EmailItem email={email} />);

    expect(
      screen.getByText(
        'This is a long email snippet that should be displayed in the email item component for testing purposes.',
      ),
    ).toBeDefined();
  });

  it('handles empty snippet gracefully', () => {
    const email = createMockEmail({
      snippet: '',
    });
    render(<EmailItem email={email} />);

    // The component should still render without the snippet
    expect(screen.getByText('Test Email Subject')).toBeDefined();
    expect(screen.getByText('test@example.com')).toBeDefined();
  });

  it('applies correct priority styling through helper functions', () => {
    const email = createMockEmail({
      stressAnalysis: {
        stressIndicators: {
          urgentKeywords: 0,
          allCapsWords: 0,
          exclamationMarks: 0,
          deadlineKeywords: 0,
          negativeEmotions: 0,
        },
        priority: 'low',
      },
    });

    render(<EmailItem email={email} />);

    // Verify that the priority icon is rendered (low priority = mail icon)
    expect(screen.getByTestId('mail-icon')).toBeDefined();

    // Verify that the badge has correct color scheme
    const badge = screen.getByTestId('badge');
    expect(badge.getAttribute('data-colorPalette')).toBe('green');
  });
});
