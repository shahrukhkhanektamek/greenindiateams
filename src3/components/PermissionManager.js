// components/PermissionManager.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Alert,
  Platform,
  Linking,
  AppState,
  PermissionsAndroid,
} from 'react-native';

// Get Android version
const getAndroidVersion = () => {
  return Platform.Version;
};

// Permission configuration
const getPermissionConfig = () => {
  const isAndroid = Platform.OS === 'android';
  const androidVersion = getAndroidVersion();

  // Android permissions
  const androidPermissions = [
    {
      key: 'location',
      title: 'Location Access',
      description: 'We need your location to show nearby services and track your work.',
      required: true,
      androidPermission: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    },
    {
      key: 'camera',
      title: 'Camera Access',
      description: 'Required to capture photos of your work for documentation.',
      required: true,
      androidPermission: PermissionsAndroid.PERMISSIONS.CAMERA,
    },
    {
      key: 'storage',
      title: 'Storage Access',
      description: 'Needed to save and upload photos, documents, and reports.',
      required: true,
      androidPermission: androidVersion >= 33 
        ? 'android.permission.READ_MEDIA_IMAGES' 
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    },
    {
      key: 'phone',
      title: 'Phone Access',
      description: 'To make calls directly to customers from the app.',
      required: true,
      androidPermission: PermissionsAndroid.PERMISSIONS.CALL_PHONE,
    },
  ];

  // Add notification permission for Android 13+
  if (isAndroid && androidVersion >= 33) {
    androidPermissions.push({
      key: 'notifications',
      title: 'Notifications',
      description: 'Get instant updates about new bookings and schedule changes.',
      required: true,
      androidPermission: 'android.permission.POST_NOTIFICATIONS',
    });
  } else if (isAndroid) {
    androidPermissions.push({
      key: 'notifications',
      title: 'Notifications',
      description: 'Get instant updates about new bookings and schedule changes.',
      required: false,
      androidPermission: null,
      autoGranted: true,
    });
  }

  return isAndroid ? androidPermissions : [];
};

