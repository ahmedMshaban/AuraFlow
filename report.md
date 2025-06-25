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
- **Smart sorting**: Emails are sorted by date (newest first) with priority-based ordering
- **Date-aware filtering**: Efficient date range queries for different view types

## focus tab vs others tab

### Focused Emails (High Priority/Immediate Attention)

- Starred emails (user explicitly marked as important)
- Unread important emails from personal category (CATEGORY_PERSONAL + IMPORTANT + UNREAD)
- Unread important emails from updates category (CATEGORY_UPDATES + IMPORTANT + UNREAD) - e.g., university results, work notifications
- Unread emails from known contacts (not promotional)
- Recent emails marked as important (within last 24-48 hours)

### Other Emails (Lower Priority/Background Processing)

- Promotional emails (CATEGORY_PROMOTIONS) - regardless of importance
- Social media notifications (CATEGORY_SOCIAL)
- Updates and newsletters (CATEGORY_UPDATES) - except important unread ones
- Forum emails (CATEGORY_FORUMS)
- Read important emails (already processed)

## 📊 Email Sorting Strategy

To ensure the newest emails always appear at the top when switching between view filters:

### Priority-Based Sorting for Focused Emails:
1. **Starred emails** (Priority 1) - sorted by date, newest first
2. **Important unread emails** (Priority 2) - personal and updates categories
3. **Recent unread emails** (Priority 3) - last 24 hours from personal category

### Date-First Sorting for Others Emails:
- All "others" emails are sorted strictly by date (newest first)
- No priority weighting, pure chronological order

### Technical Implementation:
- Individual email fetches are sorted by date after API response
- Combined results maintain date ordering within priority groups
- View switching clears previous results and re-sorts based on new date ranges

## notes

- Currently, we only have read-only access to Gmail, so the "mark as read" feature is unavailable.

# Tasks mangment  features

I used firestore instead of creating task on asana to avoid the user coneection with asana.
