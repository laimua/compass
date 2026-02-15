import { Platform, NativeEventEmitter, NativeModules, EmitterSubscription } from 'react-native';
import {
  Geofence as GeofenceType,
  GeofenceEventData,
  GeofenceErrorData,
  GeofenceNativeModule,
} from '../types';

const { GeofenceModule } = NativeModules as { GeofenceModule: GeofenceNativeModule };
const geofenceEmitter = new NativeEventEmitter(GeofenceModule);

export class GeofenceService {
  private listeners: EmitterSubscription[] = [];

  // 注册围栏到系统
  async registerGeofences(geofences: GeofenceType[]): Promise<void> {
    const enabledGeofences = geofences.filter(g => g.enabled);

    // 如果没有启用的围栏，清除所有现有围栏
    if (enabledGeofences.length === 0) {
      console.log('没有启用的围栏，清除所有现有围栏');
      await this.removeAll();
      return;
    }

    // iOS最多20个围栏限制
    if (Platform.OS === 'ios' && enabledGeofences.length > 20) {
      const error = new Error(`iOS 系统限制最多支持 20 个地理围栏,当前有 ${enabledGeofences.length} 个已启用的围栏。请禁用部分围栏后再试。`);
      console.error(error.message);
      throw error;
    }

    // 转换为原生格式
    const nativeGeofences = enabledGeofences.map(gf => ({
      id: gf.id.toString(),
      latitude: gf.latitude,
      longitude: gf.longitude,
      radius: gf.radius,
      notifyOnEntry: gf.triggerType === 'enter' || gf.triggerType === 'both',
      notifyOnExit: gf.triggerType === 'exit' || gf.triggerType === 'both',
    }));

    await GeofenceModule.registerGeofences(nativeGeofences);
  }

  // 开始监听围栏事件
  startListening(
    onEnter: (id: string) => void | Promise<void>,
    onExit: (id: string) => void | Promise<void>
  ): void {
    // 注册进入事件监听器
    const enterSubscription = geofenceEmitter.addListener(
      'GeofenceEnter',
      (event: GeofenceEventData) => {
        console.log('进入围栏:', event.id);
        onEnter(event.id);
      }
    );
    this.listeners.push(enterSubscription);

    // 注册离开事件监听器
    const exitSubscription = geofenceEmitter.addListener(
      'GeofenceExit',
      (event: GeofenceEventData) => {
        console.log('离开围栏:', event.id);
        onExit(event.id);
      }
    );
    this.listeners.push(exitSubscription);

    // 错误监听
    const errorSubscription = geofenceEmitter.addListener(
      'GeofenceError',
      (error: GeofenceErrorData) => {
        console.error('地理围栏错误:', error);
      }
    );
    this.listeners.push(errorSubscription);
  }

  // 停止监听
  stopListening(): void {
    this.listeners = this.listeners.filter(listener => {
      try {
        listener.remove();
        return false;
      } catch (error) {
        console.warn('移除监听器失败:', error);
        return false;
      }
    });
  }

  // 清除所有已注册的围栏
  async removeAll(): Promise<void> {
    await GeofenceModule.removeAll();
  }

  // 检查设备是否支持后台地理围栏
  static async checkSupport(): Promise<{ supported: boolean; reason?: string }> {
    return await GeofenceModule.checkSupport();
  }
}
