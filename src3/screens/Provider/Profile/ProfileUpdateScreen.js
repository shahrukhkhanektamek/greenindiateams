import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  Image,
  RefreshControl,
  FlatList,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'react-native-image-picker';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

import { goBack, navigate, reset } from '../../../navigation/navigationService';

const ProfileUpdateScreen = ({ route }) => {
  const {
    Toast,
    Urls,
    postData,
    UploadUrl,
    fetchProfile,
    user,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileDataLoaded, setProfileDataLoaded] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceCategories, setServiceCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  // Initial profile data
  const initialProfileData = {
    name: '',
    email: '',
    mobile: '',
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
    profileImage: null,
  };

  const [formData, setFormData] = useState(initialProfileData);
  const [errors, setErrors] = useState({});

  // Experience levels
  const experienceLevels = [
    'Fresher',
    'Experience'
  ];

  // Years of experience
  const yearsOfExperience = ['0', '1', '2', '3', '4', '5', '6+'];

  // Filter categories based on search
  const filteredCategories = allCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to extract all categories from API response
  const extractCategoriesFromResponse = (responseData) => {
    if (!responseData || !Array.isArray(responseData)) {
      return [];
    }

    return responseData.map(category => ({
      _id: category._id,
      id: category._id, // Add id property for compatibility
      name: category.name,
      image: category.image,
      icon: category.icon,
      subcategories: category.subcategories || [],
      // Include other properties as needed
    }));
  };

  // Fetch categories data
  const fetchCategories = async () => {
    try {
      const categoriesResponse = await postData({}, Urls.categoryList, 'GET', { 
        showErrorMessage: false,  showSuccessMessage: false
      });
      
      if (categoriesResponse?.success && categoriesResponse?.data) {
        // Extract categories from response data array
        let categories = [];
        
        if (Array.isArray(categoriesResponse.data)) {
          // Direct array of categories
          categories = extractCategoriesFromResponse(categoriesResponse.data);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load categories',
          });
          return false;
        }
        
        setAllCategories(categories);
        return true;
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load categories',
        });
        return false;
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load categories',
      });
      return false;
    }
  };

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      const response = await postData({}, Urls.profileDetail, 'GET', { showErrorMessage: false, showSuccessMessage: false });

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
          if (Array.isArray(apiData.categoryIds)) {
            categoryIds = apiData.categoryIds;
          } else if (typeof apiData.categoryIds === 'string') {
            // If it's a string, try to parse it as JSON array
            try {
              categoryIds = JSON.parse(apiData.categoryIds);
            } catch (e) {
              categoryIds = apiData.categoryIds.split(',').map(id => id.trim());
            }
          }
        } else if (apiData.category_id) {
          categoryIds = [apiData.category_id];
        } else if (apiData.categories) {
          // If categories object is present
          if (Array.isArray(apiData.categories)) {
            categoryIds = apiData.categories.map(cat => cat._id || cat.id);
          }
        }
        
        // Ensure categoryIds is an array
        categoryIds = Array.isArray(categoryIds) ? categoryIds : [];
        
        // Handle yearOfExperience - convert number to string
        let yearOfExperience = '';
        if (apiData.yearOfExperience !== undefined && apiData.yearOfExperience !== null) {
          const yearNum = parseInt(apiData.yearOfExperience);
          yearOfExperience = yearNum >= 6 ? '6+' : yearNum.toString();
        }

        // Handle profile image
        let profileImage = null;
        if (apiData.profileImage) {
          profileImage = {
            uri: UploadUrl + apiData.profileImage,
            type: 'image/jpeg',
            name: `profile_${Date.now()}.jpg`,
          };
        }
        
        const updatedFormData = {
          name: apiData.name || '',
          email: apiData.email || '',
          mobile: apiData.mobile || apiData.phone || '',
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
          categoryIds: categoryIds,
          profileImage: profileImage,
        };
        
        setFormData(updatedFormData);
        
        // If profile data is also passed via route params, use it (overrides API data)
        if (route.params?.profile) {
          setFormData(prev => ({ ...prev, ...route.params.profile }));
        }
        
        return true;
      } else {
        console.log('Profile API failed:', response);
        return false;
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // If API fails but route params exist, use them
      if (route.params?.profile) {
        setFormData(route.params.profile);
      }
      return false;
    }
  };

  // Initial load
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Fetch categories first
      await fetchCategories();
      
      // Then fetch profile data
      await fetchProfileData();
    } catch (error) {
      console.error('Error in loadProfileData:', error);
    } finally {
      setLoading(false);
      setProfileDataLoaded(true);
    }
  };

  // Refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCategories();
      await fetchProfileData();
      Toast.show({
        type: 'success',
        text1: 'Profile data refreshed',
        text2: 'Latest data loaded successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Refresh failed',
        text2: 'Could not refresh profile data',
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  const selectProfileImage = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to pick image',
        });
      } else if (response.assets && response.assets[0]) {
        const image = response.assets[0];
        
        // Check file size (max 5MB)
        if (image.fileSize > 5 * 1024 * 1024) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Image size should be less than 5MB',
          });
          return;
        }

        setFormData({
          ...formData,
          profileImage: {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `profile_${Date.now()}.jpg`,
          }
        });
      }
    });
  };

  const captureProfileImage = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      saveToPhotos: true,
      cameraType: 'front',
    };

    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to capture image',
        });
      } else if (response.assets && response.assets[0]) {
        const image = response.assets[0];
        
        // Check file size (max 5MB)
        if (image.fileSize > 5 * 1024 * 1024) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Image size should be less than 5MB',
          });
          return;
        }

        setFormData({
          ...formData,
          profileImage: {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `profile_${Date.now()}.jpg`,
          }
        });
      }
    });
  };

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

    console.log(formData.experienceLevel)
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }

    if (!formData.experienceLevel) {
      newErrors.experienceLevel = 'Years experience level is required';
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
      // Prepare FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('mobile', formData.mobile);
      
      if (formData.dob) {
        formDataToSend.append('dob', formData.dob.toISOString().split('T')[0]);
      }
      
      formDataToSend.append('experienceLevel', formData.experienceLevel);
      formDataToSend.append('companyName', formData.companyName);
      formDataToSend.append('yearOfExperience', parseInt(formData.yearOfExperience.replace('+', '')) || 0);
      formDataToSend.append('permanentAddress', formData.permanentAddress);
      formDataToSend.append('currentAddress', formData.currentAddress);
      formDataToSend.append('referenceName1', formData.referenceName1);
      formDataToSend.append('referenceMobile1', formData.referenceMobile1);
      formDataToSend.append('referenceName2', formData.referenceName2);
      formDataToSend.append('referenceMobile2', formData.referenceMobile2);
      formDataToSend.append('userId', formData.userId);
      
      // Add categoryIds as array
      formData.categoryIds.forEach((categoryId, index) => {
        formDataToSend.append(`categoryIds[${index}]`, categoryId);
      });
      
      // Add profile image if it exists
      if (formData.profileImage && formData.profileImage.uri) {
        formDataToSend.append('profileImage', {
          uri: formData.profileImage.uri,
          type: formData.profileImage.type || 'image/jpeg',
          name: formData.profileImage.name || `profile_${Date.now()}.jpg`,
        });
      }

   

      const response = await postData(formDataToSend, Urls.profileUpdate, 'POST', { 
        showErrorMessage: true,
        isFileUpload: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response?.success) {
        
        // Refresh data after successful update
        await fetchProfileData();
        
        await fetchProfile();
        
        Toast.show({
          type: 'success',
          text1: response.message || 'Profile updated successfully',
        });

        if(!user.kyc)  
        {
          navigate('KycScreen');
        }
        else{
          goBack();
        }
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

  // Get selected category names for display
  const getSelectedCategoryNames = () => {
    return allCategories
      .filter(category => formData.categoryIds.includes(category._id))
      .map(category => category.name);
  };

  // Render categories like Select2
  const renderSelect2Categories = () => {
    const selectedCategories = getSelectedCategoryNames();

    return (
      <View style={clsx(styles.mb4)}>
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
          Service Categories
        </Text>
        
        {/* Select2-like input field */}
        <TouchableOpacity
          style={clsx(
            styles.input,
            styles.flexRow,
            styles.justifyBetween,
            styles.itemsCenter,
            styles.p2,
            { minHeight: 50 }
          )}
          onPress={() => setShowCategoriesModal(true)}
          activeOpacity={0.7}
        >
          <View style={clsx(styles.flexRow, styles.flexWrap, styles.flex1)}>
            {selectedCategories.length > 0 ? (
              selectedCategories.map((categoryName, index) => {
                const categoryId = allCategories.find(cat => cat.name === categoryName)?._id;
                return (
                  <View
                    key={categoryId || index}
                    style={clsx(
                      styles.bgPrimaryLight,
                      styles.px2,
                      styles.py1,
                      styles.rounded,
                      styles.mr2,
                      styles.mb1,
                      styles.flexRow,
                      styles.itemsCenter
                    )}
                  >
                    <Text style={clsx(styles.textSm, styles.textWhite)}>
                      {categoryName}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        if (categoryId) {
                          handleCategoryToggle(categoryId);
                        }
                      }}
                      style={clsx(styles.ml2)}
                    >
                      <Icon name="close" size={14} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <Text style={clsx(styles.textBase, styles.textMuted)}>
                Select service categories...
              </Text>
            )}
          </View>
          <Icon name="arrow-drop-down" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Selected count */}
        {selectedCategories.length > 0 && (
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
            {selectedCategories.length} category{selectedCategories.length !== 1 ? 'ies' : ''} selected
          </Text>
        )}

        {/* Categories Modal */}
        <Modal
          visible={showCategoriesModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCategoriesModal(false)}
        >
          <View style={[
            clsx(styles.flex1, styles.justifyCenter, styles.itemsCenter),
            { backgroundColor: 'rgba(0,0,0,0.5)' }
          ]}>
            <View style={[
              clsx(styles.bgWhite, styles.roundedLg, styles.w11_12),
              { maxHeight: '80%' }
            ]}>
              {/* Modal Header */}
              <View style={clsx(
                styles.bgPrimary,
                styles.p4,
                styles.roundedTLg,
                styles.roundedTRg,
                styles.flexRow,
                styles.justifyBetween,
                styles.itemsCenter
              )}>
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textWhite)}>
                  Select Service Categories
                </Text>
                <TouchableOpacity onPress={() => setShowCategoriesModal(false)}>
                  <Icon name="close" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View style={clsx(styles.p4)}>
                <View style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.bgGrayLight,
                  styles.rounded,
                  styles.px3,
                  styles.py2
                )}>
                  <Icon name="search" size={20} color={colors.textMuted} />
                  <TextInput
                    style={clsx(styles.flex1, styles.ml2, styles.textBase)}
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={colors.textMuted}
                    autoFocus={true}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Icon name="clear" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Categories List */}
              <FlatList
                data={filteredCategories}
                keyExtractor={(item) => item._id}
                style={clsx(styles.px4)}
                contentContainerStyle={clsx(styles.pb4)}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = formData.categoryIds.includes(item._id);
                  return (
                    <TouchableOpacity
                      style={clsx(
                        styles.flexRow,
                        styles.itemsCenter,
                        styles.py3,
                        styles.borderB,
                        styles.borderGrayLight
                      )}
                      onPress={() => handleCategoryToggle(item._id)}
                    >
                      <View style={clsx(
                        styles.w6,
                        styles.h6,
                        styles.roundedSm,
                        styles.border2,
                        styles.mr3,
                        isSelected ? clsx(styles.bgPrimary, styles.borderPrimary) : clsx(styles.borderGray)
                      )}>
                        {isSelected && (
                          <Icon name="check" size={16} color={colors.white} />
                        )}
                      </View>
                      <Text style={clsx(
                        styles.textBase,
                        styles.fontMedium,
                        isSelected ? styles.textPrimary : styles.textBlack
                      )}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={clsx(styles.py6, styles.itemsCenter)}>
                    <Icon name="search-off" size={40} color={colors.textMuted} />
                    <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2)}>
                      No categories found
                    </Text>
                  </View>
                }
              />

              {/* Modal Footer */}
              <View style={clsx(
                styles.flexRow,
                styles.justifyBetween,
                styles.p4,
                styles.borderT,
                styles.borderGrayLight
              )}>
                <View>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    {selectedCategories.length} selected
                  </Text>
                </View>
                <TouchableOpacity
                  style={clsx(styles.bgPrimary, styles.px4, styles.py2, styles.rounded)}
                  onPress={() => setShowCategoriesModal(false)}
                >
                  <Text style={clsx(styles.textBase, styles.textWhite, styles.fontMedium)}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
        rightActionIcon="refresh"
        showProfile={false}
        onRightActionPress={onRefresh}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.px4, styles.pb6)}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="Pull to refresh"
            titleColor={colors.textMuted}
          />
        }
      >
        {/* Refresh Status Indicator */}
        {refreshing && (
          <View style={clsx(styles.py2, styles.itemsCenter)}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={clsx(styles.textSm, styles.textPrimary, styles.mt1)}>
              Refreshing...
            </Text>
          </View>
        )}

        {/* Profile Image Section */}
        <View style={clsx(styles.mt6, styles.itemsCenter, styles.mb4)}>
          <View style={clsx(styles.relative)}>
            
            {formData.profileImage?.uri ? (
              <>              
                <Image
                  source={{ uri: formData.profileImage.uri }}
                  style={[
                    {width: 128, height: 128},
                    styles.roundedFull, 
                    styles.border2,  
                    styles.borderWhite, 
                    styles.shadowMd 
                  ]}
                  resizeMode="cover"
                  />                 
                </>
            ) : (
              <View style={clsx(styles.w32, styles.h32, styles.roundedFull, styles.bgGray, styles.border2, styles.borderWhite, styles.justifyCenter, styles.itemsCenter, styles.shadowMd)}>
                <Icon name="person" size={60} color={colors.textMuted} />
              </View>
            )}
            
            {/* Edit icon overlay */}
            <TouchableOpacity
              style={clsx(
                styles.absolute,
                styles.bottom0,
                styles.right0,
                styles.w10,
                styles.h10,
                styles.roundedFull,
                styles.bgPrimary,
                styles.justifyCenter,
                styles.itemsCenter,
                styles.border2,
                styles.borderWhite
              )}
              onPress={selectProfileImage}
            >
              <Icon name="edit" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <Text style={clsx(styles.textBase, styles.textBlack, styles.fontMedium, styles.mt2)}>
            Tap to change profile photo
          </Text>
          
          <View style={clsx(styles.flexRow, styles.mt2)}>
            <TouchableOpacity
              style={clsx(styles.flexRow, styles.itemsCenter, styles.mr4)}
              onPress={selectProfileImage}
            >
              <Icon name="photo-library" size={20} color={colors.primary} />
              <Text style={clsx(styles.textSm, styles.textPrimary, styles.ml1)}>
                Gallery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={clsx(styles.flexRow, styles.itemsCenter)}
              onPress={captureProfileImage}
            >
              <Icon name="camera-alt" size={20} color={colors.primary} />
              <Text style={clsx(styles.textSm, styles.textPrimary, styles.ml1)}>
                Camera
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information */}
        <View style={clsx(styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Personal Information
          </Text>

          {/* Service Categories - Select2 Style */}
          {renderSelect2Categories()}

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
        <View style={clsx(styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Professional Information
          </Text>

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
            (loading || refreshing) && styles.opacity50
          )}
          onPress={handleUpdateProfile}
          disabled={loading || refreshing}
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