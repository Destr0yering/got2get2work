# Build with Gemini XPRIZE — Submission Audit

Audit date: August 9, 2026  
Deadline: August 17, 2026 at 1:00 PM Pacific / 4:00 PM Eastern  
Primary project audited: Got2Get2Work  
Devpost project: `1351859` (`Untitled`, `submission_pre_draft`)

## Executive verdict

**Not submission-ready.** The software prototype is credible and its core automated tests pass, but the current entry does not yet meet the competition's central evidence bar: a launched business with real users, real revenue, live production AI, and documented proof. The Devpost entry is still an empty pre-draft. The repository's current XPRIZE work is mostly uncommitted, the published GitHub branch appears older than the local work, the submission narrative/checklist targets the wrong hackathon, the video is missing, and required evidence files have not been assembled.

The workspace also contains a separate `shiftsecure` candidate. An independent Code Reviewer audited it because the live Devpost project is untitled and no product is bound to the entry. If ShiftSecure is the intended submission, do not use the Got2Get2Work checklist alone; resolve the alternate-project findings below first.

## Highest-priority blockers

- [ ] Rename Devpost project from `Untitled`; add tagline, 500–1000 word description, Built With list, and project links.
- [ ] Choose the official category. Best current fit appears **Entrepreneurship & Job Creation**, but the narrative must show jobs/economic opportunity beyond the founders.
- [ ] Launch a real production path used by real users. The current public-facing copy repeatedly identifies the product as a fictional/conceptual demonstration.
- [ ] Obtain and document real users, paying users, arms-length revenue, monthly revenue, expenses, COGS, and customer-acquisition spend. Zeroes are accepted by the form but materially weaken Business Viability.
- [ ] Prove Gemini is live in production and executing a meaningful operational decision. A manually refreshed aggregate summary is likely too peripheral for the AI-Native Operations criterion.
- [ ] Prove use of at least one Google Cloud product and at least one Gemini API call.
- [ ] Deploy and verify the judge path, including `/api/health` and an authenticated Gemini action. DNS checks from this environment did not resolve `app.got2get2work.com` or `demo.got2get2work.com`.
- [ ] Record and publish a public three-minute video showing live production AI decisions, not only seeded demo behavior.
- [x] Produce the required 500–1000 word AI-operations narrative (factual placeholders remain for entrant-supplied evidence).
- [ ] Prepare product-running evidence (PDF/PNG/JPG/JPEG) and P&L evidence (PDF/PNG/JPG/JPEG).
- [ ] Share the repository with `testing@devpost.com` and `judging@hacker.fund`, then check the confirmation box.
- [ ] Commit and push the local XPRIZE work. The public repo is on commit `d5c4b44` dated July 17, while the audit found extensive modified and untracked XPRIZE files locally.
- [x] Repair the website test suite: 2/2 production rendering tests now pass.

## Competition requirements checklist

### Eligibility and timing

- [ ] Confirm every entrant is above the legal age of majority where they reside.
- [ ] Confirm no entrant or organization is in an excluded territory (the live eligibility summary lists Crimea, Cuba, Iran, North Korea, and Russia; review the full Official Rules before submission).
- [ ] Confirm entrant structure: individual, team, or organization. Organizations must have fewer than 25 employees.
- [ ] Confirm the project start date and disclose every pre-existing resource used from before May 19, 2026.
- [ ] Submit before August 17, 2026 at 1:00 PM Pacific / 4:00 PM Eastern; allow several hours for uploads and validation.

### Required product and business evidence

- [ ] Real business launched during the hackathon period.
- [ ] Real users acquired; record total and acquisition method.
- [ ] Real paying users/transactions recorded separately.
- [ ] Revenue recorded by month: May, June, July, August 2026.
- [ ] Related-party revenue separately disclosed.
- [ ] Expenses, COGS, marketing/customer acquisition, R&D, and G&A reconciled.
- [ ] Simple P&L created and exported to an allowed upload format.
- [ ] Revenue evidence assembled (processor export, bank statement, invoices/receipts as applicable).
- [ ] Public customer testimonial added if available.
- [ ] Customer evidence assembled securely for judges, including contact details only with appropriate consent.
- [ ] Corporate ID/EIN included if applicable.

### AI and Google requirements

- [ ] At least one Google Cloud product used during the hackathon and described precisely.
- [ ] If any LLM is used, at least one Gemini API call is implemented and demonstrated.
- [ ] AI is live in production continuously, not merely optional, deferred, or demo-only.
- [ ] AI executes a key operational decision with appropriate safeguards and human override.
- [ ] Agent execution logs, Gemini/API usage records, Cloud Run evidence, and screenshots are captured without secrets or personal data.
- [ ] Human-versus-AI responsibilities are explained clearly.
- [ ] Daily AI operating workflow and business-building story are covered in 500–1000 words.
- [ ] Jobs and economic opportunities created or enabled beyond the founding team are quantified or credibly projected.

