import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import {
  TextInput,
  Button,
  Checkbox,
  Text,
  HelperText,
  Chip,
} from 'react-native-paper';
import { Geofence, TriggerType } from '../types';
import { Database } from '../database/Database';
import { GeofenceService } from '../services/GeofenceService';
import { LocationPicker } from '../components/LocationPicker';
import Geolocation from 'react-native-geolocation-service';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<any>;
type AddGeofenceRouteProp = RouteProp<{ AddGeofence: { geofence?: Geofence } }, 'AddGeofence'>;

interface Props {
  navigation: NavigationProp;
  route: AddGeofenceRouteProp;
}

export const AddGeofenceScreen: React.FC<Props> = ({ navigation, route }) => {
  const editGeofence = route.params?.geofence;
  const isEditMode = !!editGeofence;

  const [name, setName] = useState(editGeofence?.name || '');
  const [latitude, setLatitude] = useState(editGeofence?.latitude?.toString() || '39.9042');
  const [longitude, setLongitude] = useState(editGeofence?.longitude?.toString() || '116.4074');
  const [radius, setRadius] = useState(editGeofence?.radius?.toString() || '200');
  const [triggerType, setTriggerType] = useState<TriggerType>(editGeofence?.triggerType || 'enter');
  const [soundEnabled, setSoundEnabled] = useState(editGeofence?.alertMethods?.sound ?? true);
  const [vibrationEnabled, setVibrationEnabled] = useState(editGeofence?.alertMethods?.vibration ?? true);
  const [notificationEnabled, setNotificationEnabled] = useState(editGeofence?.alertMethods?.notification ?? true);
  const [enabled, setEnabled] = useState(editGeofence?.enabled ?? true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showMap, setShowMap] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    // 设置页面标题
    navigation.setOptions({ title: isEditMode ? '编辑围栏' : '添加围栏' });
  }, [isEditMode, navigation]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = '请输入围栏名称';
    }
    if (!latitude || isNaN(parseFloat(latitude))) {
      newErrors.latitude = '请输入有效的纬度';
    }
    if (!longitude || isNaN(parseFloat(longitude))) {
      newErrors.longitude = '请输入有效的经度';
    }
    if (!radius || isNaN(parseInt(radius))) {
      newErrors.radius = '请输入有效的半径';
    } else if (parseInt(radius) < 100) {
      newErrors.radius = '半径不能小于100米（省电设计要求）';
    } else if (parseInt(radius) > 5000) {
      newErrors.radius = '半径不能超过5000米';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const db = Database.getInstance();
    await db.init();

    if (!db.geofence) {
      Alert.alert('错误', '数据库未初始化');
      return;
    }

    const geofenceData: Omit<Geofence, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseInt(radius),
      triggerType,
      alertMethods: {
        sound: soundEnabled,
        vibration: vibrationEnabled,
        notification: notificationEnabled,
      },
      enabled,
    };

    try {
      if (isEditMode && editGeofence) {
        // 更新现有围栏
        await db.geofence.update(editGeofence.id, geofenceData);
      } else {
        // 创建新围栏
        await db.geofence.create(geofenceData);
      }

      // 重新注册地理围栏
      const allGeofences = await db.geofence.getAll();
      const geofenceService = new GeofenceService();
      const enabledGeofences = allGeofences.filter(g => g.enabled);
      if (enabledGeofences.length > 0) {
        await geofenceService.registerGeofences(allGeofences);
      } else {
        await geofenceService.removeAll();
      }

      navigation.goBack();
    } catch (error) {
      console.error('保存围栏失败:', error);
      Alert.alert('保存失败', error instanceof Error ? error.message : '保存围栏时发生错误,请重试');
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !editGeofence) return;

    const confirmed = await new Promise<boolean>((resolve) => {
      Alert.alert(
        '确认删除',
        `确定要删除围栏 "${editGeofence.name}" 吗？此操作无法撤销。`,
        [
          { text: '取消', style: 'cancel', onPress: () => resolve(false) },
          { text: '删除', style: 'destructive', onPress: () => resolve(true) },
        ]
      );
    });

    if (!confirmed) return;

    const db = Database.getInstance();
    await db.init();

    if (!db.geofence) {
      Alert.alert('错误', '数据库未初始化');
      return;
    }

    try {
      await db.geofence.delete(editGeofence.id);
      const allGeofences = await db.geofence.getAll();
      const geofenceService = new GeofenceService();
      if (allGeofences.filter(g => g.enabled).length > 0) {
        await geofenceService.registerGeofences(allGeofences);
      } else {
        await geofenceService.removeAll();
      }
      navigation.goBack();
    } catch (error) {
      console.error('删除围栏失败:', error);
      Alert.alert('删除失败', error instanceof Error ? error.message : '删除围栏时发生错误');
    }
  };

  const handleLocationChange = (newLatitude: number, newLongitude: number) => {
    setLatitude(newLatitude.toFixed(6));
    setLongitude(newLongitude.toFixed(6));
    if (errors.latitude || errors.longitude) {
      const newErrors = { ...errors };
      delete newErrors.latitude;
      delete newErrors.longitude;
      setErrors(newErrors);
    }
  };

  const getCurrentLocation = async () => {
    try {
      // 先检查权限
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (!granted) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (result !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('提示', '需要位置权限才能获取当前位置');
            return;
          }
        }
      }

      setGettingLocation(true);

      // 设置超时保护
      const timeoutId = setTimeout(() => {
        setGettingLocation(false);
        Alert.alert('提示', '获取位置超时，请手动输入经纬度\n\n提示：可打开手机地图APP查看当前坐标');
      }, 15000);

      Geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const { latitude: lat, longitude: lng } = position.coords;
          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));
          if (errors.latitude || errors.longitude) {
            const newErrors = { ...errors };
            delete newErrors.latitude;
            delete newErrors.longitude;
            setErrors(newErrors);
          }
          setGettingLocation(false);
          Alert.alert('成功', `已获取当前位置\n纬度: ${lat.toFixed(6)}\n经度: ${lng.toFixed(6)}`);
        },
        (error) => {
          clearTimeout(timeoutId);
          setGettingLocation(false);
          let errorMsg = '无法获取当前位置';
          if (error.code === 1) {
            errorMsg = '位置权限被拒绝';
          } else if (error.code === 2) {
            errorMsg = '位置服务不可用，请开启 GPS';
          } else if (error.code === 3) {
            errorMsg = '获取位置超时';
          }
          Alert.alert('提示', `${errorMsg}\n\n请手动输入经纬度`);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } catch (error) {
      setGettingLocation(false);
      Alert.alert('提示', '获取位置失败，请手动输入经纬度');
    }
  };

  const toggleMap = () => {
    if (!showMap) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lng)) {
        Alert.alert('提示', '请先输入有效的经纬度，或使用地图定位功能');
        return;
      }
    }
    setShowMap(!showMap);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          label="围栏名称"
          value={name}
          onChangeText={setName}
          error={!!errors.name}
          mode="outlined"
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>

        <TextInput
          label="纬度"
          value={latitude}
          onChangeText={setLatitude}
          error={!!errors.latitude}
          mode="outlined"
          keyboardType="decimal-pad"
          right={<TextInput.Affix text="°" />}
        />
        <HelperText type="error" visible={!!errors.latitude}>
          {errors.latitude}
        </HelperText>

        <TextInput
          label="经度"
          value={longitude}
          onChangeText={setLongitude}
          error={!!errors.longitude}
          mode="outlined"
          keyboardType="decimal-pad"
          right={<TextInput.Affix text="°" />}
        />
        <HelperText type="error" visible={!!errors.longitude}>
          {errors.longitude}
        </HelperText>

        <View style={styles.locationButtons}>
          <Button
            mode="outlined"
            onPress={getCurrentLocation}
            icon="crosshairs-gps"
            style={styles.locationButton}
            disabled={gettingLocation}
            loading={gettingLocation}
          >
            {gettingLocation ? '定位中...' : '获取位置'}
          </Button>
          <Button
            mode="outlined"
            onPress={toggleMap}
            icon="map"
            style={styles.locationButton}
          >
            {showMap ? '隐藏地图' : '地图选点'}
          </Button>
        </View>
        <HelperText type="info">
          提示：可在地图应用中查看坐标后手动输入
        </HelperText>

        {showMap && (
          <LocationPicker
            initialLatitude={parseFloat(latitude) || 39.9042}
            initialLongitude={parseFloat(longitude) || 116.4074}
            onLocationChange={handleLocationChange}
          />
        )}

        <TextInput
          label="半径（米）"
          value={radius}
          onChangeText={setRadius}
          error={!!errors.radius}
          mode="outlined"
          keyboardType="number-pad"
          right={<TextInput.Affix text="m" />}
        />
        <HelperText type="error" visible={!!errors.radius}>
          {errors.radius}
        </HelperText>
        <HelperText type="info" visible={!errors.radius}>
          半径范围：100-5000米（≥100m可启用省电模式）
        </HelperText>

        <Text style={styles.label}>触发类型</Text>
        <View style={styles.chipContainer}>
          <Chip
            selected={triggerType === 'enter'}
            onPress={() => setTriggerType('enter')}
            style={styles.chip}
          >
            进入
          </Chip>
          <Chip
            selected={triggerType === 'exit'}
            onPress={() => setTriggerType('exit')}
            style={styles.chip}
          >
            离开
          </Chip>
          <Chip
            selected={triggerType === 'both'}
            onPress={() => setTriggerType('both')}
            style={styles.chip}
          >
            进入和离开
          </Chip>
        </View>

        <Text style={styles.label}>提醒方式</Text>
        <View style={styles.checkboxContainer}>
          <Checkbox.Item
            label="铃声"
            status={soundEnabled ? 'checked' : 'unchecked'}
            onPress={() => setSoundEnabled(!soundEnabled)}
          />
          <Checkbox.Item
            label="震动"
            status={vibrationEnabled ? 'checked' : 'unchecked'}
            onPress={() => setVibrationEnabled(!vibrationEnabled)}
          />
          <Checkbox.Item
            label="通知"
            status={notificationEnabled ? 'checked' : 'unchecked'}
            onPress={() => setNotificationEnabled(!notificationEnabled)}
          />
        </View>

        <Text style={styles.label}>状态</Text>
        <View style={styles.checkboxContainer}>
          <Checkbox.Item
            label="启用"
            status={enabled ? 'checked' : 'unchecked'}
            onPress={() => setEnabled(!enabled)}
          />
        </View>

        <Button mode="contained" onPress={handleSave} style={styles.button}>
          {isEditMode ? '保存修改' : '保存围栏'}
        </Button>

        {isEditMode && (
          <Button
            mode="outlined"
            onPress={handleDelete}
            style={styles.deleteButton}
            textColor="red"
          >
            删除围栏
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '500',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  checkboxContainer: {
    marginTop: 8,
  },
  button: {
    marginTop: 30,
    marginBottom: 10,
  },
  deleteButton: {
    marginTop: 10,
    marginBottom: 20,
    borderColor: 'red',
  },
  locationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  locationButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
