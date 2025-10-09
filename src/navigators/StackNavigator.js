import React from "react";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
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
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}
