# EMPOWER Backend - File Organization Script
# This script organizes the project structure and removes duplicate files

Write-Host "🗂️  EMPOWER Backend - Organizing File Structure..." -ForegroundColor Cyan

$root = Get-Location

# ========== MOVE GUIDES TO docs/guides ==========
Write-Host "`n📚 Moving guides..." -ForegroundColor Yellow

$guidesToMove = @(
    "QUICK_START.md",
    "QUICK_SMS_START.txt",
    "NFC_QUICK_START.md",
    "NFC_CONNECTION_GUIDE.md",
    "GEOFENCING_TESTING_GUIDE.md"
)

foreach ($guide in $guidesToMove) {
    if (Test-Path "$root\$guide") {
        Move-Item "$root\$guide" "$root\docs\guides\" -Force
        Write-Host "  OK Moved $guide to docs/guides/"
    }
}

# Move existing docs to guides
$docsToMove = @(
    "EMERGENCY_CONTACTS_GUIDE.md",
    "GEOFENCING_GUIDE.md",
    "SOS_SMS_TESTING_GUIDE.md",
    "SMS_FIX_SUMMARY.md"
)

foreach ($doc in $docsToMove) {
    if (Test-Path "$root\docs\$doc") {
        Move-Item "$root\docs\$doc" "$root\docs\guides\" -Force
        Write-Host "  OK Moved $doc to docs/guides/"
    }
}

# ========== MOVE REPORTS TO docs/reports ==========
Write-Host "`n📊 Moving reports..." -ForegroundColor Yellow

$reportsToMove = @(
    "FINAL_STATUS_REPORT.md",
    "GEOFENCING_IMPLEMENTATION_STATUS.md",
    "SMS_FIX_STATUS_REPORT.md",
    "SMS_NOT_RECEIVING_DIAGNOSTIC.md"
)

foreach ($report in $reportsToMove) {
    if (Test-Path "$root\$report") {
        Move-Item "$root\$report" "$root\docs\reports\" -Force
        Write-Host "  OK Moved $report to docs/reports/"
    }
}

# ========== MOVE TESTS TO tests/ ==========
Write-Host "`n🧪 Moving tests..." -ForegroundColor Yellow

$testsToMove = @(
    "test-nfc.ps1",
    "test-sms-comprehensive.ps1",
    "test-sms-simple.ps1",
    "test-sos-feature.ps1",
    "test-sos-final.ps1"
)

foreach ($test in $testsToMove) {
    if (Test-Path "$root\$test") {
        Move-Item "$root\$test" "$root\tests\" -Force
        Write-Host "  OK Moved $test to tests/"
    }
}

# ========== MOVE SCRIPTS TO scripts/ ==========
Write-Host "`n⚙️  Moving scripts..." -ForegroundColor Yellow

$scriptsToMove = @(
    "build.sh",
    "start.sh"
)

foreach ($script in $scriptsToMove) {
    if (Test-Path "$root\$script") {
        Move-Item "$root\$script" "$root\scripts\" -Force
        Write-Host "  OK Moved $script to scripts/"
    }
}

# ========== MOVE SCREENSHOTS ==========
Write-Host "`n🖼️  Moving screenshots..." -ForegroundColor Yellow

if (Test-Path "$root\Screenshots") {
    if (-not (Test-Path "$root\docs\screenshots")) {
        New-Item -ItemType Directory "$root\docs\screenshots" -Force | Out-Null
    }
    Move-Item "$root\Screenshots\*" "$root\docs\screenshots\" -Force
    Remove-Item "$root\Screenshots" -Force
    Write-Host "  OK Moved Screenshots to docs/screenshots/"
}

# ========== SUMMARY ==========
Write-Host "`n" -ForegroundColor Green
Write-Host "Organization Complete!" -ForegroundColor Green
Write-Host "`n New Structure:" -ForegroundColor Cyan
Write-Host "  /docs/guides/        - Guides and getting started"
Write-Host "  /docs/reports/       - Status reports and diagnostics"
Write-Host "  /docs/screenshots/   - UI screenshots"
Write-Host "  /tests/              - Test scripts"
Write-Host "  /scripts/            - Build and utility scripts"
Write-Host "`n Ready to go!" -ForegroundColor Green
