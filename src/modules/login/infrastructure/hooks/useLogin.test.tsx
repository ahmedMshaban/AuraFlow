/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLogin from './useLogin';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '@/shared/auth/firebase/auth';
import { getSignInErrorMessage } from '@/shared/helpers';
import type { LoginFormValues } from '../types/login-types';

// Mock Firebase auth functions
vi.mock('@/shared/auth/firebase/auth', () => ({
  doSignInWithEmailAndPassword: vi.fn(),
  doSignInWithGoogle: vi.fn(),
}));

// Mock error helper
vi.mock('@/shared/helpers', () => ({
  getSignInErrorMessage: vi.fn(),
}));

const mockDoSignInWithEmailAndPassword = vi.mocked(doSignInWithEmailAndPassword);
const mockDoSignInWithGoogle = vi.mocked(doSignInWithGoogle);
const mockGetSignInErrorMessage = vi.mocked(getSignInErrorMessage);

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.isSigningIn).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.onSubmit).toBe('function');
    expect(typeof result.current.onGoogleSignIn).toBe('function');
  });

  describe('onSubmit', () => {
    it('successfully signs in user with email and password', async () => {
      // @ts-expect-error mock implementation
      mockDoSignInWithEmailAndPassword.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogin());
      const loginData: LoginFormValues = {
        email: 'test@example.com',
        password: 'password123',
      };

      await act(async () => {
        await result.current.onSubmit(loginData);
      });
      expect(mockDoSignInWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'password123');
      // Note: isSigningIn remains true after successful sign-in (current hook behavior)
      expect(result.current.isSigningIn).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('sets isSigningIn to true during sign in process', async () => {
      mockDoSignInWithEmailAndPassword.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      const { result } = renderHook(() => useLogin());
      const loginData: LoginFormValues = {
        email: 'test@example.com',
        password: 'password123',
      };

      act(() => {
        result.current.onSubmit(loginData);
      });

      expect(result.current.isSigningIn).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('handles sign in error correctly', async () => {
      const mockError = new Error('Invalid credentials');
      const mockErrorMessage = 'Invalid email or password';

      mockDoSignInWithEmailAndPassword.mockRejectedValue(mockError);
      mockGetSignInErrorMessage.mockReturnValue(mockErrorMessage);

      const { result } = renderHook(() => useLogin());
      const loginData: LoginFormValues = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await act(async () => {
        await result.current.onSubmit(loginData);
      });

      expect(mockGetSignInErrorMessage).toHaveBeenCalledWith(mockError);
      expect(result.current.error).toBe(mockErrorMessage);
      expect(result.current.isSigningIn).toBe(false);
    });

    it('does not call sign in when already signing in', async () => {
      mockDoSignInWithEmailAndPassword.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      const { result } = renderHook(() => useLogin());
      const loginData: LoginFormValues = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Start first sign in
      act(() => {
        result.current.onSubmit(loginData);
      });

      expect(result.current.isSigningIn).toBe(true);

      // Try to sign in again while first is in progress
      act(() => {
        result.current.onSubmit(loginData);
      });

      // Should only be called once
      expect(mockDoSignInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    it('clears previous error when starting new sign in attempt', async () => {
      // First, cause an error
      const mockError = new Error('Network error');
      const mockErrorMessage = 'Network connection failed';

      mockDoSignInWithEmailAndPassword.mockRejectedValueOnce(mockError);
      mockGetSignInErrorMessage.mockReturnValue(mockErrorMessage);

      const { result } = renderHook(() => useLogin());
      const loginData: LoginFormValues = {
        email: 'test@example.com',
        password: 'password123',
      };

      await act(async () => {
        await result.current.onSubmit(loginData);
      });

      expect(result.current.error).toBe(mockErrorMessage);

      // @ts-expect-error mock implementation
      mockDoSignInWithEmailAndPassword.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.onSubmit(loginData);
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('onGoogleSignIn', () => {
    it('successfully signs in with Google', async () => {
      // @ts-expect-error mock implementation
      mockDoSignInWithGoogle.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogin());
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        result.current.onGoogleSignIn(mockEvent);
      });
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockDoSignInWithGoogle).toHaveBeenCalled();
      // Note: isSigningIn remains true after successful sign-in (current hook behavior)
      expect(result.current.isSigningIn).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('sets isSigningIn to true during Google sign in process', async () => {
      mockDoSignInWithGoogle.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      const { result } = renderHook(() => useLogin());
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      act(() => {
        result.current.onGoogleSignIn(mockEvent);
      });

      expect(result.current.isSigningIn).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('handles Google sign in error correctly', async () => {
      const mockError = new Error('Google sign in failed');
      const mockErrorMessage = 'Failed to sign in with Google';

      mockDoSignInWithGoogle.mockRejectedValue(mockError);
      mockGetSignInErrorMessage.mockReturnValue(mockErrorMessage);

      const { result } = renderHook(() => useLogin());
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        result.current.onGoogleSignIn(mockEvent);
      });

      expect(mockGetSignInErrorMessage).toHaveBeenCalledWith(mockError);
      expect(result.current.error).toBe(mockErrorMessage);
      expect(result.current.isSigningIn).toBe(false);
    });

    it('does not call Google sign in when already signing in', () => {
      mockDoSignInWithGoogle.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      const { result } = renderHook(() => useLogin());
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      // Start first sign in
      act(() => {
        result.current.onGoogleSignIn(mockEvent);
      });

      expect(result.current.isSigningIn).toBe(true);

      // Try to sign in again while first is in progress
      act(() => {
        result.current.onGoogleSignIn(mockEvent);
      });

      // Should only be called once
      expect(mockDoSignInWithGoogle).toHaveBeenCalledTimes(1);
    });

    it('prevents default form submission', () => {
      const { result } = renderHook(() => useLogin());
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      act(() => {
        result.current.onGoogleSignIn(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('clears previous error when starting new Google sign in attempt', async () => {
      // First, cause an error
      const mockError = new Error('Google error');
      const mockErrorMessage = 'Google sign in failed';

      mockDoSignInWithGoogle.mockRejectedValueOnce(mockError);
      mockGetSignInErrorMessage.mockReturnValue(mockErrorMessage);

      const { result } = renderHook(() => useLogin());
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        result.current.onGoogleSignIn(mockEvent);
      });

      expect(result.current.error).toBe(mockErrorMessage);

      // Now try again with successful response
      // @ts-expect-error mock implementation
      mockDoSignInWithGoogle.mockResolvedValue(undefined);

      await act(async () => {
        result.current.onGoogleSignIn(mockEvent);
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('error handling', () => {
    it('handles different types of errors', async () => {
      const stringError = 'String error message';
      const objectError = { message: 'Object error message' };
      const unknownError = { code: 'unknown-error' };

      mockGetSignInErrorMessage
        .mockReturnValueOnce('Parsed string error')
        .mockReturnValueOnce('Parsed object error')
        .mockReturnValueOnce('Parsed unknown error');

      const { result } = renderHook(() => useLogin());
      const loginData: LoginFormValues = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Test string error
      mockDoSignInWithEmailAndPassword.mockRejectedValueOnce(stringError);
      await act(async () => {
        await result.current.onSubmit(loginData);
      });
      expect(result.current.error).toBe('Parsed string error');

      // Test object error
      mockDoSignInWithEmailAndPassword.mockRejectedValueOnce(objectError);
      await act(async () => {
        await result.current.onSubmit(loginData);
      });
      expect(result.current.error).toBe('Parsed object error');

      // Test unknown error
      mockDoSignInWithGoogle.mockRejectedValueOnce(unknownError);
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        result.current.onGoogleSignIn(mockEvent);
      });
      expect(result.current.error).toBe('Parsed unknown error');
    });
  });

  describe('state management', () => {
    it('maintains proper state throughout sign in lifecycle', async () => {
      // Function to resolve the Promise with void return type
      let resolveSignIn: ((value: void) => void) | undefined;
      mockDoSignInWithEmailAndPassword.mockImplementation(
        () =>
          new Promise((resolve) => {
            // @ts-expect-error mock implementation
            resolveSignIn = resolve;
          }),
      );

      const { result } = renderHook(() => useLogin());
      const loginData: LoginFormValues = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Initial state
      expect(result.current.isSigningIn).toBe(false);
      expect(result.current.error).toBe(null);

      // Start sign in
      act(() => {
        result.current.onSubmit(loginData);
      });

      // During sign in
      expect(result.current.isSigningIn).toBe(true);
      expect(result.current.error).toBe(null);

      // Complete sign in
      await act(async () => {
        resolveSignIn?.();
      });

      // After successful sign in (isSigningIn remains true in current implementation)
      expect(result.current.isSigningIn).toBe(true);
      expect(result.current.error).toBe(null);
    });
  });
});
