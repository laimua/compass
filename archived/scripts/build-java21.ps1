$ErrorActionPreference = 'Continue'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building APK with Java 21" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "D:\work\compass\android"

$env:JAVA_HOME = "C:\Program Files\Java\latest\jdk-21"
$env:PATH = "C:\Program Files\Java\latest\jdk-21\bin;" + $env:PATH

Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking Java version..." -ForegroundColor Yellow
& "$env:JAVA_HOME\bin\java" -version
Write-Host ""

Write-Host "Stopping Gradle daemons..." -ForegroundColor Yellow
& ".\gradlew.bat" --stop
Write-Host ""

Write-Host "Building APK..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Cyan
Write-Host ""

$exitCode = & ".\gradlew.bat" assembleDebug
$LASTEXITCODE = $exitCode

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Result" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($LASTEXITCODE -eq 0) {
    Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""

    if (Test-Path "app\build\outputs\apk\debug\app-debug.apk") {
        $apkInfo = Get-Item "app\build\outputs\apk\debug\app-debug.apk"
        $sizeMB = [math]::Round($apkInfo.Length / 1MB, 2)

        Write-Host "APK Details:" -ForegroundColor Cyan
        Write-Host "  Location: app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White
        Write-Host "  Size: $sizeMB MB" -ForegroundColor White
        Write-Host "  Full Path: $($apkInfo.FullName)" -ForegroundColor White
        Write-Host ""
        Write-Host "Opening folder..." -ForegroundColor Yellow
        explorer.exe "app\build\outputs\apk\debug"
    }
} else {
    Write-Host "BUILD FAILED!" -ForegroundColor Red
    Write-Host "Exit Code: $LASTEXITCODE" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"
