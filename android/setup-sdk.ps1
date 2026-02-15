Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Finding Android SDK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$env:ANDROID_HOME = [System.Environment]::GetEnvironmentVariable("ANDROID_HOME", "User")
if ($env:ANDROID_HOME) {
    Write-Host "ANDROID_HOME (User): $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "ANDROID_HOME (User): Not set" -ForegroundColor Yellow
}

$env:ANDROID_HOME = [System.Environment]::GetEnvironmentVariable("ANDROID_HOME", "Machine")
if ($env:ANDROID_HOME) {
    Write-Host "ANDROID_HOME (Machine): $env:ANDROID_HOME" -ForegroundColor Green
}

Write-Host ""
Write-Host "Searching common locations..." -ForegroundColor Yellow

$paths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "C:\Android\Sdk",
    "D:\Android\Sdk"
)

$foundSdk = $false
foreach ($path in $paths) {
    if (Test-Path $path) {
        Write-Host "Found Android SDK at: $path" -ForegroundColor Green
        $foundSdk = $true
        $sdkPath = $path
        break
    }
}

if (-not $foundSdk) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Android SDK not found!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Android SDK or set ANDROID_HOME environment variable" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Creating local.properties..." -ForegroundColor Yellow

Set-Location "D:\work\compass\android"

"sdk.dir=$sdkPath" | Out-File -FilePath "local.properties" -Encoding UTF8

Write-Host "Created: local.properties" -ForegroundColor Green
Write-Host "SDK Path: $sdkPath" -ForegroundColor Cyan
Write-Host ""

Get-Content "local.properties"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run: .\build-java21.ps1" -ForegroundColor Cyan

Write-Host ""
Read-Host "Press Enter to exit"
