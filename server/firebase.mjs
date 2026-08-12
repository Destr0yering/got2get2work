import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";

function app() {
  return getApps()[0] ?? initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
  });
}

export function createFirebaseServices() {
  const firebaseApp = app();
  return {
    auth: getAuth(firebaseApp),
    db: getFirestore(firebaseApp),
    deleteField: FieldValue.delete(),
    serverTimestamp: FieldValue.serverTimestamp(),
    timestampFromDate: (date) => Timestamp.fromDate(date),
  };
}
