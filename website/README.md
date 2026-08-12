# Got2Get2Work public website

This package contains the public marketing website for Got2Get2Work.

## Final product positioning

Got2Get2Work is an employer-sponsored workforce mobility benefit for fixed-shift employees. Employers or workforce programs fund the platform and may fund approved ride credits or rescue transportation. Workers use the employee experience voluntarily and without a monthly platform fee.

The website must consistently communicate:

- employers sponsor the benefit;
- fixed-shift employees are the users;
- the outcome is commute reliability and protected shifts;
- both coworkers approve every carpool;
- employers receive aggregate pilot measures, not personal trip surveillance;
- Got2Get2Work coordinates potential carpools and does not guarantee transportation or verify driver safety.

## Canonical domains

- `https://got2get2work.com` — canonical public marketing site.
- `https://www.got2get2work.com` — permanent redirect to the root domain.
- `https://app.got2get2work.com` — authenticated pilot application and same-origin `/api/*` service on Google Cloud Run.
- `https://demo.got2get2work.com` — public fictional, no-login demonstration. The existing GitHub Pages URL may remain as an implementation origin or compatibility redirect.

Do not use the marketing site as the authenticated application and do not present the fictional demo as the live pilot.

## Schedule-connection message

The planned first production schedule connector is worker-authorized Google Calendar access. The worker selects the calendar containing work shifts; scheduling tools such as HotSchedules can remain upstream and publish into Google Calendar. Got2Get2Work detects candidate shifts, asks the worker to confirm them, and recalculates commute options when a confirmed shift materially changes.

Website copy must not imply that every calendar, employer scheduling platform, or `.ics` file is already connected. Until released, describe this as a pilot or planned capability.

## Development

Prerequisite: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
npm run build
npm test
```

The active public routes are maintained under `app/`. Remove unused starter database, D1, Drizzle, example, and authentication scaffold unless a defined website requirement depends on it.

## Deployment

Deploy the marketing website independently from the pilot application. The root domain should remain available even when the pilot app or demo is offline. No provider API keys, Firebase administrative credentials, calendar OAuth secrets, or account recovery material may be committed to this package or stored in public build variables.
