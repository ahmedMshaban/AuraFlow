import type { GoogleOAuthConfig } from '@/shared/types/gmail.types';

/**
 * Google OAuth configuration for Gmail API access
 */
export const GOOGLE_OAUTH_CONFIG: GoogleOAuthConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  scope: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
};

/**
 * Gmail API endpoints
 */
export const GMAIL_API_ENDPOINTS = {
  BASE_URL: 'https://gmail.googleapis.com/gmail/v1',
  PROFILE: '/users/me/profile',
  MESSAGES: '/users/me/messages',
  MESSAGE_DETAIL: (messageId: string) => `/users/me/messages/${messageId}`,
} as const;

/**
 * Gmail category labels mapping
 */
export const GMAIL_CATEGORY_LABELS = {
  primary: 'CATEGORY_PERSONAL',
  social: 'CATEGORY_SOCIAL',
  promotions: 'CATEGORY_PROMOTIONS',
  updates: 'CATEGORY_UPDATES',
  forums: 'CATEGORY_FORUMS',
} as const;

/**
 * Special Gmail labels
 */
export const GMAIL_SPECIAL_LABELS = {
  IMPORTANT: 'IMPORTANT',
  STARRED: 'STARRED',
  UNREAD: 'UNREAD',
} as const;
