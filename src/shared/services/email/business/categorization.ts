import type { GmailApiResponse, GmailMessage } from '@/shared/types/gmail.types';
import type { ViewType } from '@/shared/hooks/useFilters';
import { getEmailsByCategoryWithDateFilter, getStarredEmailsWithDateFilter } from '../operations/emailFetcher';
import { getDateQueryForView, sortEmailsByDate } from '../utils/dateUtils';

/**
 * Get emails categorized by priority levels with clear separation and date filtering
 * Focused: Starred, Important emails (read and unread), Recent emails (read and unread)
 * Others: Promotional, Social, Updates (non-important), Forums
 * Priority system: 1=Starred, 2=Unread Important, 3=Read Important/Unread Recent, 4=Read Recent
 */
export async function getEmailsByPriority(
  focusedCount: number = 5,
  otherCount: number = 5,
  viewType: ViewType = 'my-day',
): Promise<GmailApiResponse<{ focused: GmailMessage[]; others: GmailMessage[] }>> {
  try {
    // Get date query for the selected view
    const dateQuery = getDateQueryForView(viewType);

    // Fetch different categories of emails with date filtering
    const [starredEmails, personalEmails, promotionalEmails, socialEmails, updatesEmails, forumEmails] =
      await Promise.all([
        getStarredEmailsWithDateFilter(focusedCount, dateQuery),
        getEmailsByCategoryWithDateFilter('primary', focusedCount * 2, dateQuery), // Get more to filter
        getEmailsByCategoryWithDateFilter('promotions', otherCount, dateQuery),
        getEmailsByCategoryWithDateFilter('social', Math.ceil(otherCount / 3), dateQuery),
        getEmailsByCategoryWithDateFilter('updates', Math.ceil(otherCount / 3), dateQuery),
        getEmailsByCategoryWithDateFilter('forums', Math.ceil(otherCount / 3), dateQuery),
      ]);

    // === FOCUSED EMAILS (High Priority) ===
    const focusedEmailsMap = new Map<string, GmailMessage>();
    const allFocusedCandidates: Array<{ email: GmailMessage; priority: number }> = [];

    // 1. Collect starred emails (highest priority)
    if (starredEmails.success) {
      starredEmails.data.forEach((email: GmailMessage) => {
        allFocusedCandidates.push({ email, priority: 1 }); // Highest priority
      });
    }

    // 2. Collect important emails from personal category (both read and unread)
    if (personalEmails.success) {
      personalEmails.data.forEach((email: GmailMessage) => {
        if (
          email.important &&
          !email.labels.includes('CATEGORY_PROMOTIONS') &&
          !email.labels.includes('CATEGORY_SOCIAL')
        ) {
          // Prioritize unread over read, but include both
          const priority = email.read ? 3 : 2;
          allFocusedCandidates.push({ email, priority });
        }
      });
    }

    // 3. Collect important emails from updates category (both read and unread)
    if (updatesEmails.success) {
      updatesEmails.data.forEach((email: GmailMessage) => {
        if (email.important && email.labels.includes('CATEGORY_UPDATES')) {
          // Prioritize unread over read, but include both
          const priority = email.read ? 3 : 2;
          allFocusedCandidates.push({ email, priority });
        }
      });
    }

    // 4. Collect recent emails from personal category (both read and unread)
    if (personalEmails.success) {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      personalEmails.data.forEach((email: GmailMessage) => {
        if (
          new Date(email.date).getTime() > oneDayAgo &&
          !email.labels.includes('CATEGORY_PROMOTIONS') &&
          !email.labels.includes('CATEGORY_SOCIAL')
        ) {
          // Recent emails get lower priority, unread still preferred
          const priority = email.read ? 4 : 3;
          allFocusedCandidates.push({ email, priority });
        }
      });
    }

    // 5. If we don't have enough focused emails, add more from personal category
    if (personalEmails.success && allFocusedCandidates.length < focusedCount * 1.5) {
      personalEmails.data.forEach((email: GmailMessage) => {
        if (
          !email.labels.includes('CATEGORY_PROMOTIONS') &&
          !email.labels.includes('CATEGORY_SOCIAL') &&
          !allFocusedCandidates.some((candidate) => candidate.email.id === email.id)
        ) {
          // General personal emails get lowest priority in focused
          const priority = email.read ? 6 : 5;
          allFocusedCandidates.push({ email, priority });
        }
      });
    }

    // Sort all focused candidates by priority first, then by date (newest first)
    allFocusedCandidates.sort((a, b) => {
      // First sort by priority (lower number = higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Then by date (newest first)
      const dateA = new Date(a.email.date).getTime();
      const dateB = new Date(b.email.date).getTime();
      return dateB - dateA;
    });

    // Select top emails without duplicates, maintaining date order
    const focusedEmails: GmailMessage[] = [];
    allFocusedCandidates.forEach(({ email }) => {
      if (!focusedEmailsMap.has(email.id) && focusedEmails.length < focusedCount) {
        focusedEmailsMap.set(email.id, email);
        focusedEmails.push(email);
      }
    });

    // === OTHER EMAILS (Lower Priority) ===
    const otherEmails: GmailMessage[] = [];
    const otherEmailsSet = new Set<string>();

    // Add emails that are specifically categorized as background/bulk
    const otherCategories = [
      { emails: promotionalEmails, name: 'promotional' },
      { emails: socialEmails, name: 'social' },
      { emails: updatesEmails, name: 'updates' },
      { emails: forumEmails, name: 'forums' },
    ];

    otherCategories.forEach(({ emails }) => {
      if (emails.success && otherEmails.length < otherCount) {
        emails.data.forEach((email: GmailMessage) => {
          if (
            !otherEmailsSet.has(email.id) &&
            !focusedEmailsMap.has(email.id) && // Don't duplicate from focused
            otherEmails.length < otherCount &&
            // Exclude important updates that should be in focused (both read and unread)
            !(email.important && email.labels.includes('CATEGORY_UPDATES'))
          ) {
            otherEmailsSet.add(email.id);
            otherEmails.push(email);
          }
        });
      }
    });

    return {
      data: {
        focused: sortEmailsByDate(focusedEmails),
        others: sortEmailsByDate(otherEmails),
      },
      success: true,
    };
  } catch (error) {
    return {
      data: { focused: [], others: [] },
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch emails by priority',
    };
  }
}
