import { describe, it, expect } from 'vitest';
import { getEmailPriority, addPriorityToEmails, sortEmailsByPriority } from './priorityClassifier';
import type { GmailMessage } from '@/shared/types/gmail.types';

// Mock email data for testing
const createMockEmail = (overrides: Partial<GmailMessage> = {}): GmailMessage => ({
  id: '1',
  threadId: 'thread1',
  subject: 'Test Email',
  from: 'test@example.com',
  to: 'recipient@example.com',
  snippet: 'This is a test email',
  date: new Date('2024-06-15'),
  read: false,
  important: false,
  starred: false,
  hasAttachments: false,
  labels: [],
  ...overrides,
});

describe('priorityClassifier', () => {
  describe('getEmailPriority', () => {
    it('should return high priority for important emails', () => {
      const email = createMockEmail({ important: true });
      expect(getEmailPriority(email)).toBe('high');
    });

    it('should return high priority for starred emails', () => {
      const email = createMockEmail({ starred: true });
      expect(getEmailPriority(email)).toBe('high');
    });

    it('should return medium priority for personal emails', () => {
      const email = createMockEmail({ labels: ['CATEGORY_PERSONAL'] });
      expect(getEmailPriority(email)).toBe('medium');
    });

    it('should return medium priority for emails without category labels', () => {
      const email = createMockEmail({ labels: ['INBOX'] });
      expect(getEmailPriority(email)).toBe('medium');
    });

    it('should return low priority for promotional emails', () => {
      const email = createMockEmail({ labels: ['CATEGORY_PROMOTIONS'] });
      expect(getEmailPriority(email)).toBe('low');
    });

    it('should return low priority for social emails', () => {
      const email = createMockEmail({ labels: ['CATEGORY_SOCIAL'] });
      expect(getEmailPriority(email)).toBe('low');
    });
  });

  describe('addPriorityToEmails', () => {
    it('should add stress analysis to emails', () => {
      const emails = [
        createMockEmail({ id: '1', important: true }),
        createMockEmail({ id: '2', labels: ['CATEGORY_PROMOTIONS'] }),
      ];

      const result = addPriorityToEmails(emails);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeDefined();
      expect(result[1]).toBeDefined();

      const firstEmail = result[0];
      const secondEmail = result[1];

      expect(firstEmail.stressAnalysis?.priority).toBe('high');
      expect(secondEmail.stressAnalysis?.priority).toBe('low');
      expect(firstEmail.stressAnalysis?.stressIndicators).toBeDefined();
    });
  });

  describe('sortEmailsByPriority', () => {
    it('should sort emails by priority first, then by date', () => {
      const emails = [
        createMockEmail({
          id: '1',
          labels: ['CATEGORY_PROMOTIONS'],
          date: new Date('2024-06-20'),
        }),
        createMockEmail({
          id: '2',
          important: true,
          date: new Date('2024-06-15'),
        }),
        createMockEmail({
          id: '3',
          important: true,
          date: new Date('2024-06-25'),
        }),
        createMockEmail({
          id: '4',
          labels: ['CATEGORY_PERSONAL'],
          date: new Date('2024-06-18'),
        }),
      ];

      const result = sortEmailsByPriority(emails);

      // Should be ordered: important (newest first), then personal (newest first), then promotional
      expect(result[0].id).toBe('3'); // Important, newest
      expect(result[1].id).toBe('2'); // Important, older
      expect(result[2].id).toBe('4'); // Personal
      expect(result[3].id).toBe('1'); // Promotional
    });
  });
});
