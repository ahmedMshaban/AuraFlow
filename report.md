# Gmail Integration features

## 🔒 Security Features

- **Read-only access**: Only reads emails, cannot send or modify
- **Secure token storage**: Tokens stored in sessionStorage (cleared on tab close)
- **No data persistence**: Email content is not stored on servers
- **Automatic token revocation**: Tokens are revoked on sign out

## 📊 Stress Analysis Features

The Gmail integration includes intelligent email stress analysis:

- **Urgency Detection**: Identifies urgent keywords and patterns
- **Deadline Tracking**: Detects deadline-related content
- **Emotional Indicators**: Analyzes negative emotions and stress triggers
- **Priority Scoring**: Assigns stress scores (0-100) to each email
- **Smart Recommendations**: Provides action suggestions based on stress level

## 📈 Performance Optimizations

- **Lazy loading**: Gmail service only initializes when needed
- **Token caching**: Reduces API calls with intelligent token management
- **Selective fetching**: Only fetches email details for displayed emails
- **Background refresh**: Non-blocking email updates

## focus tab vs others tab

### Focused Emails (High Priority/Immediate Attention)
- Starred emails (user explicitly marked as important)
- Unread important emails from personal category (CATEGORY_PERSONAL + IMPORTANT + UNREAD)
- Unread emails from known contacts (not promotional)
- Recent emails marked as important (within last 24-48 hours)

### Other Emails (Lower Priority/Background Processing)
Promotional emails (CATEGORY_PROMOTIONS) - regardless of importance
Social media notifications (CATEGORY_SOCIAL)
Updates and newsletters (CATEGORY_UPDATES)
Forum emails (CATEGORY_FORUMS)
Read important emails (already processed)
## notes

- Currently, we only have read-only access to Gmail, so the "mark as read" feature is unavailable.

