import { randomUUID } from "node:crypto";
import type { CommuteProfile, CommuteProfileBody, RecurringShift, RecurringShiftInput } from "../../../../../packages/contracts/src";
import type { RequestIdentity } from "../membership/domain";
import { CommuteError, type CommuteProfileRecord, type ShiftRecord } from "./domain";
import type { CommuteStore } from "./ports";

const weekday = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;
const viewProfile = (v: CommuteProfileRecord): CommuteProfile => ({ displayName: v.displayName, adultConfirmed: true, toWorkRole: v.toWorkRole, homeRole: v.homeRole, maximumDetourMinutes: v.maximumDetourMinutes, seatsAvailable: v.seatsAvailable, ...(v.pickupAreaId ? { pickupAreaId: v.pickupAreaId } : {}), ...(v.accessibilityNotes ? { accessibilityNotes: v.accessibilityNotes } : {}), ...(v.accessibilityRequired !== undefined ? { accessibilityRequired: v.accessibilityRequired } : {}), notificationsEnabled: v.notificationsEnabled, updatedAt: v.updatedAt.toISOString() });
const viewShift = (v: ShiftRecord): RecurringShift => ({ id: v.id, weekdays: v.weekdays, arrivalTime: v.arrivalTime, departureTime: v.departureTime, timeZone: v.timeZone, effectiveFrom: v.effectiveFrom, ...(v.effectiveThrough ? { effectiveThrough: v.effectiveThrough } : {}), source: v.source, status: v.status, updatedAt: v.updatedAt.toISOString() });
function validZone(zone: string) { try { new Intl.DateTimeFormat("en-US", { timeZone: zone }); return true; } catch { return false; } }
function validateShift(input: RecurringShiftInput) {
  if (!validZone(input.timeZone)) throw new CommuteError("The schedule time zone is not valid.", "INVALID_TIME_ZONE", 400);
  if (input.effectiveThrough && input.effectiveThrough < input.effectiveFrom) throw new CommuteError("Schedule end must not precede its start.", "INVALID_DATE_RANGE", 400);
}
function parseDateTime(line: string) {
  const split = line.indexOf(":"); if (split < 0) throw new CommuteError("ICS date field is malformed.", "INVALID_ICS", 400);
  const head = line.slice(0, split); const raw = line.slice(split + 1); const zone = /TZID=([^;:]+)/.exec(head)?.[1] ?? "UTC";
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(?:\d{2})?Z?$/.exec(raw);
  if (!match || !validZone(zone)) throw new CommuteError("ICS date or time zone is unsupported.", "INVALID_ICS", 400);
  return { date: `${match[1]}-${match[2]}-${match[3]}`, time: `${match[4]}:${match[5]}`, zone, utc: raw.endsWith("Z"), raw };
}
function parseIcs(ics: string): RecurringShiftInput[] {
  if (/\0/.test(ics) || !ics.includes("BEGIN:VCALENDAR")) throw new CommuteError("ICS content is not a calendar.", "INVALID_ICS", 400);
  const lines = ics.replace(/\r\n[ \t]/g, "").split(/\r?\n/); const events: string[][] = []; let current: string[] | null = null;
  for (const line of lines) { if (line === "BEGIN:VEVENT") { if (current) throw new CommuteError("Nested ICS events are invalid.", "INVALID_ICS", 400); current = []; } else if (line === "END:VEVENT") { if (!current) throw new CommuteError("ICS event boundary is invalid.", "INVALID_ICS", 400); events.push(current); current = null; } else if (current) current.push(line); }
  if (current || events.length === 0 || events.length > 50) throw new CommuteError("ICS must contain between 1 and 50 complete events.", "INVALID_ICS", 400);
  return events.map((event) => {
    const startLine = event.find((v) => v.startsWith("DTSTART")); const endLine = event.find((v) => v.startsWith("DTEND"));
    if (!startLine || !endLine) throw new CommuteError("Each ICS event needs DTSTART and DTEND.", "INVALID_ICS", 400);
    const start = parseDateTime(startLine); const end = parseDateTime(endLine); if (start.zone !== end.zone || start.utc !== end.utc) throw new CommuteError("ICS event time zones must match.", "INVALID_ICS", 400);
    const rule = event.find((v) => v.startsWith("RRULE:")); const byDay = rule ? /(?:^|;)BYDAY=([^;]+)/.exec(rule.slice(6))?.[1]?.split(",") : undefined;
    const date = new Date(`${start.date}T12:00:00Z`); const days = byDay?.filter((v): v is typeof weekday[number] => weekday.includes(v as typeof weekday[number])) ?? [weekday[date.getUTCDay()]!];
    if (days.length === 0) throw new CommuteError("ICS recurrence weekdays are unsupported.", "INVALID_ICS", 400);
    return { weekdays: [...new Set(days)], arrivalTime: start.time, departureTime: end.time, timeZone: start.zone, effectiveFrom: start.date };
  });
}

export class CommuteService {
  private readonly now: () => Date;
  constructor(private readonly store: CommuteStore, now?: () => Date) { this.now = now ?? (() => new Date()); }
  async getProfile(identity: RequestIdentity) { const v = await this.store.getProfile(identity.uid); if (!v || v.tenantId !== identity.tenantId || v.worksiteId !== identity.worksiteId) throw new CommuteError("Commute profile not found.", "PROFILE_NOT_FOUND", 404); return viewProfile(v); }
  async saveProfile(identity: RequestIdentity, body: CommuteProfileBody) { if ((body.toWorkRole === "captain" || body.homeRole === "captain") && body.seatsAvailable < 1) throw new CommuteError("Captains must offer at least one seat.", "INVALID_CAPACITY", 400); return viewProfile(await this.store.saveProfile({ ...body, displayName: body.displayName.trim(), accessibilityNotes: body.accessibilityNotes?.trim(), uid: identity.uid, tenantId: identity.tenantId, worksiteId: identity.worksiteId, updatedAt: this.now() })); }
  async listShifts(identity: RequestIdentity) { return (await this.store.listShifts(identity.uid)).filter((v) => v.tenantId === identity.tenantId && v.worksiteId === identity.worksiteId).map(viewShift); }
  async createManual(identity: RequestIdentity, body: RecurringShiftInput) { validateShift(body); return viewShift(await this.store.saveShift({ ...body, id: randomUUID(), uid: identity.uid, tenantId: identity.tenantId, worksiteId: identity.worksiteId, source: "manual", status: "confirmed", updatedAt: this.now() })); }
  async importIcs(identity: RequestIdentity, ics: string) { const shifts = parseIcs(ics); const saved: RecurringShift[] = []; for (const shift of shifts) { validateShift(shift); saved.push(viewShift(await this.store.saveShift({ ...shift, id: randomUUID(), uid: identity.uid, tenantId: identity.tenantId, worksiteId: identity.worksiteId, source: "ics", status: "candidate", updatedAt: this.now() }))); } return saved; }
  async confirm(identity: RequestIdentity, id: string) { const shift = await this.store.getShift(id); if (!shift || shift.uid !== identity.uid || shift.tenantId !== identity.tenantId || shift.worksiteId !== identity.worksiteId) throw new CommuteError("Shift not found.", "SHIFT_NOT_FOUND", 404); return viewShift(await this.store.saveShift({ ...shift, status: "confirmed", updatedAt: this.now() })); }
}
