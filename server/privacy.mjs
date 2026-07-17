const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE = /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/;
const COORDINATES = /\b-?\d{1,3}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}\b/;
const STREET_LOCATION = /\b(?:\d{1,6}\s+)?(?:[A-Z0-9.'-]+\s+){0,4}[A-Z0-9.'-]+\s(?:STREET|ST|AVENUE|AVE|ROAD|RD|BOULEVARD|BLVD|LANE|LN|DRIVE|DR|COURT|CT)\b/i;
const CROSS_STREET = /\b[A-Z][A-Z0-9.'-]*(?:\s+[A-Z0-9.'-]+){0,3}\s*&\s*[A-Z0-9.'-]+(?:\s+[A-Z0-9.'-]+){0,3}\b/i;
const ZIP_CODE = /\b\d{5}(?:-\d{4})?\b/;
const SCHEDULE_DAYS = new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
const SCHEDULE_TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export class PrivacyInputError extends Error {
  constructor(message, code = "SENSITIVE_INPUT") {
    super(message);
    this.name = "PrivacyInputError";
    this.code = code;
  }
}

export function assertScheduleTextIsSafe(value) {
  if (typeof value !== "string") {
    throw new PrivacyInputError("Schedule text must be a string.", "INVALID_INPUT");
  }

  const text = value.replace(/\s+/g, " ").trim();
  if (text.length < 3 || text.length > 500) {
    throw new PrivacyInputError("Schedule text must be between 3 and 500 characters.", "INVALID_LENGTH");
  }

  const rejected = [EMAIL, PHONE, COORDINATES, STREET_LOCATION, CROSS_STREET, ZIP_CODE].some((pattern) => pattern.test(text));
  if (rejected) {
    throw new PrivacyInputError(
      "Remove email, phone, ZIP code, street address, or coordinates before using the schedule agent."
    );
  }

  return text;
}

export function sanitizeScheduleProjectionForOpenAI(value) {
  const shifts = Array.isArray(value) ? value : value?.shifts;
  if (!Array.isArray(shifts) || shifts.length === 0 || shifts.length > 14) {
    throw new PrivacyInputError("Schedule projection must contain between 1 and 14 shifts.", "INVALID_SCHEDULE_PROJECTION");
  }

  const safeShifts = shifts.map((raw) => {
    if (!raw || typeof raw !== "object") {
      throw new PrivacyInputError("Each projected shift must be an object.", "INVALID_SCHEDULE_PROJECTION");
    }

    const day = raw.day;
    const startTime = raw.startTime;
    const endTime = raw.endTime;
    if (
      typeof day !== "string"
      || typeof startTime !== "string"
      || typeof endTime !== "string"
      || !SCHEDULE_DAYS.has(day)
      || !SCHEDULE_TIME.test(startTime)
      || !SCHEDULE_TIME.test(endTime)
    ) {
      throw new PrivacyInputError("Projected shifts may contain only a weekday and 24-hour start/end times.", "INVALID_SCHEDULE_PROJECTION");
    }

    return { day, startTime, endTime };
  });

  return {
    schemaVersion: 1,
    workplaceReference: "verified_workplace",
    timezoneContext: "local_workplace_time",
    shifts: safeShifts,
  };
}

const ALLOWED_FACTS = new Set([
  "arrivalOverlapMinutes",
  "departureOverlapMinutes",
  "driverDetourMinutes",
  "detourMiles",
  "recurringDays",
  "expenseShare",
  "worksiteVerified",
  "quietRidePreference",
]);

const FACT_RULES = {
  arrivalOverlapMinutes: { minimum: 0, maximum: 180, integer: true },
  departureOverlapMinutes: { minimum: 0, maximum: 180, integer: true },
  driverDetourMinutes: { minimum: 0, maximum: 120, integer: true },
  detourMiles: { minimum: 0, maximum: 100 },
  recurringDays: { minimum: 0, maximum: 7, integer: true },
  expenseShare: { minimum: 0, maximum: 1000 },
};

