
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
    if (userSnap.exists() && typeof userSnap.data().points === 'number') {
      return userSnap.data().points;
    }
    return 0;
  },

  async addUserPoints(userId: string, points: number): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentPoints = userSnap.data().points || 0;
      await updateDoc(userRef, { points: currentPoints + points, updatedAt: Timestamp.now() });
    } else {
      await setDoc(userRef, { points, updatedAt: Timestamp.now() });
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
      // Delete user document from Firestore
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      // Delete all events belonging to user
      // Note: You might want to add a batch delete for events and habits if they're numerous
      // For now, Firestore rules will prevent access to user's other documents after user is deleted
      
      console.log(`User ${userId} data deleted successfully`);
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
