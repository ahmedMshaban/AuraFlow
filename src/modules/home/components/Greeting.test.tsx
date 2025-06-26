/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Mock the hooks
vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../infrastructure/hooks/useGreeting', () => ({
  default: vi.fn(),
}));

// Mock the CSS module
vi.mock('../infrastructure/styles/home.module.css', () => ({
  default: {
    greetingContainer: 'greetingContainer',
    date: 'date',
    greeting: 'greeting',
  },
}));

import Greeting from './Greeting';
import { useAuth } from '@/shared/hooks/useAuth';
import useGreeting from '../infrastructure/hooks/useGreeting';
import type { AuthContextType } from '@/shared/types/authContext';
import type { User } from 'firebase/auth';

// Get references to the mocked functions
const mockUseAuth = vi.mocked(useAuth);
const mockUseGreeting = vi.mocked(useGreeting);

describe('Greeting', () => {
  const createMockUser = (overrides: Partial<User> = {}): User => ({
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'John Doe',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: '2025-01-01T00:00:00.000Z',
      lastSignInTime: '2025-06-26T00:00:00.000Z',
    },
    providerData: [],
    refreshToken: 'test-refresh-token',
    tenantId: null,
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
    ...overrides,
  });

  const mockAuthContext: AuthContextType = {
    userLoggedIn: true,
    isEmailUser: true,
    isGoogleUser: false,
    currentUser: createMockUser(),
    setCurrentUser: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mocks
    mockUseAuth.mockReturnValue(mockAuthContext);
    mockUseGreeting.mockReturnValue({
      date: 'Wednesday, June 26',
      greeting: 'Good Morning',
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders greeting with user display name', () => {
    render(<Greeting />);

    expect(screen.getByText('Wednesday, June 26')).toBeDefined();
    expect(screen.getByText('Good Morning, John Doe')).toBeDefined();
  });

  it('renders greeting with fallback "User" when displayName is null', () => {
    const userWithoutDisplayName = createMockUser({ displayName: null });
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      currentUser: userWithoutDisplayName,
    });

    render(<Greeting />);

    expect(screen.getByText('Good Morning, User')).toBeDefined();
  });

  it('renders greeting with fallback "User" when currentUser is null', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      currentUser: null,
    });

    render(<Greeting />);

    expect(screen.getByText('Good Morning, User')).toBeDefined();
  });

  it('renders greeting with empty displayName', () => {
    const userWithEmptyDisplayName = createMockUser({ displayName: '' });
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      currentUser: userWithEmptyDisplayName,
    });

    render(<Greeting />);

    expect(screen.getByText('Good Morning, User')).toBeDefined();
  });

  it('displays different times of day correctly', () => {
    // Test morning greeting
    mockUseGreeting.mockReturnValue({
      date: 'Wednesday, June 26',
      greeting: 'Good Morning',
    });

    const { rerender } = render(<Greeting />);
    expect(screen.getByText('Good Morning, John Doe')).toBeDefined();

    // Test afternoon greeting
    mockUseGreeting.mockReturnValue({
      date: 'Wednesday, June 26',
      greeting: 'Good Afternoon',
    });
    rerender(<Greeting />);
    expect(screen.getByText('Good Afternoon, John Doe')).toBeDefined();

    // Test evening greeting
    mockUseGreeting.mockReturnValue({
      date: 'Wednesday, June 26',
      greeting: 'Good Evening',
    });
    rerender(<Greeting />);
    expect(screen.getByText('Good Evening, John Doe')).toBeDefined();
  });

  it('displays different date formats correctly', () => {
    const testDates = ['Monday, January 1', 'Friday, December 31', 'Saturday, June 26'];

    testDates.forEach((date) => {
      mockUseGreeting.mockReturnValue({
        date,
        greeting: 'Good Morning',
      });

      const { unmount } = render(<Greeting />);
      expect(screen.getByText(date)).toBeDefined();
      unmount();
    });
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<Greeting />);

    const greetingContainer = container.querySelector('.greetingContainer');
    expect(greetingContainer).toBeDefined();

    const dateElement = container.querySelector('.date');
    expect(dateElement).toBeDefined();
    expect(dateElement?.textContent).toBe('Wednesday, June 26');

    const greetingElement = container.querySelector('.greeting');
    expect(greetingElement).toBeDefined();
    expect(greetingElement?.textContent).toBe('Good Morning, John Doe');
  });

  it('renders correct HTML structure', () => {
    const { container } = render(<Greeting />);

    const greetingContainer = container.firstChild as HTMLElement;
    expect(greetingContainer.tagName).toBe('DIV');
    expect(greetingContainer.className).toBe('greetingContainer');

    const children = greetingContainer.children;
    expect(children).toHaveLength(2);

    // Check h1 for date
    const dateElement = children[0] as HTMLElement;
    expect(dateElement.tagName).toBe('H1');
    expect(dateElement.className).toBe('date');

    // Check h2 for greeting
    const greetingElement = children[1] as HTMLElement;
    expect(greetingElement.tagName).toBe('H2');
    expect(greetingElement.className).toBe('greeting');
  });

  it('handles user names with special characters', () => {
    const userWithSpecialName = createMockUser({ displayName: "José María O'Connor-Smith" });
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      currentUser: userWithSpecialName,
    });

    render(<Greeting />);

    expect(screen.getByText("Good Morning, José María O'Connor-Smith")).toBeDefined();
  });

  it('handles very long user names', () => {
    const userWithLongName = createMockUser({
      displayName: 'Alexander Maximilian Christopher Jonathan Sebastian',
    });
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      currentUser: userWithLongName,
    });

    render(<Greeting />);

    expect(screen.getByText('Good Morning, Alexander Maximilian Christopher Jonathan Sebastian')).toBeDefined();
  });

  it('renders without crashing when hooks return valid data', () => {
    mockUseAuth.mockReturnValue(mockAuthContext);
    mockUseGreeting.mockReturnValue({
      date: 'Wednesday, June 26',
      greeting: 'Good Morning',
    });

    expect(() => render(<Greeting />)).not.toThrow();
  });

  it('handles different auth context states', () => {
    // Test with Google user
    const googleAuthContext: AuthContextType = {
      userLoggedIn: true,
      isEmailUser: false,
      isGoogleUser: true,
      currentUser: createMockUser({ displayName: 'Google User' }),
      setCurrentUser: vi.fn(),
      loading: false,
    };

    mockUseAuth.mockReturnValue(googleAuthContext);

    render(<Greeting />);
    expect(screen.getByText('Good Morning, Google User')).toBeDefined();
  });

  it('handles loading state from auth context', () => {
    const loadingAuthContext: AuthContextType = {
      userLoggedIn: false,
      isEmailUser: false,
      isGoogleUser: false,
      currentUser: null,
      setCurrentUser: vi.fn(),
      loading: true,
    };

    mockUseAuth.mockReturnValue(loadingAuthContext);

    render(<Greeting />);
    // Component should still render with fallback values
    expect(screen.getByText('Good Morning, User')).toBeDefined();
  });

  it('uses greeting hook data correctly', () => {
    const customGreetingData = {
      date: 'Sunday, July 4',
      greeting: 'Good Evening',
    };

    mockUseGreeting.mockReturnValue(customGreetingData);

    render(<Greeting />);

    expect(screen.getByText('Sunday, July 4')).toBeDefined();
    expect(screen.getByText('Good Evening, John Doe')).toBeDefined();
  });

  it('handles edge case where useAuth returns null', () => {
    mockUseAuth.mockReturnValue(null as never);

    // This should cause an error since the component casts to AuthContextType
    expect(() => render(<Greeting />)).toThrow();
  });

  it('renders correctly with minimal user data', () => {
    const minimalUser = {
      uid: 'minimal-user',
      email: 'minimal@example.com',
      displayName: 'Min',
    } as User;

    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      currentUser: minimalUser,
    });

    render(<Greeting />);

    expect(screen.getByText('Good Morning, Min')).toBeDefined();
  });

  it('maintains consistent rendering across re-renders', () => {
    const { rerender } = render(<Greeting />);

    expect(screen.getByText('Wednesday, June 26')).toBeDefined();
    expect(screen.getByText('Good Morning, John Doe')).toBeDefined();

    // Re-render with same data
    rerender(<Greeting />);

    expect(screen.getByText('Wednesday, June 26')).toBeDefined();
    expect(screen.getByText('Good Morning, John Doe')).toBeDefined();
  });
});
