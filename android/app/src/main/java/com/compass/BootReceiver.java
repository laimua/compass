package com.compass;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "BootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) {
            return;
        }

        String action = intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            "android.intent.action.QUICKBOOT_POWERON".equals(action)) {

            Log.i(TAG, "Device booted, notifying app to re-register geofences...");

            // 发送广播通知 MainActivity 重新注册地理围栏
            Intent geofenceIntent = new Intent("com.compass.RESTORE_GEOFENCES");
            geofenceIntent.setPackage(context.getPackageName());
            context.sendBroadcast(geofenceIntent);
        }
    }
}
