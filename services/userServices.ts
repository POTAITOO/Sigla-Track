
import { db } from '@/firebaseConfig';
import { deleteDoc, doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

export const userServices = {
  /**
   * Create a user document with all required fields
   */
  async createUserProfile(user: { uid: string; email: string; name?: string; bio?: string }) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        name: user.name || '',
        bio: user.bio || '',
        points: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  },
  async getUserPoints(userId: string): Promise<number> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const points = data.points || 0;
      
      // If user document exists but doesn't have points field, initialize it
      if (data.points === undefined) {
        await updateDoc(userRef, { points: 0 });
      }
      
      return typeof points === 'number' ? points : 0;
    }
    return 0;
  },

  async addUserPoints(userId: string, points: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentPoints = userSnap.data().points || 0;
        await updateDoc(userRef, { 
          points: currentPoints + points, 
          updatedAt: Timestamp.now() 
        });
      } else {
        // User document doesn't exist yet, create it with points
        await setDoc(userRef, { 
          points,
          updatedAt: Timestamp.now() 
        });
      }
    } catch (error) {
      console.error('Error adding user points:', error);
      throw new Error('Failed to add points. Please try again.');
    }
  },

  /**
   * Initialize or ensure user has points field (migration for existing users)
   */
  async ensureUserHasPoints(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        // If points field is missing, add it
        if (data.points === undefined) {
          await updateDoc(userRef, { points: 0 });
          console.log(`Initialized points for user ${userId}`);
        }
      } else {
        // Create user document if it doesn't exist
        await setDoc(userRef, { points: 0, updatedAt: Timestamp.now() });
        console.log(`Created user document with points for user ${userId}`);
      }
    } catch (error) {
      console.error('Error ensuring user has points:', error);
    }
  },

  /**
   * Update user profile information
   */
  async updateUserProfile(userId: string, updates: { bio?: string; name?: string }): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<any> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  },

  /**
   * Delete user account and all related data
   */
  async deleteUserAccount(userId: string): Promise<void> {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');

      // Delete all habits belonging to user
      const habitsQ = query(collection(db, 'habits'), where('userId', '==', userId));
      const habitsSnap = await getDocs(habitsQ);
      for (const habitDoc of habitsSnap.docs) {
        await deleteDoc(doc(db, 'habits', habitDoc.id));
      }

      // Delete all habit logs belonging to user
      const logsQ = query(collection(db, 'habitLogs'), where('userId', '==', userId));
      const logsSnap = await getDocs(logsQ);
      for (const logDoc of logsSnap.docs) {
        await deleteDoc(doc(db, 'habitLogs', logDoc.id));
      }

      // Delete all events belonging to user
      const eventsQ = query(collection(db, 'events'), where('userId', '==', userId));
      const eventsSnap = await getDocs(eventsQ);
      for (const eventDoc of eventsSnap.docs) {
        await deleteDoc(doc(db, 'events', eventDoc.id));
      }

      // Delete user profile document
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      console.log(`User ${userId} and all related data deleted successfully`);
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error('Failed to delete user data');
    }
  },

  /**
   * Migrate current user to add missing bio field
   */
  async migrateUsersSchema(userId?: string): Promise<{ updated: boolean; error?: string }> {
    try {
      if (!userId) {
        console.log('No userId provided for migration - skipping');
        return { updated: false };
      }

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log('User document does not exist');
        return { updated: false };
      }

      const userData = userSnap.data();
      const needsUpdate = !userData.bio;

      if (needsUpdate) {
        await updateDoc(userRef, {
          bio: userData.bio || '',
          updatedAt: Timestamp.now(),
        });
        console.log(`Migration complete for user ${userId}`);
        return { updated: true };
      } else {
        console.log(`User ${userId} already has all required fields`);
        return { updated: false };
      }
    } catch (error) {
      console.error('Migration error:', error);
      return { updated: false, error: 'Failed to migrate user' };
    }
  },
};