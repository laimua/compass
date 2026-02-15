# Gradle Wrapper 修复完整指南

## 问题诊断

你遇到的问题是：
```
错误: 无法初始化主类 org.gradle.wrapper.GradleWrapperMain
原因: java.lang.NoClassDefFoundError: org/gradle/wrapper/IDownload
```

即使升级到 Java 21 后仍然存在此错误，这说明 **gradle-wrapper.jar 文件损坏或不兼容**。

## ✅ 已完成的修复步骤

1. ✅ 升级 Java 到 21.0.10
2. ✅ 重新下载 gradle-wrapper.jar（60KB）
3. ✅ 清理项目 .gradle 缓存

## 🔧 进一步修复方案

### 方案 1：强制清理并重建（推荐）

在 PowerShell 中运行：

```powershell
cd D:\work\compass\android

# 运行修复脚本
.\fix-gradle-wrapper.ps1
```

这个脚本会：
- 备份现有的 wrapper 文件
- 从官方源重新下载正确的 gradle-wrapper.jar
- 验证配置文件
- 清理 Gradle 缓存
- 测试 Gradle 是否正常工作

### 方案 2：完全清理 Gradle 缓存

**步骤 1**：关闭所有 IDE 和终端

**步骤 2**：删除用户 Gradle 缓存

```powershell
# 删除整个 .gradle 目录（需要关闭所有使用 Gradle 的程序）
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle"
```

或在文件资源管理器中：
- 导航到：`C:\Users\你的用户名\.gradle`
- 删除整个 `.gradle` 文件夹

**步骤 3**：重启计算机

**步骤 4**：重新构建

```powershell
cd D:\work\compass\android
.\build-debug-apk-v2.ps1
```

### 方案 3：使用批处理脚本

在 **CMD** 中运行：

```cmd
cd D:\work\compass\android
clean-and-rebuild.bat
```

### 方案 4：手动修复（终极方案）

如果以上方法都不行，尝试以下步骤：

**步骤 1**：完全删除 wrapper 相关文件

```powershell
cd D:\work\compass\android\gradle\wrapper
Remove-Item gradle-wrapper.jar -Force
```

**步骤 2**：手动下载正确的文件

访问以下 URL 下载：
```
https://services.gradle.org/distributions/gradle-7.5.1-bin.zip
```

**步骤 3**：解压并提取

1. 解压下载的 `gradle-7.5.1-bin.zip`
2. 从解压后的 `lib/` 目录找到 `gradle-wrapper.jar`
3. 复制到 `android/gradle/wrapper/` 目录

**步骤 4**：验证文件大小

```powershell
cd D:\work\compass\android\gradle\wrapper
dir gradle-wrapper.jar
```

文件大小应该约为 60KB（61,716 字节）

**步骤 5**：重新构建

```powershell
cd D:\work\compass\android
.\gradlew.bat --version
```

## 🧪 测试命令

在执行构建前，先测试 Gradle 是否正常：

```powershell
cd D:\work\compass\android

# 测试版本
.\gradlew.bat --version

# 如果成功，会显示类似：
# Gradle 7.5.1
# Build time:   2022-08-02
# ...
```

## 📋 完整修复清单

按顺序尝试以下方案：

- [ ] **方案 0**：运行 `.\fix-gradle-wrapper.ps1`
- [ ] **方案 1**：运行 `clean-and-rebuild.bat`
- [ ] **方案 2**：删除 `%USERPROFILE%\.gradle` 并重启
- [ ] **方案 3**：手动下载并替换 gradle-wrapper.jar
- [ ] **方案 4**：完全重装 Gradle Wrapper
- [ ] **方案 5**：在其他电脑上构建，然后复制 APK

## 🚀 方案 5：重新生成 Gradle Wrapper

如果所有方法都失败，可以重新生成整个 Gradle Wrapper：

```powershell
cd D:\work\compass\android

# 删除现有的 wrapper
Remove-Item gradle\wrapper -Recurse -Force
Remove-Item gradlew -Force
Remove-Item gradlew.bat -Force

# 使用 Gradle 命令重新生成（需要先安装 Gradle）
# 或者使用 Android Studio 的 "Sync Project with Gradle Files"
```

或者直接在 Android Studio 中：
1. 打开 Android Studio
2. 打开 `android` 目录
3. 等待自动同步完成
4. 使用 Android Studio 的 Build 功能

## 💡 临时解决方案

如果急需 APK，可以：

### 选项 A：使用 Android Studio

1. 安装 Android Studio
2. 打开 `D:\work\compass\android` 目录
3. 等待 Gradle 同步完成
4. Build → Build Bundle(s) / APK(s) → Build APK(s)

### 选项 B：在另一台电脑上构建

将项目复制到另一台电脑，在那里构建 APK。

### 选项 C：使用 CI/CD 服务

- GitHub Actions
- GitLab CI
- CircleCI

## 🔍 深层诊断

如果问题仍然存在，可能的原因：

### 1. 权限问题

```powershell
# 检查文件权限
icacls android\gradle\wrapper\gradle-wrapper.jar
```

### 2. 防病毒软件干扰

某些防病毒软件会阻止 gradle-wrapper.jar 的执行。

**解决方案**：暂时禁用防病毒软件或将目录添加到白名单。

### 3. 文件损坏

多次下载失败导致文件损坏。

**解决方案**：删除所有缓存后重新下载。

### 4. Java 版本冲突

虽然你安装了 Java 21，但系统可能仍在使用旧版本。

**验证**：
```powershell
java -version
where.exe java
echo $env:JAVA_HOME
```

确保输出都是 Java 21。

### 5. 环境变量问题

检查 `Path` 环境变量中是否还有旧 Java 的引用。

```powershell
$env:Path -split ';' | Select-String "java"
```

## 🎯 推荐操作顺序

1. **立即尝试**：`.\fix-gradle-wrapper.ps1`
2. **如果失败**：删除 `%USERPROFILE%\.gradle` 并重启
3. **如果还失败**：手动下载 gradle-wrapper.jar
4. **最终方案**：使用 Android Studio 构建

## 📞 获取帮助

如果以上所有方法都失败：

1. **查看详细日志**：
   ```powershell
   .\gradlew.bat assembleDebug --debug --stacktrace
   ```

2. **收集诊断信息**：
   ```powershell
   .\gradlew.bat --version
   java -version
   echo $env:JAVA_HOME
   dir gradle\wrapper\gradle-wrapper.jar
   ```

3. **搜索类似问题**：
   - GitHub Issues
   - Stack Overflow
   - React Native 中文社区

## 📝 相关文件

- `android/fix-gradle-wrapper.ps1` - 自动修复脚本
- `android/clean-and-rebuild.bat` - 清理并重建
- `android/build-with-clean.bat` - 清理并构建
- `TROUBLESHOOTING_BUILD.md` - 构建故障排查
- `JAVA_VERSION_FIX.md` - Java 版本修复指南
