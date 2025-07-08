import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import openGmailEmail from './openGmailEmail';

describe('openGmailEmail', () => {
  // Mock window.open
  const mockWindowOpen = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock window.open
    Object.defineProperty(window, 'open', {
      value: mockWindowOpen,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Valid Inputs', () => {
    it('opens Gmail email with default account index (0)', () => {
      const emailId = '1234567890abcdef';

      openGmailEmail(emailId);

      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://mail.google.com/mail/u/0/#inbox/1234567890abcdef', '_blank');
    });

    it('opens Gmail email with custom account index', () => {
      const emailId = '1234567890abcdef';
      const accountIndex = 2;

      openGmailEmail(emailId, accountIndex);

      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://mail.google.com/mail/u/2/#inbox/1234567890abcdef', '_blank');
    });

    it('trims whitespace from email ID', () => {
      const emailId = '  1234567890abcdef  ';

      openGmailEmail(emailId);

      expect(mockWindowOpen).toHaveBeenCalledWith('https://mail.google.com/mail/u/0/#inbox/1234567890abcdef', '_blank');
    });

    it('works with long email IDs', () => {
      const emailId = 'very-long-email-id-1234567890abcdef0123456789';

      openGmailEmail(emailId);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://mail.google.com/mail/u/0/#inbox/very-long-email-id-1234567890abcdef0123456789',
        '_blank',
      );
    });

    it('works with account index 0 explicitly', () => {
      const emailId = '1234567890abcdef';

      openGmailEmail(emailId, 0);

      expect(mockWindowOpen).toHaveBeenCalledWith('https://mail.google.com/mail/u/0/#inbox/1234567890abcdef', '_blank');
    });
  });

  describe('Invalid Email ID', () => {
    it('throws error for empty string email ID', () => {
      expect(() => openGmailEmail('')).toThrow('Invalid email ID provided');
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('throws error for whitespace-only email ID', () => {
      expect(() => openGmailEmail('   ')).toThrow('Invalid email ID provided');
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('throws error for null email ID', () => {
      // @ts-expect-error - Testing invalid input
      expect(() => openGmailEmail(null)).toThrow('Invalid email ID provided');
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('throws error for undefined email ID', () => {
      // @ts-expect-error - Testing invalid input
      expect(() => openGmailEmail(undefined)).toThrow('Invalid email ID provided');
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('throws error for non-string email ID', () => {
      // @ts-expect-error - Testing invalid input
      expect(() => openGmailEmail(123)).toThrow('Invalid email ID provided');
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });
  });

  describe('Invalid Account Index', () => {
    it('throws error for negative account index', () => {
      expect(() => openGmailEmail('1234567890abcdef', -1)).toThrow('Invalid account index provided');
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('throws error for non-number account index', () => {
      // @ts-expect-error - Testing invalid input
      expect(() => openGmailEmail('1234567890abcdef', '1')).toThrow('Invalid account index provided');
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('throws error for null account index', () => {
      // @ts-expect-error - Testing invalid input
      expect(() => openGmailEmail('1234567890abcdef', null)).toThrow('Invalid account index provided');
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('allows undefined account index (uses default)', () => {
      expect(() => openGmailEmail('1234567890abcdef', undefined)).not.toThrow();
      expect(mockWindowOpen).toHaveBeenCalledWith('https://mail.google.com/mail/u/0/#inbox/1234567890abcdef', '_blank');
    });
  });

  describe('Window.open Failures', () => {
    it('throws error when window.open fails', () => {
      mockWindowOpen.mockImplementation(() => {
        throw new Error('Popup blocked');
      });

      expect(() => openGmailEmail('1234567890abcdef')).toThrow('Failed to open Gmail email');
    });

    it('handles window.open returning null (popup blocked)', () => {
      mockWindowOpen.mockReturnValue(null);

      // Should not throw error - window.open returning null is normal when popup is blocked
      expect(() => openGmailEmail('1234567890abcdef')).not.toThrow();
      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('works with special characters in email ID', () => {
      const emailId = '123-456_789.abc@def';

      openGmailEmail(emailId);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://mail.google.com/mail/u/0/#inbox/123-456_789.abc@def',
        '_blank',
      );
    });

    it('works with very large account indices', () => {
      const emailId = '1234567890abcdef';
      const accountIndex = 999;

      openGmailEmail(emailId, accountIndex);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://mail.google.com/mail/u/999/#inbox/1234567890abcdef',
        '_blank',
      );
    });
  });
});
