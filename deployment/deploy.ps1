# JiraLocal Deployment Script for Windows
# This script automates the setup steps from README.md
# Prerequisites: Docker Desktop and Python 3

# Get script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$EnvFile = Join-Path $ProjectRoot ".env.docker"
$EnvTemplate = Join-Path $ProjectRoot ".env.docker.example"
$DockerComposeFile = Join-Path $ScriptDir "docker-compose.sqlite.yml"

Write-Host "=== JiraLocal Deployment Script ===" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-CommandExists {
    param([string]$Command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = "stop"
    try {
        if (Get-Command $Command -ErrorAction SilentlyContinue) {
            return $true
        }
        return $false
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $oldPreference
    }
}

# Function to check all prerequisites
function Check-Prerequisites {
    $missingPrerequisites = 0

    Write-Host "Checking prerequisites..." -ForegroundColor Yellow

    # Check for Python 3
    if (Test-CommandExists "python") {
        $pythonVersion = python --version 2>&1
        Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Python 3 is not installed or not in PATH" -ForegroundColor Red
        $missingPrerequisites = 1
    }

    # Check for Docker
    if (Test-CommandExists "docker") {
        $dockerVersion = docker --version 2>&1
        Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
        $missingPrerequisites = 1
    }

    # Check for Docker Compose
    $composeCheck = docker compose version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker Compose found: $composeCheck" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker Compose is not available" -ForegroundColor Red
        $missingPrerequisites = 1
    }

    # Check for required files
    if (Test-Path $EnvTemplate) {
        Write-Host "✓ Environment template found: $EnvTemplate" -ForegroundColor Green
    } else {
        Write-Host "❌ Environment template file not found: $EnvTemplate" -ForegroundColor Red
        $missingPrerequisites = 1
    }

    if (Test-Path $DockerComposeFile) {
        Write-Host "✓ Docker Compose file found: $DockerComposeFile" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker Compose file not found: $DockerComposeFile" -ForegroundColor Red
        $missingPrerequisites = 1
    }

    if ($missingPrerequisites -ne 0) {
        Write-Host ""
        Write-Host "❌ Prerequisites check failed. Please install missing dependencies and try again." -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "✓ All prerequisites met." -ForegroundColor Green
    Write-Host ""
}

# Check prerequisites before proceeding
Check-Prerequisites

# Step 1: Create environment file from template if it doesn't exist
if (-not (Test-Path $EnvFile)) {
    Write-Host "Creating .env.docker from template..." -ForegroundColor Yellow
    Copy-Item $EnvTemplate $EnvFile
} else {
    Write-Host ".env.docker already exists, skipping copy." -ForegroundColor Gray
}

# Step 2: Generate and add required secrets if not already set
function Generate-SecretKey {
    # Generate a URL-safe 32-byte random key (similar to secrets.token_urlsafe(32))
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    return [Convert]::ToBase64String($bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=')
}

function Generate-EncryptionKey {
    # Generate a Fernet-compatible key (32 bytes, base64 URL-safe encoded)
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    return [Convert]::ToBase64String($bytes).Replace('+', '-').Replace('/', '_')
}

# Read the env file content
$envContent = Get-Content $EnvFile -Raw

# Check if SECRET_KEY is empty and generate if needed
if ($envContent -match '(?m)^SECRET_KEY=\s*$') {
    Write-Host "Generating SECRET_KEY..." -ForegroundColor Yellow
    $secretKey = Generate-SecretKey
    $envContent = $envContent -replace '(?m)^SECRET_KEY=\s*$', "SECRET_KEY=$secretKey"
    Write-Host "SECRET_KEY has been set." -ForegroundColor Green
} else {
    Write-Host "SECRET_KEY already set, skipping." -ForegroundColor Gray
}

# Check if ENCRYPTION_KEY is empty and generate if needed
if ($envContent -match '(?m)^ENCRYPTION_KEY=\s*$') {
    Write-Host "Generating ENCRYPTION_KEY..." -ForegroundColor Yellow
    $encryptionKey = Generate-EncryptionKey
    $envContent = $envContent -replace '(?m)^ENCRYPTION_KEY=\s*$', "ENCRYPTION_KEY=$encryptionKey"
    Write-Host "ENCRYPTION_KEY has been set." -ForegroundColor Green
} else {
    Write-Host "ENCRYPTION_KEY already set, skipping." -ForegroundColor Gray
}

# Write the updated content back to the file
Set-Content $EnvFile $envContent -NoNewline

# Step 3: Run the containers with SQLite
Write-Host "Starting containers..." -ForegroundColor Yellow
docker compose -f "$DockerComposeFile" --env-file "$EnvFile" up --build -d

Write-Host ""
Write-Host "=== Deployment complete ===" -ForegroundColor Cyan
Write-Host "JiraLocal should now be running." -ForegroundColor Green
Write-Host ""
Write-Host "To view logs, run: docker compose -f `"$DockerComposeFile`" logs -f" -ForegroundColor Gray
Write-Host "To stop, run: docker compose -f `"$DockerComposeFile`" down" -ForegroundColor Gray
