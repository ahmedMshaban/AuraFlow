/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Login from './index';
import { useAuth } from '../../shared/hooks/useAuth';
import useLogin from './infrastructure/hooks/useLogin';
import type { ReactNode } from 'react';

// Mock the hooks
vi.mock('../../shared/hooks/useAuth');
vi.mock('./infrastructure/hooks/useLogin');

// Mock react-router
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace: boolean }) => (
      <div
        data-testid="navigate"
        data-to={to}
        data-replace={replace}
      >
        Navigating to {to}
      </div>
    ),
    Link: ({ to, children, ...props }: { to: string; children: ReactNode; [key: string]: unknown }) => (
      <a
        href={to}
        data-testid="link"
        {...props}
      >
        {children}
      </a>
    ),
  };
});

// Mock the LoginForm component
vi.mock('./components/LoginForm', () => ({
  default: () => <div data-testid="login-form">Login Form</div>,
}));

// Mock the Button component
vi.mock('@/shared/theme/button/Button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    asChild,
    ...props
  }: {
    children: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    variant?: string;
    asChild?: boolean;
    [key: string]: unknown;
  }) => {
    if (asChild) {
      return (
        <div
          data-testid="button-as-child"
          data-variant={variant}
          {...props}
        >
          {children}
        </div>
      );
    }
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        data-testid="google-signin-button"
        data-variant={variant}
        {...props}
      >
        {children}
      </button>
    );
  },
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseLogin = vi.mocked(useLogin);

