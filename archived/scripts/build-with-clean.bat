@echo off
echo ========================================
echo 清理并构建 Debug APK
echo ========================================
echo.

cd /d %~dp0

echo [步骤 1/3] 清理项目...
call gradlew.bat clean
echo.

echo [步骤 2/3] 下载依赖（首次运行会下载 Gradle）...
call gradlew.bat dependencies --configuration compileClasspath
echo.

echo [步骤 3/3] 构建 Debug APK...
call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo 构建成功!
    echo ========================================
    echo.
    echo APK 位置: app\build\outputs\apk\debug\app-debug.apk
) else (
    echo.
    echo ========================================
    echo 构建失败!
    echo ========================================
    echo.
    echo 请查看上面的错误信息
)

echo.
pause
