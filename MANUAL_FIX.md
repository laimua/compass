# Gradle Wrapper 手动修复指南

## 问题
gradle-wrapper.jar 文件损坏，导致无法构建 APK。

## 最简单的解决方案（推荐）

### 方法 1：使用批处理脚本

1. 打开 **CMD**（不是 PowerShell）
2. 运行以下命令：

```cmd
cd D:\work\compass\android
FIX_WRAPPER.bat
```

这个脚本会自动下载正确的文件并修复配置。

### 方法 2：使用 PowerShell 脚本（英文版）

```powershell
cd D:\work\compass\android
.\fix-wrapper.ps1
```

### 方法 3：完全手动修复

如果上述方法都失败，按照以下步骤手动修复：

#### 步骤 1：删除损坏的文件

打开文件资源管理器，导航到：
```
D:\work\compass\android\gradle\wrapper
```

删除以下文件（如果存在）：
- `gradle-wrapper.jar`

#### 步骤 2：手动下载 gradle-wrapper.jar

**选项 A：从 Gradle 发行版提取**

1. 下载 Gradle 7.5.1 完整版：
   ```
   https://services.gradle.org/distributions/gradle-7.5.1-bin.zip
   ```

2. 解压下载的 zip 文件

3. 从解压后的目录复制文件：
   ```
   gradle-7.5.1/lib/gradle-wrapper.jar
   ```
   复制到：
   ```
   D:\work\compass\android\gradle\wrapper\
   ```

**选项 B：从 GitHub 下载**

1. 访问：
   ```
   https://github.com/gradle/gradle/blob/v7.5.1/gradle/wrapper/gradle-wrapper.jar
   ```

2. 点击 "Download" 按钮（或右键 → 另存为）

3. 保存到：
   ```
   D:\work\compass\android\gradle\wrapper\gradle-wrapper.jar
   ```

**选项 C：使用浏览器直接下载**

复制以下链接到浏览器地址栏：
```
https://raw.githubusercontent.com/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar
```

浏览器会自动下载文件，下载后将其移动到：
```
D:\work\compass\android\gradle\wrapper\gradle-wrapper.jar
```

#### 步骤 3：验证文件

文件应约为 **60 KB**（61,716 字节）

在 CMD 中检查：
```cmd
dir D:\work\compass\android\gradle\wrapper\gradle-wrapper.jar
```

#### 步骤 4：更新配置文件

确保 `gradle-wrapper.properties` 内容正确：

```
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-7.5.1-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

#### 步骤 5：清理缓存（可选但推荐）

在 CMD 中运行：
```cmd
rd /s /q "%USERPROFILE%\.gradle\wrapper\dists\gradle-7.5.1-bin"
```

或直接在文件资源管理器中删除：
```
C:\Users\你的用户名\.gradle\wrapper\dists\gradle-7.5.1-bin
```

#### 步骤 6：测试

```cmd
cd D:\work\compass\android
gradlew.bat --version
```

应该看到：
```
Gradle 7.5.1
Build time:   2022-08-02 00:00:00 UTC
Build hash:   xxx
```

#### 步骤 7：构建 APK

```cmd
cd D:\work\compass\android
build-apk-simple.bat
```

或：
```cmd
gradlew.bat assembleDebug
```

### 方法 4：使用 Android Studio（终极方案）

如果以上所有方法都失败，使用 Android Studio：

1. **安装 Android Studio**（如果还没有）
   - 下载：https://developer.android.com/studio
   - 安装并启动

2. **打开项目**
   - File → Open
   - 选择：`D:\work\compass\android`
   - 等待 Gradle 同步完成（会自动下载正确的 wrapper）

3. **构建 APK**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - 等待构建完成
   - 点击通知中的 "locate" 查看 APK 位置

## 快速诊断

运行以下命令检查当前状态：

```cmd
cd D:\work\compass\android\gradle\wrapper
dir
```

应该看到：
- `gradle-wrapper.jar` (约 60KB)
- `gradle-wrapper.properties`

如果缺少任何文件，按照上面的步骤补上。

## 文件清单

修复后，以下文件应该存在：

### 必需文件
- `android/gradle/wrapper/gradle-wrapper.jar` (60KB)
- `android/gradle/wrapper/gradle-wrapper.properties`
- `android/gradlew`
- `android/gradlew.bat`

### 辅助脚本
- `android/FIX_WRAPPER.bat` - 批处理修复脚本
- `android/fix-wrapper.ps1` - PowerShell 修复脚本
- `android/build-apk-simple.bat` - 简单构建脚本

## 成功标志

修复成功后，运行 `gradlew.bat --version` 应该显示 Gradle 版本信息。

然后可以运行 `build-apk-simple.bat` 开始构建 APK。

## 预计时间

- 下载 Gradle：1-2 分钟
- 手动复制文件：1 分钟
- 测试：1 分钟
- **总计**：3-5 分钟

## 需要帮助？

如果问题仍然存在：

1. 检查网络连接
2. 尝试使用不同的浏览器下载
3. 使用 Android Studio（最可靠）
4. 查看 `GRADLE_FIX_GUIDE.md` 获取更多方案
