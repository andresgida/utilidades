# ============================================================
# UTILIDADES — Dev environment quick-start (PowerShell)
# ============================================================
param(
    [switch]$SkipInstall,
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== UTILIDADES Dev Start ===" -ForegroundColor Cyan

# ── Backend ──────────────────────────────────────────────────
if (-not $FrontendOnly) {
    Write-Host "`n[1/3] Restoring .NET packages..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\..\backend"
    dotnet restore

    Write-Host "[2/3] Creating EF Core migration (if needed)..." -ForegroundColor Yellow
    $migExists = Get-ChildItem "src\Utilidades.Infrastructure\Migrations" -Filter "*.cs" -ErrorAction SilentlyContinue
    if (-not $migExists) {
        dotnet ef migrations add InitialCreate `
            --project src/Utilidades.Infrastructure `
            --startup-project src/Utilidades.API `
            --output-dir Migrations
        Write-Host "  Migration created." -ForegroundColor Green
    } else {
        Write-Host "  Migrations already exist, skipping." -ForegroundColor Gray
    }

    Write-Host "[3/3] Starting backend API (dotnet watch)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\..\backend'; dotnet watch --project src/Utilidades.API run"
}

# ── Frontend ─────────────────────────────────────────────────
if (-not $BackendOnly) {
    Set-Location "$PSScriptRoot\..\frontend"

    if (-not $SkipInstall) {
        Write-Host "`n[npm] Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
    }

    Write-Host "[ng] Starting Angular dev server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\..\frontend'; npm start"
}

Write-Host "`n✓ Dev environment started!" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "  Swagger:  http://localhost:5000/swagger" -ForegroundColor White
Write-Host "  Frontend: http://localhost:4200" -ForegroundColor White
