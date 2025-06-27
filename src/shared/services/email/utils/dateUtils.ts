import type { GmailMessage } from '@/shared/types/gmail.types';
import type { ViewType } from '@/modules/home/infrastructure/types/home.types';

/**
 * Generate Gmail search query for date filtering based on view type
 */
export function getDateQueryForView(viewType: ViewType): string {
  const today = new Date();

  switch (viewType) {
    case 'my-day': {
      // Get emails from today only
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      return `after:${todayStr} before:${getTomorrowDateString(today)}`;
    }

    case 'my-week': {
      // Get emails from this week (last 7 days)
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      return `after:${weekAgoStr}`;
    }

    case 'my-month': {
      // Get emails from this month (last 30 days)
      const monthAgo = new Date(today);
      monthAgo.setDate(today.getDate() - 30);
      const monthAgoStr = monthAgo.toISOString().split('T')[0];
      return `after:${monthAgoStr}`;
    }

    default:
      return ''; // No date filter
  }
}

/**
 * Helper function to get tomorrow's date string
 */
export function getTomorrowDateString(today: Date): string {
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Sort emails by date (newest first) to ensure consistent ordering
 */
export function sortEmailsByDate(emails: GmailMessage[]): GmailMessage[] {
  return emails.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Newest first (descending order)
  });
}

/**
 * Filter emails by date range
 */
export function filterEmailsByDateRange(emails: GmailMessage[], startDate: Date, endDate: Date): GmailMessage[] {
  return emails.filter((email) => {
    const emailDate = new Date(email.date);
    return emailDate >= startDate && emailDate <= endDate;
  });
}

/**
 * Get emails from today
 */
export function getTodaysEmails(emails: GmailMessage[]): GmailMessage[] {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  return filterEmailsByDateRange(emails, startOfDay, endOfDay);
}

/**
 * Get emails from this week
 */
export function getThisWeeksEmails(emails: GmailMessage[]): GmailMessage[] {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  return filterEmailsByDateRange(emails, weekAgo, today);
}

/**
 * Get emails from this month
 */
export function getThisMonthsEmails(emails: GmailMessage[]): GmailMessage[] {
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(today.getDate() - 30);

  return filterEmailsByDateRange(emails, monthAgo, today);
}
