import type {
  GmailMessage,
  GmailProfile,
  GmailApiResponse,
  GmailListResponse,
  GmailQueryParams,
  GoogleOAuthConfig,
  GmailMessageWithStress,
  GmailApiProfile,
  GoogleTokenResponse,
  GmailApiMessageList,
  GmailApiMessage,
  GoogleOAuthClient,
} from '../types/gmail.types';
import type { ViewType } from '../../modules/home/infrastructure/types/home.types';

class GmailService {
  private accessToken: string | null = null;
  private tokenExpirationTime: number | null = null;
  private isInitialized = false;

  private readonly config: GoogleOAuthConfig = {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  };

  /**
   * Initialize the Gmail service and load the Google Identity Services library
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load Google Identity Services library
      await this.loadGoogleIdentityScript();

      // Initialize Google OAuth
      if (window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.initTokenClient({
          client_id: this.config.clientId,
          scope: this.config.scope.join(' '),
          callback: this.handleAuthCallback.bind(this),
        });
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Gmail service:', error);
      throw new Error('Gmail service initialization failed');
    }
  }

  /**
   * Load Google Identity Services script dynamically
   */
  private loadGoogleIdentityScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  /**
   * Handle OAuth callback
   */
  private handleAuthCallback(response: GoogleTokenResponse): void {
    if (response.error) {
      console.error('OAuth error:', response.error);
      return;
    }

    this.accessToken = response.access_token;
    this.tokenExpirationTime = Date.now() + response.expires_in * 1000;

    this.storeTokensSecurely(response);
  }

  /**
   * Store tokens securely in sessionStorage
   */
  private storeTokensSecurely(tokenResponse: GoogleTokenResponse): void {
    try {
      const tokenData = {
        accessToken: tokenResponse.access_token,
        expirationTime: this.tokenExpirationTime,
        scope: tokenResponse.scope,
      };

      // Use sessionStorage for better security (cleared when tab closes)
      sessionStorage.setItem('gmail_auth', JSON.stringify(tokenData));
    } catch (error) {
      console.warn('Failed to store tokens securely:', error);
    }
  }

  /**
   * Load stored tokens
   */
  private loadStoredTokens(): boolean {
    try {
      const stored = sessionStorage.getItem('gmail_auth');
      if (!stored) return false;

      const tokenData = JSON.parse(stored);

      // Check if token is still valid
      if (tokenData.expirationTime && Date.now() < tokenData.expirationTime) {
        this.accessToken = tokenData.accessToken;
        this.tokenExpirationTime = tokenData.expirationTime;
        return true;
      } else {
        // Token expired, remove it
        this.clearStoredTokens();
        return false;
      }
    } catch (error) {
      console.warn('Failed to load stored tokens:', error);
      return false;
    }
  }

  /**
   * Clear stored tokens
   */
  private clearStoredTokens(): void {
    sessionStorage.removeItem('gmail_auth');
    this.accessToken = null;
    this.tokenExpirationTime = null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // First try to load stored tokens
    if (!this.accessToken) {
      this.loadStoredTokens();
    }

    return !!(this.accessToken && this.tokenExpirationTime && Date.now() < this.tokenExpirationTime);
  }

