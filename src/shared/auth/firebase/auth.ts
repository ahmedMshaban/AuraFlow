import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';

/**
 * Creates a new user account with email and password authentication.
 * Registers the user with Firebase Auth and sets their display name profile.
 * Used for new user registration in the application signup flow.
 *
 * Features:
 * - Email/password account creation
 * - Automatic display name profile setup
 * - Returns user credentials for immediate use
 * - Integrates with Firebase Auth service
 *
 * @param email - User's email address for account creation
 * @param password - User's chosen password (should meet security requirements)
 * @param username - Display name to set for the user profile
 * @returns Promise resolving to Firebase UserCredential object
 *
 * @example
 * ```typescript
 * try {
 *   const userCredential = await doCreateUserWithEmailAndPassword(
 *     'user@example.com',
 *     'securePassword123',
 *     'John Doe'
 *   );
 *   console.log('User created:', userCredential.user.email);
 * } catch (error) {
 *   console.error('Registration failed:', error);
 * }
 * ```
 *
 * @throws {FirebaseError} When email is already in use or password is weak
 */
export const doCreateUserWithEmailAndPassword = async (email: string, password: string, username: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, {
    displayName: username,
  });
  return userCredential;
};

/**
 * Authenticates an existing user with email and password credentials.
 * Handles the sign-in process for registered users returning to the application.
 * Validates credentials against Firebase Auth database.
 *
 * Authentication Flow:
 * - Validates email/password combination
 * - Creates authenticated session
 * - Returns user credentials for app state
 * - Triggers auth state change listeners
 *
 * @param email - User's registered email address
 * @param password - User's account password
 * @returns Promise resolving to Firebase UserCredential object
 *
 * @example
 * ```typescript
 * try {
 *   const userCredential = await doSignInWithEmailAndPassword(
 *     'user@example.com',
 *     'userPassword123'
 *   );
 *   console.log('Welcome back:', userCredential.user.displayName);
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 * }
 * ```
 *
 * @throws {FirebaseError} When credentials are invalid or user not found
 */
export const doSignInWithEmailAndPassword = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Authenticates user using Google OAuth sign-in popup.
 * Provides seamless one-click authentication through Google's identity platform.
 * Creates user account if first-time login, or signs in existing Google users.
 *
 * OAuth Features:
 * - Google account integration
 * - Popup-based authentication flow
 * - Automatic account creation/linking
 * - Access to Google profile information
 * - Secure token-based authentication
 *
 * @returns Promise resolving to authenticated Firebase User object
 *
 * @example
 * ```typescript
 * try {
 *   const user = await doSignInWithGoogle();
 *   console.log('Google user signed in:', user.displayName);
 *   console.log('Email:', user.email);
 * } catch (error) {
 *   if (error.code === 'auth/popup-closed-by-user') {
 *     console.log('User cancelled Google sign-in');
 *   }
 * }
 * ```
 *
 * @throws {FirebaseError} When popup is blocked or user cancels
 * @note User data can be added to Firestore for additional profile storage
 */
export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  // add user to firestore
  return result.user;
};

/**
 * Signs out the currently authenticated user from the application.
 * Clears the user session and triggers auth state change listeners.
 * Provides secure logout functionality across all authentication methods.
 *
 * Sign-out Process:
 * - Terminates current user session
 * - Clears authentication tokens
 * - Triggers auth state change to null
 * - Redirects user to login state
 * - Maintains security by clearing credentials
 *
 * @returns Promise that resolves when sign-out is complete
 *
 * @example
 * ```typescript
 * try {
 *   await doSignOut();
 *   console.log('User successfully signed out');
 *   // Redirect to login page or show signed-out state
 * } catch (error) {
 *   console.error('Sign-out failed:', error);
 * }
 * ```
 *
 * @note Works for both email/password and Google OAuth users
 * @see {@link AuthProvider} for handling auth state changes
 */
export const doSignOut = () => {
  return auth.signOut();
};
