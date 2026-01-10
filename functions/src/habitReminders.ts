import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function that checks for due habit reminders every minute
 * and sends FCM notifications to users
 */
export const checkHabitReminders = functions
  .region('us-central1')
  .pubsub.schedule('every 1 minutes')
  .onRun(async (context) => {
    try {
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const reminderTime = `${currentHour}:${currentMinute}`;

      console.log(`[${new Date().toISOString()}] Checking for habits due at ${reminderTime}`);

      // Get all habits with matching reminder time
      const habitsSnapshot = await db
        .collection('habits')
        .where('reminderTime', '==', reminderTime)
        .where('isActive', '==', true)
        .get();

      console.log(`Found ${habitsSnapshot.size} habits with reminder time ${reminderTime}`);

      let notificationsSent = 0;
      let habitsSkipped = 0;

      for (const habitDoc of habitsSnapshot.docs) {
        const habit = habitDoc.data();
        const userId = habit.userId;
        const habitId = habitDoc.id;

        try {
          // Check if user already completed this habit today
          const today = new Date().toISOString().split('T')[0];
          const completedSnapshot = await db
            .collection('habitLogs')
            .where('habitId', '==', habitId)
            .where('userId', '==', userId)
            .where('completedDate', '==', today)
            .limit(1)
            .get();

          if (!completedSnapshot.empty) {
            console.log(`Habit "${habit.title}" already completed by user ${userId} today`);
            habitsSkipped++;
            continue;
          }

          // Get user's FCM token
          const userSnapshot = await db.collection('users').doc(userId).get();
          const user = userSnapshot.data();

          if (!user?.fcmToken) {
            console.log(`No FCM token found for user ${userId}`);
            habitsSkipped++;
            continue;
          }

          // Send FCM notification
          const message = {
            notification: {
              title: 'Time for your habit!',
              body: `Don't forget: ${habit.title}`,
            },
            data: {
              type: 'habit_reminder',
              habitId: habitId,
              habitTitle: habit.title,
            },
            token: user.fcmToken,
          };

          const response = await admin.messaging().send(message);
          console.log(`FCM notification sent for habit "${habit.title}" to user ${userId}. Message ID: ${response}`);
          notificationsSent++;
        } catch (error) {
          console.error(`Error processing habit ${habitDoc.id}:`, error);
        }
      }

      console.log(
        `Habit reminder check completed. Sent: ${notificationsSent}, Skipped: ${habitsSkipped}, Total: ${habitsSnapshot.size}`
      );

      return { success: true, notificationsSent, habitsSkipped };
    } catch (error) {
      console.error('Error in checkHabitReminders:', error);
      throw error;
    }
  });

/**
 * Optional: HTTP function to manually test sending a notification
 * Usage: POST to this endpoint with { userId, habitId }
 */
export const testSendNotification = functions
  .region('us-central1')
  .https.onRequest(async (req, res) => {
    try {
      const { userId, habitTitle } = req.body;

      if (!userId || !habitTitle) {
        return res.status(400).json({ error: 'userId and habitTitle are required' });
      }

      // Get user's FCM token
      const userSnapshot = await db.collection('users').doc(userId).get();
      const user = userSnapshot.data();

      if (!user?.fcmToken) {
        return res.status(404).json({ error: 'User or FCM token not found' });
      }

      // Send test notification
      const message = {
        notification: {
          title: 'Test Notification',
          body: `This is a test for: ${habitTitle}`,
        },
        data: {
          type: 'habit_reminder',
          habitTitle: habitTitle,
        },
        token: user.fcmToken,
      };

      const response = await admin.messaging().send(message);
      res.json({ success: true, messageId: response });
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({ error: String(error) });
    }
  });
