param(
  [string]$Project = "got2get2work-xprize-cloud",
  [string]$Region = "us-east1",
  [string]$Service = "got2get2work",
  [string]$AllowedOrigin = "https://got2get2work-457279090184.us-east1.run.app"
)

$ErrorActionPreference = "Stop"

gcloud run deploy $Service `
  --source . `
  --project $Project `
  --region $Region `
  --platform managed `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 1 `
  --concurrency 40 `
  --remove-secrets "GEMINI_API_KEY" `
  --set-env-vars "GOOGLE_GENAI_USE_VERTEXAI=true,GOOGLE_CLOUD_PROJECT=$Project,GOOGLE_CLOUD_LOCATION=global,GEMINI_MODEL=gemini-3.1-flash-lite,NODE_ENV=production,ALLOWED_ORIGIN=$AllowedOrigin,AGENT_RATE_LIMIT=20,AGENT_RATE_WINDOW_MS=60000,PROVIDER_TIMEOUT_MS=10000" `
  --quiet
