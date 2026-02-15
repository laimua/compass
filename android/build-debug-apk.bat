@echo off
echo Building Debug APK...
cd /d %~dp0
call gradlew.bat assembleDebug
echo.
echo Build complete!
echo APK location: app\build\outputs\apk\debug\app-debug.apk
pause
