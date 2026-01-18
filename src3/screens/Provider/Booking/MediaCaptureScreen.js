import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
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
    mediaType,
    setCapturedBeforeImages,
    setCapturedBeforeVideos,
    setCapturedAfterImages,
    setCapturedAfterVideos,
    checkAndShowUploadButton
  } = route.params || {};
  
  const { Toast } = useContext(AppContext);
  
  const [capturing, setCapturing] = useState(false);
  const [hasOpenedCamera, setHasOpenedCamera] = useState(false);

  useEffect(() => {
    // Automatically open camera when screen loads
    const timer = setTimeout(() => {
      if (!hasOpenedCamera) {
        openCameraAutomatically();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const openCameraAutomatically = async () => {
    if (!hasOpenedCamera) {
      setHasOpenedCamera(true);
      await captureMedia();
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const captureMedia = async () => {
    try {
      setCapturing(true);
      
      const options = {
        mediaType: mediaType.includes('image') ? 'photo' : 'video',
        includeBase64: false,
        quality: mediaType.includes('image') ? 0.8 : 0.7,
        cameraType: 'back',
        saveToPhotos: true,
        maxWidth: 1920,
        maxHeight: 1080,
      };
      
      if (mediaType.includes('video')) {
        options.videoQuality = 'high';
        options.durationLimit = 60;
      }

      const result = await launchCamera(options);
      
      if (result.didCancel) {
        // If user cancels, go back
        navigation.goBack();
        return;
      }
      
      if (result.errorCode) {
        Alert.alert('Error', `Camera error: ${result.errorMessage}`);
        setCapturing(false);
        return;
      }

      if (result.assets && result.assets[0]) {
        const media = result.assets[0];
        
        // Update appropriate state based on mediaType
        if (mediaType === 'before-image' && setCapturedBeforeImages) {
          setCapturedBeforeImages(prev => [...prev, media]);
        } else if (mediaType === 'before-video' && setCapturedBeforeVideos) {
          setCapturedBeforeVideos(prev => [...prev, media]);
        } else if (mediaType === 'after-image' && setCapturedAfterImages) {
          setCapturedAfterImages(prev => [...prev, media]);
        } else if (mediaType === 'after-video' && setCapturedAfterVideos) {
          setCapturedAfterVideos(prev => [...prev, media]);
        }
        
        // Show upload button
        if (checkAndShowUploadButton) {
          setTimeout(() => {
            checkAndShowUploadButton();
          }, 100);
        }
        
        Toast.show({
          type: 'success',
          text1: 'Media Captured',
          text2: 'Media captured successfully.',
        });
        
        // Navigate back
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error capturing media:', error);
      Alert.alert('Error', 'Failed to capture media');
    } finally {
      setCapturing(false);
    }
  };

  const handleRetry = async () => {
    await captureMedia();
  };

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <StatusBar 
        backgroundColor={mediaType.includes('image') ? colors.black : colors.danger} 
        barStyle="light-content" 
      />
      
      {/* Header - Only shown when not capturing */}
      {!capturing && (
        <View style={clsx(
          styles.flexRow, 
          styles.itemsCenter, 
          styles.justifyBetween, 
          styles.p4, 
          styles.bgWhite, 
          Platform.OS === 'ios' ? styles.pt12 : styles.pt4
        )}>
          <TouchableOpacity 
            onPress={handleBack}
            style={clsx(styles.p2)}
          >
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <Text style={clsx(styles.textXl, styles.fontBold, styles.textPrimary)}>
            {mediaType === 'before-image' ? 'Capture Before Image' :
             mediaType === 'before-video' ? 'Record Before Video' :
             mediaType === 'after-image' ? 'Capture After Image' : 'Record After Video'}
          </Text>
          
          <View style={clsx(styles.w10)} />
        </View>
      )}

      {/* Main Content */}
      <View style={clsx(styles.flex1, styles.justifyCenter, styles.itemsCenter, styles.p6)}>
        {capturing ? (
          <View style={clsx(styles.itemsCenter, styles.justifyCenter)}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary, styles.mt4)}>
              Opening Camera...
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2, styles.textCenter)}>
              Please wait while we open the camera
            </Text>
          </View>
        ) : (
          <View style={clsx(styles.itemsCenter, styles.justifyCenter)}>
            <View style={clsx(styles.mb8, styles.itemsCenter)}>
              <Icon 
                name={mediaType.includes('image') ? 'camera-alt' : 'videocam'} 
                size={64} 
                color={colors.primary} 
                style={clsx(styles.mb4)}
              />
              <Text style={clsx(styles.textXl, styles.fontBold, styles.textPrimary, styles.mb2)}>
                Camera Closed
              </Text>
              <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter)}>
                {mediaType.includes('image') 
                  ? 'The camera was closed without capturing a photo'
                  : 'The camera was closed without recording a video'}
              </Text>
            </View>

            <TouchableOpacity
              style={clsx(
                styles.bgPrimary,
                styles.roundedFull,
                styles.p6,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.mb4
              )}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <Icon 
                name={mediaType.includes('image') ? 'camera' : 'videocam'} 
                size={32} 
                color={colors.white} 
              />
            </TouchableOpacity>
            
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary, styles.mb2)}>
              Tap to {mediaType.includes('image') ? 'Take Photo' : 'Record Video'}
            </Text>
            
            <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter, styles.mb6)}>
              {mediaType.includes('image') 
                ? 'Camera will open to take a photo'
                : 'Camera will open to record video (max 60 seconds)'}
            </Text>

            <TouchableOpacity
              style={clsx(
                styles.border,
                styles.borderMuted,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.mt4
              )}
              onPress={handleBack}
            >
              <Text style={clsx(styles.textBase, styles.textMuted)}>
                Go Back Without Capturing
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Footer Tips */}
      {!capturing && (
        <View style={clsx(styles.p4, styles.bgGray50)}>
          <Text style={clsx(styles.fontBold, styles.textPrimary, styles.mb2, styles.textCenter)}>
            Quick Tips:
          </Text>
          <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
            {mediaType.includes('image') 
              ? '• Ensure good lighting • Keep camera steady • Focus on subject'
              : '• Hold phone horizontally • Record in good light • Speak clearly if needed'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default MediaCaptureScreen;