import React, { useState, useEffect } from 'react';
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

const ProfileUpdateScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Initial profile data
  const initialProfileData = {
    name: 'Arwaz',
    email: 'arwaz@gmail.com',
    dob: '25-11-1998',
    experienceLevel: 'Experience',
    companyName: 'XYZ PVT LTD',
    yearOfExperience: '3',
    permanentAddress: 'Delhi',
    currentAddress: 'Delhi',
    referenceName1: 'xyx',
    referenceMobile1: '12345567890',
    referenceName2: 'abc',
    referenceMobile2: '0987654321',
    userId: '69255f29ea028953aa5d5556',
    mobile: '8340723693',
    categoryIds: ['691c1abfe53e3e7330a908fa','691c1abfe53e3e7330a908fc'],
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

  useEffect(() => {
    // If profile data is passed via route params, use it
    if (route.params?.profile) {
      setFormData(route.params.profile);
    }
  }, [route.params]);

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

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

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
        dob: formData.dob.toISOString().split('T')[0], // Convert to YYYY-MM-DD
        yearOfExperience: parseInt(formData.yearOfExperience),
      };

      console.log('Updating profile with data:', profileData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
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
        onRightActionPress={() => navigation.navigate('Settings')}
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
            editable: false, // Email should not be editable
          })}
          
          {renderInputField('Mobile Number', 'mobile', 'Enter your mobile number', {
            keyboardType: 'phone-pad',
            maxLength: 10,
            editable: false, // Mobile should not be editable
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
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                {formData.dob}
              </Text>
              <Icon name="calendar-today" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.dob}
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
              {serviceCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={clsx(
                    styles.px3,
                    styles.py2,
                    styles.mr2,
                    styles.mb2,
                    styles.roundedFull,
                    styles.bgPrimary,
                    styles.bgGray
                  )}
                  onPress={() => handleCategoryToggle(category.id)}
                >
                  <Text style={clsx(
                    styles.textSm,
                    styles.fontMedium,
                    styles.textWhite,
                    styles.textBlack
                  )}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
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
            styles.mt4,
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

        {/* Cancel Button */}
        <TouchableOpacity
          style={clsx(
            styles.buttonOutline,
            styles.mt3
          )}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={clsx(styles.buttonOutlineText)}>
            Cancel
          </Text>
        </TouchableOpacity>

        {/* User ID Display (Read Only) */}
        <View style={clsx(styles.mt6, styles.p4, styles.bgGray, styles.roundedLg)}>
          <Text style={clsx(styles.textSm, styles.textMuted)}>
            User ID
          </Text>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mt1)}>
            {formData.userId}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileUpdateScreen;