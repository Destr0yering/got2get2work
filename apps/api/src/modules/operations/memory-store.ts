import type { DataRequestRecord, ModerationAuditRecord, ModerationCaseRecord } from "./domain";
import { OperationsError } from "./domain";
import type { CaseTransition, OperationsStore } from "./ports";
export class MemoryOperationsStore implements OperationsStore {
  cases=new Map<string,ModerationCaseRecord>(); audits:ModerationAuditRecord[]=[]; requests:DataRequestRecord[]=[];
  /** Tenant-qualified safety restriction records, mirroring the Firestore transaction side effect. */
  restrictions=new Map<string,Date>();
  async createCase(v:ModerationCaseRecord){this.cases.set(v.id,structuredClone(v));}
  async listCases(t:string,l:number){return [...this.cases.values()].filter(v=>v.tenantId===t).sort((a,b)=>b.createdAt.getTime()-a.createdAt.getTime()).slice(0,l).map(v=>structuredClone(v));}
  async getCase(id:string){const v=this.cases.get(id);return v?structuredClone(v):null;}
  async transitionCase(x:CaseTransition){const current=this.cases.get(x.next.id);if(!current||current.tenantId!==x.next.tenantId)throw new OperationsError("Moderation case not found.","CASE_NOT_FOUND",404);if(current.version!==x.expectedVersion||!x.expectedStatuses.includes(current.status)||(x.expectedAssignee!=="any"&&current.assignedTo!==x.expectedAssignee))throw new OperationsError("The moderation case changed; refresh before retrying.","CASE_CONFLICT",409);this.cases.set(x.next.id,structuredClone(x.next));this.audits.push(structuredClone(x.audit));if(x.restriction)this.restrictions.set(`${x.next.tenantId}:${x.restriction.uid}`,x.restriction.through);}
  async createOrGetDataRequest(v:DataRequestRecord){const old=this.requests.find(x=>x.id===v.id);if(old)return structuredClone(old);this.requests.push(structuredClone(v));return structuredClone(v);}
  async listDataRequests(uid:string){return this.requests.filter(v=>v.uid===uid).map(v=>structuredClone(v));}
}
