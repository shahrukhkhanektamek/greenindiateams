import React, { useContext, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, TouchableOpacity, Text } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import CallLogScreen from "../screens/CallLogScreen";


import MyAddressScreen from "../screens/MyAddressScreen";
import AddAddressScreen from "../screens/AddAddressScreen";

import HelpSupportScreen from "../screens/HelpSupportScreen";


import ProfileScreen from "../screens/Profile/ProfileScreen";
import KycSreen from "../screens/Profile/KycSreen";
import EditProfileScreen from "../screens/Profile/EditProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";




import CustomDrawer from "./CustomDrawer";
import { navigationRef } from "./RootNavigator"; // ✅ FIX: import navigationRef

import FooterBar from "../components/FooterBar";

import { AppContext } from "../Context/AppContext";

const Stack = createStackNavigator(); 

export default function DrawerNavigator() {

  const { drawerOpen, setDrawerOpen } = useContext(AppContext);

  return (
    <View style={{ flex: 1,paddingBottom:40 }}>
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


        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Kyc" component={KycSreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="MyAddress" component={MyAddressScreen} />
        <Stack.Screen name="AddAddress" component={AddAddressScreen} />

        <Stack.Screen name="Help" component={HelpSupportScreen} />
        <Stack.Screen name="Setting" component={SettingsScreen} />


      </Stack.Navigator>
      <FooterBar /> 


    </View>
  );
}
