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

# Activities Module - Stress Relief & Wellness Features

## 🧘‍♀️ Overview

The Activities module provides a comprehensive wellness platform with interactive stress-relief activities designed to help users manage stress and improve mental wellbeing. The module features a modern, responsive interface with two core activities: Box Breathing and Digital Doodling Space.

## 🎯 Core Activities

### 1. Box Breathing Exercise

Navy SEAL 4-4-4-4 Breathing Technique

#### Features

- **Guided Breathing Pattern**: 4 seconds inhale → 4 seconds hold → 4 seconds exhale → 4 seconds hold
- **Visual Feedback**: Animated breath box with real-time progress indicators
- **Phase Tracking**: Clear visual and text indicators for current breathing phase
- **Session Management**: Start, pause, resume, and stop controls
- **Progress Monitoring**: Cycle counting and time remaining display
- **Accessibility**: Screen-reader friendly phase labels and controls

#### Technical Implementation

- **Real-time Timer**: 100ms precision intervals with fake timer support for testing
- **State Management**: Comprehensive state tracking (active, phase, progress, cycles)
- **Performance Optimized**: `useCallback` for stable function references
- **Error Handling**: Graceful timer cleanup and edge case management

#### Wellbeing Benefits

- Reduces stress and anxiety through controlled breathing
- Improves focus and mental clarity
- Activates parasympathetic nervous system for relaxation
- Evidence-based technique used by military professionals

### 2. Digital Doodling Space

Creative Expression & Art Therapy

#### Digital Features

- **Free-form Drawing**: HTML5 Canvas-based digital art creation
- **Color Palette**: 12 predefined colors including primary, secondary, and neutral tones
- **Brush Customization**: 6 brush sizes (2px to 30px) for varied expression
- **Undo Functionality**: Step-by-step stroke reversal with history tracking
- **Canvas Management**: Clear canvas and reset functionality
- **Responsive Design**: Adapts to different screen sizes while maintaining aspect ratio

#### Doodling Technical Implementation

- **Canvas API Integration**: Direct HTML5 Canvas manipulation for smooth drawing
- **Stroke Recording**: Complete drawing history with timestamps and properties
- **Event Handling**: Mouse event tracking for precise drawing coordinates
- **Memory Management**: Efficient stroke storage and canvas state management

#### Creative Wellbeing Benefits

- Provides creative outlet for emotional expression
- Reduces stress through artistic engagement
- Improves mindfulness and present-moment awareness
- Supports non-verbal emotional processing

## 🏗️ Architecture & Design

### Component Structure

```
Activities/
├── index.tsx (Main page component)
├── components/
│   ├── ActivityLibrary.tsx (Activity selection grid)
│   ├── ActivityCard.tsx (Individual activity preview)
│   ├── BreathBox.tsx (Breathing exercise interface)
│   ├── DoodlingSpace.tsx (Digital art canvas)
│   └── Modal.tsx (Activity modal container)
├── infrastructure/
│   ├── hooks/ (Custom React hooks)
│   ├── helpers/ (Utility functions)
│   ├── types/ (TypeScript definitions)
│   ├── constants/ (Configuration & data)
│   └── styles/ (CSS modules)
```

### Custom Hooks

- **`useActivityLibrary`**: Manages activity selection and modal state
- **`useBreathBox`**: Controls breathing exercise logic and timing
- **`useDoodlingSpace`**: Handles canvas drawing and state management

### Type Safety

- Complete TypeScript coverage with 15+ interface definitions
- Strict typing for activity data, state management, and event handling
- Generic types for extensible activity system

## 🎨 User Experience Features

### Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: ARIA labels and semantic HTML structure
- **Visual Indicators**: Clear feedback for all user interactions
- **Responsive Design**: Mobile-first approach with touch-friendly controls

### Visual Design

- **Modern Interface**: Clean, minimalist design with calming color palette
- **Smooth Animations**: CSS transitions for engaging user interactions
- **Progress Feedback**: Real-time visual indicators for activity progress
- **Stress-Aware Colors**: Color coding for difficulty levels and stress states

### Stress-Responsive Features

- **Activity Recommendations**: Contextual guidance based on stress detection
- **Calming Aesthetics**: Soothing color schemes and gentle animations
- **Simplified UI**: Clean interface to reduce cognitive load during stress
- **Positive Reinforcement**: Encouraging messaging and achievement recognition

## 📊 Technical Specifications

### Performance Optimizations

- **Lazy Loading**: Components load only when needed
- **Memoized Calculations**: Optimized re-renders with React optimization
- **Efficient Timers**: Precise interval management with proper cleanup
- **Canvas Optimization**: Smooth drawing with optimized event handling

### Browser Compatibility

- **Modern Browsers**: Full support for Chrome, Firefox, Safari, Edge
- **Canvas API**: HTML5 Canvas with fallback support
- **Touch Events**: Mobile and tablet touch gesture support
- **Responsive Breakpoints**: Adaptive layout for all screen sizes

### Testing Coverage

- **Unit Tests**: 92+ comprehensive tests across all components and hooks
- **Integration Tests**: End-to-end activity flow testing
- **Edge Cases**: Robust error handling and boundary condition testing
- **Performance Tests**: Timer accuracy and memory usage validation

## 🔄 Integration Points

### Stress Detection Integration

- Receives stress state from parent components
- Adapts activity recommendations based on stress levels
- Provides stress-relief focused activity suggestions

### Navigation Integration

- Seamless integration with app navigation system
- Sidebar toggle for enhanced user control
- Modal system for focused activity engagement

### Theme Integration

- Consistent with app-wide design system
- Adaptive color schemes based on user preferences
- Responsive layout matching overall app aesthetics

## 🚀 Future Enhancements

### Planned Features

- **Guided Meditation**: Audio-guided meditation sessions with timer
- **Progress Tracking**: Long-term activity usage analytics
- **Customization**: User-defined breathing patterns and canvas settings
- **Social Features**: Shareable doodles and breathing achievements
- **Biometric Integration**: Heart rate monitoring for breathing exercises

### Scalability

- **Plugin Architecture**: Extensible system for adding new activities
- **Cloud Sync**: User preferences and progress synchronization
- **Offline Support**: Local storage for offline activity access
- **Multi-language**: Internationalization support for global users

## 💡 Wellbeing Psychology Applied

### Evidence-Based Design

✅ **Breathing Techniques**: Research-backed Navy SEAL methodology
✅ **Art Therapy**: Creative expression for emotional processing
✅ **Mindfulness Integration**: Present-moment awareness through focused activities
✅ **Stress Reduction**: Immediate relief tools for acute stress episodes
✅ **Positive Psychology**: Achievement recognition and progress celebration

### User-Centered Approach

✅ **Accessibility First**: Inclusive design for all users
✅ **Stress-Aware Interface**: Adaptive UI based on user state
✅ **Gentle Guidance**: Non-pressured activity suggestions
✅ **Immediate Relief**: Quick-access tools for stress management
✅ **Personal Expression**: Creative outlets for individual needs

This Activities module represents a comprehensive approach to digital wellness, combining evidence-based stress relief techniques with modern web technology to create an engaging, accessible, and effective mental health support tool. 🌟
