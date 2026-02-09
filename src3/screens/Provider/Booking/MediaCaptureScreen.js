import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  ActivityIndicator,
  Platform,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchCamera } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';

const MediaCaptureScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    mediaType = 'image',
    onMediaCaptured,
    minMediaCount = 1,
    maxMediaCount = 5,
  } = route.params || {};
  
  const { Toast } = useContext(AppContext);
  
  const [capturing, setCapturing] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState([]);
  const [status, setStatus] = useState('initializing');
  const cameraLaunched = useRef(false);
  const isSaving = useRef(false);

  useEffect(() => {
    // IMMEDIATELY launch camera on mount
    launchCameraNow();
    
    // Handle hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleGoBack();
      return true; // Prevent default back action
    });
    
    return () => {
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    // Check if we have enough media
    if (capturedMedia.length >= minMediaCount && !isSaving.current) {
      saveAndExit();
    }
  }, [capturedMedia.length]);

  const launchCameraNow = async () => {
    if (cameraLaunched.current) return;
    
    cameraLaunched.current = true;
    setCapturing(true);
    setStatus('opening_camera');
    
    try {
      const options = {
        mediaType: mediaType.includes('image') ? 'photo' : 'video',
        includeBase64: false,
        quality: 0.8,
        cameraType: 'back',
        saveToPhotos: false,
        noData: true,
        maxWidth: 1024,
        maxHeight: 1024,
      };
      
      if (mediaType.includes('video')) {
        options.videoQuality = 'high';
      }

      const result = await launchCamera(options);
      
      if (result.didCancel) {
        // User cancelled camera - go back immediately
        handleGoBack();
        return;
      }
      
      if (result.errorCode) {
        Toast.show({
          type: 'error',
          text1: 'Camera Error',
          text2: result.errorMessage || 'Please try again',
        });
        handleGoBack();
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const newMedia = result.assets.map(asset => ({
          ...asset,
          id: Date.now() + Math.random().toString(36).substr(2, 9),
        }));
        
        setCapturedMedia(prev => [...prev, ...newMedia]);
        setStatus('media_captured');
        
        // IMMEDIATELY check if we need more
        if (capturedMedia.length + newMedia.length < minMediaCount) {
          // Launch camera again IMMEDIATELY
          cameraLaunched.current = false;
          launchCameraNow();
        }
      } else {
        // No assets - retry immediately
        cameraLaunched.current = false;
        launchCameraNow();
      }
    } catch (error) {
      console.error('Camera error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to access camera',
      });
      handleGoBack();
    } finally {
      setCapturing(false);
    }
  };

  const saveAndExit = () => {
    if (isSaving.current) return;
    
    isSaving.current = true;
    setStatus('saving');
    
    // Save immediately
    if (onMediaCaptured && capturedMedia.length > 0) {
      const images = capturedMedia.filter(media => media.type?.startsWith('image'));
      const videos = capturedMedia.filter(media => media.type?.startsWith('video'));
      const mediaTypeName = mediaType.includes('before') ? 'before' : 'after';
      
      onMediaCaptured(images, videos, mediaTypeName);
    }
    
    // Show toast and exit immediately
    if (capturedMedia.length > 0) {
      // Toast.show({
      //   type: 'success',
      //   text1: 'Media Saved',
      //   text2: `${capturedMedia.length} media saved`,
      //   visibilityTime: 1000,
      // });
    }
    
    // Exit immediately
    navigation.goBack();
  };

  const handleGoBack = () => {
    if (capturedMedia.length > 0) {
      // If we have captured media, save it before going back
      if (onMediaCaptured) {
        const images = capturedMedia.filter(media => media.type?.startsWith('image'));
        const videos = capturedMedia.filter(media => media.type?.startsWith('video'));
        const mediaTypeName = mediaType.includes('before') ? 'before' : 'after';
        
        onMediaCaptured(images, videos, mediaTypeName);
      }
    }
    
    // Exit immediately
    navigation.goBack();
  };

  // Get status display text
  const getStatusText = () => {
    switch(status) {
      case 'initializing': return 'Starting...';
      case 'opening_camera': return 'Opening Camera...';
      case 'media_captured': return `Captured ${capturedMedia.length}/${minMediaCount}`;
      case 'saving': return 'Saving...';
      default: return 'Processing...';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (status === 'saving') return 'check-circle';
    if (capturedMedia.length >= minMediaCount) return 'check';
    return capturing ? 'camera' : 'photo-camera';
  };

  // Get status color
  const getStatusColor = () => {
    if (status === 'saving') return colors.success;
    if (capturedMedia.length >= minMediaCount) return colors.success;
    return capturing ? colors.primary : colors.info;
  };

  return (
    <View style={clsx(styles.flex1, styles.bgBlack)}>
      

      {/* Main Content */}
      <View style={clsx(styles.flex1, styles.justifyCenter, styles.itemsCenter, styles.p4)}>
        
        {/* Status Icon */}
        <View style={clsx(
          styles.roundedFull,
          styles.p8,
          styles.mb6,
          { backgroundColor: `${getStatusColor()}20` }
        )}>
          <View style={clsx(
            styles.roundedFull,
            styles.p6,
            { backgroundColor: getStatusColor() }
          )}>
            <Icon 
              name={getStatusIcon()} 
              size={48} 
              color={colors.white} 
            />
          </View>
        </View>

        
      </View>     
    </View>
  );
};

export default MediaCaptureScreen; 