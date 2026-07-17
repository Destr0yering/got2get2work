# CommuteKind final QA gate

Date: July 17, 2026

## Scope

This gate scores the fictional, no-billing hackathon demo—not production transportation readiness. Production still requires real identity/workplace verification, mapping, persistence, notifications, insurance/legal review, incident operations, and security hardening.

## Hackathon acceptance result: 10/10 gates passed

1. Local/no-billing launch performs zero network requests.
2. Policy acceptance requires both documents; optional permissions stay separate and persist.
3. Schedule parsing handles recurring ranges and overnight work, rejects ambiguity, and rejects conflicting multi-window prose instead of inventing shifts.
4. To-work and home roles are independently stored and shown.
5. Round-trip matching hard-gates arrival, departure, seats, detour, consent, accessibility, and blocks.
6. Match explanations are explicit-only, fact-limited, stale-response safe, and pickup-consistent.
7. Public pickup proposals update both personas, then lock once a request is sent.
8. Only the requested driver can accept; meeting/vehicle details remain hidden until mutual approval.
9. No-match, cancellation, standing-backup, persistent thread, and post-trip prefer/block flows are deterministic and recoverable.
10. Pickup identity is customizable; proximity requires confirmation and separate coworker opt-ins, role-bound updates, and signal reset on opt-out/cancellation. Both route maps have accessible text alternatives.

## Automated verification

- TypeScript typecheck: pass.
- Client/domain/state tests: 33/33 pass.
- Server/privacy tests: 10/10 pass.
- Web production export: pass, 518 kB JavaScript bundle.
- Android production export: pass, 1.92 MB Hermes bundle.
- Export scan: no key-shaped secret or OpenAI endpoint in client bundles.

## Manual browser paths verified

- Welcome and seeded offline demo.
- Policy review, disabled/enabled acceptance, optional preference persistence.
- Driver boundaries and saved profile values.
- Ambiguous schedule error and custom Friday 9–5 parse.
- Scarce-supply/no-match scenario and recovery controls.
- Jordan match, alternate public pickup, explicit local explanation, request, driver acceptance, confirmation, messaging, cancellation, and Avery recovery.
- Avatar/vehicle customization and both-persona pickup-proximity flow.
- Direct driver entry to the tracker, separate opt-ins, passenger-presence sharing, nearby/arrived approach states, and zero browser console warnings.
- 320×568 Today/Profile layouts with no content overflow and no console warning/error.

## Dependency note

`npm audit --omit=dev` reports no high or critical advisory. It reports 11 moderate transitive advisories in the Expo build/configuration dependency tree. npm offers only a forced upgrade to Expo 57, a breaking framework change, so that migration is intentionally deferred rather than forced into the hackathon build.

## Submission work still external to the code gate

- Create/share the repository and add the required license/access.
- Record and publish the under-three-minute demo video.
- Capture the Codex `/feedback` session ID.
- Complete the remaining Devpost entrant fields and submit before the deadline.
