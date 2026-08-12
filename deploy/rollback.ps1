param(
  [Parameter(Mandatory = $true)][string]$Revision,
  [string]$Project = "got2get2work-xprize-cloud",
  [string]$Region = "us-east1",
  [string]$Service = "got2get2work"
)

$ErrorActionPreference = "Stop"

$known = gcloud run revisions describe $Revision --project $Project --region $Region --format="value(metadata.name)"
if ($known -ne $Revision) { throw "Revision $Revision was not found." }

gcloud run services update-traffic $Service `
  --project $Project `
  --region $Region `
  --to-revisions "$Revision=100" `
  --quiet

& "$PSScriptRoot\verify-live.ps1" -BaseUrl "https://got2get2work-457279090184.us-east1.run.app"
