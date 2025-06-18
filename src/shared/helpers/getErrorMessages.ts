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
