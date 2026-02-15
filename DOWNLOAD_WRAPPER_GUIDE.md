# gradle-wrapper.jar 正确下载位置说明

## 问题
gradle-wrapper.jar 不在 `gradle-7.5.1/lib/` 目录下。

## 正确的下载位置

### 方法 1：从 GitHub 直接下载（推荐）

**直接访问以下链接下载（浏览器会自动下载）**：

```
https://raw.githubusercontent.com/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar
```

下载后，将文件保存到：
```
D:\work\compass\android\gradle\wrapper\gradle-wrapper.jar
```

### 方法 2：使用 curl 或 PowerShell 下载

**使用 PowerShell**：
```powershell
cd D:\work\compass\android\gradle\wrapper
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar" -OutFile "gradle-wrapper.jar"
```

**使用 CMD**：
```cmd
cd D:\work\compass\android\gradle\wrapper
curl -L -o gradle-wrapper.jar https://raw.githubusercontent.com/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar
```

### 方法 3：从其他 Gradle 项目复制

如果你电脑上其他地方有可用的 Gradle 项目：

1. 找到任何一个正常工作的 Gradle 项目的 gradle/wrapper 目录
2. 复制它的 `gradle-wrapper.jar`
3. 粘贴到：`D:\work\compass\android\gradle\wrapper\`

常见位置：
```
C:\Users\你的用户名\.gradle\wrapper\dists\gradle-x.x-bin\[hash]\gradle-x.x\lib\gradle-wrapper-7.5.1.jar
```

### 方法 4：从 Gradle 源代码构建（不推荐）

太复杂，不推荐使用。

## 文件信息

**正确的大小**：约 60-62 KB

**正确的 SHA-256**（可选验证）：
```
sha256sum gradle-wrapper.jar
# 应该输出类似：6c85cb64f829d07fa0250e6e39ad0ea45e2e3d2884ee17ac0b21748b84483c28
```

## 快速修复步骤

### 步骤 1：在浏览器中打开以下链接

直接点击或在浏览器地址栏输入：
```
https://raw.githubusercontent.com/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar
```

浏览器会自动下载一个名为 `gradle-wrapper.jar` 的文件。

### 步骤 2：将下载的文件复制到正确位置

复制到：
```
D:\work\compass\android\gradle\wrapper\
```

如果提示替换，点击"替换"。

### 步骤 3：验证

打开 CMD，运行：
```cmd
cd D:\work\compass\android\gradle\wrapper
dir gradle-wrapper.jar
```

应该显示大约 60KB 的文件。

### 步骤 4：测试

```cmd
cd D:\work\compass\android
gradlew.bat --version
```

如果显示 Gradle 版本信息，说明修复成功！

### 步骤 5：构建 APK

```cmd
build-apk-simple.bat
```

## 如果浏览器无法下载

### 使用国内镜像

如果 GitHub raw 链接访问慢或失败，尝试：

**镜像地址 1**（jsdelivr）：
```
https://cdn.jsdelivr.net/gh/gradle/gradle@v7.5.1/gradle/wrapper/gradle-wrapper.jar
```

**镜像地址 2**（fastgit）：
```
https://raw.fastgit.org/gradle/gradle/v7.5.1/gradle/wrapper/gradle-wrapper.jar
```

### 备用方案：创建新的 Gradle 项目

1. 在临时目录创建新的 Gradle 项目
2. 让它自动生成 gradle-wrapper.jar
3. 复制到 Compass 项目

```cmd
# 在临时目录
mkdir temp_gradle
cd temp_gradle
gradle init --type basic
# 这会下载完整的 Gradle 和 wrapper

# 复制文件
copy gradle\wrapper\gradle-wrapper.jar D:\work\compass\android\gradle\wrapper\
```

## 终极方案：使用 Android Studio

如果所有方法都失败，使用 Android Studio 是最可靠的：

1. 安装 Android Studio
2. 打开 `D:\work\compass\android` 目录
3. Android Studio 会自动下载正确的 Gradle Wrapper
4. 使用 Android Studio 的 Build 功能构建 APK

## 验证清单

修复完成后，确认：

- [ ] 文件大小约 60KB（不是 0KB 或非常小）
- [ ] 文件位于 `android/gradle/wrapper/` 目录
- [ ] 运行 `gradlew.bat --version` 成功显示版本信息
- [ ] 运行 `build-apk-simple.bat` 开始构建

## 完成后的下一步

gradle-wrapper.jar 修复后，你就可以：

1. 运行 `build-apk-simple.bat` 构建 APK
2. 或运行 `build-debug-apk-v2.ps1` 使用详细输出构建
3. 或直接运行 `gradlew.bat assembleDebug`

预计构建时间：首次 5-15 分钟，后续 1-3 分钟。