  /**
   * Initiate OAuth flow
   */
  async authenticate(): Promise<GmailApiResponse<boolean>> {
    try {
      await this.initialize();

      return new Promise((resolve) => {
        if (!window.google?.accounts?.oauth2) {
          resolve({
            data: false,
            success: false,
            error: 'Google OAuth not available',
          });
          return;
        } // Create token client and request access token
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: this.config.clientId,
          scope: this.config.scope.join(' '),
          callback: (response: GoogleTokenResponse) => {
            if (response.error) {
              resolve({
                data: false,
                success: false,
                error: response.error,
              });
            } else {
              this.handleAuthCallback(response);
              resolve({
                data: true,
                success: true,
              });
            }
          },
        });

        client.requestAccessToken();
      });
    } catch (error) {
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Sign out and clear tokens
   */
  async signOut(): Promise<void> {
    this.clearStoredTokens();

    // Revoke token if available
    if (this.accessToken && window.google?.accounts?.oauth2) {
      try {
        window.google.accounts.oauth2.revoke(this.accessToken);
      } catch (error) {
        console.warn('Failed to revoke token:', error);
      }
    }
  }

  /**
   * Make authenticated API request to Gmail
   */
  private async makeGmailRequest<T>(
    endpoint: string,
    params: Record<string, string | number | boolean> = {},
  ): Promise<GmailApiResponse<T>> {
    if (!this.isAuthenticated()) {
      return {
        data: {} as T,
        success: false,
        error: 'Not authenticated',
      };
    }

    try {
      const url = new URL(`https://gmail.googleapis.com/gmail/v1${endpoint}`);

      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        data,
        success: true,
      };
    } catch (error) {
      return {
        data: {} as T,
        success: false,
        error: error instanceof Error ? error.message : 'API request failed',
      };
    }
  }

  /**
   * Get user profile information
   */
  async getProfile(): Promise<GmailApiResponse<GmailProfile>> {
    const response = await this.makeGmailRequest<GmailApiProfile>('/users/me/profile');

    if (!response.success) {
      return response as GmailApiResponse<GmailProfile>;
    }

    const profile: GmailProfile = {
      emailAddress: response.data.emailAddress,
      messagesTotal: response.data.messagesTotal,
      threadsTotal: response.data.threadsTotal,
      historyId: response.data.historyId,
    };

    return {
      data: profile,
      success: true,
    };
  }

  /**
   * Get list of emails with optional filtering
   */
  async getEmails(params: GmailQueryParams = {}): Promise<GmailApiResponse<GmailListResponse>> {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params.maxResults !== undefined) queryParams.maxResults = params.maxResults || 5;
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    if (params.q) queryParams.q = params.q;
    if (params.labelIds) queryParams.labelIds = params.labelIds.join(',');
    queryParams.includeSpamTrash = params.includeSpamTrash || false;

    const response = await this.makeGmailRequest<GmailApiMessageList>('/users/me/messages', queryParams);

    if (!response.success) {
      return response as GmailApiResponse<GmailListResponse>;
    }

    // Get detailed information for each message
    const messages: GmailMessage[] = [];
    const maxResults = (queryParams.maxResults as number) || 5;
    if (response.data.messages) {
      for (const messageRef of response.data.messages.slice(0, maxResults)) {
        const messageDetail = await this.getMessageDetails(messageRef.id);
        if (messageDetail.success) {
          messages.push(messageDetail.data);
        }
      }
    }

    // Sort messages by date (newest first) to ensure consistent ordering
    const sortedMessages = messages.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Newest first (descending order)
    });

    const listResponse: GmailListResponse = {
      messages: sortedMessages,
      nextPageToken: response.data.nextPageToken,
      resultSizeEstimate: response.data.resultSizeEstimate || 0,
    };

    return {
      data: listResponse,
      success: true,
    };
  }

  /**
   * Get detailed information for a specific message
   */
  private async getMessageDetails(messageId: string): Promise<GmailApiResponse<GmailMessage>> {
    const response = await this.makeGmailRequest<GmailApiMessage>(`/users/me/messages/${messageId}`);
    if (!response.success) {
      return {
        data: {} as GmailMessage,
        success: false,
        error: response.error,
      };
    }

    const messageData = response.data;
    const headers = messageData.payload?.headers || [];

    // Extract header information
    const getHeader = (name: string) =>
      headers.find((h: { name: string; value: string }) => h.name === name)?.value || '';

    const message: GmailMessage = {
      id: messageData.id,
      threadId: messageData.threadId,
      subject: getHeader('Subject'),
      from: getHeader('From'),
      to: getHeader('To'),
      snippet: messageData.snippet || '',
      date: new Date(parseInt(messageData.internalDate)),
      read: !messageData.labelIds?.includes('UNREAD'),
      important: messageData.labelIds?.includes('IMPORTANT') || false,
      starred: messageData.labelIds?.includes('STARRED') || false,
      hasAttachments:
        messageData.payload?.parts?.some((part: { filename?: string }) => part.filename && part.filename.length > 0) ||
        false,
      labels: messageData.labelIds || [],
    };

    return {
      data: message,
      success: true,
    };
  }

  /**
   * Determine email priority based on Gmail's native indicators
   */
  private getEmailPriority(message: GmailMessage): 'low' | 'medium' | 'high' {
    // Use Gmail's native importance and other indicators
    if (message.important || message.starred) {
      return 'high';
    }

    // Check if it's in primary category (personal emails)
    if (
      message.labels.includes('CATEGORY_PERSONAL') ||
      !message.labels.some((label) => label.startsWith('CATEGORY_'))
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Get emails with Gmail's native priority classification
   */
  async getEmailsWithPriority(params: GmailQueryParams = {}): Promise<GmailApiResponse<GmailMessageWithStress[]>> {
    const emailsResponse = await this.getEmails(params);

    if (!emailsResponse.success) {
      return {
        data: [],
        success: false,
        error: emailsResponse.error,
      };
    }

    const emailsWithPriority: GmailMessageWithStress[] = emailsResponse.data.messages.map((email) => ({
      ...email,
      stressAnalysis: {
        priority: this.getEmailPriority(email),
        stressIndicators: {
          urgentKeywords: 0,
          allCapsWords: 0,
          exclamationMarks: 0,
          deadlineKeywords: 0,
          negativeEmotions: 0,
        },
      },
    }));

    return {
      data: emailsWithPriority,
      success: true,
    };
  }

  /**
   * Get emails categorized by priority levels with clear separation and date filtering
   * Focused: Starred, Personal Important Unread, Recent Important
   * Others: Promotional, Social, Updates, Forums, Read emails
   */ async getEmailsByPriority(
    focusedCount: number = 5,
    otherCount: number = 5,
    viewType: ViewType = 'my-day',
  ): Promise<GmailApiResponse<{ focused: GmailMessage[]; others: GmailMessage[] }>> {
    try {
      // Get date query for the selected view
      const dateQuery = this.getDateQueryForView(viewType);

      // Fetch different categories of emails with date filtering
      const [starredEmails, personalEmails, promotionalEmails, socialEmails, updatesEmails, forumEmails] =
        await Promise.all([
          this.getStarredEmailsWithDateFilter(focusedCount, dateQuery),
          this.getEmailsByCategoryWithDateFilter('primary', focusedCount * 2, dateQuery), // Get more to filter
          this.getEmailsByCategoryWithDateFilter('promotions', otherCount, dateQuery),
          this.getEmailsByCategoryWithDateFilter('social', Math.ceil(otherCount / 3), dateQuery),
          this.getEmailsByCategoryWithDateFilter('updates', Math.ceil(otherCount / 3), dateQuery),
          this.getEmailsByCategoryWithDateFilter('forums', Math.ceil(otherCount / 3), dateQuery),
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

      // Sort emails by date (newest first) to ensure consistent ordering
      const sortEmailsByDate = (emails: GmailMessage[]): GmailMessage[] => {
        return emails.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA; // Newest first (descending order)
        });
      };

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

  /**
   * Get emails from specific Gmail categories using native labels
   */
  async getEmailsByCategory(
    category: 'primary' | 'social' | 'promotions' | 'updates' | 'forums',
    maxResults: number = 10,
  ): Promise<GmailApiResponse<GmailMessage[]>> {
    const categoryLabels: Record<string, string> = {
      primary: 'CATEGORY_PERSONAL',
      social: 'CATEGORY_SOCIAL',
      promotions: 'CATEGORY_PROMOTIONS',
      updates: 'CATEGORY_UPDATES',
      forums: 'CATEGORY_FORUMS',
    };

    const params: GmailQueryParams = {
      maxResults,
      labelIds: [categoryLabels[category]],
    };

    const response = await this.getEmails(params);
    return {
      data: response.success ? response.data.messages : [],
      success: response.success,
      error: response.error,
    };
  }

  /**
   * Get important emails using Gmail's native importance markers
   */
  async getImportantEmails(maxResults: number = 10): Promise<GmailApiResponse<GmailMessage[]>> {
    const params: GmailQueryParams = {
      maxResults,
      labelIds: ['IMPORTANT'],
    };

    const response = await this.getEmails(params);
    return {
      data: response.success ? response.data.messages : [],
      success: response.success,
      error: response.error,
    };
  }

  /**
   * Get starred emails
   */
  async getStarredEmails(maxResults: number = 10): Promise<GmailApiResponse<GmailMessage[]>> {
    const params: GmailQueryParams = {
      maxResults,
      labelIds: ['STARRED'],
    };

    const response = await this.getEmails(params);
    return {
      data: response.success ? response.data.messages : [],
      success: response.success,
      error: response.error,
    };
  }

  /**
   * Get emails from specific Gmail categories with date filtering
   */
  async getEmailsByCategoryWithDateFilter(
    category: 'primary' | 'social' | 'promotions' | 'updates' | 'forums',
    maxResults: number = 10,
    dateQuery: string = '',
  ): Promise<GmailApiResponse<GmailMessage[]>> {
    const categoryLabels: Record<string, string> = {
      primary: 'CATEGORY_PERSONAL',
      social: 'CATEGORY_SOCIAL',
      promotions: 'CATEGORY_PROMOTIONS',
      updates: 'CATEGORY_UPDATES',
      forums: 'CATEGORY_FORUMS',
    };

    const params: GmailQueryParams = {
      maxResults,
      labelIds: [categoryLabels[category]],
      q: dateQuery, // Add date filtering
    };

    const response = await this.getEmails(params);
    return {
      data: response.success ? response.data.messages : [],
      success: response.success,
      error: response.error,
    };
  }

  /**
   * Get starred emails with date filtering
   */
  async getStarredEmailsWithDateFilter(
    maxResults: number = 10,
    dateQuery: string = '',
  ): Promise<GmailApiResponse<GmailMessage[]>> {
    const params: GmailQueryParams = {
      maxResults,
      labelIds: ['STARRED'],
      q: dateQuery, // Add date filtering
    };

    const response = await this.getEmails(params);
    return {
      data: response.success ? response.data.messages : [],
      success: response.success,
      error: response.error,
    };
  }

  /**
   * EMAIL CATEGORIZATION STRATEGY
   * ============================
   *
   * FOCUSED EMAILS (High Priority - Requires Immediate Attention):
   * 1. Starred emails (user explicitly marked as important)
   * 2. Unread important emails from personal category (excluding promotional/social)
   * 3. Recent unread emails from personal category (last 24 hours)
   *
   * OTHER EMAILS (Lower Priority - Background Processing):
   * 1. Promotional emails (CATEGORY_PROMOTIONS) - newsletters, marketing, etc.
   * 2. Social media notifications (CATEGORY_SOCIAL)
   * 3. Updates and newsletters (CATEGORY_UPDATES)
   * 4. Forum emails (CATEGORY_FORUMS)
   *
   * KEY PRINCIPLES:
   * - NO DUPLICATES: Each email appears in only one category
   * - PRIORITY-BASED: Focused takes precedence over others
   * - USER-INTENT: Starred emails are highest priority
   * - CONTEXT-AWARE: Promotional emails go to "others" regardless of importance flag
   * - RECENCY: Recent personal emails get priority
   */ /**
   * Generate Gmail search query for date filtering based on view type
   */
  private getDateQueryForView(viewType: ViewType): string {
    const today = new Date();

    switch (viewType) {
      case 'my-day': {
        // Get emails from today only
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        return `after:${todayStr} before:${this.getTomorrowDateString(today)}`;
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
  private getTomorrowDateString(today: Date): string {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
}

export const gmailService = new GmailService();

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
          }) => GoogleOAuthClient;
          revoke: (token: string) => void;
        };
      };
    };
  }
}
