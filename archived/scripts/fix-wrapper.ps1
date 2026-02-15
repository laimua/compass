# Gradle Wrapper Fix Script
# Encoding: UTF-8 with BOM

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Gradle Wrapper Fix Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

# Step 1: Backup existing wrapper
Write-Host "[1/5] Backing up Gradle Wrapper..." -ForegroundColor Yellow
$wrapperDir = "gradle\wrapper"
$backupDir = "gradle\wrapper\backup"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

if (Test-Path "$wrapperDir\gradle-wrapper.jar") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item "$wrapperDir\gradle-wrapper.jar" "$backupDir\gradle-wrapper.jar.$timestamp"
    Write-Host "  Backed up to: $backupDir\gradle-wrapper.jar.$timestamp" -ForegroundColor Green
}

# Step 2: Download correct gradle-wrapper.jar
Write-Host "[2/5] Downloading Gradle Wrapper..." -ForegroundColor Yellow
try {
    $url = "https://github.com/gradle/gradle/raw/v7.5.1/gradle/wrapper/gradle-wrapper.jar"
    $output = "$wrapperDir\gradle-wrapper.jar"

    Write-Host "  Downloading from GitHub..." -ForegroundColor Cyan
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing

    $fileSize = (Get-Item $output).Length
    Write-Host "  Downloaded: $fileSize bytes" -ForegroundColor Green

    if ($fileSize -lt 50000) {
        throw "File too small, may be corrupted"
    }
} catch {
    Write-Host "  ERROR: Download failed: $_" -ForegroundColor Red

    # Try alternative source
    Write-Host "  Trying alternative source..." -ForegroundColor Yellow
    try {
        $url2 = "https://raw.githubusercontent.com/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar"
        Invoke-WebRequest -Uri $url2 -OutFile $output -UseBasicParsing
        $fileSize = (Get-Item $output).Length
        Write-Host "  Downloaded from alternative: $fileSize bytes" -ForegroundColor Green
    } catch {
        Write-Host "  ERROR: All download attempts failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Step 3: Update gradle-wrapper.properties
Write-Host "[3/5] Updating configuration file..." -ForegroundColor Yellow
$propertiesFile = "$wrapperDir\gradle-wrapper.properties"

$newContent = @"
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-7.5.1-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
"@

Set-Content -Path $propertiesFile -Value $newContent -Encoding UTF8
Write-Host "  Configuration updated" -ForegroundColor Green

# Step 4: Clean Gradle cache
Write-Host "[4/5] Cleaning Gradle cache..." -ForegroundColor Yellow
$userGradleDir = "$env:USERPROFILE\.gradle"

if (Test-Path $userGradleDir) {
    $wrapperCache = "$userGradleDir\wrapper\dists\gradle-7.5.1-bin"
    if (Test-Path $wrapperCache) {
        Write-Host "  Cleaning: $wrapperCache" -ForegroundColor Cyan
        Get-ChildItem -Path $wrapperCache -Directory | ForEach-Object {
            Remove-Item "$($_.FullName)\*" -Recurse -Force -ErrorAction SilentlyContinue
        }
        Write-Host "  Wrapper cache cleaned" -ForegroundColor Green
    }
}

# Step 5: Test Gradle
Write-Host "[5/5] Testing Gradle..." -ForegroundColor Yellow
Write-Host ""

& ".\gradlew.bat" "--version"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Fix Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run the build:" -ForegroundColor Cyan
    Write-Host "  .\build-debug-apk-v2.ps1" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Fix Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please try:" -ForegroundColor Yellow
    Write-Host "  1. Delete %USERPROFILE%\.gradle manually" -ForegroundColor White
    Write-Host "  2. Restart your computer" -ForegroundColor White
    Write-Host "  3. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use Android Studio to build the APK." -ForegroundColor Cyan
}

Write-Host ""
Read-Host "Press Enter to exit"
