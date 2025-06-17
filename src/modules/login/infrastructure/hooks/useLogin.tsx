import { useState } from 'react';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '@/shared/auth/firebase/auth';
import { getErrorMessage } from '@/shared/helpers';

import type { LoginFormValues } from '../types/login-types';

const useLogin = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormValues) => {
    if (!isSigningIn) {
      setIsSigningIn(true);
      setError(null);
      try {
        await doSignInWithEmailAndPassword(data.email, data.password);
      } catch (err) {
        setError(getErrorMessage(err));
        setIsSigningIn(false);
      }
    }
  };

  const onGoogleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      setError(null);
      doSignInWithGoogle().catch((err) => {
        setError(getErrorMessage(err));
        setIsSigningIn(false);
      });
    }
  };

  return {
    isSigningIn,
    error,
    onSubmit,
    onGoogleSignIn,
  };
};

export default useLogin;
