import fs from "node:fs";

const required = [
  "EXPO_PUBLIC_API_BASE_URL",
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID",
  "G2W_UPLOAD_STORE_FILE",
  "G2W_UPLOAD_STORE_PASSWORD",
  "G2W_UPLOAD_KEY_ALIAS",
  "G2W_UPLOAD_KEY_PASSWORD",
];

const failures = required.filter((name) => !process.env[name]?.trim()).map((name) => `Missing ${name}`);
const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? "";
if (apiUrl && !apiUrl.startsWith("https://")) failures.push("EXPO_PUBLIC_API_BASE_URL must use HTTPS");
if (process.env.EXPO_PUBLIC_DEMO_MODE !== "false") failures.push("EXPO_PUBLIC_DEMO_MODE must be false for an adoption build");
const storeFile = process.env.G2W_UPLOAD_STORE_FILE?.trim();
if (storeFile && !fs.existsSync(storeFile)) failures.push(`Signing keystore does not exist: ${storeFile}`);

if (failures.length) {
  console.error("Galaxy release check failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Galaxy release environment and signing configuration are present.");
