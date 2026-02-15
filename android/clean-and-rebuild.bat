@echo off
echo ========================================
echo 强制清理并重建 Gradle
echo ========================================
echo.

cd /d %~dp0

echo [1/4] 删除 .gradle 缓存目录...
if exist "..\.gradle" (
    rd /s /q "..\.gradle"
    echo 已删除项目 .gradle 缓存
)

echo.
echo [2/4] 删除 build 目录...
if exist "app\build" (
    rd /s /q "app\build"
    echo 已删除 build 目录
)

echo.
echo [3/4] 删除 Gradle wrapper 缓存...
set GRADLE_CACHE=%USERPROFILE%\.gradle\wrapper\dists\gradle-7.5.1-bin
if exist "%GRADLE_CACHE%" (
    echo 正在清理: %GRADLE_CACHE%
    for /d %%d in ("%GRADLE_CACHE%\*") do (
        rd /s /q "%%d" 2>nul
    )
    echo 已清理 Gradle wrapper 缓存
)

echo.
echo [4/4] 测试 Gradle Wrapper...
echo.
call gradlew.bat --version

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo 清理成功!
    echo ========================================
    echo.
    echo 现在可以运行构建:
    echo   build-debug-apk-v2.bat
) else (
    echo.
    echo ========================================
    echo 仍有问题!
    echo ========================================
    echo.
    echo 请尝试:
    echo   1. 重启计算机
    echo   2. 手动删除 C:\Users\你的用户名\.gradle
    echo   3. 重新运行此脚本
)

echo.
pause
