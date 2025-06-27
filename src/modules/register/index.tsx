import { Navigate, Link } from 'react-router';

import type { AuthContextType } from '@/shared/types/authContext';
import { Button } from '@/shared/theme/button/Button';

import { useAuth } from '../../shared/hooks/useAuth';
import styles from './infrastructure/styles/register.module.css';
import logo from '../../assets/images/auraFlow-normal-colors.png';
import bannerImage from '../../assets/images/23548095_Male animator sitting at computer desk and creating project.svg';
import RegisterForm from './components/RegisterForm';

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
