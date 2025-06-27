import type { GmailMessage } from '@/shared/types/gmail.types';

/**
 * Filter emails by read status
 */
export function filterByReadStatus(emails: GmailMessage[], isRead: boolean): GmailMessage[] {
  return emails.filter((email) => email.read === isRead);
}

/**
 * Filter emails by importance
 */
export function filterByImportance(emails: GmailMessage[], isImportant: boolean): GmailMessage[] {
  return emails.filter((email) => email.important === isImportant);
}

/**
 * Filter emails by starred status
 */
export function filterByStarred(emails: GmailMessage[], isStarred: boolean): GmailMessage[] {
  return emails.filter((email) => email.starred === isStarred);
}

/**
 * Filter emails by category labels
 */
export function filterByCategory(emails: GmailMessage[], category: string): GmailMessage[] {
  return emails.filter((email) => email.labels.includes(category));
}

/**
 * Filter emails by multiple categories
 */
export function filterByCategories(emails: GmailMessage[], categories: string[]): GmailMessage[] {
  return emails.filter((email) => categories.some((category) => email.labels.includes(category)));
}

/**
 * Filter emails that have attachments
 */
export function filterByAttachments(emails: GmailMessage[], hasAttachments: boolean): GmailMessage[] {
  return emails.filter((email) => email.hasAttachments === hasAttachments);
}

/**
 * Filter emails by sender
 */
export function filterBySender(emails: GmailMessage[], senderPattern: string): GmailMessage[] {
  const pattern = new RegExp(senderPattern, 'i');
  return emails.filter((email) => pattern.test(email.from));
}

/**
 * Filter emails by subject
 */
export function filterBySubject(emails: GmailMessage[], subjectPattern: string): GmailMessage[] {
  const pattern = new RegExp(subjectPattern, 'i');
  return emails.filter((email) => pattern.test(email.subject));
}

/**
 * Advanced email filtering with multiple criteria
 */
export interface EmailFilterCriteria {
  isRead?: boolean;
  isImportant?: boolean;
  isStarred?: boolean;
  hasAttachments?: boolean;
  categories?: string[];
  senderPattern?: string;
  subjectPattern?: string;
  excludeCategories?: string[];
}

/**
 * Apply multiple filters to emails
 */
export function applyEmailFilters(emails: GmailMessage[], criteria: EmailFilterCriteria): GmailMessage[] {
  let filteredEmails = [...emails];

  if (criteria.isRead !== undefined) {
    filteredEmails = filterByReadStatus(filteredEmails, criteria.isRead);
  }

  if (criteria.isImportant !== undefined) {
    filteredEmails = filterByImportance(filteredEmails, criteria.isImportant);
  }

  if (criteria.isStarred !== undefined) {
    filteredEmails = filterByStarred(filteredEmails, criteria.isStarred);
  }

  if (criteria.hasAttachments !== undefined) {
    filteredEmails = filterByAttachments(filteredEmails, criteria.hasAttachments);
  }

  if (criteria.categories && criteria.categories.length > 0) {
    filteredEmails = filterByCategories(filteredEmails, criteria.categories);
  }

  if (criteria.excludeCategories && criteria.excludeCategories.length > 0) {
    filteredEmails = filteredEmails.filter(
      (email) => !criteria.excludeCategories!.some((category) => email.labels.includes(category)),
    );
  }

  if (criteria.senderPattern) {
    filteredEmails = filterBySender(filteredEmails, criteria.senderPattern);
  }

  if (criteria.subjectPattern) {
    filteredEmails = filterBySubject(filteredEmails, criteria.subjectPattern);
  }

  return filteredEmails;
}

/**
 * Get unread emails only
 */
export function getUnreadEmails(emails: GmailMessage[]): GmailMessage[] {
  return filterByReadStatus(emails, false);
}

/**
 * Get important emails only (from a filtered list)
 */
export function filterImportantEmails(emails: GmailMessage[]): GmailMessage[] {
  return filterByImportance(emails, true);
}

/**
 * Get starred emails only (from a filtered list)
 */
export function filterStarredEmails(emails: GmailMessage[]): GmailMessage[] {
  return filterByStarred(emails, true);
}

/**
 * Get emails with attachments only (from a filtered list)
 */
export function filterEmailsWithAttachments(emails: GmailMessage[]): GmailMessage[] {
  return filterByAttachments(emails, true);
}
