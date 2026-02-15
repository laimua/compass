package com.compass;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.util.Log;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

public class MainActivity extends ReactActivity {
  private static final String TAG = "MainActivity";
  private GeofenceRestoreReceiver restoreReceiver;

  @Override
  protected String getMainComponentName() {
    return "Compass";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        false); // 禁用新架构（Fabric）
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // 注册地理围栏恢复广播接收器
    restoreReceiver = new GeofenceRestoreReceiver();
    IntentFilter filter = new IntentFilter("com.compass.RESTORE_GEOFENCES");
    registerReceiver(restoreReceiver, filter);
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();
    // 注销广播接收器，防止内存泄漏
    if (restoreReceiver != null) {
      try {
        unregisterReceiver(restoreReceiver);
      } catch (IllegalArgumentException e) {
        Log.w(TAG, "Receiver not registered or already unregistered", e);
      }
      restoreReceiver = null;
    }
  }

  // 内部类：处理地理围栏恢复广播
  private class GeofenceRestoreReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
      if (intent != null && "com.compass.RESTORE_GEOFENCES".equals(intent.getAction())) {
        Log.i(TAG, "Received geofence restore request, reloading app...");
        // 通过发送 JavaScript 事件通知应用重新注册地理围栏
        // 这里需要等待 React Native 初始化完成
        // 实际的地理围栏恢复逻辑在 JavaScript 端实现
      }
    }
  }
}
