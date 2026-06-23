#Requires -Version 5.1
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$distDir   = Join-Path $scriptDir 'dist'
$manifestPath = Join-Path $distDir 'manifest.json'

# Read current version
if (-not (Test-Path $manifestPath)) {
    Write-Error "Kan dist/manifest.json niet vinden op: $manifestPath"
    exit 1
}

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$currentVersion = $manifest.version
Write-Host "Huidige versie: $currentVersion"

# Fetch latest release from GitHub
Write-Host "Controleer nieuwste release op GitHub..."
try {
    $release = Invoke-RestMethod -Uri 'https://api.github.com/repos/KrijnErmerins/akeneo-companion/releases/latest' `
        -Headers @{ 'User-Agent' = 'akeneo-companion-updater' }
} catch {
    Write-Error "Kan GitHub niet bereiken: $_"
    exit 1
}

$latestVersion = $release.tag_name -replace '^v', ''
Write-Host "Nieuwste versie:  $latestVersion"

if ($currentVersion -eq $latestVersion) {
    Write-Host "`nDe extensie is al up-to-date (v$currentVersion). Niets te doen."
    exit 0
}

Write-Host "`nNieuwe versie beschikbaar: v$latestVersion. Downloaden..."

# Find the zip asset
$asset = $release.assets | Where-Object { $_.name -eq 'akeneo-companion.zip' } | Select-Object -First 1
if (-not $asset) {
    Write-Error "Release asset 'akeneo-companion.zip' niet gevonden in release v$latestVersion."
    exit 1
}

$zipPath = Join-Path $env:TEMP 'akeneo-companion-update.zip'

try {
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath -UseBasicParsing
} catch {
    Write-Error "Download mislukt: $_"
    exit 1
}

# Extract to dist/, overwriting existing files
Write-Host "Uitpakken naar $distDir..."
try {
    Expand-Archive -Path $zipPath -DestinationPath $distDir -Force
} catch {
    Write-Error "Uitpakken mislukt: $_"
    exit 1
} finally {
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
}

Write-Host "`nUpdate geslaagd! Extensie bijgewerkt naar v$latestVersion."
Write-Host ""
Write-Host "Herlaad de extensie in Chrome:"
Write-Host "  1. Open chrome://extensions"
Write-Host "  2. Klik op de knop 'Herlaad' bij Akeneo Companion"
