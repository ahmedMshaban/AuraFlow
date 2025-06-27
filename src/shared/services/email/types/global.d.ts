// Global type declarations for Google Identity Services

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: import('@/shared/types/gmail.types').GoogleTokenResponse) => void;
          }) => import('@/shared/types/gmail.types').GoogleOAuthClient;
          revoke: (token: string) => void;
        };
      };
    };
  }
}