### Devpost deliverables

- [x] Project title prepared (maximum 60 characters).
- [x] Tagline prepared (maximum 200 characters).
- [x] Full project description/narrative drafted.
- [x] Built With technologies prepared.
- [x] Repository URL prepared.
- [ ] Repository shared with both judge email addresses.
- [x] Repository ZIP rebuilt and structurally inspected; upload remains external.
- [ ] Three-minute public demo video URL.
- [ ] Product-running evidence upload.
- [ ] P&L upload.
- [ ] Thumbnail/project image added through the Devpost web UI.
- [ ] All required custom questions answered consistently with evidence.
- [ ] Optional Agentic Economy Prize fields left blank unless Circle integration is real and fully evidenced.

## Required Devpost questions to answer

- [ ] Project start date.
- [ ] Submitter type.
- [ ] Organization name and EIN, if applicable.
- [ ] Country of residence for every member.
- [ ] Competition category.
- [ ] How AI creates impact in the chosen category.
- [ ] How impact is measured.
- [ ] Underlying business model.
- [ ] Future operating sustainability.
- [ ] AI tools used.
- [ ] Why the model is sustainable and viable.
- [ ] How the business operates with AI.
- [ ] Extent to which AI is live and makes key decisions.
- [ ] Google Cloud product used and how.
- [ ] LLMs used and exact Gemini API use.
- [ ] Repository URL.
- [ ] Running-product evidence upload.
- [ ] Repository-sharing confirmation.
- [ ] Pre-existing resources disclosure.
- [ ] Total revenue.
- [ ] Revenue by month.
- [ ] Revenue explanation: price, payment period, customers/transactions.
- [ ] Related-party revenue.
- [ ] Total expenses.
- [ ] Expense explanation by COGS, sales/marketing, R&D, and G&A percentages and drivers.
- [ ] Total COGS and explanation.
- [ ] Marketing/customer-acquisition cost and explanation.
- [ ] Other expenses, if any.
- [ ] Users acquired.
- [ ] Paying users.
- [ ] Public testimonial, if available.
- [ ] Learning level.
- [ ] P&L upload.

## Code and repository audit

### Passing

- [x] TypeScript typecheck passes.
- [x] 34 client/domain/state tests pass.
- [x] 23 server/privacy/auth/rate-limit tests pass.
- [x] Website production build completes.
- [x] Gemini integration is server-side and keys are not placed in public environment variables.
- [x] Privacy minimization, authentication boundaries, rate limiting, deterministic fallbacks, and seeded demo labeling have test coverage.
- [x] MIT license and substantial architecture/privacy/deployment documentation exist.
- [x] Public GitHub repository exists and is accessible through the connected GitHub account.

### Failing or risky

- [x] Website rendered-HTML tests pass 2/2 against the production pages.
- [ ] Re-run `npm run verify` after the website test repair and final deployment changes.
- [x] Secret scan found no key-shaped committed secrets; dependency audit completed and remaining high-severity transitive findings are documented below.
- [x] ZIP was rebuilt from the current working tree and validated for required files and excluded secret/dependency directories. Rebuild again after the final commit.
- [x] Replace the obsolete OpenAI Build Week submission draft/checklist with XPRIZE-specific materials.
- [ ] Reconcile README claims with deployed reality. Phrases such as “should run,” “deferred,” “fictional,” and “no-billing” conflict with XPRIZE's production-business emphasis.
- [ ] Verify custom domains and DNS externally; `app.got2get2work.com` and `demo.got2get2work.com` did not resolve in this audit environment.
- [ ] Confirm the public GitHub Pages demo works from a fresh/incognito browser and that every asset loads from the repository subpath.
- [x] Add CI for typecheck, all test groups, production builds, lint, and secret scanning.
- [x] Make Gemini and Google Cloud central in the XPRIZE submission story; OpenAI remains an optional code path outside the primary narrative.

### Verification evidence from August 9

- Typecheck: pass.
- Client/domain/state tests: 34/34 pass.
- Server/privacy/auth/rate-limit tests: 23/23 pass.
- Website production rendering tests: 2/2 pass.
- Website lint: pass.
- Website production build: pass.
- Expo web export: pass with `NODE_OPTIONS=--max-old-space-size=4096`.
- Expo Android/Hermes export: pass when the trusted Hermes compiler is allowed to execute.
- Submission ZIP: 5,573,700 bytes, 160 entries, SHA-256 `7372fd37d0c1485b8aacb87dfad1a0dd6b8b406627c5333139a7dfee813ce5d5`.
- Dependency audit: remaining transitive high-severity advisories exist in the Expo/Metro tree and website Next/PostCSS/Sharp tree. Safe root updates changed `package-lock.json`; website safe remediation hit an npm resolution error. Forced remediation would require breaking Expo/Next upgrades and was not applied.
- Environment note: the C: drive reported zero free bytes during the final advisory recheck, so another audit should be run after space is restored.

