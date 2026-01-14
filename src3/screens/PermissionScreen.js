// screens/PermissionScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Alert,
  Platform,
  Linking,
  AppState,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Modal,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Get Android version
const getAndroidVersion = () => {
  return Platform.Version;
};

// Permission configuration without react-native-permissions
const getPermissionConfig = () => {
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';
  const androidVersion = getAndroidVersion();

  // Android permissions
  const androidPermissions = [
    {
      key: 'location',
      title: 'Location Access',
      description: 'We need your location to show nearby services and track your work.',
      required: true,
      icon: 'location-on',
      androidPermission: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      iosPermission: null, // iOS will use different method
    },
    {
      key: 'camera',
      title: 'Camera Access',
      description: 'Required to capture photos of your work for documentation.',
      required: true,
      icon: 'camera-alt',
      androidPermission: PermissionsAndroid.PERMISSIONS.CAMERA,
      iosPermission: 'camera',
    },
    {
      key: 'storage',
      title: 'Storage Access',
      description: 'Needed to save and upload photos, documents, and reports.',
      required: true,
      icon: 'folder',
      androidPermission: androidVersion >= 33 
        ? 'android.permission.READ_MEDIA_IMAGES' 
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      iosPermission: 'photoLibrary',
    },
    {
      key: 'phone',
      title: 'Phone Access',
      description: 'To make calls directly to customers from the app.',
      required: true,
      icon: 'phone',
      androidPermission: PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      iosPermission: null,
    },
  ];

  // iOS permissions
  const iosPermissions = [
    {
      key: 'location',
      title: 'Location Access',
      description: 'We need your location to show nearby services and track your work.',
      required: true,
      icon: 'location-on',
      iosPermission: 'location',
      androidPermission: null,
    },
    {
      key: 'camera',
      title: 'Camera Access',
      description: 'Required to capture photos of your work for documentation.',
      required: true,
      icon: 'camera-alt',
      iosPermission: 'camera',
      androidPermission: null,
    },
    {
      key: 'photos',
      title: 'Photos Access',
      description: 'Needed to upload photos from your gallery.',
      required: true,
      icon: 'photo-library',
      iosPermission: 'photoLibrary',
      androidPermission: null,
    },
    {
      key: 'notifications',
      title: 'Notifications',
      description: 'Get instant updates about new bookings and schedule changes.',
      required: true,
      icon: 'notifications',
      iosPermission: 'notification',
      androidPermission: null,
      specialNote: 'Will be requested separately',
    },
  ];

  // Add notification permission for Android 13+
  if (isAndroid && androidVersion >= 33) {
    androidPermissions.push({
      key: 'notifications',
      title: 'Notifications',
      description: 'Get instant updates about new bookings and schedule changes.',
      required: true,
      icon: 'notifications',
      androidPermission: 'android.permission.POST_NOTIFICATIONS',
      iosPermission: null,
    });
  } else if (isAndroid) {
    androidPermissions.push({
      key: 'notifications',
      title: 'Notifications',
      description: 'Get instant updates about new bookings and schedule changes.',
      required: false,
      icon: 'notifications',
      androidPermission: null,
      iosPermission: null,
      autoGranted: true,
      specialNote: 'Automatically granted on Android 12 and below',
    });
  }

  return isAndroid ? androidPermissions : iosPermissions;
};

