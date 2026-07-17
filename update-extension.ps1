# update-extension.ps1
# Downloadt de nieuwste versie van Akeneo Companion en pakt deze uit.
# Dubbelklik dit bestand of voer het uit in PowerShell.

$Repo        = "KrijnErmerins/akeneo-companion"
$DownloadUrl = "https://github.com/$Repo/releases/latest/download/akeneo-companion.zip"
$ExtractPath = "$env:USERPROFILE\akeneo-companion"
$ZipPath     = "$env:TEMP\akeneo-companion.zip"

Write-Host ""
Write-Host "  Akeneo Companion — Updater" -ForegroundColor Cyan
Write-Host "  ===========================" -ForegroundColor Cyan
Write-Host ""

# Stap 1 — downloaden
Write-Host "Stap 1: Nieuwste versie downloaden..." -ForegroundColor White
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath -UseBasicParsing -ErrorAction Stop
    Write-Host "  Gedownload naar: $ZipPath" -ForegroundColor Green
} catch {
    Write-Host "  FOUT: Kan bestand niet downloaden. Controleer je internetverbinding." -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "`nDruk op Enter om af te sluiten"
    exit 1
}

# Stap 2 — uitpakken
Write-Host ""
Write-Host "Stap 2: ZIP uitpakken naar $ExtractPath..." -ForegroundColor White
if (Test-Path $ExtractPath) {
    Remove-Item $ExtractPath -Recurse -Force
}
try {
    Expand-Archive -Path $ZipPath -DestinationPath $ExtractPath -Force -ErrorAction Stop
    Write-Host "  Uitgepakt!" -ForegroundColor Green
} catch {
    Write-Host "  FOUT: Kan ZIP niet uitpakken." -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "`nDruk op Enter om af te sluiten"
    exit 1
}

# Stap 3 — instructies voor Chrome
Write-Host ""
Write-Host "Stap 3: Vernieuwen in Chrome" -ForegroundColor Yellow
Write-Host "  1. Open Chrome en ga naar:  chrome://extensions"
Write-Host "  2. Zet 'Ontwikkelaarsmodus' aan (schakelaar rechtsboven)."
Write-Host "  3. Klik op het ververs-icoon (pijltje) bij 'Akeneo Companion'."
Write-Host "     Of, als de extensie er niet meer staat:"
Write-Host "     Klik 'Unpacked laden' en selecteer de map: $ExtractPath"
Write-Host ""
Write-Host "  De extensie is bijgewerkt. Veel succes!" -ForegroundColor Green
Write-Host ""

Read-Host "Druk op Enter om af te sluiten"
