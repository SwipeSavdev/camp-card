# ============================================================================
# Camp Card - Local Deploy to EC2 Script (PowerShell)
# ============================================================================
# This script deploys from your local Windows machine to EC2
#
# Usage:
#   .\scripts\deploy-local.ps1 -EC2Host "ec2-xx-xx-xx-xx.compute.amazonaws.com"
# ============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$EC2Host,

    [string]$EC2User = "ec2-user",
    [string]$PemFile = "$env:USERPROFILE\campcard-backend.pem",
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Camp Card - Deploy to EC2" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "EC2 Host: $EC2Host"
Write-Host "EC2 User: $EC2User"
Write-Host "PEM File: $PemFile"
Write-Host ""

# Check PEM file exists
if (-not (Test-Path $PemFile)) {
    Write-Host "ERROR: PEM file not found: $PemFile" -ForegroundColor Red
    exit 1
}

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "Project Root: $ProjectRoot"
Write-Host ""

# Build Docker images locally if not skipped
if (-not $SkipBuild) {
    Write-Host "=== Building Docker images ===" -ForegroundColor Yellow

    # Build backend
    Write-Host "Building backend..."
    docker build -t campcard-backend:latest "$ProjectRoot\backend"

    # Build web
    Write-Host "Building web portal..."
    docker build -t campcard-web:latest "$ProjectRoot\camp-card-mobile-app-v2-web-main\repos\camp-card-web"

    Write-Host "Build complete!" -ForegroundColor Green
    Write-Host ""
}

# Save images to tar files
Write-Host "=== Saving Docker images ===" -ForegroundColor Yellow
$TempDir = "$env:TEMP\campcard-deploy"
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

docker save campcard-backend:latest -o "$TempDir\backend.tar"
docker save campcard-web:latest -o "$TempDir\web.tar"

Write-Host "Images saved to $TempDir" -ForegroundColor Green
Write-Host ""

# Copy files to EC2
Write-Host "=== Copying files to EC2 ===" -ForegroundColor Yellow

# Create remote directory
ssh -i $PemFile -o StrictHostKeyChecking=no "${EC2User}@${EC2Host}" "mkdir -p /home/${EC2User}/campcard"

# Copy docker-compose file
scp -i $PemFile -o StrictHostKeyChecking=no "$ProjectRoot\docker-compose-aws.yml" "${EC2User}@${EC2Host}:/home/${EC2User}/campcard/"

# Copy deployment script
scp -i $PemFile -o StrictHostKeyChecking=no "$ProjectRoot\scripts\deploy-ec2.sh" "${EC2User}@${EC2Host}:/home/${EC2User}/campcard/"

# Copy Docker images
Write-Host "Copying backend image (this may take a while)..."
scp -i $PemFile -o StrictHostKeyChecking=no "$TempDir\backend.tar" "${EC2User}@${EC2Host}:/home/${EC2User}/campcard/"

Write-Host "Copying web image..."
scp -i $PemFile -o StrictHostKeyChecking=no "$TempDir\web.tar" "${EC2User}@${EC2Host}:/home/${EC2User}/campcard/"

Write-Host "Files copied!" -ForegroundColor Green
Write-Host ""

# Deploy on EC2
Write-Host "=== Deploying on EC2 ===" -ForegroundColor Yellow

$DeployScript = @"
cd /home/${EC2User}/campcard

echo "Loading Docker images..."
docker load -i backend.tar
docker load -i web.tar

echo "Tagging images..."
docker tag campcard-backend:latest campcard-backend:latest
docker tag campcard-web:latest campcard-web:latest

echo "Cleaning up tar files..."
rm -f backend.tar web.tar

echo "Running deployment..."
chmod +x deploy-ec2.sh
./deploy-ec2.sh
"@

ssh -i $PemFile -o StrictHostKeyChecking=no "${EC2User}@${EC2Host}" $DeployScript

# Cleanup local temp files
Write-Host ""
Write-Host "=== Cleaning up ===" -ForegroundColor Yellow
Remove-Item -Recurse -Force $TempDir

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application at:"
Write-Host "  - Backend API: http://${EC2Host}:7010"
Write-Host "  - Web Portal:  http://${EC2Host}:7020"
Write-Host ""
