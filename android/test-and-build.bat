@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Test Gradle and Build APK
echo ========================================
echo.

cd /d %~dp0

echo [Step 1/3] Testing Gradle...
echo This will download Gradle 7.5.1 on first run...
echo.

call gradlew.bat --version

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo Gradle test FAILED!
    echo ========================================
    echo.
    echo Possible reasons:
    echo   1. Java not installed or wrong version
    echo   2. JAVA_HOME not set correctly
    echo   3. Network issues downloading Gradle
    echo.
    echo Please check:
    echo   java -version
    echo   echo %%JAVA_HOME%%
    pause
    exit /b 1
)

echo.
echo ========================================
echo Gradle is working!
echo ========================================
echo.
echo [Step 2/3] Cleaning previous build...
echo.

call gradlew.bat clean

echo.
echo [Step 3/3] Building Debug APK...
echo This may take 5-15 minutes on first build...
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

    if exist "app\build\outputs\apk\debug\app-debug.apk" (
        echo File details:
        dir "app\build\outputs\apk\debug\app-debug.apk"
        echo.
        echo You can now install this APK on your device!
    )
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
)

echo.
pause
