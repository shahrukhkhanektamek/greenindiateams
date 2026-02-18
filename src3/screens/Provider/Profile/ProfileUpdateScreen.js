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
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showExperienceFields, setShowExperienceFields] = useState(false);
  
  // Track selected main categories separately for UI
  const [selectedMainCategories, setSelectedMainCategories] = useState([]);

  // Initial profile data - SEPARATED categoryIds and subCategoryIds
  const initialProfileData = {
    name: '',
    email: '',
    mobile: '',
    dob: '',
    gender: '',
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
    categoryIds: [],      // Stores ONLY main category IDs
    subCategoryIds: [],   // Stores ONLY subcategory IDs
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
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.subcategories || []).some(sub => 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
      subcategories: (category.subcategories || []).map(sub => ({
        _id: sub._id,
        id: sub._id,
        name: sub.name,
        categoryId: category._id,
        categoryName: category.name
      })),
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

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Check if a main category is selected
  const isMainCategorySelected = (categoryId) => {
    return formData.categoryIds.includes(categoryId); // Only checks categoryIds
  };

  // Check if a subcategory is selected
  const isSubcategorySelected = (subcategoryId) => {
    return formData.subCategoryIds.includes(subcategoryId); // Only checks subCategoryIds
  };

  // Check if all subcategories of a category are selected
  const areAllSubcategoriesSelected = (category) => {
    if (!category.subcategories || category.subcategories.length === 0) return false;
    return category.subcategories.every(sub => 
      formData.subCategoryIds.includes(sub._id) // Only check subCategoryIds
    );
  };

  // Check if some subcategories are selected
  const areSomeSubcategoriesSelected = (category) => {
    if (!category.subcategories || category.subcategories.length === 0) return false;
    return category.subcategories.some(sub => formData.subCategoryIds.includes(sub._id)) && 
           !areAllSubcategoriesSelected(category);
  };

  // UPDATED: Handle subcategory selection - ONLY modifies subCategoryIds
  const handleSubcategorySelect = (subcategoryId, categoryId, categoryName) => {
    const newSubCategoryIds = [...formData.subCategoryIds];
    const subcategoryIndex = newSubCategoryIds.indexOf(subcategoryId);
    
    if (subcategoryIndex > -1) {
      // Remove subcategory
      newSubCategoryIds.splice(subcategoryIndex, 1);
      
      // Check if this was the last subcategory of this category
      const category = allCategories.find(c => c._id === categoryId);
      if (category) {
        const remainingSubsFromThisCat = newSubCategoryIds.filter(id => 
          category.subcategories.some(sub => sub._id === id)
        );
        
        // If no subcategories remain from this category, remove the main category
        if (remainingSubsFromThisCat.length === 0) {
          setFormData(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.filter(id => id !== categoryId), // Remove main category
            subCategoryIds: newSubCategoryIds // Only subcategories
          }));
        } else {
          setFormData(prev => ({ 
            ...prev, 
            subCategoryIds: newSubCategoryIds // Only update subcategories
          }));
        }
      }
    } else {
      // Add subcategory
      newSubCategoryIds.push(subcategoryId);
      
      // Auto-select the main category if not already selected
      if (!formData.categoryIds.includes(categoryId)) {
        setFormData(prev => ({
          ...prev,
          categoryIds: [...prev.categoryIds, categoryId], // Add main category
          subCategoryIds: newSubCategoryIds // Add subcategory
        }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          subCategoryIds: newSubCategoryIds // Only add subcategory
        }));
      }
    }
  };

  // UPDATED: Handle main category selection - modifies categoryIds, never adds main to subCategoryIds
  const handleMainCategorySelect = (categoryId, category) => {
    const isSelected = formData.categoryIds.includes(categoryId);
    let newCategoryIds = [...formData.categoryIds];
    let newSubCategoryIds = [...formData.subCategoryIds];
    
    if (isSelected) {
      // Deselect main category and all its subcategories
      newCategoryIds = newCategoryIds.filter(id => id !== categoryId);
      newSubCategoryIds = newSubCategoryIds.filter(id => 
        !category.subcategories.some(sub => sub._id === id)
      );
    } else {
      // Select main category - add to categoryIds ONLY
      newCategoryIds.push(categoryId);
      
      // Add all subcategories - add to subCategoryIds ONLY
      category.subcategories.forEach(sub => {
        if (!newSubCategoryIds.includes(sub._id)) {
          newSubCategoryIds.push(sub._id);
        }
      });
    }
    
    setFormData({
      ...formData,
      categoryIds: newCategoryIds,      // Only main categories
      subCategoryIds: newSubCategoryIds // Only subcategories
    });
  };

  // UPDATED: Handle select/deselect all subcategories
  const handleSelectAllSubcategories = (categoryId, subcategories) => {
    const category = allCategories.find(c => c._id === categoryId);
    if (!category) return;
    
    let newCategoryIds = [...formData.categoryIds];
    let newSubCategoryIds = [...formData.subCategoryIds];
    const subcategoryIds = subcategories.map(sub => sub._id);
    
    // Check if all subcategories are selected
    const allSelected = subcategoryIds.every(id => newSubCategoryIds.includes(id));
    
    if (allSelected) {
      // Deselect all subcategories - remove from subCategoryIds ONLY
      newSubCategoryIds = newSubCategoryIds.filter(id => !subcategoryIds.includes(id));
      
      // If no subcategories remain from this category, remove main category
      const remainingSubsFromThisCat = newSubCategoryIds.filter(id => 
        category.subcategories.some(sub => sub._id === id)
      );
      
      if (remainingSubsFromThisCat.length === 0) {
        newCategoryIds = newCategoryIds.filter(id => id !== categoryId);
      }
    } else {
      // Select all subcategories - add to subCategoryIds ONLY
      subcategoryIds.forEach(id => {
        if (!newSubCategoryIds.includes(id)) {
          newSubCategoryIds.push(id);
        }
      });
      
<<<<<<< HEAD
      setSelectedMainCategories(mainsToSelect);
    }
  }, [allCategories, formData.categoryIds]);

  // Update the handleCitySelect function with better error handling
  const handleCitySelect = (cityId) => {
    try {
      // Validate that the city exists
      const selectedCity = allCities.find(city => city._id === cityId);
      
      if (selectedCity) {
        setFormData({ ...formData, cityId: selectedCity._id });
        setShowCitiesModal(false);
        
        // Clear any city errors if they exist
        if (errors.city) {
          setErrors({ ...errors, city: '' });
        }
      } else {
        console.warn('Selected city not found in cities list:', cityId);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid city selected',
        });
      }
    } catch (error) {
      console.error('Error in handleCitySelect:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to select city',
      });
    }
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
=======
      // Ensure main category is selected (add to categoryIds ONLY)
      if (!newCategoryIds.includes(categoryId)) {
        newCategoryIds.push(categoryId);
      }
