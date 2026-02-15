# iOS 项目设置指南

> **前置条件**：需要一台安装了 Xcode 的 Mac 电脑
> **React Native 版本**：0.73.10
> **目标平台**：iOS 13.0+

---

## 📋 当前状态

### ✅ 已完成的修复

| 文件 | 状态 | 说明 |
|------|------|------|
| `AppDelegate.swift` | ✅ 已创建 | 应用入口点 |
| `Compass-Bridging-Header.h` | ✅ 已创建 | Swift/ObjC 桥接头文件 |
| `GeofenceModule.swift` | ✅ 已修复 | 事件发送 API 和错误处理 |
| `Info.plist` | ✅ 已更新 | 权限配置完整 |
| `Podfile` | ✅ 存在 | CocoaPods 依赖配置 |

### ❌ 仍需完成

| 项目 | 说明 |
|------|------|
| Xcode 项目文件 (`.xcodeproj`) | 需要在 Xcode 中生成 |
| Xcode 工作空间 (`.xcworkspace`) | 运行 `pod install` 后生成 |
| Assets.xcassets | App 图标和启动屏幕 |
| LaunchScreen.storyboard | 启动屏幕 UI |

---

## 🚀 设置步骤

### 步骤 1：安装 CocoaPods 依赖

在终端中执行：

```bash
cd D:\work\compass\ios
pod install
```

**预期输出**：
```
Analyzing dependencies
Fetching podspec for `React-Native` from `../node_modules/react-native`
Fetching podspec for `React-Codegen` from `../node_modules/react-native/...`
...
Pod installation complete! There are 34 dependencies from the Podfile and 22 total pods installed.
```

**生成的文件**：
- `Pods/` 目录
- `Podfile.lock`
- `Compass.xcworkspace` ← 使用此文件打开项目

---

### 步骤 2：使用 React Native CLI 生成 Xcode 项目

**方法 A：自动生成（推荐）**

```bash
cd D:\work\compass
npx react-native init --skip-install
```

然后将生成的 `ios/` 目录内容与现有文件合并。

**方法 B：手动创建 Xcode 项目**

1. 打开 Xcode
2. 选择 `File → New → Project...`
3. 选择 `iOS → Application` → 不选择模板（直接关闭）
4. 使用以下配置手动创建：

或者使用 React Native 官方模板：

```bash
cd D:\work\compass
npx @react-native-community/cli init Compass --skip-install --directory ios
```

---

### 步骤 3：在 Xcode 中配置项目

#### 3.1 打开项目

```bash
open ios/Compass.xcworkspace
```

或者在 Xcode 中：`File → Open → 选择 Compass.xcworkspace`

#### 3.2 添加文件到 Xcode 项目

在 Xcode 左侧项目导航器中：

1. 右键 `Compass` 文件夹 → `Add Files to "Compass"...`
2. 确保勾选以下文件：
   - ✅ `AppDelegate.swift`
   - ✅ `GeofenceModule.swift`
   - ✅ `Compass-Bridging-Header.h`
   - ✅ `Info.plist`

3. 确保勾选 `Copy items if needed` 和 `Create groups`

#### 3.3 配置桥接头文件

1. 选择项目导航器中的 `Compass` 项目（蓝色图标）
2. 选择 `TARGETS → Compass`
3. 选择 `Build Settings` 标签
4. 搜索 `Objective-C Bridging Header`
5. 设置值：`Compass/Compass-Bridging-Header.h`

#### 3.4 配置 Info.plist 路径

1. 在 `Build Settings` 中搜索 `Info.plist`
2. 确保 `Info.plist File` 设置为 `Compass/Info.plist`

---

### 步骤 4：添加资源文件

#### 4.1 创建 Assets.xcassets

1. 在 Xcode 项目导航器中
2. `File → New → File...`
3. 选择 `Asset Catalog`
4. 命名为 `Assets.xcassets`
5. 保存到 `Compass` 文件夹

#### 4.2 添加 App Icon

1. 打开 `Assets.xcassets`
2. 在左侧找到 `AppIcon`
3. 拖拽相应尺寸的图标到对应位置

#### 4.3 添加启动屏幕

1. `File → New → File...`
2. 选择 `Storyboard`
3. 命名为 `LaunchScreen`
4. 添加一个 UILabel 显示 "Compass"

---

### 步骤 5：配置签名和团队

1. 在 Xcode 项目设置中
2. 选择 `TARGETS → Compass → Signing & Capabilities`
3. 选择你的开发团队
4. 确保 Bundle Identifier 唯一（如 `com.yourname.compass`）

---

### 步骤 6：构建和运行

#### 6.1 选择目标设备

- 选择连接的 iOS 真机（推荐用于地理围栏测试）
- 或选择 iOS 模拟器（地理围栏支持有限）

#### 6.2 构建项目

```
Product → Build (⌘ + B)
```

#### 6.3 运行项目

```
Product → Run (⌘ + R)
```

---

## 🔍 验证修复

### 测试 1：模块注册

在 React Native 代码中：

```typescript
import { NativeModules } from 'react-native';

if ('GeofenceModule' in NativeModules) {
  console.log('✅ GeofenceModule 注册成功');
} else {
  console.error('❌ GeofenceModule 未注册');
}
```

### 测试 2：地理围栏功能

```typescript
import { GeofenceService } from './services/GeofenceService';

// 检查支持
const support = await GeofenceService.checkSupport();
console.log('地理围栏支持:', support);

// 注册测试围栏
await GeofenceService.registerGeofences([{
  id: 'test',
  latitude: 37.7749,
  longitude: -122.4194,
  radius: 200,
  triggerType: 'both',
  enabled: true
}]);
```

### 测试 3：事件监听

```typescript
GeofenceService.startListening(
  (id) => console.log('进入围栏:', id),
  (id) => console.log('离开围栏:', id)
);
```

---

## 🐛 常见问题

### 问题 1：`Cannot find module 'React'`

**解决方案**：
```bash
cd ios
pod install
```

### 问题 2：`Bridging header not found`

**解决方案**：
1. 检查 `Build Settings → Objective-C Bridging Header` 路径
2. 确保文件存在且路径正确

### 问题 3：`Info.plist not found`

**解决方案**：
1. 检查 `Build Settings → Info.plist File` 路径
2. 确保 `Compass/Info.plist`

### 问题 4：地理围栏不触发

**解决方案**：
1. 确保位置权限已授予（设置 → Compass → 位置 → 始终）
2. 确保通知权限已授予
3. 使用真机测试（模拟器支持有限）
4. 在 Xcode 中启用位置模拟：`Features → Location → Custom Location...`

---

## 📚 参考资源

- [React Native iOS 原生模块](https://reactnative.dev/docs/next/native-modules-ios)
- [Core Location - 地理围栏](https://developer.apple.com/documentation/corelocation/monitoring_the_user_s_proximity_to_geographic_regions)
- [CocoaPods 文档](https://cocoapods.org/)

---

**下一步**：在 macOS 上执行上述步骤后，在 Xcode 中构建并运行 iOS 应用进行测试。
