import { Navigate, Link } from 'react-router';

import type { AuthContextType } from '@/shared/types/authContext';
import { Button } from '@/shared/theme/button/Button';

import { useAuth } from '../../shared/hooks/useAuth';
import useLogin from './infrastructure/hooks/useLogin';
import styles from './infrastructure/styles/login.module.css';
import logo from '../../assets/images/auraFlow-normal-colors.png';
import gmailIcon from '../../assets/images/icons/gmail-icon.svg';
import LoginForm from './components/LoginForm';

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
