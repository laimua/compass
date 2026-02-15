import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { List, FAB, Divider, Switch } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Geofence } from '../types';
import { Database } from '../database/Database';
import { GeofenceService } from '../services/GeofenceService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<any>;

interface Props {
  navigation: NavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [geofences, setGeofences] = React.useState<Geofence[]>([]);
  const db = Database.getInstance();

  // 每次页面获得焦点时重新加载数据
  useFocusEffect(
    useCallback(() => {
      loadGeofences();
    }, [])
  );

  const loadGeofences = async () => {
    await db.init();
    if (!db.geofence) {
      console.error('数据库 geofence 模型未初始化');
      return;
    }
    const all = await db.geofence.getAll();
    setGeofences(all);
  };

  const toggleEnabled = async (id: number, enabled: boolean) => {
    if (!db.geofence) {
      Alert.alert('错误', '数据库未初始化');
      return;
    }

    try {
      await db.geofence.update(id, { enabled });
      const geofenceService = new GeofenceService();
      const updatedList = geofences.map(g => g.id === id ? { ...g, enabled } : g);
      await geofenceService.registerGeofences(updatedList.filter(g => g.enabled));
      loadGeofences();
    } catch (error) {
      console.error('更新围栏状态失败:', error);
      Alert.alert('操作失败', '更新围栏状态时发生错误,请重试');
    }
  };

  const deleteGeofence = async (id: number) => {
    const geofence = geofences.find(g => g.id === id);
    if (!geofence) return;

    // 显示确认对话框
    const confirmed = await new Promise<boolean>((resolve) => {
      Alert.alert(
        '确认删除',
        `确定要删除围栏 "${geofence.name}" 吗？此操作无法撤销。`,
        [
          { text: '取消', style: 'cancel', onPress: () => resolve(false) },
          { text: '删除', style: 'destructive', onPress: () => resolve(true) },
        ]
      );
    });

    if (!confirmed) return;

    if (!db.geofence) {
      Alert.alert('错误', '数据库未初始化');
      return;
    }

    try {
      await db.geofence.delete(id);
      const remainingGeofences = geofences.filter(g => g.id !== id);
      const geofenceService = new GeofenceService();
      // 如果没有剩余围栏，清除所有；否则重新注册
      if (remainingGeofences.filter(g => g.enabled).length === 0) {
        await geofenceService.removeAll();
      } else {
        await geofenceService.registerGeofences(remainingGeofences);
      }
      loadGeofences();
    } catch (error) {
      console.error('删除围栏失败:', error);
      Alert.alert('删除失败', '删除围栏时发生错误,请重试');
    }
  };

  const renderItem = ({ item }: { item: Geofence }) => (
    <List.Item
      title={item.name}
      description={`半径: ${item.radius}m | 触发: ${item.triggerType}`}
      right={() => (
        <Switch
          value={item.enabled}
          onValueChange={() => toggleEnabled(item.id, !item.enabled)}
        />
      )}
      onPress={() => navigation.navigate('AddGeofence', { geofence: item })}
      onLongPress={() => deleteGeofence(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={geofences}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={
          <List.Item title="暂无地理围栏，点击右下角按钮添加" />
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddGeofence')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
