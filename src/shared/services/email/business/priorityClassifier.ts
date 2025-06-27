import type { GmailMessage, GmailMessageWithStress } from '@/shared/types/gmail.types';

/**
 * Determine email priority based on Gmail's native indicators
 */
export function getEmailPriority(message: GmailMessage): 'low' | 'medium' | 'high' {
  // Use Gmail's native importance and other indicators
  if (message.important || message.starred) {
    return 'high';
  }

  // Check if it's in primary category (personal emails)
  if (message.labels.includes('CATEGORY_PERSONAL') || !message.labels.some((label) => label.startsWith('CATEGORY_'))) {
    return 'medium';
  }

  return 'low';
}

/**
 * Add priority classification to emails
 */
export function addPriorityToEmails(emails: GmailMessage[]): GmailMessageWithStress[] {
  return emails.map((email) => ({
    ...email,
    stressAnalysis: {
      priority: getEmailPriority(email),
      stressIndicators: {
        urgentKeywords: 0,
        allCapsWords: 0,
        exclamationMarks: 0,
        deadlineKeywords: 0,
        negativeEmotions: 0,
      },
    },
  }));
}

/**
 * Sort emails by priority and date
 */
export function sortEmailsByPriority(emails: GmailMessage[]): GmailMessage[] {
  const priorityOrder = { high: 1, medium: 2, low: 3 };

  return emails.sort((a, b) => {
    const priorityA = getEmailPriority(a);
    const priorityB = getEmailPriority(b);

    // First sort by priority
    if (priorityOrder[priorityA] !== priorityOrder[priorityB]) {
      return priorityOrder[priorityA] - priorityOrder[priorityB];
    }

    // Then by date (newest first)
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}
