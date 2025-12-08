import React, { createRef, useContext, useEffect, useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppContext } from "../../src/Context/AppContext";

// Import Provider Screens
import DashboardScreen from '../screens/Provider/DashboardScreen';
import BookingListScreen from '../screens/Provider/BookingListScreen';
import TodayJobsScreen from '../screens/Provider/TodayJobsScreen';
import JobDetailsScreen from '../screens/Provider/JobDetailsScreen';
import EarningsScreen from '../screens/Provider/EarningsScreen';
import ScheduleScreen from '../screens/Provider/ScheduleScreen';
import PerformanceScreen from '../screens/Provider/PerformanceScreen';
import ToolsScreen from '../screens/Provider/ToolsScreen';
import TrainingScreen from '../screens/Provider/TrainingScreen';

// Import Common Screens
import ProfileScreen from '../screens/Common/ProfileScreen';
import SettingsScreen from '../screens/Common/SettingsScreen';
import SupportScreen from '../screens/Common/SupportScreen';

// Import Auth Screens
import IntroScreen from '../screens/Auth/IntroScreen';
import ProviderLoginScreen from '../screens/Auth/ProviderLoginScreen';
import ProviderOTPLoginScreen from '../screens/Auth/ProviderOTPLoginScreen';
import ProviderForgotPasswordScreen from '../screens/Auth/ProviderForgotPasswordScreen';
import ProviderSignupScreen from '../screens/Auth/ProviderSignupScreen';
import VerificationScreen from '../screens/Auth/VerificationScreen';

// Import Splash Screen
import SplashScreen from '../screens/Common/SplashScreen';
 
const Stack = createStackNavigator();

// =========== MAIN STACK NAVIGATOR ===========
export const navigationRef = createRef();

function ProviderNavigator() {
  const {
    userLoggedIn, 
    setUserLoggedIn,
  } = useContext(AppContext);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  // Simulate authentication check
  useEffect(() => {
    const initializeApp = async () => {
      // Wait 2 seconds for splash
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if user is logged in (in real app, check token)
      // For demo, set to false to see auth flow
      setUserLoggedIn(false);

      setIsSplashVisible(false);
    };

    initializeApp();
  }, []);

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={userLoggedIn ? "Dashboard" : "Intro"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF6B6B',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      >
        {!userLoggedIn ? (
          // =========== AUTH SCREENS ===========
          <>
            <Stack.Screen name="Intro" component={IntroScreen} options={{ headerShown: false }} />            
            <Stack.Screen name="ProviderLogin" component={ProviderLoginScreen} />            
            <Stack.Screen name="ProviderOTPLogin" component={ProviderOTPLoginScreen}/>            
            <Stack.Screen name="ProviderForgotPassword" component={ProviderForgotPasswordScreen}/>            
            <Stack.Screen name="ProviderSignup" component={ProviderSignupScreen}/>            
            <Stack.Screen name="Verification" component={VerificationScreen}/>            
            <Stack.Screen name="ProviderDashboard" component={DashboardScreen}/>
          </>
        ) : (
          // =========== MAIN APP SCREENS ===========
          <>
            {/* Dashboard */}
            <Stack.Screen name="Dashboard" component={DashboardScreen}/>                        
            <Stack.Screen name="BookingList" component={BookingListScreen}/>            
            <Stack.Screen name="TodayJobs" component={TodayJobsScreen}/>            
            <Stack.Screen name="JobDetails" component={JobDetailsScreen}/>                        
            <Stack.Screen name="Earnings" component={EarningsScreen}/>            
            <Stack.Screen name="Schedule" component={ScheduleScreen}/>            
            <Stack.Screen name="Performance" component={PerformanceScreen}/>            
            <Stack.Screen name="Tools" component={ToolsScreen}/>
            <Stack.Screen name="Training" component={TrainingScreen}/>
            <Stack.Screen name="Profile" component={ProfileScreen}/>
            <Stack.Screen name="Settings" component={SettingsScreen}/>
            <Stack.Screen name="Support" component={SupportScreen}/>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default ProviderNavigator;