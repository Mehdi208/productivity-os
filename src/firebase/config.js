import { initializeApp, getApps } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  getFirestore 
} from "firebase/firestore";

// Real Firebase configuration for Productivity OS
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDkT28UlvSOeh4pJcHw0VHROzaROEiKlgE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "productivity-os-ea816.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "productivity-os-ea816",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "productivity-os-ea816.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "316643338276",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:316643338276:web:3113cde04344b2312e50b1"
};

let db = null;
try {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  try {
    // Enable Multi-Tab Persistent IndexedDB Cache to keep app alive 24/7 even after long inactivity or network sleep
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (cacheErr) {
    db = getFirestore(app);
  }
} catch (err) {
  console.info("Firebase offline/fallback mode active:", err);
}

export { db };
export default db;