const PermissionScreen = ({ 
  onComplete,
  showSkipButton = false,
  mandatoryOnly = false,
  visible = true
}) => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const [error, setError] = useState(null);
  const [internalVisible, setInternalVisible] = useState(true);
  
  const initializedRef = useRef(false);
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
        console.warn(`No Android permission defined for ${permissionKey}`);
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
      console.error(`Error checking Android permission ${permissionKey}:`, err);
      return 'unavailable';
    }
  }, [androidVersion]);

  // Request Android permission
  const requestAndroidPermission = useCallback(async (permissionKey, permissionConfig) => {
    try {
      if (permissionConfig.autoGranted) {
        return 'granted';
      }

      if (!permissionConfig.androidPermission) {
        console.warn(`Cannot request Android permission for ${permissionKey}`);
        return 'unavailable';
      }

      // For Android 13+ notifications
      if (permissionKey === 'notifications' && androidVersion >= 33) {
        const granted = await PermissionsAndroid.request(
          permissionConfig.androidPermission,
          {
            title: permissionConfig.title,
            message: permissionConfig.description,
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
      }

      const granted = await PermissionsAndroid.request(
        permissionConfig.androidPermission,
        {
          title: permissionConfig.title,
          message: permissionConfig.description,
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );
      
      return granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
    } catch (err) {
      console.error(`Error requesting Android permission ${permissionKey}:`, err);
      return 'unavailable';
    }
  }, [androidVersion]);

  // For iOS - we'll use a simplified approach
  const checkIOSPermission = useCallback(async (permissionKey, permissionConfig) => {
    try {
      // iOS permissions are handled differently
      // In real app, you would use specific iOS permission APIs
      // For now, we'll return a default status
      
      // Check if permission was previously granted
      const storedStatus = await getStoredPermissionStatus(permissionKey);
      if (storedStatus) {
        return storedStatus;
      }
      
      return 'undetermined'; // Default status for iOS
    } catch (err) {
      console.error(`Error checking iOS permission ${permissionKey}:`, err);
      return 'unavailable';
    }
  }, []);

  const requestIOSPermission = useCallback(async (permissionKey, permissionConfig) => {
    try {
      // For demo purposes, we'll simulate permission request
      // In real app, you would use:
      // - Location: navigator.geolocation
      // - Camera: ImagePicker from react-native-image-picker
      // - Notifications: PushNotification from react-native-push-notification
      // - Photos: ImagePicker from react-native-image-picker
      
      // Simulate permission grant for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store the permission status
      await storePermissionStatus(permissionKey, 'granted');
      return 'granted';
    } catch (err) {
      console.error(`Error requesting iOS permission ${permissionKey}:`, err);
      return 'unavailable';
    }
  }, []);

  // Mock storage functions (in real app, use AsyncStorage)
  const getStoredPermissionStatus = async (permissionKey) => {
    try {
      // In real app: return await AsyncStorage.getItem(`permission_${permissionKey}`);
      const stored = localStorage.getItem(`permission_${permissionKey}`);
      return stored;
    } catch {
      return null;
    }
  };

  const storePermissionStatus = async (permissionKey, status) => {
    try {
      // In real app: await AsyncStorage.setItem(`permission_${permissionKey}`, status);
      localStorage.setItem(`permission_${permissionKey}`, status);
    } catch (error) {
      console.error('Error storing permission status:', error);
    }
  };

  // Universal check permission
  const checkPermission = useCallback(async (permissionKey, permissionConfig) => {
    if (isAndroid) {
      return await checkAndroidPermission(permissionKey, permissionConfig);
    } else {
      return await checkIOSPermission(permissionKey, permissionConfig);
    }
  }, [isAndroid, checkAndroidPermission, checkIOSPermission]);

  // Universal request permission
  const requestPermission = useCallback(async (permissionKey, permissionConfig) => {
    if (isAndroid) {
      return await requestAndroidPermission(permissionKey, permissionConfig);
    } else {
      return await requestIOSPermission(permissionKey, permissionConfig);
    }
  }, [isAndroid, requestAndroidPermission, requestIOSPermission]);

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
      return permissionResults;
    } catch (error) {
      console.error('Error checking permissions:', error);
      setError(error.message);
      return {};
    }
  }, [filteredPermissions, checkPermission]);

  // Request single permission
  const handleRequestPermission = useCallback(async (permissionKey) => {
    try {
      const permission = permissions[permissionKey];
      if (!permission) {
        console.warn(`Cannot request permission for ${permissionKey}`);
        return 'unavailable';
      }

      const isAutoGranted = permission.autoGranted === true;
      let status;
      
      if (isAutoGranted) {
        status = 'granted';
      } else {
        status = await requestPermission(permissionKey, permission);
      }
      
      setPermissions(prev => ({
        ...prev,
        [permissionKey]: {
          ...permission,
          status: status,
          granted: status === 'granted',
          autoGranted: isAutoGranted,
        }
      }));

      // Check if all required permissions are now granted
      if (status === 'granted') {
        const allRequiredGranted = filteredPermissions
          .filter(p => p.required)
          .every(p => {
            if (p.key === permissionKey) return true;
            const perm = permissions[p.key];
            return perm?.granted || perm?.autoGranted;
          });
        
        if (allRequiredGranted && onComplete) {
          setTimeout(() => {
            setInternalVisible(false);
            onComplete();
          }, 1000);
        }
      }

      return status;
    } catch (error) {
      console.error('Error requesting permission:', error);
      setError(error.message);
      return 'denied';
    }
  }, [permissions, filteredPermissions, onComplete, requestPermission]);

  // Request all permissions
  const requestAllPermissions = useCallback(async () => {
    try {
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
      
      // Check if all required permissions are granted
      const allRequiredGranted = filteredPermissions
        .filter(p => p.required)
        .every(p => {
          const perm = permissions[p.key];
          return results[p.key] === 'granted' || perm?.granted || perm?.autoGranted;
        });
      
      if (allRequiredGranted && onComplete) {
        setTimeout(() => {
          setInternalVisible(false);
          onComplete();
        }, 1000);
      }
      
      return results;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setError(error.message);
      return {};
    } finally {
      setLoading(false);
    }
  }, [filteredPermissions, permissions, onComplete, requestPermission]);

  // Open app settings
  const openAppSettings = useCallback(() => {
    Linking.openSettings().catch(() => {
      Alert.alert(
        'Cannot Open Settings',
        'Please go to your device settings manually to update permissions.',
        [{ text: 'OK' }]
      );
    });
  }, []);

  // Get status icon and color
  const getStatusInfo = useCallback((status, autoGranted = false) => {
    if (autoGranted) {
      return { icon: 'check-circle', color: '#4CAF50', text: 'Auto-Granted' };
    }
    
    switch (status) {
      case 'granted':
        return { icon: 'check-circle', color: '#4CAF50', text: 'Granted' };
      case 'denied':
        return { icon: 'cancel', color: '#F44336', text: 'Denied' };
      case 'blocked':
        return { icon: 'block', color: '#FF9800', text: 'Blocked' };
      case 'unavailable':
        return { icon: 'error', color: '#9E9E9E', text: 'Unavailable' };
      case 'undetermined':
        return { icon: 'help', color: '#2196F3', text: 'Not Asked' };
      default:
        return { icon: 'help', color: '#9E9E9E', text: 'Unknown' };
    }
  }, []);

  // Check if all required permissions are granted
  const areAllRequiredPermissionsGranted = useCallback(() => {
    return filteredPermissions
      .filter(p => p.required)
      .every(p => {
        const perm = permissions[p.key];
        return perm?.granted || perm?.autoGranted;
      });
  }, [filteredPermissions, permissions]);

  // Initialize permissions on mount
  useEffect(() => {
    if (initializedRef.current) return;
    
    const initialize = async () => {
      try {
        initializedRef.current = true;
        await checkAllPermissions();
        setLoading(false);
        
        if (!areAllRequiredPermissionsGranted()) {
          setTimeout(() => {
            requestAllPermissions();
          }, 500);
        } else if (onComplete) {
          setTimeout(() => {
            setInternalVisible(false);
            onComplete();
          }, 500);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initialize();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        checkAllPermissions();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription?.remove();
      initializedRef.current = false;
    };
  }, [checkAllPermissions, areAllRequiredPermissionsGranted, requestAllPermissions, onComplete, appState]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setInternalVisible(false);
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  // Render permission item
  const renderPermissionItem = (permission) => {
    if (!permission) return null;
    
    const { icon, color, text } = getStatusInfo(permission.status, permission.autoGranted);
    
    return (
      <View key={permission.key} style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <Icon name={permission.icon} size={24} color="#2196F3" style={styles.permissionIcon} />
          <View style={styles.permissionTitleContainer}>
            <Text style={styles.permissionTitle}>{permission.title}</Text>
            {permission.required && !permission.autoGranted && (
              <Text style={styles.requiredBadge}>Required</Text>
            )}
            {permission.autoGranted && (
              <Text style={styles.autoGrantedBadge}>Auto</Text>
            )}
          </View>
          <View style={styles.statusContainer}>
            <Icon name={icon} size={20} color={color} />
            <Text style={[styles.statusText, { color }]}>{text}</Text>
          </View>
        </View>
        
        <Text style={styles.permissionDescription}>{permission.description}</Text>
        
        {permission.specialNote && (
          <Text style={styles.specialNote}>{permission.specialNote}</Text>
        )}
        
        {!permission.granted && !permission.autoGranted && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                permission.status === 'blocked' ? styles.settingsButton : styles.grantButton
              ]}
              onPress={() => {
                if (permission.status === 'blocked') {
                  openAppSettings();
                } else {
                  handleRequestPermission(permission.key);
                }
              }}
            >
              <Text style={styles.actionButtonText}>
                {permission.status === 'blocked' ? 'Open Settings' : 'Grant Permission'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Determine if modal should be visible
  const shouldShowModal = visible && internalVisible;

  // Render error state
  if (error && shouldShowModal) {
    return (
      <Modal 
        visible={true} 
        transparent 
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={50} color="#F44336" />
            <Text style={styles.errorTitle}>Permission Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setLoading(true);
                initializedRef.current = false;
                checkAllPermissions().finally(() => setLoading(false));
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipErrorButton}
              onPress={handleModalClose}
            >
              <Text style={styles.skipErrorButtonText}>Skip Permissions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Render loading state
  if (loading && shouldShowModal) {
    return (
      <Modal 
        visible={true} 
        transparent 
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Checking permissions...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  const allGranted = areAllRequiredPermissionsGranted();

  // Don't render modal if not visible
  if (!shouldShowModal) {
    return null;
  }

  return (
    <Modal 
      visible={true} 
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon name="verified-user" size={40} color="#2196F3" />
          <Text style={styles.headerTitle}>Permissions Required</Text>
          <Text style={styles.headerSubtitle}>
            {allGranted 
              ? 'All permissions granted! You can start using the app.'
              : 'Please grant the following permissions to use all features'
            }
          </Text>
          {isAndroid && (
            <Text style={styles.androidVersion}>
              Android Version: {androidVersion}
            </Text>
          )}
        </View>
        
        <ScrollView style={styles.scrollContainer}>
          {filteredPermissions.map(perm => 
            permissions[perm.key] ? renderPermissionItem(permissions[perm.key]) : null
          )}
        </ScrollView>
        
        <View style={styles.footer}>
          {allGranted ? (
            <TouchableOpacity
              style={styles.successButton}
              onPress={handleModalClose}
            >
              <Icon name="check" size={20} color="#FFF" />
              <Text style={styles.successButtonText}>Continue to App</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={requestAllPermissions}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Icon name="lock-open" size={20} color="#FFF" />
                    <Text style={styles.primaryButtonText}>Grant All Permissions</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.settingsButtonContainer}
                onPress={openAppSettings}
              >
                <Icon name="settings" size={18} color="#2196F3" />
                <Text style={styles.settingsButtonText}>Open App Settings</Text>
              </TouchableOpacity>
              
              {showSkipButton && (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleModalClose}
                >
                  <Text style={styles.skipButtonText}>Skip for Now</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Use the same styles as before
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 25,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 20,
  },
  androidVersion: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 8,
    fontStyle: 'italic',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  permissionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  permissionIcon: {
    marginRight: 12,
  },
  permissionTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  requiredBadge: {
    fontSize: 12,
    color: '#DC3545',
    fontWeight: '500',
    marginLeft: 8,
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  autoGrantedBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 8,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  specialNote: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 6,
    fontStyle: 'italic',
  },
  actionButtons: {
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  grantButton: {
    backgroundColor: '#2196F3',
  },
  settingsButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    backgroundColor: '#FFF',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  settingsButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 10,
    marginBottom: 12,
  },
  settingsButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#6C757D',
    fontSize: 14,
  },
  successButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  successButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  errorContainer: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 15,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16, 
  },
  skipErrorButton: {
    paddingVertical: 10,
  },
  skipErrorButtonText: {
    color: '#666',
    fontSize: 14,
  },
});

export default PermissionScreen;