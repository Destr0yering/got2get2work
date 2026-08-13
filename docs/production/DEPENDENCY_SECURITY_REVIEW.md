# Dependency Security Review

Reviewed: 2026-08-13

## Resolution

`npm audit fix --package-lock-only` applied every compatible non-breaking resolution. The remaining `npm audit --omit=dev` report contains transitive `image-size` and `uuid` findings for which npm proposes breaking Expo/React Native or Firebase Admin downgrades.

## Reachability

- `image-size` is reached through Metro/Expo asset build tooling. Got2Get2Work does not accept or parse user-controlled ICNS, JXL, or HEIF files in the API, mobile runtime, or website. The vulnerable parser is therefore not reachable from a production request boundary in this release.
- Vulnerable `uuid` versions are transitive dependencies of Google Cloud Storage/authentication packages. Product source does not import the `uuid` package and does not invoke UUID v3, v5, or v6 with caller-provided output buffers. Runtime identifiers use Node's `crypto.randomUUID()` or deterministic SHA-256 identifiers.

## Decision

Do not use `npm audit fix --force`; its proposed dependency changes are incompatible framework/SDK downgrades. Track compatible upstream Expo/Metro and Firebase Admin/Google Cloud releases, rerun this review on each release candidate, and block launch if a vulnerable parser or UUID buffer API becomes reachable from untrusted input.
