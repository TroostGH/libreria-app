// Firebase setup.
//
// The config is filled in via env vars (see .env.local) so the same code
// works locally and in production. If env vars are missing the app falls
// back to a local-only mode that reads from src/data/books.json.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FB_API_KEY,
  authDomain: env.VITE_FB_AUTH_DOMAIN,
  projectId: env.VITE_FB_PROJECT_ID,
  storageBucket: env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FB_SENDER_ID,
  appId: env.VITE_FB_APP_ID,
};

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app = null;
let db = null;

if (hasFirebaseConfig) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { app, db };
