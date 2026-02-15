# Compass (方圆) - 地理围栏提醒应用

## 项目简介

Compass 是一个基于 React Native 的跨平台移动应用，提供智能地理围栏提醒功能。应用的核心特点是**极低功耗设计**，使用系统原生地理围栏 API，日均耗电量低于 1%。

## 核心功能

- **地理围栏管理**：创建、编辑、删除圆形地理围栏（支持 100-5000 米半径）
- **智能提醒**：进入/离开围栏时触发铃声、震动、通知提醒
- **多围栏支持**：同时管理多个地理围栏
- **地图选点**：集成地图，可视化选择围栏位置
- **本地存储**：所有数据存储在本地 SQLite 数据库

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React Native 0.74.0 + TypeScript |
| UI 库 | React Native Paper |
| 地图 | React Native Maps (需 Google Maps API) |
| 数据库 | SQLite (react-native-sqlite-storage) |
| 导航 | React Navigation (Native Stack) |
| 通知 | React Native Notifications |
| 音频 | expo-av |

## 项目结构

```
src/
├── components/          # UI 组件
│   └── LocationPicker.tsx
├── database/           # 数据层
│   ├── Database.ts
│   └── models/
│       └── Geofence.ts
├── services/           # 业务逻辑层
│   ├── GeofenceService.ts
│   ├── NotificationService.ts
│   ├── PermissionService.ts
│   └── SoundService.ts
├── screens/            # 页面
│   ├── HomeScreen.tsx
│   ├── AddGeofenceScreen.tsx
│   └── PermissionScreen.tsx
├── types/              # 类型定义
│   └── index.ts
└── App.tsx             # 入口文件
```

## 架构设计

### 分层架构

```
┌─────────────────────────────┐
│       UI Layer (Screens)    │  用户界面
├─────────────────────────────┤
│   Components Layer          │  可复用组件
├─────────────────────────────┤
│   Services Layer            │  业务逻辑
├─────────────────────────────┤
│   Database Layer            │  数据持久化
└─────────────────────────────┘
```

### 核心服务

| 服务 | 职责 |
|------|------|
| `GeofenceService` | 地理围栏 CRUD、事件监听 |
| `NotificationService` | 本地通知管理 |
| `PermissionService` | 权限请求与状态管理 |
| `SoundService` | 提示音播放 |

## 平台差异处理

| 功能 | Android | iOS |
|------|---------|-----|
| 地理围栏 | `GeofencingClient` | `CLLocationManager` |
| 权限请求 | 运行时权限 | Info.plist + 运行时权限 |

## 开发指南

### 环境要求

- Node.js >= 18
- React Native CLI
- Android Studio (Android 开发)
- Xcode (iOS 开发)

### 构建脚本

项目主要构建脚本位于 `android/` 目录：

**推荐使用：**
- `android/build-debug-apk-v2.bat` - 主要构建脚本（增强版，带错误检查）
- `android/BUILD.ps1` - PowerShell 用户的主要构建选项
- `android/build-debug-apk.bat` - 最简单的构建选项

**其他工具：**
- `android/download-wrapper.bat` - 下载 Gradle Wrapper
- `android/download-gradle.bat` - 下载 Gradle
- `android/fix-gradle-wrapper.ps1` - 修复 Gradle Wrapper 问题

**注意：** 项目的冗余和过时文件已归档到 `archived/` 目录，详见 [archived/README.md](archived/README.md)

### Google Maps 配置

需要在以下位置配置 Google Maps API Key：
- `android/app/src/main/AndroidManifest.xml`
- `ios/你的项目名称/AppDelegate.m`

## 核心设计原则

1. **省电优先**：使用系统级 API，避免持续 GPS 定位
2. **类型安全**：全面使用 TypeScript 严格模式
3. **模块化**：清晰的分层架构
4. **用户体验**：智能权限引导，直观的地图交互
5. **错误处理**：完善的异常捕获和用户友好的错误提示
6. **资源管理**：防止内存泄漏，确保正确清理监听器和资源

## 代码质量标准

### TypeScript 配置

项目启用严格模式，包含以下配置：
- `strict: true` - 启用所有严格类型检查
- `noImplicitAny: true` - 禁止隐式 any 类型
- `strictNullChecks: true` - 严格空值检查
- `noImplicitReturns: true` - 确保所有代码路径都有返回值
- `noUnusedLocals` / `noUnusedParameters` - 检测未使用的变量

### 数据验证

所有地理围栏数据操作前都会进行验证：
- 名称：非空字符串
- 纬度：-90 到 90 之间
- 经度：-180 到 180 之间
- 半径：100 到 5000 米（省电设计要求）

### 错误处理策略

1. **数据库层**：验证输入数据，抛出明确的错误信息
2. **服务层**：捕获异步错误，记录日志
3. **UI 层**：使用 Alert 显示用户友好的错误提示
4. **事件处理**：地理围栏事件处理包含完整的 try-catch

### 资源清理

- 使用 `EmitterSubscription[]` 类型管理事件监听器
- `stopListening()` 方法安全移除所有监听器
- 组件卸载时调用 `cleanup()` 方法

## 常见任务

### 添加新的提醒方式
修改 `NotificationService.ts` 和 `SoundService.ts`

### 调整围栏参数限制
编辑 `AddGeofenceScreen.tsx` 中的常量定义

### 添加新的数据字段
1. 修改 `types/index.ts`
2. 更新 `database/models/Geofence.ts`
3. 调整 `database/Database.ts`

## 版本信息

- 版本：0.0.1
- React Native：0.74.0
- 显示名称：方圆

## 更新日志

### 代码质量改进（2026-02-04）

**TypeScript 类型安全**
- 添加 `NativeGeofenceData`、`GeofenceEventData`、`GeofenceErrorData` 接口
- 移除所有 `any` 类型，使用精确的类型定义
- `LocationPicker.tsx` 使用 `MarkerDragEvent` 类型

**错误处理增强**
- `Database.ts` 添加初始化状态检查和错误处理
- `Geofence.ts` 添加完整的数据验证逻辑
- `App.tsx` 改进异步错误处理，移除不安全的非空断言
- 所有事件处理函数添加 try-catch 块

**内存泄漏修复**
- `GeofenceService.ts` 改进监听器清理逻辑
- 使用 `EmitterSubscription[]` 类型确保类型安全
- `stopListening()` 方法安全移除监听器，处理异常情况

**配置优化**
- `tsconfig.json` 启用严格模式，添加多个编译选项
- 提高代码可维护性和类型安全性

### 项目清理（2026-02-04）

**归档冗余文件**
- 创建 `archived/` 目录存放过时和冗余文件
- 归档 12 个重复的构建/下载/修复脚本
- 归档 3 个过时的 Gradle 缓存版本（8.3, 8.5, 8.13）
- 归档 1 个备份文件（gradle-wrapper.jar.backup）
- 保留当前使用的构建脚本和 Gradle 9.1.0 缓存

**改进效果**
- 简化项目结构，减少脚本混淆
- 降低维护成本，只维护必要文件
- 释放磁盘空间（移除过时缓存）
- 保留可追溯性，文件归档而非删除
- 详见 [archived/CLEANUP_SUMMARY.md](archived/CLEANUP_SUMMARY.md)
