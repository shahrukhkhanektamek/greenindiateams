import React from "react";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
// import ProfileScreen from "../screens/ProfileScreen";

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // slide animation
      }}
    >
      
    </Stack.Navigator>
  );
}
