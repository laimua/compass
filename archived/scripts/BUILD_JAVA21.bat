@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

echo ========================================
echo Building Compass APK with Java 21
echo ========================================
echo.

cd /d %~dp0

echo Working Directory: %CD%
echo.

echo Setting JAVA_HOME to Java 21...
set "JAVA_HOME=C:\Program Files\Java\latest\jdk-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo JAVA_HOME: %JAVA_HOME%
echo.

echo [1/4] Checking Java...
java -version
echo.

echo [2/4] Checking Gradle Wrapper...
if exist "gradle\wrapper\gradle-wrapper.jar" (
    echo Found: gradle\wrapper\gradle-wrapper.jar
) else (
    echo ERROR: gradle-wrapper.jar not found!
    pause
    exit /b 1
)
echo.

echo [3/4] Building Debug APK...
echo This may take 5-15 minutes on first build
echo.

call gradlew.bat assembleDebug

echo.
echo [4/4] Build Result...
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    if exist "app\build\outputs\apk\debug\app-debug.apk" (
        echo APK Location: app\build\outputs\apk\debug\app-debug.apk
        dir "app\build\outputs\apk\debug\app-debug.apk"
        echo.
        echo You can install this APK on your device!
    )
) else (
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo.
    echo Exit Code: %ERRORLEVEL%
)

echo.
pause
