import type { GmailApiResponse, GoogleTokenResponse } from '@/shared/types/gmail.types';
import { GOOGLE_OAUTH_CONFIG } from '../config/constants';

/**
 * Google Token Response from the Identity Services library
 */
interface GoogleTokenResponseRaw {
  access_token: string;
  expires_in: string; // Note: this is a string from Google's API
  scope: string;
  error?: string;
}

/**
 * Authentication state management for Gmail OAuth
 */
class AuthState {
  private accessToken: string | null = null;
  private tokenExpirationTime: number | null = null;
  private isInitialized = false;

  /**
   * Initialize Google Identity Services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await loadGoogleIdentityScript();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Google Identity Services:', error);
      throw new Error('Gmail authentication initialization failed');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.accessToken) {
      this.loadStoredTokens();
    }
    return !!(this.accessToken && this.tokenExpirationTime && Date.now() < this.tokenExpirationTime);
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Set authentication tokens
   */
  setTokens(accessToken: string, expirationTime: number): void {
    this.accessToken = accessToken;
    this.tokenExpirationTime = expirationTime;
  }

  /**
   * Clear authentication tokens
   */
  clearTokens(): void {
    this.accessToken = null;
    this.tokenExpirationTime = null;
    clearStoredTokens();
  }

  /**
   * Load stored tokens from session storage
   */
  private loadStoredTokens(): boolean {
    try {
      const stored = sessionStorage.getItem('gmail_auth');
      if (!stored) return false;

      const tokenData = JSON.parse(stored);

      if (tokenData.expirationTime && Date.now() < tokenData.expirationTime) {
        this.accessToken = tokenData.accessToken;
        this.tokenExpirationTime = tokenData.expirationTime;
        return true;
      } else {
        clearStoredTokens();
        return false;
      }
    } catch (error) {
      console.warn('Failed to load stored tokens:', error);
      return false;
    }
  }
}

// Create singleton auth state
const authState = new AuthState();

/**
 * Load Google Identity Services script dynamically
 */
export function loadGoogleIdentityScript(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
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
 * Handle OAuth authentication callback
 */
export function handleAuthCallback(response: GoogleTokenResponse): void {
  if (response.error) {
    console.error('OAuth error:', response.error);
    return;
  }

  const expirationTime = Date.now() + response.expires_in * 1000;
  authState.setTokens(response.access_token, expirationTime);
  storeTokensSecurely(response, expirationTime);
}

/**
 * Store tokens securely in session storage
 */
export function storeTokensSecurely(tokenResponse: GoogleTokenResponse, expirationTime: number): void {
  try {
    const tokenData = {
      accessToken: tokenResponse.access_token,
      expirationTime,
      scope: tokenResponse.scope,
    };

    sessionStorage.setItem('gmail_auth', JSON.stringify(tokenData));
  } catch (error) {
    console.warn('Failed to store tokens securely:', error);
  }
}

/**
 * Clear stored tokens from session storage
 */
export function clearStoredTokens(): void {
  sessionStorage.removeItem('gmail_auth');
}

/**
 * Initiate OAuth authentication flow
 */
export async function authenticate(): Promise<GmailApiResponse<boolean>> {
  try {
    await authState.initialize();

    return new Promise<GmailApiResponse<boolean>>((resolve) => {
      if (!window.google?.accounts?.oauth2) {
        resolve({
          data: false,
          success: false,
          error: 'Google OAuth not available',
        });
        return;
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_OAUTH_CONFIG.clientId,
        scope: GOOGLE_OAUTH_CONFIG.scope.join(' '),
        callback: (tokenResponse: GoogleTokenResponseRaw) => {
          // Convert the Google Token Response to our expected format
          const response: GoogleTokenResponse = {
            access_token: tokenResponse.access_token,
            expires_in: parseInt(tokenResponse.expires_in),
            scope: tokenResponse.scope,
            error: tokenResponse.error,
          };
          
          if (response.error) {
            resolve({
              data: false,
              success: false,
              error: response.error,
            });
          } else {
            handleAuthCallback(response);
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
 * Sign out and clear all authentication data
 */
export async function signOut(): Promise<void> {
  const accessToken = authState.getAccessToken();
  authState.clearTokens();

  if (accessToken && window.google?.accounts?.oauth2) {
    try {
      window.google.accounts.oauth2.revoke(accessToken, () => {
        // Token revoked successfully
      });
    } catch (error) {
      console.warn('Failed to revoke token:', error);
    }
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return authState.isAuthenticated();
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
  return authState.getAccessToken();
}

/**
 * Initialize authentication service
 */
export async function initializeAuth(): Promise<void> {
  return authState.initialize();
}
