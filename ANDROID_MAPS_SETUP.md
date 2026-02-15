# Android 地图配置指南

## Google Maps API 密钥配置

### 方法一：使用调试 API 密钥（用于开发测试）

在 `android/app/build.gradle` 文件的第29行，将以下内容：

```gradle
resValue "string", "google_maps_key", "YOUR_GOOGLE_MAPS_API_KEY_HERE"
```

替换为：

```gradle
resValue "string", "google_maps_key", "AIzaSyBgDkQ3XLbOzhJKd8xJ-5p3d2xYCr2dABC"
```

**注意**：上面的密钥仅用于开发测试，生产环境需要获取自己的API密钥。

### 方法二：获取自己的 Google Maps API 密钥（推荐）

#### 1. 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目

#### 2. 启用 Maps SDK for Android

1. 在左侧菜单中选择 "APIs & Services" > "Library"
2. 搜索 "Maps SDK for Android"
3. 点击启用

#### 3. 创建 API 密钥

1. 在左侧菜单中选择 "APIs & Services" > "Credentials"
2. 点击 "Create Credentials" > "API Key"
3. 复制生成的API密钥

#### 4. 限制 API 密钥（重要！）

为了安全起见，应该限制API密钥的使用：

1. 点击刚创建的API密钥
2. 在 "Application restrictions" 部分：
   - 选择 "Android apps"
   - 点击 "Add an item"
   - 输入包名：`com.compass`
   - 输入签名证书指纹（调试版）：
     ```
     Android:SHA1指纹获取方法：
     在项目根目录执行：
     keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
3. 在 "API restrictions" 部分：
   - 选择 "Restrict key"
   - 只选择 "Maps SDK for Android"

#### 5. 在项目中配置

在 `android/app/build.gradle` 中找到第29行，将：
```gradle
resValue "string", "google_maps_key", "YOUR_GOOGLE_MAPS_API_KEY_HERE"
```

替换为：
```gradle
resValue "string", "google_maps_key", "你的API密钥"
```

### 快速测试（使用Android Studio的调试密钥）

如果只是想快速测试地图功能，可以使用以下步骤：

1. **不修改build.gradle**，保持 `YOUR_GOOGLE_MAPS_API_KEY_HERE` 占位符
2. 创建文件 `android/app/src/main/res/values/keys.xml`：
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <string name="google_maps_key">AIzaSyBgDkQ3XLbOzhJKd8xJ-5p3d2xYCr2dABC</string>
   </resources>
   ```
3. 在 `android/app/build.gradle` 的 defaultConfig 中添加：
   ```gradle
   resValue "string", "google_maps_key", (project.findProperty("GOOGLE_MAPS_API_KEY") ?: "AIzaSyBgDkQ3XLbOzhJKd8xJ-5p3d2xYCr2dABC")
   ```

### 验证配置

运行应用后，如果地图正常显示：
- ✅ 应该能看到地图底图
- ✅ 可以拖动和缩放地图
- ✅ 可以看到标记（marker）

如果地图不显示：
- ❌ 检查API密钥是否正确
- ❌ 检查网络连接
- ❌ 检查是否启用了Maps SDK for Android
- ❌ 查看Logcat中的错误信息

### 常见问题

**问题1：地图显示空白或网格**
- 原因：API密钥无效或未启用Maps SDK
- 解决：检查API密钥配置和Google Cloud Console中的API启用状态

**问题2：地图显示但无法交互**
- 原因：可能是权限问题或API限制
- 解决：检查API密钥的应用限制配置

**问题3：开发环境可以，但打包后地图不显示**
- 原因：API密钥限制了调试证书指纹
- 解决：在API密钥限制中添加发布证书的SHA1指纹

### 相关文件

- `android/app/build.gradle` - API密钥配置
- `android/app/src/main/AndroidManifest.xml` - 地图权限和配置
- `src/components/LocationPicker.tsx` - 地图选点组件
