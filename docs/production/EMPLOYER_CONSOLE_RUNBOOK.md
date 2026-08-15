# Employer console launch runbook

The employer console uses the existing Expo web client and a separately deployed typed Fastify API. The worker beta service remains unchanged during the rollout.

## 1. Deploy the typed API

Build `Dockerfile.api` as a separate Cloud Run service. Configure the existing Firebase project, `REFERRAL_CODE_PEPPER`, `VEHICLE_VAULT_KEY`, and an exact comma-separated `ALLOWED_ORIGINS` value containing the deployed web origin. Do not use `*` for the production employer console.

Preview the guarded deployment command first. It builds through `cloudbuild.admin-api.yaml`, reads secrets from Secret Manager at runtime, and deliberately does not create or change IAM grants:

```powershell
.\scripts\deploy-employer-api.ps1 -ProjectId YOUR_PROJECT -Region us-east1 -RuntimeServiceAccount got2get2work-admin-api@YOUR_PROJECT.iam.gserviceaccount.com -ImageTag GIT_SHA -AllowedOrigin https://YOUR_CONSOLE_ORIGIN -WhatIf
```

Remove `-WhatIf` only after reviewing the resolved project, region, image, secrets, and origin. Browser access requires the Cloud Run invoker policy to be configured separately and intentionally; Firebase bearer-token authorization remains enforced by the application.

The service must pass `/health/live` and `/health/ready` before it is placed in the web build's `EXPO_PUBLIC_ADMIN_API_BASE_URL`.

## 2. Bootstrap the first employer administrator

Create the account in Firebase Authentication, verify its email, and run the command using operator credentials with Firebase Auth and Firestore access:

```powershell
npm.cmd run admin:bootstrap -- --email got2get2worksupport@gmail.com --tenant south-florida-pilot --worksite south-florida-site-1
```

The command refuses to overwrite an existing different membership and writes an audit event with the membership atomically. Ordinary signup cannot select or request the `employer_admin` role.

## 3. Require a second factor

Enroll the administrator in an approved Firebase second factor. Referral creation and membership approval/rejection require an MFA claim and authentication within the previous 15 minutes. The aggregate dashboard is read-only but still requires an active employer-admin membership.

## 4. Build the web client

Set `EXPO_PUBLIC_ADMIN_API_BASE_URL` to the typed API HTTPS URL and keep `EXPO_PUBLIC_API_BASE_URL` pointed at the existing worker beta service. Build and deploy the web client. An active employer administrator is routed directly to the console after sign-in; workers continue through the worker onboarding flow.

## 5. Verify before access is issued

- A worker and pending member cannot read employer routes.
- A non-MFA or stale administrator cannot create codes or decide memberships.
- Cross-tenant membership decisions return not found.
- The dashboard suppresses small cohorts and contains no location, message, schedule, vehicle, safety, rating, or individual-attendance data.
- Referral plaintext is displayed only in the creation response; Firestore stores only its digest.

Run the Android checklist in `docs/production/ANDROID_CLOSED_BETA_QA.md` against the signed release artifact and retain sanitized evidence with the release record.

## 6. Roll back a bad revision

Select a known-good immutable revision from Cloud Run, preview the traffic change, then execute it:

```powershell
.\scripts\rollback-employer-api.ps1 -ProjectId YOUR_PROJECT -Region us-east1 -Revision got2get2work-admin-api-KNOWN_GOOD -WhatIf
.\scripts\rollback-employer-api.ps1 -ProjectId YOUR_PROJECT -Region us-east1 -Revision got2get2work-admin-api-KNOWN_GOOD
```

Re-run health probes and employer-console authentication, authorization, referral, approval, and privacy smoke tests after rollback.

## Staging deployment record

Private staging verification completed 2026-08-15 in `got2get2work-xprize-cloud`, region `us-east1`. Cloud Build `6109e2f5-1af7-442f-9932-f5ba84d632ad` published image tag `12b7ed1`; Cloud Run revision `got2get2work-admin-api-00002-c47` reported healthy liveness and `configuration: ready`. The service uses the dedicated `got2get2work-admin-api` runtime identity, references Secret Manager values, and has no `allUsers` or `allAuthenticatedUsers` invoker binding. Anonymous health requests returned 403.

Browser staging was enabled 2026-08-15 after route-authorization review. The API is capped at three instances and 40 concurrent requests per instance; public invocation reaches only the application boundary, where anonymous employer requests return typed 401 responses, privileged mutations require recent MFA, production API documentation is disabled, and CORS permits only the intended app and isolated console origins. Static console build `bb9d13bc-8e70-4de1-9299-b0c4afce7688` published image `659462b` and revision `got2get2work-console-00001-sdn` under an unprivileged runtime identity capped at two instances. Firebase Authentication authorizes only the console's two Cloud Run host aliases in addition to the existing approved domains.

End-to-end administrator login remains gated on creating and verifying the dedicated `got2get2worksupport@gmail.com` Firebase account, enrolling its second factor, and running the guarded employer-admin bootstrap. The existing personal Firebase account remains an unverified worker account and must not be promoted in place.