## Judging alignment

### Business Viability — currently weak/blocking

The repository documents hypotheses, illustrative economics, fictional users, and no measured customer outcomes. Convert the strongest design-partner lead into a paid, arms-length pilot before the deadline if possible. Preserve invoices, payment proof, usage, and interview/testimonial evidence.

### AI-Native Operations — partially implemented, insufficiently evidenced

There is a real server-side Gemini coordinator and Google Cloud deployment script, but the submitted story must demonstrate live production operation and key decisions. Promote Gemini into a genuine operational loop (for example, privacy-safe employer mobility triage or schedule disruption handling), log its actions, show safeguards, and capture production usage evidence.

### Category Impact — plausible narrative, not yet proven

The worker mobility problem is credible and the privacy design is thoughtful. Choose Entrepreneurship & Job Creation and quantify protected shifts, workers enrolled, successful commute recoveries, attendance disruptions avoided, employer adoption, and worker savings—clearly separating real measurements from forecasts.

## Suggested final 8-day sequence

1. **Aug 9–10:** Decide entrant/category, rename Devpost entry, replace obsolete submission docs, repair website tests, commit/push.
2. **Aug 10–12:** Deploy the authenticated Cloud Run/Gemini path; validate DNS, health, auth, logs, and privacy boundaries.
3. **Aug 10–14:** Recruit real pilot users/customer, operate the product, charge an arms-length amount, collect consented evidence.
4. **Aug 13–15:** Reconcile P&L and revenue proof; draft the 500–1000 word narrative and every form answer.
5. **Aug 15–16:** Record the three-minute video, capture production/Gemini evidence, rebuild and inspect the ZIP.
6. **Aug 16:** Share repo with both judge addresses; complete every Devpost field and upload.
7. **Aug 17 morning:** Fresh-device judge-path rehearsal, link checks, evidence consistency review, and final submission well before 1:00 PM Pacific.

## Final go/no-go gate

Do not submit as “ready” until all are true:

- [ ] Devpost project is no longer an empty pre-draft.
- [ ] Production URL works without organizer assistance.
- [ ] Gemini runs live and evidence shows meaningful decisions.
- [ ] Google Cloud use is verifiable.
- [ ] Real user/revenue/expense claims reconcile to the P&L and supporting records.
- [ ] Video, narrative, repository, ZIP, running evidence, and P&L are uploaded.
- [ ] Repository permissions are confirmed for both judge addresses.
- [ ] Final commit passes typecheck, all tests, builds, secret scan, and manual demo rehearsal.
- [ ] Every claim in Devpost, video, website, README, and financial evidence is consistent.

## Alternate candidate: ShiftSecure critical findings

- [ ] Bind the Devpost entry explicitly to either Got2Get2Work or ShiftSecure; do not mix artifacts or claims.
- [ ] Runtime-enforce the advertised policy engine, transition model, and provider adapters. `shiftsecure/src/lib/rescue-store.ts:155` currently scripts final states without invoking `evaluatePolicy` or `transition` from `src/lib/domain.ts`.
- [ ] Replace the forgeable `x-demo-role: MANAGER` client header with server-side authorization and rate limiting (`src/app/api/demo/route.ts:15`, `src/app/api/ai/decision-summary/route.ts:7`, `src/components/demo-client.tsx:24`).
- [ ] Isolate demo state per judge/session and make reset/update transactional. The current single rescue ID and global SQLite state can cause cross-judge interference (`src/lib/rescue-store.ts:60`, `:155`).
- [ ] Correct or narrow append-only audit/idempotency claims; resets currently delete audit rows (`src/lib/rescue-store.ts:79`).
- [ ] Add `MANUAL_REVIEW` to the state model or use an existing legal state (`src/lib/rescue-store.ts:152`, `src/lib/domain.ts:1`).
- [ ] Add a timeout/cancellation path for Gemini calls (`src/lib/gemini.ts:79`).
- [ ] Correct inaccurate seeded `previousState` values (`src/lib/rescue-store.ts:87`).
- [ ] Harden the container with a multi-stage build and non-root user; clarify that Cloud Run SQLite is ephemeral.
- [ ] Run standalone lint and E2E. ShiftSecure typecheck, 18 tests, and production build passed; lint was not verified due to timeout.
