export type AppEnvironment = "development" | "staging" | "production" | "test";

export interface ApiConfig {
  environment: AppEnvironment;
  host: string;
  port: number;
  release: string;
  exposeDocumentation: boolean;
  referralCodePepper: string | null;
  firebase: {
    apiKey: string | null;
    authDomain: string | null;
    projectId: string | null;
    appId: string | null;
  };
}
function environment(value: string | undefined): AppEnvironment {
  if (value === "production" || value === "staging" || value === "test") return value;
  return "development";
}

function port(value: string | undefined): number {
  const parsed = Number(value ?? 4100);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  return parsed;
}

export function loadApiConfig(source: NodeJS.ProcessEnv = process.env): ApiConfig {
  const appEnvironment = environment(source.APP_ENV ?? source.NODE_ENV);
  return {
    environment: appEnvironment,
    host: source.HOST?.trim() || "0.0.0.0",
    port: port(source.PORT),
    release: source.K_REVISION?.trim() || source.RELEASE_SHA?.trim() || "local",
    exposeDocumentation: appEnvironment !== "production" || source.EXPOSE_API_DOCS === "true",
    referralCodePepper: source.REFERRAL_CODE_PEPPER?.trim() || null,
    firebase: {
      apiKey: source.FIREBASE_WEB_API_KEY?.trim() || null,
      authDomain: source.FIREBASE_AUTH_DOMAIN?.trim() || null,
      projectId: source.GOOGLE_CLOUD_PROJECT?.trim() || source.FIREBASE_PROJECT_ID?.trim() || null,
      appId: source.FIREBASE_WEB_APP_ID?.trim() || null,
    },
  };
}