const PermissionManager = ({ 
  onComplete,
  autoRequest = true,
  showAlerts = false,
  onPermissionUpdate,
  silentMode = true, // NEW: Add silent mode to prevent alerts
}) => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const [error, setError] = useState(null);
  
  const initializedRef = useRef(false);
  const permissionRequestedRef = useRef(false); // NEW: Track if permissions already requested
  const filteredPermissions = getPermissionConfig();
  const androidVersion = getAndroidVersion();
  const isAndroid = Platform.OS === 'android';

  // Check Android permission
  const checkAndroidPermission = useCallback(async (permissionKey, permissionConfig) => {
    try {
      if (permissionConfig.autoGranted) {
        return 'granted';
      }

      if (!permissionConfig.androidPermission) {
        return 'unavailable';
      }

      // For Android 13+ notifications
      if (permissionKey === 'notifications' && androidVersion >= 33) {
        const result = await PermissionsAndroid.check(permissionConfig.androidPermission);
        return result ? 'granted' : 'denied';
      }

      const result = await PermissionsAndroid.check(permissionConfig.androidPermission);
      return result ? 'granted' : 'denied';
    } catch (err) {
      return 'unavailable';
    }
  }, [androidVersion]);

  // Request Android permission - SILENT VERSION (no alert)
  const requestAndroidPermission = useCallback(async (permissionKey, permissionConfig) => {
    try {
      if (permissionConfig.autoGranted) {
        return 'granted';
      }

      if (!permissionConfig.androidPermission) {
        return 'unavailable';
      }

      // For Android 13+ notifications
      if (permissionKey === 'notifications' && androidVersion >= 33) {
        const granted = await PermissionsAndroid.request(
          permissionConfig.androidPermission
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
      }

      const granted = await PermissionsAndroid.request(
        permissionConfig.androidPermission
      );
      
      return granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
    } catch (err) {
      return 'unavailable';
    }
  }, [androidVersion]);

  // Check permission status
  const checkPermission = useCallback(async (permissionKey, permissionConfig) => {
    if (isAndroid) {
      return await checkAndroidPermission(permissionKey, permissionConfig);
    }
    return 'unavailable';
  }, [isAndroid, checkAndroidPermission]);

  // Request permission
  const requestPermission = useCallback(async (permissionKey, permissionConfig) => {
    if (isAndroid) {
      return await requestAndroidPermission(permissionKey, permissionConfig);
    }
    return 'unavailable';
  }, [isAndroid, requestAndroidPermission]);

  // Check all permissions
  const checkAllPermissions = useCallback(async () => {
    try {
      const permissionResults = {};
      
      for (const perm of filteredPermissions) {
        const isAutoGranted = perm.autoGranted === true;
        
        let status;
        if (isAutoGranted) {
          status = 'granted';
        } else {
          status = await checkPermission(perm.key, perm);
        }
        
        permissionResults[perm.key] = {
          ...perm,
          status: status,
          granted: status === 'granted',
          autoGranted: isAutoGranted,
        };
      }
      
      setPermissions(permissionResults);
      
      // Notify parent component about permission update
      if (onPermissionUpdate) {
        onPermissionUpdate(permissionResults);
      }
      
      return permissionResults;
    } catch (error) {
      setError(error.message);
      return {};
    }
  }, [filteredPermissions, checkPermission, onPermissionUpdate]);

  // Request all permissions - SILENT VERSION
  const requestAllPermissions = useCallback(async () => {
    try {
      // Don't request if already requested in this session
      if (permissionRequestedRef.current && silentMode) {
        return {};
      }
      
      setLoading(true);
      setError(null);
      const results = {};
      
      for (const perm of filteredPermissions) {
        if (perm.required && !permissions[perm.key]?.granted) {
          const status = await requestPermission(perm.key, perm);
          results[perm.key] = status;
          
          setPermissions(prev => ({
            ...prev,
            [perm.key]: {
              ...perm,
              status: status,
              granted: status === 'granted',
              autoGranted: perm.autoGranted === true,
            }
          }));
        }
      }
      
      // Mark that permissions have been requested in this session
      permissionRequestedRef.current = true;
      
      // Update parent component
      if (onPermissionUpdate) {
        onPermissionUpdate(permissions);
      }
      
      // Check if all required permissions are granted
      const allRequiredGranted = filteredPermissions
        .filter(p => p.required)
        .every(p => {
          const perm = permissions[p.key];
          return results[p.key] === 'granted' || perm?.granted || perm?.autoGranted;
        });
      
      if (allRequiredGranted && onComplete) {
        onComplete();
      }
      
      return results;
    } catch (error) {
      setError(error.message);
      
      // Only show alert if explicitly requested
      if (showAlerts && !silentMode) {
        Alert.alert(
          'Permission Error',
          'Failed to request permissions.',
          [{ text: 'OK' }]
        );
      }
      
      return {};
    } finally {
      setLoading(false);
    }
  }, [filteredPermissions, permissions, onComplete, requestPermission, onPermissionUpdate, showAlerts, silentMode]);

  // Open app settings
  const openAppSettings = useCallback(() => {
    Linking.openSettings().catch(() => {
      if (showAlerts && !silentMode) {
        Alert.alert(
          'Cannot Open Settings',
          'Please go to your device settings manually.',
          [{ text: 'OK' }]
        );
      }
    });
  }, [showAlerts, silentMode]);

  // Check if all required permissions are granted
  const areAllRequiredPermissionsGranted = useCallback(() => {
    return filteredPermissions
      .filter(p => p.required)
      .every(p => {
        const perm = permissions[p.key];
        return perm?.granted || perm?.autoGranted;
      });
  }, [filteredPermissions, permissions]);

  // Get permission status
  const getPermissionStatus = useCallback((permissionKey) => {
    return permissions[permissionKey]?.status || 'unknown';
  }, [permissions]);

  // Check if a specific permission is granted
  const isPermissionGranted = useCallback((permissionKey) => {
    const perm = permissions[permissionKey];
    return perm?.granted || perm?.autoGranted || false;
  }, [permissions]);

  // Get all permissions status
  const getAllPermissionsStatus = useCallback(() => {
    return permissions;
  }, [permissions]);

  // Initialize permissions on mount
  useEffect(() => {
    if (initializedRef.current) return;
    
    const initialize = async () => {
      try {
        initializedRef.current = true;
        await checkAllPermissions();
        setLoading(false);
        
        // Auto request only once and only if not all permissions are granted
        if (autoRequest && !areAllRequiredPermissionsGranted()) {
          // Small delay before requesting
          setTimeout(() => {
            requestAllPermissions();
          }, 1000);
        } else if (onComplete && areAllRequiredPermissionsGranted()) {
          onComplete();
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initialize();

    // Listen for app state changes - but don't auto-request when coming back
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // Only check, don't request
        checkAllPermissions();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription?.remove();
      initializedRef.current = false;
    };
  }, [checkAllPermissions, areAllRequiredPermissionsGranted, requestAllPermissions, onComplete, appState, autoRequest]);

  // This component doesn't render anything
  return null;
};

// Export helper functions WITHOUT alerts
export const PermissionUtils = {
  // Check if device is Android
  isAndroid: () => Platform.OS === 'android',
  
  // Check if device is iOS
  isIOS: () => Platform.OS === 'ios',
  
  // Get Android version
  getAndroidVersion, 
  
  // Open app settings (no alert)
  openAppSettings: () => {
    Linking.openSettings().catch(() => {
      // No alert in utils
    });
  },
};

export default PermissionManager;