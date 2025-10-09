import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CustomDrawer from "./CustomDrawer";
import { createNavigationContainerRef } from "@react-navigation/native";

// Create navigation ref
export const navigationRef = createNavigationContainerRef();

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigate = (screen) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(screen);
      setDrawerOpen(false); // close drawer after navigation
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Custom Drawer */}
      <CustomDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={{ navigate: handleNavigate }}
      />

      {/* Stack Navigator */}
      <Stack.Navigator
        screenOptions={{
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
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </View>
  );
}
