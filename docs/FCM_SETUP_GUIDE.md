# Firebase Cloud Messaging (FCM) Setup Guide

## What We've Set Up

✅ **expoPushTokenService.ts** - Registers FCM tokens from users  
✅ **habitReminders.ts** - Cloud Function to send habit reminders  
✅ **functions/package.json** - Cloud Function dependencies  
✅ **functions/tsconfig.json** - TypeScript configuration

---

## Next Steps: Manual Configuration

### Step 1: Get FCM Server Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Click **Service Accounts** tab
5. Click **Generate New Private Key** (save this safely)
6. Copy your **Project ID**

### Step 2: Add VAPID Key to .env
1. In Firebase Console → **Cloud Messaging** tab
2. Copy **Web API Key** from "Web configuration"
3. Add to your `.env.local` (or app.json):
```
EXPO_PUBLIC_FIREBASE_VAPID_KEY=your_web_api_key_here
```

### Step 3: Deploy Cloud Function
```bash
# From project root
firebase login
firebase deploy --only functions
```

This deploys `habitReminders.ts` to Firebase and enables:
- ✅ Automatic check every 1 minute
- ✅ Send notifications when habits are due
- ✅ Test endpoint for manual notifications

### Step 4: Update Firestore Rules
In Firebase Console → **Firestore** → **Rules**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /habits/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    match /habitLogs/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## Testing FCM Locally

### Option A: Firebase Console (Easiest)
1. Firebase Console → **Cloud Messaging**
2. Click "Send your first message"
3. Create a test message:
   - Title: "Test Reminder"
   - Body: "Test message"
4. Target: Select a user who has logged in
5. Click "Send"

### Option B: Using Test Function
```bash
# Send test notification to a user
curl -X POST https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/testSendNotification \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","habitTitle":"Morning Run"}'
```

---

## How It Works (Flow Diagram)

```
1. User logs in
   ↓
2. App calls registerForPushNotifications(userId)
   ↓
3. Browser/app requests FCM permission
   ↓
4. User grants permission
   ↓
5. FCM token is generated & stored in Firestore
   ↓
6. Cloud Function runs every minute
   ↓
7. Checks if current time matches any habit's reminderTime
   ↓
8. For each matching habit:
   - Check if user already completed it today
   - If not: Send FCM notification to user's token
   ↓
9. User receives notification on phone
   ↓
10. User taps notification → App opens to home tab
```

---

## Debugging

### Check Cloud Function Logs
```bash
firebase functions:log
```

### Check if FCM Token is Stored
In Firebase Console → **Firestore** → **users** collection:
```json
{
  "fcmToken": "ExponentPushToken[...]",
  "fcmTokenUpdatedAt": "2026-01-11T10:30:00Z"
}
```

### Common Issues

**❌ "No FCM token found"**
- User hasn't logged in
- Browser/app doesn't support FCM
- Permissions denied

**❌ "Function not found"**
- Didn't deploy with `firebase deploy --only functions`
- Wrong project ID

**❌ "Invalid VAPID key"**
- VAPID key not set in environment
- Wrong key format

---

## Environment Setup

### .env.local (for development)
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_VAPID_KEY=your_web_api_key
```

---

## Ready to Deploy?

```bash
# 1. Login to Firebase
firebase login

# 2. Deploy Cloud Functions
firebase deploy --only functions

# 3. Check logs
firebase functions:log

# 4. Test sending a notification
# Use Firebase Console → Cloud Messaging
```

---

## Troubleshooting Checklist

- [ ] VAPID key added to environment
- [ ] Cloud Function deployed (`firebase deploy --only functions`)
- [ ] User has valid FCM token in Firestore
- [ ] Habit has valid reminderTime (HH:MM format)
- [ ] Habit is marked as `isActive: true`
- [ ] Firestore rules allow reads/writes

Need help? Check the logs with: `firebase functions:log`
