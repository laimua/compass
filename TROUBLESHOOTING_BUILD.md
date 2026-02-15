# Gradle 构建问题排查与解决方案

## 问题：找不到或无法加载主类 org.gradle.wrapper.GradleWrapperMain

### ✅ 已修复（2024-01-31）

**原因**：gradle-wrapper.jar 文件名不正确
- 错误文件名：`gradle-wrapper-7.5.1.jar`
- 正确文件名：`gradle-wrapper.jar`

**解决方案**：已自动重命名文件，现在可以正常构建。

---

## 构建脚本说明

项目提供了多个构建脚本，按推荐顺序使用：

### 1. **build-debug-apk-v2.ps1** (最推荐)
- PowerShell 脚本
- 包含完整的错误诊断
- 显示详细的构建进度
- 彩色输出，易于阅读

**使用方法**：
```powershell
# 在 PowerShell 中
cd D:\work\compass\android
.\build-debug-apk-v2.ps1
```

### 2. **build-debug-apk-v2.bat**
- Windows 批处理脚本
- 包含详细的步骤说明
- 适合 CMD 环境

**使用方法**：
```cmd
# 在 CMD 中
cd D:\work\compass\android
build-debug-apk-v2.bat
```

### 3. **build-debug-apk.bat**
- 简单版本
- 适合快速构建

### 4. **手动执行**
```cmd
cd D:\work\compass\android
gradlew.bat assembleDebug
```

---

## 常见问题排查

### 问题 1：gradlew.bat 不是内部或外部命令

**症状**：
```
'gradlew.bat' 不是内部或外部命令，也不是可运行的程序
```

**解决方案**：
1. 确保在 `android` 目录下执行命令
2. 检查 `gradlew.bat` 文件是否存在：
   ```cmd
   dir gradlew.bat
   ```

### 问题 2：Java 未安装或版本过低

**症状**：
```
ERROR: JAVA_HOME is not set
```

**解决方案**：
1. 安装 JDK 11 或更高版本
2. 设置 JAVA_HOME 环境变量：
   ```cmd
   setx JAVA_HOME "C:\Program Files\Java\jdk-11"
   ```
3. 验证安装：
   ```cmd
   java -version
   ```

### 问题 3：Gradle 下载失败

**症状**：
```
Could not install Gradle distribution from https://services.gradle.org/...
```

**解决方案**：
1. 检查网络连接
2. 配置国内镜像（在 `android/build.gradle` 中）：
   ```gradle
   allprojects {
       repositories {
           maven { url 'https://maven.aliyun.com/repository/google' }
           maven { url 'https://maven.aliyun.com/repository/public' }
           google()
           mavenCentral()
       }
   }
   ```
3. 或手动下载 Gradle：
   - 访问：https://gradle.org/releases/
   - 下载 gradle-7.5.1-bin.zip
   - 解压到：`%USERPROFILE%\.gradle\wrapper\dists\gradle-7.5.1-bin\[随机hash]\gradle-7.5.1`

### 问题 4：构建失败 - 内存不足

**症状**：
```
java.lang.OutOfMemoryError: Java heap space
```

**解决方案**：
在 `android/gradle.properties` 中添加：
```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
```

### 问题 5：依赖下载缓慢或超时

**解决方案**：
在 `android/build.gradle` 中配置镜像：

```gradle
buildscript {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/public' }
        google()
        mavenCentral()
    }
}

allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/public' }
        google()
        mavenCentral()
    }
}
```

### 问题 6：PowerShell 执行策略限制

**症状**：
```
无法加载文件 build-debug-apk-v2.ps1，因为在此系统上禁止运行脚本
```

**解决方案**：
```powershell
# 临时允许（推荐）
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 然后运行脚本
.\build-debug-apk-v2.ps1
```

---

## 快速诊断步骤

### 步骤 1：运行测试脚本
```cmd
cd D:\work\compass\android
test-gradle.bat
```

这个脚本会检查：
- ✅ gradle-wrapper.jar 是否存在
- ✅ Java 是否安装
- ✅ Gradle 是否可以正常运行

### 步骤 2：检查环境
```cmd
# 检查 Java
java -version

# 检查 JAVA_HOME
echo %JAVA_HOME%

# 检查当前目录
cd

# 检查文件
dir gradle\wrapper\gradle-wrapper.jar
```

### 步骤 3：清理并重试
```cmd
cd D:\work\compass\android
gradlew.bat clean
gradlew.bat assembleDebug
```

---

## 构建成功标志

看到以下输出表示构建成功：

```
BUILD SUCCESSFUL in 2m 15s
XX actionable tasks: XX executed
```

APK 文件位置：
```
android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 验证 APK

### 1. 检查文件大小
正常的 debug APK 大小约为 20-50 MB

```cmd
dir android\app\build\outputs\apk\debug\app-debug.apk
```

### 2. 使用 aapt 查看 APK 信息（如果有 Android SDK）
```cmd
%ANDROID_HOME%\build-tools\33.0.0\aapt.exe dump badging android\app\build\outputs\apk\debug\app-debug.apk
```

### 3. 安装到设备
```cmd
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 性能优化建议

### 首次构建
- 下载依赖：5-10 分钟
- 构建时间：2-5 分钟
- **总计**：约 7-15 分钟

### 后续构建
- 增量构建：1-3 分钟

### 加速构建
1. 使用 Gradle 缓存：
   ```properties
   # android/gradle.properties
   org.gradle.caching=true
   ```

2. 并行构建：
   ```properties
   org.gradle.parallel=true
   ```

3. 配置堆内存：
   ```properties
   org.gradle.jvmargs=-Xmx2048m
   ```

---

## 获取帮助

如果以上方法都无法解决问题，请：

1. **检查日志文件**：
   - `android/build.log`
   - `android/app/build/outputs/logs/debug.log`

2. **运行诊断命令**：
   ```cmd
   gradlew.bat --info
   gradlew.bat --debug
   gradlew.bat --stacktrace
   ```

3. **查看完整错误信息**并搜索解决方案

4. **确认环境要求**：
   - Windows 10/11
   - JDK 11+
   - 至少 4GB RAM
   - 稳定的网络连接（首次构建）

---

## 文件清单

项目中的构建相关文件：

- `android/build-debug-apk.bat` - 原始批处理脚本
- `android/build-debug-apk-v2.bat` - 改进版批处理脚本（推荐）
- `android/build-debug-apk-v2.ps1` - PowerShell 脚本（最推荐）
- `android/test-gradle.bat` - Gradle 测试脚本
- `android/gradle/wrapper/gradle-wrapper.jar` - Gradle Wrapper（已修复）
- `BUILD_APK.md` - APK 构建指南
- `TROUBLESHOOTING_BUILD.md` - 本文件（故障排查指南）
