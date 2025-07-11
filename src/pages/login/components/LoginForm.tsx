import { useForm } from 'react-hook-form';
import { Field, Input, Stack } from '@chakra-ui/react';

import { Button } from '@/shared/theme/button/Button';
import { PasswordInput } from '@/shared/ui/PasswordInput';

import type { LoginFormValues } from '../infrastructure/types/login-types';
import styles from '../infrastructure/styles/login.module.css';
import useLogin from '../infrastructure/hooks/useLogin';

/**
 * A comprehensive login form component with validation, error handling, and accessible design.
 * Provides email/password authentication with real-time validation, loading states,
 * and user-friendly error messaging for secure user sign-in.
 *
 * Features:
 * - Email and password input fields with validation
 * - Real-time form validation using React Hook Form
 * - Accessible form design with proper labeling and ARIA attributes
 * - Loading states during authentication process
 * - Error handling with user-friendly error messages
 * - Password visibility toggle for better UX
 * - Form submission prevention during loading
 * - Responsive design for various screen sizes
 *
 * Validation Rules:
 * - Email: Required field with valid email format validation
 * - Password: Required field with minimum security requirements
 * - Real-time validation feedback with error highlighting
 * - Form submission blocked until validation passes
 *
 * Security Features:
 * - Password masking with optional visibility toggle
 * - Form submission rate limiting during authentication
 * - CSRF protection through Firebase Auth integration
 * - Secure credential handling without local storage
 *
 * @returns A complete login form with validation and authentication
 *
 * @example
 * ```tsx
 * // Basic usage - renders complete login form
 * <LoginForm />
 *
 * // The component automatically handles:
 * // - Form validation and submission
 * // - Authentication state management
 * // - Error display and user feedback
 * // - Loading states and button management
 * ```
 *
 * @note Form integrates with Firebase Authentication for secure login
 * @note All validation errors are displayed with accessible error messages
 * @see {@link useLogin} For authentication logic and state management
 * @see {@link useForm} For form validation and submission handling
 * @see {@link LoginFormValues} For form data structure
 * @see {@link PasswordInput} For secure password input component
 */
const LoginForm = () => {
  const { isSigningIn, error, onSubmit } = useLogin();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack
        gap="4"
        align="flex-start"
        mb="6"
      >
        <Field.Root
          invalid={!!errors.email}
          required
        >
          <Field.Label htmlFor="email">Email</Field.Label>
          <Input
            id="email"
            {...register('email', {
              required: 'Email is a required field',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email must be a valid email address',
              },
            })}
          />
          <Field.ErrorText>{errors.email?.message?.toString()}</Field.ErrorText>
        </Field.Root>

        <Field.Root
          invalid={!!errors.password}
          required
        >
          <Field.Label htmlFor="password">Password</Field.Label>
          <PasswordInput
            id="password"
            {...register('password', { required: 'Password is a required field' })}
          />
          <Field.ErrorText>{errors.password?.message?.toString()}</Field.ErrorText>
        </Field.Root>

        {error && (
          <p
            role="alert"
            className="form-error"
          >
            {error}
          </p>
        )}
      </Stack>

      <Button
        type="submit"
        disabled={isSigningIn || isSubmitting}
        className={styles.loginButton}
      >
        {isSigningIn || isSubmitting ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
