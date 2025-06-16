import { useState } from 'react';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '@/shared/auth/firebase/auth';

const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      await doSignInWithEmailAndPassword(email, password);
    }
  };

  const onGoogleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      doSignInWithGoogle().catch(() => {
        setIsSigningIn(false);
      });
    }
  };

  return {
    email,
    password,
    setEmail,
    setPassword,
    isSigningIn,
    errorMessage,
    onSubmit,
    onGoogleSignIn,
  };
};

export default useLogin;
