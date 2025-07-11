import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import RegisterForm from './RegisterForm';
import useRegister from '../infrastructure/hooks/useRegister';
import type { ReactNode } from 'react';

// Mock the useRegister hook
vi.mock('../infrastructure/hooks/useRegister');

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    handleSubmit: (fn: (data: unknown) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        name: formData.get('name'),
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
    className,
    ...props
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={className}
      data-testid="register-button"
      {...props}
    >
      {children}
    </button>
  ),
}));

const mockUseRegister = vi.mocked(useRegister);

describe('RegisterForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset to default mock implementation
    mockUseRegister.mockReturnValue({
      onSubmit: mockOnSubmit,
      isRegistering: false,
      error: null,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all form fields correctly', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText('Name')).toBeDefined();
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByRole('button', { name: /create account/i })).toBeDefined();
    expect(screen.getByText('Create Account')).toBeDefined();
  });

  it('displays loading state when registering', () => {
    mockUseRegister.mockReturnValue({
      onSubmit: mockOnSubmit,
      isRegistering: true,
      error: null,
    });

    render(<RegisterForm />);

    expect(screen.getByText('Creating account...')).toBeDefined();
    expect(screen.getByTestId('register-button')).toHaveProperty('disabled', true);
  });

  it('displays error message when registration fails', () => {
    const errorMessage = 'Registration failed';
    mockUseRegister.mockReturnValue({
      onSubmit: mockOnSubmit,
      isRegistering: false,
      error: errorMessage,
    });

    render(<RegisterForm />);

    expect(screen.getByText(errorMessage)).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('disables submit button when registering', () => {
    mockUseRegister.mockReturnValue({
      onSubmit: mockOnSubmit,
      isRegistering: true,
      error: null,
    });

    render(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /creating account/i });
    expect(submitButton).toHaveProperty('disabled', true);
  });

  it('enables submit button when not registering', () => {
    mockUseRegister.mockReturnValue({
      onSubmit: mockOnSubmit,
      isRegistering: false,
      error: null,
    });

    render(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /create account/i });
    expect(submitButton).toHaveProperty('disabled', false);
  });

  it('calls onSubmit when form is submitted', async () => {
    render(<RegisterForm />);

    const submitButton = screen.getByTestId('register-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('has proper form structure with labels and inputs', () => {
    render(<RegisterForm />);

    // Check for form fields
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    expect(nameInput).toBeDefined();
    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();

    // Check input attributes
    expect(nameInput.getAttribute('id')).toBe('name');
    expect(emailInput.getAttribute('id')).toBe('email');
    expect(passwordInput.getAttribute('id')).toBe('password');
  });

  it('renders form as accessible form element', () => {
    const { container } = render(<RegisterForm />);

    const form = container.querySelector('form');
    expect(form).toBeDefined();
    expect(form?.tagName.toLowerCase()).toBe('form');
  });

  it('shows correct button text in normal state', () => {
    mockUseRegister.mockReturnValue({
      onSubmit: mockOnSubmit,
      isRegistering: false,
      error: null,
    });

    render(<RegisterForm />);
    expect(screen.getByText('Create Account')).toBeDefined();
  });

  it('shows correct button text in loading state', () => {
    mockUseRegister.mockReturnValue({
      onSubmit: mockOnSubmit,
      isRegistering: true,
      error: null,
    });

    render(<RegisterForm />);
    expect(screen.getByText('Creating account...')).toBeDefined();
  });

  it('properly integrates with useRegister hook', () => {
    render(<RegisterForm />);

    // Verify the hook was called
    expect(mockUseRegister).toHaveBeenCalled();

    // Verify it uses the hook's return values
    const button = screen.getByRole('button', { name: /create account/i });
    expect(button).toBeDefined();
  });
});
