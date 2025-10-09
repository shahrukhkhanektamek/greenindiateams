import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, StatusBar, useColorScheme, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator, { navigationRef } from "./src/navigators/RootNavigator";

import { AppProvider } from './src/Context/AppContext';
// import appstyles from "./src/assets/app";

export default function App() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
         
        <AppProvider>
          <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
          <NavigationContainer ref={navigationRef}>
            <View style={[{ flex: 1 }]}>
              <KeyboardAvoidingView
                      style={{ flex: 1 }}
                      behavior={Platform.OS === "ios" ? "padding" : "height"}
                      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                    >
                <RootNavigator />
              </KeyboardAvoidingView>
            </View>
          </NavigationContainer>
        </AppProvider>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}