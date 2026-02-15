# Gradle Wrapper 修复脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Gradle Wrapper 修复工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

# 步骤 1: 备份现有的 wrapper
Write-Host "[1/5] 备份现有的 Gradle Wrapper..." -ForegroundColor Yellow
$wrapperDir = "gradle\wrapper"
$backupDir = "gradle\wrapper\backup"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

if (Test-Path "$wrapperDir\gradle-wrapper.jar") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item "$wrapperDir\gradle-wrapper.jar" "$backupDir\gradle-wrapper.jar.$timestamp"
    Write-Host "  已备份到: $backupDir\gradle-wrapper.jar.$timestamp" -ForegroundColor Green
}

# 步骤 2: 下载正确的 gradle-wrapper.jar
Write-Host "[2/5] 下载 Gradle Wrapper..." -ForegroundColor Yellow
try {
    $url = "https://github.com/gradle/gradle/raw/v7.5.1/gradle/wrapper/gradle-wrapper.jar"
    $output = "$wrapperDir\gradle-wrapper.jar"

    Write-Host "  从 $url 下载..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing

    $fileSize = (Get-Item $output).Length
    Write-Host "  下载完成: $fileSize 字节" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] 下载失败: $_" -ForegroundColor Red
    Write-Host "  尝试使用备用源..." -ForegroundColor Yellow

    try {
        $url2 = "https://services.gradle.org/distributions/gradle-7.5.1-bin.zip"
        $output2 = "$env:TEMP\gradle-7.5.1-bin.zip"

        Write-Host "  下载完整的 Gradle 发行版..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $url2 -OutFile $output2 -UseBasicParsing

        Write-Host "  解压并提取 wrapper..." -ForegroundColor Cyan
        Expand-Archive -Path $output2 -DestinationPath $env:TEMP\gradle -Force

        Copy-Item "$env:TEMP\gradle\gradle-7.5.1\lib\gradle-wrapper.jar" $output -Force
        Write-Host "  提取完成" -ForegroundColor Green

        # 清理临时文件
        Remove-Item $output2 -Force
        Remove-Item "$env:TEMP\gradle" -Recurse -Force
    } catch {
        Write-Host "  [ERROR] 备用方案也失败了: $_" -ForegroundColor Red
        Read-Host "按 Enter 退出"
        exit 1
    }
}

# 步骤 3: 验证 gradle-wrapper.properties
Write-Host "[3/5] 验证配置文件..." -ForegroundColor Yellow
$propertiesFile = "$wrapperDir\gradle-wrapper.properties"

if (Test-Path $propertiesFile) {
    $content = Get-Content $propertiesFile
    Write-Host "  当前配置:" -ForegroundColor Cyan
    Write-Host "  $content" -ForegroundColor White

    # 确保使用正确的 Gradle 版本
    $newContent = @"
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-7.5.1-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
"@

    Set-Content -Path $propertiesFile -Value $newContent -Encoding UTF8
    Write-Host "  配置已更新" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] 配置文件不存在!" -ForegroundColor Red
}

# 步骤 4: 清理 Gradle 缓存
Write-Host "[4/5] 清理 Gradle 缓存..." -ForegroundColor Yellow
$userGradleDir = "$env:USERPROFILE\.gradle"
$cachesDir = "$userGradleDir\caches"

if (Test-Path $cachesDir) {
    Write-Host "  清理缓存目录: $cachesDir" -ForegroundColor Cyan
    # 删除 wrapper 缓存，强制重新下载 Gradle
    $wrapperCache = "$userGradleDir\wrapper\dists\gradle-7.5.1-bin"
    if (Test-Path $wrapperCache) {
        Remove-Item "$wrapperCache\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  Wrapper 缓存已清理" -ForegroundColor Green
    }
}

# 步骤 5: 测试 Gradle
Write-Host "[5/5] 测试 Gradle..." -ForegroundColor Yellow
Write-Host ""

& ".\gradlew.bat" "--version"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "修复成功!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "现在可以运行构建命令:" -ForegroundColor Cyan
    Write-Host "  .\build-debug-apk-v2.ps1" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "修复失败!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "请尝试以下步骤:" -ForegroundColor Yellow
    Write-Host "  1. 手动删除 %USERPROFILE%\.gradle 目录" -ForegroundColor White
    Write-Host "  2. 重启计算机" -ForegroundColor White
    Write-Host "  3. 重新运行此脚本" -ForegroundColor White
}

Write-Host ""
Read-Host "按 Enter 退出"
