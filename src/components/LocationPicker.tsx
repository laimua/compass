import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform, Alert, PermissionsAndroid } from 'react-native';
import MapView, { Marker, Region, LatLng, PressEvent, MarkerDragEvent } from 'react-native-maps';

interface LocationPickerProps {
  initialLatitude: number;
  initialLongitude: number;
  onLocationChange: (latitude: number, longitude: number) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLatitude,
  initialLongitude,
  onLocationChange,
}) => {
  const [region, setRegion] = useState<Region>({
    latitude: initialLatitude,
    longitude: initialLongitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [marker, setMarker] = useState<LatLng>({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });
  const [loading, setLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    setMarker({ latitude: initialLatitude, longitude: initialLongitude });
    setRegion({
      latitude: initialLatitude,
      longitude: initialLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, [initialLatitude, initialLongitude]);

  const checkLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        setHasLocationPermission(granted);
      } else {
        // iOS 默认假设有权限
        setHasLocationPermission(true);
      }
    } catch (error) {
      console.error('检查位置权限失败:', error);
      // 假设有权限，让 Geolocation 自己处理
      setHasLocationPermission(true);
    }
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasLocationPermission(hasPermission);
        if (hasPermission) {
          getCurrentLocation();
        }
      }
    } catch (error) {
      console.error('请求位置权限失败:', error);
    }
  };

  const getCurrentLocation = async () => {
    if (!hasLocationPermission) {
      await requestLocationPermission();
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        setMarker({ latitude, longitude });
        onLocationChange(latitude, longitude);
        setLoading(false);

        mapRef.current?.animateToRegion(newRegion, 500);
      },
      (error) => {
        console.error('获取位置失败:', error);
        setLoading(false);
        Alert.alert('提示', `无法获取当前位置: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const handleMapPress = (event: PressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    onLocationChange(latitude, longitude);
  };

  const handleMarkerDragEnd = (event: MarkerDragEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    onLocationChange(latitude, longitude);
  };

  const handleMapError = (error?: any) => {
    console.log('地图错误:', error);
    setMapError('地图加载失败。可能是 Google Play 服务未安装或版本过低。\n\n您可以手动输入经纬度来设置围栏位置。');
  };

  // 检查 Google Play Services 是否可用
  const checkPlayServices = async () => {
    try {
      // 简单检查 - 如果地图能在5秒内加载成功就继续
      setTimeout(() => {
        if (!mapRef.current) {
          console.log('地图加载超时');
        }
      }, 5000);
    } catch (error) {
      console.error('Play Services 检查失败:', error);
    }
  };

  // 如果地图出错，显示提示
  if (mapError) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>⚠️ {mapError}</Text>
        <Text style={styles.hintText}>
          您可以手动输入经纬度，或联系开发者配置地图功能。
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setMapError(null)}>
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        provider="google"
        onMapReady={() => console.log('地图已加载')}
        onError={handleMapError}
      >
        <Marker
          coordinate={marker}
          draggable
          onDragEnd={handleMarkerDragEnd}
          title="选中位置"
        />
      </MapView>

      <TouchableOpacity style={styles.locateButton} onPress={getCurrentLocation}>
        {loading ? (
          <ActivityIndicator color="#2196F3" />
        ) : (
          <Text style={styles.locateButtonText}>📍</Text>
        )}
      </TouchableOpacity>

      <View style={styles.coordinateDisplay}>
        <Text style={styles.coordinateText}>
          {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
        </Text>
      </View>

      <View style={styles.hintContainer}>
        <Text style={styles.mapHint}>点击地图或拖动标记选择位置</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    marginVertical: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
  },
  locateButton: {
    position: 'absolute',
    bottom: 60,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  locateButtonText: {
    fontSize: 24,
  },
  coordinateDisplay: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 4,
  },
  coordinateText: {
    fontSize: 12,
    color: '#333',
  },
  hintContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
