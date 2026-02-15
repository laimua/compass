package com.compass;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingClient;
import com.google.android.gms.location.GeofencingRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class GeofenceModule extends ReactContextBaseJavaModule {
    private static final String TAG = "GeofenceModule";
    private GeofencingClient geofencingClient;
    private PendingIntent geofencePendingIntent;
    private List<Geofence> activeGeofences = new ArrayList<>();

    public GeofenceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        geofencingClient = LocationServices.getGeofencingClient(reactContext);
    }

    @Override
    public String getName() {
        return "GeofenceModule";
    }

    // Required for React Native new architecture event emitter
    @ReactMethod
    public void addListener(String eventName) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    public void checkSupport(Promise promise) {
        try {
            // 简单检查 - 实际应用中可能需要更详细的检查
            WritableMap result = Arguments.createMap();
            result.putBoolean("supported", true);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("CHECK_SUPPORT_FAILED", e.getMessage());
        }
    }

    @ReactMethod
    public void registerGeofences(ReadableArray geofences, Promise promise) {
        try {
            Context context = getCurrentActivity();
            if (context == null) {
                promise.reject("NO_CONTEXT", "No context available");
                return;
            }

            // 先移除所有现有的地理围栏
            geofencingClient.removeGeofences(geofencePendingIntent);

            // 创建新的地理围栏列表
            activeGeofences.clear();
            for (int i = 0; i < geofences.size(); i++) {
                ReadableMap gf = geofences.getMap(i);
                String id = gf.getString("id");
                double latitude = gf.getDouble("latitude");
                double longitude = gf.getDouble("longitude");
                float radius = (float) gf.getDouble("radius");
                boolean notifyOnEntry = gf.getBoolean("notifyOnEntry");
                boolean notifyOnExit = gf.getBoolean("notifyOnExit");

                int transitionTypes = 0;
                if (notifyOnEntry) transitionTypes |= Geofence.GEOFENCE_TRANSITION_ENTER;
                if (notifyOnExit) transitionTypes |= Geofence.GEOFENCE_TRANSITION_EXIT;

                // 确保至少有一个转换类型
                if (transitionTypes == 0) {
                    transitionTypes = Geofence.GEOFENCE_TRANSITION_ENTER | Geofence.GEOFENCE_TRANSITION_EXIT;
                }

                android.util.Log.d(TAG, "Creating geofence: id=" + id + ", lat=" + latitude + ", lng=" + longitude +
                        ", radius=" + radius + ", transitionTypes=" + transitionTypes);

                activeGeofences.add(new Geofence.Builder()
                        .setRequestId(id)
                        .setCircularRegion(latitude, longitude, radius)
                        .setExpirationDuration(Geofence.NEVER_EXPIRE)
                        .setTransitionTypes(transitionTypes)
                        .build());
            }

            // 创建地理围栏请求
            GeofencingRequest geofencingRequest = new GeofencingRequest.Builder()
                    .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
                    .addGeofences(activeGeofences)
                    .build();

            // 获取PendingIntent
            geofencePendingIntent = getGeofencePendingIntent();

            // 添加地理围栏
            geofencingClient.addGeofences(geofencingRequest, geofencePendingIntent)
                    .addOnCompleteListener(new OnCompleteListener<Void>() {
                        @Override
                        public void onComplete(@NonNull Task<Void> task) {
                            if (task.isSuccessful()) {
                                promise.resolve(null);
                            } else {
                                promise.reject("ADD_GEOFENCE_FAILED", task.getException().getMessage());
                            }
                        }
                    });

        } catch (Exception e) {
            promise.reject("REGISTER_GEOFENCES_FAILED", e.getMessage());
        }
    }

    @ReactMethod
    public void removeAll(Promise promise) {
        try {
            if (geofencePendingIntent != null) {
                geofencingClient.removeGeofences(geofencePendingIntent)
                        .addOnCompleteListener(new OnCompleteListener<Void>() {
                            @Override
                            public void onComplete(@NonNull Task<Void> task) {
                                if (task.isSuccessful()) {
                                    activeGeofences.clear();
                                    promise.resolve(null);
                                } else {
                                    promise.reject("REMOVE_GEOFENCES_FAILED", task.getException().getMessage());
                                }
                            }
                        });
            } else {
                promise.resolve(null);
            }
        } catch (Exception e) {
            promise.reject("REMOVE_ALL_FAILED", e.getMessage());
        }
    }

    private PendingIntent getGeofencePendingIntent() {
        if (geofencePendingIntent != null) {
            return geofencePendingIntent;
        }

        Intent intent = new Intent(getReactApplicationContext(), GeofenceBroadcastReceiver.class);
        intent.setAction("com.compass.GEOFENCE_TRANSITION");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            geofencePendingIntent = PendingIntent.getBroadcast(
                    getReactApplicationContext(),
                    0,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE
            );
        } else {
            geofencePendingIntent = PendingIntent.getBroadcast(
                    getReactApplicationContext(),
                    0,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT
            );
        }
        return geofencePendingIntent;
    }
}
