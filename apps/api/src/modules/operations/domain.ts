export type ModerationCaseStatus = "open" | "assigned" | "actioned" | "closed";
export interface ModerationCaseRecord { id:string; tenantId:string; worksiteId:string; category:string; subjectUid:string|null; reporterUid:string; narrative:string; status:ModerationCaseStatus; assignedTo:string|null; createdAt:Date; updatedAt:Date }
export interface ModerationAuditRecord { id:string; caseId:string; tenantId:string; actorUid:string; action:string; reason:string; occurredAt:Date }
export interface DataRequestRecord { id:string; uid:string; tenantId:string; type:"export"|"deletion"; status:"queued"; requestedAt:Date }
export class OperationsError extends Error { constructor(message:string,readonly code:string,readonly statusCode:number){super(message);this.name="OperationsError";} }
