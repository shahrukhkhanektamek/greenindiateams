import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { AppContext } from '../../Context/AppContext';
import { navigate } from '../../navigation/navigationService';

import PermissionManager, { PermissionUtils } from '../../components/PermissionManager';

const ProviderOTPLoginScreen = ({ navigation, route }) => {
  const {
    setUser,
    Toast,
    Urls,
    postData,
    storage,
    setisheaderback,
    user,
    fetchProfile,
  } = useContext(AppContext);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [errors, setErrors] = useState({});
  const [timerActive, setTimerActive] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const otpInputs = useRef([]);
  const phoneInputRef = useRef(null);

  const validatePhone = () => {
    const newErrors = {};
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'Please accept Terms & Conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 4) {
      Alert.alert('Error', 'Please enter all 4 digits of OTP');
      return false;
    }
    
    if (!/^\d{4}$/.test(otpString)) {
      Alert.alert('Error', 'OTP must contain only numbers');
      return false;
    }
    
    if (!termsAccepted) {
      Alert.alert('Error', 'Please accept Terms & Conditions');
      return false;
    }
    
    return true;
  };

  const handleSendOTP = async () => {
    if (validatePhone()) {
      setIsLoading(true);
      
      try {
        // API call to send OTP
        const response = await postData({ 
          mobile: phone 
        }, Urls.login, 'POST');
        
        console.log('Login response:', response);
        
        if (response?.success) {
          setIsOtpSent(true);
          setTimerActive(true);
          startCountdown();
          
          // Auto focus first OTP input
          if (otpInputs.current[0]) {
            otpInputs.current[0].focus();
          }
          
          Toast.show({
            type: 'success',
            text1: response.message,
            text2: `OTP has been sent to +91 ${phone}`
          });
        } else {
          // Handle API error response
          Toast.show({
            type: 'error',
            text1: 'Failed to send OTP',
            text2: response?.message || 'Please try again'
          });
        }
      } catch (error) {
        console.error('Send OTP error:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to send OTP. Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const startCountdown = () => {
    let timeLeft = 60;
    
    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        setTimerActive(false);
        setCountdown(60);
      }
    }, 1000);
  };

  const handleResendOTP = async () => {
    if (timerActive) return;
    
    if (!termsAccepted) {
      Alert.alert('Error', 'Please accept Terms & Conditions');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // API call to resend OTP
      const response = await postData({ 
        mobile: phone 
      }, Urls.login, 'POST');
      
      console.log('Resend OTP response:', response);
      
      if (response?.success) {
        setTimerActive(true);
        startCountdown();
        
        Toast.show({
          type: 'success',
          text1: 'OTP resent successfully',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to Resend OTP',
          text2: response?.message || 'Please try again'
        });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to resend OTP. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (validateOTP()) {
      setIsLoading(true);
      
      try {
        const otpString = otp.join('');
        
        // API call to verify OTP
        const response = await postData({
          mobile: phone,
          otp: otpString
        }, Urls.verifyOtp, 'POST');
        
        console.log('Verify OTP response:', response);
        
        if (response?.success) {
          // Store user data and token
          const userData = response?.user || {};
          const token = response?.token || '';
          
          if (token) {
            await storage.set('token', token);
          }
          
          if (userData) {
            await storage.set('user', userData);
            if(!userData?.profile)
             setUser(userData);
          }
          
          Toast.show({
            type: 'success',
            text1: response.message,
            text2: 'OTP verified successfully'
          });

          await fetchProfile()

          

        } else {
          Toast.show({
            type: 'error',
            text1: 'Verification Failed',
            text2: response?.message || 'Invalid OTP. Please try again.'
          });
        }
      } catch (error) {
        console.error('Verify OTP error:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to verify OTP. Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {

    let Goscreen = '';
    if(user)
    {
      if(!user.profile && !user.dob)
      {
        Goscreen = 'ProfileUpdate';
      }
      else if(!user.kyc)  
      {
        Goscreen = 'KycScreen';
      } 
      else if(user.kyc)  
      {
        if(user.kyc.status=='pending' || user.kyc.status=='rejected')
          Goscreen = 'KYCStatus';
        else if(!user?.trainingScheduleSubmit)
        {
          Goscreen = 'Training';
        }
        else if(user?.trainingScheduleSubmit)
        {
          console.log(user?.trainingScheduleSubmit)
          // "New", "Confirm", "Reject", "Complete"  
          if(
            user?.trainingScheduleSubmit.trainingScheduleStatus=='New' ||
            user?.trainingScheduleSubmit.trainingScheduleStatus=='Confirm' ||
            user?.trainingScheduleSubmit.trainingScheduleStatus=='Present' ||
            user?.trainingScheduleSubmit.trainingScheduleStatus=='Absent' || 
            user?.trainingScheduleSubmit.trainingScheduleStatus=='Fail' || 
            user?.trainingScheduleSubmit.trainingScheduleStatus=='Reject'
          )
          {
            Goscreen = 'TrainingStatus';
          }
          else{
            setisheaderback(true) 
            Goscreen = 'ProviderDashboard';
          }
        }
        else
        { 
          setisheaderback(true) 
          Goscreen = 'ProviderDashboard';
        }
      }
      else
      {
        setisheaderback(true) 
        Goscreen = 'ProviderDashboard';
      }
        navigation.reset({
          index: 0,
          routes: [{ name: Goscreen }],
        });
    }



  }, [user]);

  const handleOtpChange = (text, index) => {
    if (text.length > 1) {
      // Handle paste
      const otpArray = text.split('').slice(0, 4);
      const newOtp = [...otp];
      
      otpArray.forEach((digit, idx) => {
        if (idx < 4) {
          newOtp[idx] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus last input
      const lastIndex = Math.min(otpArray.length - 1, 4);
      if (otpInputs.current[lastIndex]) {
        otpInputs.current[lastIndex].focus();
      }
      
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text && index < 4 && otpInputs.current[index + 1]) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      otpInputs.current[index - 1].focus();
    }
  };

  const formatPhoneNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    setPhone(limited);
    
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  const clearOTP = () => {
    setOtp(['', '', '', '']);
    if (otpInputs.current[0]) {
      otpInputs.current[0].focus();
    }
  };

  const handleTermsCheck = () => {
    setTermsAccepted(!termsAccepted);
    if (errors.terms) {
      setErrors({ ...errors, terms: '' });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={clsx(styles.flex1, styles.bgSurface)}
    >
      <PermissionManager />
      <ScrollView
        contentContainerStyle={clsx(styles.flexGrow1)}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={clsx(styles.bgPrimary, styles.px4, styles.pt12, styles.pb8)}>                    
          <View style={clsx(styles.itemsStretch)}>
            <View style={clsx(styles.bgWhite, styles.roundedMd, styles.p3, styles.mb4)}>
              <Image
                source={require('../../assets/img/logo.png')}
                style={{ width: 250, height: 80, alignItems:'center', margin:'auto' }}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Login Form */}
        <View style={[clsx(styles.bgWhite, styles.roundedT3xl, styles.flex1), { marginTop: -30 }]}>
          <View style={clsx(styles.px4, styles.pt8, styles.pb6)}>
            

            {!isOtpSent ? (
              /* Phone Input Section */
              <View>
                <View style={clsx(styles.mb6, styles.mt2)}>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb1,styles.textCenter)}>
                    Enter Your Phone Number
                  </Text>
                  <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter)}>
                    We'll send a 4-digit OTP to this number
                  </Text>
                </View>

                {/* Phone Input */}
                <View style={clsx(styles.mb4)}>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                    Phone Number
                  </Text>
                  <View style={clsx(
                    styles.flexRow,
                    styles.itemsCenter,
                    styles.bgGray100,
                    styles.roundedLg,
                    styles.px3,
                    styles.py3,
                    errors.phone && styles.border,
                    errors.phone && styles.borderError
                  )}>
                    <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                        +91
                      </Text>
                      <View style={[clsx(styles.mx2), { height: 24, width: 2, backgroundColor: colors.text }]} />
                    </View>
                    <TextInput
                      ref={phoneInputRef}
                      style={clsx(styles.flex1, styles.textBase, styles.textBlack)}
                      placeholder="Enter your phone number"
                      placeholderTextColor={colors.textMuted}
                      value={phone}
                      onChangeText={formatPhoneNumber}
                      keyboardType="phone-pad"
                      maxLength={10}
                      editable={!isLoading}
                    />
                    {phone.length === 10 && (
                      <Icon name="check-circle" size={20} color={colors.success} />
                    )}
                  </View>
                  {errors.phone && (
                    <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                      {errors.phone}
                    </Text>
                  )}
                </View>

                {/* Terms and Conditions Checkbox */}
                <View style={clsx(styles.mb4)}>
                  <TouchableOpacity
                    style={clsx(
                      styles.flexRow,
                      styles.itemsCenter,
                      styles.mb2,
                      errors.terms && styles.p1,
                      errors.terms && styles.borderError,
                      errors.terms && styles.roundedSm
                    )}
                    onPress={handleTermsCheck}
                    activeOpacity={0.7}
                  >
                    <View style={clsx(
                      styles.w6,
                      styles.h6,
                      styles.border,
                      styles.borderPrimary,
                      styles.roundedSm,
                      styles.itemsCenter,
                      styles.justifyCenter,
                      styles.mr3,
                      termsAccepted && styles.bgPrimary
                    )}>
                      {termsAccepted && (
                        <Icon name="check" size={14} color={colors.white} />
                      )}
                    </View>
                    <Text style={clsx(styles.textBase, styles.textBlack, styles.flex1)}>
                      I agree to the{' '}
                      <Text 
                        style={clsx(styles.textPrimary, styles.fontMedium)} 
                        onPress={() => navigate('TermsCondition')}
                      >
                        Terms & Conditions
                      </Text>
                    </Text>
                  </TouchableOpacity>
                  
                  {errors.terms && (
                    <Text style={clsx(styles.textSm, styles.textError, styles.ml9)}>
                      {errors.terms}
                    </Text>
                  )}
                </View>

                {/* Send OTP Button */}
                <TouchableOpacity
                  style={clsx(
                    styles.bgPrimary,
                    styles.roundedLg,
                    styles.p4,
                    styles.itemsCenter,
                    styles.justifyCenter,
                    (isLoading || phone.length !== 10 || !termsAccepted) && styles.opacity50
                  )}
                  onPress={handleSendOTP}
                  disabled={isLoading || phone.length !== 10 || !termsAccepted}
                >
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    {isLoading ? (
                      <Icon name="hourglass-empty" size={20} color={colors.white} style={clsx(styles.mr2)} />
                    ) : (
                      <Icon name="send" size={20} color={colors.white} style={clsx(styles.mr2)} />
                    )}
                    <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
                      {isLoading ? 'Sending OTP...' : 'Send OTP'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              /* OTP Input Section */
              <View>
                <View style={clsx(styles.mb6)}>
                  <Icon name="lock-open" style={[styles.textCenter,styles.text12xl,styles.textPrimary]} />
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb1)}>
                    Enter OTP
                  </Text>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>
                    Enter the 4-digit OTP sent to{' '}
                    <Text style={clsx(styles.fontMedium, styles.textPrimary)}>
                      +91 {phone}
                    </Text>
                  </Text>
                </View>

                {/* OTP Input Fields */}
                <View style={clsx(styles.mb8)}>
                  <View style={clsx(styles.flexRow, styles.justifyCenter)}>
                    {otp.map((digit, index) => (
                      <View
                        key={index}
                        style={clsx(
                          styles.w12,
                          styles.h12,
                          styles.border,
                          styles.borderPrimary,
                          styles.roundedLg,
                          styles.itemsCenter,
                          styles.justifyCenter,
                          digit && styles.bgPrimaryLight,
                          styles.mx1
                        )}
                      >
                        <TextInput
                          ref={ref => otpInputs.current[index] = ref}
                          style={clsx(
                            styles.text2xl,
                            styles.fontBold,
                            styles.textWhite,
                            styles.textCenter,
                            { width: '100%', height: '100%', textAlign: 'center' }
                          )}
                          value={digit}
                          onChangeText={(text) => handleOtpChange(text, index)}
                          onKeyPress={(e) => handleOtpKeyPress(e, index)}
                          keyboardType="numeric"
                          maxLength={1}
                          selectTextOnFocus
                          editable={!isLoading}
                        />
                      </View>
                    ))}
                  </View>
                  
                  <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mt4)}>
                    <TouchableOpacity onPress={clearOTP}>
                      <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                        Clear OTP
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => {
                        setIsOtpSent(false);
                        setOtp(['', '', '', '']);
                      }}
                    >
                      <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                        Change Number
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms and Conditions Checkbox (for OTP section) */}
                <View style={clsx(styles.mb4)}>
                  <TouchableOpacity
                    style={clsx(
                      styles.flexRow,
                      styles.itemsCenter,
                      styles.mb2
                    )}
                    onPress={handleTermsCheck}
                    activeOpacity={0.7}
                  >
                    <View style={clsx(
                      styles.w6,
                      styles.h6,
                      styles.border,
                      styles.borderPrimary,
                      styles.roundedSm,
                      styles.itemsCenter,
                      styles.justifyCenter,
                      styles.mr3,
                      termsAccepted && styles.bgPrimary
                    )}>
                      {termsAccepted && (
                        <Icon name="check" size={14} color={colors.white} />
                      )}
                    </View>
                    <Text style={clsx(styles.textBase, styles.textBlack, styles.flex1)}>
                      I agree to the{' '}
                      <Text 
                        style={clsx(styles.textPrimary, styles.fontMedium)} 
                        onPress={() => navigate('TermsCondition')}
                      >
                        Terms & Conditions
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Resend OTP */}
                <View style={clsx(styles.itemsCenter, styles.mb6)}>
                  {timerActive ? (
                    <Text style={clsx(styles.textBase, styles.textMuted)}>
                      Resend OTP in {countdown} seconds
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={handleResendOTP}
                      disabled={isLoading}
                    >
                      <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                        {isLoading ? 'Resending...' : 'Resend OTP'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Verify OTP Button */}
                <TouchableOpacity
                  style={clsx(
                    styles.bgPrimary,
                    styles.roundedLg,
                    styles.p4,
                    styles.itemsCenter,
                    styles.justifyCenter,
                    (isLoading || !termsAccepted) && styles.opacity50
                  )}
                  onPress={handleVerifyOTP}
                  disabled={isLoading || !termsAccepted}
                >
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    {isLoading ? (
                      <Icon name="hourglass-empty" size={20} color={colors.white} style={clsx(styles.mr2)} />
                    ) : (
                      <Icon name="verified" size={20} color={colors.white} style={clsx(styles.mr2)} />
                    )}
                    <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
                      {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </Text>
                  </View>
                </TouchableOpacity>

              </View>
            )}

            {/* Support Info */}
            <View style={clsx(styles.itemsCenter, styles.mt8)}>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
                Not receiving OTP?
              </Text>
              <TouchableOpacity style={clsx(styles.mt2)} onPress={()=>navigate('Support')}>
                <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                  Contact Support
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProviderOTPLoginScreen;