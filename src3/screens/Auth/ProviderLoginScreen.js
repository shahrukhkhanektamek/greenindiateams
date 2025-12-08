import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { AppContext } from '../../../src/Context/AppContext';

const ProviderLoginScreen = ({ navigation }) => {

  const {
      userLoggedIn, 
      setUserLoggedIn,
    } = useContext(AppContext);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  

  const validateForm = () => {
    const newErrors = {};
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    setUserLoggedIn(true)
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'ProviderDashboard' }],
    // });
    return false;

    if (validateForm()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'ProviderDashboard' }],
        });
      }, 1500);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={clsx(styles.flex1, styles.bgSurface)}
    >
      <ScrollView
        contentContainerStyle={clsx(styles.flexGrow1)}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={clsx(styles.bgPrimary, styles.px4, styles.pt12, styles.pb8)}>
          <View style={clsx(styles.itemsCenter)}>
            <View style={clsx(styles.bgWhite, styles.roundedFull, styles.p3, styles.mb4)}>
              <Icon name="handyman" size={48} color={colors.primary} />
            </View>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textWhite, styles.mb2)}>
              Service Partner Login
            </Text>
            <Text style={clsx(styles.textBase, styles.textWhite, styles.opacity75)}>
              Sign in to your service partner account
            </Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={clsx(styles.bgWhite, styles.roundedT3xl, styles.mtN8, styles.flex1)}>
          <View style={clsx(styles.px4, styles.pt8, styles.pb6)}>
            <View style={clsx(styles.mb6)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb1)}>
                Welcome Back!
              </Text>
              <Text style={clsx(styles.textBase, styles.textMuted)}>
                Enter your credentials to continue
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
                styles.bgGray,
                styles.roundedLg,
                styles.px3,
                styles.py3,
                errors.phone && styles.border,
                errors.phone && styles.borderError
              )}>
                <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                  <Text style={clsx(styles.textBase, styles.textBlack)}>+91</Text>
                  <View style={clsx(styles.w2, styles.h6, styles.bgText, styles.mx2)} />
                </View>
                <TextInput
                  style={clsx(styles.flex1, styles.textBase, styles.textBlack)}
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.textMuted}
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {errors.phone && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.phone}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Password
              </Text>
              <View style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.bgGray,
                styles.roundedLg,
                styles.px3,
                styles.py3,
                errors.password && styles.border,
                errors.password && styles.borderError
              )}>
                <Icon name="lock" size={20} color={colors.textMuted} />
                <TextInput
                  style={clsx(styles.flex1, styles.textBase, styles.textBlack, styles.ml2)}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  secureTextEntry
                />
                <TouchableOpacity>
                  <Icon name="visibility" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
              <TouchableOpacity
                style={clsx(styles.flexRow, styles.itemsCenter)}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={clsx(
                  styles.w5,
                  styles.h5,
                  styles.border,
                  styles.borderPrimary,
                  styles.roundedSm,
                  styles.mr2,
                  rememberMe && styles.bgPrimary,
                  rememberMe && styles.itemsCenter,
                  rememberMe && styles.justifyCenter
                )}>
                  {rememberMe && (
                    <Icon name="check" size={14} color={colors.white} />
                  )}
                </View>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  Remember me
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => navigation.navigate('ProviderForgotPassword')}
              >
                <Text style={clsx(styles.textBase, styles.textPrimary, styles.fontMedium)}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={clsx(
                styles.bgPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                isLoading && styles.opacity50
              )}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.my6)}>
              <View style={clsx(styles.flex1, styles.hPx, styles.bgBorder)} />
              <Text style={clsx(styles.px4, styles.textBase, styles.textMuted)}>
                OR
              </Text>
              <View style={clsx(styles.flex1, styles.hPx, styles.bgBorder)} />
            </View>

            {/* OTP Login Option */}
            <TouchableOpacity
              style={clsx(
                styles.border,
                styles.borderPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.mb4
              )}
              onPress={() => navigation.navigate('ProviderOTPLogin')}
            >
              <Text style={clsx(styles.textPrimary, styles.textLg, styles.fontBold)}>
                Login with OTP
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={clsx(styles.itemsCenter, styles.mt6)}>
              <Text style={clsx(styles.textBase, styles.textMuted)}>
                Don't have an account?{' '}
                <Text
                  style={clsx(styles.textPrimary, styles.fontBold)}
                  onPress={() => navigation.navigate('ProviderSignup')}
                >
                  Sign Up
                </Text>
              </Text>
            </View>

            {/* Support Info */}
            <View style={clsx(styles.itemsCenter, styles.mt8)}>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
                Having trouble logging in?
              </Text>
              <TouchableOpacity style={clsx(styles.mt2)}>
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

export default ProviderLoginScreen;