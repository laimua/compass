# Java Version Checker for Compass Build
# 检查 Java 版本是否满足 React Native 0.74.0 要求

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Java Version Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 获取 Java 版本
try {
    $javaOutput = & java -version 2>&1
    $versionLine = $javaOutput | Select-String "version"
    Write-Host "Current Java Version:" -ForegroundColor Yellow
    Write-Host "  $versionLine" -ForegroundColor White
    Write-Host ""

    # 提取版本号
    if ($versionLine -match 'version "(\d+)\.(\d+)"') {
        $majorVersion = [int]$matches[1]
        $minorVersion = [int]$matches[2]

        # Java 8 的版本号是 1.8，需要特殊处理
        if ($majorVersion -eq 1 -and $minorVersion -eq 8) {
            Write-Host "[ERROR] Java 8 is not supported!" -ForegroundColor Red
            Write-Host ""
            Write-Host "React Native 0.74.0 requires:" -ForegroundColor Yellow
            Write-Host "  - Java 11 or higher" -ForegroundColor White
            Write-Host "  - Gradle 7.5.1" -ForegroundColor White
            Write-Host ""
            Write-Host "Your Java version: 1.8 (Java 8)" -ForegroundColor Red
            Write-Host ""
            Write-Host "SOLUTION:" -ForegroundColor Green
            Write-Host "  1. Download JDK 11 or higher:" -ForegroundColor White
            Write-Host "     https://adoptium.net/temurin/releases/?version=11" -ForegroundColor Cyan
            Write-Host "  2. Install JDK" -ForegroundColor White
            Write-Host "  3. Update JAVA_HOME environment variable:" -ForegroundColor White
            Write-Host "     setx JAVA_HOME `"C:\Program Files\Eclipse Adoptium\jdk-11.0.xx`" /M" -ForegroundColor Cyan
            Write-Host "  4. Restart PowerShell and verify:" -ForegroundColor White
            Write-Host "     java -version" -ForegroundColor Cyan
            Write-Host ""
        } elseif ($majorVersion -ge 11 -or ($majorVersion -eq 1 -and $minorVersion -ge 11)) {
            Write-Host "[OK] Java version is compatible!" -ForegroundColor Green
            Write-Host ""

            if ($env:JAVA_HOME) {
                Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Cyan
            } else {
                Write-Host "[WARNING] JAVA_HOME not set" -ForegroundColor Yellow
            }

            Write-Host ""
            Write-Host "You can proceed with the build:" -ForegroundColor Green
            Write-Host "  .\build-debug-apk-v2.ps1" -ForegroundColor Cyan
        } else {
            Write-Host "[WARNING] Java version may not be optimal" -ForegroundColor Yellow
            Write-Host "Recommended: Java 11 or higher" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "[ERROR] Java not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Java Development Kit (JDK) 11 or higher:" -ForegroundColor Yellow
    Write-Host "https://adoptium.net/temurin/releases/?version=11" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host
