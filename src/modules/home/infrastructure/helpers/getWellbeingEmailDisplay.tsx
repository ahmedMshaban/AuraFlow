/**
 * Get wellbeing-focused email display text and emoji based on email counts and stress state
 * Promotes positive email management and reduces inbox anxiety through adaptive messaging
 * 
 * @param numOfFocusedEmails - Number of high-priority/focused emails (undefined = loading/error state)
 * @param numOfOtherEmails - Number of lower-priority emails (undefined = loading/error state) 
 * @param isCurrentlyStressed - Whether the user is currently experiencing stress
 * @returns Object containing count (number|string), label (string), and icon (string) for display
 * 
 * @example
 * ```typescript
 * // Normal state with emails
 * getWellbeingEmailDisplay(3, 7, false)
 * // Returns: { count: 10, label: 'emails to explore 📮', icon: '' }
 * 
 * // Stressed state - focuses only on important emails
 * getWellbeingEmailDisplay(2, 5, true)
 * // Returns: { count: 2, label: 'important emails 🎯', icon: '' }
 * 
 * // Empty inbox
 * getWellbeingEmailDisplay(0, 0, false)
 * // Returns: { count: '', label: 'inbox clear! 🌟', icon: '' }
 * ```
 */
const getWellbeingEmailDisplay = (
  numOfFocusedEmails: number | undefined,
  numOfOtherEmails: number | undefined,
  isCurrentlyStressed: boolean,
): { count: number | string; label: string; icon: string } => {
  const focusedCount = numOfFocusedEmails ?? 0;
  const otherCount = numOfOtherEmails ?? 0;
  const totalCount = focusedCount + otherCount;

  if (isCurrentlyStressed) {
    // STRESS MODE: Focus only on important emails to reduce overwhelm
    if (focusedCount === 0) {
      return {
        count: '',
        label: 'inbox zen achieved! ✨',
        icon: '',
      };
    } else if (focusedCount === 1) {
      return {
        count: '',
        label: '1 important email 🎯',
        icon: '',
      };
    } else if (focusedCount <= 3) {
      return {
        count: focusedCount,
        label: 'important emails 🎯',
        icon: '',
      };
    } else if (focusedCount <= 5) {
      return {
        count: focusedCount,
        label: 'priority emails 📧',
        icon: '',
      };
    } else {
      return {
        count: focusedCount,
        label: 'emails need attention ⚡',
        icon: '',
      };
    }
  } else {
    // NORMAL MODE: Show all emails with positive framing
    if (totalCount === 0) {
      return {
        count: '',
        label: 'inbox clear! 🌟',
        icon: '',
      };
    } else if (totalCount === 1) {
      return {
        count: '',
        label: '1 email to read 📬',
        icon: '',
      };
    } else if (totalCount <= 5) {
      return {
        count: totalCount,
        label: 'emails to explore 📮',
        icon: '',
      };
    } else if (totalCount <= 15) {
      return {
        count: totalCount,
        label: 'emails waiting 📪',
        icon: '',
      };
    } else if (totalCount <= 30) {
      return {
        count: totalCount,
        label: 'emails in inbox 📬',
        icon: '',
      };
    } else {
      return {
        count: `${Math.floor(totalCount / 10) * 10}+`,
        label: 'emails to organize 📫',
        icon: '',
      };
    }
  }
};

export default getWellbeingEmailDisplay;
