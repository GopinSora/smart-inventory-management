import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics';

// Reads from Vite env first (production-safe), falls back to inlined defaults.
// To override in production, set these in Vercel → Project → Settings → Environment Variables.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBn-O5ARLgJpGyJJGz9aseuBYOxdUOUcvs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'smartinventory-dd77d.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'smartinventory-dd77d',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'smartinventory-dd77d.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '844777393730',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:844777393730:web:76da0df9f2ab71d5e1e7db',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-0Z0VCCTYSM',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics is browser-only and may be unsupported in some contexts (SSR, in-app webviews).
export let analytics = null;
if (typeof window !== 'undefined') {
  analyticsSupported()
    .then((ok) => {
      if (ok) analytics = getAnalytics(app);
    })
    .catch(() => {
      /* analytics unsupported — silently ignore */
    });
}
