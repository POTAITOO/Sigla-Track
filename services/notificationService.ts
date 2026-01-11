import * as Notifications from 'expo-notifications';

export const notificationService = {
  /**
   * Schedule a local notification for a habit reminder
   * @param habitId - Unique habit ID
   * @param habitName - Name of the habit
   * @param reminderTime - Time in HH:MM format (e.g., "08:00")
   */
  scheduleHabitReminder: async (
    habitId: string,
    habitName: string,
    reminderTime: string
  ): Promise<string | null> => {
    try {
      // Parse reminder time
      const [hours, minutes] = reminderTime.split(':').map(Number);

      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error('Invalid reminder time format:', reminderTime);
        return null;
      }

      // Schedule the notification with daily repeat
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🎯 ${habitName} Time!`,
          body: `It's time to work on ${habitName}. You've got this! Let's make progress today! 💪`,
          data: {
            habitId,
            habitName,
          },
          sound: 'default',
          badge: 1,
        },
        trigger: {
          type: 'daily' as any,
          hour: hours,
          minute: minutes,
        },
      });

      console.log(`✅ Scheduled reminder for "${habitName}" at ${reminderTime} (ID: ${notificationId})`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling habit reminder:', error);
      return null;
    }
  },

  /**
   * Schedule a local notification for an event reminder
   * @param eventId - Unique event ID
   * @param eventName - Name of the event
   * @param triggerDate - Date object for when to trigger the notification
   */
  scheduleEventReminder: async (
    eventId: string,
    eventName: string,
    triggerDate: Date
  ): Promise<string | null> => {
    try {
      const now = new Date();
      const nowMs = now.getTime();
      const triggerMs = triggerDate.getTime();
      const diffMs = triggerMs - nowMs;
      const diffSeconds = Math.round(diffMs / 1000);
      
      console.log(`📊 Notification Schedule Debug:`);
      console.log(`   Current time: ${now.toLocaleString()}`);
      console.log(`   Trigger time: ${triggerDate.toLocaleString()}`);
      console.log(`   Difference: ${diffSeconds} seconds`);
      console.log(`   Trigger is ${diffSeconds > 0 ? 'FUTURE ✅' : 'PAST ❌'}`);
      
      // Add 15-second buffer to ensure notification doesn't trigger immediately
      const minimumTriggerTime = new Date(now.getTime() + 15000);
      
      // Use the later of calculated trigger time or minimum trigger time
      let finalTriggerDate = triggerDate;
      if (triggerDate < minimumTriggerTime) {
        console.warn(`⚠️ Trigger time too close! Using buffer instead (${15} seconds minimum)`);
        finalTriggerDate = minimumTriggerTime;
      }
      
      // Validate trigger date is in the future
      const finalDiffMs = finalTriggerDate.getTime() - now.getTime();
      if (finalDiffMs <= 0) {
        console.warn(`⚠️ Final trigger date is in the past! Not scheduling`);
        return null;
      }

      const timeUntilTrigger = Math.round(finalDiffMs / 1000);
      console.log(`✅ Will trigger in: ${timeUntilTrigger} seconds at ${finalTriggerDate.toLocaleString()}`);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `📋 Event Reminder: ${eventName}`,
          body: `This is a required reminder. Please ensure you attend: ${eventName}. Do not miss this event.`,
          data: {
            eventId,
            eventName,
          },
          sound: 'default',
          badge: 1,
        },
        trigger: {
          type: 'timeInterval' as any,
          seconds: timeUntilTrigger, // Schedule for X seconds from now
        },
      });
      console.log(`✅ Scheduled event reminder for "${eventName}" (ID: ${notificationId})`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling event reminder:', error);
      return null;
    }
  },

  /**
   * Cancel a scheduled notification by ID
   * @param notificationId - The ID returned from scheduleHabitReminder
   */
  cancelNotification: async (notificationId: string): Promise<void> => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`✅ Cancelled notification: ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  },

  /**
   * Request notification permissions from the OS
   */
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  /**
   * Get all scheduled notifications
   */
  getAllScheduledNotifications: async (): Promise<Notifications.NotificationRequest[]> => {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  },
};
