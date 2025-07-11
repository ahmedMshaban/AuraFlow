import { Navigate, Link } from 'react-router';

import type { AuthContextType } from '@/shared/types/authContext';
import { Button } from '@/shared/theme/button/Button';

import { useAuth } from '../../shared/hooks/useAuth';
import styles from './infrastructure/styles/register.module.css';
import logo from '../../assets/images/auraFlow-normal-colors.png';
import bannerImage from '../../assets/images/23548095_Male animator sitting at computer desk and creating project.svg';
import RegisterForm from './components/RegisterForm';

/**
 * The main registration page component providing comprehensive user account creation.
 * Offers an attractive, accessible registration interface with AuraFlow branding,
 * automatic redirection for authenticated users, and seamless integration with the authentication system.
 *
 * Key Features:
 * - Secure user account creation with email/password authentication
 * - Automatic redirection for authenticated users
 * - Responsive design with AuraFlow branding and visual elements
 * - Loading states during registration process
 * - Login page navigation for existing users
 * - Accessible form design with proper ARIA attributes
 * - Error handling and user feedback
 * - Professional marketing presentation with productivity messaging
 *
 * Registration Flow:
 * - Checks existing authentication status on mount
 * - Redirects authenticated users to home page automatically
 * - Provides registration form with name, email, and password fields
 * - Handles registration errors with user-friendly messages
 * - Manages loading states during account creation
 * - Creates user profile with display name in Firebase
 *
 * User Experience:
 * - Split-screen layout with branding and registration form
 * - Attractive visual design with productivity-focused messaging
 * - Clear call-to-action with "Get started for FREE" messaging
 * - Easy navigation to login for existing users
 * - Responsive layout for mobile and desktop
 * - Consistent styling with application theme
 * - Professional imagery with proper attribution
 *
 * Visual Design:
 * - AuraFlow logo and branding elements
 * - Productivity-focused banner image and messaging
 * - Clean, modern interface with clear visual hierarchy
 * - Professional color scheme and typography
 * - Mobile-responsive layout considerations
 *
 * @returns A complete registration page interface with account creation
 *
 * @example
 * ```tsx
 * // Basic usage - renders complete registration page
 * <Register />
 *
 * // The component automatically handles:
 * // - Authentication state checking and redirection
 * // - Form submission and validation
 * // - Account creation with Firebase Auth
 * // - Error handling and user feedback
 * // - Navigation between registration and login
 * ```
 *
 * @note Component automatically redirects authenticated users to home page
 * @note Integrates with Firebase Authentication for secure user account creation
 * @note Includes proper image attribution for marketing visuals
 * @see {@link useAuth} For authentication state management
 * @see {@link RegisterForm} For registration form and account creation
 * @see {@link Navigate} For automatic redirection of authenticated users
 */
const Register = () => {
  const { userLoggedIn } = useAuth() as AuthContextType;

  return (
    <div className={styles.registerContainer}>
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
        <div className={styles.loginContainer}>
          <p> Already have an account? </p>
          <Button asChild>
            <Link to={'/login'}>Sign in</Link>
          </Button>
        </div>
      </header>

      <div className={styles.mainContentContainer}>
        <div className={styles.auraFlowDescription}>
          <img
            alt="AuraFlow banner"
            src={bannerImage}
            className={styles.bannerImage}
          />
          <a
            className={styles.imageCredit}
            href="https://www.freepik.com/free-vector/male-animator-sitting-computer-desk-creating-project-graphic-motion-designer-sitting-workplace-studio-developing-web-game-flat-vector-illustration-design-art-concept_23548095.htm#fromView=search&page=1&position=3&uuid=097cef02-a65c-4a90-a8df-1aaf43e7f5f6&query=focus+on+desktop"
          >
            Image by pch.vector on Freepik
          </a>
          <h2 className={styles.title}>Get more done</h2>
          <p className={styles.subtitle}>Boost your productivity and efficiency</p>
        </div>
        <div className={styles.registerForm}>
          <h1>Get started for FREE</h1>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;