describe('Login', () => {
  const mockOnGoogleSignIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();

    mockUseAuth.mockReturnValue({
      userLoggedIn: false,
      currentUser: null,
      isEmailUser: false,
      isGoogleUser: false,
      setCurrentUser: vi.fn(),
    });

    mockUseLogin.mockReturnValue({
      isSigningIn: false,
      error: null,
      onSubmit: vi.fn(),
      onGoogleSignIn: mockOnGoogleSignIn,
    });
  });

  const renderWithRouter = (component: ReactNode) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  it('renders the login page correctly', () => {
    renderWithRouter(<Login />);

    expect(screen.getByAltText('AuraFlow logo')).toBeDefined();
    expect(screen.getByText('Sign In')).toBeDefined();
    expect(screen.getByText("Don't have an account?")).toBeDefined();
    expect(screen.getByText('Sign up')).toBeDefined();
    expect(screen.getByText('OR SIGN IN WITH')).toBeDefined();
    expect(screen.getByTestId('login-form')).toBeDefined();
  });

  it('redirects to home when user is logged in', () => {
    mockUseAuth.mockReturnValue({
      userLoggedIn: true,
      // @ts-expect-error mock implementation
      currentUser: { uid: 'test-uid', email: 'test@example.com' },
    });

    renderWithRouter(<Login />);

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toBeDefined();
    expect(navigate.getAttribute('data-to')).toBe('/home');
    expect(navigate.getAttribute('data-replace')).toBe('true');
  });

  it('does not show navigation when user is not logged in', () => {
    mockUseAuth.mockReturnValue({
      userLoggedIn: false,
      currentUser: null,
      isEmailUser: false,
      isGoogleUser: false,
      setCurrentUser: vi.fn(),
    });

    renderWithRouter(<Login />);

    expect(screen.queryByTestId('navigate')).toBe(null);
  });

  it('renders sign up link correctly', () => {
    renderWithRouter(<Login />);

    const signUpLink = screen.getByTestId('link');
    expect(signUpLink).toBeDefined();
    expect(signUpLink.getAttribute('href')).toBe('/register');
    expect(screen.getByText('Sign up')).toBeDefined();
  });

  it('renders Google sign in button correctly', () => {
    renderWithRouter(<Login />);

    const googleButton = screen.getByTestId('google-signin-button');
    expect(googleButton).toBeDefined();
    expect(googleButton.getAttribute('data-variant')).toBe('outline');
    expect(googleButton).not.toHaveProperty('disabled', true);
  });

  it('calls onGoogleSignIn when Google button is clicked', () => {
    renderWithRouter(<Login />);

    const googleButton = screen.getByTestId('google-signin-button');
    fireEvent.click(googleButton);

    expect(mockOnGoogleSignIn).toHaveBeenCalled();
  });

  it('disables Google button when signing in', () => {
    mockUseLogin.mockReturnValue({
      isSigningIn: true,
      error: null,
      onSubmit: vi.fn(),
      onGoogleSignIn: mockOnGoogleSignIn,
    });

    renderWithRouter(<Login />);

    const googleButton = screen.getByTestId('google-signin-button');
    expect(googleButton).toHaveProperty('disabled', true);
  });

  it('shows signing in text when signing in', () => {
    mockUseLogin.mockReturnValue({
      isSigningIn: true,
      error: null,
      onSubmit: vi.fn(),
      onGoogleSignIn: mockOnGoogleSignIn,
    });

    renderWithRouter(<Login />);

    expect(screen.getByText('Signing In...')).toBeDefined();
  });

  it('does not show signing in text when not signing in', () => {
    mockUseLogin.mockReturnValue({
      isSigningIn: false,
      error: null,
      onSubmit: vi.fn(),
      onGoogleSignIn: mockOnGoogleSignIn,
    });

    renderWithRouter(<Login />);

    expect(screen.queryByText('Signing In...')).toBe(null);
  });

  it('renders logo with correct alt text', () => {
    renderWithRouter(<Login />);

    const logo = screen.getByAltText('AuraFlow logo');
    expect(logo).toBeDefined();
    expect(logo.tagName.toLowerCase()).toBe('img');
  });

  it('renders Gmail icon with correct alt text', () => {
    renderWithRouter(<Login />);

    const gmailIcon = screen.getByAltText('Gmail icon');
    expect(gmailIcon).toBeDefined();
    expect(gmailIcon.tagName.toLowerCase()).toBe('img');
  });

  it('renders OR divider correctly', () => {
    renderWithRouter(<Login />);

    expect(screen.getByText('OR SIGN IN WITH')).toBeDefined();

    // Check for hr elements (divider lines)
    const hrElements = screen.getAllByRole('separator');
    expect(hrElements).toHaveLength(2);
  });

  it('integrates with useAuth hook correctly', () => {
    renderWithRouter(<Login />);

    expect(mockUseAuth).toHaveBeenCalled();
  });

  it('integrates with useLogin hook correctly', () => {
    renderWithRouter(<Login />);

    expect(mockUseLogin).toHaveBeenCalled();
  });

  it('handles Google sign in button click with correct event type conversion', () => {
    renderWithRouter(<Login />);

    const googleButton = screen.getByTestId('google-signin-button');
    const mouseEvent = new MouseEvent('click', { bubbles: true });

    fireEvent.click(googleButton, mouseEvent);

    expect(mockOnGoogleSignIn).toHaveBeenCalled();
    // Verify the function was called (the event conversion happens inside the component)
    expect(mockOnGoogleSignIn).toHaveBeenCalledTimes(1);
  });

  it('renders main page structure correctly', () => {
    renderWithRouter(<Login />);

    // Check for main container structure
    const container = screen.getByText('Sign In').closest('div');
    expect(container).toBeDefined();

    // Check for header section
    expect(screen.getByAltText('AuraFlow logo')).toBeDefined();
    expect(screen.getByText("Don't have an account?")).toBeDefined();

    // Check for form section
    expect(screen.getByTestId('login-form')).toBeDefined();

    // Check for Google sign in section
    expect(screen.getByTestId('google-signin-button')).toBeDefined();
  });

  it('handles different authentication states', () => {
    // Test logged out state
    const { rerender } = renderWithRouter(<Login />);
    expect(screen.queryByTestId('navigate')).toBe(null);
    expect(screen.getByText('Sign In')).toBeDefined();

    // Test logged in state
    mockUseAuth.mockReturnValue({
      userLoggedIn: true,
      // @ts-expect-error mock implementation
      currentUser: { uid: 'test-uid', email: 'test@example.com' },
    });

    rerender(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('navigate')).toBeDefined();
  });

  it('handles different signing in states', () => {
    // Test not signing in state
    const { rerender } = renderWithRouter(<Login />);

    let googleButton = screen.getByTestId('google-signin-button');
    expect(googleButton).not.toHaveProperty('disabled', true);
    expect(screen.queryByText('Signing In...')).toBe(null);

    // Test signing in state
    mockUseLogin.mockReturnValue({
      isSigningIn: true,
      error: null,
      onSubmit: vi.fn(),
      onGoogleSignIn: mockOnGoogleSignIn,
    });

    rerender(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    googleButton = screen.getByTestId('google-signin-button');
    expect(googleButton).toHaveProperty('disabled', true);
    expect(screen.getByText('Signing In...')).toBeDefined();
  });
});
