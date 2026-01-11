import { db } from '@/firebaseConfig';
import { notificationService } from '@/services/notificationService';
import { userServices } from '@/services/userServices';
import { Event, EventCreateInput } from '@/types/event';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where
} from 'firebase/firestore';

const EVENTS_COLLECTION = 'events';

export const eventServices = {
  /**
   * Create a new event in Firebase
   */
  async createEvent(userId: string, eventData: EventCreateInput): Promise<Event> {
    try {
      const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
        userId,
        title: eventData.title,
        description: eventData.description || '',
        startDate: eventData.startDate.toISOString(),
        endDate: eventData.endDate.toISOString(),
        location: eventData.location || '',
        category: eventData.category || 'other',
        color: eventData.color || '#3498db',
        reminder: eventData.reminder || 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Log event creation
      console.log(`📝 EVENT CREATED at ${new Date().toLocaleString()}`);
      console.log(`   Title: ${eventData.title}`);
      console.log(`   Start: ${eventData.startDate}`);
      console.log(`   End: ${eventData.endDate}`);
      console.log(`   Reminder: ${eventData.reminder} mins`);
      console.log(`   Event ID: ${docRef.id}`);

      // Schedule local notification for event reminder if reminder > 0
      let notificationId: string | null = null;
      if (eventData.reminder && eventData.reminder > 0) {
        // Check user's notification preferences
        const userProfile = await userServices.getUserProfile(userId);
        const preferences = userProfile?.notificationPreferences || {
          pushNotificationsEnabled: true,
          eventRemindersEnabled: true,
        };

        // Only schedule if user has notifications enabled AND event reminders enabled
        if (preferences.pushNotificationsEnabled && preferences.eventRemindersEnabled) {
          // Calculate trigger time: event start time minus reminder (in minutes)
          const eventStart = eventData.startDate instanceof Date ? eventData.startDate : new Date(eventData.startDate);
          const triggerDate = new Date(eventStart.getTime() - eventData.reminder * 60000);
          
          // Log the calculation for debugging
          console.log(`📅 Notification Scheduling Calculation:`);
          console.log(`   Current Time: ${new Date().toLocaleString()}`);
          console.log(`   Event Start: ${eventStart.toLocaleString()}`);
          console.log(`   Reminder: ${eventData.reminder} minutes`);
          console.log(`   Trigger Time: ${triggerDate.toLocaleString()}`);
          console.log(`   Time until trigger: ${Math.round((triggerDate.getTime() - new Date().getTime()) / 1000)} seconds`);
          
          notificationId = await notificationService.scheduleEventReminder(
            docRef.id,
            eventData.title,
            triggerDate
          );
        }
      }

      return {
        id: docRef.id,
        userId,
        ...eventData,
        startDate: eventData.startDate.toISOString(),
        endDate: eventData.endDate.toISOString(),
        category: eventData.category || 'other',
        color: eventData.color || '#3498db',
        reminder: eventData.reminder || 15,
        notificationId: notificationId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  /**
   * Get all events for a user
   */
  async getUserEvents(userId: string): Promise<Event[]> {
    try {
      const q = query(
        collection(db, EVENTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('startDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Event));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  /**
   * Get events within a date range
   */
  async getEventsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Event[]> {
    try {
      const q = query(
        collection(db, EVENTS_COLLECTION),
        where('userId', '==', userId),
        where('startDate', '>=', startDate.toISOString()),
        where('startDate', '<=', endDate.toISOString()),
        orderBy('startDate', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Event));
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      throw error;
    }
  },

  /**
   * Get a specific event by ID
   */
  async getEventById(eventId: string): Promise<Event | null> {
    try {
      const q = query(
        collection(db, EVENTS_COLLECTION),
        where('id', '==', eventId)
      );
      const docSnap = await getDocs(q);

      if (docSnap.empty) {
        return null;
      }

      const eventDoc = docSnap.docs[0];
      return {
        id: eventDoc.id,
        ...eventDoc.data(),
      } as Event;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  /**
   * Update an existing event
   */
  async updateEvent(eventId: string, updateData: Partial<EventCreateInput>): Promise<void> {
    try {
      const eventRef = doc(db, EVENTS_COLLECTION, eventId);
      
      // Fetch existing event to check for notification changes
      const existingDocSnap = await getDoc(eventRef);
      if (!existingDocSnap.exists()) {
        throw new Error('Event not found');
      }
      
      const existingData = existingDocSnap.data();
      const dataToUpdate: any = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      if (updateData.startDate) {
        dataToUpdate.startDate = updateData.startDate.toISOString();
      }
      if (updateData.endDate) {
        dataToUpdate.endDate = updateData.endDate.toISOString();
      }

      // Handle notification update if reminder or startDate changed
      if ((updateData.reminder !== undefined && updateData.reminder !== existingData.reminder) || 
          (updateData.startDate && updateData.startDate.toString() !== existingData.startDate)) {
        
        // Cancel old notification if it exists
        if (existingData.notificationId) {
          await notificationService.cancelNotification(existingData.notificationId);
        }

        // Check if reminder should be scheduled
        const reminder = updateData.reminder !== undefined ? updateData.reminder : existingData.reminder;
        const startDate = updateData.startDate ? updateData.startDate : new Date(existingData.startDate);

        if (reminder && reminder > 0) {
          // Check user's notification preferences
          const userProfile = await userServices.getUserProfile(existingData.userId);
          const preferences = userProfile?.notificationPreferences || {
            pushNotificationsEnabled: true,
            eventRemindersEnabled: true,
          };

          // Only schedule if user has notifications enabled AND event reminders enabled
          if (preferences.pushNotificationsEnabled && preferences.eventRemindersEnabled) {
            const startDateObj = startDate instanceof Date ? startDate : new Date(startDate);
            const triggerDate = new Date(startDateObj.getTime() - reminder * 60000);

            // Log the calculation
            const now = new Date();
            const timeUntilTrigger = Math.round((triggerDate.getTime() - now.getTime()) / 1000);
            console.log(`📅 Event Update - Notification Scheduling:`);
            console.log(`   Current Time: ${now.toLocaleString()}`);
            console.log(`   Event Start: ${startDateObj.toLocaleString()}`);
            console.log(`   Reminder: ${reminder} minutes`);
            console.log(`   Calculated Trigger: ${triggerDate.toLocaleString()}`);
            console.log(`   Time until trigger: ${timeUntilTrigger} seconds`);

            // Only reschedule if trigger date is in the future
            if (triggerDate > now) {
              const newNotificationId = await notificationService.scheduleEventReminder(
                eventId,
                updateData.title || existingData.title,
                triggerDate
              );

              if (newNotificationId) {
                dataToUpdate.notificationId = newNotificationId;
              }
            } else {
              console.warn(`⚠️ Trigger time is in the past, skipping notification scheduling`);
            }
          } else {
            // Clear notificationId if preferences don't allow notifications
            dataToUpdate.notificationId = null;
          }
        } else {
          // Clear notificationId if reminder is 0 or not set
          dataToUpdate.notificationId = null;
        }
      }

      await updateDoc(eventRef, dataToUpdate);

      // Log event update
      console.log(`✏️ EVENT UPDATED at ${new Date().toLocaleString()}`);
      console.log(`   Event ID: ${eventId}`);
      if (updateData.title) console.log(`   Title: ${updateData.title}`);
      if (updateData.startDate) console.log(`   Start: ${updateData.startDate}`);
      if (updateData.reminder !== undefined) console.log(`   Reminder: ${updateData.reminder} mins`);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));

      // Log event deletion
      console.log(`🗑️ EVENT DELETED at ${new Date().toLocaleString()}`);
      console.log(`   Event ID: ${eventId}`);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  /**
   * Get today's events
   */
  async getTodayEvents(userId: string): Promise<Event[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return this.getEventsByDateRange(userId, today, tomorrow);
    } catch (error) {
      console.error('Error fetching today events:', error);
      throw error;
    }
  },

  /**
   * Cancel all notifications for user's events
   */
  async cancelAllEventNotifications(userId: string): Promise<void> {
    try {
      const q = query(collection(db, EVENTS_COLLECTION), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      for (const eventDoc of querySnapshot.docs) {
        const event = eventDoc.data();
        if (event.notificationId) {
          // Cancel the notification
          await notificationService.cancelNotification(event.notificationId);
          // Clear the notificationId from Firestore
          await updateDoc(doc(db, EVENTS_COLLECTION, eventDoc.id), {
            notificationId: null,
          });
        }
      }
      console.log(`🔔 Cancelled all event notifications for user ${userId}`);
    } catch (error) {
      console.error('Error cancelling event notifications:', error);
    }
  },

  /**
   * Reschedule all notifications for user's events
   */
  async rescheduleAllEventNotifications(userId: string): Promise<void> {
    try {
      const q = query(collection(db, EVENTS_COLLECTION), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      for (const eventDoc of querySnapshot.docs) {
        const event = eventDoc.data();
        if (event.reminder && event.reminder > 0 && !event.notificationId) {
          const eventStart = new Date(event.startDate);
          const triggerDate = new Date(eventStart.getTime() - event.reminder * 60000);
          
          // Only reschedule if event is in the future
          if (triggerDate > new Date()) {
            const notificationId = await notificationService.scheduleEventReminder(
              eventDoc.id,
              event.title,
              triggerDate
            );
            if (notificationId) {
              await updateDoc(doc(db, EVENTS_COLLECTION, eventDoc.id), {
                notificationId,
              });
            }
          }
        }
      }
      console.log(`🔔 Rescheduled all event notifications for user ${userId}`);
    } catch (error) {
      console.error('Error rescheduling event notifications:', error);
    }
  },
};
