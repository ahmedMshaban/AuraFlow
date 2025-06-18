import { useState } from 'react';

import { doCreateUserWithEmailAndPassword } from '@/shared/auth/firebase/auth';
import { getRegisterErrorMessage } from '@/shared/helpers';
import type { RegisterFormValues } from '../types/register-types';

const useRegister = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormValues) => {
    if (!isRegistering) {
      setIsRegistering(true);
      setError(null);
      try {
        await doCreateUserWithEmailAndPassword(data.email, data.password, data.name);
      } catch (err) {
        setError(getRegisterErrorMessage(err));
        setIsRegistering(false);
      }
    }
  };

  return {
    isRegistering,
    error,
    onSubmit,
  };
};

export default useRegister;
