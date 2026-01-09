import { db } from '@/firebaseConfig';
import { Habit, HabitCreateInput, HabitLog } from '@/types/event';
import { HabitWithStatus } from '@/types/habitAnalytics';
import { getAuth } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore';

/**
 * Utility to wrap errors with context for UI feedback and debugging
 */
class HabitServiceError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'HabitServiceError';
    if (originalError) {
      this.stack = originalError.stack || this.stack;
    }
  }
}

const HABITS_COLLECTION = 'habits';
const HABIT_LOGS_COLLECTION = 'habitLogs';

export const habitServices = {
    /**
     * Get the current authenticated user's UID
     */
    getCurrentUserId(): string {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      return user.uid;
    },
  /**
   * Create a new habit
   */
  async createHabit(userId: string, habitData: HabitCreateInput): Promise<Habit> {
    try {
      // Prevent duplicate habits: check for existing ACTIVE habit with same title and category
      const dupQ = query(
        collection(db, HABITS_COLLECTION),
        where('userId', '==', userId),
        where('title', '==', habitData.title.trim()),
        where('category', '==', habitData.category || 'other'),
        where('isActive', '==', true)
      );
      const dupSnap = await getDocs(dupQ);
      if (!dupSnap.empty) {
        throw new Error('A habit with this name and category already exists. Please use a different name or category.');
      }

      const docRef = await addDoc(collection(db, HABITS_COLLECTION), {
        userId,
        title: habitData.title.trim(),
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
        title: habitData.title.trim(),
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
      // User-centric error message for habit creation
      let msg = 'Could not create habit. Please check your input and try again.';
      if (error instanceof Error && error.message.includes('already exists')) {
        msg = 'A habit with this name and category already exists.';
      }
      throw new HabitServiceError(msg, error);
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
      throw new HabitServiceError('Could not fetch your habits. Please check your connection and try again.', error);
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
      throw new HabitServiceError('Could not find the requested habit. Please try again.', error);
    }
  },

  /**
   * Update a habit
   */
  async updateHabit(habitId: string, updateData: Partial<HabitCreateInput>): Promise<boolean> {
    try {
      const habitRef = doc(db, HABITS_COLLECTION, habitId);
      
      // Fetch the existing document to preserve fields like userId for security rules
      const existingDocSnap = await getDoc(habitRef);
      
      if (!existingDocSnap.exists()) {
        throw new Error('Habit not found');
      }
      
      const existingData = existingDocSnap.data();
      
      // Build update data, filtering out undefined values
      const dataToUpdate: any = {};
      let hasChanges = false;

      // Only include fields that are defined and have actually changed
      if (updateData.title !== undefined && updateData.title !== existingData.title) {
        dataToUpdate.title = updateData.title;
        hasChanges = true;
      }
      if (updateData.description !== undefined && updateData.description !== existingData.description) {
        dataToUpdate.description = updateData.description;
        hasChanges = true;
      }
      if (updateData.category !== undefined && updateData.category !== existingData.category) {
        dataToUpdate.category = updateData.category;
        hasChanges = true;
      }
      if (updateData.frequency !== undefined && updateData.frequency !== existingData.frequency) {
        dataToUpdate.frequency = updateData.frequency;
        hasChanges = true;
      }
      if (updateData.daysOfWeek !== undefined && JSON.stringify(updateData.daysOfWeek) !== JSON.stringify(existingData.daysOfWeek)) {
        dataToUpdate.daysOfWeek = updateData.daysOfWeek;
        hasChanges = true;
      }
      if (updateData.color !== undefined && updateData.color !== existingData.color) {
        dataToUpdate.color = updateData.color;
        hasChanges = true;
      }
      if (updateData.reminder !== undefined && updateData.reminder !== existingData.reminder) {
        dataToUpdate.reminder = updateData.reminder;
        hasChanges = true;
      }

      if (updateData.startDate) {
        const newStartDate = updateData.startDate.toISOString();
        if (newStartDate !== existingData.startDate) {
          dataToUpdate.startDate = newStartDate;
          hasChanges = true;
        }
      }
      if (updateData.endDate) {
        const newEndDate = updateData.endDate.toISOString();
        if (newEndDate !== existingData.endDate) {
          dataToUpdate.endDate = newEndDate;
          hasChanges = true;
        }
      }

      // If no changes, return false to indicate no update was made
      if (!hasChanges) {
        return false;
      }

      // Add updatedAt only if there are actual changes
      dataToUpdate.updatedAt = new Date().toISOString();
      
      // Ensure userId is preserved for security rule validation
      if (existingData.userId && !dataToUpdate.userId) {
        dataToUpdate.userId = existingData.userId;
      }

      await updateDoc(habitRef, dataToUpdate);
      return true; // Return true to indicate update was successful
    } catch (error) {
      throw new HabitServiceError('Could not update habit. Please check your input and try again.', error);
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
      throw new HabitServiceError('Could not change habit status. Please try again.', error);
    }
  },

  /**
   * Delete a habit (soft delete - marks as inactive)
   */
  async deleteHabit(habitId: string): Promise<void> {
    try {
      const habitRef = doc(db, HABITS_COLLECTION, habitId);
      
      // Soft delete: Mark as inactive instead of actually deleting
      // Firebase rules allow write when authenticated user matches userId
      await updateDoc(habitRef, {
        isActive: false,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Note: We keep the logs for data integrity
      // They won't appear in queries since we filter by isActive: true
    } catch (error) {
      console.error('Delete habit service error:', error);
      throw new HabitServiceError('Could not delete habit. Please try again.', error);
    }
  },

  /**
   * Log a habit completion
   */
  async logHabitCompletion(
    habitId: string,
    userId: string,
    notes?: string,
    points: number = 10
  ): Promise<HabitLog> {
    try {
      // Safeguard: Only allow one log per habit per user per day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Simplified query - check only habitId and userId, then filter by date in code
      const logsQ = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('habitId', '==', habitId),
        where('userId', '==', userId)
      );
      const logsSnapshot = await getDocs(logsQ);
      
      // Filter today's logs in code to avoid needing composite index
      const todayLogs = logsSnapshot.docs.filter((doc) => {
        const completedAt = new Date(doc.data().completedAt);
        return completedAt >= today && completedAt < tomorrow;
      });
      
      if (todayLogs.length > 0) {
        // Already logged today, do not add duplicate log or points
        throw new Error('Already logged today');
      }

      const docRef = await addDoc(collection(db, HABIT_LOGS_COLLECTION), {
        habitId,
        userId,
        completedAt: new Date().toISOString(),
        notes: notes || '',
      });

      // Increment user points in Firestore
      const { userServices } = await import('./userServices');
      await userServices.addUserPoints(userId, points);

      return {
        id: docRef.id,
        habitId,
        userId,
        completedAt: new Date().toISOString(),
        notes,
      };
    } catch (error) {
      let msg = 'Unable to complete habit. Please try again.';
      if (error instanceof Error && error.message.includes('Already logged today')) {
        msg = 'You have already completed this habit today.';
      }
      throw new HabitServiceError(msg, error);
    }
  },

  /**
   * Get habit logs for a specific habit
   */
  async getHabitLogs(habitId: string, limit: number = 30): Promise<HabitLog[]> {
    try {
      // Require userId for permission filtering
      const userId = habitServices.getCurrentUserId();
      const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('habitId', '==', habitId),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as HabitLog));
    } catch (error) {
      throw new HabitServiceError('Could not fetch habit logs. Please check your connection and try again.', error);
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
      const userId = habitServices.getCurrentUserId();
      const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('habitId', '==', habitId),
        where('userId', '==', userId),
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
      throw new HabitServiceError('Could not fetch habit logs for the selected date range.', error);
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
      throw new HabitServiceError('Could not fetch today\'s habit logs. Please try again.', error);
    }
  },

  /**
   * Gets all active habits for a user and enriches them with analytics
   * like completion status, streaks, and points.
   */
  async getHabitsWithStatus(userId: string): Promise<HabitWithStatus[]> {
    try {
      const habits = await this.getUserHabits(userId, true);
      const habitsWithStatus: HabitWithStatus[] = [];

      // Helper to check if a habit is due on a specific date
      const isHabitDueOn = (habit: Habit, date: Date): boolean => {
        const startDate = new Date(habit.startDate);
        startDate.setHours(0, 0, 0, 0);

        if (startDate > date) {
          return false;
        }

        if (habit.endDate) {
          const endDate = new Date(habit.endDate);
          endDate.setHours(0, 0, 0, 0);
          if (endDate < date) {
            return false;
          }
        }

        const dayOfWeek = (date.getDay() + 6) % 7; // 0=Mon, ..., 6=Sun

        switch (habit.frequency) {
          case 'daily':
            return true;
          case 'weekly':
            return habit.daysOfWeek?.includes(dayOfWeek) ?? false;
          case 'monthly':
            return date.getDate() === startDate.getDate();
          default:
            return false;
        }
      };

      for (const habit of habits) {
        const logs = await this.getHabitLogs(habit.id);
        const logDates = logs.map(log => {
          const d = new Date(log.completedAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        });
        const uniqueLogDates = [...new Set(logDates)];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const completedToday = uniqueLogDates.includes(today.getTime());
        const isDue = isHabitDueOn(habit, today);

        let currentStreak = 0;
        let longestStreak = 0;
        
        if (uniqueLogDates.length > 0) {
          const sortedDates = uniqueLogDates.sort((a, b) => b - a);
          
          // Check if the most recent log is today or yesterday to start the streak
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          
          if (sortedDates[0] === today.getTime() || sortedDates[0] === yesterday.getTime()) {
            let tempStreak = 1;
            let lastDate = new Date(sortedDates[0]);

            for (let i = 1; i < sortedDates.length; i++) {
              const currentDate = new Date(sortedDates[i]);
              const expectedPreviousDate = new Date(lastDate);
              expectedPreviousDate.setDate(lastDate.getDate() - 1);

              if (currentDate.getTime() === expectedPreviousDate.getTime()) {
                tempStreak++;
              } else {
                if (tempStreak > longestStreak) {
                  longestStreak = tempStreak;
                }
                tempStreak = 1; // Reset for a new potential streak
              }
              lastDate = currentDate;
            }
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
            }
            currentStreak = tempStreak; // The current streak is the last one calculated
          }
        }

        // Calculate weekly completion stats based on calendar week (Monday-Sunday)
        let opportunitiesThisWeek = 0;
        
        // Get the start of the current week (Monday)
        const startOfWeek = new Date(today);
        const dayOfWeek = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        // Count opportunities for all 7 days of the week based on frequency, 
        // but only up to today (don't count future days)
        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          
          // Stop at today or beyond
          if (day > today) break;
          
          // Count opportunity if the day matches the habit's frequency
          // (ignoring the habit's startDate for weekly calculations)
          const dayOfWeekNum = (day.getDay() + 6) % 7; // 0=Mon, ..., 6=Sun
          
          if (habit.frequency === 'daily') {
            opportunitiesThisWeek++;
          } else if (habit.frequency === 'weekly' && habit.daysOfWeek?.includes(dayOfWeekNum)) {
            opportunitiesThisWeek++;
          } else if (habit.frequency === 'monthly' && day.getDate() === new Date(habit.startDate).getDate()) {
            opportunitiesThisWeek++;
          }
        }
        
        // Count completions from the start of this week until today
        const completionsThisWeek = uniqueLogDates.filter(d => {
          const logDate = new Date(d);
          return logDate >= startOfWeek && logDate <= today;
        }).length;

        habitsWithStatus.push({
          ...habit,
          isDueToday: isDue,
          completedToday,
          streak: currentStreak,
          longestStreak,
          points: uniqueLogDates.length * 10,
          completionsLast7Days: completionsThisWeek,
          opportunitiesLast7Days: opportunitiesThisWeek,
        });
      }

      return habitsWithStatus.sort((a, b) => (a.completedToday ? 1 : -1) - (b.completedToday ? 1 : -1) || a.title.localeCompare(b.title));
    } catch (error) {
      throw new HabitServiceError('Could not calculate habit analytics.', error);
    }
  },
};
