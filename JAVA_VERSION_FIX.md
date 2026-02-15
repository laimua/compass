# Java 版本升级指南

## 问题诊断

当前使用的 Java 版本是 1.8.0_451（Java 8），但 React Native 0.74.0 需要 Java 11 或更高版本。

**错误信息**：
```
java.lang.NoClassDefFoundError: org/gradle/wrapper/IDownload
```

## 快速解决方案

### 步骤 1：下载并安装 JDK 11

推荐使用 Eclipse Temurin（OpenJDK 的发行版）：

1. 访问：https://adoptium.net/
2. 选择：**Temurin 11 (LTS)**
3. 选择操作系统：**Windows**
4. 选择架构：**x64**
5. 下载：**.msi 安装包**

或者直接下载：
- JDK 11：https://adoptium.net/temurin/releases/?version=11
- JDK 17（推荐，也是 LTS）：https://adoptium.net/temurin/releases/?version=17

### 步骤 2：安装 JDK

1. 运行下载的 .msi 安装包
2. 按照默认设置完成安装
3. 记下安装路径（默认：`C:\Program Files\Eclipse Adoptium\jdk-11.x.x` 或 `jdk-17.x.x`）

### 步骤 3：更新 JAVA_HOME 环境变量

**方法 A：使用 PowerShell（推荐）**

以**管理员身份**运行 PowerShell：

```powershell
# 如果安装了 JDK 11
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-11.0.xx-hotspot" /M

# 如果安装了 JDK 17
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.xx-hotspot" /M

# 注意：将 x.x 替换为实际的版本号
```

**方法 B：使用图形界面**

1. 右键点击"此电脑" → "属性"
2. 点击"高级系统设置"
3. 点击"环境变量"
4. 在"系统变量"中找到 `JAVA_HOME`
5. 点击"编辑"，修改为新的 JDK 路径
6. 点击"确定"保存

### 步骤 4：更新 Path 环境变量（如需要）

确保 `%JAVA_HOME%\bin` 在系统 Path 中：

1. 打开"环境变量"设置
2. 在"系统变量"中找到 `Path`
3. 检查是否包含：`%JAVA_HOME%\bin`
4. 如果没有，点击"新建"添加

### 步骤 5：验证安装

**重要**：关闭所有 PowerShell 和 CMD 窗口，然后重新打开。

在新窗口中运行：

```powershell
# 检查 Java 版本
java -version

# 检查 JAVA_HOME
echo $env:JAVA_HOME

# 检查 Java 可执行文件
where.exe java
```

预期输出（JDK 11）：
```
java version "11.0.xx" or "17.0.xx"
```

### 步骤 6：重新构建 APK

```powershell
cd D:\work\compass\android
.\build-debug-apk-v2.ps1
```

## 检查 Java 版本

运行提供的检查脚本：

```powershell
cd D:\work\compass
.\java-version-check.ps1
```

## 其他 JDK 选项

如果不喜欢 Eclipse Temurin，可以选择：

### Oracle JDK
- JDK 11：https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html
- JDK 17：https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html

注意：需要 Oracle 账户才能下载

### Microsoft OpenJDK
- 下载：https://learn.microsoft.com/zh-cn/java/openjdk/download

### Amazon Corretto
- 下载：https://docs.aws.amazon.com/corretto/latest/corretto-11-ug/downloads-list.html

## 常见问题

### Q1：安装了多个 JDK，如何切换？

使用 PowerShell 临时切换：

```powershell
# 临时设置（仅当前窗口有效）
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.xx-hotspot"
$env:Path = "C:\Program Files\Eclipse Adoptium\jdk-11.0.xx-hotspot\bin;$env:Path"
```

永久切换：修改环境变量 `JAVA_HOME`

### Q2：旧的应用程序依赖 Java 8 怎么办？

可以同时安装多个 JDK，通过环境变量切换：

1. 安装 JDK 11 到默认目录
2. 保留 JDK 8
3. 修改 `JAVA_HOME` 指向 JDK 11
4. 如需使用 Java 8，临时修改 `JAVA_HOME`

### Q3：如何完全卸载旧 JDK？

1. 打开"控制面板" → "程序和功能"
2. 找到 "Java(TM) SE Development Kit 8"
3. 右键 → "卸载"

## 验证清单

构建前请确认：

- [ ] 已安装 JDK 11 或更高版本
- [ ] `java -version` 显示 11.x 或 17.x
- [ ] `JAVA_HOME` 环境变量已设置
- [ ] `%JAVA_HOME%\bin` 在 Path 中
- [ ] 已重启 PowerShell/CMD 窗口
- [ ] 运行 `.\java-version-check.ps1` 通过检查

## 完成后

安装完 JDK 11+ 并更新环境变量后：

1. **关闭所有** PowerShell 和 CMD 窗口
2. **重新打开** PowerShell
3. **验证版本**：
   ```powershell
   java -version
   ```
4. **开始构建**：
   ```powershell
   cd D:\work\compass\android
   .\build-debug-apk-v2.ps1
   ```

## 技术说明

### 为什么需要 Java 11？

1. **React Native 0.74.0** 要求 Java 11+
2. **Gradle 7.5.1** 在 Java 8 上有兼容性问题
3. **Hermes 引擎** 编译需要 Java 11+

### Java 版本对照表

| Java 版本 | 版本号 | 支持状态 |
|-----------|--------|---------|
| Java 8 | 1.8 | ❌ 不支持 |
| Java 11 | 11.x | ✅ 推荐（LTS） |
| Java 17 | 17.x | ✅ 推荐（LTS） |
| Java 21 | 21.x | ✅ 支持（最新 LTS） |

## 获取帮助

如果升级后仍有问题：

1. 运行环境检查：
   ```powershell
   .\java-version-check.ps1
   ```

2. 查看详细日志：
   ```powershell
   .\gradlew.bat assembleDebug --info
   ```

3. 查看 `TROUBLESHOOTING_BUILD.md`
