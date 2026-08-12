import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

let config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured() {
  return Object.values(config).every(Boolean);
}

export async function loadFirebaseConfig() {
  if (isFirebaseConfigured()) return true;
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");
  const response = await fetch(`${baseUrl || ""}/api/config`);
  if (!response.ok) return false;
  const remote = await response.json();
  config = {
    apiKey: remote.firebase?.apiKey,
    authDomain: remote.firebase?.authDomain,
    projectId: remote.firebase?.projectId,
    appId: remote.firebase?.appId,
  };
  return isFirebaseConfigured();
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function firebaseAuth() {
  if (!isFirebaseConfigured()) throw new Error("Firebase sign-in is not configured for this release.");
  app ??= getApps().length ? getApp() : initializeApp(config);
  auth ??= getAuth(app);
  return auth;
}
