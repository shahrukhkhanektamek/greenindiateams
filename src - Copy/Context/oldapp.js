import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import DeviceInfo from "react-native-device-info";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

  // App states
  const mainUrl = "asas";
  const [theme, setTheme] = useState("light");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [bodyLoaderShow, setBodyLoaderShow] = useState(false);
  const [pagination, setPagination] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState({});

  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

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
      const deviceId = await DeviceInfo.getUniqueId();
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
    })();
  }, []);

  const getDeviceInfo = () => deviceInfo;

  // Base API URLs
  const apiUrl = () => {
    const apiUrl = mainUrl+"api/v1/";
    const commurl = apiUrl + "common/";
    const userUrl = apiUrl + "user/";
    return {
      login: `${userUrl}auth/login`,
      verifyOtp: `${userUrl}auth/verify-otp`,
      logout: `${userUrl}logout`,
      homeDetail: `${commurl}home`,
      categoryList: `${commurl}category`,
      subCategoryList: `${commurl}sub-category`,
      subSubCategoryList: `${commurl}sub-sub-category`,
      subSubSubCategoryList: `${commurl}sub-sub-sub-category`,
      serviceList: `${commurl}service`,
      addRemoveCart: `${commurl}cart/create-cart`,
      createBooking: `${userUrl}booking/create-booking`,
      myBooking: `${userUrl}booking`,
      myReview: `${userUrl}review`,
    };
  };
  const Urls = apiUrl();

  // Post API request
  const postData = async (filedata, url, method, loaderShowHide = null, messageAlert = null, isFileUpload = false) => {
    const deviceInfoJson = JSON.stringify(getDeviceInfo());
    let bodyData = null;

    if (isFileUpload) {
      bodyData = new FormData();
      for (const key in filedata) bodyData.append(key, filedata[key]);
      bodyData.append("device_detail", deviceInfoJson);
    } else {
      if (method === "POST") bodyData = { ...filedata, device_detail: deviceInfoJson };
      if ((method === "GET" || method === "DELETE") && filedata) {
        const params = new URLSearchParams({ ...filedata, device_detail: deviceInfoJson }).toString();
        url += `?${params}`;
      }
    }

    if (!loaderShowHide) setBodyLoaderShow(true);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": isFileUpload ? undefined : "application/json",
          Authorization: "Bearer " + (await storage.get("token")),
        },
        body: method === "POST" ? JSON.stringify(bodyData) : undefined,
      });
      return await responseCheck(response, messageAlert);
    } catch (error) {
      setBodyLoaderShow(false);
      console.error("API Error:", error);
      return error;
    }
  };

  const responseCheck = async (response, messageAlert) => {
    try {
      const result = await response.json();
      setBodyLoaderShow(false);

      if (result.success) {
        if (result?.pagination) setPagination(result.pagination);
        if (!messageAlert && result.message) Toast.show({ type: "success", text1: result.message });
        if (result?.token) {
          await storage.set("token", result.token);
          await storage.set("user", JSON.stringify(result?.user));
          setUser(result?.user);
        }
      } else {
        if (!messageAlert && result.message) Toast.show({ type: "error", text1: result.message });
      }

      return result;
    } catch (error) {
      setBodyLoaderShow(false);
      console.error("Invalid JSON response:", error);
      return error;
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

  return (
    <AppContext.Provider value={{
      toggleTheme, theme,
      drawerOpen, setDrawerOpen,
      userLoggedIn, setUserLoggedIn,
      user, setUser,
      modals, toggleModal,
      Urls, postData,
      storage,
      bodyLoaderShow, setBodyLoaderShow,
      PriceFormat, generateUniqueId, Toast
    }}>
      {children}
      <Toast />
      {bodyLoaderShow && <View style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)"
      }}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>}
    </AppContext.Provider>
  );
};
