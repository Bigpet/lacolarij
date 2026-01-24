@echo off
REM JiraLocal Deployment Script for Windows
REM This batch file wraps the PowerShell script for easy double-click execution

echo === JiraLocal Deployment Script ===
echo.

REM Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: PowerShell not found. Please install PowerShell.
    pause
    exit /b 1
)

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0deploy.ps1"

REM Keep window open if there was an error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Deployment failed with error code %ERRORLEVEL%
    pause
)
