
# MARQIVO Database Setup Script
# This script starts PostgreSQL in Docker and migrates/seeds the database

param(
    [switch]$SkipDocker,
    [switch]$ResetDb
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  MARQIVO Database Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Step 1: Check Docker
Write-Host "`n[1/4] Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "  Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  Docker not found! Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Step 2: Start PostgreSQL container
Write-Host "`n[2/4] Starting PostgreSQL container..." -ForegroundColor Yellow

$containerName = "marqivo-postgres"
$existing = docker ps -a --filter "name=$containerName" --format "{{.Names}}" 2>&1

if ($existing -match $containerName) {
    $running = docker ps --filter "name=$containerName" --format "{{.Names}}" 2>&1
    if ($running -match $containerName) {
        Write-Host "  PostgreSQL container already running." -ForegroundColor Green
    } else {
        Write-Host "  Starting existing container..." -ForegroundColor Yellow
        docker start $containerName | Out-Null
        Write-Host "  Container started." -ForegroundColor Green
    }
} else {
    Write-Host "  Creating new PostgreSQL container..." -ForegroundColor Yellow
    docker run -d `
        --name $containerName `
        -e POSTGRES_USER=postgres `
        -e POSTGRES_PASSWORD=postgres `
        -e POSTGRES_DB=marqivo_db `
        -p 5432:5432 `
        --restart unless-stopped `
        postgres:16-alpine | Out-Null
    Write-Host "  PostgreSQL container created and started." -ForegroundColor Green
}

# Wait for PostgreSQL to be ready
Write-Host "  Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxWait = 30
$waited = 0
do {
    Start-Sleep -Seconds 2
    $waited += 2
    $ready = docker exec $containerName pg_isready -U postgres 2>&1
    Write-Host "  [$waited s] $ready" -ForegroundColor Gray
} while ($ready -notmatch "accepting connections" -and $waited -lt $maxWait)

if ($waited -ge $maxWait) {
    Write-Host "  PostgreSQL did not become ready in time!" -ForegroundColor Red
    exit 1
}
Write-Host "  PostgreSQL is ready!" -ForegroundColor Green

# Step 3: Run Prisma migrations
Write-Host "`n[3/4] Running database migrations..." -ForegroundColor Yellow
Set-Location $ProjectRoot
try {
    npx prisma migrate deploy 2>&1 | Write-Host
    Write-Host "  Migrations applied successfully." -ForegroundColor Green
} catch {
    Write-Host "  Trying prisma db push..." -ForegroundColor Yellow
    npx prisma db push --accept-data-loss 2>&1 | Write-Host
    Write-Host "  Schema pushed successfully." -ForegroundColor Green
}

# Step 4: Seed the database
Write-Host "`n[4/4] Seeding database with MARQIVO data..." -ForegroundColor Yellow
try {
    npm run prisma:seed 2>&1 | Write-Host
    Write-Host "  Database seeded successfully!" -ForegroundColor Green
} catch {
    Write-Host "  Seed failed: $_" -ForegroundColor Red
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  Setup complete! Run 'npm run dev' to start." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
