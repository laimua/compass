import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export class PermissionService {
  // 显示省电说明（仅在首次请求权限时）
  private showBatteryEfficiencyExplanation(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        '为什么需要位置权限？',
        'Compass 使用系统级低功耗地理围栏服务来检测您是否进入指定区域。\n\n' +
        '⚠️ 省电设计说明：\n' +
        '• 不会持续追踪您的位置\n' +
        '• 不会消耗GPS电量\n' +
        '• 仅在跨越区域边界时由系统唤醒\n\n' +
        '请选择"始终允许"以确保App在后台也能正常工作。',
        [{ text: '我明白了', onPress: () => resolve(true) }]
      );
    });
  }

  // 检查是否已有位置权限
  private async checkLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return result;
    }
    return false;
  }

  // 请求位置权限（始终允许）
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      // 先检查是否已有权限
      const hasPermission = await this.checkLocationPermission();
      if (hasPermission) {
        console.log('已有位置权限，跳过请求');
        return true;
      }

      // 没有权限时显示说明
      await this.showBatteryEfficiencyExplanation();

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '位置权限（始终允许）',
          message: 'Compass 需要始终允许位置权限来使用低功耗地理围栏服务',
          buttonNeutral: '稍后再试',
          buttonNegative: '取消',
          buttonPositive: '始终允许',
        }
      );

      console.log('位置权限请求结果:', granted);

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('位置权限未授予，返回值:', granted);
        return false;
      }

      // Android 13+ 需要请求后台位置权限
      if (Platform.Version >= 33) {
        // 检查是否已有后台位置权限
        const hasBackground = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
        );
        if (hasBackground) {
          console.log('已有后台位置权限，跳过请求');
          return true;
        }

        const backgroundGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: '后台位置权限',
            message: '为了在App关闭时也能接收提醒，请允许后台位置访问',
            buttonNegative: '不允许',
            buttonPositive: '允许',
          }
        );

        console.log('后台位置权限请求结果:', backgroundGranted);

        const isGranted = backgroundGranted === PermissionsAndroid.RESULTS.GRANTED;
        if (!isGranted) {
          console.warn('后台位置权限未授予，返回值:', backgroundGranted);
        }
        return isGranted;
      }

      return true;
    } else {
      // iOS
      const result = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
      console.log('iOS 位置权限请求结果:', result);
      return result === RESULTS.GRANTED;
    }
  }

  // 请求通知权限 - 使用 PermissionsAndroid
  async requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      // Android 13+ 需要请求通知权限
      if (Platform.Version >= 33) {
        // 先检查是否已有权限
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (hasPermission) {
          console.log('已有通知权限，跳过请求');
          return true;
        }

        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: '通知权限',
              message: 'Compass 需要通知权限来发送地理围栏提醒',
              buttonNegative: '不允许',
              buttonPositive: '允许',
            }
          );
          console.log('通知权限请求结果:', granted);
          const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
          if (!isGranted) {
            console.warn('通知权限未授予，返回值:', granted);
          }
          return isGranted;
        } catch (err) {
          console.warn('通知权限请求失败:', err);
          return true; // 旧版本 Android 不需要通知权限
        }
      }
      // Android 12 及以下不需要请求通知权限
      return true;
    } else {
      // iOS
      const result = await request(PERMISSIONS.IOS.NOTIFICATIONS);
      console.log('iOS 通知权限请求结果:', result);
      return result === RESULTS.GRANTED;
    }
  }
}
