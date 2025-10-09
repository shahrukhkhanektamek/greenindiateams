import React, { createRef, useContext, useEffect, useState } from "react";
import AuthNavigator from "./AuthNavigator";
import DrawerNavigator from "./DrawerNavigator";
import SplashScreen from "../screens/SplashScreen";
import { AppContext } from "../Context/AppContext";

export const navigationRef = createRef();

export default function RootNavigator() {
  const { userLoggedIn, setUserLoggedIn, storage } = useContext(AppContext);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
 
  useEffect(() => {
    const initializeApp = async () => {
      // Wait 2 seconds for splash
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const storedUser = await storage.get("user");
      if (storedUser) {
        setUserLoggedIn(true);
      }

      setIsSplashVisible(false);
    };

    initializeApp();
  }, [userLoggedIn]);

  if (isSplashVisible) {
    return (
    <SplashScreen />
  ); 
  }

  return userLoggedIn ? (
    <DrawerNavigator />
  ) : (
    <AuthNavigator onLogin={() => setUserLoggedIn(true)} />
  );
}