export function sanitizeMatchFacts(reasonCodes, facts) {
  if (!Array.isArray(reasonCodes) || reasonCodes.length === 0 || reasonCodes.length > 10) {
    throw new PrivacyInputError("At least one match reason is required.", "INVALID_REASON_CODES");
  }

  const safeCodes = reasonCodes.map((code) => {
    if (typeof code !== "string" || !/^[A-Z][A-Z0-9_]{2,40}$/.test(code)) {
      throw new PrivacyInputError("Match reason codes must use safe uppercase identifiers.", "INVALID_REASON_CODE");
    }
    return code;
  });

  if (!facts || typeof facts !== "object") {
    throw new PrivacyInputError("Match facts must be an object.", "INVALID_FACTS");
  }

  const safeFacts = {};
  const candidateFacts = Array.isArray(facts) ? deriveFactsFromDisplayFacts(safeCodes, facts) : facts;
  for (const [key, value] of Object.entries(candidateFacts)) {
    if (!ALLOWED_FACTS.has(key)) continue;
    if (typeof value !== "number" && typeof value !== "boolean") {
      throw new PrivacyInputError(`Match fact ${key} must be numeric or boolean.`, "INVALID_FACT_VALUE");
    }
    if (typeof value === "number") {
      const rule = FACT_RULES[key];
      if (!Number.isFinite(value) || !rule || value < rule.minimum || value > rule.maximum || rule.integer && !Number.isInteger(value)) {
        throw new PrivacyInputError(`Match fact ${key} is outside the allowed range.`, "INVALID_FACT_VALUE");
      }
    }
    safeFacts[key] = value;
  }

  if (Object.keys(safeFacts).length === 0) {
    throw new PrivacyInputError("No display-safe match facts were provided.", "EMPTY_FACTS");
  }

  assertReasonCodeConsistency(safeCodes, safeFacts);

  return { reasonCodes: safeCodes, facts: safeFacts };
}

function assertReasonCodeConsistency(reasonCodes, facts) {
  const requirements = [];
  for (const code of reasonCodes) {
    if (code === "SAME_WORKSITE") requirements.push(["worksiteVerified", true]);
    const arrival = code.match(/^ARRIVAL_OVERLAP_(\d+)M$/);
    if (arrival) requirements.push(["arrivalOverlapMinutes", Number(arrival[1])]);
    const departure = code.match(/^DEPARTURE_OVERLAP_(\d+)M$/);
    if (departure) requirements.push(["departureOverlapMinutes", Number(departure[1])]);
    const detour = code.match(/^DETOUR_(\d+)M$/);
    if (detour) requirements.push(["driverDetourMinutes", Number(detour[1])]);
    const recurring = code.match(/^RECURRING_(\d+)_DAYS$/);
    if (recurring) requirements.push(["recurringDays", Number(recurring[1])]);
  }
  for (const [key, expected] of requirements) {
    if (facts[key] !== expected) {
      throw new PrivacyInputError(`Reason code does not match fact ${key}.`, "CONTRADICTORY_FACTS");
    }
  }
}

function numericValue(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return undefined;
  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

function deriveFactsFromDisplayFacts(reasonCodes, displayFacts) {
  const derived = {};
  for (const code of reasonCodes) {
    if (code === "SAME_WORKSITE") derived.worksiteVerified = true;
    const overlap = code.match(/^ARRIVAL_OVERLAP_(\d+)M$/);
    if (overlap) derived.arrivalOverlapMinutes = Number(overlap[1]);
    const departure = code.match(/^DEPARTURE_OVERLAP_(\d+)M$/);
    if (departure) derived.departureOverlapMinutes = Number(departure[1]);
    const detour = code.match(/^DETOUR_(\d+)M$/);
    if (detour) derived.driverDetourMinutes = Number(detour[1]);
    const recurring = code.match(/^RECURRING_(\d+)_DAYS$/);
    if (recurring) derived.recurringDays = Number(recurring[1]);
  }

  for (const raw of displayFacts) {
    if (!raw || typeof raw !== "object") continue;
    const id = typeof raw.id === "string" ? raw.id.toLowerCase() : "";
    const label = typeof raw.label === "string" ? raw.label.toLowerCase() : "";
    const value = raw.value;
    if (containsForbiddenLocationLikeData(value ?? "")) {
      throw new PrivacyInputError("Location or contact data is not allowed in AI match facts.");
    }
    const number = numericValue(value);
    if ((id === "cost" || label.includes("expense")) && number !== undefined) derived.expenseShare = number;
    if ((id === "time" || label.includes("schedule")) && number !== undefined && derived.arrivalOverlapMinutes === undefined) {
      derived.arrivalOverlapMinutes = number;
    }
    if ((id === "route" || label.includes("route")) && number !== undefined && derived.driverDetourMinutes === undefined) {
      derived.driverDetourMinutes = number;
    }
  }
  return derived;
}

export function containsForbiddenLocationLikeData(value) {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  return [EMAIL, PHONE, COORDINATES, STREET_LOCATION, CROSS_STREET, ZIP_CODE].some((pattern) => pattern.test(serialized));
}
