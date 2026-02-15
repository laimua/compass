import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { PermissionService } from '../services/PermissionService';

interface Props {
  onPermissionGranted: () => void;
}

export const PermissionScreen: React.FC<Props> = ({ onPermissionGranted }) => {
  const requestPermissions = async () => {
    const permissionService = new PermissionService();
    const locationGranted = await permissionService.requestLocationPermission();
    const notificationGranted = await permissionService.requestNotificationPermission();

    if (locationGranted && notificationGranted) {
      onPermissionGranted();
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Compass 方圆</Text>
          <Text style={styles.description}>
            需要获取位置和通知权限来使用地理围栏提醒功能。
          </Text>
          <Button
            mode="contained"
            onPress={requestPermissions}
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
