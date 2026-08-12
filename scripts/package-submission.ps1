param(
  [string]$Output = "..\got2get2work-xprize-deploy.zip"
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$outputPath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $Output))
$stagingRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("g2w-xprize-" + [guid]::NewGuid())

try {
  New-Item -ItemType Directory -Path $stagingRoot | Out-Null
  $excludedDirectories = @(".git", "node_modules", "dist-web", "dist-android", ".expo", ".next", "dist", "website-backup-20260724-161944")
  $excludedFiles = @(".env", ".env.local", "npm-debug.log")

  Get-ChildItem -LiteralPath $projectRoot -Recurse -Force -File | Where-Object {
    $relative = $_.FullName.Substring($projectRoot.Length).TrimStart('\\')
    $segments = $relative -split '[\\/]'
    -not ($segments | Where-Object { $excludedDirectories -contains $_ }) -and
      $excludedFiles -notcontains $_.Name
  } | ForEach-Object {
    $relative = $_.FullName.Substring($projectRoot.Length).TrimStart('\\')
    $destination = Join-Path $stagingRoot $relative
    $destinationDirectory = Split-Path -Parent $destination
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
  }

  Get-ChildItem -LiteralPath $stagingRoot -Recurse -Force -File | Where-Object {
    $_.Name -in @(".env", ".env.local") -or $_.FullName -match "[\\/]node_modules[\\/]"
  } | ForEach-Object {
    throw "Unsafe file reached staging: $($_.FullName)"
  }

  if (Test-Path -LiteralPath $outputPath) {
    Remove-Item -LiteralPath $outputPath -Force
  }
  Compress-Archive -Path (Join-Path $stagingRoot "*") -DestinationPath $outputPath -CompressionLevel Optimal

  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $archive = [System.IO.Compression.ZipFile]::OpenRead($outputPath)
  try {
    $names = @($archive.Entries.FullName)
    foreach ($required in @("package.json", "README.md", "LICENSE", "DEVPOST_SUBMISSION_DRAFT.md", "XPRIZE_SUBMISSION_AUDIT.md")) {
      if ($names -notcontains $required) { throw "ZIP is missing $required" }
    }
    if ($names -match "(^|/)(\.git|node_modules)/" -or $names -match "(^|/)\.env(\.local)?$") {
      throw "ZIP contains excluded content."
    }
    $stream = [System.IO.File]::OpenRead($outputPath)
    try {
      $sha = [System.Security.Cryptography.SHA256]::Create()
      try {
        $hash = -join ($sha.ComputeHash($stream) | ForEach-Object { $_.ToString('x2') })
      } finally {
        $sha.Dispose()
      }
    } finally {
      $stream.Dispose()
    }
    [pscustomobject]@{
      Path = $outputPath
      Entries = $archive.Entries.Count
      SizeMB = [math]::Round((Get-Item -LiteralPath $outputPath).Length / 1MB, 2)
      SHA256 = $hash
    }
  } finally {
    $archive.Dispose()
  }
} finally {
  if (Test-Path -LiteralPath $stagingRoot) {
    Remove-Item -LiteralPath $stagingRoot -Recurse -Force
  }
}
