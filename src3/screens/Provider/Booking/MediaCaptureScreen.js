import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Image,
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
    bookingId,
    itemId,
    isMandatory,
    onMediaCaptured
  } = route.params || {};
  
  const { Toast } = useContext(AppContext);
  
  const [capturing, setCapturing] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  const handleBack = () => {
    if (capturedMedia.length > 0) {
      Alert.alert(
        'Unsaved Media',
        'You have captured media that is not saved. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack()
          },
          {
            text: 'Save & Exit',
            onPress: () => {
              saveAndExit();
            }
          }
        ]
      );
    } else {
      navigation.goBack();
    }
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
        selectionLimit: 0, // 0 means unlimited
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

      if (result.assets && result.assets.length > 0) {
        const newMedia = result.assets.map(asset => ({
          ...asset,
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));
        
        setCapturedMedia(prev => [...prev, ...newMedia]);
        setShowGallery(true);
        
        Toast.show({
          type: 'success',
          text1: 'Media Captured',
          text2: `${newMedia.length} media captured successfully.`,
        });
      }
    } catch (error) {
      console.error('Error capturing media:', error);
      Alert.alert('Error', 'Failed to capture media');
    } finally {
      setCapturing(false);
    }
  };

  const deleteCapturedMedia = (index) => {
    setCapturedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const saveAndExit = () => {
    if (capturedMedia.length === 0) {
      navigation.goBack();
      return;
    }

    if (onMediaCaptured) {
      const images = capturedMedia.filter(media => media.type?.startsWith('image'));
      const videos = capturedMedia.filter(media => media.type?.startsWith('video'));
      const type = mediaType.includes('before') ? 'before' : 'after';
      
      onMediaCaptured(images, videos, type);
    }
    
    navigation.goBack();
  };

  const continueCapturing = () => {
    setShowGallery(false);
  };

  const finishCapturing = () => {
    saveAndExit();
  };

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <StatusBar 
        backgroundColor={mediaType.includes('image') ? colors.black : colors.danger} 
        barStyle="light-content" 
      />
      
      {/* Header */}
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
          {mediaType === 'before-image' ? 'Capture Before Images' :
           mediaType === 'before-video' ? 'Record Before Videos' :
           mediaType === 'after-image' ? 'Capture After Images' : 'Record After Videos'}
        </Text>
        
        {capturedMedia.length > 0 && (
          <TouchableOpacity onPress={finishCapturing}>
            <Text style={clsx(styles.textPrimary, styles.fontBold)}>
              Done ({capturedMedia.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      {capturing ? (
        <View style={clsx(styles.flex1, styles.justifyCenter, styles.itemsCenter, styles.p6)}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary, styles.mt4)}>
            Opening Camera...
          </Text>
          <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2, styles.textCenter)}>
            Please wait while we open the camera
          </Text>
        </View>
      ) : showGallery && capturedMedia.length > 0 ? (
        <View style={clsx(styles.flex1)}>
          {/* Captured Media Gallery */}
          <View style={clsx(styles.p4)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                Captured Media ({capturedMedia.length})
              </Text>
              <TouchableOpacity onPress={continueCapturing}>
                <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                  Capture More
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={clsx(styles.flexRow, styles.flexWrap)}>
              {capturedMedia.map((media, index) => (
                <View key={media.id || index} style={clsx(styles.m2, styles.positionRelative)}>
                  {media.type?.startsWith('image') ? (
                    <Image
                      source={{ uri: media.uri }}
                      style={{ width: 100, height: 100, borderRadius: 8 }}
                    />
                  ) : (
                    <View style={{
                      width: 100,
                      height: 100,
                      borderRadius: 8,
                      backgroundColor: colors.gray800,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon name="play-circle-filled" size={40} color={colors.white} />
                    </View>
                  )}
                  <TouchableOpacity
                    style={clsx(
                      styles.absolute,
                      styles.topNegative1,
                      styles.rightNegative1,
                      styles.bgError,
                      styles.roundedFull,
                      styles.p1
                    )}
                    onPress={() => deleteCapturedMedia(index)}
                  >
                    <Icon name="close" size={14} color={colors.white} />
                  </TouchableOpacity>
                  <View style={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}>
                    <Text style={clsx(styles.textXs, styles.textWhite)}>
                      #{index + 1}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
          
          {/* Action Buttons */}
          <View style={clsx(styles.p4, styles.bgWhite, styles.borderTop, styles.borderLight)}>
            <TouchableOpacity
              style={clsx(
                styles.bgPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.mb3
              )}
              onPress={finishCapturing}
            >
              <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                Save {capturedMedia.length} Media
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={clsx(
                styles.border,
                styles.borderPrimary,
                styles.bgWhite,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter
              )}
              onPress={continueCapturing}
            >
              <Text style={clsx(styles.textPrimary, styles.fontBold, styles.textLg)}>
                Capture More
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={clsx(styles.flex1, styles.justifyCenter, styles.itemsCenter, styles.p6)}>
          <View style={clsx(styles.mb8, styles.itemsCenter)}>
            <Icon 
              name={mediaType.includes('image') ? 'camera-alt' : 'videocam'} 
              size={64} 
              color={colors.primary} 
              style={clsx(styles.mb4)}
            />
            <Text style={clsx(styles.textXl, styles.fontBold, styles.textPrimary, styles.mb2)}>
              Ready to Capture
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter)}>
              {mediaType.includes('image') 
                ? 'Tap the camera button to capture photos'
                : 'Tap the video button to record videos'}
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
            onPress={captureMedia}
            activeOpacity={0.8}
          >
            <Icon 
              name={mediaType.includes('image') ? 'camera' : 'videocam'} 
              size={32} 
              color={colors.white} 
            />
          </TouchableOpacity>
          
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary, styles.mb2)}>
            Tap to {mediaType.includes('image') ? 'Take Photos' : 'Record Videos'}
          </Text>
          
          <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter, styles.mb6)}>
            {mediaType.includes('image') 
              ? 'You can capture multiple photos in one session'
              : 'You can record multiple videos in one session'}
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
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Footer Tips */}
      {!capturing && !showGallery && (
        <View style={clsx(styles.p4, styles.bgGray50)}>
          <Text style={clsx(styles.fontBold, styles.textPrimary, styles.mb2, styles.textCenter)}>
            Quick Tips:
          </Text>
          <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
            {mediaType.includes('image') 
              ? '• Capture multiple angles • Ensure good lighting • Keep camera steady'
              : '• Record important moments • Hold phone horizontally • Speak clearly if needed'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default MediaCaptureScreen;