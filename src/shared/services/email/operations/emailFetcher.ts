import type { GmailApiResponse, GmailMessage, GmailQueryParams } from '@/shared/types/gmail.types';
import { GMAIL_CATEGORY_LABELS, GMAIL_SPECIAL_LABELS } from '../config/constants';
import { getEmails } from './api';

/**
 * Get emails from specific Gmail categories using native labels
 */
export async function getEmailsByCategory(
  category: 'primary' | 'social' | 'promotions' | 'updates' | 'forums',
  maxResults: number = 10,
): Promise<GmailApiResponse<GmailMessage[]>> {
  const params: GmailQueryParams = {
    maxResults,
    labelIds: [GMAIL_CATEGORY_LABELS[category]],
  };

  const response = await getEmails(params);
  return {
    data: response.success ? response.data.messages : [],
    success: response.success,
    error: response.error,
  };
}

/**
 * Get emails from specific Gmail categories with date filtering
 */
export async function getEmailsByCategoryWithDateFilter(
  category: 'primary' | 'social' | 'promotions' | 'updates' | 'forums',
  maxResults: number = 10,
  dateQuery: string = '',
): Promise<GmailApiResponse<GmailMessage[]>> {
  const params: GmailQueryParams = {
    maxResults,
    labelIds: [GMAIL_CATEGORY_LABELS[category]],
    q: dateQuery, // Add date filtering
  };

  const response = await getEmails(params);
  return {
    data: response.success ? response.data.messages : [],
    success: response.success,
    error: response.error,
  };
}

/**
 * Get important emails using Gmail's native importance markers
 */
export async function getImportantEmails(maxResults: number = 10): Promise<GmailApiResponse<GmailMessage[]>> {
  const params: GmailQueryParams = {
    maxResults,
    labelIds: [GMAIL_SPECIAL_LABELS.IMPORTANT],
  };

  const response = await getEmails(params);
  return {
    data: response.success ? response.data.messages : [],
    success: response.success,
    error: response.error,
  };
}

/**
 * Get starred emails
 */
export async function getStarredEmails(maxResults: number = 10): Promise<GmailApiResponse<GmailMessage[]>> {
  const params: GmailQueryParams = {
    maxResults,
    labelIds: [GMAIL_SPECIAL_LABELS.STARRED],
  };

  const response = await getEmails(params);
  return {
    data: response.success ? response.data.messages : [],
    success: response.success,
    error: response.error,
  };
}

/**
 * Get starred emails with date filtering
 */
export async function getStarredEmailsWithDateFilter(
  maxResults: number = 10,
  dateQuery: string = '',
): Promise<GmailApiResponse<GmailMessage[]>> {
  const params: GmailQueryParams = {
    maxResults,
    labelIds: [GMAIL_SPECIAL_LABELS.STARRED],
    q: dateQuery, // Add date filtering
  };

  const response = await getEmails(params);
  return {
    data: response.success ? response.data.messages : [],
    success: response.success,
    error: response.error,
  };
}
