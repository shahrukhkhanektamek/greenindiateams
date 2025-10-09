import React, { useRef, useState } from "react";
import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator, { navigationRef } from "./src/navigators/RootNavigator";

import { AppProvider } from './src/Context/AppContext';

export default function App() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
         
        <AppProvider>
          <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
          <NavigationContainer ref={navigationRef}>
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}