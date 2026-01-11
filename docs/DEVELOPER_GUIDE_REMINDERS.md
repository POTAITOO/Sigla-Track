# Developer Guide - Habit Reminder Migration & Implementation

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│          React Native App (Expo)                │
├─────────────────────────────────────────────────┤
│                                                 │
│  Components (UI)                                │
│  ├─ HabitCreateModalCollapsible.tsx             │
│  ├─ HabitCreateModalTabsV2.tsx                  │
│  ├─ HabitCreateModal.tsx                        │
│  └─ HabitMigrationRunner.tsx (auto migration)   │
│                                                 │
│  ↓ Uses                                         │
│                                                 │
│  Services                                       │
│  ├─ habitServices.ts (CRUD)                     │
│  └─ migrateHabits.ts (data migration)           │
│                                                 │
│  ↓ Communicates with                            │
│                                                 │
│  Firestore Database                             │
│  └─ /habits/{habitId}                           │
│      ├─ reminderTime: "08:00"  (NEW)            │
│      ├─ dayOfMonth: 15         (NEW)            │
│      ├─ frequency: "daily"                      │
│      └─ ...other fields                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Data Structure

### Firestore Collection: `/habits/{habitId}`

```typescript
{
  id: string,                    // Document ID
  userId: string,                // User reference
  title: string,                 // "Boxing"
  description: string,           // Optional
  category: string,              // "fitness"
  frequency: string,             // "daily" | "weekly" | "monthly"
  daysOfWeek?: number[],         // [1,3,5] for weekly (0=Sun)
  dayOfMonth?: number,           // 15 for monthly (NEW)
  startDate: string,             // ISO 8601
  endDate?: string,              // ISO 8601
  color: string,                 // "#2ecc71"
  reminderTime: string,          // "08:00" (NEW - HH:MM format)
  isActive: boolean,             // true/false
  createdAt: string,             // ISO 8601
  updatedAt: string,             // ISO 8601
}
```

### Type Definition

```typescript
// types/event.ts
export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[];    // 0-6
  dayOfMonth?: number;      // 1-31 (NEW)
  startDate: string;        // ISO 8601
  endDate?: string;
  color?: string;
  reminderTime?: string;    // "HH:MM" (NEW)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCreateInput {
  title: string;
  description?: string;
  category?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[];
  dayOfMonth?: number;      // (NEW)
  startDate: Date;
  endDate?: Date;
  color?: string;
  reminderTime?: string;    // (NEW)
}
```

---

## Service Functions

### habitServices.ts

#### Create Habit
```typescript
async createHabit(userId: string, habitData: HabitCreateInput): Promise<Habit>
```
- Saves `reminderTime` (default: "08:00")
- Saves `dayOfMonth` if monthly frequency
- Validates duplicate titles

#### Update Habit
```typescript
async updateHabit(habitId: string, updateData: Partial<HabitCreateInput>): Promise<boolean>
```
- Updates `reminderTime` field
- Checks for actual changes before updating

#### Get Habits
```typescript
async getUserHabits(userId: string): Promise<Habit[]>
async getHabitById(habitId: string): Promise<Habit | null>
```
- Retrieves habits with `reminderTime` field

---

## Migration Services

### migrateHabits.ts

#### Migration Function
```typescript
async migrateHabitsToReminderTime(): Promise<{
  success: boolean;
  migratedCount: number;
  error?: string;
}>
```

**What it does:**
1. Queries all habits in Firestore
2. Checks if habit has old `reminder` field but NO `reminderTime`
3. Updates document with `reminderTime: "08:00"`
4. Returns count of migrated habits

**Usage:**
```typescript
const result = await migrateHabitsToReminderTime();
if (result.success) {
  console.log(`Migrated ${result.migratedCount} habits`);
}
```

#### Batch Update Function
```typescript
async updateHabitsReminderTime(
  habitIds: string[],
  reminderTime: string
): Promise<{ success: boolean; updatedCount: number; error?: string }>
```

**Usage:**
```typescript
await updateHabitsReminderTime(
  ["habit1", "habit2"],
  "09:00"
);
```

---

## UI Components

### HabitCreateModalCollapsible.tsx

```typescript
// State
const [reminderTime, setReminderTime] = useState('08:00');
const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);

// Validation
if (!reminderTime || !/^\d{2}:\d{2}$/.test(reminderTime)) {
  newErrors.reminderTime = 'Please set a valid reminder time (HH:MM format).';
}

// Handle Time Picker
const handleReminderTimeChange = (event, selectedTime) => {
  if (selectedTime) {
    const hours = String(selectedTime.getHours()).padStart(2, '0');
    const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
    setReminderTime(`${hours}:${minutes}`);
  }
};

// UI
<TouchableOpacity onPress={() => setShowReminderTimePicker(true)}>
  <Text>{reminderTime}</Text>
</TouchableOpacity>

{showReminderTimePicker && (
  <DateTimePicker
    value={new Date(`2000-01-01T${reminderTime}:00`)}
    mode="time"
    display="spinner"
    onChange={handleReminderTimeChange}
  />
)}
```

### HabitMigrationRunner.tsx

