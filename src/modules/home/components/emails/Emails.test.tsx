import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Emails from './Emails';
import type { EmailsProps } from '../../infrastructure/types/emails.types';
import type { GmailMessageWithStress } from '@/shared/types/gmail.types';
import type { ReactNode } from 'react';

// Mock the custom hooks
vi.mock('@/shared/hooks/useStressAnalytics', () => ({
  useStressAnalytics: vi.fn(),
}));

// Mock react-router
vi.mock('react-router', () => ({
  Link: ({ children, to, ...props }: { children: ReactNode; to: string; [key: string]: unknown }) => (
    <a
      href={to}
      {...props}
    >
      {children}
    </a>
  ),
}));

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiMail: ({ size }: { size?: number }) => (
    <svg
      data-testid="mail-icon"
      width={size}
      height={size}
    />
  ),
  FiAlertTriangle: () => <svg data-testid="alert-triangle-icon" />,
}));

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    onClick,
    variant,
    colorPalette,
    size,
    loading,
    loadingText,
    ...props
  }: {
    children: ReactNode;
    onClick?: () => void;
    variant?: string;
    colorPalette?: string;
    size?: string;
    loading?: boolean;
    loadingText?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      disabled={loading}
      data-variant={variant}
      data-colorPalette={colorPalette}
      data-size={size}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  ),
  VStack: ({ children, gap, py, align }: { children: ReactNode; gap?: number; py?: number; align?: string }) => (
    <div
      data-gap={gap}
      data-py={py}
      data-align={align}
    >
      {children}
    </div>
  ),
  HStack: ({ children, justify, alignItems }: { children: ReactNode; justify?: string; alignItems?: string }) => (
    <div
      data-justify={justify}
      data-align-items={alignItems}
    >
      {children}
    </div>
  ),
  Text: ({
    children,
    as,
    fontWeight,
    fontSize,
    color,
    ...props
  }: {
    children: ReactNode;
    as?: string;
    fontWeight?: string;
    fontSize?: string;
    color?: string;
    [key: string]: unknown;
  }) => {
    const Tag = as || 'p';
    return React.createElement(Tag, { style: { fontWeight, fontSize, color }, ...props }, children);
  },
  Heading: ({ children, size, color, mb }: { children: ReactNode; size?: string; color?: string; mb?: number }) => (
    <h2
      data-size={size}
      style={{ color, marginBottom: mb }}
    >
      {children}
    </h2>
  ),
  Badge: ({
    children,
    colorPalette,
    variant,
    ml,
    size,
  }: {
    children: ReactNode;
    colorPalette?: string;
    variant?: string;
    ml?: number;
    size?: string;
  }) => (
    <span
      data-colorPalette={colorPalette}
      data-variant={variant}
      data-ml={ml}
      data-size={size}
    >
      {children}
    </span>
  ),
  Spinner: ({ size, color }: { size?: string; color?: string }) => (
    <div
      data-testid="spinner"
      data-size={size}
      data-color={color}
    />
  ),
}));

// Mock child components
vi.mock('./EmailItem', () => ({
  default: ({ email }: { email: GmailMessageWithStress }) => (
    <div data-testid={`email-item-${email.id}`}>
      <span>{email.subject}</span>
      <span>{email.from}</span>
    </div>
  ),
}));

vi.mock('./EmailAuthentication', () => ({
  default: ({
    authenticate,
    isLoading,
    error,
    isCurrentlyStressed,
  }: {
    authenticate: () => void;
    isLoading: boolean;
    error: string | null;
    isCurrentlyStressed: boolean;
  }) => (
    <div data-testid="email-authentication">
      <button onClick={authenticate}>Connect Gmail</button>
      {isLoading && <span>Loading...</span>}
      {error && <span>Error: {error}</span>}
      {isCurrentlyStressed && <span>Stressed</span>}
    </div>
  ),
}));

import React from 'react';
import { useStressAnalytics } from '@/shared/hooks/useStressAnalytics';

