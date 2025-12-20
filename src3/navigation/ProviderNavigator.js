import React, { useContext, useEffect, useState } from "react";
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppContext } from "../Context/AppContext";

// Import Provider Screens
import DashboardScreen from '../screens/Provider/DashboardScreen';

import BookingListScreen from '../screens/Provider/Booking/BookingListScreen';
import BookingDetailScreen from '../screens/Provider/Booking/BookingDetailScreen';

import OTPVerificationScreen from '../screens/Provider/Booking/OTPVerificationScreen';
import SelfieCaptureScreen from '../screens/Provider/Booking/SelfieCaptureScreen';
import MediaCaptureScreen from '../screens/Provider/Booking/MediaCaptureScreen';
import CompleteBookingScreen from '../screens/Provider/Booking/CompleteBookingScreen';
import AddItemScreen from '../screens/Provider/Booking/AddItemScreen';


import ProviderProfileScreen from '../screens/Provider/Profile/ProviderProfileScreen';
import ProfileUpdateScreen from '../screens/Provider/Profile/ProfileUpdateScreen';

import KYCUpdateScreen from '../screens/Provider/Kyc/KYCUpdateScreen';
import KYCStatusScreen from '../screens/Provider/Kyc/KYCStatusScreen';
 
import TrainingScheduleScreen from '../screens/Provider/Training/TrainingScheduleScreen';
import TrainingStatusScreen from '../screens/Provider/Training/TrainingStatusScreen';

import TodayJobsScreen from '../screens/Provider/TodayJobsScreen';

import JobDetailsScreen from '../screens/Provider/JobDetailsScreen';

import EarningsScreen from '../screens/Provider/Earning/EarningScreen'; 
import EarningDetailsScreen  from '../screens/Provider/Earning/EarningDetailsScreen';

import WalletScreen from '../screens/Provider/Wallet/WalletScreen';
import AddWalletScreen from '../screens/Provider/Wallet/AddWalletScreen';

import TransactionHistoryScreen from '../screens/Provider/Transaction/TransactionHistoryScreen';
import TransactionDetailsScreen from '../screens/Provider/Transaction/TransactionDetailsScreen';

import ScheduleScreen from '../screens/Provider/ScheduleScreen';
import PerformanceScreen from '../screens/Provider/PerformanceScreen';
import ToolsScreen from '../screens/Provider/ToolsScreen';


// Import Common Screens
import ProfileScreen from '../screens/Common/ProfileScreen';
import SettingsScreen from '../screens/Common/SettingsScreen';
import SupportScreen from '../screens/Common/SupportScreen';
import TermsConditionsScreen from '../screens/Common/TermsConditionsScreen';

// Import Auth Screens
import IntroScreen from '../screens/Intro/IntroScreen'; 
import IntroEarningScreen from '../screens/Intro/IntroEarningScreen';
import ProviderLoginScreen from '../screens/Auth/ProviderLoginScreen'; 
import ProviderOTPLoginScreen from '../screens/Auth/ProviderOTPLoginScreen';
import ProviderForgotPasswordScreen from '../screens/Auth/ProviderForgotPasswordScreen';
import ProviderSignupScreen from '../screens/Auth/ProviderSignupScreen';
import VerificationScreen from '../screens/Auth/VerificationScreen';

// Import Splash Screen
import SplashScreen from '../screens/Common/SplashScreen';

const Stack = createStackNavigator(); 

function ProviderNavigator() {
  const { user, token, setUser, storage, setisheaderback, setrootScreen, rootScreen, profileStatus, fetchProfile } = useContext(AppContext);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => { 
    fetchProfile()
  }, []);

  useEffect(() => { 
    const initializeApp = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // setUser(null); // For demo, set to false to see auth flow
      setIsSplashVisible(false); 
    };
 
 
      const checkRootAccess = async () => {
        profileStatus()
        console.log(user)  
        // console.log(storage.get('token'))   
        // setrootScreen('ProviderDashboard');
     };


    checkRootAccess()
    initializeApp();
  }, [user]);

  if (isSplashVisible) {
    return <SplashScreen />;
  }


 

  return (
    // NavigationContainer removed from here
    <Stack.Navigator
      initialRouteName={rootScreen}
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
      <Stack.Screen name="IntroEarning" component={IntroEarningScreen}/>            
      <Stack.Screen name="KYCStatus" component={KYCStatusScreen} />
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
          <Stack.Screen name="ProfileUpdate" component={ProfileUpdateScreen} />
        </> 
      ) : (
        // =========== MAIN APP SCREENS ===========
        <>
          <Stack.Screen name="ProviderOTPLogin" component={ProviderOTPLoginScreen}/>            
          <Stack.Screen name="ProviderDashboard" component={DashboardScreen}/>

          <Stack.Screen name="Bookings" component={BookingListScreen}/>
          <Stack.Screen name="BookingDetail" component={BookingDetailScreen}/> 

          <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen}/> 
          <Stack.Screen name="SelfieCaptureScreen" component={SelfieCaptureScreen}/> 
          <Stack.Screen name="MediaCaptureScreen" component={MediaCaptureScreen}/> 
          <Stack.Screen name="CompleteBookingScreen" component={CompleteBookingScreen}/> 
          <Stack.Screen name="AddItemScreen" component={AddItemScreen}/> 

          <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen}/>
          <Stack.Screen name="ProfileUpdate" component={ProfileUpdateScreen} />

          <Stack.Screen name="KycScreen" component={KYCUpdateScreen} />

          <Stack.Screen name="Training" component={TrainingScheduleScreen} />
          <Stack.Screen name="TrainingStatus" component={TrainingStatusScreen} />

          <Stack.Screen name="TodayJobs" component={TodayJobsScreen}/>            
          <Stack.Screen name="JobDetails" component={JobDetailsScreen}/>                        

          <Stack.Screen name="Earnings" component={EarningsScreen}/>
          <Stack.Screen name="EarningDetails" component={EarningDetailsScreen}/>

          <Stack.Screen name="Wallet" component={WalletScreen}/>
          <Stack.Screen name="AddWallet" component={AddWalletScreen}/>

          <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen}/>
          <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen}/>

          <Stack.Screen name="Schedule" component={ScheduleScreen}/>            
          <Stack.Screen name="Performance" component={PerformanceScreen}/>            
          <Stack.Screen name="Tools" component={ToolsScreen}/>
          
          <Stack.Screen name="Profile" component={ProfileScreen}/>
          <Stack.Screen name="Settings" component={SettingsScreen}/>
          <Stack.Screen name="Support" component={SupportScreen}/>
          <Stack.Screen name="TermsCondition" component={TermsConditionsScreen}/>
        </>
      )}
    </Stack.Navigator>
  );
}

export default ProviderNavigator;