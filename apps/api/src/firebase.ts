import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import type { ApiConfig } from "./config";
import { FirestoreAgreementStore } from "./modules/agreement/firestore-store";
import { AgreementService } from "./modules/agreement/service";
import { FirestoreCommuteStore } from "./modules/commute/firestore-store";
import { CommuteService } from "./modules/commute/service";
import { FirestoreMembershipStore } from "./modules/membership/firestore-store";
import { MembershipService } from "./modules/membership/service";
import { FirestoreMatchingStore } from "./modules/matching/firestore-store";
import { MatchingService } from "./modules/matching/service";
import { FirestoreRideStore } from "./modules/ride/firestore-store";
import { RideService } from "./modules/ride/service";
import { FirestoreVehicleStore } from "./modules/vehicle/firestore-store";
import { VehicleService } from "./modules/vehicle/service";
import { PlateVault } from "./modules/vehicle/vault";

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
  if (!config.vehicleVaultKey) throw new Error("VEHICLE_VAULT_KEY is required to enable vehicle routes.");
  const app = firebaseApp(config.firebase.projectId);
  const verifier = getAuth(app);
  const db = getFirestore(app);
  const membershipStore = new FirestoreMembershipStore(db);
  const commuteStore = new FirestoreCommuteStore(db);
  const vehicleStore = new FirestoreVehicleStore(db);
  const membershipService = new MembershipService({
    store: membershipStore,
    referralPepper: config.referralCodePepper,
  });
  const agreementService = new AgreementService({ store: new FirestoreAgreementStore(db) });
  const commuteService = new CommuteService(commuteStore);
  const vehicleService = new VehicleService(vehicleStore, new PlateVault(config.vehicleVaultKey));
  const matchingStore = new FirestoreMatchingStore(db);
  const matchingService = new MatchingService({ matches: matchingStore, memberships: membershipStore, commutes: commuteStore, vehicles: vehicleStore, agreements: agreementService });
  const rideService = new RideService(new FirestoreRideStore(db), matchingStore, commuteStore, vehicleStore);
  return {
    membership: { verifier, service: membershipService },
    agreement: { verifier, memberships: membershipService, agreements: agreementService },
    commute: { verifier, memberships: membershipService, commutes: commuteService },
    vehicle: { verifier, memberships: membershipService, vehicles: vehicleService },
    matching: { verifier, memberships: membershipService, matching: matchingService },
    ride: { verifier, memberships: membershipService, rides: rideService },
  };
}
