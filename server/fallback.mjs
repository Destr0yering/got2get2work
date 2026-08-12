const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ALIASES = new Map([
  ["mon", 0], ["monday", 0],
  ["tue", 1], ["tues", 1], ["tuesday", 1],
  ["wed", 2], ["wednesday", 2],
  ["thu", 3], ["thur", 3], ["thurs", 3], ["thursday", 3],
  ["fri", 4], ["friday", 4],
  ["sat", 5], ["saturday", 5],
  ["sun", 6], ["sunday", 6],
]);

function normalizeTime(raw, fallback) {
  if (!raw) return fallback;
  const cleaned = raw.toLowerCase().replace(/\s+/g, "");
  const match = cleaned.match(/(\d{1,2})(?::(\d{2}))?(am|pm)?/);
  if (!match) return fallback;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  const suffix = match[3];
  if (suffix === "pm" && hour < 12) hour += 12;
  if (suffix === "am" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function parseDays(text) {
  const lower = text.toLowerCase();
  const range = lower.match(/\b(mon(?:day)?|tue(?:sday|s)?|wed(?:nesday)?|thu(?:rsday|rs)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\s*(?:-|to|through|thru)\s*(mon(?:day)?|tue(?:sday|s)?|wed(?:nesday)?|thu(?:rsday|rs)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)/i);
  if (range) {
    const start = DAY_ALIASES.get(range[1].toLowerCase());
    const end = DAY_ALIASES.get(range[2].toLowerCase());
    if (start !== undefined && end !== undefined && start <= end) return DAYS.slice(start, end + 1);
  }

  const found = [];
  for (const [alias, index] of DAY_ALIASES) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(lower) && !found.includes(index)) found.push(index);
  }
  return found.length ? found.sort((a, b) => a - b).map((index) => DAYS[index]) : DAYS.slice(0, 4);
}

export function fallbackSchedule(text) {
  const timeRange = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|to|until|–|—)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  const startTime = normalizeTime(timeRange?.[1], "07:00");
  let endTime = normalizeTime(timeRange?.[2], "15:30");
  if (!/[ap]m/i.test(timeRange?.[2] ?? "") && Number(endTime.slice(0, 2)) <= Number(startTime.slice(0, 2))) {
    endTime = `${String(Number(endTime.slice(0, 2)) + 12).padStart(2, "0")}:${endTime.slice(3)}`;
  }
  const days = parseDays(text);
  const worksiteLabel = text.split(/,|\bon\b|\bmon(?:day)?\b/i)[0].trim() || "Your worksite";

  return {
    source: "deterministic-fallback",
    model: null,
    summary: `${days.length} recurring shifts at ${worksiteLabel}`,
    worksiteLabel,
    timezoneAssumption: "Local workplace time",
    shifts: days.map((day) => ({ day, startTime, endTime })),
  };
}

const FACT_LABELS = {
  arrivalOverlapMinutes: (value) => `Arrival windows overlap by ${value} minutes.`,
  driverDetourMinutes: (value) => `The estimated driver detour is ${value} minutes.`,
  detourMiles: (value) => `The added route distance is about ${value} miles.`,
  recurringDays: (value) => `This option repeats across ${value} scheduled days.`,
  expenseShare: (value) => `The suggested trip value is $${Number(value).toFixed(2)}.`,
  worksiteVerified: (value) => value ? "Both coworkers belong to the same verified worksite group." : "Worksite verification is incomplete.",
  quietRidePreference: (value) => value ? "Both coworkers selected a quiet-ride preference." : "Ride-style preferences were not used.",
};

export function fallbackExplanation(reasonCodes, facts) {
  const bullets = Object.entries(facts).slice(0, 4).map(([key, value]) => FACT_LABELS[key]?.(value)).filter(Boolean);
  return {
    source: "deterministic-fallback",
    model: null,
    explanation: {
      headline: "A strong, explainable fit",
      summary: "The option passed the commute constraints and ranks well on schedule overlap and added detour.",
      bullets,
      caveat: "This is a coordination suggestion. Both coworkers decide, and transportation is not guaranteed.",
      factIdsUsed: reasonCodes,
    },
  };
}

export function fallbackSiteBrief(projection) {
  const { metrics } = projection;
  const recoveryRate = metrics.recoveryAttempts > 0
    ? Math.round(metrics.successfulRecoveries / metrics.recoveryAttempts * 100)
    : 0;
  return {
    source: "fallback",
    model: null,
    recommendation: `Keep the pilot focused on the shifts producing the most protected commutes. Recovery is ${recoveryRate}% across ${metrics.recoveryAttempts} aggregate attempts; recruit additional opted-in backup drivers before expanding ride credits.`,
    factIds: ["protectedShifts", "successfulRecoveries", "recoveryAttempts", "monthlySubsidyBudget"],
  };
}
