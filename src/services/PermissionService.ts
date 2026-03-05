import { PermissionsAndroid, Platform } from 'react-native';

export class PermissionService {
  // 检查权限状态（不触发请求）
  async checkPermissions(): Promise<{ location: boolean; notification: boolean }> {
    console.log('=== 开始检查权限 ===');

    // 默认认为没有权限，只有明确检测到有权限才返回 true
    let location = false;
    let notification = false;

    if (Platform.OS === 'android') {
      try {
        // 检查位置权限
        const locationResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        console.log('位置权限检查结果:', locationResult);
        location = locationResult;
      } catch (error) {
        console.error('检查位置权限异常:', error);
        // 异常时保守处理，认为没有权限
        location = false;
      }

      // Android 13+ 检查通知权限
      const sdkVersion = typeof Platform.Version === 'number' ? Platform.Version : parseInt(String(Platform.Version), 10);
      console.log('SDK 版本:', sdkVersion);

      if (!isNaN(sdkVersion) && sdkVersion >= 33) {
        // 检查是否支持 POST_NOTIFICATIONS 权限
        const postNotificationsPermission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
        if (postNotificationsPermission) {
          try {
            const notificationResult = await PermissionsAndroid.check(postNotificationsPermission);
            console.log('通知权限检查结果:', notificationResult);
            notification = notificationResult;
          } catch (error) {
            console.error('检查通知权限异常:', error);
            // 异常时保守处理，认为没有权限
            notification = false;
          }
        } else {
          console.warn('POST_NOTIFICATIONS 权限常量不可用');
          notification = false;
        }
      } else {
        // Android 13 以下不需要通知权限
        notification = true;
      }
    } else {
      // 非 Android 平台
      location = true;
      notification = true;
    }

    console.log('=== 权限检查完成 ===');
    console.log('location:', location, 'notification:', notification);

    return { location, notification };
  }

  // 请求权限（仅在未授权时才请求）
  async requestPermissions(): Promise<boolean> {
    console.log('开始请求权限...');

    if (Platform.OS !== 'android') {
      return true;
    }

    // 先检查权限状态
    const currentPermissions = await this.checkPermissions();
    if (currentPermissions.location && currentPermissions.notification) {
      console.log('权限已授予，无需请求');
      return true;
    }

    try {
      // 只有位置权限未授予时才请求
      if (!currentPermissions.location) {
        const locationResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '位置权限',
            message: 'Compass 需要位置权限来使用地理围栏服务',
            buttonNeutral: '稍后再试',
            buttonNegative: '取消',
            buttonPositive: '允许',
          }
        );
        console.log('位置权限请求结果:', locationResult);

        if (locationResult !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('位置权限未授予');
          return false;
        }
      }

      // 只有通知权限未授予时才请求
      const sdkVersion = typeof Platform.Version === 'number' ? Platform.Version : parseInt(String(Platform.Version), 10);
      if (!isNaN(sdkVersion) && sdkVersion >= 33 && !currentPermissions.notification) {
        const postNotificationsPermission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
        if (postNotificationsPermission) {
          const notificationResult = await PermissionsAndroid.request(
            postNotificationsPermission,
            {
              title: '通知权限',
              message: 'Compass 需要通知权限来发送地理围栏提醒',
              buttonNegative: '不允许',
              buttonPositive: '允许',
            }
          );
          console.log('通知权限请求结果:', notificationResult);

          if (notificationResult !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('通知权限未授予');
            return false;
          }
        } else {
          console.warn('POST_NOTIFICATIONS 权限常量不可用，跳过请求');
        }
      }

      return true;
    } catch (error) {
      console.error('请求权限失败:', error);
      return false;
    }
  }
}
