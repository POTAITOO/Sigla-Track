# Productivity Dashboard Rules & Features

## Overview
The Productivity Dashboard gamifies habit tracking and analytics. It includes points, streaks, levels, badges, and visualizations for daily and weekly progress.

## Card Features

- **Streak Card**
  - Shows your current streak (days in a row with at least one habit completed).
  - Streak resets if no habit is completed today.
  - Streak multiplier applies to points (1.5x for 3+, 2x for 7+ days).
  - Line graph visualizes streaks for the last 7 days.

- **Weekly Completion Card**
  - Shows weekly completion percentage (average of all habits).
  - Progress bar visualizes weekly completion.
  - Suggestion encourages aiming for 100%.

- **Completed Today Card**
  - Shows the number and percentage of habits completed today (e.g., "3/5 habits completed — 60%").
  - Lists completed habits for the current day.
  - No bar graph, just icons, count, and percentage.

- **Total Habits Card**
  - Shows total number of tracked habits.
  - No bar graph, just count and icon.

## Points, Levels, Badges
- Points: 10 per habit completed today, with streak multipliers.
- Level: Every 250 points, up to level 5.
- Badge: Changes with level.

## Other Rules
- Only unfinished habits are shown for completion.
- Each habit can be completed only once per day.
- Help modal summarizes all rules.

## Visualizations
- Streak: Line graph (last 7 days)
- Weekly: Progress bar
- Completed/Total: Icons and counts

---

# Firestore Composite Indexes

To support queries for events and habits, create these indexes in the Firebase Console:

## Events
- Collection: `events`
- Fields:
  - `userId` Ascending
  - `startDate` Descending

## Habits
- Collection: `habits`
- Fields:
  - `userId` Ascending
  - `startDate` Descending

