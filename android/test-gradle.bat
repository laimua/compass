@echo off
echo Testing Gradle Wrapper...
echo.
cd /d %~dp0
echo Current directory: %CD%
echo.
echo Checking gradle-wrapper.jar...
if exist "gradle\wrapper\gradle-wrapper.jar" (
    echo [OK] gradle-wrapper.jar found
) else (
    echo [ERROR] gradle-wrapper.jar NOT found
    exit /b 1
)
echo.
echo Running gradlew.bat --version...
call gradlew.bat --version
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Gradle is working!
) else (
    echo.
    echo [ERROR] Gradle test failed with exit code: %ERRORLEVEL%
)
pause