>>>>>>> e251e59f6b7a98a5d260b57b6789ece20fd3e546
    }
    
    setFormData({
      ...formData,
      categoryIds: newCategoryIds,      // Only main categories
      subCategoryIds: newSubCategoryIds // Only subcategories
    });
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
        
        // Initialize expanded state for all categories
        const initialExpanded = {};
        categories.forEach(cat => {
          initialExpanded[cat._id] = false;
        });
        setExpandedCategories(initialExpanded);
        
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
      console.log('Fetching cities...');
      const citiesResponse = await postData({}, Urls.cityList, 'GET', { 
        showErrorMessage: false, showSuccessMessage: false
      });
      
      console.log('Cities response:', citiesResponse);
      
      if (citiesResponse?.success && citiesResponse?.data) {
        let cities = [];
        
        if (Array.isArray(citiesResponse.data)) {
          cities = extractCitiesFromResponse(citiesResponse.data);
          console.log('Extracted cities:', cities.length);
        } else {
          console.warn('Cities data is not an array:', citiesResponse.data);
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
        console.warn('Cities API failed:', citiesResponse);
        return false;
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      return false;
    }
  };

  // UPDATED: Fetch profile data and separate categoryIds and subCategoryIds
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
        
        // SEPARATE categoryIds and subCategoryIds - STRICT SEPARATION
        let categoryIds = [];
        let subCategoryIds = [];
        
        if (apiData.categoryIds && apiData.categoryIds.length > 0) {
          let allIds = [];
          if (Array.isArray(apiData.categoryIds)) {
            allIds = apiData.categoryIds;
          } else if (typeof apiData.categoryIds === 'string') {
            try {
              const parsed = JSON.parse(apiData.categoryIds);
              allIds = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              const split = apiData.categoryIds.split(',').map(id => id.trim());
              allIds = split;
            }
          }
          
          // Separate into categories and subcategories based on allCategories data
          if (allCategories.length > 0) {
            allIds.forEach(id => {
              const isMainCategory = allCategories.some(cat => cat._id === id);
              const isSubCategory = allCategories.some(cat => 
                cat.subcategories.some(sub => sub._id === id)
              );
              
              if (isMainCategory) {
                categoryIds.push(id); // Only main categories go here
              } else if (isSubCategory) {
                subCategoryIds.push(id); // Only subcategories go here
              }
              // Ignore if neither (invalid ID)
            });
          } else {
            // If categories not loaded yet, store in temp and separate later
            // But ensure we don't accidentally put main categories in subCategoryIds
            setFormData(prev => ({ 
              ...prev, 
              tempIds: allIds // Use a temp field if needed
            }));
          }
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
          mobile: apiData.user.mobile || '',
          dob: dob || '',
          gender: apiData.gender || '',
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
          categoryIds: apiData.categoryIds,      // Only main categories
          subCategoryIds: apiData.subCategoryIds, // Only subcategories
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

  // UPDATED: Effect to separate category and subcategory IDs when allCategories loads
  useEffect(() => {
    if (allCategories.length > 0 && formData.tempIds?.length > 0) {
      // Separate the temporary IDs into proper categories and subcategories
      const newCategoryIds = [];
      const newSubCategoryIds = [];
      
      formData.tempIds.forEach(id => {
        const isMainCategory = allCategories.some(cat => cat._id === id);
        const isSubCategory = allCategories.some(cat => 
          cat.subcategories.some(sub => sub._id === id)
        );
        
        if (isMainCategory) {
          newCategoryIds.push(id); // Only main categories
        } else if (isSubCategory) {
          newSubCategoryIds.push(id); // Only subcategories
        }
      });
      
      setFormData(prev => ({
        ...prev,
        categoryIds: [...new Set([...prev.categoryIds, ...newCategoryIds])], // Ensure unique
        subCategoryIds: newSubCategoryIds, // Only subcategories
        tempIds: undefined // Clear temp data
      }));
    }
  }, [allCategories]);



  // Update selectedMainCategories for UI whenever categoryIds changes
  useEffect(() => {
    setSelectedMainCategories(formData.categoryIds);
  }, [formData.categoryIds]);

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
        // console.log('User cancelled image picker');
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
        // console.log('User cancelled camera');
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
  
    // 1. Service Category validation - check both categoryIds and subCategoryIds
    if (formData.categoryIds.length === 0 && formData.subCategoryIds.length === 0) {
      newErrors.category = 'At least one service category or subcategory is required';
      if (!errorMessage) {
        errorMessage = 'Please select at least one service category or subcategory';
        errorField = 'category';
      }
    }
  
    // 2. City validation
    if (!formData.cityId) {
      newErrors.city = 'City is required';
      if (!errorMessage) {
        errorMessage = 'Please select your city';
        errorField = 'city';
      }
    }
  
    // 3. Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      if (!errorMessage) {
        errorMessage = 'Please enter your full name';
        errorField = 'name';
      }
    }
  
    // 4. Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      if (!errorMessage) {
        errorMessage = 'Please enter your email address';
        errorField = 'email';
      }
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
      if (!errorMessage) {
        errorMessage = 'Please enter a valid email address';
        errorField = 'email';
      }
    }
  
    // 5. Date of Birth validation + age check
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
      if (!errorMessage) {
        errorMessage = 'Please select your date of birth';
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
  
    // 6. Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
      if (!errorMessage) {
        errorMessage = 'Please select your gender';
        errorField = 'gender';
      }
    }
  
    // 7. Experience fields validation (if Experience is selected)
    if (formData.experienceLevel === 'Experience') {
      if (!formData.yearOfExperience) {
        newErrors.yearOfExperience = 'Years of experience is required';
        if (!errorMessage) {
          errorMessage = 'Please select years of experience';
          errorField = 'yearOfExperience';
        }
      }
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
        if (!errorMessage) {
          errorMessage = 'Please enter your company name';
          errorField = 'companyName';
        }
      }
    }
  
    // 8. Permanent Address validation
    if (!formData.permanentAddress.trim()) {
      newErrors.permanentAddress = 'Permanent address is required';
      if (!errorMessage) {
        errorMessage = 'Please enter your permanent address';
        errorField = 'permanentAddress';
      }
    } else if (formData.permanentAddress.trim().length < 10) {
      newErrors.permanentAddress = 'Permanent address must be at least 10 characters';
      if (!errorMessage) {
        errorMessage = 'Permanent address must be at least 10 characters';
        errorField = 'permanentAddress';
      }
    }
  
    // 9. Current Address validation
    if (!formData.currentAddress.trim()) {
      newErrors.currentAddress = 'Current address is required';
      if (!errorMessage) {
        errorMessage = 'Please enter your current address';
        errorField = 'currentAddress';
      }
    } else if (formData.currentAddress.trim().length < 10) {
      newErrors.currentAddress = 'Current address must be at least 10 characters';
      if (!errorMessage) {
        errorMessage = 'Current address must be at least 10 characters';
        errorField = 'currentAddress';
      }
    }
  
    // 10. References validation - at least one required
    if (!formData.referenceName1.trim() && !formData.referenceName2.trim()) {
      newErrors.references = 'At least one reference is required';
      if (!errorMessage) {
        errorMessage = 'Please add at least one reference';
        errorField = 'references';
      }
    }
  
    // 11. Reference 1 mobile validation
    if (formData.referenceName1.trim() && !formData.referenceMobile1.trim()) {
      newErrors.referenceMobile1 = 'Reference mobile number is required';
      if (!errorMessage) {
        errorMessage = 'Please enter mobile number for Reference 1';
        errorField = 'referenceMobile1';
      }
    } else if (formData.referenceMobile1 && !/^\d{10}$/.test(formData.referenceMobile1)) {
      newErrors.referenceMobile1 = 'Enter a valid 10-digit mobile number';
      if (!errorMessage) {
        errorMessage = 'Please enter a valid 10-digit mobile number for Reference 1';
        errorField = 'referenceMobile1';
      }
    }
  
    // 12. Reference 2 mobile validation
    if (formData.referenceName2.trim() && !formData.referenceMobile2.trim()) {
      newErrors.referenceMobile2 = 'Reference mobile number is required';
      if (!errorMessage) {
        errorMessage = 'Please enter mobile number for Reference 2';
        errorField = 'referenceMobile2';
      }
    } else if (formData.referenceMobile2 && !/^\d{10}$/.test(formData.referenceMobile2)) {
      newErrors.referenceMobile2 = 'Enter a valid 10-digit mobile number';
      if (!errorMessage) {
        errorMessage = 'Please enter a valid 10-digit mobile number for Reference 2';
        errorField = 'referenceMobile2';
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

  // UPDATED: Handle update profile with separate categoryIds and subCategoryIds
  const handleUpdateProfile = async () => {
    const validation = validateForm();
  
    if (!validation.isValid) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: validation.message,
        position: 'top',
        visibilityTime: 4000,
      });
      
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
      
      formDataToSend.append('gender', formData.gender);
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
      
      // Add categoryIds (ONLY main categories)
      formData.categoryIds.forEach((categoryId, index) => {
        formDataToSend.append(`categoryIds[${index}]`, categoryId);
      });

      // Add subCategoryIds (ONLY subcategories)
      formData.subCategoryIds.forEach((subCategoryId, index) => {
        formDataToSend.append(`subCategoryIds[${index}]`, subCategoryId);
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

        if (!user.kyc) {
          reset('KycScreen', { type: type });
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
      </View>
    );
  };

  // UPDATED: Get selected items summary for display
  const getSelectedItemsSummary = () => {
    if (formData.categoryIds.length === 0 && formData.subCategoryIds.length === 0) {
      return { text: 'No categories selected', count: 0 };
    }
    
    // Get category names for better display
    const categoryNames = formData.categoryIds.map(id => {
      const cat = allCategories.find(c => c._id === id);
      return cat ? cat.name : '';
    }).filter(name => name).join(', ');
    
    const subCategoryCount = formData.subCategoryIds.length;
    
    return {
      text: `${formData.categoryIds.length} ${formData.categoryIds.length === 1 ? 'category' : 'categories'}${subCategoryCount > 0 ? `, ${subCategoryCount} ${subCategoryCount === 1 ? 'subcategory' : 'subcategories'}` : ''}`,
      count: formData.categoryIds.length + formData.subCategoryIds.length,
      categoryNames: categoryNames
    };
  };

  // Get selected city name for display
  const getSelectedCityName = () => {
    if (!formData.cityId) return null;
    
    try {
      // Ensure allCities is an array and has items
      if (!Array.isArray(allCities) || allCities.length === 0) {
        return null;
      }
      
      const selectedCity = allCities.find(city => city && city._id === formData.cityId);
      return selectedCity ? selectedCity.name : null;
    } catch (error) {
      console.error('Error in getSelectedCityName:', error);
      return null;
    }
  };

  // Get category stats - strict separation
  const getCategoryStats = (category) => {
    const selectedSubs = category.subcategories?.filter(sub => 
      formData.subCategoryIds.includes(sub._id) // Only check subCategoryIds
    ) || [];
    
    const isMainSelected = formData.categoryIds.includes(category._id); // Only check categoryIds
    
    return {
      totalSubs: category.subcategories?.length || 0,
      selectedSubs: selectedSubs.length,
      isMainSelected,
      allSelected: selectedSubs.length === category.subcategories?.length,
      someSelected: selectedSubs.length > 0 && selectedSubs.length < category.subcategories?.length
    };
  };

  // Render category selection with improved UI
  const renderCategorySelection = () => {
    const summary = getSelectedItemsSummary();

    return (
      <View style={clsx(styles.mb4)}>
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
          Service Categories & Subcategories <Text style={clsx(styles.textError)}>*</Text>
        </Text>
        
        <TouchableOpacity
          style={clsx(
            styles.input,
            styles.flexRow,
            styles.justifyBetween,
            styles.itemsCenter,
            styles.p3,
            errors.category && styles.borderError,
            { minHeight: 60 }
          )}
          onPress={() => setShowCategoriesModal(true)}
          activeOpacity={0.7}
        >
          <View style={clsx(styles.flex1)}>
            {formData.categoryIds.length > 0 || formData.subCategoryIds.length > 0 ? (
              <>
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.flexWrap)}>
                  <View style={clsx(styles.bgPrimaryLight, styles.rounded, styles.px2, styles.py1, styles.mr2)}>
                    <Text style={clsx(styles.textSm, styles.textWhite, styles.fontBold)}>
                      {summary.count} Selected
                    </Text>
                  </View>
                  {formData.categoryIds.length > 0 && (
                    <Text style={clsx(styles.textSm, styles.textPrimary)}>
                      {formData.categoryIds.length} {formData.categoryIds.length === 1 ? 'Category' : 'Categories'}
                    </Text>
                  )}
                </View>
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)} numberOfLines={2}>
                  {formData.categoryIds.length > 0 && (
                    <Text>
                      Categories: {formData.categoryIds.map(id => {
                        const cat = allCategories.find(c => c._id === id);
                        return cat ? cat.name : '';
                      }).filter(name => name).join(', ')}
                    </Text>
                  )}
                  {formData.subCategoryIds.length > 0 && (
                    <Text>
                      {formData.categoryIds.length > 0 ? '\nSubcategories: ' : 'Subcategories: '}
                      {formData.subCategoryIds.length} selected
                    </Text>
                  )}
                </Text>
              </>
            ) : (
              <Text style={clsx(styles.textBase, styles.textMuted)}>
                Tap to select categories and subcategories...
              </Text>
            )}
          </View>
        </TouchableOpacity>
        
        {errors.category && (
          <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
            {errors.category}
          </Text>
        )}
      </View>
    );
  };

  // Render single city selection
  const renderSingleCitySelection = () => {
    const selectedCityName = getSelectedCityName();

    return (
      <View style={clsx(styles.mb4)}>
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
          City <Text style={clsx(styles.textError)}>*</Text>
        </Text>
        
        <TouchableOpacity
          style={clsx(
            styles.input,
            styles.flexRow,
            styles.justifyBetween,
            styles.itemsCenter,
            styles.p3,
            errors.city && styles.borderError,
            { minHeight: 60 }
          )}
          onPress={() => setShowCitiesModal(true)}
          activeOpacity={0.7}
        >
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.flex1)}>
            {selectedCityName ? (
              <>
                <Icon name="location-on" size={20} color={colors.primary} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textBase, styles.textBlack, styles.fontMedium)}>
                  {selectedCityName}
                </Text>
              </>
            ) : (
              <Text style={clsx(styles.textBase, styles.textMuted)}>
                Select your city...
              </Text>
            )}
          </View>
          {selectedCityName ? (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setFormData({ ...formData, cityId: '' });
              }}
              style={clsx(styles.mr2)}
            >
              <Icon name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
          <Icon name="arrow-drop-down" size={28} color={colors.primary} />
        </TouchableOpacity>
        
        {errors.city && (
          <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
            {errors.city}
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
      keyboardShouldPersistTaps="handled"
    >
      <Header
        title="Profile"
        showBack={type == 'new' ? false : true}
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
                  { width: 128, height: 128 },
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
              style={clsx(styles.flexRow, styles.itemsCenter, styles.mr4, styles.p2, styles.bgPrimary, styles.rounded)}
              onPress={selectProfileImage}
            >
              <Icon name="photo-library" size={20} color={colors.white} />
              <Text style={clsx(styles.textSm, styles.textWhite, styles.ml1)}>
                Gallery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={clsx(styles.flexRow, styles.itemsCenter, styles.mr4, styles.p2, styles.bgPrimary, styles.rounded)}
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

          {/* Service Category with Subcategories */}
          {renderCategorySelection()}

          {/* City Selection */}
          {renderSingleCitySelection()}

          {renderInputField('Full Name', 'name', 'Enter your full name')}

          {renderInputField('Email Address', 'email', 'Enter your email', {
            keyboardType: 'email-address',
          })}

          {/* Date of Birth */}
          <View style={clsx(styles.mb4)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
              Date of Birth <Text style={clsx(styles.textError)}>*</Text>
            </Text>
            <TouchableOpacity
              style={clsx(
                styles.input,
                styles.flexRow,
                styles.justifyBetween,
                styles.itemsCenter,
                styles.p3,
                errors.dob && styles.borderError
              )}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <Icon name="calendar-today" size={20} color={colors.primary} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textBase, formData.dob ? styles.textBlack : styles.textMuted)}>
                  {formatDate(formData.dob)}
                </Text>
              </View>
              <Icon name="arrow-drop-down" size={28} color={colors.primary} />
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
              Experience Level <Text style={clsx(styles.textError)}>*</Text>
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

          <View style={clsx(styles.mb4)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
              Gender <Text style={clsx(styles.textError)}>*</Text>
            </Text>
            <View style={clsx(styles.flexRow, styles.flexWrap)}>
              {['Male', 'Female', 'Other'].map((genderOption) => (
                <TouchableOpacity
                  key={genderOption}
                  style={clsx(
                    styles.px4,
                    styles.py2,
                    styles.mr2,
                    styles.mb2,
                    styles.roundedFull,
                    formData.gender === genderOption ?
                      styles.bgPrimary :
                      styles.bgGray
                  )}
                  onPress={() => {
                    setFormData({ ...formData, gender: genderOption });
                    if (errors.gender) {
                      setErrors({ ...errors, gender: '' });
                    }
                  }}
                >
                  <Text style={clsx(
                    styles.textSm,
                    styles.fontMedium,
                    formData.gender === genderOption ?
                      styles.textWhite :
                      styles.textBlack
                  )}>
                    {genderOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender && (
              <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
                {errors.gender}
              </Text>
            )}
          </View>

          {/* Experience Fields */}
          {showExperienceFields && (
            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Professional Experience <Text style={clsx(styles.textError)}>*</Text>
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
            Address Information <Text style={clsx(styles.textError)}>*</Text>
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
            References <Text style={clsx(styles.textError)}>*</Text>
          </Text>
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mb3)}>
            At least one reference is required
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
            <View style={clsx(styles.mb2)}>
              <TextInput
                style={clsx(
                  styles.input,
                  styles.mb2
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
              Reference 2 (Optional)
            </Text>
            <View style={clsx(styles.mb2)}>
              <TextInput
                style={clsx(
                  styles.input,
                  styles.mb2
                )}
                placeholder="Reference Name"
                placeholderTextColor={colors.textMuted}
                value={formData.referenceName2}
                onChangeText={(text) => {
                  setFormData({ ...formData, referenceName2: text });
                }}
              />
              <TextInput
                style={clsx(
                  styles.input,
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

      {/* Categories & Subcategories Modal - UPDATED to use separate arrays */}
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
            { maxHeight: '90%' }
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
              <View>
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textWhite)}>
                  Select Services
                </Text>
                <Text style={clsx(styles.textSm, styles.textWhite, styles.mt1)}>
                  Choose categories and subcategories
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowCategoriesModal(false)}>
                <Icon name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
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
                  placeholder="Search categories or subcategories..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={colors.textMuted}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Icon name="clear" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Selection Summary with better UI */}
            {(formData.categoryIds.length > 0 || formData.subCategoryIds.length > 0) && (
              <View style={clsx(styles.px4, styles.py2, styles.mb2)}>
                <View style={clsx(
                  styles.flexRow, 
                  styles.justifyBetween, 
                  styles.itemsCenter,
                  styles.bgPrimaryLight,
                  styles.rounded,
                  styles.px3,
                  styles.py2
                )}>
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    <Icon name="check-circle" size={20} color={colors.white} style={clsx(styles.mr2)} />
                    <Text style={clsx(styles.textSm, styles.textWhite, styles.fontMedium)}>
                      {formData.categoryIds.length + formData.subCategoryIds.length} {(formData.categoryIds.length + formData.subCategoryIds.length) === 1 ? 'item' : 'items'} selected
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setFormData({ 
                        ...formData, 
                        categoryIds: [], 
                        subCategoryIds: [] 
                      });
                    }}
                    style={clsx(styles.bgWhite, styles.px2, styles.py1, styles.rounded)}
                  >
                    <Text style={clsx(styles.textSm, styles.textPrimary, styles.fontBold)}>Clear All</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Categories List with improved visual hierarchy */}
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={filteredCategories}
              keyExtractor={(item) => item._id}
              style={clsx(styles.px4)}
              contentContainerStyle={clsx(styles.pb4)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const stats = getCategoryStats(item);
                const isExpanded = expandedCategories[item._id];
                const hasSubcategories = item.subcategories && item.subcategories.length > 0;
                
                return (
                  <View style={clsx(
                    styles.mb3, 
                    styles.border, 
                    styles.rounded,
                    stats.isMainSelected ? styles.borderPrimary : styles.borderGrayLight,
                    { borderWidth: stats.isMainSelected ? 2 : 1 }
                  )}>
                    {/* Category Header - redesigned for better UX */}
                    <TouchableOpacity
                      style={clsx(
                        styles.flexRow,
                        styles.itemsCenter,
                        styles.p3,
                        stats.isMainSelected && styles.bgPrimaryLight
                      )}
                      onPress={() => {
                        if (hasSubcategories) {
                          toggleCategory(item._id);
                        } else {
                          handleMainCategorySelect(item._id, item);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      {/* Selection Indicator with better visual feedback */}
                      {/* <TouchableOpacity
                        onPress={() => handleMainCategorySelect(item._id, item)}
                        style={clsx(styles.mr3)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <View style={clsx(
                          styles.w6,
                          styles.h6,
                          styles.rounded,
                          styles.justifyCenter,
                          styles.itemsCenter,
                          stats.isMainSelected ? 
                            clsx(styles.bgPrimary, styles.borderPrimary) : 
                            clsx(styles.border2, styles.borderGray)
                        )}>
                          {stats.isMainSelected && (
                            <Icon name="check" size={16} color={colors.white} />
                          )}
                        </View>
                      </TouchableOpacity> */}

                      {/* Category Info with progress indicator */}
                      <View style={clsx(styles.flex1)}>
                        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween)}>
                          <Text style={clsx(
                            styles.textBase,
                            styles.fontBold,
                            stats.isMainSelected ? styles.textPrimary : styles.textBlack
                          )}>
                            {item.name}
                          </Text>
                          {hasSubcategories && stats.selectedSubs > 0 && (
                            <View style={clsx(
                              styles.bgPrimary,
                              styles.rounded,
                              styles.px2,
                              styles.py1,
                              styles.ml2
                            )}>
                              <Text style={clsx(styles.textXs, styles.textWhite, styles.fontBold)}>
                                {stats.selectedSubs}/{stats.totalSubs}
                              </Text>
                            </View>
                          )}
                        </View>
                        
                        {hasSubcategories && (
                          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt1)}>
                            {/* Progress bar for subcategory selection */}
                            {stats.totalSubs > 0 && (
                              <View style={clsx(styles.flex1, styles.h1, styles.bgGrayLight, styles.rounded, styles.mr2)}>
                                <View 
                                  style={[
                                    clsx(styles.h1, styles.bgPrimary, styles.rounded),
                                    { width: `${(stats.selectedSubs / stats.totalSubs) * 100}%` }
                                  ]} 
                                />
                              </View>
                            )}
                            <Text style={clsx(styles.textXs, styles.textMuted)}>
                              {stats.selectedSubs} of {stats.totalSubs} selected
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Expand/Collapse Icon with badge for selected items */}
                      <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                        {hasSubcategories && (
                          <>
                            {stats.someSelected && !stats.allSelected && (
                              <View style={clsx(styles.w2, styles.h2, styles.bgPrimary, styles.roundedFull, styles.mr2)} />
                            )}
                            <Icon 
                              name={isExpanded ? "expand-less" : "expand-more"} 
                              size={24} 
                              color={stats.isMainSelected ? colors.primary : colors.textMuted} 
                            />
                          </>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Subcategories with improved layout */}
                    {isExpanded && hasSubcategories && (
                      <View style={clsx(styles.borderT, stats.isMainSelected ? styles.borderPrimary : styles.borderGrayLight)}>
                        {/* Select All Option - moved to top for better accessibility */}
                        <TouchableOpacity
                          style={clsx(
                            styles.flexRow,
                            styles.itemsCenter,
                            styles.p3,
                            styles.bgGrayLight
                          )}
                          onPress={() => handleSelectAllSubcategories(item._id, item.subcategories)}
                        >
                          <View style={clsx(
                            styles.w5,
                            styles.h5,
                            styles.rounded,
                            styles.justifyCenter,
                            styles.itemsCenter,
                            styles.mr2,
                            stats.allSelected ? 
                              clsx(styles.bgPrimary, styles.borderPrimary) : 
                              clsx(styles.border2, styles.borderGray)
                          )}>
                            {stats.allSelected && (
                              <Icon name="check" size={14} color={colors.white} />
                            )}
                          </View>
                          <Text style={clsx(
                            styles.textSm, 
                            styles.fontBold,
                            stats.allSelected ? styles.textPrimary : styles.textBlack
                          )}>
                            {stats.allSelected ? 'Deselect All' : 'Select All'} Subcategories
                          </Text>
                          {stats.someSelected && !stats.allSelected && (
                            <View style={clsx(styles.ml2, styles.bgPrimary, styles.px2, styles.py1, styles.rounded)}>
                              <Text style={clsx(styles.textXs, styles.textWhite)}>
                                {stats.selectedSubs} selected
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>

                        {/* Subcategory List with alternating background for better readability */}
                        {item.subcategories.map((sub, index) => {
                          const isSubSelected = formData.subCategoryIds.includes(sub._id);
                          return (
                            <TouchableOpacity
                              key={sub._id}
                              style={clsx(
                                styles.flexRow,
                                styles.itemsCenter,
                                styles.p3,
                                index % 2 === 0 ? styles.bgWhite : styles.bgGrayLight,
                                isSubSelected && stats.isMainSelected && styles.bgPrimaryLight
                              )}
                              onPress={() => handleSubcategorySelect(sub._id, item._id, item.name)}
                            >
                              <View style={clsx(
                                styles.w5,
                                styles.h5,
                                styles.rounded,
                                styles.justifyCenter,
                                styles.itemsCenter,
                                styles.mr2,
                                isSubSelected ? 
                                  clsx(styles.bgPrimary, styles.borderPrimary) : 
                                  clsx(styles.border2, styles.borderGray)
                              )}>
                                {isSubSelected && (
                                  <Icon name="check" size={14} color={colors.white} />
                                )}
                              </View>
                              <Text style={clsx(
                                styles.textBase,
                                styles.flex1,
                                isSubSelected ? styles.textPrimary : styles.textBlack,
                                isSubSelected && styles.fontMedium
                              )}>
                                {sub.name}
                              </Text>
                              {isSubSelected && (
                                <Icon name="check-circle" size={20} color={colors.primary} />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={clsx(styles.py10, styles.itemsCenter)}>
                  <Icon name="search-off" size={60} color={colors.textMuted} />
                  <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2, styles.textCenter)}>
                    No categories or subcategories found
                  </Text>
                </View>
              }
            />

            {/* Modal Footer with improved buttons */}
            <View style={clsx(
              styles.flexRow,
              styles.justifyEnd,
              styles.p4,
              styles.borderT,
              styles.borderGrayLight,
              styles.bgWhite
            )}>
              <TouchableOpacity
                style={clsx(styles.bgGray, styles.px6, styles.py3, styles.rounded, styles.mr2)}
                onPress={() => setShowCategoriesModal(false)}
              >
                <Text style={clsx(styles.textBase, styles.textBlack, styles.fontMedium)}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={clsx(
                  styles.bgPrimary, 
                  styles.px6, 
                  styles.py3, 
                  styles.rounded,
                  (formData.categoryIds.length === 0 && formData.subCategoryIds.length === 0) && styles.opacity50
                )}
                onPress={() => setShowCategoriesModal(false)}
                disabled={formData.categoryIds.length === 0 && formData.subCategoryIds.length === 0}
              >
                <Text style={clsx(styles.textBase, styles.textWhite, styles.fontBold)}>
                  Done {formData.categoryIds.length + formData.subCategoryIds.length > 0 ? `(${formData.categoryIds.length + formData.subCategoryIds.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cities Modal - unchanged */}
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
                // Ensure item exists before using it
                if (!item || !item._id) return null;
                
                const isSelected = formData.cityId && formData.cityId === item._id;
                
                return (
                  <TouchableOpacity
                    style={clsx(
                      styles.flexRow,
                      styles.itemsCenter,
                      styles.py3,
                      styles.borderB,
                      styles.borderGrayLight,
                      isSelected && styles.bgPrimaryLight
                    )}
                    onPress={() => handleCitySelect(item._id)}
                  >
                    <View style={clsx(
                      styles.w6,
                      styles.h6,
                      styles.roundedFull,
                      styles.border2,
                      styles.mr3,
                      styles.justifyCenter,
                      styles.itemsCenter,
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
                        {item.name || 'Unknown City'}
                      </Text>
                      {(item.state || item.country) && (
                        <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                          {item.state && item.country ? `${item.state}, ${item.country}` : (item.state || item.country)}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <Icon name="check-circle" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={clsx(styles.py10, styles.itemsCenter)}>
                  <Icon name="location-off" size={60} color={colors.textMuted} />
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
    </KeyboardAvoidingView>
  );
};

export default ProfileUpdateScreen;