import type { User } from 'firebase/auth';

export type AuthContextType = {
  userLoggedIn: boolean;
  isEmailUser: boolean;
  isGoogleUser: boolean;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loading: boolean;
};

export type AuthContextProviderProps = {
  children: React.ReactNode;
};