const mockUseStressAnalytics = vi.mocked(useStressAnalytics);

describe('Emails', () => {
  const mockProfile = { emailAddress: 'test@example.com' };
  const mockFocusedEmails: GmailMessageWithStress[] = [
    {
      id: '1',
      threadId: 'thread1',
      subject: 'Urgent Email',
      from: 'sender1@example.com',
      to: 'test@example.com',
      snippet: 'This is urgent',
      date: new Date('2025-01-01'),
      read: false,
      important: true,
      starred: false,
      hasAttachments: false,
      labels: ['INBOX'],
      stressAnalysis: {
        priority: 'high' as const,
        stressIndicators: {
          urgentKeywords: 2,
          allCapsWords: 1,
          exclamationMarks: 3,
          deadlineKeywords: 1,
          negativeEmotions: 0,
        },
      },
    },
    {
      id: '2',
      threadId: 'thread2',
      subject: 'Important Email',
      from: 'sender2@example.com',
      to: 'test@example.com',
      snippet: 'This is important',
      date: new Date('2025-01-02'),
      read: true,
      important: false,
      starred: true,
      hasAttachments: false,
      labels: ['INBOX'],
      stressAnalysis: {
        priority: 'medium' as const,
        stressIndicators: {
          urgentKeywords: 1,
          allCapsWords: 0,
          exclamationMarks: 1,
          deadlineKeywords: 0,
          negativeEmotions: 0,
        },
      },
    },
  ];

  const mockOtherEmails: GmailMessageWithStress[] = [
    {
      id: '3',
      threadId: 'thread3',
      subject: 'Regular Email',
      from: 'sender3@example.com',
      to: 'test@example.com',
      snippet: 'This is regular',
      date: new Date('2025-01-03'),
      read: false,
      important: false,
      starred: false,
      hasAttachments: false,
      labels: ['INBOX'],
      stressAnalysis: {
        priority: 'low' as const,
        stressIndicators: {
          urgentKeywords: 0,
          allCapsWords: 0,
          exclamationMarks: 0,
          deadlineKeywords: 0,
          negativeEmotions: 0,
        },
      },
    },
  ];

  const defaultProps: EmailsProps = {
    maxEmails: 5,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    profile: mockProfile,
    focusedEmails: mockFocusedEmails,
    otherEmails: mockOtherEmails,
    isLoadingEmails: false,
    emailsError: null,
    authenticate: vi.fn(),
    signOut: vi.fn(),
    fetchEmailsByPriority: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStressAnalytics.mockReturnValue({
      averageStressLevel: null,
      stressTrends: { hour: null, day: null, week: null },
      isCurrentlyStressed: false,
      stressPercentage: 0,
      dominantStressExpression: null,
      stressHistory: [],
      lastStressResult: null,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Loading States', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(
        <Emails
          {...defaultProps}
          isLoading={true}
          isAuthenticated={false}
        />,
      );

      expect(screen.getByTestId('spinner')).toBeDefined();
      expect(screen.getByText('Initializing Gmail integration...')).toBeDefined();
    });

    it('shows email loading spinner when isLoadingEmails is true', () => {
      render(
        <Emails
          {...defaultProps}
          isLoadingEmails={true}
        />,
      );

      expect(screen.getByText('Loading your emails...')).toBeDefined();
    });
  });

  describe('Authentication States', () => {
    it('shows EmailAuthentication component when not authenticated', () => {
      render(
        <Emails
          {...defaultProps}
          isAuthenticated={false}
        />,
      );

      expect(screen.getByTestId('email-authentication')).toBeDefined();
      expect(screen.getByText('Connect Gmail')).toBeDefined();
    });
  });

  describe('Authenticated State', () => {
    it('shows profile information when authenticated', () => {
      render(<Emails {...defaultProps} />);

      expect(screen.getByText('📧 Gmail Integration')).toBeDefined();
      expect(screen.getByText('Connected as:')).toBeDefined();
      expect(screen.getByText(mockProfile.emailAddress)).toBeDefined();
      expect(screen.getByText('Disconnect')).toBeDefined();
    });

    it('calls signOut when disconnect button is clicked', () => {
      const mockSignOut = vi.fn();
      render(
        <Emails
          {...defaultProps}
          signOut={mockSignOut}
        />,
      );

      const disconnectButton = screen.getByText('Disconnect');
      fireEvent.click(disconnectButton);

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error States', () => {
    it('shows error message when emailsError is present', () => {
      const error = 'Failed to fetch emails';
      render(
        <Emails
          {...defaultProps}
          emailsError={error}
        />,
      );

      expect(screen.getByText(`⚠️ Failed to load emails: ${error}`)).toBeDefined();
    });
  });

  describe('Email Display - Normal State', () => {
    it('shows tabs when not stressed', () => {
      render(<Emails {...defaultProps} />);

      expect(screen.getByText('Focused')).toBeDefined();
      expect(screen.getByText('Others')).toBeDefined();
      expect(screen.getByTestId('alert-triangle-icon')).toBeDefined();
      expect(screen.getByTestId('mail-icon')).toBeDefined();
    });

    it('shows correct email counts in badges', () => {
      render(<Emails {...defaultProps} />);

      // Check for focused emails count
      const focusedButton = screen.getByText('Focused').closest('button');
      expect(focusedButton?.textContent).toContain('2'); // mockFocusedEmails.length

      // Check for other emails count
      const othersButton = screen.getByText('Others').closest('button');
      expect(othersButton?.textContent).toContain('1'); // mockOtherEmails.length
    });

    it('switches between tabs correctly', () => {
      render(<Emails {...defaultProps} />);

      // Initially focused tab should be active and show focused emails
      expect(screen.getByTestId('email-item-1')).toBeDefined();
      expect(screen.getByTestId('email-item-2')).toBeDefined();

      // Click on Others tab
      const othersTab = screen.getByText('Others');
      fireEvent.click(othersTab);

      // Should now show other emails
      expect(screen.getByTestId('email-item-3')).toBeDefined();
    });

    it('shows email items for focused emails by default', () => {
      render(<Emails {...defaultProps} />);

      expect(screen.getByTestId('email-item-1')).toBeDefined();
      expect(screen.getByTestId('email-item-2')).toBeDefined();
      expect(screen.getByText('Urgent Email')).toBeDefined();
      expect(screen.getByText('Important Email')).toBeDefined();
    });
  });

  describe('Email Display - Stressed State', () => {
    beforeEach(() => {
      mockUseStressAnalytics.mockReturnValue({
        averageStressLevel: 0.7,
        stressTrends: { hour: 0.8, day: 0.6, week: 0.5 },
        isCurrentlyStressed: true,
        stressPercentage: 70,
        dominantStressExpression: null,
        stressHistory: [],
        lastStressResult: {
          stressLevel: 75,
          dominantExpression: 'angry',
          expressions: { angry: 0.7, happy: 0.1, neutral: 0.2, sad: 0.0, surprised: 0.0, fearful: 0.0, disgusted: 0.0 },
          isStressed: true,
          timestamp: Date.now(),
        },
      });
    });

    it('shows only focused emails when stressed', () => {
      render(<Emails {...defaultProps} />);

      expect(screen.getByText('Focused Emails (2)')).toBeDefined();
      expect(screen.queryByText('Focused')).toBeNull(); // No tabs
      expect(screen.queryByText('Others')).toBeNull(); // No tabs
      expect(screen.getByTestId('email-item-1')).toBeDefined();
      expect(screen.getByTestId('email-item-2')).toBeDefined();
    });

    it('does not show tabs when stressed', () => {
      render(<Emails {...defaultProps} />);

      expect(screen.queryByTestId('alert-triangle-icon')).toBeNull();
      expect(screen.queryByText('Focused')).toBeNull();
      expect(screen.queryByText('Others')).toBeNull();
    });
  });

  describe('Empty States', () => {
    it('shows no emails message when no emails are present', () => {
      render(
        <Emails
          {...defaultProps}
          focusedEmails={[]}
          otherEmails={[]}
        />,
      );

      expect(screen.getByText('No emails found in your inbox.')).toBeDefined();
    });

    it('shows no focused emails message when focused tab is empty', () => {
      render(
        <Emails
          {...defaultProps}
          focusedEmails={[]}
        />,
      );

      expect(screen.getByText('No focused emails')).toBeDefined();
    });

    it('shows no other emails message when others tab is empty and selected', () => {
      render(
        <Emails
          {...defaultProps}
          otherEmails={[]}
        />,
      );

      // Switch to others tab
      const othersTab = screen.getByText('Others');
      fireEvent.click(othersTab);

      expect(screen.getByText('No other emails')).toBeDefined();
    });
  });

  describe('Refresh Functionality', () => {
    it('shows refresh button and calls fetchEmailsByPriority when clicked', () => {
      const mockFetchEmailsByPriority = vi.fn();
      render(
        <Emails
          {...defaultProps}
          fetchEmailsByPriority={mockFetchEmailsByPriority}
        />,
      );

      const refreshButton = screen.getByText('Refresh Emails');
      expect(refreshButton).toBeDefined();

      fireEvent.click(refreshButton);

      expect(mockFetchEmailsByPriority).toHaveBeenCalledWith(5, 5); // maxEmails for both
    });

    it('shows loading state on refresh button when isLoadingEmails is true', () => {
      render(
        <Emails
          {...defaultProps}
          isLoadingEmails={true}
        />,
      );

      expect(screen.getByText('Refreshing...')).toBeDefined();
    });
  });

  describe('Effect Hooks', () => {
    it('calls fetchEmailsByPriority on mount when authenticated', () => {
      const mockFetchEmailsByPriority = vi.fn();
      render(
        <Emails
          {...defaultProps}
          fetchEmailsByPriority={mockFetchEmailsByPriority}
        />,
      );

      expect(mockFetchEmailsByPriority).toHaveBeenCalledWith(5, 5);
    });

    it('does not call fetchEmailsByPriority when not authenticated', () => {
      const mockFetchEmailsByPriority = vi.fn();
      render(
        <Emails
          {...defaultProps}
          isAuthenticated={false}
          fetchEmailsByPriority={mockFetchEmailsByPriority}
        />,
      );

      expect(mockFetchEmailsByPriority).not.toHaveBeenCalled();
    });
  });

  describe('Props Handling', () => {
    it('uses custom maxEmails value', () => {
      const mockFetchEmailsByPriority = vi.fn();
      render(
        <Emails
          {...defaultProps}
          maxEmails={10}
          fetchEmailsByPriority={mockFetchEmailsByPriority}
        />,
      );

      expect(mockFetchEmailsByPriority).toHaveBeenCalledWith(10, 10);
    });

    it('renders without crashing when all props are provided', () => {
      expect(() => render(<Emails {...defaultProps} />)).not.toThrow();
    });
  });

  describe('Navigation', () => {
    it('shows View More Emails link when on home page and emails exist', () => {
      render(
        <Emails
          {...defaultProps}
          isHomePage={true}
        />,
      );

      expect(screen.getByText('View More Emails')).toBeDefined();
    });

    it('does not show View More Emails link when not on home page', () => {
      render(
        <Emails
          {...defaultProps}
          isHomePage={false}
        />,
      );

      expect(screen.queryByText('View More Emails')).toBeNull();
    });

    it('does not show View More Emails link when no emails exist', () => {
      render(
        <Emails
          {...defaultProps}
          isHomePage={true}
          focusedEmails={[]}
          otherEmails={[]}
        />,
      );

      expect(screen.queryByText('View More Emails')).toBeNull();
    });
  });
});
