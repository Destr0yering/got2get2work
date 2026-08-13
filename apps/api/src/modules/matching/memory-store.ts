import type { MatchRunRecord } from "./domain"; import type { MatchingStore } from "./ports";
const pair = (a: string, b: string) => [a, b].sort().join("_");
export class MemoryMatchingStore implements MatchingStore {
  readonly restrictions=new Set<string>(); readonly userRestrictions=new Map<string,Date>(); readonly runs:MatchRunRecord[]=[];
  restrict(a:string,b:string,tenantId=""){this.restrictions.add(`${tenantId}:${pair(a,b)}`);}
  async isRestricted(tenantId:string,a:string,b:string){return this.restrictions.has(`${tenantId}:${pair(a,b)}`)||this.restrictions.has(`:${pair(a,b)}`)||[a,b].some(uid=>(this.userRestrictions.get(`${tenantId}:${uid}`)?.getTime()??0)>Date.now());}
  async block(tenantId:string,a:string,b:string,now:Date){this.restrict(a,b,tenantId);return{id:pair(a,b),createdAt:now};}
  async restrictUser(tenantId:string,uid:string,through:Date,_now?:Date){this.userRestrictions.set(`${tenantId}:${uid}`,through);}
  async saveRun(run:MatchRunRecord){this.runs.push(structuredClone(run));}
  async getRun(id:string){const run=this.runs.find(v=>v.id===id);return run?structuredClone(run):null;}
}
