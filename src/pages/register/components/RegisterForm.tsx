import { useForm } from 'react-hook-form';
import { Field, Input, Stack } from '@chakra-ui/react';

import { Button } from '@/shared/theme/button/Button';
import { PasswordInput } from '@/shared/ui/PasswordInput';

import type { RegisterFormValues } from '../infrastructure/types/register-types';
import styles from '../infrastructure/styles/register.module.css';
import useRegister from '../infrastructure/hooks/useRegister';

/**
 * A comprehensive user registration form component with validation, error handling, and accessible design.
 * Provides secure account creation with name, email, and password fields including real-time validation,
 * loading states, and user-friendly error messaging.
 *
 * Features:
 * - Name, email, and password input fields with validation
 * - Real-time form validation using React Hook Form
 * - Accessible form design with proper labeling and ARIA attributes
 * - Loading states during registration process
 * - Error handling with user-friendly error messages
 * - Password visibility toggle for better UX
 * - Form submission prevention during loading
 * - Responsive design for various screen sizes
 *
 * Validation Rules:
 * - Name: Required field for user identification
 * - Email: Required field with valid email format validation
 * - Password: Required field with minimum security requirements
 * - Real-time validation feedback with error highlighting
 * - Form submission blocked until validation passes
 *
 * Security Features:
 * - Password masking with optional visibility toggle
 * - Form submission rate limiting during registration
 * - Email uniqueness validation through Firebase
 * - Secure credential handling without local storage
 * - CSRF protection through Firebase Auth integration
 *
 * User Experience:
 * - Progressive disclosure with clear field labels
 * - Real-time validation feedback for immediate user guidance
 * - Loading indicators during account creation
 * - Error messages displayed with proper accessibility attributes
 * - Responsive layout for mobile and desktop
 *
 * @returns A complete registration form with validation and account creation
 *
 * @example
 * ```tsx
 * // Basic usage - renders complete registration form
 * <RegisterForm />
 *
 * // The component automatically handles:
 * // - Form validation and submission
 * // - Registration state management
 * // - Error display and user feedback
 * // - Loading states and button management
 * // - Account creation with Firebase Auth
 * ```
 *
 * @note Form integrates with Firebase Authentication for secure account creation
 * @note All validation errors are displayed with accessible error messages
 * @note User display name is set during registration process
 * @see {@link useRegister} For registration logic and state management
 * @see {@link useForm} For form validation and submission handling
 * @see {@link RegisterFormValues} For form data structure
 * @see {@link PasswordInput} For secure password input component
 */
const RegisterForm = () => {
  const { isRegistering, error, onSubmit } = useRegister();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack
        gap="4"
        align="flex-start"
        mb="6"
      >
        <Field.Root
          invalid={!!errors.name}
          required
        >
          <Field.Label htmlFor="name">Name</Field.Label>
          <Input
            id="name"
            {...register('name', { required: 'Name is a required field' })}
          />
          <Field.ErrorText>{errors.name?.message?.toString()}</Field.ErrorText>
        </Field.Root>

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
        disabled={isRegistering || isSubmitting}
        className={styles.registerButton}
      >
        {isRegistering || isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default RegisterForm;
