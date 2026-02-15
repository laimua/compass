import { Vibration, Platform } from 'react-native';

export class SoundService {
  async play(): Promise<void> {
    try {
      // 对于Android，使用系统默认通知声音
      // 对于iOS，使用系统默认提示音
      // 注意：实际声音由NotificationService控制，这里只做备用处理
      if (Platform.OS === 'android') {
        // Android系统默认会有提示音，这里我们主要依赖NotificationService
        console.log('播放提示音');
      }
    } catch (error) {
      console.log('播放铃声失败:', error);
    }
  }

  // 震动
  vibrate(): void {
    if (Platform.OS === 'android') {
      // Android: 振动模式 [等待, 振动, 等待, 振动]
      Vibration.vibrate([0, 200, 100, 200]);
    } else {
      // iOS: 固定振动（需要触觉反馈）
      Vibration.vibrate();
    }
  }

  // 清理资源
  async cleanup(): Promise<void> {
    // 不需要清理
  }
}
