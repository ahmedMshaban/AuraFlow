import { useForm } from 'react-hook-form';
import { Field, Input, Stack } from '@chakra-ui/react';

import { Button } from '@/shared/theme/button/Button';
import { PasswordInput } from '@/shared/ui/PasswordInput';

import type { LoginFormValues } from '../infrastructure/types/login-types';
import styles from '../infrastructure/styles/login.module.css';
import useLogin from '../infrastructure/hooks/useLogin';

const LoginForm = () => {
  const { isSigningIn, error, onSubmit } = useLogin();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack
        gap="4"
        align="flex-start"
        mb="6"
      >
        <Field.Root
          invalid={!!errors.email}
          required
        >
          <Field.Label htmlFor="email">Email</Field.Label>
          <Input
            id="email"
            {...register('email', {
              required: 'Email is a required field',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email must be a valid email address',
              },
            })}
          />
          <Field.ErrorText>{errors.email?.message?.toString()}</Field.ErrorText>
        </Field.Root>

        <Field.Root
          invalid={!!errors.password}
          required
        >
          <Field.Label htmlFor="password">Password</Field.Label>
          <PasswordInput
            id="password"
            {...register('password', { required: 'Password is a required field' })}
          />
          <Field.ErrorText>{errors.password?.message?.toString()}</Field.ErrorText>
        </Field.Root>

        {error && (
          <p
            role="alert"
            className="form-error"
          >
            {error}
          </p>
        )}
      </Stack>

      <Button
        type="submit"
        disabled={isSigningIn || isSubmitting}
        className={styles.loginButton}
      >
        {isSigningIn || isSubmitting ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
