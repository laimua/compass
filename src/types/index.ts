// 触发类型
export type TriggerType = 'enter' | 'exit' | 'both';

// 提醒方式
export type AlertMethod = {
  sound: boolean;
  vibration: boolean;
  notification: boolean;
};

// 围栏数据结构
export interface Geofence {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // 必须 ≥ 100m
  triggerType: TriggerType;
  alertMethods: AlertMethod;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

// 原生地理围栏数据结构（用于与原生模块交互）
export interface NativeGeofenceData {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
}

// 地理围栏事件数据
export interface GeofenceEventData {
  id: string;
  timestamp?: number;
}

// 地理围栏错误事件
export interface GeofenceErrorData {
  code?: string;
  message?: string;
}

// 原生模块接口
export interface GeofenceNativeModule {
  registerGeofences(geofences: NativeGeofenceData[]): Promise<void>;
  removeAll(): Promise<void>;
  checkSupport(): Promise<{ supported: boolean; reason?: string }>;
}
