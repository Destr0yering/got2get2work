import type { CommuteProfileBody, RecurringShiftInput } from "../../../../../packages/contracts/src";

export interface CommuteProfileRecord extends CommuteProfileBody { uid: string; tenantId: string; worksiteId: string; updatedAt: Date }
export interface ShiftRecord extends RecurringShiftInput { id: string; uid: string; tenantId: string; worksiteId: string; source: "manual" | "ics"; status: "candidate" | "confirmed"; updatedAt: Date }
export class CommuteError extends Error {
  constructor(message: string, readonly code: string, readonly statusCode: number) { super(message); this.name = "CommuteError"; }
}
