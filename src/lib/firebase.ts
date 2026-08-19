import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Web app's Firebase configuration with env variables support and fallback
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDkV1k2siQ0GWd6imPNs3QQzb_ZcKqvNNY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cartnova-store.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cartnova-store",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cartnova-store.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "626226304600",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:626226304600:web:b8cb22af6e898cea3e1c2d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RKE9MN77H7"
};

// Initialize Firebase safely without duplicate initialization
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export { app };
