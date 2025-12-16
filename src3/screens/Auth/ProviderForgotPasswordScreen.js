import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';

const ProviderForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: Enter email/phone, 2: OTP verification, 3: New password
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const otpInputs = useRef([]);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const validateEmailOrPhone = () => {
    const newErrors = {};
    
    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or phone number is required';
    } else if (emailOrPhone.includes('@')) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailOrPhone)) {
        newErrors.emailOrPhone = 'Please enter a valid email address';
      }
    } else {
      // Phone validation
      if (!/^\d{10}$/.test(emailOrPhone)) {
        newErrors.emailOrPhone = 'Phone number must be 10 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter all 6 digits of OTP');
      return false;
    }
    
    if (!/^\d{6}$/.test(otpString)) {
      Alert.alert('Error', 'OTP must contain only numbers');
      return false;
    }
    
    return true;
  };

  const validatePasswords = () => {
    const newErrors = {};
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(newPassword)) {
      newErrors.newPassword = 'Password must include uppercase, lowercase, number, and special character';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendResetLink = () => {
    if (validateEmailOrPhone()) {
      setIsLoading(true);
      
      // Simulate API call to send reset link/OTP
      setTimeout(() => {
        setIsLoading(false);
        setStep(2);
        setTimerActive(true);
        startCountdown();
        
        // Auto focus first OTP input
        if (otpInputs.current[0]) {
          otpInputs.current[0].focus();
        }
        
        Alert.alert(
          'Verification Code Sent',
          `A 6-digit verification code has been sent to ${emailOrPhone.includes('@') ? 'your email' : 'your phone'}`
        );
      }, 1000);
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

  const handleResendCode = () => {
    if (timerActive) return;
    
    setIsLoading(true);
    
    // Simulate resend code API call
    setTimeout(() => {
      setIsLoading(false);
      setTimerActive(true);
      startCountdown();
      Alert.alert('Code Resent', 'A new verification code has been sent');
    }, 1000);
  };

  const handleVerifyCode = () => {
    if (validateOTP()) {
      setIsLoading(true);
      
      // Simulate OTP verification API call
      setTimeout(() => {
        setIsLoading(false);
        setStep(3);
        if (passwordInputRef.current) {
          passwordInputRef.current.focus();
        }
      }, 1000);
    }
  };

  const handleResetPassword = () => {
    if (validatePasswords()) {
      setIsLoading(true);
      
      // Simulate password reset API call
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Success',
          'Your password has been reset successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('ProviderLogin');
              }
            }
          ]
        );
      }, 1500);
    }
  };

  const handleOtpChange = (text, index) => {
    if (text.length > 1) {
      // Handle paste
      const otpArray = text.split('').slice(0, 6);
      const newOtp = [...otp];
      
      otpArray.forEach((digit, idx) => {
        if (idx < 6) {
          newOtp[idx] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus last input
      const lastIndex = Math.min(otpArray.length - 1, 5);
      if (otpInputs.current[lastIndex]) {
        otpInputs.current[lastIndex].focus();
      }
      
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text && index < 5 && otpInputs.current[index + 1]) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      otpInputs.current[index - 1].focus();
    }
  };

  const clearOTP = () => {
    setOtp(['', '', '', '', '', '']);
    if (otpInputs.current[0]) {
      otpInputs.current[0].focus();
    }
  };

  const handleGoBack = () => {
    if (step === 1) {
      navigation.goBack();
    } else {
      setStep(step - 1);
      
      if (step === 3) {
        // Clear password fields when going back from step 3
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
      } else if (step === 2) {
        // Clear OTP when going back from step 2
        setOtp(['', '', '', '', '', '']);
      }
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: colors.error };
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character type checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score <= 2) return { score, text: 'Weak', color: colors.error };
    if (score <= 4) return { score, text: 'Medium', color: colors.warning };
    return { score, text: 'Strong', color: colors.success };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={clsx(styles.flex1, styles.bgSurface)}
    >
      <ScrollView
        contentContainerStyle={clsx(styles.flexGrow1)}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={clsx(styles.bgPrimary, styles.px4, styles.pt12, styles.pb8)}>
          <TouchableOpacity
            style={clsx(styles.positionAbsolute, styles.top4, styles.left4, styles.z10)}
            onPress={handleGoBack}
          >
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={clsx(styles.itemsCenter)}>
            <View style={clsx(styles.bgWhite, styles.roundedFull, styles.p3, styles.mb4)}>
              <Icon name="lock-reset" size={48} color={colors.primary} />
            </View>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textWhite, styles.mb2)}>
              {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify Identity' : 'Reset Password'}
            </Text>
            <Text style={clsx(styles.textBase, styles.textWhite, styles.opacity75, styles.textCenter)}>
              {step === 1 ? 'Enter your email or phone to reset password' :
               step === 2 ? 'Enter the verification code sent to you' :
               'Create a new password for your account'}
            </Text>
          </View>
        </View>

        {/* Form Container */}
        <View style={[clsx(styles.bgWhite, styles.roundedT3xl, styles.flex1), { marginTop: -30 }]}>
          <View style={clsx(styles.px4, styles.pt8, styles.pb6)}>
            {/* Progress Indicator */}
            <View style={clsx(styles.mb8)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
                {[1, 2, 3].map((stepNumber) => (
                  <View
                    key={stepNumber}
                    style={clsx(
                      styles.w8,
                      styles.h8,
                      styles.roundedFull,
                      styles.itemsCenter,
                      styles.justifyCenter,
                      stepNumber <= step ? styles.bgPrimary : styles.bgGray100,
                      stepNumber > step && styles.border,
                      stepNumber > step && styles.borderGray
                    )}
                  >
                    {stepNumber < step ? (
                      <Icon name="check" size={16} color={colors.white} />
                    ) : (
                      <Text style={clsx(
                        stepNumber <= step ? styles.textWhite : styles.textGray,
                        styles.fontBold
                      )}>
                        {stepNumber}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <Text style={clsx(styles.textSm, styles.fontMedium)}>
                  Enter Details
                </Text>
                <Text style={clsx(styles.textSm, styles.fontMedium)}>
                  Verify Code
                </Text>
                <Text style={clsx(styles.textSm, styles.fontMedium)}>
                  New Password
                </Text>
              </View>
            </View>

            {step === 1 && (
              /* Step 1: Enter Email/Phone */
              <View>
                <View style={clsx(styles.mb6)}>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb1)}>
                    Find Your Account
                  </Text>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>
                    Enter your email address or phone number associated with your account
                  </Text>
                </View>

                {/* Email/Phone Input */}
                <View style={clsx(styles.mb8)}>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                    Email or Phone Number
                  </Text>
                  <View style={clsx(
                    styles.flexRow,
                    styles.itemsCenter,
                    styles.bgGray100,
                    styles.roundedLg,
                    styles.px3,
                    styles.py3,
                    errors.emailOrPhone && styles.border,
                    errors.emailOrPhone && styles.borderError
                  )}>
                    <Icon 
                      name={emailOrPhone.includes('@') ? "email" : "phone"} 
                      size={20} 
                      color={colors.textMuted} 
                    />
                    <TextInput
                      style={clsx(styles.flex1, styles.textBase, styles.textBlack, styles.ml2)}
                      placeholder="Enter email or phone number"
                      placeholderTextColor={colors.textMuted}
                      value={emailOrPhone}
                      onChangeText={(text) => {
                        setEmailOrPhone(text);
                        if (errors.emailOrPhone) {
                          setErrors({ ...errors, emailOrPhone: '' });
                        }
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {emailOrPhone && (
                      <TouchableOpacity onPress={() => setEmailOrPhone('')}>
                        <Icon name="close" size={20} color={colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {errors.emailOrPhone && (
                    <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                      {errors.emailOrPhone}
                    </Text>
                  )}
                </View>

                {/* Send Reset Link Button */}
                <TouchableOpacity
                  style={clsx(
                    styles.bgPrimary,
                    styles.roundedLg,
                    styles.p4,
                    styles.itemsCenter,
                    styles.justifyCenter,
                    (isLoading || !emailOrPhone) && styles.opacity50
                  )}
                  onPress={handleSendResetLink}
                  disabled={isLoading || !emailOrPhone}
                >
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    {isLoading ? (
                      <Icon name="hourglass-empty" size={20} color={colors.white} style={clsx(styles.mr2)} />
                    ) : (
                      <Icon name="send" size={20} color={colors.white} style={clsx(styles.mr2)} />
                    )}
                    <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Back to Login */}
                <TouchableOpacity
                  style={clsx(styles.itemsCenter, styles.mt4)}
                  onPress={() => navigation.navigate('ProviderLogin')}
                >
                  <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                    ← Back to Login
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              /* Step 2: OTP Verification */
              <View>
                <View style={clsx(styles.mb6)}>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb1)}>
                    Enter Verification Code
                  </Text>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>
                    Enter the 6-digit code sent to{' '}
                    <Text style={clsx(styles.fontMedium, styles.textPrimary)}>
                      {emailOrPhone}
                    </Text>
                  </Text>
                </View>

                {/* OTP Input Fields */}
                <View style={clsx(styles.mb6)}>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb4)}>
                    6-digit Verification Code
                  </Text>
                  
                  <View style={clsx(styles.flexRow, styles.justifyBetween)}>
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
                            styles.textBlack,
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
                        Clear Code
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => setStep(1)}>
                      <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                        Change Email/Phone
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Resend Code */}
                <View style={clsx(styles.itemsCenter, styles.mb8)}>
                  {timerActive ? (
                    <Text style={clsx(styles.textBase, styles.textMuted)}>
                      Resend code in {countdown} seconds
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={handleResendCode}
                      disabled={isLoading}
                    >
                      <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                        {isLoading ? 'Resending...' : 'Resend Code'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  style={clsx(
                    styles.bgPrimary,
                    styles.roundedLg,
                    styles.p4,
                    styles.itemsCenter,
                    styles.justifyCenter,
                    isLoading && styles.opacity50
                  )}
                  onPress={handleVerifyCode}
                  disabled={isLoading}
                >
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    {isLoading ? (
                      <Icon name="hourglass-empty" size={20} color={colors.white} style={clsx(styles.mr2)} />
                    ) : (
                      <Icon name="verified" size={20} color={colors.white} style={clsx(styles.mr2)} />
                    )}
                    <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
                      {isLoading ? 'Verifying...' : 'Verify Code'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {step === 3 && (
              /* Step 3: New Password */
              <View>
                <View style={clsx(styles.mb6)}>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb1)}>
                    Create New Password
                  </Text>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>
                    Your new password must be different from previous passwords
                  </Text>
                </View>

                {/* New Password Input */}
                <View style={clsx(styles.mb4)}>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                    New Password
                  </Text>
                  <View style={clsx(
                    styles.flexRow,
                    styles.itemsCenter,
                    styles.bgGray100,
                    styles.roundedLg,
                    styles.px3,
                    styles.py3,
                    errors.newPassword && styles.border,
                    errors.newPassword && styles.borderError
                  )}>
                    <Icon name="lock" size={20} color={colors.textMuted} />
                    <TextInput
                      ref={passwordInputRef}
                      style={clsx(styles.flex1, styles.textBase, styles.textBlack, styles.ml2)}
                      placeholder="Enter new password"
                      placeholderTextColor={colors.textMuted}
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        if (errors.newPassword) {
                          setErrors({ ...errors, newPassword: '' });
                        }
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Icon 
                        name={showPassword ? "visibility" : "visibility-off"} 
                        size={20} 
                        color={colors.textMuted} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <View style={clsx(styles.mt2)}>
                      <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb1)}>
                        <Text style={clsx(styles.textSm, styles.textMuted)}>
                          Password strength:
                        </Text>
                        <Text style={clsx(styles.textSm, styles.fontMedium, styles.ml1, { color: passwordStrength.color })}>
                          {passwordStrength.text}
                        </Text>
                      </View>
                      
                      {/* Strength Bar */}
                      <View style={clsx(styles.flexRow, styles.h2, styles.bgGray200, styles.roundedFull, styles.overflowHidden)}>
                        <View 
                          style={[
                            { 
                              width: `${(passwordStrength.score / 6) * 100}%`,
                              backgroundColor: passwordStrength.color,
                              height: '100%',
                            }
                          ]}
                        />
                      </View>
                    </View>
                  )}
                  
                  {errors.newPassword && (
                    <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                      {errors.newPassword}
                    </Text>
                  )}
                </View>

                {/* Confirm Password Input */}
                <View style={clsx(styles.mb8)}>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                    Confirm Password
                  </Text>
                  <View style={clsx(
                    styles.flexRow,
                    styles.itemsCenter,
                    styles.bgGray100,
                    styles.roundedLg,
                    styles.px3,
                    styles.py3,
                    errors.confirmPassword && styles.border,
                    errors.confirmPassword && styles.borderError
                  )}>
                    <Icon name="lock" size={20} color={colors.textMuted} />
                    <TextInput
                      ref={confirmPasswordInputRef}
                      style={clsx(styles.flex1, styles.textBase, styles.textBlack, styles.ml2)}
                      placeholder="Confirm new password"
                      placeholderTextColor={colors.textMuted}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) {
                          setErrors({ ...errors, confirmPassword: '' });
                        }
                      }}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      onSubmitEditing={handleResetPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Icon 
                        name={showConfirmPassword ? "visibility" : "visibility-off"} 
                        size={20} 
                        color={colors.textMuted} 
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && (
                    <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>

                {/* Password Requirements */}
                <View style={clsx(styles.mb8, styles.p3, styles.bgGray50, styles.roundedLg)}>
                  <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.mb2)}>
                    Password must contain:
                  </Text>
                  <View style={clsx(styles.gap2)}>
                    {[
                      { text: 'At least 8 characters', valid: newPassword.length >= 8 },
                      { text: 'One uppercase letter', valid: /[A-Z]/.test(newPassword) },
                      { text: 'One lowercase letter', valid: /[a-z]/.test(newPassword) },
                      { text: 'One number', valid: /[0-9]/.test(newPassword) },
                      { text: 'One special character', valid: /[^A-Za-z0-9]/.test(newPassword) },
                    ].map((req, index) => (
                      <View key={index} style={clsx(styles.flexRow, styles.itemsCenter)}>
                        <Icon 
                          name={req.valid ? "check-circle" : "radio-button-unchecked"} 
                          size={16} 
                          color={req.valid ? colors.success : colors.textMuted} 
                          style={clsx(styles.mr2)}
                        />
                        <Text style={clsx(styles.textSm, req.valid ? styles.textSuccess : styles.textMuted)}>
                          {req.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity
                  style={clsx(
                    styles.bgPrimary,
                    styles.roundedLg,
                    styles.p4,
                    styles.itemsCenter,
                    styles.justifyCenter,
                    isLoading && styles.opacity50
                  )}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    {isLoading ? (
                      <Icon name="hourglass-empty" size={20} color={colors.white} style={clsx(styles.mr2)} />
                    ) : (
                      <Icon name="lock-reset" size={20} color={colors.white} style={clsx(styles.mr2)} />
                    )}
                    <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
                      {isLoading ? 'Resetting...' : 'Reset Password'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Support Info */}
            <View style={clsx(styles.itemsCenter, styles.mt8)}>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
                Need help? Our support team is here for you
              </Text>
              <TouchableOpacity style={clsx(styles.mt2)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                  <Icon name="help" size={16} color={colors.primary} style={clsx(styles.mr1)} />
                  <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                    Contact Support
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProviderForgotPasswordScreen;