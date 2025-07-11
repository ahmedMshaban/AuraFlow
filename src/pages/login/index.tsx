import { Navigate, Link } from 'react-router';

import type { AuthContextType } from '@/shared/types/authContext';
import { Button } from '@/shared/theme/button/Button';

import { useAuth } from '../../shared/hooks/useAuth';
import useLogin from './infrastructure/hooks/useLogin';
import styles from './infrastructure/styles/login.module.css';
import logo from '../../assets/images/auraFlow-normal-colors.png';
import gmailIcon from '../../assets/images/icons/gmail-icon.svg';
import LoginForm from './components/LoginForm';

/**
 * The main login page component providing comprehensive user authentication options.
 * Offers both email/password and Google OAuth authentication with automatic redirection,
 * accessible design, and seamless integration with the AuraFlow authentication system.
 *
 * Key Features:
 * - Dual authentication methods (email/password and Google OAuth)
 * - Automatic redirection for authenticated users
 * - Responsive design with AuraFlow branding
 * - Loading states during authentication process
 * - Registration page navigation for new users
 * - Accessible form design with proper ARIA attributes
 * - Error handling and user feedback
 *
 * Authentication Flow:
 * - Checks existing authentication status on mount
 * - Redirects authenticated users to home page automatically
 * - Provides email/password form with validation
 * - Offers Google OAuth as alternative sign-in method
 * - Handles authentication errors with user-friendly messages
 * - Manages loading states during sign-in process
 *
 * User Experience:
 * - Clean, branded interface with AuraFlow logo
 * - Clear separation between authentication methods
 * - Loading indicators during authentication
 * - Easy navigation to registration for new users
 * - Responsive layout for mobile and desktop
 * - Consistent styling with application theme
 *
 * @returns A complete login page interface with dual authentication options
 *
 * @example
 * ```tsx
 * // Basic usage - renders complete login page
 * <Login />
 *
 * // The component automatically handles:
 * // - Authentication state checking and redirection
 * // - Form submission and validation
 * // - Google OAuth authentication flow
 * // - Error handling and user feedback
 * // - Navigation between login and registration
 * ```
 *
 * @note Component automatically redirects authenticated users to home page
 * @note Integrates with Firebase Authentication for secure user management
 * @see {@link useAuth} For authentication state management
 * @see {@link useLogin} For login functionality and form handling
 * @see {@link LoginForm} For email/password authentication form
 * @see {@link Navigate} For automatic redirection of authenticated users
 */
const Login = () => {
  const { userLoggedIn } = useAuth() as AuthContextType;
  const { isSigningIn, onGoogleSignIn } = useLogin();

  return (
    <div className={styles.loginContainer}>
      {userLoggedIn && (
        <Navigate
          to={'/home'}
          replace={true}
        />
      )}

      <header className={styles.header}>
        <img
          alt="AuraFlow logo"
          src={logo}
          className={styles.logo}
        />
        <div className={styles.registerContainer}>
          <p> Don't have an account? </p>
          <Button asChild>
            <Link to={'/register'}>Sign up</Link>
          </Button>
        </div>
      </header>

      <div className={styles.loginForm}>
        <h1>Sign In</h1>

        <LoginForm />

        <div className={styles.orContainer}>
          <hr />
          <div>OR SIGN IN WITH</div>
          <hr />
        </div>

        <Button
          disabled={isSigningIn}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            onGoogleSignIn(e as unknown as React.FormEvent<HTMLFormElement>);
          }}
          variant="outline"
          className={styles.googleButton}
        >
          <img
            src={gmailIcon}
            alt="Gmail icon"
            className={styles.googleIcon}
          />
          {isSigningIn && 'Signing In...'}
        </Button>
      </div>
    </div>
  );
};

export default Login;
