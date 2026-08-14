[CmdletBinding(SupportsShouldProcess, ConfirmImpact = "High")]
param(
  [Parameter(Mandatory)][ValidatePattern('^[a-z][a-z0-9-]{4,28}[a-z0-9]$')][string]$ProjectId,
  [Parameter(Mandatory)][ValidatePattern('^[a-z]+-[a-z]+[0-9]+$')][string]$Region,
  [string]$ServiceName = "got2get2work-admin-api",
  [Parameter(Mandatory)][ValidatePattern('^[a-z][a-z0-9-]+-[0-9a-z]+$')][string]$Revision
)

$ErrorActionPreference = "Stop"
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) { throw "gcloud CLI is required." }

if ($PSCmdlet.ShouldProcess($ServiceName, "Route 100% of traffic to revision $Revision")) {
  & gcloud run services update-traffic $ServiceName --project $ProjectId --region $Region --platform managed --to-revisions "${Revision}=100" --quiet
  if ($LASTEXITCODE -ne 0) { throw "Cloud Run rollback failed with exit code $LASTEXITCODE." }
}

Write-Host "Traffic update completed. Re-run health and employer-console smoke tests."
