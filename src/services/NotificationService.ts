import { NativeModules, Platform } from 'react-native';

const { LocalNotificationModule } = NativeModules;

export class NotificationService {
  configure(): void {
    // 本地通知不需要额外配置
    console.log('本地通知服务已初始化');
  }

  // 发送本地通知
  async show(title: string, message: string, _playSound: boolean = false): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await LocalNotificationModule.show(title, message);
      } else {
        // iOS 暂不支持
        console.log('iOS 本地通知暂不支持');
      }
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  }
}
