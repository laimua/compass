# 项目归档文件

本目录包含从项目中移除的冗余、重复或过时的文件。这些文件不再被项目使用，但被保留以供参考。

## 归档日期

2026-02-04

## 目录结构

### `scripts/` - 冗余脚本文件

包含重复或已被替代的构建、下载和修复脚本：

#### 构建脚本（已归档）
- `build-debug-apk.ps1` - PowerShell 版本的简单构建脚本（功能被 BUILD.ps1 替代）
- `BUILD_JAVA21.bat` - Java 21 专用构建脚本（功能被 BUILD.ps1 替代）
- `BUILD_NOW.bat` - 简化版构建脚本（功能被 BUILD.ps1 替代）
- `build-apk.bat` - APK 构建脚本（功能被 build-debug-apk-v2.bat 替代）
- `build-apk-simple.bat` - 简单 APK 构建脚本（功能被 build-debug-apk-v2.bat 替代）
- `build-with-clean.bat` - 清理后构建脚本（不常用）
- `build-with-java21.bat` - Java 21 构建脚本（功能被 BUILD.ps1 替代）
- `build-java21.ps1` - Java 21 PowerShell 构建脚本（功能被 BUILD.ps1 替代）

**保留的构建脚本：**
- `android/build-debug-apk.bat` - 最简单的构建选项
- `android/build-debug-apk-v2.bat` - 主要构建脚本（增强版）
- `android/BUILD.ps1` - PowerShell 用户的主要构建选项

#### 下载脚本（已归档）
- `download-wrapper-7.6.0.bat` - Gradle Wrapper 7.6.0 专用下载脚本
- `download-wrapper-8.3.bat` - Gradle Wrapper 8.3 专用下载脚本
- `download-gradle.ps1` - PowerShell 版本的 Gradle 下载脚本

**保留的下载脚本：**
- `android/download-wrapper.bat` - 通用的 Gradle Wrapper 下载脚本
- `android/download-gradle.bat` - Gradle 下载脚本

#### 修复脚本（已归档）
- `fix-wrapper.ps1` - Wrapper 修复脚本（功能被 fix-gradle-wrapper.ps1 替代）

**保留的修复脚本：**
- `android/fix-gradle-wrapper.ps1` - 主要的 Gradle Wrapper 修复脚本

### `gradle-cache/` - 过时的 Gradle 缓存

包含不再使用的 Gradle 版本缓存目录：

- `8.3/` - Gradle 8.3 版本缓存
- `8.5/` - Gradle 8.5 版本缓存
- `8.13/` - Gradle 8.13 版本缓存

**保留的缓存：**
- `android/.gradle/9.1.0/` - 最新版本的 Gradle 缓存（正在使用）

**注意：** 这些缓存目录可能占用大量空间（每个几百 MB）。如果不再需要，可以安全删除整个 `gradle-cache/` 目录。

### `backups/` - 备份文件

包含备份文件：

- `gradle-wrapper.jar.backup` - Gradle Wrapper JAR 文件的备份

## 为什么要归档这些文件？

1. **减少混淆**：多个功能相似的脚本容易让开发者混淆应该使用哪一个
2. **简化维护**：减少需要维护和更新的文件数量
3. **节省空间**：移除过时的 Gradle 缓存可以释放大量磁盘空间
4. **提高效率**：避免使用过时的脚本和工具导致的问题

## 如何恢复文件？

如果需要恢复任何归档的文件，可以使用以下命令：

```bash
# 从归档恢复到原位置
cp archived/scripts/[文件名] android/
```

或者，如果项目使用 Git 版本控制，可以从 Git 历史中恢复：

```bash
git checkout HEAD -- [文件路径]
```

## 清理建议

### 可以安全删除的归档内容

1. **整个 `gradle-cache/` 目录** - 如果确定不会使用旧版本的 Gradle，可以删除整个目录以释放磁盘空间
2. **备份文件** - 如果使用 Git 版本控制，可以从 Git 历史恢复，不需要保留备份

### 建议保留的归档内容

1. **`scripts/` 目录** - 作为参考，了解之前的构建和配置方法
2. **`README.md`** - 本文件，作为归档记录

## 更新记录

- 2026-02-04：首次创建归档，移动冗余脚本和过时缓存
