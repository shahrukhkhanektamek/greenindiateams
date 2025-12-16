import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

import { navigate, reset } from '../../../navigation/navigationService';

const ProfileUpdateScreen = ({ route }) => {
  const {
    Toast,
    Urls,
    postData,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileDataLoaded, setProfileDataLoaded] = useState(false);

  // Initial profile data
  const initialProfileData = {
    name: '',
    email: '',
    dob: '',
    experienceLevel: '',
    companyName: '',
    yearOfExperience: '',
    permanentAddress: '',
    currentAddress: '',
    referenceName1: '',
    referenceMobile1: '',
    referenceName2: '',
    referenceMobile2: '',
    userId: '',
    categoryIds: [],
  };

  const [formData, setFormData] = useState(initialProfileData);
  const [errors, setErrors] = useState({});

  // Service categories
  const serviceCategories = [
    { id: '691c1abfe53e3e7330a908fa', name: 'AC Repair' },
    { id: '691c1abfe53e3e7330a908fb', name: 'Plumbing' },
    { id: '691c1abfe53e3e7330a908fc', name: 'Electrical' },
    { id: '691c1abfe53e3e7330a908fd', name: 'Cleaning' },
    { id: '691c1abfe53e3e7330a908fe', name: 'Painting' },
    { id: '691c1abfe53e3e7330a908ff', name: 'Carpentry' },
  ];

  // Experience levels
  const experienceLevels = [
    'Fresher',
    'Experience',
    'Expert',
  ];

  // Years of experience
  const yearsOfExperience = ['0', '1', '2', '3', '4', '5', '6+'];

  // Fetch profile data on component mount
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await postData({}, Urls.profileDetail, 'GET', { showErrorMessage: false });
      if (response?.success) {
        // Transform API response to match formData structure
        const apiData = response.data || {};
        
        // Parse date of birth if it exists
        let dob = '';
        if (apiData.dob) {
          dob = new Date(apiData.dob);
        }
        
        // Handle categoryIds - ensure it's an array
        let categoryIds = [];
        if (apiData.categoryIds) {
          categoryIds = Array.isArray(apiData.categoryIds) ? apiData.categoryIds : [];
        } else if (apiData.category_id) {
          categoryIds = [apiData.category_id];
        }
        
        // Handle yearOfExperience - convert number to string
        let yearOfExperience = '';
        if (apiData.yearOfExperience !== undefined && apiData.yearOfExperience !== null) {
          const yearNum = parseInt(apiData.yearOfExperience);
          yearOfExperience = yearNum >= 6 ? '6+' : yearNum.toString();
        }
        
        setFormData({
          name: apiData.name || '',
          email: apiData.email || '',
          dob: dob || '',
          experienceLevel: apiData.experienceLevel || '',
          companyName: apiData.companyName || '',
          yearOfExperience: yearOfExperience,
          permanentAddress: apiData.permanentAddress || '',
          currentAddress: apiData.currentAddress || '',
          referenceName1: apiData.referenceName1 || '',
          referenceMobile1: apiData.referenceMobile1 || '',
          referenceName2: apiData.referenceName2 || '',
          referenceMobile2: apiData.referenceMobile2 || '',
          userId: apiData.userId || apiData._id || '',
          // mobile: apiData.mobile || apiData.phone || '',
          categoryIds: categoryIds,
        });
        
        // If profile data is also passed via route params, use it (overrides API data)
        if (route.params?.profile) {
          setFormData(prev => ({ ...prev, ...route.params.profile }));
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // If API fails but route params exist, use them
      if (route.params?.profile) {
        setFormData(route.params.profile);
      }
    } finally {
      setLoading(false);
      setProfileDataLoaded(true);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    // if (!formData.mobile.trim()) {
    //   newErrors.mobile = 'Mobile number is required';
    // } else if (!/^\d{10}$/.test(formData.mobile)) {
    //   newErrors.mobile = 'Enter a valid 10-digit mobile number';
    // }

    if (!formData.yearOfExperience) {
      newErrors.yearOfExperience = 'Years of experience is required';
    }

    if (!formData.permanentAddress.trim()) {
      newErrors.permanentAddress = 'Permanent address is required';
    }

    if (!formData.currentAddress.trim()) {
      newErrors.currentAddress = 'Current address is required';
    }

    // Validate references
    if (formData.referenceName1 && !formData.referenceMobile1) {
      newErrors.referenceMobile1 = 'Reference mobile number is required';
    } else if (formData.referenceMobile1 && !/^\d{10}$/.test(formData.referenceMobile1)) {
      newErrors.referenceMobile1 = 'Enter a valid 10-digit mobile number';
    }

    if (formData.referenceName2 && !formData.referenceMobile2) {
      newErrors.referenceMobile2 = 'Reference mobile number is required';
    } else if (formData.referenceMobile2 && !/^\d{10}$/.test(formData.referenceMobile2)) {
      newErrors.referenceMobile2 = 'Enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dob: selectedDate });
    }
  };

  const handleCategoryToggle = (categoryId) => {
    const updatedCategories = formData.categoryIds.includes(categoryId)
      ? formData.categoryIds.filter(id => id !== categoryId)
      : [...formData.categoryIds, categoryId];

    setFormData({ ...formData, categoryIds: updatedCategories });
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API
      const profileData = {
        ...formData,
        dob: formData.dob ? formData.dob.toISOString().split('T')[0] : '', // Convert to YYYY-MM-DD
        yearOfExperience: parseInt(formData.yearOfExperience.replace('+', '')) || 0,
      };

      console.log('Updating profile with data:', profileData);

      const response = await postData(profileData, Urls.profileUpdate, 'POST', { showErrorMessage: true });
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: response.message || 'Profile updated successfully',
        });
        navigate('KycScreen')
        // navigation.goBack();
      } else {
        Alert.alert('Error', response?.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (label, field, placeholder, options = {}) => {
    const {
      keyboardType = 'default',
      multiline = false,
      editable = true,
      secureTextEntry = false,
      maxLength,
    } = options;

    return (
      <View style={clsx(styles.mb4)}>
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
          {label}
        </Text>
        <TextInput
          style={clsx(
            styles.input,
            errors[field] && styles.borderError,
            !editable && styles.bgGray,
            multiline && { minHeight: 80, textAlignVertical: 'top' }
          )}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={formData[field]}
          onChangeText={(text) => {
            setFormData({ ...formData, [field]: text });
            if (errors[field]) {
              setErrors({ ...errors, [field]: '' });
            }
          }}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={editable}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
        />
        {errors[field] && (
          <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
            {errors[field]}
          </Text>
        )}
      </View>
    );
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Select Date of Birth';
    if (typeof date === 'string') return date;
    return date.toLocaleDateString();
  };

  if (!profileDataLoaded && loading) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading profile data...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={clsx(styles.flex1, styles.bgSurface)}
    >
      <Header
        title="Update Profile"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        rightActionIcon="settings"
        showProfile={false}
        onRightActionPress={() => navigate('Settings')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.px4, styles.pb6)}
      >
        {/* Personal Information */}
        <View style={clsx(styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Personal Information
          </Text>

          {renderInputField('Full Name', 'name', 'Enter your full name')}

          {renderInputField('Email Address', 'email', 'Enter your email', {
            keyboardType: 'email-address',
          })}

          

          {/* Date of Birth */}
          <View style={clsx(styles.mb4)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
              Date of Birth
            </Text>
            <TouchableOpacity
              style={clsx(
                styles.input,
                styles.flexRow,
                styles.justifyBetween,
                styles.itemsCenter
              )}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={clsx(styles.textBase, formData.dob ? styles.textBlack : styles.textMuted)}>
                {formatDate(formData.dob)}
              </Text>
              <Icon name="calendar-today" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.dob || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Professional Information */}
        <View style={clsx(styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Professional Information
          </Text>

          {/* Service Categories */}
          <View style={clsx(styles.mb4)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
              Service Categories
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted, styles.mb3)}>
              Select all that apply
            </Text>
            <View style={clsx(styles.flexRow, styles.flexWrap)}>
              {serviceCategories.map((category) => {
                const isSelected = formData.categoryIds.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={clsx(
                      styles.px3,
                      styles.py2,
                      styles.mr2,
                      styles.mb2,
                      styles.roundedFull,
                      isSelected ? styles.bgPrimary : styles.bgGray
                    )}
                    onPress={() => handleCategoryToggle(category.id)}
                  >
                    <Text style={clsx(
                      styles.textSm,
                      styles.fontMedium,
                      isSelected ? styles.textWhite : styles.textBlack
                    )}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Experience Level */}
          <View style={clsx(styles.mb4)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
              Experience Level
            </Text>
            <View style={clsx(styles.flexRow, styles.flexWrap)}>
              {experienceLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={clsx(
                    styles.px4,
                    styles.py2,
                    styles.mr2,
                    styles.mb2,
                    styles.roundedFull,
                    formData.experienceLevel === level ?
                      styles.bgPrimary :
                      styles.bgGray
                  )}
                  onPress={() => setFormData({ ...formData, experienceLevel: level })}
                >
                  <Text style={clsx(
                    styles.textSm,
                    styles.fontMedium,
                    formData.experienceLevel === level ?
                      styles.textWhite :
                      styles.textBlack
                  )}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Years of Experience */} 
          <View style={clsx(styles.mb4)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
              Years of Experience
            </Text>
            <View style={clsx(styles.flexRow, styles.flexWrap)}>
              {yearsOfExperience.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={clsx(
                    styles.px4,
                    styles.py2,
                    styles.mr2,
                    styles.mb2,
                    styles.roundedFull,
                    formData.yearOfExperience === year ?
                      styles.bgPrimary :
                      styles.bgGray
                  )}
                  onPress={() => setFormData({ ...formData, yearOfExperience: year })}
                >
                  <Text style={clsx(
                    styles.textSm,
                    styles.fontMedium,
                    formData.yearOfExperience === year ?
                      styles.textWhite :
                      styles.textBlack
                  )}>
                    {year} {year === '6+' ? 'Years' : year === '1' ? 'Year' : 'Years'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.yearOfExperience && (
              <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                {errors.yearOfExperience}
              </Text>
            )}
          </View>

          {renderInputField('Company Name', 'companyName', 'Enter company name')}
        </View>

        {/* Address Information */}
        <View style={clsx(styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Address Information
          </Text>

          {renderInputField('Permanent Address', 'permanentAddress', 'Enter permanent address', {
            multiline: true,
          })}

          {renderInputField('Current Address', 'currentAddress', 'Enter current address', {
            multiline: true,
          })}
        </View>

        {/* References */}
        <View style={clsx(styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            References (Optional)
          </Text>

          <View style={clsx(styles.mb4)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
              Reference 1
            </Text>
            <View style={clsx(styles.flexRow, styles.mb2)}>
              <TextInput
                style={clsx(
                  styles.input,
                  styles.flex1,
                  styles.mr2
                )}
                placeholder="Reference Name"
                placeholderTextColor={colors.textMuted}
                value={formData.referenceName1}
                onChangeText={(text) => setFormData({ ...formData, referenceName1: text })}
              />
              <TextInput
                style={clsx(
                  styles.input,
                  styles.flex1,
                  errors.referenceMobile1 && styles.borderError
                )}
                placeholder="Mobile Number"
                placeholderTextColor={colors.textMuted}
                value={formData.referenceMobile1}
                onChangeText={(text) => {
                  setFormData({ ...formData, referenceMobile1: text });
                  if (errors.referenceMobile1) {
                    setErrors({ ...errors, referenceMobile1: '' });
                  }
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {errors.referenceMobile1 && (
              <Text style={clsx(styles.textSm, styles.textError)}>
                {errors.referenceMobile1}
              </Text>
            )}
          </View>

          <View style={clsx(styles.mb6)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
              Reference 2
            </Text>
            <View style={clsx(styles.flexRow)}>
              <TextInput
                style={clsx(
                  styles.input,
                  styles.flex1,
                  styles.mr2
                )}
                placeholder="Reference Name"
                placeholderTextColor={colors.textMuted}
                value={formData.referenceName2}
                onChangeText={(text) => setFormData({ ...formData, referenceName2: text })}
              />
              <TextInput
                style={clsx(
                  styles.input,
                  styles.flex1,
                  errors.referenceMobile2 && styles.borderError
                )}
                placeholder="Mobile Number"
                placeholderTextColor={colors.textMuted}
                value={formData.referenceMobile2}
                onChangeText={(text) => {
                  setFormData({ ...formData, referenceMobile2: text });
                  if (errors.referenceMobile2) {
                    setErrors({ ...errors, referenceMobile2: '' });
                  }
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {errors.referenceMobile2 && (
              <Text style={clsx(styles.textSm, styles.textError)}>
                {errors.referenceMobile2}
              </Text>
            )}
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={clsx(
            styles.button,
            styles.mb6,
            loading && styles.opacity50
          )}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={clsx(styles.buttonText)}>
              Update Profile
            </Text>
          )}
        </TouchableOpacity>

       

        
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileUpdateScreen;