const apply = process.argv.includes("--apply");
const projectId = process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT;
const token = process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
if (!projectId || projectId.startsWith("demo-")) throw new Error("Set GOOGLE_CLOUD_PROJECT to the explicitly verified non-demo target.");
if (!token) throw new Error("Set GOOGLE_OAUTH_ACCESS_TOKEN to a short-lived gcloud access token.");
if (apply && process.env.APPLY_MODERATION_MIGRATION !== "true") throw new Error("Applying requires APPLY_MODERATION_MIGRATION=true.");

type FirestoreDocument = { name: string; fields?: Record<string, unknown> };
const base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents`;
const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };
async function request(url: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, headers: { ...headers, ...init.headers } });
  if (!response.ok) throw new Error(`Firestore request failed (${response.status} ${response.statusText}).`);
  return response.status === 204 ? null : response.json();
}
async function listCases() {
  const documents: FirestoreDocument[] = []; let pageToken = "";
  do {
    const url = `${base}/moderationCases?pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
    const page = await request(url) as { documents?: FirestoreDocument[]; nextPageToken?: string };
    documents.push(...(page.documents ?? [])); pageToken = page.nextPageToken ?? "";
  } while (pageToken);
  return documents;
}
async function evidenceExists(id: string) {
  const response = await fetch(`${base}/safetyReports/${encodeURIComponent(id)}`, { headers });
  if (response.status === 404) return false;
  if (!response.ok) throw new Error(`Safety evidence lookup failed (${response.status} ${response.statusText}).`);
  return true;
}

async function main() {
  const cases = await listCases();
  let sensitive = 0, missingVersion = 0, missingEvidence = 0, changed = 0;
  const eligible: Array<{ doc: FirestoreDocument; removeSensitive: boolean; backfillVersion: boolean }> = [];
  for (const doc of cases) {
    const fields = doc.fields ?? {}, removeSensitive = "narrative" in fields || "reporterUid" in fields, backfillVersion = !("version" in fields);
    if (removeSensitive) {
      sensitive++;
      const id = doc.name.slice(doc.name.lastIndexOf("/") + 1);
      if (!(await evidenceExists(id))) { missingEvidence++; continue; }
    }
    if (backfillVersion) missingVersion++;
    if (removeSensitive || backfillVersion) eligible.push({ doc, removeSensitive, backfillVersion });
  }
  if (apply && missingEvidence) throw new Error(`Refusing migration: ${missingEvidence} case(s) lack authoritative safetyReports evidence.`);
  if (apply) for (const item of eligible) {
    const existingVersion = item.doc.fields?.version ?? { integerValue: "0" };
    const paths = [...(item.removeSensitive ? ["narrative", "reporterUid"] : []), ...(item.backfillVersion ? ["version"] : [])];
    const query = paths.map(path => `updateMask.fieldPaths=${encodeURIComponent(path)}`).join("&");
    await request(`https://firestore.googleapis.com/v1/${item.doc.name}?${query}`, { method: "PATCH", body: JSON.stringify({ name: item.doc.name, fields: { version: existingVersion } }) });
    changed++;
  }
  console.log(JSON.stringify({ projectId, mode: apply ? "apply" : "dry-run", scanned: cases.length, sensitiveFieldsFound: sensitive, missingVersion, missingEvidence, eligible: eligible.length, changed }, null, 2));
}
void main().catch(error => { console.error(error instanceof Error ? error.message : "Migration failed."); process.exitCode = 1; });
