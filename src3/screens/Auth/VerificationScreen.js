import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Header from '../../components/Common/Header';

const VerificationScreen = ({ navigation, route }) => {
  const { phone, email, verificationType = 'phone' } = route.params || {};
  
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState(verificationType);
  const [attempts, setAttempts] = useState(0);
  
  const inputRefs = useRef([]);

  // Verification Methods
  const verificationMethods = [
    { id: 'phone', label: 'SMS', icon: 'sms', description: 'Code sent to your phone' },
    { id: 'email', label: 'Email', icon: 'email', description: 'Code sent to your email' },
    { id: 'call', label: 'Call', icon: 'call', description: 'We will call you with code' },
  ];

  useEffect(() => {
    // Start timer on component mount
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCodeChange = (text, index) => {
    if (text.length > 1) {
      // Handle paste
      const pastedCode = text.split('');
      const newCode = [...verificationCode];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setVerificationCode(newCode);
      
      // Focus last input
      const lastIndex = Math.min(index + pastedCode.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
    } else {
      const newCode = [...verificationCode];
      newCode[index] = text;
      setVerificationCode(newCode);

      // Auto focus next input
      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    if (attempts >= 3) {
      Alert.alert(
        'Maximum Attempts Reached',
        'You have reached the maximum number of resend attempts. Please try again later or contact support.',
        [{ text: 'OK' }]
      );
      return;
    }

    setTimer(60);
    setIsResendDisabled(true);
    setAttempts(prev => prev + 1);
    
    // Simulate sending code
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Code Sent', `Verification code has been sent via ${verificationMethod}`);
      
      // Start timer again
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1500);
  };

  const handleVerify = () => {
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      Alert.alert('Incomplete Code', 'Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    
    // Simulate verification API call
    setTimeout(() => {
      setLoading(false);
      
      // For demo, any code with all 6 digits works
      if (code.length === 6) {
        Alert.alert(
          'Verification Successful',
          'Your account has been verified successfully!',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate based on verification type
                if (route.params?.fromSignup) {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'ProviderLogin' }],
                  });
                } else {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'ProviderTabs' }],
                  });
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Invalid Code', 'The verification code you entered is incorrect. Please try again.');
      }
    }, 2000);
  };

  const handleChangeMethod = (method) => {
    setVerificationMethod(method);
    setVerificationCode(['', '', '', '', '', '']);
    handleResendCode();
  };

  const maskedPhone = phone ? `${phone.slice(0, 2)}******${phone.slice(-2)}` : '**********';
  const maskedEmail = email ? email.replace(/(.{2})(.*)(?=@)/, (match, p1, p2) => 
    p1 + '*'.repeat(p2.length)) : '****@***.com';

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Verify Account"
        showBack
        onBackPress={() => navigation.goBack()}
        type="white"
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.px4, styles.pb6)}
      >
        {/* Verification Header */}
        <View style={clsx(styles.itemsCenter, styles.mt8, styles.mb6)}>
          <View style={clsx(
            styles.bgPrimaryLight,
            styles.roundedFull,
            styles.p4,
            styles.mb4
          )}>
            <Icon name="verified-user" size={48} color={colors.primary} />
          </View>
          
          <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack, styles.mb2)}>
            Verify Your Account
          </Text>
          
          <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter)}>
            {verificationMethod === 'phone' 
              ? `Enter the 6-digit code sent to ${maskedPhone}`
              : verificationMethod === 'email'
              ? `Enter the 6-digit code sent to ${maskedEmail}`
              : 'We will call you with the verification code'}
          </Text>
        </View>

        {/* Verification Methods */}
        <View style={clsx(styles.mb6)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
            Verification Method
          </Text>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween)}>
            {verificationMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={clsx(
                  styles.itemsCenter,
                  styles.flex1
                )}
                onPress={() => handleChangeMethod(method.id)}
              >
                <View style={clsx(
                  styles.roundedFull,
                  styles.p3,
                  styles.mb2,
                  verificationMethod === method.id ? 
                  styles.bgPrimary : 
                  styles.bgGray
                )}>
                  <Icon 
                    name={method.icon} 
                    size={24} 
                    color={verificationMethod === method.id ? colors.white : colors.text} 
                  />
                </View>
                <Text style={clsx(
                  styles.textSm,
                  styles.fontMedium,
                  verificationMethod === method.id ? styles.textPrimary : styles.textMuted
                )}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Code Input */}
        <View style={clsx(styles.mb6)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
            Enter Verification Code
          </Text>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween)}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={clsx(
                  styles.w12,
                  styles.h12,
                  styles.border,
                  styles.borderGray,
                  styles.roundedLg,
                  styles.textCenter,
                  styles.text2xl,
                  styles.fontBold,
                  verificationCode[index] && styles.borderPrimary,
                  verificationCode[index] && styles.bgPrimaryLight
                )}
                value={verificationCode[index]}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={index === 0 ? 6 : 1}
                selectTextOnFocus
              />
            ))}
          </View>
        </View>

        {/* Timer and Resend */}
        <View style={clsx(styles.itemsCenter, styles.mb6)}>
          {isResendDisabled ? (
            <Text style={clsx(styles.textBase, styles.textMuted)}>
              Resend code in {timer} seconds
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={loading}
            >
              <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                Resend Verification Code
              </Text>
            </TouchableOpacity>
          )}
          
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
            {attempts > 0 && `Resend attempts: ${attempts}/3`}
          </Text>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={clsx(
            styles.bgPrimary,
            styles.roundedLg,
            styles.p4,
            styles.itemsCenter,
            styles.justifyCenter,
            styles.mb6,
            loading && styles.opacity50
          )}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
              Verify Account
            </Text>
          )}
        </TouchableOpacity>

        {/* Troubleshooting */}
        <View style={clsx(styles.bgGray, styles.roundedLg, styles.p4)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
            Having trouble?
          </Text>
          
          <TouchableOpacity
            style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}
            onPress={() => navigation.navigate('ContactSupport')}
          >
            <Icon name="headset-mic" size={20} color={colors.primary} style={clsx(styles.mr3)} />
            <View style={clsx(styles.flex1)}>
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                Contact Support
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                Get help from our support team
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={clsx(styles.flexRow, styles.itemsCenter)}
            onPress={() => navigation.navigate('ChangePhone')}
          >
            <Icon name="phone" size={20} color={colors.primary} style={clsx(styles.mr3)} />
            <View style={clsx(styles.flex1)}>
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                Change Phone Number
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                Update your registered phone number
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Security Note */}
        <View style={clsx(styles.mt6, styles.itemsCenter)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <Icon name="security" size={16} color={colors.success} />
            <Text style={clsx(styles.textSm, styles.textSuccess, styles.fontMedium, styles.ml1)}>
              Secure Verification
            </Text>
          </View>
          <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1, styles.textCenter)}>
            Your information is protected with end-to-end encryption
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default VerificationScreen;