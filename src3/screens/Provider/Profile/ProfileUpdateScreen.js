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
  BackHandler,
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

  const type = route?.params?.type;
  useEffect(() => {
    const backAction = () => {
        if(type=='new')
        {
          BackHandler.exitApp()
          return true;
        }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileDataLoaded, setProfileDataLoaded] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showCitiesModal, setShowCitiesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [allCategories, setAllCategories] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [showExperienceFields, setShowExperienceFields] = useState(false);

  // Initial profile data
  const initialProfileData = {
    name: '',
    email: '',
    mobile: '',
    dob: '',
    experienceLevel: 'Fresher',
    companyName: '',
    yearOfExperience: '',
    monthOfExperience: '',
    permanentAddress: '',
    currentAddress: '',
    referenceName1: '',
    referenceMobile1: '',
    referenceName2: '',
    referenceMobile2: '',
    userId: '',
    categoryIds: [],
    cityId: '',
    profileImage: null,
  };

  const [formData, setFormData] = useState(initialProfileData);
  const [errors, setErrors] = useState({});

  // Years options
  const yearsOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  const monthsOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

  // Filter categories based on search
  const filteredCategories = allCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter cities based on search
  const filteredCities = allCities.filter(city =>
    city.name.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  // Function to extract all categories from API response
  const extractCategoriesFromResponse = (responseData) => {
    if (!responseData || !Array.isArray(responseData)) {
      return [];
    }

    return responseData.map(category => ({
      _id: category._id,
      id: category._id,
      name: category.name,
      image: category.image,
      icon: category.icon,
      subcategories: category.subcategories || [],
    }));
  };

  // Function to extract all cities from API response
  const extractCitiesFromResponse = (responseData) => {
    if (!responseData || !Array.isArray(responseData)) {
      return [];
    }

    return responseData.map(city => ({
      _id: city._id,
      id: city._id,
      name: city.name,
      state: city.state || '',
      country: city.country || '',
    }));
  };

  // Fetch categories data
  const fetchCategories = async () => {
    try {
      const categoriesResponse = await postData({}, Urls.categoryList, 'GET', { 
        showErrorMessage: false, showSuccessMessage: false
      });
      
      if (categoriesResponse?.success && categoriesResponse?.data) {
        let categories = [];
        
        if (Array.isArray(categoriesResponse.data)) {
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

  // Fetch cities data
  const fetchCities = async () => {
    try {
      const citiesResponse = await postData({}, Urls.cityList, 'GET', { 
        showErrorMessage: false, showSuccessMessage: false
      });
      
      if (citiesResponse?.success && citiesResponse?.data) {
        let cities = [];
        
        if (Array.isArray(citiesResponse.data)) {
          cities = extractCitiesFromResponse(citiesResponse.data);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load cities',
          });
          return false;
        }
        
        setAllCities(cities);
        return true;
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load cities',
        });
        return false;
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load cities',
      });
      return false;
    }
  };

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      const response = await postData({}, Urls.profileDetail, 'GET', { 
        showErrorMessage: false, 
        showSuccessMessage: false 
      });

      if (response?.success) {
        const apiData = response.data || {};
        
        // Parse date of birth if it exists
        let dob = '';
        if (apiData.dob) {
          dob = new Date(apiData.dob);
        }
        
        // Handle categoryIds
        let categoryIds = [];
        if (apiData.categoryIds && apiData.categoryIds.length > 0) {
          if (Array.isArray(apiData.categoryIds)) {
            categoryIds = [apiData.categoryIds[0]];
          } else if (typeof apiData.categoryIds === 'string') {
            try {
              const parsed = JSON.parse(apiData.categoryIds);
              categoryIds = Array.isArray(parsed) && parsed.length > 0 ? [parsed[0]] : [];
            } catch (e) {
              const split = apiData.categoryIds.split(',').map(id => id.trim());
              categoryIds = split.length > 0 ? [split[0]] : [];
            }
          }
        } else if (apiData.category_id) {
          categoryIds = [apiData.category_id];
        } else if (apiData.categories && Array.isArray(apiData.categories) && apiData.categories.length > 0) {
          categoryIds = [apiData.categories[0]._id || apiData.categories[0].id];
        }
        
        // Handle cityId
        let cityId = '';
        if (apiData.cityId) {
          cityId = apiData.cityId;
        } else if (apiData.city_id) {
          cityId = apiData.city_id;
        } else if (apiData.city && apiData.city._id) {
          cityId = apiData.city._id;
        } else if (apiData.cities && Array.isArray(apiData.cities) && apiData.cities.length > 0) {
          cityId = apiData.cities[0]._id;
        }
        
        // Handle years and months of experience
        let yearOfExperience = '';
        let monthOfExperience = '';
        let experienceLevel = 'Fresher';
        
        if (apiData.yearOfExperience !== undefined && apiData.yearOfExperience !== null) {
          const totalMonths = parseInt(apiData.yearOfExperience) * 12;
          if (totalMonths > 0) {
            experienceLevel = 'Experience';
            yearOfExperience = Math.floor(totalMonths / 12).toString();
            monthOfExperience = (totalMonths % 12).toString();
          }
        }
        
        // Handle company name
        const companyName = apiData.companyName || '';
        
        // Set showExperienceFields based on experienceLevel
        const showExpFields = experienceLevel === 'Experience';
        
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
          experienceLevel: experienceLevel,
          companyName: companyName,
          yearOfExperience: yearOfExperience,
          monthOfExperience: monthOfExperience,
          permanentAddress: apiData.permanentAddress || '',
          currentAddress: apiData.currentAddress || '',
          referenceName1: apiData.referenceName1 || '',
          referenceMobile1: apiData.referenceMobile1 || '',
          referenceName2: apiData.referenceName2 || '',
          referenceMobile2: apiData.referenceMobile2 || '',
          userId: apiData.userId || apiData._id || '',
          categoryIds: categoryIds,
          cityId: cityId,
          profileImage: profileImage,
        };
        
        setFormData(updatedFormData);
        setShowExperienceFields(showExpFields);
        
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
      await fetchCategories();
      await fetchCities();
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
      await fetchCities();
      await fetchProfileData();
      // Toast.show({
      //   type: 'success',
      //   text1: 'Profile data refreshed',
      //   text2: 'Latest data loaded successfully',
      // });
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
  let errorMessage = '';
  let errorField = '';

  if (!formData.name.trim()) {
    newErrors.name = 'Name is required';
    if (!errorMessage) {
      errorMessage = 'Name is required';
      errorField = 'name';
    }
  }

  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
    if (!errorMessage) {
      errorMessage = 'Email is required';
      errorField = 'email';
    }
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Enter a valid email address';
    if (!errorMessage) {
      errorMessage = 'Enter a valid email address';
      errorField = 'email';
    }
  }

  if (!formData.dob) {
    newErrors.dob = 'Date of birth is required';
    if (!errorMessage) {
      errorMessage = 'Date of birth is required';
      errorField = 'dob';
    }
  } else {
    const today = new Date();
    const birthDate = new Date(formData.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) {
      newErrors.dob = 'You must be at least 18 years old';
      if (!errorMessage) {
        errorMessage = 'You must be at least 18 years old';
        errorField = 'dob';
      }
    }
  }

  // Validate category selection
  if (formData.categoryIds.length === 0) {
    newErrors.category = 'Service category is required';
    if (!errorMessage) {
      errorMessage = 'Service category is required';
      errorField = 'category';
    }
  }

  // Validate city selection
  if (!formData.cityId) {
    newErrors.city = 'City is required';
    if (!errorMessage) {
      errorMessage = 'City is required';
      errorField = 'city';
    }
  }

  // Validate at least one reference
  if (!formData.referenceName1.trim() && !formData.referenceName2.trim()) {
    newErrors.references = 'At least one reference is required';
    if (!errorMessage) {
      errorMessage = 'At least one reference is required';
      errorField = 'references';
    }
  }

  // Validate reference mobile numbers if names are provided
  if (formData.referenceName1.trim() && !formData.referenceMobile1.trim()) {
    newErrors.referenceMobile1 = 'Reference mobile number is required';
    if (!errorMessage) {
      errorMessage = 'Reference 1 mobile number is required';
      errorField = 'referenceMobile1';
    }
  } else if (formData.referenceMobile1 && !/^\d{10}$/.test(formData.referenceMobile1)) {
    newErrors.referenceMobile1 = 'Enter a valid 10-digit mobile number';
    if (!errorMessage) {
      errorMessage = 'Enter a valid 10-digit mobile number for Reference 1';
      errorField = 'referenceMobile1';
    }
  }

  if (formData.referenceName2.trim() && !formData.referenceMobile2.trim()) {
    newErrors.referenceMobile2 = 'Reference mobile number is required';
    if (!errorMessage) {
      errorMessage = 'Reference 2 mobile number is required';
      errorField = 'referenceMobile2';
    }
  } else if (formData.referenceMobile2 && !/^\d{10}$/.test(formData.referenceMobile2)) {
    newErrors.referenceMobile2 = 'Enter a valid 10-digit mobile number';
    if (!errorMessage) {
      errorMessage = 'Enter a valid 10-digit mobile number for Reference 2';
      errorField = 'referenceMobile2';
    }
  }

  // Validate experience fields if Experience is selected
  if (formData.experienceLevel === 'Experience') {
    if (!formData.yearOfExperience) {
      newErrors.yearOfExperience = 'Years of experience is required';
      if (!errorMessage) {
        errorMessage = 'Years of experience is required';
        errorField = 'yearOfExperience';
      }
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
      if (!errorMessage) {
        errorMessage = 'Company name is required';
        errorField = 'companyName';
      }
    }
  }

  // Validate permanent address
  if (!formData.permanentAddress.trim()) {
    newErrors.permanentAddress = 'Permanent address is required';
    if (!errorMessage) {
      errorMessage = 'Permanent address is required';
      errorField = 'permanentAddress';
    }
  } else if (formData.permanentAddress.trim().length < 10) {
    newErrors.permanentAddress = 'Permanent address must be at least 10 characters';
    if (!errorMessage) {
      errorMessage = 'Permanent address must be at least 10 characters';
      errorField = 'permanentAddress';
    }
  }

  // Validate current address
  if (!formData.currentAddress.trim()) {
    newErrors.currentAddress = 'Current address is required';
    if (!errorMessage) {
      errorMessage = 'Current address is required';
      errorField = 'currentAddress';
    }
  } else if (formData.currentAddress.trim().length < 10) {
    newErrors.currentAddress = 'Current address must be at least 10 characters';
    if (!errorMessage) {
      errorMessage = 'Current address must be at least 10 characters';
      errorField = 'currentAddress';
    }
  }


  setErrors(newErrors);
  
  return {
    isValid: Object.keys(newErrors).length === 0,
    message: errorMessage,
    field: errorField
  };
};
 
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dob: selectedDate });
    }
  };

  const handleCategorySelect = (categoryId) => {
    setFormData({ ...formData, categoryIds: [categoryId] });
    setShowCategoriesModal(false);
  };

  const handleCitySelect = (cityId) => {
    setFormData({ ...formData, cityId });
    setShowCitiesModal(false);
  };

  const handleExperienceLevelChange = (level) => {
    const updatedFormData = { ...formData, experienceLevel: level };
    
    if (level === 'Fresher') {
      updatedFormData.yearOfExperience = '';
      updatedFormData.monthOfExperience = '';
      updatedFormData.companyName = '';
      setShowExperienceFields(false);
    } else {
      setShowExperienceFields(true);
    }
    
    setFormData(updatedFormData);
    
    if (errors.yearOfExperience) {
      setErrors({ ...errors, yearOfExperience: '' });
    }
    if (errors.companyName) {
      setErrors({ ...errors, companyName: '' });
    }
  };

  const handleUpdateProfile = async () => {
    const validation = validateForm();
  
    if (!validation.isValid) {
      // Toast show karein
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: validation.message,
        position: 'top',
        visibilityTime: 4000,
      });
      
      // Optionally, error field par scroll karein
      // Agar aap scroll functionality add karna chahte hain to neeche ka code use karein
      // scrollToErrorField(validation.field);
      
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('mobile', formData.mobile);
      
      if (formData.dob) {
        formDataToSend.append('dob', formData.dob.toISOString().split('T')[0]);
      }
      
      formDataToSend.append('experienceLevel', formData.experienceLevel);
      formDataToSend.append('companyName', formData.companyName);
      
      let totalMonths = 0;
      if (formData.experienceLevel === 'Experience') {
        const years = parseInt(formData.yearOfExperience) || 0;
        const months = parseInt(formData.monthOfExperience) || 0;
        totalMonths = (years * 12) + months;
      }
      formDataToSend.append('yearOfExperience', totalMonths / 12);
      
      formDataToSend.append('permanentAddress', formData.permanentAddress);
      formDataToSend.append('currentAddress', formData.currentAddress);
      formDataToSend.append('referenceName1', formData.referenceName1);
      formDataToSend.append('referenceMobile1', formData.referenceMobile1);
      formDataToSend.append('referenceName2', formData.referenceName2);
      formDataToSend.append('referenceMobile2', formData.referenceMobile2);
      formDataToSend.append('userId', formData.userId);
      
      // Add categoryIds
      formData.categoryIds.forEach((categoryId, index) => {
        formDataToSend.append(`categoryIds[${index}]`, categoryId);
      });
      
      // Add cityId
      if (formData.cityId) {
        formDataToSend.append('city', formData.cityId);
      }
      
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
        await fetchProfileData();
        await fetchProfile();
        
        Toast.show({
          type: 'success',
          text1: response.message || 'Profile updated successfully',
        });

        if(!user.kyc) {
          navigate('KycScreen',{type:type});
        } else {
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

  // Get selected category name for display
  const getSelectedCategoryName = () => {
    if (formData.categoryIds.length === 0) return null;
    const selectedCategory = allCategories.find(category => category._id === formData.categoryIds[0]);
    return selectedCategory ? selectedCategory.name : null;
  };

  // Get selected city name for display
  const getSelectedCityName = () => {
    if (!formData.cityId) return null;
    const selectedCity = allCities.find(city => city._id === formData.cityId);
    return selectedCity ? selectedCity.name : null;
  };

  // Render single category selection
  const renderSingleCategorySelection = () => {
    const selectedCategoryName = getSelectedCategoryName();

    return (
      <View style={clsx(styles.mb4)}>
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
          Service Category
        </Text>
        
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
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.flex1)}>
            {selectedCategoryName ? (
              <View style={clsx(
                styles.bgPrimaryLight,
                styles.px2,
                styles.py1,
                styles.rounded,
                styles.flexRow,
                styles.itemsCenter
              )}>
                <Text style={clsx(styles.textBase, styles.textWhite)}>
                  {selectedCategoryName}
                </Text>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setFormData({ ...formData, categoryIds: [] });
                  }}
                  style={clsx(styles.ml2)}
                >
                  <Icon name="close" size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={clsx(styles.textBase, styles.textMuted)}>
                Select service category...
              </Text>
            )}
          </View>
          <Icon name="arrow-drop-down" size={24} color={colors.textMuted} />
        </TouchableOpacity>

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
                  Select Service Category
                </Text>
                <TouchableOpacity onPress={() => setShowCategoriesModal(false)}>
                  <Icon name="close" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>

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

              <FlatList
                keyboardShouldPersistTaps="handled"
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
                      onPress={() => handleCategorySelect(item._id)}
                    >
                      <View style={clsx(
                        styles.w6,
                        styles.h6,
                        styles.roundedFull,
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

              <View style={clsx(
                styles.flexRow,
                styles.justifyEnd,
                styles.p4,
                styles.borderT,
                styles.borderGrayLight
              )}>
                <TouchableOpacity
                  style={clsx(styles.bgGray, styles.px4, styles.py2, styles.rounded, styles.mr2)}
                  onPress={() => setShowCategoriesModal(false)}
                >
                  <Text style={clsx(styles.textBase, styles.textBlack, styles.fontMedium)}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={clsx(styles.bgPrimary, styles.px4, styles.py2, styles.rounded)}
                  onPress={() => setShowCategoriesModal(false)}
                >
                  <Text style={clsx(styles.textBase, styles.textWhite, styles.fontMedium)}>
                    Select
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  // Render single city selection
  const renderSingleCitySelection = () => {
    const selectedCityName = getSelectedCityName();

    return (
      <View style={clsx(styles.mb4)}>
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
          City
        </Text>
        
        <TouchableOpacity
          style={clsx(
            styles.input,
            styles.flexRow,
            styles.justifyBetween,
            styles.itemsCenter,
            styles.p2,
            { minHeight: 50 }
          )}
          onPress={() => setShowCitiesModal(true)}
          activeOpacity={0.7}
        >
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.flex1)}>
            {selectedCityName ? (
              <View style={clsx(
                styles.bgPrimaryLight,
                styles.px2,
                styles.py1,
                styles.rounded,
                styles.flexRow,
                styles.itemsCenter
              )}>
                <Text style={clsx(styles.textBase, styles.textWhite)}>
                  {selectedCityName}
                </Text>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setFormData({ ...formData, cityId: '' });
                  }}
                  style={clsx(styles.ml2)}
                >
                  <Icon name="close" size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={clsx(styles.textBase, styles.textMuted)}>
                Select city...
              </Text>
            )}
          </View>
          <Icon name="arrow-drop-down" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Cities Modal */}
        <Modal
          visible={showCitiesModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCitiesModal(false)}
        >
          <View style={[
            clsx(styles.flex1, styles.justifyCenter, styles.itemsCenter),
            { backgroundColor: 'rgba(0,0,0,0.5)' }
          ]}>
            <View style={[
              clsx(styles.bgWhite, styles.roundedLg, styles.w11_12),
              { maxHeight: '80%' }
            ]}>
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
                  Select City
                </Text>
                <TouchableOpacity onPress={() => setShowCitiesModal(false)}>
                  <Icon name="close" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>

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
                    placeholder="Search cities..."
                    value={citySearchQuery}
                    onChangeText={setCitySearchQuery}
                    placeholderTextColor={colors.textMuted}
                    autoFocus={true}
                  />
                  {citySearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setCitySearchQuery('')}>
                      <Icon name="clear" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <FlatList
                keyboardShouldPersistTaps="handled"
                data={filteredCities}
                keyExtractor={(item) => item._id}
                style={clsx(styles.px4)}
                contentContainerStyle={clsx(styles.pb4)}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = formData.cityId === item._id;
                  return (
                    <TouchableOpacity
                      style={clsx(
                        styles.flexRow,
                        styles.itemsCenter,
                        styles.py3,
                        styles.borderB,
                        styles.borderGrayLight
                      )}
                      onPress={() => handleCitySelect(item._id)}
                    >
                      <View style={clsx(
                        styles.w6,
                        styles.h6,
                        styles.roundedFull,
                        styles.border2,
                        styles.mr3,
                        isSelected ? clsx(styles.bgPrimary, styles.borderPrimary) : clsx(styles.borderGray)
                      )}>
                        {isSelected && (
                          <Icon name="check" size={16} color={colors.white} />
                        )}
                      </View>
                      <View style={clsx(styles.flex1)}>
                        <Text style={clsx(
                          styles.textBase,
                          styles.fontMedium,
                          isSelected ? styles.textPrimary : styles.textBlack
                        )}>
                          {item.name}
                        </Text>
                        {(item.state || item.country) && (
                          <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                            {item.state && item.country ? `${item.state}, ${item.country}` : (item.state || item.country)}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={clsx(styles.py6, styles.itemsCenter)}>
                    <Icon name="location-off" size={40} color={colors.textMuted} />
                    <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2)}>
                      No cities found
                    </Text>
                  </View>
                }
              />

              <View style={clsx(
                styles.flexRow,
                styles.justifyEnd,
                styles.p4,
                styles.borderT,
                styles.borderGrayLight
              )}>
                <TouchableOpacity
                  style={clsx(styles.bgGray, styles.px4, styles.py2, styles.rounded, styles.mr2)}
                  onPress={() => setShowCitiesModal(false)}
                >
                  <Text style={clsx(styles.textBase, styles.textBlack, styles.fontMedium)}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={clsx(styles.bgPrimary, styles.px4, styles.py2, styles.rounded)}
                  onPress={() => setShowCitiesModal(false)}
                >
                  <Text style={clsx(styles.textBase, styles.textWhite, styles.fontMedium)}>
                    Select
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
      keyboardShouldPersistTaps="handled"
    >
      <Header
        title="Profile"
        showBack={type=='new'?false:true}
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
            ) : (
              <View style={clsx(styles.w32, styles.h32, styles.roundedFull, styles.bgGray, styles.border2, styles.borderWhite, styles.justifyCenter, styles.itemsCenter, styles.shadowMd)}>
                <Icon name="person" size={60} color={colors.textMuted} />
              </View>
            )}
            
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
              style={clsx(styles.flexRow, styles.itemsCenter,styles.mr4, styles.p2, styles.bgPrimary, styles.rounded)}
              onPress={selectProfileImage}
            >
              <Icon name="photo-library" size={20} color={colors.white} />
              <Text style={clsx(styles.textSm, styles.textWhite, styles.ml1)}>
                Gallery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={clsx(styles.flexRow, styles.itemsCenter,styles.mr4, styles.p2, styles.bgPrimary, styles.rounded)}
              onPress={captureProfileImage}
            >
              <Icon name="camera-alt" size={20} color={colors.white} />
              <Text style={clsx(styles.textSm, styles.textWhite, styles.ml1)}>
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

          {/* Service Category */}
          {renderSingleCategorySelection()}
          {errors.category && (
            <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
              {errors.category}
            </Text>
          )}

          {/* City Selection */}
          {renderSingleCitySelection()}
          {errors.city && (
            <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
              {errors.city}
            </Text>
          )}

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
                styles.itemsCenter,
                errors.dob && styles.borderError
              )}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={clsx(styles.textBase, formData.dob ? styles.textBlack : styles.textMuted)}>
                {formatDate(formData.dob)}
              </Text>
              <Icon name="calendar-today" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            {errors.dob && (
              <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                {errors.dob}
              </Text>
            )}
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
              {['Fresher', 'Experience'].map((level) => (
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
                  onPress={() => handleExperienceLevelChange(level)}
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

          {/* Experience Fields */}
          {showExperienceFields && (
            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Professional Experience
              </Text>
              
              <View style={clsx(styles.flexRow, styles.mb4)}>
                <View style={clsx(styles.flex1, styles.mr2)}>
                  <Text style={clsx(styles.textSm, styles.textBlack, styles.mb1)}>
                    Years
                  </Text>
                  <View style={clsx(styles.flexRow, styles.flexWrap)}>
                    {yearsOptions.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={clsx(
                          styles.px3,
                          styles.py2,
                          styles.mr1,
                          styles.mb1,
                          styles.roundedFull,
                          formData.yearOfExperience === year ?
                            styles.bgPrimary :
                            styles.bgGray
                        )}
                        onPress={() => {
                          setFormData({ ...formData, yearOfExperience: year });
                          if (errors.yearOfExperience) {
                            setErrors({ ...errors, yearOfExperience: '' });
                          }
                        }}
                      >
                        <Text style={clsx(
                          styles.textSm,
                          styles.fontMedium,
                          formData.yearOfExperience === year ?
                            styles.textWhite :
                            styles.textBlack
                        )}>
                          {year} {year === '1' ? 'Year' : 'Years'}
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
                
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textSm, styles.textBlack, styles.mb1)}>
                    Months
                  </Text>
                  <View style={clsx(styles.flexRow, styles.flexWrap)}>
                    {monthsOptions.map((month) => (
                      <TouchableOpacity
                        key={month}
                        style={clsx(
                          styles.px3,
                          styles.py2,
                          styles.mr1,
                          styles.mb1,
                          styles.roundedFull,
                          formData.monthOfExperience === month ?
                            styles.bgPrimary :
                            styles.bgGray
                        )}
                        onPress={() => setFormData({ ...formData, monthOfExperience: month })}
                      >
                        <Text style={clsx(
                          styles.textSm,
                          styles.fontMedium,
                          formData.monthOfExperience === month ?
                            styles.textWhite :
                            styles.textBlack
                        )}>
                          {month} {month === '1' ? 'Month' : 'Months'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {renderInputField('Company Name', 'companyName', 'Enter your company name')}
            </View>
          )}
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
            References (At least one required)
          </Text>

          {errors.references && (
            <Text style={clsx(styles.textSm, styles.textError, styles.mb2)}>
              {errors.references}
            </Text>
          )}

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
                onChangeText={(text) => {
                  setFormData({ ...formData, referenceName1: text });
                  if (errors.references) {
                    setErrors({ ...errors, references: '' });
                  }
                }}
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
                onChangeText={(text) => {
                  setFormData({ ...formData, referenceName2: text });
                  if (errors.references) {
                    setErrors({ ...errors, references: '' });
                  }
                }}
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