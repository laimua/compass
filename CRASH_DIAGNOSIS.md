# 应用闪退问题诊断报告

**问题时间**：2026-02-04 23:24
**问题现象**：安装 APK 后打开应用立即闪退

## 问题分析

### 崩溃日志

```
FATAL EXCEPTION: main
java.lang.ClassCastException: android.app.Application cannot be cast to com.facebook.react.ReactApplication
```

**根本原因**：AndroidManifest.xml 缺少 Application 类配置 ✅ 已修复

### 第二个崩溃

```
java.lang.IllegalStateException: You need to use a Theme.AppCompat theme
```

**根本原因**：缺少主题配置 ✅ 已修复

### 第三个崩溃（当前）

```
Invariant Violation: requireNativeComponent: "RCTView" was not found in the UIManager.
```

**根本原因**：原生组件未正确注册 ⚠️ 正在解决

## 已修复的问题

1. ✅ 添加 `android:name=".MainApplication"` 到 AndroidManifest.xml
2. ✅ 创建 styles.xml 并配置 AppCompat 主题
3. ✅ 在 MainActivity.java 中禁用新架构（Fabric）

## 当前问题

### RCTView 组件未找到

**错误信息**：
```
requireNativeComponent: "RCTView" was not found in the UIManager.
```

**可能原因**：
1. React Native 新架构（Fabric）配置问题
2. 原生组件注册问题
3. Bundle 打包问题

## 解决方案

### 方案 1：使用开发模式（推荐）

使用开发模式运行应用，让 Metro bundler 实时编译：

```bash
# 1. 启动 Metro bundler
cd D:\work\compass
npx react-native start --reset-cache

# 2. 在另一个终端运行应用
npx react-native run-android
```

**优点**：
- 不需要重新构建 APK
- 可以实时查看错误信息
- Metro bundler 会自动处理 bundle

### 方案 2：等待文件释放后重建

当前的 debug 目录被占用，等待几分钟后：

```bash
# 1. 完全停止所有进程
adb kill-server
taskkill /F /IM java.exe

# 2. 等待 2-3 分钟

# 3. 重新构建
cd D:\work\compass\android
bash ./gradlew clean
bash ./gradlew assembleDebug

# 4. 安装
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 方案 3：使用 Release 版本（已构建）

Release APK 已构建但需要签名：

```bash
# 文件位置
D:\work\compass\android\app\build\outputs\apk\release\app-release-unsigned.apk

# 需要使用 debug keystore 签名
jarsigner -keystore android/app/debug.keystore -storepass android -keypass android \
  -digestalg SHA1 -sigalg SHA1withRSA \
  android/app/build/outputs/apk/release/app-release-unsigned.apk androiddebugkey

# 然后对齐
zipalign -v 4 android/app/build/outputs/apk/release/app-release-unsigned.apk \
  android/app/build/outputs/apk/release/app-release-aligned.apk

# 安装对齐后的版本
adb install android/app/build/outputs/apk/release/app-release-aligned.apk
```

## 建议的临时解决方案

由于当前的构建问题，建议：

1. **使用开发模式**（最快）：
   ```bash
   cd D:\work\compass
   npx react-native start
   # 新终端窗口
   npx react-native run-android
   ```

2. **或者等待并重试**：
   - 重启电脑后重新构建
   - 或等待 10-15 分钟让文件释放

## 项目状态

### 已修复
- ✅ 地图功能已恢复（react-native-maps 2.0.0-beta.15）
- ✅ Application 类配置
- ✅ 主题配置
- ✅ 新架构已禁用

### 待解决
- ⚠️ Debug APK 目录被占用
- ⚠️ 原生组件注册问题

## 技术细节

### MainApplication.java 配置

当前已禁用新架构：
```java
@Override
protected ReactActivityDelegate createReactActivityDelegate() {
  return new DefaultReactActivityDelegate(
      this,
      getMainComponentName(),
      false); // 禁用新架构（Fabric）
}
```

### AndroidManifest.xml 配置

```xml
<application
    android:name=".MainApplication"
    android:theme="@style/AppTheme"
    ...>
```

### gradle.properties 配置

```properties
newArchEnabled=false
hermesEnabled=true
```

## 下一步

1. **优先尝试开发模式**运行应用
2. 如果成功，说明 bundle 打包有问题
3. 如果失败，可能需要：
   - 检查所有依赖版本兼容性
   - 降级 React Native 到更稳定的版本
   - 或升级到最新版本

## 联系支持

如果问题持续，请提供以下信息：
1. 完整的崩溃日志（`adb logcat`）
2. `npx react-native doctor` 的输出
3. Metro bundler 的日志
