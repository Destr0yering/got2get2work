import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import type { ApiConfig } from "./config";
import { FirestoreAgreementStore } from "./modules/agreement/firestore-store";
import { AgreementService } from "./modules/agreement/service";
import { FirestoreMembershipStore } from "./modules/membership/firestore-store";
import { MembershipService } from "./modules/membership/service";

function firebaseApp(projectId: string | null) {
  return getApps()[0] ?? initializeApp({
    credential: applicationDefault(),
    ...(projectId ? { projectId } : {}),
  });
}

export function createProductionDependencies(config: ApiConfig) {
  if (!config.referralCodePepper) {
    throw new Error("REFERRAL_CODE_PEPPER is required to enable membership routes.");
  }
  const app = firebaseApp(config.firebase.projectId);
  const verifier = getAuth(app);
  const db = getFirestore(app);
  const membershipService = new MembershipService({
    store: new FirestoreMembershipStore(db),
    referralPepper: config.referralCodePepper,
  });
  const agreementService = new AgreementService({ store: new FirestoreAgreementStore(db) });
  return {
    membership: { verifier, service: membershipService },
    agreement: { verifier, memberships: membershipService, agreements: agreementService },
  };
}
