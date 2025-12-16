import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Header from '../../components/Common/Header';

const ProviderSignupScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Professional Information
    serviceCategory: '',
    experience: '',
    skills: [],
    hourlyRate: '',
    
    // Step 3: Personal Details
    dateOfBirth: new Date('1990-01-01'),
    gender: '',
    address: '',
    city: '',
    pincode: '',
    
    // Step 4: Documents
    profilePhoto: null,
    aadharNumber: '',
    panNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    
    // Step 5: Verification
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});

  const serviceCategories = [
    'AC Repair & Service',
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Painting',
    'Carpentry',
    'Appliance Repair',
    'Pest Control',
    'Beauty Services',
    'Other',
  ];

  const experienceOptions = [
    'Less than 1 year',
    '1-2 years',
    '3-5 years',
    '5-10 years',
    'More than 10 years',
  ];

  const skillsList = [
    'AC Repair',
    'Plumbing',
    'Electrical Wiring',
    'Painting',
    'Carpentry',
    'Appliance Repair',
    'Deep Cleaning',
    'Pest Control',
    'Beauty Services',
    'Home Repair',
  ];

  const handleNextStep = () => {
    const currentErrors = validateStep(step);
    
    if (Object.keys(currentErrors).length === 0) {
      if (step < 5) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    } else {
      setErrors(currentErrors);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    } else {
      navigation.goBack();
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    switch (stepNumber) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Enter valid 10-digit phone number';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter valid email';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;
        
      case 2:
        if (!formData.serviceCategory) newErrors.serviceCategory = 'Service category is required';
        if (!formData.experience) newErrors.experience = 'Experience is required';
        if (formData.skills.length === 0) newErrors.skills = 'Select at least one skill';
        if (!formData.hourlyRate) newErrors.hourlyRate = 'Hourly rate is required';
        else if (isNaN(formData.hourlyRate) || Number(formData.hourlyRate) < 100) 
          newErrors.hourlyRate = 'Enter valid hourly rate (min ₹100)';
        break;
        
      case 3:
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        if (formData.dateOfBirth > minDate) newErrors.dateOfBirth = 'You must be at least 18 years old';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Enter valid 6-digit pincode';
        break;
        
      case 4:
        if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
        if (!formData.aadharNumber.trim()) newErrors.aadharNumber = 'Aadhar number is required';
        else if (!/^\d{12}$/.test(formData.aadharNumber)) newErrors.aadharNumber = 'Enter valid 12-digit Aadhar number';
        if (!formData.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) newErrors.panNumber = 'Enter valid PAN number';
        if (!formData.bankAccountNumber.trim()) newErrors.bankAccountNumber = 'Bank account number is required';
        if (!formData.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
        else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) newErrors.ifscCode = 'Enter valid IFSC code';
        break;
        
      case 5:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept terms and conditions';
        break;
    }
    
    return newErrors;
  };

  const handleImagePick = () => {
    const options = {
      title: 'Select Profile Photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', 'Failed to select image');
      } else {
        const source = { uri: response.assets[0].uri };
        setFormData(prev => ({ ...prev, profilePhoto: source.uri }));
        if (errors.profilePhoto) {
          setErrors(prev => ({ ...prev, profilePhoto: '' }));
        }
      }
    });
  };

  const handleSkillToggle = (skill) => {
    const updatedSkills = formData.skills.includes(skill)
      ? formData.skills.filter(s => s !== skill)
      : [...formData.skills, skill];
    
    setFormData(prev => ({ ...prev, skills: updatedSkills }));
    if (errors.skills && updatedSkills.length > 0) {
      setErrors(prev => ({ ...prev, skills: '' }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.dateOfBirth;
    setFormData(prev => ({ ...prev, dateOfBirth: currentDate }));
  };

  const handleSubmit = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Application Submitted',
        'Your application has been submitted successfully. Our team will verify your details and contact you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'ProviderLogin' }],
            }),
          },
        ]
      );
    }, 2000);
  };

  const renderStepIndicator = () => (
    <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mx4, styles.mt4, styles.mb6)}>
      {[1, 2, 3, 4, 5].map((stepNumber) => (
        <View key={stepNumber} style={clsx(styles.flexRow, styles.itemsCenter, styles.flex1)}>
          <View style={clsx(
            styles.roundedFull,
            styles.itemsCenter,
            styles.justifyCenter,
            { width: 36, height: 36 },
            stepNumber === step ? styles.bgPrimary : 
            stepNumber < step ? styles.bgSuccess : styles.bgGray
          )}>
            {stepNumber < step ? (
              <Icon name="check" size={20} color={colors.white} />
            ) : (
              <Text style={clsx(
                styles.textBase,
                styles.fontBold,
                stepNumber === step ? styles.textWhite : styles.textBlack
              )}>
                {stepNumber}
              </Text>
            )}
          </View>
          
          {stepNumber < 5 && (
            <View style={clsx(
              styles.flex1,
              styles.h1,
              styles.mx2,
              stepNumber < step ? styles.bgSuccess : styles.bgGray
            )} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack, styles.mb6)}>
              Basic Information
            </Text>
            
            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Full Name
              </Text>
              <TextInput
                style={clsx(
                  styles.bgWhite,
                  styles.border,
                  styles.borderGray,
                  styles.roundedLg,
                  styles.p4,
                  styles.textBase,
                  errors.fullName && styles.borderError
                )}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, fullName: text }));
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                }}
              />
              {errors.fullName && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.fullName}
                </Text>
              )}
            </View>

            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Phone Number
              </Text>
              <View style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.bgWhite,
                styles.border,
                styles.borderGray,
                styles.roundedLg,
                styles.px4,
                styles.py3,
                errors.phone && styles.borderError
              )}>
                <Text style={clsx(styles.textBase, styles.textBlack)}>+91</Text>
                <TextInput
                  style={clsx(styles.flex1, styles.textBase, styles.textBlack, styles.ml2)}
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, phone: text }));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
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

            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Email Address
              </Text>
              <TextInput
                style={clsx(
                  styles.bgWhite,
                  styles.border,
                  styles.borderGray,
                  styles.roundedLg,
                  styles.p4,
                  styles.textBase,
                  errors.email && styles.borderError
                )}
                placeholder="Enter your email address"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, email: text }));
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.email}
                </Text>
              )}
            </View>

            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Password
              </Text>
              <TextInput
                style={clsx(
                  styles.bgWhite,
                  styles.border,
                  styles.borderGray,
                  styles.roundedLg,
                  styles.p4,
                  styles.textBase,
                  errors.password && styles.borderError
                )}
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, password: text }));
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                secureTextEntry
              />
              {errors.password && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.password}
                </Text>
              )}
            </View>

            <View style={clsx(styles.mb6)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Confirm Password
              </Text>
              <TextInput
                style={clsx(
                  styles.bgWhite,
                  styles.border,
                  styles.borderGray,
                  styles.roundedLg,
                  styles.p4,
                  styles.textBase,
                  errors.confirmPassword && styles.borderError
                )}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, confirmPassword: text }));
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }}
                secureTextEntry
              />
              {errors.confirmPassword && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.confirmPassword}
                </Text>
              )}
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack, styles.mb6)}>
              Professional Information
            </Text>
            
            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Service Category
              </Text>
              <View style={clsx(
                styles.bgWhite,
                styles.border,
                styles.borderGray,
                styles.roundedLg,
                styles.overflowHidden,
                errors.serviceCategory && styles.borderError
              )}>
                <Picker
                  selectedValue={formData.serviceCategory}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, serviceCategory: value }));
                    if (errors.serviceCategory) setErrors(prev => ({ ...prev, serviceCategory: '' }));
                  }}
                  style={clsx(styles.textBase, styles.textBlack)}
                >
                  <Picker.Item label="Select service category" value="" />
                  {serviceCategories.map((category) => (
                    <Picker.Item key={category} label={category} value={category} />
                  ))}
                </Picker>
              </View>
              {errors.serviceCategory && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.serviceCategory}
                </Text>
              )}
            </View>

            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Experience
              </Text>
              <View style={clsx(
                styles.bgWhite,
                styles.border,
                styles.borderGray,
                styles.roundedLg,
                styles.overflowHidden,
                errors.experience && styles.borderError
              )}>
                <Picker
                  selectedValue={formData.experience}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, experience: value }));
                    if (errors.experience) setErrors(prev => ({ ...prev, experience: '' }));
                  }}
                  style={clsx(styles.textBase, styles.textBlack)}
                >
                  <Picker.Item label="Select experience level" value="" />
                  {experienceOptions.map((exp) => (
                    <Picker.Item key={exp} label={exp} value={exp} />
                  ))}
                </Picker>
              </View>
              {errors.experience && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.experience}
                </Text>
              )}
            </View>

            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Skills
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mb2)}>
                Select all that apply
              </Text>
              <View style={clsx(styles.flexRow, styles.flexWrap)}>
                {skillsList.map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    style={clsx(
                      styles.px3,
                      styles.py2,
                      styles.mr2,
                      styles.mb2,
                      styles.roundedFull,
                      formData.skills.includes(skill) ? 
                      styles.bgPrimary : 
                      styles.bgGray
                    )}
                    onPress={() => handleSkillToggle(skill)}
                  >
                    <Text style={clsx(
                      styles.textSm,
                      styles.fontMedium,
                      formData.skills.includes(skill) ? 
                      styles.textWhite : 
                      styles.textBlack
                    )}>
                      {skill}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.skills && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.skills}
                </Text>
              )}
            </View>

            <View style={clsx(styles.mb6)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Expected Hourly Rate (₹)
              </Text>
              <TextInput
                style={clsx(
                  styles.bgWhite,
                  styles.border,
                  styles.borderGray,
                  styles.roundedLg,
                  styles.p4,
                  styles.textBase,
                  errors.hourlyRate && styles.borderError
                )}
                placeholder="Enter your expected hourly rate"
                value={formData.hourlyRate}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, hourlyRate: text }));
                  if (errors.hourlyRate) setErrors(prev => ({ ...prev, hourlyRate: '' }));
                }}
                keyboardType="number-pad"
              />
              {errors.hourlyRate && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.hourlyRate}
                </Text>
              )}
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                Typical rates: ₹150-500 per hour based on service
              </Text>
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack, styles.mb6)}>
              Personal Details
            </Text>
            
            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Date of Birth
              </Text>
              <TouchableOpacity
                style={clsx(
                  styles.bgWhite,
                  styles.border,
                  styles.borderGray,
                  styles.roundedLg,
                  styles.p4,
                  styles.flexRow,
                  styles.justifyBetween,
                  styles.itemsCenter,
                  errors.dateOfBirth && styles.borderError
                )}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  {formData.dateOfBirth.toLocaleDateString('en-IN')}
                </Text>
                <Icon name="calendar-today" size={20} color={colors.textMuted} />
              </TouchableOpacity>
              {errors.dateOfBirth && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.dateOfBirth}
                </Text>
              )}
              
              {Platform.OS === 'ios' && (
                <DateTimePicker
                  value={formData.dateOfBirth}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  style={clsx(styles.mt2)}
                />
              )}
            </View>

            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Gender
              </Text>
              <View style={clsx(
                styles.bgWhite,
                styles.border,
                styles.borderGray,
                styles.roundedLg,
                styles.overflowHidden,
                errors.gender && styles.borderError
              )}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, gender: value }));
                    if (errors.gender) setErrors(prev => ({ ...prev, gender: '' }));
                  }}
                  style={clsx(styles.textBase, styles.textBlack)}
                >
                  <Picker.Item label="Select gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                  <Picker.Item label="Prefer not to say" value="prefer_not_to_say" />
                </Picker>
              </View>
              {errors.gender && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.gender}
                </Text>
              )}
            </View>

            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Address
              </Text>
              <TextInput
                style={clsx(
                  styles.bgWhite,
                  styles.border,
                  styles.borderGray,
                  styles.roundedLg,
                  styles.p4,
                  styles.textBase,
                  errors.address && styles.borderError
                )}
                placeholder="Enter your complete address"
                value={formData.address}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, address: text }));
                  if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                }}
                multiline
                numberOfLines={3}
              />
              {errors.address && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.address}
                </Text>
              )}
            </View>

            <View style={clsx(styles.flexRow, styles.mb4)}>
              <View style={clsx(styles.flex1, styles.mr2)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                  City
                </Text>
                <TextInput
                  style={clsx(
                    styles.bgWhite,
                    styles.border,
                    styles.borderGray,
                    styles.roundedLg,
                    styles.p4,
                    styles.textBase,
                    errors.city && styles.borderError
                  )}
                  placeholder="City"
                  value={formData.city}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, city: text }));
                    if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                  }}
                />
                {errors.city && (
                  <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                    {errors.city}
                  </Text>
                )}
              </View>

              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                  Pincode
                </Text>
                <TextInput
                  style={clsx(
                    styles.bgWhite,
                    styles.border,
                    styles.borderGray,
                    styles.roundedLg,
                    styles.p4,
                    styles.textBase,
                    errors.pincode && styles.borderError
                  )}
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, pincode: text }));
                    if (errors.pincode) setErrors(prev => ({ ...prev, pincode: '' }));
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {errors.pincode && (
                  <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                    {errors.pincode}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack, styles.mb6)}>
              Documents & Bank Details
            </Text>
            
            {/* Profile Photo */}
            <View style={clsx(styles.mb6, styles.itemsCenter)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
                Profile Photo
              </Text>
              <TouchableOpacity
                style={clsx(
                  styles.roundedFull,
                  styles.border,
                  styles.borderGray,
                  styles.border4,
                  styles.overflowHidden,
                  { width: 120, height: 120 },
                  errors.profilePhoto && styles.borderError
                )}
                onPress={handleImagePick}
              >
                {formData.profilePhoto ? (
                  <Image
                    source={{ uri: formData.profilePhoto }}
                    style={clsx(styles.w100, styles.h100)}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={clsx(styles.w100, styles.h100, styles.bgGray, styles.itemsCenter, styles.justifyCenter)}>
                    <Icon name="camera-alt" size={40} color={colors.textMuted} />
                  </View>
                )}
                <View style={clsx(
                  styles.positionAbsolute,
                  styles.bottom0,
                  styles.right0,
                  styles.bgPrimary,
                  styles.roundedFull,
                  styles.p2
                )}>
                  <Icon name="edit" size={16} color={colors.white} />
                </View>
              </TouchableOpacity>
              {errors.profilePhoto && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt2)}>
                  {errors.profilePhoto}
                </Text>
              )}
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
                Clear photo of your face. Max size 2MB.
              </Text>
            </View>

            {/* Aadhar Number */}
            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Aadhar Number
              </Text>
              <TextInput
                style={clsx(
                  styles.bgWhite,
                  styles.border,
                  styles.borderGray,
                  styles.roundedLg,
                  styles.p4,
                  styles.textBase,
                  errors.aadharNumber && styles.borderError
                )}
                placeholder="Enter 12-digit Aadhar number"
                value={formData.aadharNumber}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, aadharNumber: text }));
                  if (errors.aadharNumber) setErrors(prev => ({ ...prev, aadharNumber: '' }));
                }}
                keyboardType="number-pad"
                maxLength={12}
              />
              {errors.aadharNumber && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.aadharNumber}
                </Text>
              )}
            </View>

            {/* PAN Number */}
            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                PAN Number
              </Text>
              <TextInput
                style={clsx(
                  styles.bgWhite,
                  styles.border,
                  styles.borderGray,
                  styles.roundedLg,
                  styles.p4,
                  styles.textBase,
                  errors.panNumber && styles.borderError
                )}
                placeholder="Enter PAN number"
                value={formData.panNumber}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, panNumber: text.toUpperCase() }));
                  if (errors.panNumber) setErrors(prev => ({ ...prev, panNumber: '' }));
                }}
                autoCapitalize="characters"
                maxLength={10}
              />
              {errors.panNumber && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.panNumber}
                </Text>
              )}
            </View>

            {/* Bank Details */}
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt6, styles.mb4)}>
              Bank Details for Payments
            </Text>

            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Bank Account Number
              </Text>
              <TextInput
                style={clsx(
                  styles.bgWhite,
                  styles.border,
                  styles.borderGray,
                  styles.roundedLg,
                  styles.p4,
                  styles.textBase,
                  errors.bankAccountNumber && styles.borderError
                )}
                placeholder="Enter bank account number"
                value={formData.bankAccountNumber}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, bankAccountNumber: text }));
                  if (errors.bankAccountNumber) setErrors(prev => ({ ...prev, bankAccountNumber: '' }));
                }}
                keyboardType="number-pad"
              />
              {errors.bankAccountNumber && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.bankAccountNumber}
                </Text>
              )}
            </View>

            <View style={clsx(styles.mb6)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                IFSC Code
              </Text>
              <TextInput
                style={clsx(
                  styles.bgWhite,
                  styles.border,
                  styles.borderGray,
                  styles.roundedLg,
                  styles.p4,
                  styles.textBase,
                  errors.ifscCode && styles.borderError
                )}
                placeholder="Enter IFSC code"
                value={formData.ifscCode}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, ifscCode: text.toUpperCase() }));
                  if (errors.ifscCode) setErrors(prev => ({ ...prev, ifscCode: '' }));
                }}
                autoCapitalize="characters"
                maxLength={11}
              />
              {errors.ifscCode && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                  {errors.ifscCode}
                </Text>
              )}
            </View>
          </View>
        );

      case 5:
        return (
          <View>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack, styles.mb6)}>
              Review & Submit
            </Text>
            
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow, styles.mb6)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
                Application Summary
              </Text>
              
              <View style={clsx(styles.mb3)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted, styles.mb1)}>
                  Personal Information
                </Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  {formData.fullName}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  {formData.phone} • {formData.email}
                </Text>
              </View>
              
              <View style={clsx(styles.mb3)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted, styles.mb1)}>
                  Professional Details
                </Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  {formData.serviceCategory}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  {formData.experience} • ₹{formData.hourlyRate}/hour
                </Text>
              </View>
              
              <View style={clsx(styles.mb3)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted, styles.mb1)}>
                  Location
                </Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  {formData.city}, {formData.pincode}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  {formData.address}
                </Text>
              </View>
              
              <View>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted, styles.mb1)}>
                  Documents
                </Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  Aadhar: {formData.aadharNumber}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  PAN: {formData.panNumber} • Bank: {formData.bankAccountNumber}
                </Text>
              </View>
            </View>

            {/* Terms and Conditions */}
            <View style={clsx(styles.mb6)}>
              <TouchableOpacity
                style={clsx(styles.flexRow, styles.itemsStart)}
                onPress={() => setFormData(prev => ({ 
                  ...prev, 
                  termsAccepted: !prev.termsAccepted 
                }))}
              >
                <View style={clsx(
                  styles.w5,
                  styles.h5,
                  styles.border,
                  styles.borderPrimary,
                  styles.roundedSm,
                  styles.mr3,
                  styles.mt1,
                  formData.termsAccepted && styles.bgPrimary,
                  formData.termsAccepted && styles.itemsCenter,
                  formData.termsAccepted && styles.justifyCenter
                )}>
                  {formData.termsAccepted && (
                    <Icon name="check" size={14} color={colors.white} />
                  )}
                </View>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textBase, styles.textBlack)}>
                    I agree to the Terms & Conditions and Privacy Policy
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                    By submitting, I confirm that all information provided is accurate
                  </Text>
                </View>
              </TouchableOpacity>
              {errors.termsAccepted && (
                <Text style={clsx(styles.textSm, styles.textError, styles.mt2)}>
                  {errors.termsAccepted}
                </Text>
              )}
            </View>

            {/* Verification Note */}
            <View style={clsx(styles.bgWarningLight, styles.roundedLg, styles.p4)}>
              <View style={clsx(styles.flexRow, styles.itemsStart)}>
                <Icon name="info" size={20} color={colors.warning} style={clsx(styles.mr3, styles.mt1)} />
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    Verification Required
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                    Our team will verify your documents and contact you within 24 hours.
                    You'll receive SMS updates about your application status.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={clsx(styles.flex1, styles.bgSurface)}
    >
      <Header
        title={`Service Partner Signup (Step ${step}/5)`}
        showBack
        onBackPress={handlePreviousStep}
        type="white"
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.px4, styles.pb6)}
      >
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        {renderStepContent()}

        {/* Action Buttons */}
        <View style={clsx(styles.mt6)}>
          <TouchableOpacity
            style={clsx(
              styles.bgPrimary,
              styles.roundedLg,
              styles.p4,
              styles.itemsCenter,
              styles.justifyCenter,
              loading && styles.opacity50
            )}
            onPress={handleNextStep}
            disabled={loading}
          >
            <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
              {loading ? 'Processing...' : 
               step === 5 ? 'Submit Application' : 'Continue'}
            </Text>
          </TouchableOpacity>

          {step < 5 && (
            <TouchableOpacity
              style={clsx(
                styles.mt4,
                styles.itemsCenter
              )}
              onPress={handlePreviousStep}
            >
              <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                Go Back
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Info */}
        <View style={clsx(styles.mt6, styles.itemsCenter)}>
          <Text style={clsx(styles.textSm, styles.textMuted)}>
            Step {step} of 5
          </Text>
          <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1)}>
            Your information is secure and encrypted
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProviderSignupScreen;