export interface IncentiveRecord { id:string;tenantId:string;worksiteId:string;actorUid:string;amountCents:number;reason:string;createdAt:Date }
export interface ReportingStore { countCompletions(tenantId:string,from:Date,through:Date):Promise<{responses:number;shiftsProtected:number}>; recordIncentive(v:IncentiveRecord):Promise<void>; }
