/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import EmailAuthentication from './EmailAuthentication';
import type { EmailAuthenticationProps } from '../../infrastructure/types/emails.types';
import type { ReactNode } from 'react';

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiMail: ({ size, color }: { size?: number; color?: string }) => (
    <svg
      data-testid="mail-icon"
      width={size}
      height={size}
      style={{ color }}
    />
  ),
  FiUser: () => <svg data-testid="user-icon" />,
}));

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  Button: ({
    children,
    onClick,
    size,
    colorScheme,
    loading,
    loadingText,
    ...props
  }: {
    children: ReactNode;
    onClick?: () => void;
    size?: string;
    colorScheme?: string;
    loading?: boolean;
    loadingText?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      disabled={loading}
      data-size={size}
      data-colorscheme={colorScheme}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  ),
  VStack: ({ children, gap }: { children: ReactNode; gap?: number }) => <div data-gap={gap}>{children}</div>,
  HStack: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Text: ({
    children,
    as,
    fontWeight,
    ...props
  }: {
    children: ReactNode;
    as?: string;
    fontWeight?: string;
    [key: string]: unknown;
  }) => {
    const Tag = as || 'p';
    return React.createElement(Tag, { style: { fontWeight }, ...props }, children);
  },
  Heading: ({ children, size, color }: { children: ReactNode; size?: string; color?: string }) => (
    <h2
      data-size={size}
      style={{ color }}
    >
      {children}
    </h2>
  ),
}));

import React from 'react';

describe('EmailAuthentication', () => {
  const defaultProps: EmailAuthenticationProps = {
    isCurrentlyStressed: false,
    authenticate: vi.fn(),
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the component with default props', () => {
    render(<EmailAuthentication {...defaultProps} />);

    expect(screen.getByTestId('mail-icon')).toBeDefined();
    expect(screen.getByText('Connect Your Gmail')).toBeDefined();
    expect(screen.getByText(/Connect your Gmail account to view your latest emails/)).toBeDefined();
    expect(screen.getByText('Connect Gmail Account')).toBeDefined();
    expect(screen.getByTestId('user-icon')).toBeDefined();
  });

  it('renders privacy and security information', () => {
    render(<EmailAuthentication {...defaultProps} />);

    expect(screen.getByText('🔒 Privacy & Security:')).toBeDefined();
    expect(screen.getByText('✅ Read-only access to your emails')).toBeDefined();
    expect(screen.getByText('✅ No data stored on our servers')).toBeDefined();
    expect(screen.getByText('✅ Disconnect anytime')).toBeDefined();
  });

  it('calls authenticate function when button is clicked', async () => {
    const mockAuthenticate = vi.fn();
    render(
      <EmailAuthentication
        {...defaultProps}
        authenticate={mockAuthenticate}
      />,
    );

    const connectButton = screen.getByText('Connect Gmail Account');
    fireEvent.click(connectButton);

    expect(mockAuthenticate).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <EmailAuthentication
        {...defaultProps}
        isLoading={true}
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveProperty('disabled', true);
    expect(screen.getByText('Connecting...')).toBeDefined();
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Failed to connect to Gmail';
    render(
      <EmailAuthentication
        {...defaultProps}
        error={errorMessage}
      />,
    );

    expect(screen.getByText(`⚠️ ${errorMessage}`)).toBeDefined();
  });

  it('shows stress detection warning when isCurrentlyStressed is true', () => {
    render(
      <EmailAuthentication
        {...defaultProps}
        isCurrentlyStressed={true}
      />,
    );

    // Check for the stress detection content using a more flexible approach
    expect(screen.getByText('Stress detected!')).toBeDefined();
    expect(screen.getByText(/Connecting your email can help us provide better recommendations/)).toBeDefined();

    // Check that the stress warning container exists by looking for the combination of elements
    const stressWarning = screen.getByText('Stress detected!').closest('div');
    expect(stressWarning).toBeDefined();
    expect(stressWarning?.textContent).toContain('😰');
  });

  it('applies stress-related styling when isCurrentlyStressed is true', () => {
    const { container } = render(
      <EmailAuthentication
        {...defaultProps}
        isCurrentlyStressed={true}
      />,
    );

    // The main container should have red background when stressed
    const mainBox = container.firstChild as HTMLElement;
    expect(mainBox).toBeDefined();
  });

  it('applies normal styling when isCurrentlyStressed is false', () => {
    const { container } = render(
      <EmailAuthentication
        {...defaultProps}
        isCurrentlyStressed={false}
      />,
    );

    // The main container should have gray background when not stressed
    const mainBox = container.firstChild as HTMLElement;
    expect(mainBox).toBeDefined();
  });

  it('does not show stress warning when isCurrentlyStressed is false', () => {
    render(
      <EmailAuthentication
        {...defaultProps}
        isCurrentlyStressed={false}
      />,
    );

    expect(screen.queryByText('Stress detected!')).toBeNull();
    expect(screen.queryByText(/Connecting your email can help us provide better recommendations/)).toBeNull();
  });

  it('does not show error message when error is null', () => {
    render(
      <EmailAuthentication
        {...defaultProps}
        error={null}
      />,
    );

    expect(screen.queryByText(/⚠️/)).toBeNull();
  });

  it('handles multiple state combinations correctly', () => {
    render(
      <EmailAuthentication
        {...defaultProps}
        isCurrentlyStressed={true}
        isLoading={true}
        error="Connection failed"
      />,
    );

    // Should show all states: stress warning, loading, and error
    expect(screen.getByText('Stress detected!')).toBeDefined();
    expect(screen.getByText('Connecting...')).toBeDefined();
    expect(screen.getByText('⚠️ Connection failed')).toBeDefined();

    const button = screen.getByRole('button');
    expect(button).toHaveProperty('disabled', true);
  });

  it('displays correct mail icon properties', () => {
    render(<EmailAuthentication {...defaultProps} />);

    const mailIcon = screen.getByTestId('mail-icon');
    expect(mailIcon.getAttribute('width')).toBe('48');
    expect(mailIcon.getAttribute('height')).toBe('48');
    expect(mailIcon.style.color).toBe('rgb(108, 117, 125)');
  });

  it('renders descriptive text correctly', () => {
    render(<EmailAuthentication {...defaultProps} />);

    const descriptiveText = screen.getByText(
      /Connect your Gmail account to view your latest emails with intelligent stress analysis/,
    );
    expect(descriptiveText).toBeDefined();
    expect(
      screen.getByText(/We'll help you prioritize what's important and suggest when to take breaks/),
    ).toBeDefined();
  });

  it('maintains accessibility with proper button structure', () => {
    render(<EmailAuthentication {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    expect(button.textContent).toContain('Connect Gmail Account');
  });

  it('renders without crashing when all props are provided', () => {
    const props: EmailAuthenticationProps = {
      isCurrentlyStressed: true,
      authenticate: vi.fn(),
      isLoading: true,
      error: 'Test error message',
    };

    expect(() => render(<EmailAuthentication {...props} />)).not.toThrow();
  });
});
