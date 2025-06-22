export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  snippet: string;
  date: Date;
  read: boolean;
  important: boolean;
  starred: boolean;
  hasAttachments: boolean;
  labels: string[];
}

export interface GmailThread {
  id: string;
  historyId: string;
  messages: GmailMessage[];
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailAuthStatus {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  profile: GmailProfile | null;
  accessToken: string | null;
}

export interface GmailApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface GmailListResponse {
  messages: GmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}

// Google OAuth configuration
export interface GoogleOAuthConfig {
  clientId: string;
  scope: string[];
  redirectUri?: string;
}

// Gmail query parameters
export interface GmailQueryParams {
  maxResults?: number;
  pageToken?: string;
  q?: string; // Gmail search query
  labelIds?: string[];
  includeSpamTrash?: boolean;
}

// Gmail stress analysis result
export interface EmailStressAnalysis {
  stressIndicators: {
    urgentKeywords: number;
    allCapsWords: number;
    exclamationMarks: number;
    deadlineKeywords: number;
    negativeEmotions: number;
  };
  priority: 'low' | 'medium' | 'high';
}

export interface GmailMessageWithStress extends GmailMessage {
  stressAnalysis?: EmailStressAnalysis;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  error?: string;
}

export interface GoogleOAuthClient {
  requestAccessToken: () => void;
}

export interface GmailApiMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
    parts?: Array<{ filename?: string }>;
  };
  internalDate: string;
}

export interface GmailApiMessageList {
  messages?: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface GmailApiProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}
