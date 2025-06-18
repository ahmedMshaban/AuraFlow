import { useForm } from 'react-hook-form';
import { Field, Input, Stack } from '@chakra-ui/react';

import { Button } from '@/shared/theme/button/Button';
import { PasswordInput } from '@/shared/ui/PasswordInput';

import type { RegisterFormValues } from '../infrastructure/types/register-types';
import styles from '../infrastructure/styles/register.module.css';
import useRegister from '../infrastructure/hooks/useRegister';

const RegisterForm = () => {
  const { isRegistering, error, onSubmit } = useRegister();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack
        gap="4"
        align="flex-start"
        mb="6"
      >
        <Field.Root
          invalid={!!errors.name}
          required
        >
          <Field.Label htmlFor="name">Name</Field.Label>
          <Input
            id="name"
            {...register('name', { required: 'Name is a required field' })}
          />
          <Field.ErrorText>{errors.name?.message?.toString()}</Field.ErrorText>
        </Field.Root>

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
        disabled={isRegistering || isSubmitting}
        className={styles.registerButton}
      >
        {isRegistering || isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default RegisterForm;
