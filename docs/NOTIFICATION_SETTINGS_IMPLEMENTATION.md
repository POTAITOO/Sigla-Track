# Notification Settings Implementation

## Overview
A comprehensive notification preferences system has been implemented with granular controls for push notifications, habit reminders, and event reminders.

## Changes Made

### 1. **components/profile/NotificationSettings.tsx** (Completely Rewritten)
- **Purpose**: Dedicated notification settings tab
- **Features**:
  - Master toggle: "Enable Push Notifications" - controls all notifications
  - Habit Reminders toggle - appears only when push notifications enabled
  - Event Reminders toggle - appears only when push notifications enabled
  - Loads preferences from Firestore on component mount
  - Saves preferences immediately when any toggle changes
  - Request notification permissions when enabling push notifications
  - User-friendly alerts for permission requests and failures
  - Conditional toggle enabling based on master push notification toggle

### 2. **services/userServices.ts** (Enhanced)
**Updated Methods:**
- `createUserProfile()`: Now initializes `notificationPreferences` for new users:
  ```json
  {
    "pushNotificationsEnabled": false,
    "habitRemindersEnabled": true,
    "eventRemindersEnabled": true
  }
  ```
- `updateUserProfile()`: Now accepts `notificationPreferences` parameter for persistence

### 3. **services/eventServices.ts** (Enhanced)
- **Import**: Added `userServices` for preference checking
- **Modified `createEvent()` method**:
  - Checks user's notification preferences before scheduling event reminders
  - Only schedules notification if:
    - `pushNotificationsEnabled` === true AND
    - `eventRemindersEnabled` === true
  - Falls back to safe defaults if preferences not found

### 4. **services/habitServices.ts** (Enhanced)
- **Import**: Added `userServices` for preference checking
- **Modified `createHabit()` method**:
  - Checks user's notification preferences before scheduling habit reminders
  - Only schedules notification if:
    - `pushNotificationsEnabled` === true AND
    - `habitRemindersEnabled` === true
  - Falls back to safe defaults if preferences not found

### 5. **app/tabs/profile.tsx** (Restructured)
**Changes:**
- Added `'notifications'` to `TabType` union
- Removed inline notification toggle from main profile view
- Removed notification-related state and effects
- Added "Notifications" to settings menu (navigates to new tab)
- Added conditional rendering for notifications tab:
  ```tsx
  {activeTab === 'notifications' && (
    <NotificationSettings />
  )}
  ```
- Removed unused `Platform` import and notification-related hooks

## User Experience Flow

### Initial Setup (New User)
1. User registers → Default preferences created (notifications OFF by default)
2. Navigates to Profile → Notifications menu item visible
3. Taps Notifications → Opens NotificationSettings tab

### Enabling Notifications
1. User toggles "Enable Push Notifications" ON
2. System requests notification permission
3. If granted: Preference saved to Firestore, habit/event toggles appear
4. If denied: User notified, preference remains OFF

### Managing Notification Types
1. Once push notifications enabled, user sees:
   - Habit Reminders toggle (can turn ON/OFF)
   - Event Reminders toggle (can turn ON/OFF)
2. When creating/updating habits/events:
   - If corresponding preference is OFF: Notification NOT scheduled
   - If corresponding preference is ON: Notification scheduled normally

## Data Structure

### User Document (Firestore)
```typescript
{
  email: string,
  name: string,
  bio: string,
  points: number,
  notificationPreferences: {
    pushNotificationsEnabled: boolean,
    habitRemindersEnabled: boolean,
    eventRemindersEnabled: boolean
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Default Behavior
- New users have push notifications disabled by default (privacy-first approach)
- Habit and event reminders default to enabled when user enables push notifications
- If preferences not found in profile, system uses safe defaults (allow notifications)

## Integration Points
- **Habit Creation**: Checks `habitRemindersEnabled` preference before scheduling daily reminders
- **Event Creation**: Checks `eventRemindersEnabled` preference before scheduling event reminders
- **Profile Management**: Saves preferences immediately via `userServices.updateUserProfile()`
- **User Authentication**: Initializes preferences when user first creates account

## Testing Checklist
- [ ] Toggle push notifications ON/OFF
- [ ] Verify habit/event toggles appear only when push notifications ON
- [ ] Create habit with push notifications OFF → No notification should be scheduled
- [ ] Enable push notifications, then create habit → Notification should be scheduled
- [ ] Toggle habit reminders OFF → New habits should not have reminders
- [ ] Verify preferences persist after app restart
- [ ] Check that permission request appears when enabling push notifications
