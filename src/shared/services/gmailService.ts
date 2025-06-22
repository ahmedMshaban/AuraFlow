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
    } // Get detailed information for each message
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

    const listResponse: GmailListResponse = {
      messages,
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
   * Get emails categorized by priority levels using Gmail's native categories
   */
  async getEmailsByPriority(
    focusedCount: number = 5,
    otherCount: number = 5,
  ): Promise<GmailApiResponse<{ focused: GmailMessage[]; others: GmailMessage[] }>> {
    try {
      // Fetch focused emails directly from important/starred and primary categories
      const [importantEmails, starredEmails, primaryEmails, promotionalEmails] = await Promise.all([
        this.getImportantEmails(Math.ceil(focusedCount / 2)),
        this.getStarredEmails(Math.ceil(focusedCount / 2)),
        this.getEmailsByCategory('primary', focusedCount),
        this.getEmailsByCategory('promotions', otherCount),
      ]);

      // Combine important and starred for focused (remove duplicates)
      const focusedEmailsSet = new Set<string>();
      const focusedEmails: GmailMessage[] = []; // Add important emails first
      if (importantEmails.success) {
        importantEmails.data.forEach((email: GmailMessage) => {
          if (!focusedEmailsSet.has(email.id) && focusedEmails.length < focusedCount) {
            focusedEmailsSet.add(email.id);
            focusedEmails.push(email);
          }
        });
      }

      // Add starred emails if we still need more
      if (starredEmails.success && focusedEmails.length < focusedCount) {
        starredEmails.data.forEach((email: GmailMessage) => {
          if (!focusedEmailsSet.has(email.id) && focusedEmails.length < focusedCount) {
            focusedEmailsSet.add(email.id);
            focusedEmails.push(email);
          }
        });
      }

      // If still need more focused emails, add from primary category
      if (primaryEmails.success && focusedEmails.length < focusedCount) {
        primaryEmails.data.forEach((email: GmailMessage) => {
          if (!focusedEmailsSet.has(email.id) && focusedEmails.length < focusedCount) {
            focusedEmailsSet.add(email.id);
            focusedEmails.push(email);
          }
        });
      }

      // Use promotional emails for "others" category
      const otherEmails = promotionalEmails.success ? promotionalEmails.data.slice(0, otherCount) : [];

      return {
        data: {
          focused: focusedEmails,
          others: otherEmails,
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
}

// Create singleton instance
export const gmailService = new GmailService();

// Type declarations for Google APIs (global)
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
