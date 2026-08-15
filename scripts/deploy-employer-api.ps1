[CmdletBinding(SupportsShouldProcess, ConfirmImpact = "High")]
param(
  [Parameter(Mandatory)][ValidatePattern('^[a-z][a-z0-9-]{4,28}[a-z0-9]$')][string]$ProjectId,
  [Parameter(Mandatory)][ValidatePattern('^[a-z]+-[a-z]+[0-9]+$')][string]$Region,
  [string]$ServiceName = "got2get2work-admin-api",
  [string]$Repository = "got2get2work",
  [Parameter(Mandatory)][ValidatePattern('^[a-z][a-z0-9-]+@[a-z][a-z0-9-]+\.iam\.gserviceaccount\.com$')][string]$RuntimeServiceAccount,
  [Parameter(Mandatory)][ValidatePattern('^[A-Za-z0-9._-]+$')][string]$ImageTag,
  [Parameter(Mandatory)][ValidatePattern('^https://')][string]$AllowedOrigin,
  [string]$ReferralPepperSecret = "referral-code-pepper",
  [string]$VehicleVaultKeySecret = "vehicle-vault-key"
)

$ErrorActionPreference = "Stop"
$image = "$Region-docker.pkg.dev/$ProjectId/$Repository/${ServiceName}:$ImageTag"

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) { throw "gcloud CLI is required." }

if ($PSCmdlet.ShouldProcess($image, "Build and publish API container")) {
  & gcloud builds submit . --project $ProjectId --config cloudbuild.admin-api.yaml --substitutions "_IMAGE=$image" --quiet
  if ($LASTEXITCODE -ne 0) { throw "Cloud Build failed with exit code $LASTEXITCODE." }
}

if ($PSCmdlet.ShouldProcess($ServiceName, "Deploy API revision without changing IAM policy")) {
  & gcloud run deploy $ServiceName --project $ProjectId --region $Region --platform managed --image $image --service-account $RuntimeServiceAccount --set-env-vars "APP_ENV=production,GOOGLE_CLOUD_PROJECT=$ProjectId,ALLOWED_ORIGINS=$AllowedOrigin" --set-secrets "REFERRAL_CODE_PEPPER=${ReferralPepperSecret}:latest,VEHICLE_VAULT_KEY=${VehicleVaultKeySecret}:latest" --quiet
  if ($LASTEXITCODE -ne 0) { throw "Cloud Run deployment failed with exit code $LASTEXITCODE." }
}

Write-Host "Deployment command completed. Verify /health/live and /health/ready before directing web traffic."
