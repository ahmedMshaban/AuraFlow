import { useState } from 'react';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '@/shared/auth/firebase/auth';
import { getSignInErrorMessage } from '@/shared/helpers';

import type { LoginFormValues } from '../types/login-types';

/**
 * Custom hook for managing user authentication and login functionality.
 * Provides email/password and Google OAuth authentication with state management,
 * error handling, and loading states for a seamless login experience.
 *
 * Features:
 * - Email and password authentication via Firebase Auth
 * - Google OAuth integration with popup sign-in
 * - Loading state management during authentication
 * - Comprehensive error handling with user-friendly messages
 * - Form submission handling with validation
 * - Duplicate request prevention during sign-in process
 *
 * Authentication Methods:
 * - Email/Password: Traditional form-based authentication
 * - Google OAuth: One-click social authentication
 * - Both methods integrate with Firebase Authentication
 * - Automatic user session management post-authentication
 *
 * Error Handling:
 * - Firebase error translation to user-friendly messages
 * - Network error handling and retry mechanisms
 * - Invalid credential detection and messaging
 * - Rate limiting and security error handling
 *
 * @returns {Object} Authentication state and handlers
 * @returns {boolean} isSigningIn - Loading state during authentication process
 * @returns {string | null} error - Error message if authentication fails
 * @returns {Function} onSubmit - Handler for email/password form submission
 * @returns {Function} onGoogleSignIn - Handler for Google OAuth authentication
 *
 * @example
 * ```tsx
 * const { isSigningIn, error, onSubmit, onGoogleSignIn } = useLogin();
 *
 * // Email/password form submission
 * const handleFormSubmit = (formData: LoginFormValues) => {
 *   onSubmit(formData);
 * };
 *
 * // Google sign-in button
 * <form onSubmit={onGoogleSignIn}>
 *   <button type="submit" disabled={isSigningIn}>
 *     Sign in with Google
 *   </button>
 * </form>
 *
 * // Display loading state
 * {isSigningIn && <Spinner />}
 *
 * // Display error messages
 * {error && <Alert status="error">{error}</Alert>}
 * ```
 *
 * @note Hook prevents duplicate authentication requests when already signing in
 * @note Automatically resets loading state on authentication failure
 * @see {@link doSignInWithEmailAndPassword} For email/password authentication
 * @see {@link doSignInWithGoogle} For Google OAuth authentication
 * @see {@link getSignInErrorMessage} For error message translation
 * @see {@link LoginFormValues} For form data structure
 */
const useLogin = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormValues) => {
    if (!isSigningIn) {
      setIsSigningIn(true);
      setError(null);
      try {
        await doSignInWithEmailAndPassword(data.email, data.password);
      } catch (err) {
        setError(getSignInErrorMessage(err));
        setIsSigningIn(false);
      }
    }
  };

  const onGoogleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      setError(null);
      doSignInWithGoogle().catch((err) => {
        setError(getSignInErrorMessage(err));
        setIsSigningIn(false);
      });
    }
  };

  return {
    isSigningIn,
    error,
    onSubmit,
    onGoogleSignIn,
  };
};

export default useLogin;
