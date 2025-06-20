import { useAuth } from '@/shared/hooks/useAuth';
import type { AuthContextType } from '@/shared/types/authContext';
import styles from '../infrastructure/styles/home.module.css';
import useGreeting from '../infrastructure/hooks/useGreeting';

const Greeting = () => {
  const { currentUser } = useAuth() as AuthContextType;
  const { date, greeting } = useGreeting();

  return (
    <div className={styles.greetingContainer}>
      <h1 className={styles.date}>{date}</h1>
      <h2 className={styles.greeting}>
        {greeting}, {currentUser?.displayName || 'User'}
      </h2>
    </div>
  );
};

export default Greeting;
