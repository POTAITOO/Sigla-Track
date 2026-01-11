# 🎯 Habit Reminder Time-Based System - User Guide

## What Changed?

### Before ❌
```
Reminder: [30] minutes before
```
User creates habit "Boxing" at 8:00 AM with "30 minutes before"
→ Notification comes at 7:30 AM

### After ✅
```
Reminder Time: [08:00]
```
User creates habit "Boxing" with reminder time "08:00"
→ Notification comes at exactly 8:00 AM every day

---

## Why This Is Better

| Aspect | Old System | New System |
|--------|-----------|-----------|
| **Clarity** | "30 mins before what time?" | "Notify at 8:00 AM" ✓ |
| **Consistency** | Varies daily | Same time every day ✓ |
| **Habit Building** | Confusing | "I do this at 8 AM every day" ✓ |
| **Flexibility** | Limited | Different times per habit ✓ |

---

## How to Create a Habit with Reminder Time

### Step 1: Fill in Basic Info
```
Title: "Morning Exercise"
Category: "Fitness"
Frequency: "Daily"
```

### Step 2: Set Reminder Time
1. Tap **"Reminder Time"** button
2. A time picker appears
3. Select time (e.g., 08:00)
4. Confirm selection

### Step 3: Save
- Tap **"Create Habit"**
- Habit is saved with reminder time

---

## Daily Reminder Flow

```
User sleeps...
    ↓
08:00 AM arrives
    ↓
📱 Phone vibrates with notification
    ↓
User sees: "🏋️ Time for Morning Exercise!"
    ↓
User opens app → Completes habit
    ↓
Habit logged ✅ Points earned! 🎉
```

---

## Frequency Examples

### Daily Habit
```
Title: "Morning Jog"
Frequency: DAILY
Reminder Time: 06:00 (6 AM)

→ Every day at 6:00 AM, user gets notified
```

### Weekly Habit
```
Title: "Team Meeting"
Frequency: WEEKLY
Days: Monday, Wednesday, Friday
Reminder Time: 09:00

→ Every Mon/Wed/Fri at 9:00 AM, user gets notified
```

### Monthly Habit
```
Title: "Review Progress"
Frequency: MONTHLY
Day: 15th
Reminder Time: 10:00

→ Every 15th of month at 10:00 AM, user gets notified
```

---

## Automatic Migration

**Good news!** All your existing habits have been automatically updated:
- ✅ All old habits now have reminder time = **08:00 (8:00 AM)**
- ✅ No manual work needed
- ✅ You can change individual habit times anytime

---

## FAQ

### Q: Can I have multiple reminder times for one habit?
**A:** Not yet, but that's on the roadmap! For now, set the main time when you'll complete it.

### Q: What if I want different times for different days?
**A:** Create separate habits for different days (e.g., "Morning Yoga Monday" vs "Morning Yoga Tuesday")

### Q: Will I get notifications at exactly the set time?
**A:** Yes! The Cloud Function checks every minute and sends notification when time matches.

### Q: Can I change the reminder time after creating the habit?
**A:** Yes! Edit the habit and select a new reminder time.

---

## Troubleshooting

### Not getting notifications?
1. ✅ Check notification permissions are enabled
2. ✅ Verify reminder time in habit settings
3. ✅ Make sure habit is active
4. ✅ Check if you've already completed the habit today

### Time showing wrong?
1. Check your device timezone
2. Update habit reminder time to correct time

### Migration didn't work?
1. Close and reopen app
2. Check console logs for migration status
3. Contact support if issue persists

---

## Example Habit Setup

### Scenario: Office Worker Building Good Habits

**Habit 1: Morning Routine**
- Time: 06:00 AM
- Frequency: Daily
- What: Exercise, shower, breakfast

**Habit 2: Standup Meeting**
- Time: 09:00 AM
- Frequency: Weekly (Mon-Fri)
- What: Team standup preparation

**Habit 3: Lunch Break**
- Time: 12:00 PM
- Frequency: Daily
- What: Take proper lunch break

**Habit 4: Learning Hour**
- Time: 17:00 (5 PM)
- Frequency: Weekly (Tue, Thu)
- What: Technical learning

**Result:** 
- Gets 4-5 notifications daily
- Maintains consistent schedule
- Habit streaks help with points multiplier
- Level up faster! 🚀

---

**Version:** 1.0  
**Last Updated:** January 11, 2026
