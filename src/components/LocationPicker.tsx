import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import { MapView, Marker, Circle } from 'react-native-amap3d';
import AmapLocationService from '../services/AmapLocationService';

interface LocationPickerProps {
  initialLatitude: number;
  initialLongitude: number;
  onLocationChange: (latitude: number, longitude: number) => void;
  radius?: number;
  autoLocate?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLatitude,
  initialLongitude,
  onLocationChange,
  radius = 500,
  autoLocate = false,
  showCloseButton = false,
  onClose,
}) => {
  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });
  const [cameraPosition, setCameraPosition] = useState({
    target: {
      latitude: initialLatitude,
      longitude: initialLongitude,
    },
    zoom: 15,
  });
  const [loading, setLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const mapRef = useRef<MapView>(null);
  const autoLocateTriggered = useRef(false);
  const locationReceived = useRef(false);
  const isUserLocating = useRef(false); // 标记用户是否主动请求定位

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    setMarkerPosition({ latitude: initialLatitude, longitude: initialLongitude });
    setCameraPosition({
      target: { latitude: initialLatitude, longitude: initialLongitude },
      zoom: 15,
    });
  }, [initialLatitude, initialLongitude]);

  // 当 autoLocate 变化时触发自动定位
  useEffect(() => {
    if (autoLocate && !autoLocateTriggered.current && hasLocationPermission) {
      autoLocateTriggered.current = true;
      locationReceived.current = false;
      isUserLocating.current = true; // 标记为主动定位
      setLoading(true);
      // 设置超时
      const timer = setTimeout(() => {
        if (!locationReceived.current) {
          setLoading(false);
          isUserLocating.current = false;
          console.log('自动定位超时');
        }
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [autoLocate, hasLocationPermission]);

  const checkLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        setHasLocationPermission(granted);
      } else {
        setHasLocationPermission(true);
      }
    } catch (error) {
      console.error('检查位置权限失败:', error);
      setHasLocationPermission(false);
    }
  };

  // 处理地图位置更新事件 - 这是高德地图的定位回调
  const handleLocation = useCallback((event: any) => {
    console.log('高德地图定位回调触发:', JSON.stringify(event.nativeEvent));

    const { coords } = event.nativeEvent;

    if (coords && coords.latitude && coords.longitude) {
      const { latitude, longitude, accuracy } = coords;

      console.log('获取到位置:', latitude, longitude, '精度:', accuracy);

      // 更新位置存储（始终更新，供其他地方使用）
      AmapLocationService.updateFromMap(latitude, longitude, accuracy || 0);

      // 只有在用户主动请求定位时才更新标记和地图位置
      if (isUserLocating.current) {
        locationReceived.current = true;
        const newPosition = { latitude, longitude };
        const newCameraPosition = {
          target: newPosition,
          zoom: 15,
        };

        setMarkerPosition(newPosition);
        setCameraPosition(newCameraPosition);
        onLocationChange(latitude, longitude);

        // 移动地图到当前位置
        mapRef.current?.moveCamera(newCameraPosition, 500);
        setLoading(false);
        isUserLocating.current = false; // 重置标记
      }
    }
  }, [onLocationChange]);

  // 手动触发定位 - 使用 moveCamera 触发位置更新
  const getCurrentLocation = async () => {
    console.log('getCurrentLocation called');

    // 检查并请求权限
    let hasPermission = hasLocationPermission;
    if (!hasPermission && Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasLocationPermission(hasPermission);

        if (!hasPermission) {
          return;
        }
      } catch (error) {
        console.error('请求位置权限失败:', error);
        return;
      }
    }

    locationReceived.current = false;
    isUserLocating.current = true; // 标记为主动定位
    setLoading(true);

    // 设置超时
    setTimeout(() => {
      if (!locationReceived.current) {
        setLoading(false);
        isUserLocating.current = false;
        console.log('定位超时');
      }
    }, 15000);
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent;
    const newPosition = { latitude, longitude };
    setMarkerPosition(newPosition);
    onLocationChange(latitude, longitude);
  };

  const handleMarkerDragEnd = (event: any) => {
    const { latitude, longitude } = event.nativeEvent;
    const newPosition = { latitude, longitude };
    setMarkerPosition(newPosition);
    onLocationChange(latitude, longitude);
  };

  const handleMapReady = () => {
    console.log('高德地图已加载');
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialCameraPosition={cameraPosition}
        onPress={handleMapPress}
        onMapReady={handleMapReady}
        myLocationEnabled={hasLocationPermission}
        myLocationButtonEnabled={false}
        showsCompass={true}
        showsScale={true}
        zoomControlsEnabled={false}
        onLocation={handleLocation}
      >
        <Marker
          position={markerPosition}
          draggable
          onDragEnd={handleMarkerDragEnd}
          title="选中位置"
        />
        {radius > 0 && (
          <Circle
            center={markerPosition}
            radius={radius}
            strokeWidth={2}
            strokeColor="rgba(33, 150, 243, 0.8)"
            fillColor="rgba(33, 150, 243, 0.2)"
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.locateButton} onPress={getCurrentLocation}>
        {loading ? (
          <ActivityIndicator color="#2196F3" />
        ) : (
          <Text style={styles.locateButtonText}>📍</Text>
        )}
      </TouchableOpacity>

      {showCloseButton && onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      )}

      <View style={styles.coordinateDisplay}>
        <Text style={styles.coordinateText}>
          {markerPosition.latitude.toFixed(6)}, {markerPosition.longitude.toFixed(6)}
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
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
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
