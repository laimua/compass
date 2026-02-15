# Build Compass APK - PowerShell Script
# Provides better output and error handling

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Compass APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

Write-Host "Working Directory: $PWD" -ForegroundColor Cyan
Write-Host ""

# Set JAVA_HOME to Java 21
$java21Path = "C:\Program Files\Java\latest\jdk-21"
if (Test-Path $java21Path) {
    $env:JAVA_HOME = $java21Path
    Write-Host "[INFO] Set JAVA_HOME to: $java21Path" -ForegroundColor Cyan
}

# Check Java
Write-Host "[1/4] Checking Java..." -ForegroundColor Yellow
try {
    $javaVersion = & java -version 2>&1 | Select-String "version"
    Write-Host "  $javaVersion" -ForegroundColor Green
    Write-Host "  JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Cyan
} catch {
    Write-Host "  [ERROR] Java not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Gradle Wrapper
Write-Host "[2/4] Checking Gradle Wrapper..." -ForegroundColor Yellow
$wrapperJar = "gradle\wrapper\gradle-wrapper.jar"
if (Test-Path $wrapperJar) {
    $size = (Get-Item $wrapperJar).Length
    Write-Host "  Found: $wrapperJar ($size bytes)" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] $wrapperJar not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Build
Write-Host "[3/4] Building Debug APK..." -ForegroundColor Yellow
Write-Host "  This may take 5-15 minutes on first build" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date
& ".\gradlew.bat" "assembleDebug"
$exitCode = $LASTEXITCODE
$duration = (Get-Date) - $startTime

Write-Host ""

# Result
Write-Host "[4/4] Build Result..." -ForegroundColor Yellow
Write-Host ""

if ($exitCode -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        $apkInfo = Get-Item $apkPath
        $sizeMB = [math]::Round($apkInfo.Length / 1MB, 2)

        Write-Host "APK Details:" -ForegroundColor Cyan
        Write-Host "  Location: $apkPath" -ForegroundColor White
        Write-Host "  Full Path: $($apkInfo.FullName)" -ForegroundColor White
        Write-Host "  Size: $sizeMB MB" -ForegroundColor White
        Write-Host ""
        Write-Host "You can now install this APK on your Android device!" -ForegroundColor Green

        # Open containing folder
        Write-Host ""
        Write-Host "Press Enter to open folder..."
        Read-Host
        explorer.exe (Split-Path $apkInfo.FullName)
    }
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "BUILD FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""

    Write-Host "Exit Code: $exitCode" -ForegroundColor Red
    Write-Host "Build Duration: $($duration.TotalMinutes.ToString('0.00')) minutes" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check Java version (required: 11+)" -ForegroundColor White
    Write-Host "  2. Check JAVA_HOME environment variable" -ForegroundColor White
    Write-Host "  3. Check network connection" -ForegroundColor White
    Write-Host "  4. Try: gradlew.bat clean" -ForegroundColor White
    Write-Host "  5. See BUILD_APK.md for detailed guide" -ForegroundColor White
}

Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host

exit $exitCode
