/**
 * Opens a Gmail email in a new browser tab
 * @param emailId - The Gmail message ID
 * @param accountIndex - The Gmail account index (default: 0 for primary account)
 * @returns void
 * @throws {Error} When emailId is invalid or missing
 * @example
 * openGmailEmail('1234567890abcdef') // Opens email in primary Gmail account
 * openGmailEmail('1234567890abcdef', 1) // Opens email in secondary Gmail account
 */
const openGmailEmail = (emailId: string, accountIndex?: number): void => {
  if (!emailId || typeof emailId !== 'string' || emailId.trim() === '') {
    throw new Error('Invalid email ID provided');
  }

  // Set default value for accountIndex
  const finalAccountIndex = accountIndex ?? 0;

  // Check if accountIndex was explicitly passed and is invalid
  if (accountIndex !== undefined && (accountIndex === null || typeof accountIndex !== 'number' || accountIndex < 0)) {
    throw new Error('Invalid account index provided');
  }

  const gmailUrl = `https://mail.google.com/mail/u/${finalAccountIndex}/#inbox/${emailId.trim()}`;

  try {
    window.open(gmailUrl, '_blank');
  } catch {
    throw new Error('Failed to open Gmail email');
  }
};

export default openGmailEmail;