Go to [Firestore Indexes](https://console.firebase.google.com/project/sigla-track/firestore/indexes) and click "Add Index" to create these.
# Events & Habits Implementation Guide

## Overview
This implementation provides complete event and habit management functionality for your Sigla-Track app using Firebase Firestore and expo-calendar.

## Files Created

### 1. **Type Definitions** (`app/types/event.ts`)
- `Event`: Interface for event objects
- `Habit`: Interface for habit objects
- `HabitLog`: Interface for habit completion logs
- `EventCreateInput`: Form input type for creating events
- `HabitCreateInput`: Form input type for creating habits

### 2. **Event Services** (`services/eventServices.ts`)
Core service for event management:

```typescript
// Create an event
await eventServices.createEvent(userId, eventData);

// Get user's events
await eventServices.getUserEvents(userId);

// Get events by date range
await eventServices.getEventsByDateRange(userId, startDate, endDate);

// Get today's events
await eventServices.getTodayEvents(userId);

// Update event
await eventServices.updateEvent(eventId, updateData);

// Delete event
await eventServices.deleteEvent(eventId);
```

### 3. **Habit Services** (`services/habitServices.ts`)
Core service for habit management:

```typescript
// Create a habit
await habitServices.createHabit(userId, habitData);

// Get user's habits
await habitServices.getUserHabits(userId, activeOnly);

// Log habit completion
await habitServices.logHabitCompletion(habitId, userId, notes);

// Get habit logs
await habitServices.getHabitLogs(habitId);

// Toggle habit active status
await habitServices.toggleHabit(habitId, isActive);

// Delete habit
await habitServices.deleteHabit(habitId);
```

### 4. **Event Creation Component** (`app/events/create.tsx`)
Full-featured form for creating events with:
- Title and description
- Start/end date and time pickers
- Location
- Category selection (work, personal, meeting, deadline, other)
- Color picker
- Reminder configuration
- Form validation

### 5. **Habit Creation Component** (`app/habits/create.tsx`)
Full-featured form for creating habits with:
- Title and description
- Category selection (health, fitness, learning, productivity, other)
- Frequency selection (daily, weekly, monthly)
- Day of week selection for weekly habits
- Start date and optional end date
- Color picker
- Reminder configuration
- Form validation

## Firebase Firestore Structure

### Collections

#### `events`
```json
{
  "id": "auto-generated",
  "userId": "user-id",
  "title": "string",
  "description": "string",
  "startDate": "ISO 8601 timestamp",
  "endDate": "ISO 8601 timestamp",
  "location": "string",
  "category": "work|personal|meeting|deadline|other",
  "color": "#hex-color",
  "reminder": 15,
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

#### `habits`
```json
{
  "id": "auto-generated",
  "userId": "user-id",
  "title": "string",
  "description": "string",
  "category": "health|fitness|learning|productivity|other",
  "frequency": "daily|weekly|monthly",
  "daysOfWeek": [0, 1, 2, 3, 4, 5, 6],
  "startDate": "ISO 8601 timestamp",
  "endDate": "ISO 8601 timestamp (optional)",
  "color": "#hex-color",
  "reminder": 30,
  "isActive": true,
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

#### `habitLogs`
```json
{
  "id": "auto-generated",
  "habitId": "habit-id",
  "userId": "user-id",
  "completedAt": "ISO 8601 timestamp",
  "notes": "string"
}
```

## Firebase Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events rules
    match /events/{eventId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // Habits rules
    match /habits/{habitId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // Habit logs rules
    match /habitLogs/{logId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Usage Examples

### Creating an Event
```typescript
import { eventServices } from '@/services/eventServices';
import { useAuth } from '@/context/authContext';

const { user } = useAuth();

const handleCreateEvent = async () => {
  const eventData = {
    title: 'Team Meeting',
    description: 'Sprint planning',
    startDate: new Date('2026-01-15T10:00:00'),
    endDate: new Date('2026-01-15T11:00:00'),
    location: 'Conference Room A',
    category: 'meeting' as const,
    color: '#3498db',
    reminder: 30,
  };

  try {
    const newEvent = await eventServices.createEvent(user.uid, eventData);
    console.log('Event created:', newEvent);
  } catch (error) {
    console.error('Failed to create event:', error);
  }
};
```

### Creating a Habit
```typescript
import { habitServices } from '@/services/habitServices';
import { useAuth } from '@/context/authContext';

const { user } = useAuth();

const handleCreateHabit = async () => {
  const habitData = {
    title: 'Morning Workout',
    description: '30 minutes of exercise',
    category: 'fitness' as const,
    frequency: 'daily' as const,
    startDate: new Date('2026-01-01'),
    color: '#2ecc71',
    reminder: 30,
  };

  try {
    const newHabit = await habitServices.createHabit(user.uid, habitData);
    console.log('Habit created:', newHabit);
  } catch (error) {
    console.error('Failed to create habit:', error);
  }
};
```

### Logging a Habit Completion
```typescript
const handleCompleteHabit = async (habitId: string) => {
  try {
    const log = await habitServices.logHabitCompletion(
      habitId,
      user.uid,
      'Completed successfully!'
    );
    console.log('Habit logged:', log);
  } catch (error) {
    console.error('Failed to log habit:', error);
  }
};
```

## Integration with Navigation

Update your routing to include the new screens. Add to your `app/` folder structure:

```
app/
  habits/
    create.tsx        (created)
    [id].tsx         (to implement)
    list.tsx         (to implement)
  events/
    create.tsx       (created)
    [id].tsx         (existing)
```

## Next Steps

1. **Event Details View** (`app/events/[id].tsx`)
   - Display event details
   - Edit functionality
   - Delete functionality
   - Calendar integration

2. **Habit Details View** (`app/habits/[id].tsx`)
   - Display habit details
   - View completion history
   - Edit functionality
   - Delete functionality

3. **Event/Habit Lists**
   - Display all events/habits
   - Filter and search
   - Calendar view
   - Day/week/month views

4. **Notifications**
   - Setup expo-notifications
   - Schedule reminders for events
   - Schedule reminders for habits
   - Handle notification interactions

5. **Calendar Integration**
   - Use expo-calendar to sync with device calendar
   - Display events in calendar view
   - Sync habit schedules to calendar

## Dependencies Already Installed

- `expo-calendar`: ^15.0.8
- `firebase`: ^12.6.0
- `expo-router`: ~6.0.17 (for navigation)

## Notes

- All dates are stored as ISO 8601 strings in Firebase
- Category and frequency values are type-safe using TypeScript
- Error handling is included in all service methods
- Form validation prevents invalid data entry
- User authentication is required (via authContext)
- Colors are hex format for consistency
