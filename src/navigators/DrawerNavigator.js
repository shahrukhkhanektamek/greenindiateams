import React, { useContext, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, TouchableOpacity, Text } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import CallLogScreen from "../screens/CallLogScreen";

import CustomDrawer from "./CustomDrawer";
import { navigationRef } from "./RootNavigator"; // ✅ FIX: import navigationRef

import FooterBar from "../components/FooterBar";

import { AppContext } from "../Context/AppContext";

const Stack = createStackNavigator(); 

export default function DrawerNavigator() {

  const { drawerOpen, setDrawerOpen } = useContext(AppContext);

  return (
    <View style={{ flex: 1 }}>
      {/* Drawer */}
      <CustomDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigationRef}
      />

      {/* Screens */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => setDrawerOpen(true)}
              style={{ marginLeft: 15 }}
            >
              <Text style={{ fontSize: 18 }}>Menu</Text>
            </TouchableOpacity>
          ),
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CallLog" component={CallLogScreen} />

      </Stack.Navigator>
      {/* <FooterBar /> */} 


    </View>
  );
}
