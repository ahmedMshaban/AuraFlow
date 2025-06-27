// Export all email modules for direct use

// Authentication
export * from './auth/googleAuth';

// Core operations
export * from './operations/api';
export * from './operations/emailFetcher';

// Business logic
export * from './business/priorityClassifier';
export * from './business/categorization';

// Utilities
export * from './utils/dateUtils';
export * from './utils/filterUtils';

// Configuration
export * from './config/constants';

// Re-export types for convenience
export type {
  GmailMessage,
  GmailProfile,
  GmailApiResponse,
  GmailListResponse,
  GmailQueryParams,
  GoogleOAuthConfig,
  GmailMessageWithStress,
  GoogleTokenResponse,
} from '@/shared/types/gmail.types';
