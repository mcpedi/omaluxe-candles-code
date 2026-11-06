import { getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0
);

let auth: Auth | null = null;
if (isFirebaseConfigured) {
  const app =
    getApps().find((existing) => existing.name === "omaluxe-client") ??
    initializeApp(firebaseConfig, "omaluxe-client");
  auth = getAuth(app);
}

export const firebaseAuth = auth;
export const firebasePersistenceReady = firebaseAuth
  ? setPersistence(firebaseAuth, browserLocalPersistence).catch((error: unknown) => {
      console.warn("[Firebase] Browser persistence could not be enabled", error);
    })
  : Promise.resolve();
