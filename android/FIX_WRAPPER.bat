@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

echo ========================================
echo Gradle Wrapper Fix Tool
echo ========================================
echo.

cd /d %~dp0

echo [1/4] Backing up existing files...
set WRAPPER_DIR=gradle\wrapper
set BACKUP_DIR=gradle\wrapper\backup

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

if exist "%WRAPPER_DIR%\gradle-wrapper.jar" (
    set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
    set TIMESTAMP=%TIMESTAMP: =0%
    copy "%WRAPPER_DIR%\gradle-wrapper.jar" "%BACKUP_DIR%\gradle-wrapper.jar.%TIMESTAMP%" >nul
    echo Backed up to: %BACKUP_DIR%\gradle-wrapper.jar.%TIMESTAMP%
)

echo.
echo [2/4] Downloading gradle-wrapper.jar...
echo.

REM Check if curl exists
where curl >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using curl to download...
    curl -L -o "%WRAPPER_DIR%\gradle-wrapper.jar" "https://github.com/gradle/gradle/raw/v7.5.1/gradle/wrapper/gradle-wrapper.jar"

    if %ERRORLEVEL% EQU 0 (
        echo Download successful!
    ) else (
        echo curl failed, trying PowerShell...
        goto :use_powershell
    )
) else (
    :use_powershell
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/gradle/gradle/raw/v7.5.1/gradle/wrapper/gradle-wrapper.jar' -OutFile '%WRAPPER_DIR%\gradle-wrapper.jar'"
)

echo.
echo [3/4] Updating gradle-wrapper.properties...
(
echo distributionBase=GRADLE_USER_HOME
echo distributionPath=wrapper/dists
echo distributionUrl=https^://services.gradle.org/distributions/gradle-7.5.1-bin.zip
echo networkTimeout=10000
echo validateDistributionUrl=true
echo zipStoreBase=GRADLE_USER_HOME
echo zipStorePath=wrapper/dists
) > "%WRAPPER_DIR%\gradle-wrapper.properties"

echo Configuration updated.
echo.

echo [4/4] Cleaning Gradle cache...
set GRADLE_CACHE=%USERPROFILE%\.gradle\wrapper\dists\gradle-7.5.1-bin
if exist "%GRADLE_CACHE%" (
    echo Cleaning: %GRADLE_CACHE%
    for /d %%d in ("%GRADLE_CACHE%\*") do (
        rd /s /q "%%d" 2>nul
    )
    echo Cache cleaned.
)

echo.
echo ========================================
echo Testing Gradle...
echo ========================================
echo.

call gradlew.bat --version

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo FIX SUCCESSFUL!
    echo ========================================
    echo.
    echo You can now run:
    echo   build-debug-apk-v2.bat
) else (
    echo.
    echo ========================================
    echo FIX FAILED!
    echo ========================================
    echo.
    echo Please try:
    echo   1. Delete C:\Users\YourName\.gradle folder
    echo   2. Restart your computer
    echo   3. Run this script again
    echo.
    echo Or use Android Studio to build.
)

echo.
pause
