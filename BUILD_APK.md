# Android APK 构建指南

## 方法一：使用命令行（推荐）

### 1. 打开 PowerShell 或 命令提示符（CMD）

**重要**：请使用 Windows PowerShell 或 CMD，**不要**使用 Git Bash

### 2. 进入 android 目录

```powershell
# PowerShell
cd D:\work\compass\android

# 或使用 CMD
cd D:\work\compass\android
```

### 3. 构建调试版 APK

```powershell
# 方式 1：直接运行 gradlew
gradlew.bat assembleDebug

# 方式 2：使用提供的脚本
.\build-debug-apk.bat
```

### 4. 查找生成的 APK

构建成功后，APK 文件位于：
```
android\app\build\outputs\apk\debug\app-debug.apk
```

## 方法二：使用 Android Studio

1. 打开 Android Studio
2. 选择 `File` → `Open` → 选择 `D:\work\compass\android` 目录
3. 等待 Gradle 同步完成
4. 在菜单栏选择 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
5. 构建完成后点击通知中的 `locate` 查找 APK 文件

## 方法三：使用 PowerShell 脚本

在项目根目录打开 PowerShell，运行：

```powershell
cd android
.\build-debug-apk.ps1
```

如果遇到执行策略错误，需要先运行：
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## 构建发布版 APK

### 1. 生成签名密钥（首次构建时）

```powershell
cd android
keytool -genkeypair -v -storetype PKCS12 -keystore release-keystore.keystore -alias compass-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**重要**：请妥善保管 `release-keystore.keystore` 文件和密码！

### 2. 配置签名

编辑 `android/app/build.gradle`，在 `android` 块中添加：

```gradle
signingConfigs {
    release {
        storeFile file('release-keystore.keystore')
        storePassword 'your-password'
        keyAlias 'compass-key-alias'
        keyPassword 'your-password'
    }
}

buildTypes {
    release {
        ...
        signingConfig signingConfigs.release
    }
}
```

### 3. 构建发布版 APK

```powershell
gradlew.bat assembleRelease
```

生成的发布版 APK 位于：
```
android\app\build\outputs\apk\release\app-release.apk
```

## 常见问题

### 问题 1：gradlew.bat 不是内部或外部命令

**解决方案**：
- 确保在 `android` 目录下执行命令
- 检查 `gradlew.bat` 文件是否存在

### 问题 2：Gradle 构建失败

**解决方案**：
```powershell
# 清理构建缓存
gradlew.bat clean

# 重新构建
gradlew.bat assembleDebug
```

### 问题 3：找不到 Java

**解决方案**：
- 安装 JDK 11 或更高版本
- 设置 JAVA_HOME 环境变量
```powershell
# 检查 Java 版本
java -version
```

### 问题 4：网络问题导致依赖下载失败

**解决方案**：
```powershell
# 配置 Gradle 使用国内镜像
# 编辑 android/build.gradle，添加：
repositories {
    maven { url 'https://maven.aliyun.com/repository/google' }
    maven { url 'https://maven.aliyun.com/repository/public' }
    google()
    mavenCentral()
}
```

## 快速构建步骤总结

1. 打开 PowerShell
2. `cd D:\work\compass\android`
3. `.\build-debug-apk.bat` 或 `gradlew.bat assembleDebug`
4. 等待构建完成（首次构建可能需要 5-10 分钟）
5. 在 `android\app\build\outputs\apk\debug\` 找到 APK 文件

## 安装 APK 到设备

### 使用 ADB
```powershell
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### 直接传输
将 APK 文件复制到手机，使用文件管理器打开并安装。

## 构建时间

- **首次构建**：5-15 分钟（需要下载依赖）
- **后续构建**：1-3 分钟

## 验证构建

构建成功后会看到类似输出：
```
BUILD SUCCESSFUL in 2m 15s
XX actionable tasks: XX executed
```

## 相关文件

- `android/build-debug-apk.bat` - Windows 批处理脚本
- `android/build-debug-apk.ps1` - PowerShell 脚本
- `android/app/build.gradle` - 构建配置文件
