import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import DeviceInfo from "react-native-device-info";
import PageLoading from "../components/Loader/PageLoding";
import Loader from "../components/Loader/Loader";
import SplashScreen from "../screens/SplashScreen";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

  // App states
  const mainUrl = "http://192.168.1.61:8080/";
  const [theme, setTheme] = useState("light"); 
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showHidePageLoading, setshowHidePageLoading] = useState(false);
  const [showHideLoader, setshowHideLoader] = useState(false);
  const [pagination, setPagination] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [deviceId, setdeviceId] = useState('');

  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

  // Base API URLs
  const apiUrl = () => {
    const apiUrl = mainUrl+"api/v1/";
    const commurl = apiUrl + "common/";
    const serviceManUrl = apiUrl + "serviceman/";
    return {


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


      // login: `${userUrl}login`, 
      // logout: `${userUrl}logout`,
      // online_offline: `${userUrl}online_offline`,

      // lead: `${userUrl}lead`,
      // leadScretch: `${userUrl}lead-scretch`,
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
    
    
    // const deviceInfoJson = JSON.stringify(getDeviceInfo());
    // let bodyData = null;
    // if (isFileUpload) {
    //   bodyData = new FormData();
    //   for (const key in filedata) bodyData.append(key, filedata[key]);
    //   bodyData.append("device_detail", deviceInfoJson);
    //   bodyData.append("device_id", deviceId);
    // } else {
    //   if (method === "POST") bodyData = { ...filedata, device_detail: deviceInfoJson, device_id:deviceId };
    //   if ((method === "GET" || method === "DELETE") && filedata) {
    //     const params = new URLSearchParams({ ...filedata, device_detail: deviceInfoJson, device_id:deviceId }).toString();
    //     url += `?${params}`;
    //   }
    // }
 
    const deviceInfo = getDeviceInfo(); 
    let data = '';
    if(method=='POST' || method=='post')  data = JSON.stringify(Object.assign(filedata, { employee_id:user?.id,device_id: deviceId,device_detail:deviceInfo}));
    if(method=='GET' || method=='get') data = '';
    if (method === 'get' || method === 'GET' && filedata) {
      const params = new URLSearchParams({ ...filedata, employee_id:user?.id,device_id: deviceId,device_detail:deviceInfo }).toString();
      url += `?${params}`; // Append query parameters
    }

    // console.log(data);
 

    if (!loaderShowHide) setshowHideLoader(true);    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
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

  const handleLogout = async () => {     
    // const response = await postData({}, Urls.logout,"GET");
    console.log('fasfsa');
    storage.delete('token'); 
    storage.delete('user');
    setUserLoggedIn(false);
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        toggleTheme,
        drawerOpen,
        deviceId, setdeviceId,
        setDrawerOpen,
        userLoggedIn,
        setUserLoggedIn,
        handleLogout,

        user, setUser,
        modals, toggleModal,
        Urls, postData, 
        storage,
        showHidePageLoading, setshowHidePageLoading,
        PriceFormat, generateUniqueId, Toast,
        showHideLoader, setshowHideLoader

      }}
    >

      {showHidePageLoading ? <PageLoading /> : children}
      {showHideLoader && <Loader showHideLoader={showHideLoader} setshowHideLoader={setshowHideLoader} />}
      <Toast />
      {/* <SplashScreen/> */}
      
    </AppContext.Provider>
  );
};
