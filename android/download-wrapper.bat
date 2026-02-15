@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

echo ========================================
echo Download gradle-wrapper.jar
echo ========================================
echo.

cd /d %~dp0\gradle\wrapper

echo Target directory: %CD%
echo.

echo [Step 1/3] Backing up existing file...
if exist gradle-wrapper.jar (
    copy gradle-wrapper.jar gradle-wrapper.jar.backup >nul
    echo Backed up to gradle-wrapper.jar.backup
)

echo.
echo [Step 2/3] Downloading gradle-wrapper.jar...
echo.
echo Trying GitHub (primary source)...
echo.

curl -L -o gradle-wrapper.jar "https://raw.githubusercontent.com/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar"

if %ERRORLEVEL% EQU 0 (
    if exist gradle-wrapper.jar (
        for %%A in (gradle-wrapper.jar) do set size=%%~zA
        echo.
        echo Download successful! File size: !size! bytes
        goto :success
    )
)

echo GitHub failed, trying mirror (jsdelivr)...
echo.

curl -L -o gradle-wrapper.jar "https://cdn.jsdelivr.net/gh/gradle/gradle@v7.5.1/gradle/wrapper/gradle-wrapper.jar"

if %ERRORLEVEL% EQU 0 (
    if exist gradle-wrapper.jar (
        for %%A in (gradle-wrapper.jar) do set size=%%~zA
        echo.
        echo Download successful! File size: !size! bytes
        goto :success
    )
)

echo.
echo curl failed, trying PowerShell...
echo.

powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar' -OutFile 'gradle-wrapper.jar'"

if exist gradle-wrapper.jar (
    for %%A in (gradle-wrapper.jar) do set size=%%~zA
    echo.
    echo Download successful! File size: !size! bytes
    goto :success
)

echo.
echo ========================================
echo DOWNLOAD FAILED!
echo ========================================
echo.
echo Please download manually:
echo.
echo 1. Open this link in your browser:
echo    https://raw.githubusercontent.com/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar
echo.
echo 2. Save the downloaded file to:
echo    %CD%
echo.
echo    Filename: gradle-wrapper.jar
echo.
goto :end

:success
echo.
echo ========================================
echo [Step 3/3] Verifying download...
echo ========================================
echo.

for %%A in (gradle-wrapper.jar) do set size=%%~zA

echo File location: %CD%\gradle-wrapper.jar
echo File size: !size! bytes

if !size! LSS 50000 (
    echo.
    echo WARNING: File size is too small! May be corrupted.
    echo Expected size: ~60000 bytes
    echo.
    echo Please try downloading manually from:
    echo https://raw.githubusercontent.com/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar
) else (
    echo.
    echo ========================================
    echo SUCCESS!
    echo ========================================
    echo.
    echo gradle-wrapper.jar has been downloaded successfully!
    echo.
    echo You can now run:
    echo   cd ..\..
    echo   build-apk-simple.bat
)

:end
echo.
pause
