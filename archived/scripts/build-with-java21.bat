@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Building APK with Java 21
echo ========================================
echo.

cd /d %~dp0

echo Setting JAVA_HOME to Java 21...
set "JAVA_HOME=C:\Program Files\Java\latest\jdk-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo JAVA_HOME=%JAVA_HOME%
echo.

echo Checking Java version...
"%JAVA_HOME%\bin\java" -version
echo.

echo Stopping any running Gradle daemons...
call gradlew.bat --stop
echo.

echo Building APK...
echo.

call gradlew.bat assembleDebug

echo.
echo ========================================
echo Build Complete
echo ========================================
echo.

if %ERRORLEVEL% EQU 0 (
    echo SUCCESS!
    echo.
    if exist "app\build\outputs\apk\debug\app-debug.apk" (
        echo APK Location: app\build\outputs\apk\debug\app-debug.apk
        echo.
        dir "app\build\outputs\apk\debug\app-debug.apk"
        echo.
        echo You can install this APK on your device!
        echo.
        echo Opening folder...
        explorer.exe "app\build\outputs\apk\debug"
    )
) else (
    echo FAILED with exit code: %ERRORLEVEL%
    echo.
    echo Please check the error messages above.
)

echo.
pause
