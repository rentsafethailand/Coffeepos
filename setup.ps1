# setup.ps1

Write-Host "☕ Coffee POS Setup Script" -ForegroundColor Cyan
Write-Host ""

# ตรวจสอบว่ามี .clasp.json หรือยัง
if (Test-Path .clasp.json) {
    Write-Host "✅ Found .clasp.json" -ForegroundColor Green
    $scriptId = (Get-Content .clasp.json | ConvertFrom-Json).scriptId
    Write-Host "📌 Script ID: $scriptId" -ForegroundColor Yellow
} else {
    Write-Host "❌ .clasp.json not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create .clasp.json with your Script ID:" -ForegroundColor Yellow
    Write-Host '{"scriptId":"YOUR_SCRIPT_ID_HERE","rootDir":"."}' -ForegroundColor Gray
    Write-Host ""
    Write-Host "Or run: clasp create --title ""Coffee POS"" --type webapp" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "📤 Pushing to Apps Script..." -ForegroundColor Cyan
clasp push

if ($?) {
    Write-Host "✅ Push successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Open in browser? (Y/N): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    if ($response -eq "Y" -or $response -eq "y") {
        clasp open
    }
} else {
    Write-Host "❌ Push failed!" -ForegroundColor Red
}