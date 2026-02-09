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

// Permission configuration - MODIFIED TO ADD AUDIO PERMISSIONS
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
    // NEW AUDIO PERMISSIONS ADDED BELOW
    {
      key: 'modify_audio_settings',
      title: 'Audio Settings Control',
      description: 'To ensure notification sounds play at maximum volume for urgent bookings.',
      required: false, // Not required but recommended
      androidPermission: PermissionsAndroid.PERMISSIONS.MODIFY_AUDIO_SETTINGS,
      category: 'notification', // NEW: For grouping
    },
    {
      key: 'notification_policy',
      title: 'Do Not Disturb Access',
      description: 'To play notification sounds even when phone is in Do Not Disturb mode.',
      required: false, // Not required but recommended
      androidPermission: PermissionsAndroid.PERMISSIONS.ACCESS_NOTIFICATION_POLICY,
      category: 'notification', // NEW: For grouping
      requiresSettings: true, // NEW: This permission needs manual settings access
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
      category: 'notification', // NEW: For grouping
    });
  } else if (isAndroid) {
    androidPermissions.push({
      key: 'notifications',
      title: 'Notifications',
      description: 'Get instant updates about new bookings and schedule changes.',
      required: false,
      androidPermission: null,
      autoGranted: true,
      category: 'notification', // NEW: For grouping
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

  // Check Android permission - MODIFIED FOR AUDIO PERMISSIONS
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

      // For ACCESS_NOTIFICATION_POLICY - needs special handling
      if (permissionKey === 'notification_policy') {
        try {
          // This permission often requires checking via Settings
          const result = await PermissionsAndroid.check(permissionConfig.androidPermission);
          return result ? 'granted' : 'denied';
        } catch (error) {
          // If check fails, it's probably not granted
          return 'denied';
        }
      }

      // For other permissions
      const result = await PermissionsAndroid.check(permissionConfig.androidPermission);
      return result ? 'granted' : 'denied';
    } catch (err) {
      return 'unavailable';
    }
  }, [androidVersion]);

  // Request Android permission - SILENT VERSION (no alert) - MODIFIED FOR AUDIO PERMISSIONS
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

      // For ACCESS_NOTIFICATION_POLICY - needs special handling
      if (permissionKey === 'notification_policy') {
        try {
          // This permission may require user to go to Settings
          const granted = await PermissionsAndroid.request(
            permissionConfig.androidPermission
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return 'granted';
          } else {
            // If denied, it might need manual settings access
            return 'requires_settings';
          }
        } catch (error) {
          return 'unavailable';
        }
      }

      // For other permissions
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
        // Request only if required or if it's an audio permission
        const shouldRequest = perm.required || 
                            perm.key === 'modify_audio_settings' || 
                            perm.key === 'notification_policy';
        
        if (shouldRequest && !permissions[perm.key]?.granted) {
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

  // Open notification settings specifically
  const openNotificationSettings = useCallback(() => {
    if (Platform.OS === 'android') {
      // Try to open notification settings
      Linking.sendIntent('android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS')
        .catch(() => {
          // Fallback to general settings
          openAppSettings();
        });
    } else {
      openAppSettings();
    }
  }, [openAppSettings]);

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

  // Get audio-related permissions status
  const getAudioPermissionsStatus = useCallback(() => {
    const audioPermissions = filteredPermissions.filter(
      p => p.category === 'notification' || 
           p.key === 'modify_audio_settings' || 
           p.key === 'notification_policy'
    );
    
    const status = {};
    audioPermissions.forEach(perm => {
      status[perm.key] = permissions[perm.key] || { status: 'unknown' };
    });
    
    return status;
  }, [filteredPermissions, permissions]);

  // Check if all audio permissions are granted
  const areAudioPermissionsGranted = useCallback(() => {
    const audioPermissions = filteredPermissions.filter(
      p => p.category === 'notification' || 
           p.key === 'modify_audio_settings' || 
           p.key === 'notification_policy'
    );
    
    return audioPermissions.every(p => {
      const perm = permissions[p.key];
      return perm?.granted || perm?.autoGranted || !p.required;
    });
  }, [filteredPermissions, permissions]);

  // Request only audio permissions
  const requestAudioPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const audioPermissions = filteredPermissions.filter(
        p => p.category === 'notification' || 
             p.key === 'modify_audio_settings' || 
             p.key === 'notification_policy'
      );
      
      const results = {};
      
      for (const perm of audioPermissions) {
        if (!permissions[perm.key]?.granted) {
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
      
      return results;
    } catch (error) {
      setError(error.message);
      return {};
    } finally {
      setLoading(false);
    }
  }, [filteredPermissions, permissions, requestPermission]);

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
  
  // Open notification settings
  openNotificationSettings: () => {
    if (Platform.OS === 'android') {
      Linking.sendIntent('android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS')
        .catch(() => {
          Linking.openSettings().catch(() => {});
        });
    } else {
      Linking.openSettings().catch(() => {});
    }
  },
  
  // Check audio permissions status
  checkAudioPermissions: async () => {
    if (Platform.OS !== 'android') return { granted: true };
    
    try {
      const audioPermissions = {
        modify_audio_settings: false,
        notification_policy: false,
      };
      
      // Check MODIFY_AUDIO_SETTINGS
      try {
        const hasModifyAudio = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.MODIFY_AUDIO_SETTINGS
        );
        audioPermissions.modify_audio_settings = hasModifyAudio;
      } catch (error) {
        audioPermissions.modify_audio_settings = false;
      }
      
      // Check ACCESS_NOTIFICATION_POLICY
      try {
        const hasNotificationPolicy = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_NOTIFICATION_POLICY
        );
        audioPermissions.notification_policy = hasNotificationPolicy;
      } catch (error) {
        audioPermissions.notification_policy = false;
      }
      
      return {
        granted: audioPermissions.modify_audio_settings && audioPermissions.notification_policy,
        ...audioPermissions
      };
    } catch (error) {
      return { granted: false, error: error.message };
    }
  },
  
  // Request audio permissions
  requestAudioPermissions: async () => {
    if (Platform.OS !== 'android') return { granted: true };
    
    try {
      const results = {
        modify_audio_settings: false,
        notification_policy: false,
      };
      
      // Request MODIFY_AUDIO_SETTINGS
      try {
        const modifyAudioResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.MODIFY_AUDIO_SETTINGS,
          {
            title: 'Audio Settings Permission',
            message: 'Allow app to modify audio settings for maximum notification volume?',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        results.modify_audio_settings = modifyAudioResult === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        results.modify_audio_settings = false;
      }
      
      // Request ACCESS_NOTIFICATION_POLICY
      try {
        const notificationPolicyResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_NOTIFICATION_POLICY,
          {
            title: 'Do Not Disturb Access',
            message: 'Allow notifications even in Do Not Disturb mode for urgent bookings?',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        results.notification_policy = notificationPolicyResult === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        results.notification_policy = false;
      }
      
      return {
        granted: results.modify_audio_settings && results.notification_policy,
        ...results
      };
    } catch (error) {
      return { granted: false, error: error.message };
    }
  },
};

export default PermissionManager;