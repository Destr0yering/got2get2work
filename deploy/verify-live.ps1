param(
  [string]$BaseUrl = "https://got2get2work.com",
  [string]$AuthToken = ""
)

$ErrorActionPreference = "Stop"

$web = Invoke-WebRequest -Uri $BaseUrl -UseBasicParsing
$health = Invoke-RestMethod -Uri "$BaseUrl/api/health"
if ($web.StatusCode -ne 200 -or -not $health.ok) {
  throw "Homepage or health verification failed."
}
if (-not $health.liveGeminiConfigured -or $health.geminiProvider -ne "vertex-ai") {
  throw "Production is not configured to use Vertex AI."
}

$payload = @{
  metrics = @{
    eligibleEmployees = 180
    enrolledEmployees = 72
    activeCarpools = 24
    protectedShifts = 118
    successfulRecoveries = 17
    recoveryAttempts = 20
    estimatedAvoidedAbsences = 18
    valuePerAvoidedAbsence = 300
    monthlyPlatformFee = 1200
    monthlySubsidyBudget = 1600
  }
} | ConvertTo-Json -Depth 5

$headers = @{}
if ($AuthToken) { $headers.Authorization = "Bearer $AuthToken" }
$briefResponse = Invoke-WebRequest -Uri "$BaseUrl/api/agent/site-coordinator" -Method Post -ContentType "application/json" -Body $payload -Headers $headers -SkipHttpErrorCheck
if ($AuthToken) {
  $brief = $briefResponse.Content | ConvertFrom-Json
  if ($briefResponse.StatusCode -ne 200 -or $brief.source -ne "gemini" -or $brief.provider -ne "vertex-ai" -or -not $brief.recommendation -or @($brief.factIds).Count -lt 2) {
    throw "Authenticated live Gemini verification failed."
  }
} elseif ($briefResponse.StatusCode -ne 401) {
  throw "Employer endpoint did not enforce authentication."
}

[pscustomobject]@{
  Url = $BaseUrl
  Homepage = "ok"
  Health = "ok"
  EmployerAuthorization = "ok"
  Gemini = if ($AuthToken) { "ok" } else { "not tested without an employer token" }
}
