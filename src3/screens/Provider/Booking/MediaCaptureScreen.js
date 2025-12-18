import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
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
        setCapturing(false);
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

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      
      <TouchableOpacity
        style={clsx(styles.flex1, styles.bgBlack50)}
        activeOpacity={1}
        onPress={handleBack}
      >
        <View style={clsx(styles.flex1, styles.justifyEnd)}>
          <View style={clsx(styles.bgWhite, styles.roundedT3xl, styles.p6)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
              <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                {mediaType === 'before-image' ? 'Capture Before Service Image' :
                 mediaType === 'before-video' ? 'Record Before Service Video' :
                 mediaType === 'after-image' ? 'Capture After Service Image' : 'Record After Service Video'}
              </Text>
              <TouchableOpacity 
                onPress={handleBack}
                disabled={capturing}
              >
                <Icon name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={clsx(
                styles.border,
                styles.borderPrimary,
                styles.roundedLg,
                styles.p6,
                styles.itemsCenter,
                styles.justifyCenter,
                capturing && styles.opacity50
              )}
              onPress={captureMedia}
              disabled={capturing}
            >
              {capturing ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <>
                  <Icon 
                    name={mediaType.includes('image') ? 'camera-alt' : 'videocam'} 
                    size={64} 
                    color={colors.primary} 
                  />
                  <Text style={clsx(styles.textPrimary, styles.fontBold, styles.mt4, styles.textLg)}>
                    {mediaType.includes('image') ? 'Take Photo' : 'Record Video'}
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
                    {mediaType.includes('image') 
                      ? 'Camera will open to take photo' 
                      : 'Camera will open to record video (max 60 seconds)'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default MediaCaptureScreen;