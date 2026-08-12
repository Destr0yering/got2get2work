# Got2Get2Work B2B2C pilot

## Declared product model

Got2Get2Work is an employer-sponsored workforce mobility benefit for fixed-shift employees. The employer, workforce program, or participating worksite is the buyer and sponsor. Employees are the users and pay no monthly platform fee. The sponsor may also establish a separate budget for ride credits or approved rescue transportation.

The service helps workers coordinate potential coworker carpools and recover when a plan changes. It does not provide transportation, employ drivers, guarantee rides, or determine that a participant is safe to ride with.

## Initial design partner

The first ideal design partner is a single warehouse, distribution center, manufacturing facility, hospital, hospitality operation, or other worksite where commute failures can create uncovered shifts.

The initial pilot should be deliberately narrow:

- one worksite;
- one hard-to-cover shift or cohort;
- an opted-in employee population;
- 21 to 60 days;
- no automated employment decisions;
- aggregate-only employer reporting.

## Recurring value: shift protection

The product is not merely a one-time coworker introduction. Workers return for:

- work-calendar and schedule-change coordination;
- recurring carpool planning;
- pickup confirmation and privacy controls;
- standing backup offers;
- transit and employer-approved rescue options;
- ride-again and preferred-coworker relationships;
- employee credits and protected-shift history.

## Schedule connector plan

### First production connector: Google Calendar

A worker can connect Google Calendar with read-only permission and select the specific calendar that contains work shifts. Scheduling software such as HotSchedules may publish shifts into that calendar upstream. Got2Get2Work then normalizes candidate events into shift records and asks the worker to approve them before matching.

The connector should:

- perform an initial bounded synchronization;
- retain the provider event ID, calendar ID, time zone, start/end time, status, and synchronization cursor needed for updates;
- use incremental synchronization and periodic reconciliation;
- treat webhook notifications as change signals, then retrieve the changed records;
- detect cancellations and material time changes;
- notify the worker when a confirmed commute may need to be recalculated;
- never scan every personal calendar by default.

### Other schedule paths

1. Direct employer scheduling API or feed when authorized.
2. Subscribed `.ics` feed for recurring updates.
3. Uploaded `.ics` file as a one-time snapshot.
4. Manual or natural-language schedule entry as a universal fallback.

Calendar events are not considered authoritative until worker confirmation. A direct employer integration may later support an employer-verified schedule state, but the worker must still see the schedule used for their commute plan.

## Employer reporting boundary

Employers may receive:

- eligible and enrolled employee counts;
- weekly active participants;
- active carpools;
- protected-shift totals;
- aggregate recovery attempts and outcomes;
- platform, subsidy, and employer-defined value assumptions.

Employers do not receive through the standard product:

- home addresses or exact saved locations;
- employee ride messages;
- individual routes or trip histories;
- unrelated calendar events;
- raw schedule-calendar descriptions or attendees;
- automated disciplinary recommendations.

## Commercial hypothesis

Test these assumptions; do not present them as established pricing:

- 21- to 60-day paid pilot: $2,500–$7,500 per worksite;
- ongoing platform fee: $4–$8 per eligible employee per month;
- site minimum: $750–$1,500 per month;
- employer-funded ride credits and rescue transportation: separate pass-through budget.

The fictional demo uses a $1,200 monthly platform fee and $1,600 monthly subsidy budget. Its avoided-absence and net-value figures are illustrative assumptions, not customer results or causal claims.

## Evidence required before stronger claims

1. Paid design partner or signed pilot letter.
2. Eligible, invited, enrolled, and weekly active employee counts.
3. Calendar-connection success rate and confirmed-shift accuracy.
4. Protected shifts and recovery attempts with success rate.
5. Employee retention and repeat coordination after a first match.
6. Employer-defined cost of an uncovered shift.
7. Actual platform revenue, subsidy expense, cloud/AI cost, support cost, and gross margin.
8. Privacy, insurance, labor, transportation, tax, calendar-platform, and accessibility review for each launch market.
