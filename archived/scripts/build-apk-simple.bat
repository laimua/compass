@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Building Debug APK - Simplified
echo ========================================
echo.

cd /d %~dp0

echo Step 1: Cleaning...
call gradlew.bat clean
if %ERRORLEVEL% NEQ 0 (
    echo Clean warning, continuing...
)

echo.
echo Step 2: Building APK...
echo This may take 5-15 minutes...
echo.

call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo APK Location:
    echo   app\build\outputs\apk\debug\app-debug.apk
    echo.
    dir app\build\outputs\apk\debug\app-debug.apk
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
)

echo.
pause
