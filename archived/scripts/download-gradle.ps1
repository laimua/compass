$ErrorActionPreference = 'Stop'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Downloading Gradle 7.6.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$targetDir = "$env:USERPROFILE\.gradle\wrapper\dists\gradle-7.5.1-bin\cached"

Write-Host "Target Directory: $targetDir" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $targetDir)) {
    Write-Host "Creating directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
}

Write-Host "Downloading Gradle 7.5.1 (120MB)..." -ForegroundColor Yellow
Write-Host ""

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ProgressPreference = 'SilentlyContinue'

try {
    Invoke-WebRequest -Uri 'https://services.gradle.org/distributions/gradle-7.5.1-bin.zip' -OutFile "$targetDir\gradle-7.5.1-bin.zip" -UseBasicParsing

    if (Test-Path "$targetDir\gradle-7.5.1-bin.zip") {
        $fileSize = (Get-Item "$targetDir\gradle-7.5.1-bin.zip").Length
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "File: gradle-7.5.1-bin.zip" -ForegroundColor White
        Write-Host "Size: $fileSize bytes" -ForegroundColor White
        Write-Host "Location: $targetDir" -ForegroundColor White
        Write-Host ""
        Write-Host "Note: Will update gradle-wrapper.properties to use 7.5.1" -ForegroundColor Yellow
        Write-Host "Next step: Run .\build-apk.bat" -ForegroundColor Cyan
    } else {
        throw "Download failed - file not found"
    }
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "DOWNLOAD FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please download manually:" -ForegroundColor Cyan
    Write-Host "  URL: https://services.gradle.org/distributions/gradle-7.5.1-bin.zip" -ForegroundColor White
    Write-Host "  Save to: $targetDir" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"
