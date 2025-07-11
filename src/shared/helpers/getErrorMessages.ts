/**
 * Translates Firebase authentication sign-in errors into user-friendly messages.
 * Provides clear, actionable feedback for common authentication failure scenarios.
 * Improves user experience by offering specific guidance for different error types.
 *
 * Error Categories Handled:
 * - Invalid credentials (wrong email/password)
 * - Account status issues (disabled, not found)
 * - Rate limiting (too many attempts)
 * - Network connectivity problems
 * - Input validation errors
 *
 * @param error - Firebase authentication error or unknown error object
 * @returns User-friendly error message string
 *
 * @example
 * ```typescript
 * try {
 *   await signInWithEmailAndPassword(auth, email, password);
 * } catch (error) {
 *   const message = getSignInErrorMessage(error);
 *   setErrorMessage(message);
 *   // Shows: "Invalid email or password" instead of technical Firebase error
 * }
 * ```
 *
 * @note Extracts Firebase error codes from error message patterns
 * @see {@link getRegisterErrorMessage} for registration-specific errors
 */
export const getSignInErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) return 'An unexpected error occurred';

  const errorCode = error.message.match(/\(([^)]+)\)/)?.[1] ?? '';

  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Invalid email or password';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'Failed to sign in. Please try again';
  }
};

/**
 * Translates Firebase authentication registration errors into user-friendly messages.
 * Provides clear feedback for account creation failures and validation issues.
 * Helps users understand and resolve registration problems effectively.
 *
 * Registration Error Handling:
 * - Email already exists conflicts
 * - Account creation validation failures
 * - Service availability issues
 * - Generic fallback messaging
 *
 * @param error - Firebase authentication error from registration attempt
 * @returns User-friendly error message for registration failures
 *
 * @example
 * ```typescript
 * try {
 *   await createUserWithEmailAndPassword(auth, email, password);
 * } catch (error) {
 *   const message = getRegisterErrorMessage(error);
 *   toast.error(message);
 *   // Shows: "Email already in use" for duplicate email attempts
 * }
 * ```
 *
 * @note Focuses on registration-specific error scenarios
 * @see {@link getSignInErrorMessage} for sign-in related errors
 */
export const getRegisterErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) return 'An unexpected error occurred';

  const errorCode = error.message.match(/\(([^)]+)\)/)?.[1] ?? '';

  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Email already in use';
    default:
      return 'Failed to create account. Please try again';
  }
};
