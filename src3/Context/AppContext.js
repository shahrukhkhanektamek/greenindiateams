import React, { createContext, useEffect, useState, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import DeviceInfo from "react-native-device-info";
import NetInfo from '@react-native-community/netinfo';
import PageLoading from '../components/Common/Loader/PageLoding';
import Loader from '../components/Common/Loader/Loader';
import CustomSidebar from '../components/Provider/CustomSidebar';

export const AppContext = createContext();

// API URLs configuration - Consider moving to environment variables
// const UploadUrl = 'http://192.168.1.61:8080/';
const UploadUrl = 'http://192.168.1.25:8080/';
// const UploadUrl = 'http://145.223.18.56:3001/';
const BASE_URLS = {
  development: "http://192.168.1.25:8080/",
  // production: "http://145.223.18.56:3001/",
  
  // development: "http://192.168.1.61:8080/",
  // production: "https://api.example.com/"
};

export const AppProvider = ({ children }) => {
  const ENVIRONMENT = "development"; 
  const mainUrl = BASE_URLS[ENVIRONMENT];
  
  // App states
  const [theme, setTheme] = useState("light");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [rootScreen, setrootScreen] = useState('Intro');
  const [isheaderback, setisheaderback] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    page: false,
    loader: false,  
    global: false,
    api: false,
    sideBar: false,
  });
  const [deviceInfo, setDeviceInfo] = useState({});
  const [deviceId, setDeviceId] = useState('');
  const [categoryListData, setCategoryListData] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  // Check network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        Toast.show({
          type: 'error',
          text1: 'No Internet Connection',
          text2: 'Please check your network settings'
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // API URLs with useMemo to prevent recreation
  const Urls = useMemo(() => {
    const apiUrl = mainUrl + "api/v1/";
    const commUrl = apiUrl + "common/";
    const serviceManUrl = apiUrl + "serviceman/";

    return {
      homeDetail: `${commUrl}home`,
      categoryList: `${commUrl}category`,
      subCategoryList: `${commUrl}sub-category`,
      subSubCategoryList: `${commUrl}sub-sub-category`,
      subSubSubCategoryList: `${commUrl}sub-sub-sub-category`,
      serviceList: `${commUrl}service`,
      timeSlot: `${commUrl}time-slot/available/by-date`,
      addRemoveCart: `${commUrl}cart/create-cart`,
      createTransaction: `${commUrl}payment/create-order`,
      verifyTransaction: `${commUrl}payment/verify-payment`,
      login: `${serviceManUrl}auth/login`,
      verifyOtp: `${serviceManUrl}auth/verify-otp`,
      
      kycDetail: `${serviceManUrl}kyc/detail`,
      kycUpdate: `${serviceManUrl}kyc`,
      
      profileDetail: `${serviceManUrl}profile/detail`,
      profileUpdate: `${serviceManUrl}profile`,

      trainingSchedule: `${serviceManUrl}training-schedule/next/upcoming`,
      trainingScheduleUpdate: `${serviceManUrl}training-schedule-submit`,
      trainingScheduleDetail: `${serviceManUrl}training-schedule-submit/detail`,
      
      earnings: `${serviceManUrl}earning`,
      earningDetails: `${serviceManUrl}earning`,

      review: `${serviceManUrl}review`,
      booking: `${serviceManUrl}booking`,
      getBookingDetail: `${serviceManUrl}booking`,
      sendOtp: `${serviceManUrl}booking/booking-start-otp`,
      verifyOtpAndStart: `${serviceManUrl}booking/booking-start-otp-verify`,
      
      uploadBeforeStartMedia: `${serviceManUrl}bookingUpload/upload-before-start`,
      uploadAfterCompleteMedia: `${serviceManUrl}bookingUpload/upload-after-complete`,

      removeBeforeStartMedia: `${serviceManUrl}bookingUpload/remove-before-start`,
      removeAfterCompleteMedia: `${serviceManUrl}bookingUpload/remove-after-complete`,

      walletHistory: `${serviceManUrl}wallet`,
      addWalletCredit: `${serviceManUrl}wallet`,

      bookingAccept: `${serviceManUrl}booking/accept`,
      bookingComplete: `${serviceManUrl}booking/complete`,
      logout: `${serviceManUrl}auth/logout`
    };
  }, [mainUrl]);

  // Modals state management
  const [modals, setModals] = useState({
    homeCategoryModal: false,
    loginModal: false,
    serviceManJoinModal: false,
  });

  const toggleModal = useCallback((modalName, isOpen) => {
    setModals(prev => ({ ...prev, [modalName]: isOpen }));
  }, []);

  // AsyncStorage helper with error handling
  const storage = useMemo(() => ({
    set: async (key, value) => {
      try {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
        await AsyncStorage.setItem(key, stringValue);
      } catch (error) {
        console.error('AsyncStorage set error:', error);
        throw error;
      }
    },
    get: async (key) => {
      try {
        const value = await AsyncStorage.getItem(key);
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      } catch (error) {
        console.error('AsyncStorage get error:', error);
        return null;
      }
    },
    delete: async (key) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('AsyncStorage delete error:', error);
        throw error;
      }
    },
    clear: async () => {
      try {
        await AsyncStorage.clear();
      } catch (error) {
        console.error('AsyncStorage clear error:', error);
        throw error;
      }
    }
  }), []);

  // Device info initialization
  useEffect(() => {
    initializeDeviceInfo();
    loadUserData();
  }, []);

  const initializeDeviceInfo = async () => {
    try {
      const deviceIdTemp = await DeviceInfo.getUniqueId();
      setDeviceId(deviceIdTemp);
      
      const info = {
        deviceId: deviceIdTemp,
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
        bundleId: DeviceInfo.getBundleId(),
        appVersion: DeviceInfo.getVersion(),
        readableVersion: DeviceInfo.getReadableVersion(),
        deviceName: await DeviceInfo.getDeviceName(),
        uniqueId: deviceIdTemp,
        manufacturer: await DeviceInfo.getManufacturer(),
        ipAddress: await DeviceInfo.getIpAddress().catch(() => 'Unknown'),
        batteryLevel: await DeviceInfo.getBatteryLevel().catch(() => -1),
        isEmulator: await DeviceInfo.isEmulator(),
        isTablet: DeviceInfo.isTablet(),
      };
      setDeviceInfo(info);
    } catch (error) {
      console.error('Failed to initialize device info:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const [token, storedUser] = await Promise.all([
        storage.get("token"),
        storage.get("user")
      ]);
      
      if (token) {
        setUser(storedUser);
      }
 
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  // Loading state management
  const setLoading = useCallback((type, value) => {
    setLoadingStates(prev => ({
      ...prev,
      [type]: value
    }));
  }, []);

  // Enhanced API request handler
  const postData = useCallback(async (
    data,
    url,
    method = 'POST',
    options = {}
  ) => {
    const {
      showLoader = false,
      showErrorMessage = true,
      showSuccessMessage = true,
      isFileUpload = false,
      contentType = null
    } = options;

    // Check network connectivity
    if (!isConnected) {
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your internet connection'
      });
      throw new Error('No internet connection');
    }

    if (showLoader) setLoading('api', true);

    try {
      const token = await storage.get("token");
      const headers = {
        'Authorization': token ? `Bearer ${token}` : '',
      };

      let body;
      let finalUrl = url;

      // Handle GET requests with query params
      if (method.toUpperCase() === 'GET' && data) {
        const params = new URLSearchParams({
          ...data,
          device_id: deviceId,
          timestamp: Date.now()
        }).toString();
        finalUrl += `?${params}`;
      } else {
        // Handle other methods
        if (isFileUpload) {
          const formData = new FormData();
          Object.entries(data || {}).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              formData.append(key, value);
            }
          });
          formData.append('device_id', deviceId);
          body = data;
        } else {
          headers['Content-Type'] = contentType || 'application/json';
          body = JSON.stringify({
            ...data,
            device_id: deviceId
          });
        }
      }

      // Request timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(finalUrl, {
        method,
        headers,
        body: method.toUpperCase() === 'GET' ? undefined : body,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      return await handleResponse(response, showErrorMessage, showSuccessMessage);
    } catch (error) {
      if (error.name === 'AbortError') {
        Toast.show({ 
          type: 'error',
          text1: 'Request Timeout',
          text2: 'Please try again'
        }); 
      } else {
        console.error('API Error:', error);
        if (showErrorMessage) {
          Toast.show({
            type: 'error',
            text1: 'Network Error',
            text2: 'Something went wrong. Please try again.'
          });
        }
      }
      throw error;
    } finally {
      if (showLoader) setLoading('api', false);
    }
  }, [deviceId, isConnected, storage, setLoading]);

  // Enhanced response handler
  const handleResponse = async (response, showErrorMessage, showSuccessMessage) => {
    let result;
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        console.log(result);
      } else {
        const text = await response.text();
        throw new Error(`Invalid response format: ${text.substring(0, 100)}`);
      }
    } catch (error) {
      console.error('Response parsing error:', error);
      throw new Error('Invalid server response');
    }

    // Handle different status codes
    switch (response.status) { 
      case 200:
        if (result.success && result.message && !showErrorMessage) {
          if(showSuccessMessage)
          {
            Toast.show({
              type: 'success',
              text1: result.message
            });
          }
        }
        return result;

      case 201:
        // Created
        return result;

      case 400:
        // Bad Request
        if (result.message && showErrorMessage) {
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: result.message
          });
        }
        return result;

      case 401:
        // Unauthorized - Trigger logout
        await handleLogout();
        if (showErrorMessage) {
          Toast.show({
            type: 'error',
            text1: 'Session Expired',
            text2: 'Please login again'
          });
        }
        return result;

      case 403:
        // Forbidden
        if (showErrorMessage) {
          Toast.show({
            type: 'error',
            text1: 'Access Denied',
            text2: result.message || 'You do not have permission'
          });
        }
        return result;

      case 404:
        // Not Found
        if (showErrorMessage) {
          Toast.show({
            type: 'error',
            text1: 'Not Found',
            text2: 'The requested resource was not found'
          });
        }
        return result;

      case 500:
        // Server Error
        if (showErrorMessage) {
          Toast.show({
            type: 'error',
            text1: 'Server Error',
            text2: 'Please try again later'
          });
        }
        return result;

      default:
        return result;
    }
  };

  // Helper functions
  const priceFormat = useCallback((value) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }, []);

  const imageCheck = useCallback((path, defaultImg = 'default.jpg') => {
    if (!path) return `${mainUrl}uploads/${defaultImg}`;
    
    try {
      // Check if path is JSON string
      const parsed = JSON.parse(path);
      if (Array.isArray(parsed) && parsed[0]?.image_path) {
        return `${mainUrl}${parsed[0].image_path}`;
      }
    } catch {
      // Not JSON, treat as string path
      if (path.startsWith('http')) return path;
      return `${mainUrl}${path}`;
    }
    
    return `${mainUrl}uploads/${defaultImg}`;
  }, [mainUrl]);

  // Authentication handlers
  const handleLogin = useCallback(async (userData, token) => {
    try {
      await Promise.all([
        storage.set('token', token),
        storage.set('user', userData)
      ]);
      setUser(userData);
      Toast.show({
        type: 'success',
        text1: 'Login Successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [storage]);

  const handleLogout = useCallback(async () => {
    try {
      // Call logout API if needed
      if (user) {
        await postData({}, Urls.logout, 'POST', { showLoader: false, showErrorMessage: false });
      }
      
      // Clear storage and state
      await Promise.all([
        storage.delete('token'),
        storage.delete('user')
      ]);
      
      setUser(null);
      Toast.show({
        type: 'success',
        text1: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      await storage.clear();
      setUser(null);
    }
  }, [user, storage, postData, Urls.logout]);

  // Data fetching
  const fetchHomeData = useCallback(async () => {
    try {
      setLoading('page', true);
      const response = await postData({}, Urls.homeDetail, 'GET', { showErrorMessage: false });
      
      if (response?.success) {
        setCategoryListData(response.data?.category || []);
      }
    } catch (error) {
      console.error('Home data fetch error:', error);
    } finally {
      setLoading('page', false);
    }
  }, [Urls.homeDetail, postData, setLoading]);



  const fetchProfile = async () => {
    try {
      const response = await postData({}, Urls.profileDetail, 'GET', { showErrorMessage: false, showSuccessMessage: false });

      if (response?.success) {
        const apiData = response.data || {};      
        storage.set('user', apiData);
        setUser(apiData);      
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

  const profileStatus = async () => {
    if(user)
    {
      if(!user.profile && !user.dob)
      {
        setrootScreen('ProfileUpdate');
      }
      else if(!user.kyc)  
      {
        setrootScreen('KycScreen');
      } 
      else if(user.kyc)  
      {
        if(user.kyc.status=='pending' || user.kyc.status=='rejected')
          setrootScreen('KYCStatus');
        // else if(!user?.trainingScheduleSubmit)
        // {
        //   setrootScreen('Training');
        // }
        else if(user?.trainingScheduleSubmit)
        {
          // "New", "Confirm", "Reject", "Complete"
          if(
            user?.trainingScheduleSubmit.trainingScheduleStatus=='New' ||
            user?.trainingScheduleSubmit.trainingScheduleStatus=='Confirm' ||
            user?.trainingScheduleSubmit.trainingScheduleStatus=='Reject'
          )
          {
            setrootScreen('TrainingStatus');
          }
          else{
            setrootScreen('ProviderDashboard');
          }
        }
        else
        { 
          setisheaderback(true) 
          setrootScreen('ProviderDashboard');
        }
      }
      else
      {
        setisheaderback(true) 
        setrootScreen('ProviderDashboard');
      }
    }
    else
    {
      setrootScreen('Intro');
    }
  };




  // Initial data load 
  // useEffect(() => {
  //   fetchHomeData();
  // }, [fetchHomeData]);

  // Context value
  const contextValue = useMemo(() => ({
    // State
    theme,
    drawerOpen,
    user,
    deviceId,
    deviceInfo,
    modals,
    categoryListData,
    loadingStates,
    isheaderback,
    isConnected,
    
    // Setters
    setDrawerOpen,
    setTheme: (theme) => setTheme(theme),
    setUser,
    setDeviceId,
    setLoading,
    setisheaderback,
    
    // Actions
    toggleModal,
    postData,
    handleLogin,
    handleLogout,
    priceFormat,
    imageCheck,
    UploadUrl,
    fetchProfile,
    setrootScreen,
    rootScreen,
    profileStatus,
    
    // Data
    Urls,
    storage,
    mainUrl,
    
    // Derived state
    isLoggedIn: !!user,
    userToken: user?.token,
    Toast
  }), [
    theme,
    drawerOpen,
    user,
    deviceId,
    deviceInfo,
    modals,
    categoryListData,
    loadingStates,
    isConnected,
    toggleModal,
    postData,
    handleLogin,
    handleLogout,
    priceFormat,
    imageCheck,
    Urls,
    storage,
    mainUrl,
    setLoading,
  ]);

 

  return (
    <AppContext.Provider value={contextValue}>
      {loadingStates.page ? <PageLoading /> : children}
      {loadingStates.api && <Loader showHideLoader={loadingStates.api} setLoading={setLoading} />}
      {loadingStates.sideBar && <CustomSidebar isVisible={loadingStates.sideBar} setLoading={setLoading} />}

      <Toast />
    </AppContext.Provider> 
  );
};