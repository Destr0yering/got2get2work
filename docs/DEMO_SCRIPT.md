# CommuteKind demo script (target 2:50)

## 0:00-0:15 — The human problem

“Driving on ride-hail platforms, I keep meeting people spending money just to reach the same workplace at the same time. Often, the ride they need is already passing nearby.”

Show the CommuteKind welcome screen.

## 0:15-0:40 — Policies, trust, and privacy

Tap “Review policies and start setup.” Show the separate “Open MVP Terms” and “Open MVP Privacy Notice” buttons, then the optional switches in their off state. Accept the policies and continue.

“This MVP does not ask for an exact home address. A cross-street area is still location information, so the app explains how the local demo uses it. Schedule and notification preferences are separate and optional.”

Keep Maya’s seeded profile values and tap “Save commute profile.”

## 0:40-1:03 — Local, privacy-safe schedule structure

On “Tell the agent when you work,” enter:

`Northstar Fulfillment - North Campus, Mon-Thu, 7:00 AM-3:30 PM`

Tap “Structure my schedule,” then show the review screen and the **Offline demo · local** badge. Tap “Save 4 shifts and find matches.”

“This judged path needs no API key or billing. The schedule is structured locally and Maya reviews it before saving. A deferred server adapter is designed to send only allowlisted shift fields if live API access is added later.”

## 1:03-1:31 — Explainable match

Tap “Review matches,” then open Jordan’s recommendation.

- Same fictional workplace group.
- Eight-minute arrival overlap.
- Twelve-minute departure overlap for the ride home.
- Five-minute driver detour.
- $6.40 suggested round-trip expense share.

Tap “Ask the agent why” to load the local fact-backed explanation. Opening the screen alone makes no model request.

“Route feasibility and money come from deterministic code. The offline explanation restates only validated facts. The optional future GPT adapter is constrained to the same reason IDs.”

## 1:31-1:53 — Mutual approval

Choose a public pickup, tap “Request a round trip with Jordan,” then “Switch demo to Jordan.” Review both legs and the expense share, tap “Accept coworker ride,” and tap “Switch back to Maya.”

“Only after both coworkers agree does the public meeting point and vehicle description appear.”

## 1:53-2:22 — Confirmed pickup

Show the confirmed Today card. Open “Pickup map & proximity.” As Jordan, enable pickup proximity. Switch to Maya in place, enable her proximity, and tap “I am standing at pickup.” Switch to Jordan and advance the car to “nearby.”

“Both coworkers opt in separately. The little map helps Maya see the car approach and Jordan see that Maya is waiting. This judged build simulates Bluetooth states without scanning strangers, exact GPS, or background tracking. Their custom avatar and vehicle description add a visual check.”

## 2:22-2:43 — Agentic recovery

Open “Demo controls,” tap “Simulate driver cancellation,” then “Review backup plan.” Show Avery’s standing offer plus the transit fallback, then tap “Accept Avery’s standing backup offer.”

“When plans change, the agent surfaces a grounded offer from Avery, who already opted in as a backup. Maya still has to accept before anything is confirmed.”

## 2:43-2:53 — Impact

Show estimates:

- Four shifts protected.
- $64 estimated monthly savings.
- Three fewer solo vehicle trips.

“These are transparent estimates, not guarantees.”

## 2:53-2:59 — Technical close

“Codex with GPT-5.6 helped design, build, review, and test this new application. The judged app runs locally with no API billing; deterministic code and user consent control matching and recovery, while a minimized model adapter is ready for a later API-connected phase.”
