import React, { useEffect, useState, useMemo } from 'react';
import { StatusBar, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Database } from './database/Database';
import { GeofenceService } from './services/GeofenceService';
import { NotificationService } from './services/NotificationService';
import { SoundService } from './services/SoundService';
import { PermissionService } from './services/PermissionService';
import { HomeScreen } from './screens/HomeScreen';
import { AddGeofenceScreen } from './screens/AddGeofenceScreen';
import { PermissionScreen } from './screens/PermissionScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const db = Database.getInstance();

  // 使用 useMemo 缓存服务实例,避免每次渲染都重新创建
  const notificationService = useMemo(() => new NotificationService(), []);
  const soundService = useMemo(() => new SoundService(), []);
  const geofenceService = useMemo(() => new GeofenceService(), []);

  useEffect(() => {
    initializeApp();
    return () => {
      // 清理资源
      geofenceService.stopListening();
      soundService.cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // 初始化通知服务
      notificationService.configure();

      // 请求权限
      const permissionService = new PermissionService();
      const locationGranted = await permissionService.requestLocationPermission();
      const notificationGranted = await permissionService.requestNotificationPermission();

      console.log('权限检查结果:', { locationGranted, notificationGranted });

      if (!locationGranted || !notificationGranted) {
        console.warn('权限未授予:', {
          locationGranted,
          notificationGranted,
          locationReason: !locationGranted ? '位置权限未授予' : 'ok',
          notificationReason: !notificationGranted ? '通知权限未授予' : 'ok'
        });
        setHasPermission(false);
        setIsInitialized(true);
        return;
      }

      console.log('权限检查通过，继续初始化...');

      setHasPermission(true);

      // 检查设备支持
      const support = await GeofenceService.checkSupport();
      if (!support.supported) {
        Alert.alert('设备不支持', support.reason || '您的设备不支持后台地理围栏');
        setIsInitialized(true);
        return;
      }

      // 初始化数据库
      await db.init();

      // 验证数据库初始化
      if (!db.isReady()) {
        throw new Error('数据库未正确初始化');
      }

      // 注册地理围栏
      if (!db.geofence) {
        throw new Error('数据库 geofence 模型未初始化');
      }
      const geofences = await db.geofence.getAll();

      // 只有在有启用围栏时才注册
      const enabledGeofences = geofences.filter(g => g.enabled);
      if (enabledGeofences.length > 0) {
        await geofenceService.registerGeofences(geofences);
      } else {
        console.log('没有启用的围栏，跳过注册');
      }

      // 开始监听围栏事件
      geofenceService.startListening(
        async (id) => {
          try {
            await handleGeofenceEvent(id, true);
          } catch (error) {
            console.error('处理进入事件失败:', error);
          }
        },
        async (id) => {
          try {
            await handleGeofenceEvent(id, false);
          } catch (error) {
            console.error('处理离开事件失败:', error);
          }
        }
      );

      setIsInitialized(true);
    } catch (error) {
      console.error('初始化失败:', error);
      const errorMessage = error instanceof Error ? error.message : '应用初始化过程中发生错误';
      Alert.alert('初始化失败', errorMessage);
      setIsInitialized(true);
    }
  };

  const handleGeofenceEvent = async (id: string, isEnter: boolean) => {
    try {
      // 验证数据库已准备就绪
      if (!db.isReady() || !db.geofence) {
        console.error('数据库未初始化，无法处理地理围栏事件');
        return;
      }

      // 查找对应围栏
      const geofenceId = parseInt(id, 10);
      if (isNaN(geofenceId)) {
        console.error('无效的地理围栏 ID:', id);
        return;
      }

      const geofence = await db.geofence.findById(geofenceId);

      if (!geofence || !geofence.enabled) {
        console.log('围栏不存在或已禁用:', id);
        return;
      }

      // 快速执行提醒
      if (geofence.alertMethods.sound) {
        await soundService.play();
      }
      if (geofence.alertMethods.vibration) {
        soundService.vibrate();
      }
      if (geofence.alertMethods.notification) {
        const message = isEnter
          ? `您已进入区域：${geofence.name}`
          : `您已离开区域：${geofence.name}`;
        notificationService.show('Compass提醒', message, geofence.alertMethods.sound);
      }

      // 立即释放资源，让系统休眠
      // 不进行任何长时间操作
    } catch (error) {
      console.error('处理地理围栏事件失败:', error);
    }
  };

  if (!isInitialized) {
    return null; // 加载中
  }

  if (!hasPermission) {
    return <PermissionScreen onPermissionGranted={() => setHasPermission(true)} />;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '方圆 Compass' }}
        />
        <Stack.Screen
          name="AddGeofence"
          component={AddGeofenceScreen}
          options={{ title: '添加围栏' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
