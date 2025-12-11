// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
// Get these values from google-services.json or Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCxBq1ze1StiC6agr7vfZ2INfWGBqD_k7M",
  authDomain: "sigla-track.firebaseapp.com",
  projectId: "sigla-track",
  storageBucket: "sigla-track.firebasestorage.app",
  messagingSenderId: "107999349192",
  appId: "1:107999349192:android:041065a24043ea8fbd98fd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
// Rename this file to: c:\Users\Brenan\Sigla-Track\firebaseConfig.js
