# ============================================================
# UTILIDADES — Docker Compose quick-start (PowerShell)
# ============================================================
param(
    [switch]$Prod,
    [switch]$Down,
    [switch]$Rebuild
)

$ErrorActionPreference = "Stop"
$root = "$PSScriptRoot\.."

Set-Location $root

if ($Down) {
    Write-Host "Stopping all containers..." -ForegroundColor Yellow
    docker compose down
    if ($Prod) { docker compose -f docker-compose.prod.yml down }
    exit 0
}

if ($Prod) {
    Write-Host "Starting PRODUCTION stack..." -ForegroundColor Cyan
    $args = @("-f", "docker-compose.prod.yml", "up", "-d")
    if ($Rebuild) { $args += "--build" }
    docker compose @args
} else {
    Write-Host "Starting DEVELOPMENT stack..." -ForegroundColor Cyan
    $args = @("up", "-d")
    if ($Rebuild) { $args += "--build" }
    docker compose @args
}

Write-Host "`n✓ Containers running!" -ForegroundColor Green
docker compose ps
