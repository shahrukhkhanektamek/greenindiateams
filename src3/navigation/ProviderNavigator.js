import React, { useContext, useEffect, useState } from "react";
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppContext } from "../Context/AppContext";

// Import Provider Screens
import DashboardScreen from '../screens/Provider/DashboardScreen';
import BookingListScreen from '../screens/Provider/BookingListScreen';
import BookingDetailScreen from '../screens/Provider/BookingDetailScreen';
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

function ProviderNavigator() {
  const { user, setUser } = useContext(AppContext);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setUser(null); // For demo, set to false to see auth flow
      setIsSplashVisible(false);
    };

    initializeApp();
  }, []);

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    // NavigationContainer removed from here
    <Stack.Navigator
      initialRouteName={user ? "Dashboard" : "Intro"}
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
      {!user ? (
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
          <Stack.Screen name="Dashboard" component={DashboardScreen}/>                        
          <Stack.Screen name="Bookings" component={BookingListScreen}/>
          <Stack.Screen name="BookingDetail" component={BookingDetailScreen}/>
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
  );
}

export default ProviderNavigator;