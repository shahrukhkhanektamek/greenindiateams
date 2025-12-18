import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchCamera } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';

const SelfieCaptureScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    bookingData,
    setSelectedSelfie 
  } = route.params || {};
  
  const { Toast } = useContext(AppContext);
  
  const [takingSelfie, setTakingSelfie] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTakeSelfie = async () => {
    try {
      setTakingSelfie(true);
      setPermissionError(false);
      
      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.85,
        includeBase64: false,
        saveToPhotos: true,
        maxWidth: 1080,
        maxHeight: 1080,
      });
      
      if (result.didCancel) {
        setTakingSelfie(false);
        return;
      }
      
      if (result.errorCode) {
        if (result.errorCode === 'permission') {
          setPermissionError(true);
        }
        Alert.alert('Camera Error', result.errorMessage || 'Failed to access camera');
        setTakingSelfie(false);
        return;
      }
      
      if (result.assets && result.assets[0]) {
        const selfie = result.assets[0];
        
        // Update parent component state
        if (setSelectedSelfie) {
          setSelectedSelfie(selfie);
        }
        
        Toast.show({
          type: 'success',
          text1: 'Selfie Captured',
          text2: 'Selfie saved successfully',
        });
        
        // Navigate back to OTP screen
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error taking selfie:', error);
      Alert.alert('Error', 'Failed to take selfie. Please check camera permissions.');
      setPermissionError(true);
    } finally {
      setTakingSelfie(false);
    }
  };

  return (
    <SafeAreaView style={clsx(styles.flex1, styles.bgSurface)}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header */}
      <View style={[clsx(styles.bgPrimary, styles.px4, styles.py3, styles.shadowSm)]}>
        <View style={clsx(styles.flexRow, styles.itemsCenter)}>
          <TouchableOpacity 
            onPress={handleBack}
            style={clsx(styles.mr3)}
            disabled={takingSelfie}
          >
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={clsx(styles.flex1)}>
            <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold)}>
              Take Selfie
            </Text>
            <Text style={clsx(styles.textWhite, styles.textSm, styles.opacity75)}>
              Required for service verification
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={clsx(styles.flex1)}
        contentContainerStyle={clsx(styles.p4)}
        showsVerticalScrollIndicator={false}
      >
        {/* Importance Card */}
        <View style={clsx(
          styles.bgInfoLight,
          styles.roundedLg,
          styles.p4,
          styles.mb6,
          styles.border,
          styles.borderInfo,
          styles.shadowSm
        )}>
          <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb2)}>
            <Icon name="info" size={24} color={colors.info} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Why Selfie is Required?
            </Text>
          </View>
          <Text style={clsx(styles.textBase, styles.textBlack)}>
            Selfie verification ensures that the service is being started by the authorized technician at the customer's location.
          </Text>
        </View>

        {/* Camera Preview/Instructions */}
        <View style={clsx(
          styles.bgWhite,
          styles.roundedLg,
          styles.p6,
          styles.itemsCenter,
          styles.justifyCenter,
          styles.mb6,
          styles.shadowSm,
          styles.border,
          styles.borderLight
        )}>
          <View style={[clsx(styles.roundedFull, styles.p6, styles.mb4), 
            { backgroundColor: takingSelfie ? colors.gray300 : colors.primary }
          ]}>
            {takingSelfie ? (
              <ActivityIndicator size={64} color={colors.white} />
            ) : (
              <Icon name="camera-alt" size={64} color={colors.white} />
            )}
          </View>
          
          <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack, styles.mb2)}>
            {takingSelfie ? 'Opening Camera...' : 'Ready to Take Selfie'}
          </Text>
          
          <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter, styles.mb4)}>
            Tap the button below to open camera and take a clear selfie
          </Text>
          
          {/* Camera Button */}
          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.px6,
              styles.py3,
              styles.bgPrimary,
              styles.roundedFull,
              styles.shadowLg,
              takingSelfie && styles.opacity50
            )}
            onPress={handleTakeSelfie}
            disabled={takingSelfie}
          >
            <Icon name="camera" size={24} color={colors.white} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
              {takingSelfie ? 'Opening Camera...' : 'Open Camera'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guidelines */}
        <View style={clsx(styles.mb6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            📸 Selfie Guidelines
          </Text>
          
          <View style={clsx(styles.spaceY3)}>
            <View style={clsx(styles.flexRow, styles.itemsStart)}>
              <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), 
                { backgroundColor: colors.successLight }
              ]}>
                <Icon name="wb-sunny" size={20} color={colors.success} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  Good Lighting
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Ensure proper lighting for clear visibility
                </Text>
              </View>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsStart)}>
              <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), 
                { backgroundColor: colors.warningLight }
              ]}>
                <Icon name="face" size={20} color={colors.warning} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  Face Visibility
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Your face should be clearly visible in the frame
                </Text>
              </View>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsStart)}>
              <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), 
                { backgroundColor: colors.infoLight }
              ]}>
                <Icon name="location-on" size={20} color={colors.info} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  Location Proof
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Selfie serves as proof of your presence at customer's location
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Permission Error */}
        {permissionError && (
          <View style={clsx(
            styles.bgErrorLight,
            styles.roundedLg,
            styles.p4,
            styles.mb6,
            styles.border,
            styles.borderError
          )}>
            <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb2)}>
              <Icon name="error-outline" size={24} color={colors.error} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textError)}>
                Camera Permission Required
              </Text>
            </View>
            <Text style={clsx(styles.textBase, styles.textBlack)}>
              Please enable camera permission in your device settings to take selfie.
            </Text>
            <TouchableOpacity
              style={clsx(
                styles.mt3,
                styles.px4,
                styles.py2,
                styles.bgError,
                styles.roundedFull,
                styles.itemsCenter
              )}
              onPress={() => {
                // App settings open करने के लिए (optional)
                setPermissionError(false);
              }}
            >
              <Text style={clsx(styles.textWhite, styles.fontBold)}>
                Open Settings
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sample Selfie Preview */}
        <View style={clsx(
          styles.bgGray50,
          styles.roundedLg,
          styles.p4,
          styles.mb8,
          styles.border,
          styles.borderLight
        )}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
            Sample Selfie (For Reference)
          </Text>
          <View style={clsx(
            styles.bgWhite,
            styles.roundedLg,
            styles.p4,
            styles.itemsCenter,
            styles.justifyCenter,
            styles.border,
            styles.borderDashed,
            styles.borderGray
          )}>
            <Icon name="photo-camera" size={80} color={colors.gray400} />
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mt3, styles.textCenter)}>
              Clear face with neutral expression
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SelfieCaptureScreen;