@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Building Release APK for Compass
echo ========================================
echo.

REM Change to script directory
cd /d %~dp0
echo [1/5] Current directory: %CD%
echo.

REM Check gradle-wrapper.jar
echo [2/5] Checking Gradle Wrapper...
if not exist "gradle\wrapper\gradle-wrapper.jar" (
    echo [ERROR] gradle-wrapper.jar not found!
    echo Please check: android\gradle\wrapper\gradle-wrapper.jar
    pause
    exit /b 1
)
echo [OK] gradle-wrapper.jar found
echo.

REM Check JAVA_HOME
echo [3/5] Checking Java installation...
if "%JAVA_HOME%"=="" (
    echo [WARNING] JAVA_HOME environment variable is not set
    echo Trying to use system Java...
    where java >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Java not found! Please install JDK 11 or higher.
        pause
        exit /b 1
    )
) else (
    echo [OK] JAVA_HOME: %JAVA_HOME%
)
java -version 2>&1 | findstr /i "version"
echo.

REM Clean previous build (optional)
echo [4/5] Cleaning previous build...
call gradlew.bat clean 2>nul
if errorlevel 1 (
    echo [WARNING] Clean failed, continuing anyway...
)
echo.

REM Build APK
echo [5/5] Building Release APK...
echo This may take 5-15 minutes on first build...
echo.
call gradlew.bat assembleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo APK Location:
    echo   app\build\outputs\apk\release\app-release.apk
    echo.
    echo Full Path:
    echo   %CD%\app\build\outputs\apk\release\app-release.apk
    echo.
    if exist "app\build\outputs\apk\release\app-release.apk" (
        for %%A in ("app\build\outputs\apk\release\app-release.apk") do (
            echo   File Size: %%~zA bytes
        )
    )
    echo.
    echo You can now install this APK on your Android device.
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo.
    echo Exit Code: %ERRORLEVEL%
    echo.
    echo Troubleshooting:
    echo 1. Make sure you have JDK 11 or higher installed
    echo 2. Check JAVA_HOME environment variable
    echo 3. Run: gradlew.bat clean
    echo 4. Check internet connection (first build needs to download dependencies)
    echo.
)

echo.
pause
