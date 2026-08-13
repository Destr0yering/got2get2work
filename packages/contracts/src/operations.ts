import { Type, type Static } from "@sinclair/typebox";

const CaseStatusSchema = Type.Union([Type.Literal("open"), Type.Literal("assigned"), Type.Literal("actioned"), Type.Literal("closed")]);
export const ModerationCaseSchema = Type.Object({ id: Type.String(), category: Type.String(), status: CaseStatusSchema, subjectUserId: Type.Union([Type.String(), Type.Null()]), assignedTo: Type.Union([Type.String(), Type.Null()]), createdAt: Type.String({ format: "date-time" }), updatedAt: Type.String({ format: "date-time" }) }, { additionalProperties: false });
export const ModerationCaseListSchema = Type.Object({ cases: Type.Array(ModerationCaseSchema, { maxItems: 100 }) }, { additionalProperties: false });
export const ModerationAssignmentBodySchema = Type.Object({ reason: Type.String({ minLength: 3, maxLength: 500 }) }, { additionalProperties: false });
export const ModerationDecisionBodySchema = Type.Object({ action: Type.Union([Type.Literal("no_action"), Type.Literal("temporary_restriction"), Type.Literal("close")]), reason: Type.String({ minLength: 3, maxLength: 1000 }), restrictionThrough: Type.Optional(Type.String({ format: "date-time" })) }, { additionalProperties: false });
export const ModerationDecisionReceiptSchema = Type.Object({ caseId: Type.String(), status: Type.Union([Type.Literal("actioned"), Type.Literal("closed")]), action: Type.String(), decidedAt: Type.String({ format: "date-time" }) }, { additionalProperties: false });
const DataRequestTypeSchema = Type.Union([Type.Literal("export"), Type.Literal("deletion")]);
export const DataRequestSchema = Type.Object({ id: Type.String(), type: DataRequestTypeSchema, status: Type.Literal("queued"), requestedAt: Type.String({ format: "date-time" }), retentionNotice: Type.String() }, { additionalProperties: false });
export const DataRequestListSchema = Type.Object({ requests: Type.Array(DataRequestSchema, { maxItems: 20 }) }, { additionalProperties: false });
export const DeletionRequestBodySchema = Type.Object({ confirmation: Type.Literal("DELETE") }, { additionalProperties: false });
export type ModerationDecisionBody = Static<typeof ModerationDecisionBodySchema>;
export type DataRequestType = Static<typeof DataRequestTypeSchema>;
