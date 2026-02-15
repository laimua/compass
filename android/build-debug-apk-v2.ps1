# Compass Debug APK Build Script
# Requires: PowerShell 5.1 or higher

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Building Debug APK for Compass" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set error action preference
$ErrorActionPreference = "Continue"

# Navigate to script directory
Set-Location $PSScriptRoot
Write-Host "[1/6] Working Directory: $PWD" -ForegroundColor Green
Write-Host ""

# Check Gradle Wrapper
Write-Host "[2/6] Checking Gradle Wrapper..." -ForegroundColor Yellow
$wrapperJar = "gradle\wrapper\gradle-wrapper.jar"
if (Test-Path $wrapperJar) {
    $size = (Get-Item $wrapperJar).Length
    Write-Host "  [OK] Found: $wrapperJar ($size bytes)" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Not found: $wrapperJar" -ForegroundColor Red
    Write-Host "  Please ensure the file exists!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Check Java
Write-Host "[3/6] Checking Java Installation..." -ForegroundColor Yellow
try {
    $javaVersion = & java -version 2>&1 | Select-String "version"
    Write-Host "  $javaVersion" -ForegroundColor Cyan

    if ($env:JAVA_HOME) {
        Write-Host "  JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green
    } else {
        Write-Host "  [WARNING] JAVA_HOME not set" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [ERROR] Java not found or not working!" -ForegroundColor Red
    Write-Host "  Please install JDK 11 or higher" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Clean previous build
Write-Host "[4/6] Cleaning previous build..." -ForegroundColor Yellow
& ".\gradlew.bat" "clean" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [WARNING] Clean failed, continuing..." -ForegroundColor Yellow
} else {
    Write-Host "  [OK] Clean completed" -ForegroundColor Green
}
Write-Host ""

# Build APK
Write-Host "[5/6] Building Debug APK..." -ForegroundColor Yellow
Write-Host "  This may take 5-15 minutes on first build..." -ForegroundColor Cyan
Write-Host ""

$buildStartTime = Get-Date
& ".\gradlew.bat" "assembleDebug"
$buildExitCode = $LASTEXITCODE
$buildDuration = (Get-Date) - $buildStartTime

Write-Host ""

# Check result
if ($buildExitCode -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Build Duration: $($buildDuration.TotalMinutes.ToString('0.00')) minutes" -ForegroundColor Cyan
    Write-Host ""

    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        $apkInfo = Get-Item $apkPath
        Write-Host "APK Location:" -ForegroundColor Yellow
        Write-Host "  Relative: $apkPath" -ForegroundColor White
        Write-Host "  Full:     $($apkInfo.FullName)" -ForegroundColor White
        Write-Host "  Size:     $([math]::Round($apkInfo.Length / 1MB, 2)) MB" -ForegroundColor White
        Write-Host ""
        Write-Host "You can now install this APK on your Android device." -ForegroundColor Green
    } else {
        Write-Host "  [WARNING] APK file not found at expected location!" -ForegroundColor Yellow
    }
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "BUILD FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Exit Code: $buildExitCode" -ForegroundColor Red
    Write-Host "Build Duration: $($buildDuration.TotalMinutes.ToString('0.00')) minutes" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Make sure you have JDK 11 or higher installed" -ForegroundColor White
    Write-Host "  2. Check JAVA_HOME environment variable" -ForegroundColor White
    Write-Host "  3. Run: .\gradlew.bat clean" -ForegroundColor White
    Write-Host "  4. Check internet connection (first build needs to download dependencies)" -ForegroundColor White
    Write-Host "  5. Try running with elevated permissions (Run as Administrator)" -ForegroundColor White
}

Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host

exit $buildExitCode
