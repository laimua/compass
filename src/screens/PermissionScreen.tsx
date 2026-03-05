import React, { useEffect, useState } from 'react';
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { PermissionService } from '../services/PermissionService';

interface Props {
  onPermissionGranted: () => void;
}

export const PermissionScreen: React.FC<Props> = ({ onPermissionGranted }) => {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 页面加载时检查是否已有权限
    checkExistingPermissions();

    // 监听应用状态变化，当从后台返回时重新检查权限
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log('应用状态变化:', nextAppState);
    if (nextAppState === 'active') {
      // 应用回到前台时重新检查权限
      checkExistingPermissions();
    }
  };

  const checkExistingPermissions = async () => {
    console.log('PermissionScreen: 开始检查权限...');
    const permissionService = new PermissionService();
    const permissions = await permissionService.checkPermissions();

    console.log('PermissionScreen: 现有权限检查结果:', permissions);

    if (permissions.location && permissions.notification) {
      // 已有所有权限，直接进入主页面
      console.log('PermissionScreen: 权限已授予，进入主页面');
      onPermissionGranted();
    } else {
      console.log('PermissionScreen: 权限未授予，显示授权按钮');
      setChecking(false);
    }
  };

  const handleRequestPermissions = async () => {
    const permissionService = new PermissionService();
    const granted = await permissionService.requestPermissions();

    if (granted) {
      onPermissionGranted();
    }
  };

  // 检查中不显示内容
  if (checking) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>方圆 Compass</Text>
          <Text style={styles.description}>
            需要获取位置和通知权限来使用地理围栏提醒功能。
          </Text>
          <Button
            mode="contained"
            onPress={handleRequestPermissions}
            style={styles.button}
          >
            授予权限
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    marginTop: 10,
  },
});
