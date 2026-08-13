import type { Firestore } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import type { CompletionRecord, MessageRecord, NotificationRecord, PickupStateRecord, ProximityRecord, RatingRecord, SafetyReportRecord } from "./domain";
import type { TripStore } from "./ports";
export class FirestoreTripStore implements TripStore {
  constructor(private readonly db:Firestore){}
  async listMessages(id:string,limit:number){const s=await this.db.collection("tripMessages").where("tripId","==",id).orderBy("sentAt","asc").limitToLast(limit).get();return s.docs.map(d=>({...d.data(),id:d.id,sentAt:d.data().sentAt.toDate()})as MessageRecord);}
  async saveMessage(v:MessageRecord,n:NotificationRecord){await this.db.runTransaction(async tx=>{tx.create(this.db.collection("tripMessages").doc(v.id),{...v,sentAt:Timestamp.fromDate(v.sentAt)});tx.create(this.db.collection("notificationOutbox").doc(n.id),{...n,createdAt:Timestamp.fromDate(n.createdAt),payload:{type:n.type,resourceId:n.resourceId}});});return v;}
  async getPickupState(id:string){const s=await this.db.collection("tripPickupStates").doc(id).get();return s.exists?{...s.data(),tripId:id,updatedAt:s.data()!.updatedAt.toDate()}as PickupStateRecord:null;}
  async savePickupState(v:PickupStateRecord){await this.db.collection("tripPickupStates").doc(v.tripId).set({...v,updatedAt:Timestamp.fromDate(v.updatedAt)});return v;}
  async getProximity(id:string){const s=await this.db.collection("tripProximity").doc(id).get();return s.exists?{...s.data(),tripId:id,updatedAt:s.data()!.updatedAt.toDate(),expiresAt:s.data()!.expiresAt.toDate()}as ProximityRecord:null;}
  async saveProximity(v:ProximityRecord){await this.db.collection("tripProximity").doc(v.tripId).set({...v,updatedAt:Timestamp.fromDate(v.updatedAt),expiresAt:Timestamp.fromDate(v.expiresAt)});return v;}
  async deleteProximity(id:string){await this.db.collection("tripProximity").doc(id).delete();}
  async saveCompletion(v:CompletionRecord){const r=this.db.collection("tripCompletions").doc(v.id);await this.db.runTransaction(async tx=>{if(!(await tx.get(r)).exists)tx.create(r,{...v,recordedAt:Timestamp.fromDate(v.recordedAt)});});return v;}
  async getCompletion(id:string,uid:string){const s=await this.db.collection("tripCompletions").doc(`${id}_${uid}`).get();return s.exists?{...s.data(),id:s.id,recordedAt:s.data()!.recordedAt.toDate()}as CompletionRecord:null;}
  async saveRating(v:RatingRecord){const r=this.db.collection("privateRatings").doc(v.id);await this.db.runTransaction(async tx=>{if(!(await tx.get(r)).exists)tx.create(r,{...v,recordedAt:Timestamp.fromDate(v.recordedAt)});});return v;}
  async saveSafetyReport(v:SafetyReportRecord){const report=this.db.collection("safetyReports").doc(v.id),moderationCase=this.db.collection("moderationCases").doc(v.id);await this.db.runTransaction(async tx=>{tx.create(report,{...v,createdAt:Timestamp.fromDate(v.createdAt)});tx.create(moderationCase,{id:v.id,tenantId:v.tenantId,worksiteId:v.worksiteId,category:v.category,subjectUid:v.subjectUid,reporterUid:v.reporterUid,narrative:v.narrative,status:"open",assignedTo:null,createdAt:Timestamp.fromDate(v.createdAt),updatedAt:Timestamp.fromDate(v.createdAt)});});return v;}
}
