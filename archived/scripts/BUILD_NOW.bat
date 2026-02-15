@echo off
setlocal

echo.
echo ========================================
echo Building Compass APK
echo ========================================
echo.
echo Working directory: %CD%
echo.

cd /d %~dp0

echo.
echo Checking Java...
java -version
echo.

echo Checking Gradle Wrapper...
dir gradle\wrapper\gradle-wrapper.jar
echo.

echo ========================================
echo Starting Gradle Build
echo ========================================
echo.

call gradlew.bat assembleDebug

echo.
echo ========================================
echo Build Result
echo ========================================
echo.

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Build completed!
    echo.
    if exist "app\build\outputs\apk\debug\app-debug.apk" (
        echo APK File:
        echo   Location: app\build\outputs\apk\debug\app-debug.apk
        echo.
        dir "app\build\outputs\apk\debug\app-debug.apk"
        echo.
        echo You can install this APK on your Android device!
    )
) else (
    echo [FAILED] Build failed with exit code: %ERRORLEVEL%
    echo.
    echo Please check the error messages above.
)

echo.
pause
