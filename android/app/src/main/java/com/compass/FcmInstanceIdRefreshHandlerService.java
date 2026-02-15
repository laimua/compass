package com.compass;

import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.JobIntentService;

/**
 * Empty stub service to prevent crash from react-native-notifications
 * trying to schedule a job for non-existent FCM service.
 */
public class FcmInstanceIdRefreshHandlerService extends JobIntentService {

    private static final int JOB_ID = 1000;

    public static void enqueueWork(@NonNull android.content.Context context, @NonNull Intent work) {
        enqueueWork(context, FcmInstanceIdRefreshHandlerService.class, JOB_ID, work);
    }

    @Override
    protected void onHandleWork(@NonNull Intent intent) {
        // Do nothing - this is just a stub to prevent crashes
        android.util.Log.d("FcmStub", "Stub FCM service called - ignoring");
    }

    @Override
    public boolean onStopCurrentWork() {
        return true;
    }
}
