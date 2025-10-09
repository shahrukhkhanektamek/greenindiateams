import React from "react";
import { createStackNavigator } from "@react-navigation/stack";


import LoginScreen from "../screens/LoginScreen";
import OtpScreen from "../screens/OtpScreen";

const Stack = createStackNavigator();

export default function AuthNavigator({ onLogin }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLogin={onLogin} />}
      </Stack.Screen>
      <Stack.Screen name="Otp" component={OtpScreen} />
    </Stack.Navigator>
  );
}
