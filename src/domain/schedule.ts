import { ParsedShift, ScheduleParseResult } from "./models";

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const dayAliases: Record<string, number> = {
  mon: 0, monday: 0,
  tue: 1, tues: 1, tuesday: 1,
  wed: 2, wednesday: 2,
  thu: 3, thur: 3, thurs: 3, thursday: 3,
  fri: 4, friday: 4,
  sat: 5, saturday: 5,
  sun: 6, sunday: 6
};
const dateLabels = ["Jul 20", "Jul 21", "Jul 22", "Jul 23", "Jul 24", "Jul 25", "Jul 26"];
const dayPattern = "mon(?:day)?|tue(?:sday|s)?|wed(?:nesday)?|thu(?:rsday|rs|r)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?";

export function formatShiftCount(count: number) {
  return `${count} ${count === 1 ? "shift" : "shifts"}`;
}

function parseDays(text: string) {
  const lower = text.toLowerCase();
  if (/\bweekdays?\b/.test(lower)) return [0, 1, 2, 3, 4];
  if (/\bweekends?\b/.test(lower)) return [5, 6];
  const range = lower.match(new RegExp(`\\b(${dayPattern})\\s*(?:-|–|—|to|through|thru)\\s*(${dayPattern})`, "i"));
  if (range) {
    const start = dayAliases[range[1].toLowerCase()];
    const end = dayAliases[range[2].toLowerCase()];
    if (start !== undefined && end !== undefined) {
      if (start <= end) return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
      return [...Array.from({ length: 7 - start }, (_, offset) => start + offset), ...Array.from({ length: end + 1 }, (_, offset) => offset)];
    }
  }
  const found = new Set<number>();
  for (const [alias, index] of Object.entries(dayAliases)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(lower)) found.add(index);
  }
  return [...found].sort((a, b) => a - b);
}

function normalizeTime(raw: string, inferredSuffix?: "AM" | "PM") {
  const match = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  const suffix = (match[3]?.toUpperCase() ?? inferredSuffix) as "AM" | "PM" | undefined;
  if (hour > 23 || minute > 59 || (suffix && hour > 12) || hour === 0 && suffix) return null;
  if (suffix === "PM" && hour < 12) hour += 12;
  if (suffix === "AM" && hour === 12) hour = 0;
  return { hour, minute };
}

function displayTime(time: { hour: number; minute: number }) {
  const suffix = time.hour >= 12 ? "PM" : "AM";
  const hour = time.hour % 12 || 12;
  return `${hour}:${String(time.minute).padStart(2, "0")} ${suffix}`;
}

export function parseLocalSchedule(text: string): ScheduleParseResult {
  const trimmed = text.replace(/\s+/g, " ").trim();
  const days = parseDays(trimmed);
  const timeRangeSource = "(\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?)\\s*(?:-|–|—|to|until|through|thru)\\s*(\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?)";
  const timeRanges = [...trimmed.matchAll(new RegExp(timeRangeSource, "ig"))];
  if (timeRanges.length > 1) {
    throw new Error("Enter one recurring time range at a time. Review and save it, then add a different shift window separately.");
  }
  const timeRange = timeRanges[0];
  if (!days.length || !timeRange) {
    throw new Error("Include at least one weekday and a time range, such as ‘Mon–Thu, 7–3:30’. ");
  }
  const explicitStartSuffix = /am|pm/i.exec(timeRange[1])?.[0].toUpperCase() as "AM" | "PM" | undefined;
  const explicitEndSuffix = /am|pm/i.exec(timeRange[2])?.[0].toUpperCase() as "AM" | "PM" | undefined;
  const start = normalizeTime(timeRange[1], explicitStartSuffix ?? "AM");
  let end = normalizeTime(timeRange[2], explicitEndSuffix);
  if (!start || !end) throw new Error("Use a valid shift time, such as ‘7 AM–3:30 PM’. ");
  if (!explicitEndSuffix && (end.hour < start.hour || end.hour === start.hour && end.minute <= start.minute)) {
    end = normalizeTime(timeRange[2], "PM");
  }
  if (!end) throw new Error("Use a valid shift end time.");

  const shifts: ParsedShift[] = days.map((dayIndex) => ({
    id: `shift-${dayNames[dayIndex].toLowerCase()}`,
    weekday: dayNames[dayIndex].slice(0, 3),
    dateLabel: dateLabels[dayIndex],
    startLabel: displayTime(start),
    endLabel: displayTime(end),
    worksite: "Northstar Fulfillment · North Campus",
    roleLabel: "Warehouse associate"
  }));

  return {
    source: "demo",
    summary: `${formatShiftCount(shifts.length)} structured locally for Northstar Fulfillment.`,
    shifts
  };
}
