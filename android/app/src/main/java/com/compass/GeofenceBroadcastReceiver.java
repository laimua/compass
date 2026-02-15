package com.compass;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingEvent;

public class GeofenceBroadcastReceiver extends BroadcastReceiver {
    private static final String TAG = "GeofenceReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !intent.getAction().equals("com.compass.GEOFENCE_TRANSITION")) {
            return;
        }

        GeofencingEvent geofencingEvent = GeofencingEvent.fromIntent(intent);
        if (geofencingEvent.hasError()) {
            Log.e(TAG, "Geofencing error: " + geofencingEvent.getErrorCode());
            return;
        }

        int transitionType = geofencingEvent.getGeofenceTransition();

        // 安全获取 ReactInstanceManager，防止空指针和类型转换异常
        ReactInstanceManager reactInstanceManager = null;
        try {
            ReactApplication reactApplication = (ReactApplication) context.getApplicationContext();
            if (reactApplication != null && reactApplication.getReactNativeHost() != null) {
                reactInstanceManager = reactApplication.getReactNativeHost().getReactInstanceManager();
            }
        } catch (ClassCastException e) {
            Log.e(TAG, "Failed to cast context to ReactApplication", e);
            return;
        }

        if (reactInstanceManager == null) {
            Log.w(TAG, "ReactInstanceManager is null, React Native may not be initialized");
            return;
        }

        ReactApplicationContext reactContext = (ReactApplicationContext) reactInstanceManager.getCurrentReactContext();

        if (reactContext != null) {
            DeviceEventManagerModule.RCTDeviceEventEmitter emitter =
                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);

            for (Geofence geofence : geofencingEvent.getTriggeringGeofences()) {
                String requestId = geofence.getRequestId();
                String eventName = (transitionType == Geofence.GEOFENCE_TRANSITION_ENTER) ? "GeofenceEnter" : "GeofenceExit";

                WritableMap event = Arguments.createMap();
                event.putString("id", requestId);

                emitter.emit(eventName, event);
            }
        }
    }
}
