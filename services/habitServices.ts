import { db } from '@/firebaseConfig';
import { Habit, HabitCreateInput, HabitLog } from '@/types/event';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';

const HABITS_COLLECTION = 'habits';
const HABIT_LOGS_COLLECTION = 'habitLogs';

export const habitServices = {
  /**
   * Create a new habit
   */
  async createHabit(userId: string, habitData: HabitCreateInput): Promise<Habit> {
    try {
      const docRef = await addDoc(collection(db, HABITS_COLLECTION), {
        userId,
        title: habitData.title,
        description: habitData.description || '',
        category: habitData.category || 'other',
        frequency: habitData.frequency,
        daysOfWeek: habitData.daysOfWeek || [],
        startDate: habitData.startDate.toISOString(),
        endDate: habitData.endDate ? habitData.endDate.toISOString() : null,
        color: habitData.color || '#2ecc71',
        reminder: habitData.reminder || 30,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        id: docRef.id,
        userId,
        title: habitData.title,
        description: habitData.description || '',
        category: habitData.category || 'other',
        frequency: habitData.frequency,
        daysOfWeek: habitData.daysOfWeek || [],
        startDate: habitData.startDate.toISOString(),
        endDate: habitData.endDate ? habitData.endDate.toISOString() : undefined,
        color: habitData.color || '#2ecc71',
        reminder: habitData.reminder || 30,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  },

  /**
   * Get all habits for a user
   */
  async getUserHabits(userId: string, activeOnly: boolean = true): Promise<Habit[]> {
    try {
      let q;
      if (activeOnly) {
        q = query(
          collection(db, HABITS_COLLECTION),
          where('userId', '==', userId),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, HABITS_COLLECTION),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Habit));
    } catch (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }
  },

  /**
   * Get a specific habit by ID
   */
  async getHabitById(habitId: string): Promise<Habit | null> {
    try {
      const q = query(
        collection(db, HABITS_COLLECTION),
        where('id', '==', habitId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Habit;
    } catch (error) {
      console.error('Error fetching habit:', error);
      throw error;
    }
  },

  /**
   * Update a habit
   */
  async updateHabit(habitId: string, updateData: Partial<HabitCreateInput>): Promise<void> {
    try {
      const habitRef = doc(db, HABITS_COLLECTION, habitId);
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

      await updateDoc(habitRef, dataToUpdate);
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  },

  /**
   * Toggle habit active status
   */
  async toggleHabit(habitId: string, isActive: boolean): Promise<void> {
    try {
      const habitRef = doc(db, HABITS_COLLECTION, habitId);
      await updateDoc(habitRef, {
        isActive,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error toggling habit:', error);
      throw error;
    }
  },

  /**
   * Delete a habit
   */
  async deleteHabit(habitId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, HABITS_COLLECTION, habitId));
      // Also delete associated logs
      const logsQ = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('habitId', '==', habitId)
      );
      const logsSnapshot = await getDocs(logsQ);
      logsSnapshot.docs.forEach((logDoc) => {
        deleteDoc(logDoc.ref);
      });
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  /**
   * Log a habit completion
   */
  async logHabitCompletion(
    habitId: string,
    userId: string,
    notes?: string
  ): Promise<HabitLog> {
    try {
      const docRef = await addDoc(collection(db, HABIT_LOGS_COLLECTION), {
        habitId,
        userId,
        completedAt: new Date().toISOString(),
        notes: notes || '',
      });

      return {
        id: docRef.id,
        habitId,
        userId,
        completedAt: new Date().toISOString(),
        notes,
      };
    } catch (error) {
      console.error('Error logging habit completion:', error);
      throw error;
    }
  },

  /**
   * Get habit logs for a specific habit
   */
  async getHabitLogs(habitId: string, limit: number = 30): Promise<HabitLog[]> {
    try {
      const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('habitId', '==', habitId),
        orderBy('completedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as HabitLog));
    } catch (error) {
      console.error('Error fetching habit logs:', error);
      throw error;
    }
  },

  /**
   * Get habit logs for a date range
   */
  async getHabitLogsByDateRange(
    habitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<HabitLog[]> {
    try {
      const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('habitId', '==', habitId),
        where('completedAt', '>=', startDate.toISOString()),
        where('completedAt', '<=', endDate.toISOString()),
        orderBy('completedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as HabitLog));
    } catch (error) {
      console.error('Error fetching habit logs by date range:', error);
      throw error;
    }
  },

  /**
   * Get today's habit logs
   */
  async getTodayHabitLogs(habitId: string): Promise<HabitLog[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return this.getHabitLogsByDateRange(habitId, today, tomorrow);
    } catch (error) {
      console.error('Error fetching today habit logs:', error);
      throw error;
    }
  },
};
