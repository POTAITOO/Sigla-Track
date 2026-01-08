import { db } from '@/firebaseConfig';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

/**
 * Migration script to sum up all past completions for a user and update their points in Firestore.
 * Usage: Call migrateUserPointsForUser(userId) for each user.
 */
export async function migrateUserPointsForUser(userId: string) {
  // Get all habits for the user
  const habitsQ = query(collection(db, 'habits'), where('userId', '==', userId));
  const habitsSnap = await getDocs(habitsQ);
  let totalPoints = 0;

  for (const habitDoc of habitsSnap.docs) {
    const habitId = habitDoc.id;
    // Get all logs for this habit
    const logsQ = query(collection(db, 'habitLogs'), where('habitId', '==', habitId), where('userId', '==', userId));
    const logsSnap = await getDocs(logsQ);
    // Sort logs by date ascending
    const logs = logsSnap.docs.map(doc => doc.data()).sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
    let streak = 0;
    let lastDate: Date | null = null;
    for (const log of logs) {
      const logDate = new Date(log.completedAt);
      logDate.setHours(0, 0, 0, 0);
      if (lastDate) {
        const diff = (logDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          streak++;
        } else if (diff > 1) {
          streak = 1;
        }
      } else {
        streak = 1;
      }
      lastDate = logDate;
      let streakMultiplier = 1;
      if (streak >= 7) streakMultiplier = 2;
      else if (streak >= 3) streakMultiplier = 1.5;
      totalPoints += 10 * streakMultiplier;
    }
  }
  // Update user document
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { points: Math.round(totalPoints) });
  return totalPoints;
}

/**
 * Example usage for all users:
 * (async () => {
 *   const usersSnap = await getDocs(collection(db, 'users'));
 *   for (const userDoc of usersSnap.docs) {
 *     await migrateUserPointsForUser(userDoc.id);
 *   }
 * })();
 */
