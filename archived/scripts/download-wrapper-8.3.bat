@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

echo Downloading gradle-wrapper.jar for Gradle 8.3...
echo.

cd /d %~dp0\gradle\wrapper

echo Target directory: %CD%
echo.

echo Backing up existing file...
if exist gradle-wrapper.jar (
    copy gradle-wrapper.jar gradle-wrapper.jar.backup.7.6.0 >nul
    echo Backed up to gradle-wrapper.jar.backup.7.6.0
)

echo.
echo Downloading from GitHub...
echo.

curl -L -o gradle-wrapper.jar "https://raw.githubusercontent.com/gradle/gradle/v8.3.0/gradle/wrapper/gradle-wrapper.jar"

if exist gradle-wrapper.jar (
    for %%A in (gradle-wrapper.jar) do set size=%%~zA
    echo.
    echo Download successful! File size: !size! bytes

    if !size! GTR 50000 (
        echo.
        echo ========================================
        echo SUCCESS!
        echo ========================================
        echo.
        echo gradle-wrapper.jar for Gradle 8.3 is ready!
        echo You can now run: .\BUILD.ps1
    ) else (
        echo.
        echo WARNING: File size is too small (!size! bytes)
        echo May be corrupted. Please try again.
    )
) else (
    echo.
    echo Download failed!
    echo.
    echo Please download manually:
    echo https://raw.githubusercontent.com/gradle/gradle/v8.3.0/gradle/wrapper/gradle-wrapper.jar
    echo.
    echo Save to: %CD%\gradle-wrapper.jar
)

echo.
pause
