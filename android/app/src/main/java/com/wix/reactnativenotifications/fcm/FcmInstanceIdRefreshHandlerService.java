package com.wix.reactnativenotifications.fcm;

import android.content.Intent;
import androidx.annotation.NonNull;
import androidx.core.app.JobIntentService;

/**
 * Empty stub service to replace react-native-notifications FCM service.
 * This prevents crashes when the library tries to schedule FCM jobs.
 */
public class FcmInstanceIdRefreshHandlerService extends JobIntentService {

    private static final int JOB_ID = 1000;

    public static void enqueueWork(@NonNull android.content.Context context, @NonNull Intent work) {
        enqueueWork(context, FcmInstanceIdRefreshHandlerService.class, JOB_ID, work);
    }

    @Override
    protected void onHandleWork(@NonNull Intent intent) {
        // Do nothing - this is just a stub to prevent FCM initialization crashes
        android.util.Log.d("FcmStub", "FCM stub service called - ignoring (FCM disabled)");
    }

    @Override
    public boolean onStopCurrentWork() {
        return true;
    }
}
