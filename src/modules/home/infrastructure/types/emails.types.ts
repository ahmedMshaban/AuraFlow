import type { GmailMessageWithStress } from '@/shared/types/gmail.types';

export interface EmailAuthenticationProps {
  isCurrentlyStressed: boolean;
  authenticate: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export interface EmailsProps {
  maxEmails?: number; // Number of emails to fetch for each category (focused and others)
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  profile: { emailAddress: string } | null;
  focusedEmails: GmailMessageWithStress[];
  otherEmails: GmailMessageWithStress[];
  isLoadingEmails: boolean;
  emailsError: string | null;
  authenticate: () => Promise<boolean>; // Function to trigger authentication
  signOut: () => void; // Function to sign out
  fetchEmailsByPriority: (focusedCount: number, otherCount: number) => void; // Function to fetch emails by priority
  isHomePage?: boolean; // Optional prop to determine if it's on the home page (with limits) or emails page (full view)
  searchResults?: GmailMessageWithStress[];
  isSearching?: boolean;
  searchError?: string | null;
  currentSearchQuery?: string;
  searchEmails?: (query: string, maxResults?: number) => Promise<void>;
  clearSearch?: () => void;
}
