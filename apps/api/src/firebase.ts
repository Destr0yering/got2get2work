import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import type { ApiConfig } from "./config";
import { FirestoreMembershipStore } from "./modules/membership/firestore-store";
import { MembershipService } from "./modules/membership/service";

function firebaseApp(projectId: string | null) {
  return getApps()[0] ?? initializeApp({
    credential: applicationDefault(),
    ...(projectId ? { projectId } : {}),
  });
}

export function createMembershipDependencies(config: ApiConfig) {
  if (!config.referralCodePepper) {
    throw new Error("REFERRAL_CODE_PEPPER is required to enable membership routes.");
  }
  const app = firebaseApp(config.firebase.projectId);
  const verifier = getAuth(app);
  const store = new FirestoreMembershipStore(getFirestore(app));
  const service = new MembershipService({ store, referralPepper: config.referralCodePepper });
  return { verifier, service };
}
