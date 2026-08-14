# Employer console launch runbook

The employer console uses the existing Expo web client and a separately deployed typed Fastify API. The worker beta service remains unchanged during the rollout.

## 1. Deploy the typed API

Build `Dockerfile.api` as a separate Cloud Run service. Configure the existing Firebase project, `REFERRAL_CODE_PEPPER`, `VEHICLE_VAULT_KEY`, and an exact comma-separated `ALLOWED_ORIGINS` value containing the deployed web origin. Do not use `*` for the production employer console.

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
