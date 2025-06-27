import type { GmailApiResponse, GmailMessage } from '@/shared/types/gmail.types';
import type { ViewType } from '@/modules/home/infrastructure/types/home.types';
import { getEmailsByCategoryWithDateFilter, getStarredEmailsWithDateFilter } from '../operations/emailFetcher';
import { getDateQueryForView, sortEmailsByDate } from '../utils/dateUtils';

/**
 * Get emails categorized by priority levels with clear separation and date filtering
 * Focused: Starred, Personal Important Unread, Recent Important
 * Others: Promotional, Social, Updates, Forums, Read emails
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

    // 2. Collect unread important emails from personal category
    if (personalEmails.success) {
      personalEmails.data.forEach((email: GmailMessage) => {
        if (
          !email.read &&
          email.important &&
          !email.labels.includes('CATEGORY_PROMOTIONS') &&
          !email.labels.includes('CATEGORY_SOCIAL')
        ) {
          allFocusedCandidates.push({ email, priority: 2 });
        }
      });
    }

    // 3. Collect important emails from updates category
    if (updatesEmails.success) {
      updatesEmails.data.forEach((email: GmailMessage) => {
        if (!email.read && email.important && email.labels.includes('CATEGORY_UPDATES')) {
          allFocusedCandidates.push({ email, priority: 2 });
        }
      });
    }

    // 4. Collect recent unread emails from personal category
    if (personalEmails.success) {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      personalEmails.data.forEach((email: GmailMessage) => {
        if (
          !email.read &&
          new Date(email.date).getTime() > oneDayAgo &&
          !email.labels.includes('CATEGORY_PROMOTIONS') &&
          !email.labels.includes('CATEGORY_SOCIAL')
        ) {
          allFocusedCandidates.push({ email, priority: 3 });
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
            // Exclude important updates that should be in focused
            !(email.important && email.labels.includes('CATEGORY_UPDATES') && !email.read)
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