```typescript
export const HabitMigrationRunner = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      runMigration();
    }
  }, [user?.uid]);

  const runMigration = async () => {
    const result = await migrateHabitsToReminderTime();
    if (result.success) {
      console.log(`✅ Migrated ${result.migratedCount} habits`);
    }
  };

  return null; // Non-visual component
};
```

**Integration in app/_layout.tsx:**
```tsx
<RootLayoutContent />
<HabitMigrationRunner />  // ← Runs automatically on startup
```

---

## Notification Flow (Future - Cloud Function)

### Firebase Cloud Function Implementation

```typescript
// functions/src/habits.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const checkHabitReminders = functions
  .pubsub
  .schedule('* * * * *') // Every minute
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 1. Get all habits where reminderTime matches current time
    const habitsRef = db.collection('habits');
    const habitsQuery = habitsRef.where('reminderTime', '==', currentTime);
    
    const snapshot = await habitsQuery.get();

    for (const doc of snapshot.docs) {
      const habit = doc.data();

      // 2. Check if today is a valid day for this habit
      const isValidDay = isHabitDueToday(habit);
      if (!isValidDay) continue;

      // 3. Check if user already completed this habit today
      const logsRef = db.collection('habitLogs');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const logsQuery = logsRef
        .where('habitId', '==', doc.id)
        .where('userId', '==', habit.userId)
        .where('completedAt', '>=', today.toISOString())
        .where('completedAt', '<', tomorrow.toISOString());

      const logsSnapshot = await logsQuery.get();

      if (logsSnapshot.empty) {
        // 4. Send notification
        await sendPushNotification(habit.userId, {
          title: `Time for ${habit.title}!`,
          body: `Your ${habit.frequency} habit reminder`,
          data: { habitId: doc.id, type: 'habit' },
        });
      }
    }
  });

function isHabitDueToday(habit): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayOfMonth = today.getDate();

  if (habit.frequency === 'daily') return true;
  if (habit.frequency === 'weekly' && habit.daysOfWeek.includes(dayOfWeek)) return true;
  if (habit.frequency === 'monthly' && habit.dayOfMonth === dayOfMonth) return true;

  return false;
}

async function sendPushNotification(userId: string, payload: any) {
  // Get user's FCM token and send via Expo
  const userRef = admin.firestore().collection('users').doc(userId);
  const userDoc = await userRef.get();
  const expoPushToken = userDoc.data()?.expoPushToken;

  if (!expoPushToken) return;

  // Send via Expo API
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      ...payload,
    }),
  });
}
```

---

## Testing Checklist

### Unit Tests
```typescript
// Test time format validation
expect(validateReminderTime("08:00")).toBe(true);
expect(validateReminderTime("25:00")).toBe(false);
expect(validateReminderTime("08")).toBe(false);

// Test migration logic
const result = await migrateHabitsToReminderTime();
expect(result.success).toBe(true);
expect(result.migratedCount).toBeGreaterThan(0);
```

### Integration Tests
```typescript
// Create habit with reminder time
const habit = await habitServices.createHabit(userId, {
  title: "Test Habit",
  frequency: "daily",
  reminderTime: "08:00",
  startDate: new Date(),
});

expect(habit.reminderTime).toBe("08:00");

// Verify in Firestore
const doc = await db.collection('habits').doc(habit.id).get();
expect(doc.data().reminderTime).toBe("08:00");
```

### Manual Testing
- [ ] Create new habit → verify time picker works
- [ ] Select different times → verify saves correctly
- [ ] Edit habit → verify reminderTime loads
- [ ] Check Firestore → confirm reminderTime field exists
- [ ] Run migration → check console logs
- [ ] Old habits → verify migrated to "08:00"

---

## Performance Considerations

### Database Queries
- ✅ Index on `(userId, frequency)` exists for getUserHabits
- ✅ Consider index on `reminderTime` for Cloud Function queries

### Migration
- ✅ Runs only once per user session
- ✅ Non-blocking (async in background)
- ✅ Logs progress to console

### Time Picker
- ✅ Uses native picker (performant)
- ✅ Minimal state updates
- ✅ No heavy computations

---

## Error Handling

```typescript
try {
  const result = await migrateHabitsToReminderTime();
  if (!result.success) {
    console.error('Migration failed:', result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error);
  // Show user-friendly message
  toastService.error('Failed to update habits. Please try again.');
}
```

---

## Future Enhancements

1. **Multiple Reminders** - Allow 2-3 reminders per habit
2. **Timezone Support** - Handle user timezones automatically
3. **Smart Reminders** - Based on user behavior patterns
4. **Snooze Feature** - Snooze notifications for 5/10 min
5. **Analytics** - Which reminder times work best for users

---

## Rollback Plan

If needed to revert to old system:

```typescript
// Add back "reminder" field during read
const habit = await getHabitById(habitId);
habit.reminder = calculateReminderFromTime(habit.reminderTime);

function calculateReminderFromTime(reminderTime: string): number {
  // Convert "08:00" back to minutes before (e.g., 30)
  // Only needed if absolutely required
}
```

---

**Last Updated:** January 11, 2026  
**Version:** 1.0
