export interface EmailAuthenticationProps {
  isCurrentlyStressed: boolean;
  authenticate: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}
