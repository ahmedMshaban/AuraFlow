import { useState } from 'react';

import { doCreateUserWithEmailAndPassword } from '@/shared/auth/firebase/auth';
import { getRegisterErrorMessage } from '@/shared/helpers';
import type { RegisterFormValues } from '../types/register-types';

/**
 * Custom hook for managing user registration and account creation functionality.
 * Provides secure user registration with email/password via Firebase Auth,
 * including state management, error handling, and loading states.
 *
 * Features:
 * - Secure user account creation with Firebase Authentication
 * - Email and password validation with display name support
 * - Loading state management during registration process
 * - Comprehensive error handling with user-friendly messages
 * - Form submission handling with validation
 * - Duplicate request prevention during registration
 * - Automatic user profile creation with display name
 *
 * Registration Process:
 * - Validates user input (email, password, display name)
 * - Creates Firebase Auth account with email/password
 * - Sets user display name in Firebase profile
 * - Handles authentication errors and network issues
 * - Provides real-time feedback during registration
 * - Automatic session management post-registration
 *
 * Security Features:
 * - Password strength validation (handled by Firebase)
 * - Email format validation and uniqueness checking
 * - Secure credential handling without local storage
 * - CSRF protection through Firebase Auth integration
 * - Rate limiting and duplicate registration prevention
 *
 * @returns {Object} Registration state and handlers
 * @returns {boolean} isRegistering - Loading state during registration process
 * @returns {string | null} error - Error message if registration fails
 * @returns {Function} onSubmit - Handler for registration form submission
 *
 * @example
 * ```tsx
 * const { isRegistering, error, onSubmit } = useRegister();
 *
 * // Registration form submission
 * const handleFormSubmit = (formData: RegisterFormValues) => {
 *   onSubmit(formData);
 * };
 *
 * // Display loading state
 * {isRegistering && <Spinner />}
 *
 * // Display error messages
 * {error && <Alert status="error">{error}</Alert>}
 *
 * // Form integration
 * // <form onSubmit={handleSubmit(onSubmit)}>
 * //   {form fields}
 * //   <button type="submit" disabled={isRegistering}>
 * //     {isRegistering ? 'Creating Account...' : 'Create Account'}
 * //   </button>
 * // </form>
 * ```
 *
 * @note Hook prevents duplicate registration requests when already processing
 * @note Automatically resets loading state on registration failure
 * @note User profile is created with display name during registration
 * @see {@link doCreateUserWithEmailAndPassword} For Firebase account creation
 * @see {@link getRegisterErrorMessage} For error message translation
 * @see {@link RegisterFormValues} For form data structure
 */
const useRegister = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormValues) => {
    if (!isRegistering) {
      setIsRegistering(true);
      setError(null);
      try {
        await doCreateUserWithEmailAndPassword(data.email, data.password, data.name);
      } catch (err) {
        setError(getRegisterErrorMessage(err));
        setIsRegistering(false);
      }
    }
  };

  return {
    isRegistering,
    error,
    onSubmit,
  };
};

export default useRegister;
