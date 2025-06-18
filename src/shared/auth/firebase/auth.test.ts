import { describe, it, expect, vi, beforeEach } from 'vitest';
import { doCreateUserWithEmailAndPassword, doSignInWithEmailAndPassword, doSignInWithGoogle, doSignOut } from './auth';
import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  updateProfile: vi.fn(),
}));

// Mock Firebase config
vi.mock('./firebase', () => ({
  auth: {
    signOut: vi.fn(),
  },
}));

const mockCreateUserWithEmailAndPassword = vi.mocked(createUserWithEmailAndPassword);
const mockSignInWithEmailAndPassword = vi.mocked(signInWithEmailAndPassword);
const mockSignInWithPopup = vi.mocked(signInWithPopup);
const mockGoogleAuthProvider = vi.mocked(GoogleAuthProvider);
const mockUpdateProfile = vi.mocked(updateProfile);
const mockAuth = vi.mocked(auth);

describe('Auth Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('doCreateUserWithEmailAndPassword', () => {
    it('successfully creates user with email and password', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: null,
      };
      const mockUserCredential = {
        user: mockUser,
      };

      mockCreateUserWithEmailAndPassword.mockResolvedValue(mockUserCredential as never);
      mockUpdateProfile.mockResolvedValue(undefined);

      const result = await doCreateUserWithEmailAndPassword('test@example.com', 'password123', 'Test User');

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password123');
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'Test User',
      });
      expect(result).toBe(mockUserCredential);
    });

    it('handles error when user creation fails', async () => {
      const mockError = new Error('Email already in use');
      mockCreateUserWithEmailAndPassword.mockRejectedValue(mockError);

      await expect(doCreateUserWithEmailAndPassword('test@example.com', 'password123', 'Test User')).rejects.toThrow(
        'Email already in use',
      );

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password123');
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('handles error when profile update fails', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: null,
      };
      const mockUserCredential = {
        user: mockUser,
      };

      mockCreateUserWithEmailAndPassword.mockResolvedValue(mockUserCredential as never);
      const profileError = new Error('Profile update failed');
      mockUpdateProfile.mockRejectedValue(profileError);

      await expect(doCreateUserWithEmailAndPassword('test@example.com', 'password123', 'Test User')).rejects.toThrow(
        'Profile update failed',
      );

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled();
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'Test User',
      });
    });

    it('calls Firebase functions with correct parameters', async () => {
      const mockUser = { uid: 'test-uid' };
      const mockUserCredential = { user: mockUser };

      mockCreateUserWithEmailAndPassword.mockResolvedValue(mockUserCredential as never);
      mockUpdateProfile.mockResolvedValue(undefined);

      await doCreateUserWithEmailAndPassword('user@test.com', 'securepass', 'John Doe');

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'user@test.com', 'securepass');
      expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'John Doe',
      });
    });
  });

  describe('doSignInWithEmailAndPassword', () => {
    it('successfully signs in user with email and password', async () => {
      const mockUserCredential = {
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
        },
      };

      mockSignInWithEmailAndPassword.mockResolvedValue(mockUserCredential as never);

      const result = await doSignInWithEmailAndPassword('test@example.com', 'password123');

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password123');
      expect(result).toBe(mockUserCredential);
    });

    it('handles sign in error', async () => {
      const mockError = new Error('Invalid credentials');
      mockSignInWithEmailAndPassword.mockRejectedValue(mockError);

      await expect(doSignInWithEmailAndPassword('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials',
      );

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'wrongpassword');
    });

    it('calls Firebase function with correct parameters', async () => {
      const mockUserCredential = { user: { uid: 'test-uid' } };
      mockSignInWithEmailAndPassword.mockResolvedValue(mockUserCredential as never);

      await doSignInWithEmailAndPassword('user@domain.com', 'mypassword');

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'user@domain.com', 'mypassword');
    });
  });

  describe('doSignInWithGoogle', () => {
    it('successfully signs in with Google', async () => {
      const mockUser = {
        uid: 'google-uid',
        email: 'user@gmail.com',
        displayName: 'Google User',
      };
      const mockResult = {
        user: mockUser,
      };
      const mockProvider = {};

      mockGoogleAuthProvider.mockImplementation(() => mockProvider as never);
      mockSignInWithPopup.mockResolvedValue(mockResult as never);

      const result = await doSignInWithGoogle();

      expect(mockGoogleAuthProvider).toHaveBeenCalled();
      expect(mockSignInWithPopup).toHaveBeenCalledWith(auth, mockProvider);
      expect(result).toBe(mockUser);
    });

    it('handles Google sign in error', async () => {
      const mockError = new Error('Google sign in failed');
      const mockProvider = {};

      mockGoogleAuthProvider.mockImplementation(() => mockProvider as never);
      mockSignInWithPopup.mockRejectedValue(mockError);

      await expect(doSignInWithGoogle()).rejects.toThrow('Google sign in failed');

      expect(mockGoogleAuthProvider).toHaveBeenCalled();
      expect(mockSignInWithPopup).toHaveBeenCalledWith(auth, mockProvider);
    });

    it('creates GoogleAuthProvider and calls signInWithPopup', async () => {
      const mockUser = { uid: 'google-uid' };
      const mockResult = { user: mockUser };
      const mockProvider = {};

      mockGoogleAuthProvider.mockImplementation(() => mockProvider as never);
      mockSignInWithPopup.mockResolvedValue(mockResult as never);

      const result = await doSignInWithGoogle();

      expect(mockGoogleAuthProvider).toHaveBeenCalledTimes(1);
      expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
      expect(mockSignInWithPopup).toHaveBeenCalledWith(auth, mockProvider);
      expect(result).toBe(mockUser);
    });

    it('returns the user from the result', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@gmail.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
      };
      const mockResult = {
        user: mockUser,
        credential: null,
      };

      mockGoogleAuthProvider.mockImplementation(() => ({}) as never);
      mockSignInWithPopup.mockResolvedValue(mockResult as never);

      const result = await doSignInWithGoogle();

      expect(result).toEqual(mockUser);
    });
  });

  describe('doSignOut', () => {
    it('successfully signs out user', async () => {
      mockAuth.signOut.mockResolvedValue(undefined);

      const result = await doSignOut();

      expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('handles sign out error', async () => {
      const mockError = new Error('Sign out failed');
      mockAuth.signOut.mockRejectedValue(mockError);

      await expect(doSignOut()).rejects.toThrow('Sign out failed');

      expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
    });

    it('calls auth.signOut without parameters', async () => {
      mockAuth.signOut.mockResolvedValue(undefined);

      await doSignOut();

      expect(mockAuth.signOut).toHaveBeenCalledWith();
    });
  });

  describe('Error Handling', () => {
    it('preserves error types from Firebase functions', async () => {
      const firebaseError = {
        code: 'auth/user-not-found',
        message: 'User not found',
      };

      mockSignInWithEmailAndPassword.mockRejectedValue(firebaseError);

      try {
        await doSignInWithEmailAndPassword('test@example.com', 'password');
      } catch (error) {
        expect(error).toEqual(firebaseError);
      }
    });

    it('preserves error context for debugging', async () => {
      const specificError = new Error('Network error during authentication');
      mockCreateUserWithEmailAndPassword.mockRejectedValue(specificError);

      await expect(doCreateUserWithEmailAndPassword('test@example.com', 'password', 'User')).rejects.toThrow(
        'Network error during authentication',
      );
    });
  });

  describe('Integration', () => {
    it('maintains proper sequence for user creation', async () => {
      const mockUser = { uid: 'test-uid' };
      const mockUserCredential = { user: mockUser };

      mockCreateUserWithEmailAndPassword.mockResolvedValue(mockUserCredential as never);
      mockUpdateProfile.mockResolvedValue(undefined);

      await doCreateUserWithEmailAndPassword('test@example.com', 'password', 'Test User');

      // Verify the sequence: create user first, then update profile
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledBefore(mockUpdateProfile as never);
    });

    it('handles concurrent authentication requests', async () => {
      const mockUserCredential1 = { user: { uid: 'user-1' } };
      const mockUserCredential2 = { user: { uid: 'user-2' } };

      mockSignInWithEmailAndPassword
        .mockResolvedValueOnce(mockUserCredential1 as never)
        .mockResolvedValueOnce(mockUserCredential2 as never);

      const [result1, result2] = await Promise.all([
        doSignInWithEmailAndPassword('user1@example.com', 'pass1'),
        doSignInWithEmailAndPassword('user2@example.com', 'pass2'),
      ]);

      expect(result1).toBe(mockUserCredential1);
      expect(result2).toBe(mockUserCredential2);
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledTimes(2);
    });
  });
});
