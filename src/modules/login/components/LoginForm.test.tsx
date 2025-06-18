/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import LoginForm from './LoginForm';
import useLogin from '../infrastructure/hooks/useLogin';
import type { ReactNode } from 'react';

// Mock the useLogin hook
vi.mock('../infrastructure/hooks/useLogin');

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    handleSubmit: (fn: (data: unknown) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        email: formData.get('email'),
        password: formData.get('password'),
      };
      fn(data);
    },
    register: (name: string) => ({
      name,
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    }),
    formState: { errors: {}, isSubmitting: false },
  }),
}));

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Field: {
    Root: ({ children, invalid, required }: { children: ReactNode; invalid?: boolean; required?: boolean }) => (
      <div
        data-invalid={invalid}
        data-required={required}
      >
        {children}
      </div>
    ),
    Label: ({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) => (
      <label htmlFor={htmlFor}>{children}</label>
    ),
    ErrorText: ({ children }: { children?: ReactNode }) => (children ? <span role="alert">{children}</span> : null),
  },
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
  Stack: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

// Mock the shared components
vi.mock('@/shared/ui/PasswordInput', () => ({
  PasswordInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      type="password"
      data-testid="password-input"
      {...props}
    />
  ),
}));

vi.mock('@/shared/theme/button/Button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
    ...props
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  ),
}));

const mockUseLogin = vi.mocked(useLogin);

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseLogin.mockReturnValue({
      onSubmit: mockOnSubmit,
      isSigningIn: false,
      error: null,
      onGoogleSignIn: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all form fields correctly', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
  });

  it('displays loading state when signing in', () => {
    mockUseLogin.mockReturnValue({
      onSubmit: mockOnSubmit,
      isSigningIn: true,
      error: null,
      onGoogleSignIn: vi.fn(),
    });

    render(<LoginForm />);

    expect(screen.getByText('Signing In...')).toBeDefined();
    expect(screen.getByRole('button', { name: /signing in/i })).toHaveProperty('disabled', true);
  });

  it('displays error message when login fails', () => {
    const errorMessage = 'Invalid email or password';
    mockUseLogin.mockReturnValue({
      onSubmit: mockOnSubmit,
      isSigningIn: false,
      error: errorMessage,
      onGoogleSignIn: vi.fn(),
    });

    render(<LoginForm />);

    expect(screen.getByText(errorMessage)).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('disables submit button when signing in', () => {
    mockUseLogin.mockReturnValue({
      onSubmit: mockOnSubmit,
      isSigningIn: true,
      error: null,
      onGoogleSignIn: vi.fn(),
    });

    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /signing in/i });
    expect(submitButton).toHaveProperty('disabled', true);
  });

  it('enables submit button when not signing in', () => {
    mockUseLogin.mockReturnValue({
      onSubmit: mockOnSubmit,
      isSigningIn: false,
      error: null,
      onGoogleSignIn: vi.fn(),
    });

    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toHaveProperty('disabled', false);
  });

  it('calls onSubmit when form is submitted', async () => {
    render(<LoginForm />);

    const form = screen.getByRole('button').closest('form');
    expect(form).toBeDefined();

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('has proper form structure with labels and inputs', () => {
    render(<LoginForm />);

    // Check for form fields
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();

    // Check input attributes
    expect(emailInput.getAttribute('id')).toBe('email');
    expect(passwordInput.getAttribute('id')).toBe('password');
  });

  it('has form element as container', () => {
    render(<LoginForm />);

    const form = screen.getByRole('button').closest('form');
    expect(form).toBeDefined();
    expect(form?.tagName.toLowerCase()).toBe('form');
  });

  it('shows correct button text based on state', () => {
    // Normal state
    const { rerender } = render(<LoginForm />);
    expect(screen.getByText('Sign In')).toBeDefined();

    // Loading state
    mockUseLogin.mockReturnValue({
      onSubmit: mockOnSubmit,
      isSigningIn: true,
      error: null,
      onGoogleSignIn: vi.fn(),
    });

    rerender(<LoginForm />);
    expect(screen.getByText('Signing In...')).toBeDefined();
  });

  it('properly integrates with useLogin hook', () => {
    render(<LoginForm />);

    // Verify the hook was called
    expect(mockUseLogin).toHaveBeenCalled();

    // Verify it uses the hook's return values
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeDefined();
  });

  it('handles form submission properly', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('handles both signing in and submitting states for button disable', () => {
    // Test when isSigningIn is true
    mockUseLogin.mockReturnValue({
      onSubmit: mockOnSubmit,
      isSigningIn: true,
      error: null,
      onGoogleSignIn: vi.fn(),
    });

    const { rerender } = render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /signing in/i });
    expect(submitButton).toHaveProperty('disabled', true);

    // Test when only isSigningIn is false
    mockUseLogin.mockReturnValue({
      onSubmit: mockOnSubmit,
      isSigningIn: false,
      error: null,
      onGoogleSignIn: vi.fn(),
    });

    rerender(<LoginForm />);

    const submitButtonAfterRerender = screen.getByRole('button', { name: /sign in/i });
    expect(submitButtonAfterRerender).toHaveProperty('disabled', false);
  });

  it('clears error when new login attempt is made', () => {
    // First render with error
    const errorMessage = 'Login failed';
    mockUseLogin.mockReturnValue({
      onSubmit: mockOnSubmit,
      isSigningIn: false,
      error: errorMessage,
      onGoogleSignIn: vi.fn(),
    });

    const { rerender } = render(<LoginForm />);
    expect(screen.getByText(errorMessage)).toBeDefined();

    // Rerender without error
    mockUseLogin.mockReturnValue({
      onSubmit: mockOnSubmit,
      isSigningIn: false,
      error: null,
      onGoogleSignIn: vi.fn(),
    });

    rerender(<LoginForm />);
    expect(screen.queryByText(errorMessage)).toBe(null);
  });
});
