
import { db } from '@/firebaseConfig';
import { doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

export const userServices = {
  /**
   * Create a user document with all required fields
   */
  async createUserProfile(user: { uid: string; email: string; name?: string }) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        name: user.name || '',
        points: 0,
        createdAt: Timestamp.now(),
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
      await updateDoc(userRef, { points: currentPoints + points });
    } else {
      await setDoc(userRef, { points });
    }
  },
};
