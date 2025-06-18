/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { UserCredential, User } from 'firebase/auth';
import useRegister from './useRegister';
import { doCreateUserWithEmailAndPassword } from '@/shared/auth/firebase/auth';
import { getRegisterErrorMessage } from '@/shared/helpers';
import type { RegisterFormValues } from '../types/register-types';

// Mock the Firebase auth function
vi.mock('@/shared/auth/firebase/auth', () => ({
  doCreateUserWithEmailAndPassword: vi.fn(),
}));

// Mock the error helper function
vi.mock('@/shared/helpers', () => ({
  getRegisterErrorMessage: vi.fn(),
}));

// Helper function to create mock UserCredential
const createMockUserCredential = (uid: string): UserCredential => ({
  user: { uid } as User,
  providerId: null,
  operationType: 'signIn' as const,
});

describe('useRegister', () => {
  const mockDoCreateUserWithEmailAndPassword = vi.mocked(doCreateUserWithEmailAndPassword);
  const mockGetRegisterErrorMessage = vi.mocked(getRegisterErrorMessage);

  const validFormData: RegisterFormValues = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useRegister());

      expect(result.current.isRegistering).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.onSubmit).toBe('function');
    });
  });

  describe('onSubmit function', () => {
    it('should successfully register a user with valid data', async () => {
      mockDoCreateUserWithEmailAndPassword.mockResolvedValueOnce(createMockUserCredential('user123'));

      const { result } = renderHook(() => useRegister());

      await act(async () => {
        await result.current.onSubmit(validFormData);
      });

      expect(mockDoCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        validFormData.email,
        validFormData.password,
        validFormData.name
      );
      expect(mockDoCreateUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(result.current.error).toBeNull();
      // Note: isRegistering should remain true after successful registration
      expect(result.current.isRegistering).toBe(true);
    });

    it('should set isRegistering to true during registration process', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: UserCredential) => void;
      const controlledPromise = new Promise<UserCredential>((resolve) => {
        resolvePromise = resolve;
      });

      mockDoCreateUserWithEmailAndPassword.mockReturnValueOnce(controlledPromise);

      const { result } = renderHook(() => useRegister());

      // Start the registration process
      act(() => {
        result.current.onSubmit(validFormData);
      });

      // Check that isRegistering is true during the process
      expect(result.current.isRegistering).toBe(true);
      expect(result.current.error).toBeNull();

      // Resolve the promise to complete the registration
      await act(async () => {
        resolvePromise!(createMockUserCredential('user123'));
        await controlledPromise;
      });
    });

    it('should handle registration errors correctly', async () => {
      const mockError = new Error('auth/email-already-in-use');
      const expectedErrorMessage = 'Email already in use';

      mockDoCreateUserWithEmailAndPassword.mockRejectedValueOnce(mockError);
      mockGetRegisterErrorMessage.mockReturnValueOnce(expectedErrorMessage);

      const { result } = renderHook(() => useRegister());

      await act(async () => {
        await result.current.onSubmit(validFormData);
      });

      expect(mockDoCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        validFormData.email,
        validFormData.password,
        validFormData.name
      );
      expect(mockGetRegisterErrorMessage).toHaveBeenCalledWith(mockError);
      expect(result.current.error).toBe(expectedErrorMessage);
      expect(result.current.isRegistering).toBe(false);
    });

    it('should clear previous error when starting new registration', async () => {
      const mockError = new Error('auth/email-already-in-use');
      const expectedErrorMessage = 'Email already in use';

      // First, simulate a failed registration
      mockDoCreateUserWithEmailAndPassword.mockRejectedValueOnce(mockError);
      mockGetRegisterErrorMessage.mockReturnValueOnce(expectedErrorMessage);

      const { result } = renderHook(() => useRegister());

      await act(async () => {
        await result.current.onSubmit(validFormData);
      });

      expect(result.current.error).toBe(expectedErrorMessage);

      // Now simulate a successful registration
      mockDoCreateUserWithEmailAndPassword.mockResolvedValueOnce(createMockUserCredential('user123'));

      await act(async () => {
        await result.current.onSubmit(validFormData);
      });

      expect(result.current.error).toBeNull();
    });

    it('should not allow multiple simultaneous registration attempts', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: UserCredential) => void;
      const controlledPromise = new Promise<UserCredential>((resolve) => {
        resolvePromise = resolve;
      });

      mockDoCreateUserWithEmailAndPassword.mockReturnValueOnce(controlledPromise);

      const { result } = renderHook(() => useRegister());

      // Start the first registration process
      act(() => {
        result.current.onSubmit(validFormData);
      });

      expect(result.current.isRegistering).toBe(true);

      // Attempt a second registration while the first is still in progress
      act(() => {
        result.current.onSubmit(validFormData);
      });

      // Should still only have been called once
      expect(mockDoCreateUserWithEmailAndPassword).toHaveBeenCalledTimes(1);

      // Complete the first registration
      await act(async () => {
        resolvePromise!(createMockUserCredential('user123'));
        await controlledPromise;
      });
    });

    it('should handle different types of registration data', async () => {
      const alternativeFormData: RegisterFormValues = {
        name: 'Jane Smith',
        email: 'jane.smith@test.com',
        password: 'different-password',
      };

      mockDoCreateUserWithEmailAndPassword.mockResolvedValueOnce(createMockUserCredential('user456'));

      const { result } = renderHook(() => useRegister());

      await act(async () => {
        await result.current.onSubmit(alternativeFormData);
      });

      expect(mockDoCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        alternativeFormData.email,
        alternativeFormData.password,
        alternativeFormData.name
      );
    });

    it('should handle network errors correctly', async () => {
      const networkError = new Error('auth/network-request-failed');
      const expectedErrorMessage = 'Network error. Please check your connection';

      mockDoCreateUserWithEmailAndPassword.mockRejectedValueOnce(networkError);
      mockGetRegisterErrorMessage.mockReturnValueOnce(expectedErrorMessage);

      const { result } = renderHook(() => useRegister());

      await act(async () => {
        await result.current.onSubmit(validFormData);
      });

      expect(result.current.error).toBe(expectedErrorMessage);
      expect(result.current.isRegistering).toBe(false);
    });

    it('should handle unknown errors correctly', async () => {
      const unknownError = new Error('unknown-error');
      const expectedErrorMessage = 'Failed to create account. Please try again';

      mockDoCreateUserWithEmailAndPassword.mockRejectedValueOnce(unknownError);
      mockGetRegisterErrorMessage.mockReturnValueOnce(expectedErrorMessage);

      const { result } = renderHook(() => useRegister());

      await act(async () => {
        await result.current.onSubmit(validFormData);
      });

      expect(result.current.error).toBe(expectedErrorMessage);
      expect(result.current.isRegistering).toBe(false);
    });
  });

  describe('State management', () => {
    it('should maintain state correctly across multiple operations', async () => {
      const { result } = renderHook(() => useRegister());

      // Initial state
      expect(result.current.isRegistering).toBe(false);
      expect(result.current.error).toBeNull();

      // First registration attempt (successful)
      mockDoCreateUserWithEmailAndPassword.mockResolvedValueOnce(createMockUserCredential('user123'));

      await act(async () => {
        await result.current.onSubmit(validFormData);
      });

      expect(result.current.isRegistering).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should reset error state on new registration attempt', async () => {
      const { result } = renderHook(() => useRegister());

      // First attempt fails
      const mockError = new Error('auth/email-already-in-use');
      mockDoCreateUserWithEmailAndPassword.mockRejectedValueOnce(mockError);
      mockGetRegisterErrorMessage.mockReturnValueOnce('Email already in use');

      await act(async () => {
        await result.current.onSubmit(validFormData);
      });

      expect(result.current.error).toBe('Email already in use');

      // Second attempt starts
      let resolvePromise: (value: UserCredential) => void;
      const controlledPromise = new Promise<UserCredential>((resolve) => {
        resolvePromise = resolve;
      });
      mockDoCreateUserWithEmailAndPassword.mockReturnValueOnce(controlledPromise);

      act(() => {
        result.current.onSubmit(validFormData);
      });

      // Error should be cleared immediately when starting new attempt
      expect(result.current.error).toBeNull();
      expect(result.current.isRegistering).toBe(true);

      // Clean up
      await act(async () => {
        resolvePromise!(createMockUserCredential('user123'));
        await controlledPromise;
      });
    });
  });
});
