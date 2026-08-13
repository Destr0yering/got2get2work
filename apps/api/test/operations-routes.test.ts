import assert from "node:assert/strict";
import test from "node:test";
import { buildApi } from "../src/app";
import type { ApiConfig } from "../src/config";
import { MemoryMembershipStore } from "../src/modules/membership/memory-store";
import type { FirebaseTokenVerifier } from "../src/modules/membership/ports";
import { MembershipService } from "../src/modules/membership/service";
import { MemoryOperationsStore } from "../src/modules/operations/memory-store";
import { OperationsService } from "../src/modules/operations/service";
const config:ApiConfig={environment:"test",host:"127.0.0.1",port:4100,release:"test",exposeDocumentation:false,referralCodePepper:"test-referral-pepper-value",firebase:{apiKey:null,authDomain:null,projectId:"test",appId:null}};
async function fixture(claims:Record<string,unknown>){const memberships=new MemoryMembershipStore();memberships.memberships.set("mod",{id:"mod",uid:"mod",email:"mod@test.invalid",tenantId:"tenant",worksiteId:"site",role:"moderator",status:"active",referralCodeId:"seed",submittedAt:new Date()});const verifier:FirebaseTokenVerifier={verifyIdToken:async()=>({uid:"mod",email:"mod@test.invalid",email_verified:true,...claims})};const service=new MembershipService({store:memberships,referralPepper:config.referralCodePepper!});const operations=new OperationsService(new MemoryOperationsStore());return buildApi({config,logger:false,operations:{verifier,memberships:service,operations}});}
test("moderation routes require MFA and recent authentication",async()=>{for(const [claims,code] of [[{auth_time:Math.floor(Date.now()/1000)},"MFA_REQUIRED"],[{auth_time:Math.floor(Date.now()/1000)-3600,mfa:true},"RECENT_AUTH_REQUIRED"]] as const){const app=await fixture(claims);try{const response=await app.inject({method:"GET",url:"/v1/moderation/cases",headers:{authorization:"Bearer token"}});assert.equal(response.json().error.code,code);}finally{await app.close();}}const app=await fixture({auth_time:Math.floor(Date.now()/1000),amr:["mfa"]});try{assert.equal((await app.inject({method:"GET",url:"/v1/moderation/cases",headers:{authorization:"Bearer token"}})).statusCode,200);}finally{await app.close();}});
