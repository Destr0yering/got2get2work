import { Type, type Static } from "@sinclair/typebox";

export const CommuteRoleSchema = Type.Union([Type.Literal("captain"), Type.Literal("crew"), Type.Literal("either"), Type.Literal("none")]);
export const CommuteProfileBodySchema = Type.Object({
  displayName: Type.String({ minLength: 1, maxLength: 80 }),
  toWorkRole: CommuteRoleSchema,
  homeRole: CommuteRoleSchema,
  maximumDetourMinutes: Type.Integer({ minimum: 0, maximum: 60 }),
  seatsAvailable: Type.Integer({ minimum: 0, maximum: 8 }),
  accessibilityNotes: Type.Optional(Type.String({ maxLength: 500 })),
  notificationsEnabled: Type.Boolean(),
}, { additionalProperties: false });
export const CommuteProfileSchema = Type.Intersect([CommuteProfileBodySchema, Type.Object({
  updatedAt: Type.String({ format: "date-time" }),
})]);

export const WeekdaySchema = Type.Union(["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day) => Type.Literal(day)));
export const RecurringShiftInputSchema = Type.Object({
  weekdays: Type.Array(WeekdaySchema, { minItems: 1, maxItems: 7, uniqueItems: true }),
  arrivalTime: Type.String({ pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$" }),
  departureTime: Type.String({ pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$" }),
  timeZone: Type.String({ minLength: 1, maxLength: 80 }),
  effectiveFrom: Type.String({ format: "date" }),
  effectiveThrough: Type.Optional(Type.String({ format: "date" })),
}, { additionalProperties: false });
export const RecurringShiftSchema = Type.Intersect([RecurringShiftInputSchema, Type.Object({
  id: Type.String(), source: Type.Union([Type.Literal("manual"), Type.Literal("ics")]), status: Type.Union([Type.Literal("candidate"), Type.Literal("confirmed")]), updatedAt: Type.String({ format: "date-time" }),
})]);
export const ShiftListSchema = Type.Object({ shifts: Type.Array(RecurringShiftSchema, { maxItems: 100 }) });
export const IcsImportBodySchema = Type.Object({ ics: Type.String({ minLength: 1, maxLength: 15000 }) }, { additionalProperties: false });

export type CommuteProfileBody = Static<typeof CommuteProfileBodySchema>;
export type CommuteProfile = Static<typeof CommuteProfileSchema>;
export type RecurringShiftInput = Static<typeof RecurringShiftInputSchema>;
export type RecurringShift = Static<typeof RecurringShiftSchema>;
