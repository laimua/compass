import { Platform, PermissionsAndroid } from 'react-native';

// 全局位置存储，供地图组件更新
class LocationStore {
  private static instance: LocationStore;
  private currentLocation: { latitude: number; longitude: number; accuracy: number } | null = null;
  private listeners: Array<(location: { latitude: number; longitude: number; accuracy: number } | null) => void> = [];

  static getInstance(): LocationStore {
    if (!LocationStore.instance) {
      LocationStore.instance = new LocationStore();
    }
    return LocationStore.instance;
  }

  setLocation(location: { latitude: number; longitude: number; accuracy: number } | null) {
    this.currentLocation = location;
    console.log('LocationStore 更新位置:', location);
    this.listeners.forEach(listener => listener(location));
  }

  getLocation(): { latitude: number; longitude: number; accuracy: number } | null {
    return this.currentLocation;
  }

  addListener(listener: (location: { latitude: number; longitude: number; accuracy: number } | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  clearLocation() {
    this.currentLocation = null;
  }
}

export const locationStore = LocationStore.getInstance();

class LocationService {
  private initialized = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      // 请求权限
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        if (granted['android.permission.ACCESS_FINE_LOCATION'] !== 'granted' &&
            granted['android.permission.ACCESS_COARSE_LOCATION'] !== 'granted') {
          console.error('位置权限未授予');
          return false;
        }
      }

      this.initialized = true;
      console.log('定位服务初始化成功');
      return true;
    } catch (error) {
      console.error('定位服务初始化失败:', error);
      return false;
    }
  }

  // 等待地图获取位置
  async waitForLocation(timeout: number = 15000): Promise<{ latitude: number; longitude: number; accuracy: number } | null> {
    // 确保已初始化
    const success = await this.initialize();
    if (!success) {
      return null;
    }

    return new Promise((resolve) => {
      // 检查是否已有位置
      const existingLocation = locationStore.getLocation();
      if (existingLocation) {
        resolve(existingLocation);
        return;
      }

      // 设置超时
      const timeoutId = setTimeout(() => {
        console.log('等待位置超时');
        resolve(null);
      }, timeout);

      // 监听位置更新
      const unsubscribe = locationStore.addListener((location) => {
        if (location) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(location);
        }
      });
    });
  }

  // 获取当前位置（从缓存或等待地图更新）
  async getCurrentPosition(): Promise<{ latitude: number; longitude: number; accuracy: number } | null> {
    const success = await this.initialize();
    if (!success) {
      console.error('定位服务未初始化');
      return null;
    }

    // 清除旧位置，强制获取新位置
    locationStore.clearLocation();

    // 等待新位置
    return this.waitForLocation(20000);
  }

  // 从地图更新位置
  updateFromMap(latitude: number, longitude: number, accuracy: number = 0) {
    locationStore.setLocation({ latitude, longitude, accuracy });
  }
}

export default new LocationService();
