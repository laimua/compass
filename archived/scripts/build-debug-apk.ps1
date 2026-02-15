# Build Debug APK for Android
Write-Host "Building Debug APK..." -ForegroundColor Green

# Navigate to android directory
Set-Location $PSScriptRoot

# Run gradlew.bat
& ".\gradlew.bat" "assembleDebug"

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBuild completed successfully!" -ForegroundColor Green
    Write-Host "APK location: app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Cyan
} else {
    Write-Host "`nBuild failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
