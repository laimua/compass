import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import { MapView, Marker, Circle } from 'react-native-amap3d';
import Geolocation from 'react-native-geolocation-service';
import AmapLocationService from '../services/AmapLocationService';

interface LocationPickerProps {
  initialLatitude: number;
  initialLongitude: number;
  onLocationChange: (latitude: number, longitude: number) => void;
  radius?: number;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLatitude,
  initialLongitude,
  onLocationChange,
  radius = 500,
  showCloseButton = false,
  onClose,
}) => {
  // 使用 ref 存储初始值，确保只在组件挂载时使用一次
  const initialValuesRef = useRef({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });

  // 位置状态完全由内部管理，不受外部 props 影响
  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialValuesRef.current.latitude,
    longitude: initialValuesRef.current.longitude,
  });
  const [cameraPosition, setCameraPosition] = useState({
    target: {
      latitude: initialValuesRef.current.latitude,
      longitude: initialValuesRef.current.longitude,
    },
    zoom: 15,
  });
  const [loading, setLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

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

  // 处理地图位置更新事件 - 仅用于更新 AmapLocationService，不更新标记位置
  const handleLocation = useCallback((event: any) => {
    const { coords } = event.nativeEvent;

    if (coords && coords.latitude && coords.longitude) {
      const { latitude, longitude, accuracy } = coords;
      // 只更新位置存储，不更新标记位置
      AmapLocationService.updateFromMap(latitude, longitude, accuracy || 0);
    }
  }, []);

  // 更新位置的通用方法
  const updatePosition = useCallback((latitude: number, longitude: number, moveCamera: boolean = true) => {
    const newPosition = { latitude, longitude };
    const newCameraPosition = {
      target: newPosition,
      zoom: 15,
    };

    setMarkerPosition(newPosition);
    setCameraPosition(newCameraPosition);
    onLocationChange(latitude, longitude);

    if (moveCamera && mapRef.current) {
      mapRef.current.moveCamera(newCameraPosition, 500);
    }
  }, [onLocationChange]);

  // 手动触发定位 - 使用 Geolocation 主动获取位置
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

    setLoading(true);

    // 使用 Geolocation 主动获取位置
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('获取到位置:', latitude, longitude);
        updatePosition(latitude, longitude, true);
        setLoading(false);
      },
      (error) => {
        console.error('获取位置失败:', error);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  // 用户点击地图选择位置
  const handleMapPress = useCallback((event: any) => {
    const { latitude, longitude } = event.nativeEvent;
    console.log('用户点击地图:', latitude, longitude);
    updatePosition(latitude, longitude, false);
  }, [updatePosition]);

  // 用户拖动标记选择位置
  const handleMarkerDragEnd = useCallback((event: any) => {
    const { latitude, longitude } = event.nativeEvent;
    console.log('用户拖动标记:', latitude, longitude);
    updatePosition(latitude, longitude, false);
  }, [updatePosition]);

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
