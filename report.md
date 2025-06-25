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

 Wellbeing-Focused Email Display - Implementation Summary
🧠 Stress-Aware Email Messaging:
Stress Mode (Focus on Priority Only):

inbox zen achieved! ✨ (0 focused emails)
1 important email 🎯 (1 focused email)
3 important emails 🎯 (2-3 focused emails)
5 priority emails 📧 (4-5 focused emails)
8 emails need attention ⚡ (6+ focused emails)
Normal Mode (All Emails with Positive Framing):

inbox clear! 🌟 (0 total emails)
1 email to read 📬 (1 total email)
5 emails to explore 📮 (2-5 total emails)
12 emails waiting 📪 (6-15 total emails)
25 emails in inbox 📬 (16-30 total emails)
30+ emails to organize 📦 (31+ total emails)
🌟 Key Wellbeing Features:
✅ Stress Reduction: Shows only important emails in stress mode
✅ Positive Language: "explore", "waiting", "organize" instead of "unread"
✅ Achievement Recognition: Celebrates clear inbox states
✅ Manageable Numbers: Groups large quantities (30+ instead of exact)
✅ Visual Emojis: Intuitive inbox state indicators
✅ Gentle Framing: Avoids pressure words like "urgent" or "overdue"

💡 Psychology Applied:
Reduces Overwhelm: In stress mode, hides less important "other" emails
Positive Reinforcement: Celebrates empty states as achievements
Reframes Tasks: "emails to explore" sounds more engaging than "unread emails"
Manageable Chunks: Shows approximate counts for large numbers to reduce anxiety
Progressive Messaging: Different emojis and language based on email volume

# Tasks mangment  features

I used firestore instead of creating task on asana to avoid the user coneection with asana.

Wellbeing-Focused Task Display - Implementation Summary
Key Features:
🧠 Stress-Aware Display Logic:

Normal Mode: Shows completed tasks for positive reinforcement
Stress Mode: Shows remaining tasks for the selected time period to reduce overwhelm
📅 Time-Period Specific:

My Day: Shows today's tasks remaining/completed
My Week: Shows this week's tasks remaining/completed
My Month: Shows this month's tasks remaining/completed
🎉 Motivational Messaging:

Achievement Celebrations: "all done today! 🎉", "week completed! 🌟"
Encouraging Start: "start achieving! 🚀" when no tasks completed
Progressive Rewards: Different emojis based on completion levels
🌱 Visual Wellness Indicators:

🌱 For manageable task loads (≤3 tasks)
⏰ For higher task loads
✅🌟🏆 Progressive achievement badges
🚀 Motivation for getting started
Wellbeing Psychology Applied:
✅ Positive Reinforcement: Focus on completed tasks in normal mode
✅ Stress Reduction: Show only relevant time-period tasks when stressed
✅ Achievement Recognition: Celebratory messages for completion
✅ Gentle Motivation: Encouraging language without pressure
✅ Visual Feedback: Emoji progression creates positive association

Example Displays:
Normal Mode:

🚀 start achieving! (0 completed)
✅ 3 tasks completed (1-5 completed)
🌟 8 tasks completed (6-10 completed)
🏆 15 tasks completed (11+ completed)
Stress Mode (My Day):

🌱 2 tasks for today (manageable load)
⏰  7 tasks for today (higher load)
all done today! 🎉 (nothing remaining)
This creates a supportive, wellbeing-focused experience that adapts to the user's stress level and encourages healthy productivity habits! 🌟


Stress-Mode Tab Reduction:

In stress mode: Shows only a single "Priority" tab
Combines overdue tasks + high-priority upcoming tasks
Hides normal tabs (upcoming, overdue, completed) to reduce cognitive load
Positive Messaging:

Helper text: "🧘‍♀️ Focus Mode: Showing overdue tasks + high-priority upcoming tasks only"
Encouraging empty state: "🎉 No priority tasks right now - you're doing great!"
Proper Integration:

TasksProps includes isCurrentlyStressed: boolean
Home component passes isCurrentlyStressed prop correctly
No compilation errors
Consistent UX:

Same stress-mode pattern as emails
Reduces cognitive load by focusing on what matters most
Uses emojis and positive reinforcement
