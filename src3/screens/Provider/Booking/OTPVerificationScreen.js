import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  SafeAreaView,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchCamera } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const OTPVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    bookingData, 
    selectedSelfie: initialSelfie,
    setSelectedSelfie: setParentSelfie,
    loadBookingDetails 
  } = route.params || {};
  
  const { Toast, Urls, postData } = useContext(AppContext);
  
  // OTP States
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  
  // Selfie States
  const [selectedSelfie, setSelectedSelfie] = useState(initialSelfie || null);
  const [selfieModalVisible, setSelfieModalVisible] = useState(false);
  const [takingSelfie, setTakingSelfie] = useState(false);
  
  const otpInputRefs = useRef([]);

  useEffect(() => {
    otpInputRefs.current = otpInputRefs.current.slice(0, 4);
  }, []);

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    // Parent component को selfie update करें
    if (setParentSelfie && selectedSelfie) {
      setParentSelfie(selectedSelfie);
    }
  }, [selectedSelfie, setParentSelfie]);

  const startOtpTimer = () => {
    setOtpTimer(120);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sendOtp = async () => {
    try {
      setSendingOtp(true);
      setOtpError('');
      
      const response = await postData(
        { bookingId: bookingData?._id },
        Urls.sendOtp,
        'POST'
      );

      if (response?.success) {
        setOtpSent(true);
        startOtpTimer();
        
        // OTP भेजने के बाद OTP input पर focus करें
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 300);
        
        Toast.show({
          type: 'success',
          text1: 'OTP Sent Successfully',
          text2: 'OTP has been sent to customer\'s mobile',
        });
      } else {
        setOtpError(response?.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError('Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const resendOtp = async () => {
    if (otpTimer > 0) {
      Toast.show({
        type: 'info',
        text1: 'Please wait',
        text2: `You can resend OTP in ${formatTime(otpTimer)}`,
      });
      return;
    }
    await sendOtp();
  };

  const verifyOtpAndStartService = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 4) {
      setOtpError('Please enter 4-digit OTP');
      return;
    }

    if (!selectedSelfie) {
      setOtpError('Please take a selfie first');
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpError('');

      const formData = new FormData();
      formData.append('bookingId', bookingData?._id);
      formData.append('otp', otpString);
      
      if (selectedSelfie.uri) {
        const selfieFile = {
          uri: selectedSelfie.uri,
          type: selectedSelfie.type || 'image/jpeg',
          name: `selfie_${Date.now()}.jpg`,
        };
        formData.append('selfie', selfieFile);
      }

      const response = await postData(
        formData,
        `${Urls.verifyOtpAndStart}/${bookingData?._id}`,
        'POST',
        { isFileUpload: true }
      );

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Service Started Successfully',
          text2: 'Booking has been marked as ongoing',
        });
        
        // Reset states
        setOtp(['', '', '', '']);
        setOtpSent(false);
        setOtpTimer(0);
        setOtpError('');
        setSelectedSelfie(null);
        
        // Go back to booking detail
        navigation.goBack();
        
        // Refresh booking data
        setTimeout(() => {
          if (loadBookingDetails) {
            loadBookingDetails();
          }
        }, 500);
        
      } else {
        setOtpError(response?.message || 'Invalid OTP or failed to start service');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('Network error. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTakeSelfie = () => {
    setSelfieModalVisible(true);
  };

  const handleSelfieModalClose = () => {
    if (!takingSelfie) {
      setSelfieModalVisible(false);
    }
  };

  const captureSelfie = async () => {
    try {
      setTakingSelfie(true);
      
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
        Alert.alert('Camera Error', result.errorMessage || 'Failed to access camera');
        setTakingSelfie(false);
        return;
      }
      
      if (result.assets && result.assets[0]) {
        const selfie = result.assets[0];
        setSelectedSelfie(selfie);
        
        Toast.show({
          type: 'success',
          text1: 'Selfie Captured',
          text2: 'Selfie saved successfully',
        });
        
        // Modal close करें
        setSelfieModalVisible(false);
      }
    } catch (error) {
      console.error('Error taking selfie:', error);
      Alert.alert('Error', 'Failed to take selfie. Please check camera permissions.');
    } finally {
      setTakingSelfie(false);
    }
  };

  const handleOTPInputChange = (text, index) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (!numericText && text !== '') return;
    
    const newOtp = [...otp];
    newOtp[index] = numericText;
    setOtp(newOtp);
    setOtpError('');
    
    // Auto focus next input
    if (numericText && index < 3) {
      setTimeout(() => {
        otpInputRefs.current[index + 1]?.focus();
      }, 50);
    }
    
    // Auto focus previous on backspace
    if (!numericText && index > 0) {
      setTimeout(() => {
        otpInputRefs.current[index - 1]?.focus();
      }, 50);
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
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
            disabled={verifyingOtp}
          >
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={clsx(styles.flex1)}>
            <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold)}>
              OTP Verification
            </Text>
            <Text style={clsx(styles.textWhite, styles.textSm, styles.opacity75)}>
              Start Service with Customer Consent
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={clsx(styles.flex1)}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={clsx(styles.flex1)}
          contentContainerStyle={clsx(styles.p4)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Booking Info Card */}
          <View style={clsx(
            styles.bgWhite,
            styles.roundedLg,
            styles.p4,
            styles.mb6,
            styles.shadowSm
          )}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
              <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), 
                { backgroundColor: `${colors.primary}15` }
              ]}>
                <Icon name="verified-user" size={24} color={colors.primary} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  Ask customer for the 4-digit OTP
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  OTP will be sent to customer's mobile number
                </Text>
              </View>
            </View>
            
            {bookingData?.booking?.bookingId && (
              <View style={clsx(
                styles.mt3,
                styles.p3,
                styles.bgGray50,
                styles.roundedLg,
                styles.border,
                styles.borderLight
              )}>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Booking ID: <Text style={clsx(styles.fontMedium, styles.textBlack)}>
                    {bookingData.booking.bookingId}
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {/* Selfie Verification Section */}
          <View style={clsx(styles.mb6)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Step 1: Selfie Verification
            </Text>
            
            {selectedSelfie ? (
              <View style={clsx(
                styles.bgSuccessLight,
                styles.roundedLg,
                styles.p4,
                styles.border,
                styles.borderSuccess,
                styles.shadowSm
              )}>
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween)}>
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    <Image
                      source={{ uri: selectedSelfie.uri }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        borderWidth: 2,
                        borderColor: colors.success,
                        marginRight: 12,
                      }}
                    />
                    <View>
                      <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
                        ✅ Selfie Verified
                      </Text>
                      <Text style={clsx(styles.textSm, styles.textMuted)}>
                        Ready for OTP verification
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={handleTakeSelfie}
                    disabled={verifyingOtp}
                    style={clsx(
                      styles.flexRow,
                      styles.itemsCenter,
                      styles.px3,
                      styles.py2,
                      styles.bgWhite,
                      styles.roundedFull,
                      styles.border,
                      styles.borderSuccess,
                      styles.shadowXs
                    )}
                  >
                    <Icon name="camera-alt" size={16} color={colors.success} style={clsx(styles.mr1)} />
                    <Text style={clsx(styles.textSm, styles.fontMedium, styles.textSuccess)}>
                      Retake
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={clsx(
                  styles.bgWarningLight,
                  styles.roundedLg,
                  styles.p4,
                  styles.border,
                  styles.borderWarning,
                  styles.borderDashed,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.shadowSm
                )}
                onPress={handleTakeSelfie}
                disabled={verifyingOtp}
              >
                <Icon name="camera-alt" size={48} color={colors.warning} style={clsx(styles.mb3)} />
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textWarning, styles.mb2)}>
                  Take Selfie First
                </Text>
                <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter)}>
                  Selfie is required for service verification
                </Text>
                <TouchableOpacity
                  style={clsx(
                    styles.mt4,
                    styles.px4,
                    styles.py2,
                    styles.bgWarning,
                    styles.roundedFull,
                    styles.shadowXs
                  )}
                  onPress={handleTakeSelfie}
                  disabled={verifyingOtp}
                >
                  <Text style={clsx(styles.textWhite, styles.fontBold)}>
                    Open Camera
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          </View>

          {/* OTP Section */}
          <View style={clsx(styles.mb6)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Step 2: Enter OTP
            </Text>
            
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mb4)}>
              Enter the 4-digit OTP received on customer's mobile number
            </Text>
            
            {/* OTP Input Boxes */}
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb6)}>
              {[0, 1, 2, 3].map((index) => (
                <View key={index} style={clsx(styles.positionRelative)}>
                  <TextInput
                    ref={(ref) => {
                      if (ref && !otpInputRefs.current.includes(ref)) {
                        otpInputRefs.current[index] = ref;
                      }
                    }}
                    style={[
                      clsx(
                        styles.w16,
                        styles.h16,
                        styles.border2,
                        styles.roundedLg,
                        styles.textCenter,
                        styles.text2xl,
                        styles.fontBold,
                        styles.textBlack,
                        styles.bgWhite,
                        { borderColor: otpError ? colors.error : colors.primary }
                      ),
                      otp[index] && {
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary,
                      },
                      Platform.OS === 'ios' && {
                        lineHeight: 60,
                      }
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={otp[index]}
                    onChangeText={(text) => handleOTPInputChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    // editable={!verifyingOtp && selectedSelfie}
                    selectTextOnFocus={true}
                    caretHidden={false}
                    contextMenuHidden={true}
                    autoComplete="off"
                    autoCorrect={false}
                    spellCheck={false}
                  />
                  {index < 3 && (
                    <View style={clsx(styles.absolute, styles.rightNegative3, styles.top7)}>
                      <Icon name="remove" size={24} color={colors.gray400} />
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* OTP Error Message */}
            {otpError ? (
              <View style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.p3,
                styles.bgErrorLight,
                styles.roundedLg,
                styles.mb4,
                styles.border,
                styles.borderError
              )}>
                <Icon name="error-outline" size={20} color={colors.error} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textError)}>
                  {otpError}
                </Text>
              </View>
            ) : null}

            {/* OTP Send/Resend Button */}
            <View style={clsx(styles.mb6)}>
              {!otpSent ? (
                <TouchableOpacity
                  style={clsx(
                    styles.flexRow,
                    styles.itemsCenter,
                    styles.justifyCenter,
                    styles.p4,
                    styles.bgSecondary,
                    styles.roundedLg,
                    styles.shadowSm,
                    sendingOtp && styles.opacity50
                  )}
                  onPress={sendOtp}
                  disabled={sendingOtp || !selectedSelfie}
                >
                  {sendingOtp ? (
                    <>
                      <ActivityIndicator size="small" color={colors.white} style={clsx(styles.mr2)} />
                      <Text style={clsx(styles.textWhite, styles.fontBold)}>
                        Sending OTP...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Icon name="send" size={24} color={colors.white} style={clsx(styles.mr2)} />
                      <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                        Send OTP to Customer
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyBetween,
                  styles.p4,
                  styles.bgSuccessLight,
                  styles.roundedLg,
                  styles.border,
                  styles.borderSuccess,
                  styles.shadowSm
                )}>
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    <Icon name="check-circle" size={24} color={colors.success} style={clsx(styles.mr2)} />
                    <View>
                      <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
                        OTP Sent Successfully
                      </Text>
                      <Text style={clsx(styles.textSm, styles.textMuted)}>
                        Valid for {formatTime(otpTimer)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={resendOtp}
                    disabled={otpTimer > 0 || sendingOtp}
                    style={clsx(
                      styles.px4,
                      styles.py2,
                      styles.bgWhite,
                      styles.roundedFull,
                      styles.border,
                      otpTimer > 0 ? styles.borderGray : styles.borderPrimary,
                      styles.shadowXs
                    )}
                  >
                    <Text style={clsx(
                      styles.textSm,
                      styles.fontBold,
                      otpTimer > 0 ? styles.textMuted : styles.textPrimary
                    )}>
                      {otpTimer > 0 ? formatTime(otpTimer) : 'Resend'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Instructions Card */}
          <View style={clsx(
            styles.bgInfoLight,
            styles.roundedLg,
            styles.p4,
            styles.mb6,
            styles.border,
            styles.borderInfo
          )}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              📋 Instructions
            </Text>
            <View style={clsx(styles.spaceY2)}>
              <View style={clsx(styles.flexRow, styles.itemsStart)}>
                <Text style={clsx(styles.textSuccess, styles.fontBold, styles.mr2)}>1.</Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  Take a clear selfie with good lighting
                </Text>
              </View>
              <View style={clsx(styles.flexRow, styles.itemsStart)}>
                <Text style={clsx(styles.textSuccess, styles.fontBold, styles.mr2)}>2.</Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  Click "Send OTP to Customer" button
                </Text>
              </View>
              <View style={clsx(styles.flexRow, styles.itemsStart)}>
                <Text style={clsx(styles.textSuccess, styles.fontBold, styles.mr2)}>3.</Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  Ask customer for the 4-digit OTP on their phone
                </Text>
              </View>
              <View style={clsx(styles.flexRow, styles.itemsStart)}>
                <Text style={clsx(styles.textSuccess, styles.fontBold, styles.mr2)}>4.</Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  Enter OTP and click "Verify & Start Service"
                </Text>
              </View>
            </View>
          </View>

          {/* Start Service Button */}
          <View style={clsx(styles.mb8)}>
            <TouchableOpacity
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.p4,
                styles.roundedLg,
                styles.shadowLg,
                (verifyingOtp || !selectedSelfie || otp.join('').length !== 4) 
                  ? [styles.bgGray300, styles.opacity50] 
                  : styles.bgPrimary
              )}
              onPress={verifyOtpAndStartService}
              disabled={verifyingOtp || !selectedSelfie || otp.join('').length !== 4}
            >
              {verifyingOtp ? (
                <>
                  <ActivityIndicator size="small" color={colors.white} style={clsx(styles.mr2)} />
                  <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                    Verifying & Starting...
                  </Text>
                </>
              ) : (
                <>
                  <Icon name="play-arrow" size={28} color={colors.white} style={clsx(styles.mr2)} />
                  <Text style={clsx(styles.textWhite, styles.fontBold, styles.textXl)}>
                    Verify OTP & Start Service
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter, styles.mt3)}>
              Service will start only after successful OTP verification
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Selfie Capture Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selfieModalVisible}
        onRequestClose={handleSelfieModalClose}
      >
        <View style={clsx(styles.flex1, styles.bgBlack50)}>
          <View style={clsx(styles.flex1, styles.justifyEnd)}>
            <View style={clsx(styles.bgWhite, styles.roundedT3xl, styles.p6)}>
              {/* Modal Header */}
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
                <View>
                  <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                    Take Selfie
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Required for service verification
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={handleSelfieModalClose}
                  disabled={takingSelfie}
                  style={clsx(
                    styles.w10,
                    styles.h10,
                    styles.roundedFull,
                    styles.bgGray50,
                    styles.itemsCenter,
                    styles.justifyCenter
                  )}
                >
                  <Icon name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Instructions */}
              <View style={clsx(
                styles.mb6,
                styles.p4,
                styles.bgInfoLight,
                styles.roundedLg,
                styles.border,
                styles.borderInfo
              )}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                  ⚡ Quick Instructions:
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  • Ensure good lighting{"\n"}
                  • Face should be clearly visible{"\n"}
                  • Keep a neutral expression{"\n"}
                  • Selfie will be stored for verification
                </Text>
              </View>

              {/* Camera Button */}
              <TouchableOpacity
                style={clsx(
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.p8,
                  styles.bgPrimaryLight,
                  styles.roundedLg,
                  styles.border2,
                  styles.borderPrimary,
                  takingSelfie && styles.opacity50
                )}
                onPress={captureSelfie}
                disabled={takingSelfie}
              >
                {takingSelfie ? (
                  <>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textPrimary, styles.mt4)}>
                      Opening Camera...
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={[clsx(styles.roundedFull, styles.p6, styles.mb4), 
                      { backgroundColor: colors.primary }
                    ]}>
                      <Icon name="camera-alt" size={64} color={colors.white} />
                    </View>
                    <Text style={clsx(styles.textXl, styles.fontBold, styles.textPrimary)}>
                      Take Selfie
                    </Text>
                    <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2, styles.textCenter)}>
                      Tap to open camera and take a selfie
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Permission Note */}
              <Text style={clsx(styles.textXs, styles.textMuted, styles.textCenter, styles.mt6)}>
                📸 Camera permission is required. Make sure to allow camera access.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default OTPVerificationScreen;