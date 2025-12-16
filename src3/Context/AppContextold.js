import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import DeviceInfo from "react-native-device-info";



export const AppContext = createContext();

export const AppProvider = ({ children }) => {

  // App states
  // const mainUrl = "http://192.168.1.61:8080/"; 
  const mainUrl = "http://192.168.1.17:8080/";
  const [theme, setTheme] = useState("light"); 
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showHidePageLoading, setshowHidePageLoading] = useState(false);
  const [showHideLoader, setshowHideLoader] = useState(false);
  const [pagination, setPagination] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [deviceId, setdeviceId] = useState('');

  const [categoryListData, setcategoryListData] = useState('');

  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

  // Base API URLs
  const apiUrl = () => {
    const apiUrl = mainUrl+"api/v1/";
    const commurl = apiUrl + "common/";
    const serviceManUrl = apiUrl + "serviceman/";
    return {

      homeDetail: `${commurl}home`,

      categoryList: `${commurl}category`,
      subCategoryList: `${commurl}sub-category`,
      subSubCategoryList: `${commurl}sub-sub-category`,
      subSubSubCategoryList: `${commurl}sub-sub-sub-category`,
      serviceList: `${commurl}service`,

      timeSlot: `${commurl}time-slot/available/by-date`,
      addRemoveCart: `${commurl}cart/create-cart`,
      createTransaction: `${commurl}payment/create-order`,
      verifyTransaction: `${commurl}payment/verify-payment`,


      login: `${serviceManUrl}auth/login`,
      verifyOtp: `${serviceManUrl}auth/verify-otp`,
      kycDetail: `${serviceManUrl}kyc/detail`,
      kycUpdate: `${serviceManUrl}kyc`,

      ProfileDetail: `${serviceManUrl}profile/detail`,
      ProfileUpdate: `${serviceManUrl}profile`,

      Review: `${serviceManUrl}review`,

      Booking: `${serviceManUrl}booking`,
      BookingAccept: `${serviceManUrl}booking/accept`,
      BookingOtp: `${serviceManUrl}booking/booking-start-otp`,
      BookingOtpVerify: `${serviceManUrl}booking/booking-start-otp-verify`,


      
    };
  };
  const Urls = apiUrl();

  // Modals
  const [modals, setModals] = useState({
    homeCategoryModal: false,
    loginModal: false,
    serviceManJoinModal: false,
  });
  const toggleModal = (modalName, isOpen) => {
    setModals(prev => ({ ...prev, [modalName]: isOpen }));
  };

  // AsyncStorage helpers
  const storage = {
    set: async (key, value) => await AsyncStorage.setItem(key, value),
    get: async (key) => await AsyncStorage.getItem(key),
    delete: async (key) => await AsyncStorage.removeItem(key),
  };

  // Device info on mount
  useEffect(() => {
    (async () => {
      const deviceIdTemp = await DeviceInfo.getUniqueId();
      setdeviceId(deviceIdTemp);
      const info = {
        deviceId,
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
        bundleId: DeviceInfo.getBundleId(),
        appVersion: DeviceInfo.getVersion(),
        readableVersion: DeviceInfo.getReadableVersion(),
        deviceName: await DeviceInfo.getDeviceName(),
        uniqueId: deviceId,
        manufacturer: await DeviceInfo.getManufacturer(),
        ipAddress: await DeviceInfo.getIpAddress(),
        batteryLevel: await DeviceInfo.getBatteryLevel(),
        isEmulator: await DeviceInfo.isEmulator(),
        isTablet: DeviceInfo.isTablet(),
      };
      setDeviceInfo(info);

      // Load user from storage
      const storedUser = await storage.get("user");
      if (storedUser)
      {
        setUser(JSON.parse(storedUser));
        setUserLoggedIn(true);
      }
      else{
        setUserLoggedIn(false);        
      }
    })();
  }, []);

  const getDeviceInfo = () => deviceInfo;

  

  // Post API request
  const postData = async (filedata, url, method, loaderShowHide = null, messageAlert = null, isFileUpload = false) => {
    
    
    
 
    const deviceInfo = getDeviceInfo(); 
    let data = '';
    // if(method=='POST' || method=='post')  data = JSON.stringify(Object.assign(filedata, { userId:user?.id,device_id: deviceId,device_detail:deviceInfo}));
    

    if (method === 'get' || method === 'GET' && filedata) {
      const params = new URLSearchParams({ ...filedata, userId:user?.id,device_id: deviceId,device_detail:deviceInfo }).toString();
      url += `?${params}`; // Append query parameters
    }
    // else if(method=='POST'){
    //   const formData = new FormData();

    //   Object.entries(filedata).forEach(([key, value]) => {
    //     if (value && value.uri && value.type && value.fileName) {
    //       // Ye file hai
    //       formData.append(key, value);
    //     } else if (value !== undefined && value !== null) {
    //       // Ye normal text value hai
    //       formData.append(key, value);
    //     }
    //   });

    //   // formData.append("userId", user?.id?user?.id:'');
    //   // formData.append("deviceId", deviceId);
    //   // formData.append("device_detail", JSON.stringify(deviceInfo));
      

    //   data = formData;

    // }

    if(method=='POST')  data = JSON.stringify(Object.assign(filedata, { device_id: deviceId}));

  


 

    console.log(data);
 

    if (!loaderShowHide) setshowHideLoader(true);    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          // "Content-Type": method=='POST'?"multipart/form-data":"application/json",
          "Content-Type": "application/json",
          // "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + (await storage.get("token")),
        },
        body: data,
      });
      return await responseCheck(response, messageAlert);
    } catch (error) {
      setshowHideLoader(false);
      console.error("API Error:", error);
      return error;
    }
  };



  const responseCheck = async (response, messageAlert) => {
    try {
  
      let result = [];
      if(response.status==200 || response.status==400 || response.status==401) 
      {
        result = await response.json();      
      } 
      else{
        result = response; 
      }
      console.log("Response:", result); 
      setshowHideLoader(false);
  
      if (result.status === 200) {
        if (!messageAlert && result.message) Toast.show({ type: "success", text1: result.message });
        switch (result.action) {
          case "add":
            return result;
    
          case "login": 
            await storage.set("token", result?.token);
            await storage.set("user", JSON.stringify(result?.data));
            setUser(result?.data);
            setUserLoggedIn(true);
            return result;             
  
            case "tokenUpdate":
              await storage.set("token", result?.token);
              await storage.set("user", JSON.stringify(result?.data));
              setUser(result?.data);
              return result;  
            
            case "register":
              await storage.set("token", result?.token);
              await storage.set("user", JSON.stringify(result?.data));
              setUserLoggedIn(true);
              setUser(result?.data);
              return result;  
              
              case "logout":
                storage.delete('token'); 
                storage.delete('user');
                setUserLoggedIn(false);
                setUser(null);
            return result;
                 
          case "return": 
            return result; 
    
          case "detail":  
            return result;  
   
          case "list":
            return result;
    
          default:
            return result;
        }
      } 
      else { 
        if (result.responseJSON) result = result.responseJSON;
        if (!messageAlert && result.message) 
          Toast.show({ type: "error", text1: result.message });
    
        if (result.status === 400) {
          return result;          
        } 
        else if (result.status === 401) {
          storage.delete('token'); 
          storage.delete('user');
          setUserLoggedIn(false);
          setUser(null);         
            return result;
        } 
        else if (result.status === 201) {
          return result;
        } 
        else if (result.status === 419) {
          return result;
        } 
        else if (result.status === 403) {
          return result;
        } 
        else {
          return result;
        } 
      }
    } catch (error) {
      setshowHidePageLoading(false);
      console.error("Invalid JSON response:", error);
      return error; // Return null if JSON parsing fails
    }
  };
  




  const PriceFormat = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

  const generateUniqueId = async () => {
    let uniqueId = await storage.get("uniqueId");
    let userStorage = await storage.get("user");
    if (!uniqueId) {
      uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
      await storage.set("uniqueId", uniqueId);
    }
    if (userStorage) {
      const userObj = JSON.parse(userStorage);
      uniqueId = userObj._id;
    }
    return uniqueId;
  };


  const imageCheck  =  (path, defaultImg = null) => {
    const baseUrl = mainUrl;
    let image = '';
  
    if (!path) {
      image = defaultImg
        ? `${baseUrl}uploads/${defaultImg}`
        : `${baseUrl}uploads/default.jpg`;
    } else {
      image = `${baseUrl}${path}`;
    }
  
    try {
      const decoded = JSON.parse(path);
  
      if (Array.isArray(decoded) || typeof decoded === 'object') {
        if (decoded?.[0]?.image_path) {
          image = `${baseUrl}${decoded[0].image_path}`;
        }
      } else if (path && typeof path === 'string') {
        image = `${baseUrl}${path}`;
      }
    } catch (e) {
      if (path && typeof path === 'string') {
        image = `${baseUrl}${path}`;
      }
    }
  
    // Return in React Native Image-friendly format
    return image;
  };

  const handleLogout = async () => {     
    // const response = await postData({}, Urls.logout,"GET");
    console.log('fasfsa');
    storage.delete('token'); 
    storage.delete('user');
    setUserLoggedIn(false);
    setUser(null);
  };


  const handleHome = async () => {
    try {
      const response = await postData({}, Urls.homeDetail, "GET", 1, 1);
      if(response.success)
      {
        let data = response.data;
        setcategoryListData(data.category);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };
  useEffect(() => {
    handleHome();
  }, []); 
 
  return (
    <AppContext.Provider
      value={{
        toggleTheme,
        drawerOpen,
        deviceId, setdeviceId,
        setDrawerOpen,
        userLoggedIn,
        setUserLoggedIn,
        imageCheck,
        handleLogout,

        user, setUser,
        modals, toggleModal,
        Urls, postData, 
        storage,
        showHidePageLoading, setshowHidePageLoading,
        PriceFormat, generateUniqueId, Toast,
        showHideLoader, setshowHideLoader,

        categoryListData,
        setcategoryListData,
      }}
    >
      {loadingStates.page ? <PageLoading /> : children}
      {loadingStates.api && <Loader showHideLoader={loadingStates.api} setLoading={setLoading} />}
      {loadingStates.sideBar && <CustomSidebar isVisible={loadingStates.sideBar} setLoading={setLoading} />}
      {children}
      <Toast />      
    </AppContext.Provider>
  );
};
