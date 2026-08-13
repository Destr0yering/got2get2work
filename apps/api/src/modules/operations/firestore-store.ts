import type { Firestore } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import type { DataRequestRecord, ModerationCaseRecord } from "./domain";
import { OperationsError } from "./domain";
import type { CaseTransition, OperationsStore } from "./ports";
const caseFrom=(d:FirebaseFirestore.QueryDocumentSnapshot|FirebaseFirestore.DocumentSnapshot)=>({...d.data(),id:d.id,version:d.data()!.version??0,createdAt:d.data()!.createdAt.toDate(),updatedAt:d.data()!.updatedAt.toDate()})as ModerationCaseRecord;
const requestFrom=(d:FirebaseFirestore.QueryDocumentSnapshot|FirebaseFirestore.DocumentSnapshot)=>({...d.data(),id:d.id,requestedAt:d.data()!.requestedAt.toDate()})as DataRequestRecord;
export class FirestoreOperationsStore implements OperationsStore {
  constructor(private readonly db:Firestore){}
  async createCase(v:ModerationCaseRecord){const ref=this.db.collection("moderationCases").doc(v.id);await this.db.runTransaction(async tx=>{if(!(await tx.get(ref)).exists)tx.create(ref,{...v,createdAt:Timestamp.fromDate(v.createdAt),updatedAt:Timestamp.fromDate(v.updatedAt)});});}
  async listCases(t:string,l:number){const s=await this.db.collection("moderationCases").where("tenantId","==",t).orderBy("createdAt","desc").limit(l).get();return s.docs.map(caseFrom);}
  async getCase(id:string){const d=await this.db.collection("moderationCases").doc(id).get();return d.exists?caseFrom(d):null;}
  async transitionCase(x:CaseTransition){const ref=this.db.collection("moderationCases").doc(x.next.id);await this.db.runTransaction(async tx=>{const snap=await tx.get(ref);if(!snap.exists||snap.data()!.tenantId!==x.next.tenantId)throw new OperationsError("Moderation case not found.","CASE_NOT_FOUND",404);const current=caseFrom(snap);if(current.version!==x.expectedVersion||!x.expectedStatuses.includes(current.status)||(x.expectedAssignee!=="any"&&current.assignedTo!==x.expectedAssignee))throw new OperationsError("The moderation case changed; refresh before retrying.","CASE_CONFLICT",409);tx.set(ref,{...x.next,createdAt:Timestamp.fromDate(x.next.createdAt),updatedAt:Timestamp.fromDate(x.next.updatedAt)});tx.create(this.db.collection("moderationAudit").doc(x.audit.id),{...x.audit,occurredAt:Timestamp.fromDate(x.audit.occurredAt)});if(x.restriction)tx.set(this.db.collection("matchingRestrictions").doc(`${x.next.tenantId}_user_${x.restriction.uid}`),{tenantId:x.next.tenantId,subjectUid:x.restriction.uid,safetyRestricted:true,restrictionThrough:Timestamp.fromDate(x.restriction.through),createdAt:Timestamp.fromDate(x.restriction.createdAt)});});}
  async createOrGetDataRequest(v:DataRequestRecord){const ref=this.db.collection("dataRequests").doc(v.id);return this.db.runTransaction(async tx=>{const old=await tx.get(ref);if(old.exists)return requestFrom(old);tx.create(ref,{...v,requestedAt:Timestamp.fromDate(v.requestedAt)});return v;});}
  async listDataRequests(uid:string){const s=await this.db.collection("dataRequests").where("uid","==",uid).orderBy("requestedAt","desc").limit(20).get();return s.docs.map(requestFrom);}
}
