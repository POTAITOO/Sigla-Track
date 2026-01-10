// File to create: services/expoPushTokenService.ts
import { db } from '@/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

export const expoPushTokenService = {
  async registerForPushNotifications(userId: string) {
    try {
      // Check if FCM is supported in this environment
      const supported = await isSupported();
      if (!supported) {
        console.log('FCM not supported in this environment');
        return null;
      }

      // Get FCM instance
      const messaging = getMessaging();
      
      // Request permission and get token
      const token = await getToken(messaging, {
        vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (!token) {
        console.log('Failed to get FCM token');
        return null;
      }

      console.log('FCM token registered:', token);

      // Store token in user's Firestore document
      await updateDoc(doc(db, 'users', userId), {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date().toISOString(),
      });

      console.log('FCM token saved to Firestore');
      return token;
    } catch (error) {
      console.error('Error registering for FCM:', error);
      return null;
    }
  },
};