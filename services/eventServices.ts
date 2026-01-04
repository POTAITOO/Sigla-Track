import { db } from '@/firebaseConfig';
import { Event, EventCreateInput } from '@/types/event';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
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

      return {
        id: docRef.id,
        userId,
        ...eventData,
        startDate: eventData.startDate.toISOString(),
        endDate: eventData.endDate.toISOString(),
        category: eventData.category || 'other',
        color: eventData.color || '#3498db',
        reminder: eventData.reminder || 15,
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

      await updateDoc(eventRef, dataToUpdate);
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
};
