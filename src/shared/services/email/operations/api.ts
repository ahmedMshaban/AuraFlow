import type {
  GmailApiResponse,
  GmailProfile,
  GmailListResponse,
  GmailMessage,
  GmailQueryParams,
  GmailApiProfile,
  GmailApiMessageList,
  GmailApiMessage,
} from '@/shared/types/gmail.types';
import { GMAIL_API_ENDPOINTS } from '../config/constants';
import { isAuthenticated, getAccessToken } from '../auth/googleAuth';

/**
 * Make authenticated API request to Gmail
 */
export async function makeGmailRequest<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
): Promise<GmailApiResponse<T>> {
  if (!isAuthenticated()) {
    return {
      data: {} as T,
      success: false,
      error: 'Not authenticated',
    };
  }

  try {
    const url = new URL(`${GMAIL_API_ENDPOINTS.BASE_URL}${endpoint}`);

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
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
export async function getProfile(): Promise<GmailApiResponse<GmailProfile>> {
  const response = await makeGmailRequest<GmailApiProfile>(GMAIL_API_ENDPOINTS.PROFILE);

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
 * Get detailed information for a specific message
 */
export async function getMessageDetails(messageId: string): Promise<GmailApiResponse<GmailMessage>> {
  const response = await makeGmailRequest<GmailApiMessage>(GMAIL_API_ENDPOINTS.MESSAGE_DETAIL(messageId));

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
 * Get list of emails with optional filtering
 */
export async function getEmails(params: GmailQueryParams = {}): Promise<GmailApiResponse<GmailListResponse>> {
  const queryParams: Record<string, string | number | boolean> = {};

  if (params.maxResults !== undefined) queryParams.maxResults = params.maxResults || 5;
  if (params.pageToken) queryParams.pageToken = params.pageToken;
  if (params.q) queryParams.q = params.q;
  if (params.labelIds) queryParams.labelIds = params.labelIds.join(',');
  queryParams.includeSpamTrash = params.includeSpamTrash || false;

  const response = await makeGmailRequest<GmailApiMessageList>(GMAIL_API_ENDPOINTS.MESSAGES, queryParams);

  if (!response.success) {
    return response as GmailApiResponse<GmailListResponse>;
  }

  // Get detailed information for each message
  const messages: GmailMessage[] = [];
  const maxResults = (queryParams.maxResults as number) || 5;

  if (response.data.messages) {
    for (const messageRef of response.data.messages.slice(0, maxResults)) {
      const messageDetail = await getMessageDetails(messageRef.id);
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
