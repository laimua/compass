# Download gradle-wrapper.jar Script
# Author: Claude Code
# Description: Downloads gradle-wrapper.jar from multiple sources

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Download gradle-wrapper.jar" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$wrapperDir = "gradle\wrapper"
$targetFile = "$wrapperDir\gradle-wrapper.jar"

# Change to android directory
Set-Location $PSScriptRoot
Write-Host "Target directory: $PWD" -ForegroundColor Cyan
Write-Host ""

# Backup existing file
Write-Host "[Step 1/3] Backing up existing file..." -ForegroundColor Yellow
if (Test-Path $targetFile) {
    Copy-Item $targetFile "$targetFile.backup"
    Write-Host "  Backed up to: $targetFile.backup" -ForegroundColor Green
} else {
    Write-Host "  No existing file found (this is OK)" -ForegroundColor Gray
}
Write-Host ""

# Create wrapper directory if not exists
if (-not (Test-Path $wrapperDir)) {
    New-Item -ItemType Directory -Path $wrapperDir -Force | Out-Null
}

# Download from multiple sources
Write-Host "[Step 2/3] Downloading gradle-wrapper.jar..." -ForegroundColor Yellow
Write-Host ""

$sources = @(
    @{Name="GitHub"; Url="https://raw.githubusercontent.com/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar"},
    @{Name="jsdelivr CDN"; Url="https://cdn.jsdelivr.net/gh/gradle/gradle@v7.5.1/gradle/wrapper/gradle-wrapper.jar"},
    @{Name="fastgit"; Url="https://raw.fastgit.org/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar"}
)

$downloaded = $false
$usedSource = ""

foreach ($source in $sources) {
    Write-Host "  Trying $($source.Name)..." -ForegroundColor Cyan

    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $source.Url -OutFile $targetFile -UseBasicParsing -TimeoutSec 30

        if (Test-Path $targetFile) {
            $fileSize = (Get-Item $targetFile).Length
            if ($fileSize -gt 50000) {
                Write-Host "    Success! Downloaded $fileSize bytes" -ForegroundColor Green
                $downloaded = $true
                $usedSource = $source.Name
                break
            } else {
                Write-Host "    File too small ($fileSize bytes), may be corrupted" -ForegroundColor Yellow
                Remove-Item $targetFile -Force
            }
        }
    } catch {
        Write-Host "    Failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
}

if (-not $downloaded) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "DOWNLOAD FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "All automatic download attempts failed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please download manually:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Open this link in your browser:" -ForegroundColor White
    Write-Host "   https://raw.githubusercontent.com/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Save the downloaded file to:" -ForegroundColor White
    Write-Host "   $PWD\$targetFile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or try with a different browser or network." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Verify download
Write-Host "[Step 3/3] Verifying download..." -ForegroundColor Yellow
Write-Host ""

$fileSize = (Get-Item $targetFile).Length

Write-Host "File location: $targetFile" -ForegroundColor Cyan
Write-Host "File size: $fileSize bytes" -ForegroundColor Cyan
Write-Host "Source used: $usedSource" -ForegroundColor Cyan
Write-Host ""

if ($fileSize -lt 50000) {
    Write-Host "WARNING: File size is too small!" -ForegroundColor Red
    Write-Host "Expected size: ~60000 bytes" -ForegroundColor Yellow
    Write-Host "Actual size: $fileSize bytes" -ForegroundColor Red
    Write-Host ""
    Write-Host "The file may be corrupted. Please try:" -ForegroundColor Yellow
    Write-Host "  1. Download manually from GitHub" -ForegroundColor White
    Write-Host "  2. Use a different network" -ForegroundColor White
    Write-Host "  3. See DOWNLOAD_WRAPPER_GUIDE.md for details" -ForegroundColor White
} else {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "gradle-wrapper.jar has been downloaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "File details:" -ForegroundColor Cyan
    Write-Host "  Location: $targetFile" -ForegroundColor White
    Write-Host "  Size: $fileSize bytes" -ForegroundColor White
    Write-Host "  Source: $usedSource" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Test: .\gradlew.bat --version" -ForegroundColor White
    Write-Host "  2. Build: .\build-apk-simple.bat" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"
