import assert from "node:assert/strict";
import test from "node:test";

import { buildApi } from "../src/app";
import type { ApiConfig } from "../src/config";
import { MemoryAgreementStore } from "../src/modules/agreement/memory-store";
import { AgreementService } from "../src/modules/agreement/service";
import { MemoryMembershipStore } from "../src/modules/membership/memory-store";
import type { FirebaseTokenVerifier } from "../src/modules/membership/ports";
import { MembershipService } from "../src/modules/membership/service";

const now = new Date("2026-08-12T14:00:00.000Z");
const config: ApiConfig = {
  environment: "test", host: "127.0.0.1", port: 4100, release: "agreement-test",
  exposeDocumentation: false, referralCodePepper: "test-referral-pepper-value",
  firebase: { apiKey: null, authDomain: null, projectId: "test", appId: null },
};

async function fixture() {
  const membershipStore = new MemoryMembershipStore();
  membershipStore.memberships.set("worker", {
    id: "worker", uid: "worker", email: "worker@example.test", tenantId: "tenant-a", worksiteId: "site-a",
    role: "worker", status: "active", referralCodeId: "bootstrap", submittedAt: now,
  });
  const memberships = new MembershipService({ store: membershipStore, referralPepper: config.referralCodePepper!, now: () => now });
  const agreementStore = new MemoryAgreementStore();
  for (const kind of ["terms", "privacy", "captain"] as const) {
    await agreementStore.putAgreement({
      id: `${kind}-2026-08`, kind, version: "2026-08", title: `${kind} agreement`,
      documentUrl: `https://got2get2work.com/${kind}`, effectiveAt: new Date("2026-08-01T00:00:00.000Z"),
      retiredAt: null, required: true,
    });
  }
  const agreements = new AgreementService({ store: agreementStore, now: () => now });
  const verifier: FirebaseTokenVerifier = {
    verifyIdToken: async () => ({ uid: "worker", email: "worker@example.test", email_verified: true }),
  };
  const app = await buildApi({
    config, logger: false,
    membership: { verifier, service: memberships },
    agreement: { verifier, memberships, agreements },
  });
  return { app, agreementStore };
}

test("captain remains ineligible until current agreements and attestations exist", async () => {
  const { app } = await fixture();
  try {
    const initial = await app.inject({ method: "GET", url: "/v1/captain/eligibility", headers: { authorization: "Bearer token" } });
    assert.equal(initial.statusCode, 200);
    assert.equal(initial.json().eligible, false);
    assert.deepEqual(initial.json().missingAgreementKinds.sort(), ["captain", "privacy", "terms"]);
    assert.equal(initial.json().attestationCurrent, false);

    for (const kind of ["terms", "privacy", "captain"]) {
      const accepted = await app.inject({
        method: "POST", url: `/v1/agreements/${kind}-2026-08/accept`,
        headers: { authorization: "Bearer token", "x-app-version": "0.1.0" }, payload: { acknowledged: true },
      });
      assert.equal(accepted.statusCode, 201);
    }

    const attested = await app.inject({
      method: "PUT", url: "/v1/captain/attestation", headers: { authorization: "Bearer token" },
      payload: {
        licenseValidThrough: "2027-08-12", registrationValidThrough: "2027-08-12", insuranceValidThrough: "2027-08-12",
        vehicleSafe: true, conductAcknowledged: true, noImpairmentAcknowledged: true, informationAccurate: true,
      },
    });
    assert.equal(attested.statusCode, 200);
    assert.equal(attested.json().eligible, true);
  } finally { await app.close(); }
});

test("acceptance is append-only evidence and duplicate acceptance is idempotent", async () => {
  const { app, agreementStore } = await fixture();
  try {
    const request = () => app.inject({
      method: "POST", url: "/v1/agreements/terms-2026-08/accept",
      headers: { authorization: "Bearer token", "user-agent": "test-agent" }, payload: { acknowledged: true },
    });
    const first = await request();
    const second = await request();
    assert.equal(first.statusCode, 201);
    assert.equal(second.statusCode, 201);
    assert.equal(first.json().id, second.json().id);
    assert.equal(agreementStore.acceptances.length, 1);
    assert.equal(agreementStore.acceptances[0]?.userAgent, "test-agent");
  } finally { await app.close(); }
});

test("new captain version invalidates captain eligibility until reaccepted", async () => {
  const { app, agreementStore } = await fixture();
  try {
    for (const kind of ["terms", "privacy", "captain"]) {
      await app.inject({ method: "POST", url: `/v1/agreements/${kind}-2026-08/accept`, headers: { authorization: "Bearer token" }, payload: { acknowledged: true } });
    }
    await app.inject({
      method: "PUT", url: "/v1/captain/attestation", headers: { authorization: "Bearer token" },
      payload: { licenseValidThrough: "2027-01-01", registrationValidThrough: "2027-01-01", insuranceValidThrough: "2027-01-01", vehicleSafe: true, conductAcknowledged: true, noImpairmentAcknowledged: true, informationAccurate: true },
    });
    agreementStore.agreements.get("captain-2026-08")!.retiredAt = now;
    await agreementStore.putAgreement({ id: "captain-2026-09", kind: "captain", version: "2026-09", title: "Updated captain agreement", documentUrl: "https://got2get2work.com/captain", effectiveAt: now, retiredAt: null, required: true });
    const response = await app.inject({ method: "GET", url: "/v1/captain/eligibility", headers: { authorization: "Bearer token" } });
    assert.equal(response.json().eligible, false);
    assert.deepEqual(response.json().missingAgreementKinds, ["captain"]);
  } finally { await app.close(); }
});

test("expired qualification and false acknowledgements cannot enable captain mode", async () => {
  const { app } = await fixture();
  try {
    const expired = await app.inject({
      method: "PUT", url: "/v1/captain/attestation", headers: { authorization: "Bearer token" },
      payload: { licenseValidThrough: "2026-08-11", registrationValidThrough: "2027-01-01", insuranceValidThrough: "2027-01-01", vehicleSafe: true, conductAcknowledged: true, noImpairmentAcknowledged: true, informationAccurate: true },
    });
    assert.equal(expired.statusCode, 400);
    assert.equal(expired.json().error.code, "QUALIFICATION_EXPIRED");

    const impossibleDate = await app.inject({
      method: "PUT", url: "/v1/captain/attestation", headers: { authorization: "Bearer token" },
      payload: { licenseValidThrough: "2027-02-30", registrationValidThrough: "2027-01-01", insuranceValidThrough: "2027-01-01", vehicleSafe: true, conductAcknowledged: true, noImpairmentAcknowledged: true, informationAccurate: true },
    });
    assert.equal(impossibleDate.statusCode, 400);
    assert.equal(impossibleDate.json().error.code, "INVALID_REQUEST");

    const falseAcknowledgement = await app.inject({
      method: "PUT", url: "/v1/captain/attestation", headers: { authorization: "Bearer token" },
      payload: { licenseValidThrough: "2027-01-01", registrationValidThrough: "2027-01-01", insuranceValidThrough: "2027-01-01", vehicleSafe: false, conductAcknowledged: true, noImpairmentAcknowledged: true, informationAccurate: true },
    });
    assert.equal(falseAcknowledgement.statusCode, 400);
    assert.equal(falseAcknowledgement.json().error.code, "INVALID_REQUEST");
  } finally { await app.close(); }
});
