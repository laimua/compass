@echo off
setlocal

echo ========================================
echo Downloading Gradle 7.6.0 Manually
echo ========================================
echo.

cd /d %~dp0

set GRADLE_VERSION=7.6.0
set GRADLE_ZIP=gradle-%GRADLE_VERSION%-bin.zip
set GRADLE_URL=https://services.gradle.org/distributions/%GRADLE_ZIP%
set TARGET_DIR=%USERPROFILE%\.gradle\wrapper\dists\gradle-%GRADLE_VERSION%-bin\cached

echo Target Directory: %TARGET_DIR%
echo.

if not exist "%TARGET_DIR%" (
    echo Creating directory: %TARGET_DIR%
    mkdir "%TARGET_DIR%"
)

echo.
echo Downloading from: %GRADLE_URL%
echo.
echo This will download 120MB, please wait...
echo.

curl -L -o "%TARGET_DIR%\%GRADLE_ZIP%" %GRADLE_URL%

if exist "%TARGET_DIR%\%GRADLE_ZIP%" (
    echo.
    echo ========================================
    echo Download Complete!
    echo ========================================
    echo.
    for %%A in ("%TARGET_DIR%\%GRADLE_ZIP%") do set size=%%~zA
    echo File Size: !size! bytes
    echo Location: %TARGET_DIR%\%GRADLE_ZIP%
    echo.
    echo You can now run: gradlew.bat assembleDebug
) else (
    echo.
    echo ========================================
    echo Download Failed!
    echo ========================================
    echo.
    echo Please download manually from:
    echo %GRADLE_URL%
    echo.
    echo And save to:
    echo %TARGET_DIR%\
)

echo.
pause
