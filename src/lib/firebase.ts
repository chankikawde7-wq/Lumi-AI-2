import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, disableNetwork } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC5m8-UaQKSyTa6r9JmXxVb-wZZDhrcBmo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "clipai-e420b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "clipai-e420b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "clipai-e420b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "771147772935",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:771147772935:web:c4eaa28b5e5f8f744c66a2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-64EQ44NFQ6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Disable network if using dummy project ID to prevent console errors
if (!import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID === "clipai-e420b") {
  disableNetwork(db).catch(console.error);
}

let analytics: any = null;
isAnalyticsSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, auth, db, analytics };
