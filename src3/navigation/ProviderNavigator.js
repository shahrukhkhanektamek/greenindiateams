import React, { useContext, useEffect, useState } from "react";
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppContext } from "../Context/AppContext";

// Import Provider Screens
import DashboardScreen from '../screens/Provider/DashboardScreen';

import BookingListScreen from '../screens/Provider/Booking/BookingListScreen';
import BookingDetailScreen from '../screens/Provider/Booking/BookingDetailScreen';

import StartServiceScreen from '../screens/Provider/Booking/StartServiceScreen';
import OTPVerificationScreen from '../screens/Provider/Booking/OTPVerificationScreen';
import SelfieCaptureScreen from '../screens/Provider/Booking/SelfieCaptureScreen';
import MediaCaptureScreen from '../screens/Provider/Booking/MediaCaptureScreen';
import CompleteBookingScreen from '../screens/Provider/Booking/CompleteBookingScreen';
import PartsSelectionScreen from '../screens/Provider/Booking/PartsSelectionScreen';
import QrPaymentScreen from '../screens/Provider/Booking/QrPaymentScreen';


import ProviderProfileScreen from '../screens/Provider/Profile/ProviderProfileScreen';
import ProfileUpdateScreen from '../screens/Provider/Profile/ProfileUpdateScreen';

import KYCUpdateScreen from '../screens/Provider/Kyc/KYCUpdateScreen';
import KYCViewScreen from '../screens/Provider/Kyc/KYCViewScreen';
import KYCStatusScreen from '../screens/Provider/Kyc/KYCStatusScreen';
 
import TrainingHistoryScreen from '../screens/Provider/Training/TrainingHistoryScreen';
import TrainingScheduleScreen from '../screens/Provider/Training/TrainingScheduleScreen';
import TrainingStatusScreen from '../screens/Provider/Training/TrainingStatusScreen';

import ServiceAvailabilityScreen from '../screens/Provider/TimeTable/ServiceAvailabilityScreen';

import ZonesScreen from '../screens/Provider/Zone/ZonesScreen';

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
    fetchProfile();
  }, []);

  useEffect(() => { 
    const initializeApp = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSplashVisible(false); 
    };
 
    const checkRootAccess = async () => {
      profileStatus();
    };

    checkRootAccess();
    initializeApp();
  }, [user]);

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  // Common screen options for all screens
  const commonScreenOptions = {
    headerShown: false, // MainLayout handles the header
    animation: 'slide_from_right',
    gestureEnabled: true,
    cardStyle: {
      backgroundColor: '#FFFFFF',
    },
  };

  // Options for screens that need custom animations
  const noAnimationOptions = {
    ...commonScreenOptions,
    animation: 'none',
  };

  // Options for modal-like screens
  const modalOptions = {
    ...commonScreenOptions,
    presentation: 'modal',
    animation: 'slide_from_bottom',
  };

  return (
    <Stack.Navigator
      initialRouteName={rootScreen}
      screenOptions={commonScreenOptions}
    >
      {/* =========== COMMON SCREENS (Always Available) =========== */}
      <Stack.Screen 
        name="IntroEarning" 
        component={IntroEarningScreen}
        options={noAnimationOptions} 
      />            
      
      <Stack.Screen 
        name="KYCStatus" 
        component={KYCStatusScreen}
      />
      
      <Stack.Screen 
        name="Support" 
        component={SupportScreen}
      />
      
      <Stack.Screen 
        name="TermsCondition" 
        component={TermsConditionsScreen}
      />
      
      {/* =========== AUTH FLOW (When user is NOT logged in) =========== */}
      {!user ? (
        <>
          {/* Splash/Intro Screens */}
          <Stack.Screen 
            name="Intro" 
            component={IntroScreen}
            options={noAnimationOptions}
          />            
          
          {/* Login/Signup Screens */}
          <Stack.Screen 
            name="ProviderLogin" 
            component={ProviderLoginScreen}
          />            
          
          <Stack.Screen 
            name="ProviderOTPLogin" 
            component={ProviderOTPLoginScreen}
          />            
          
          <Stack.Screen 
            name="ProviderForgotPassword" 
            component={ProviderForgotPasswordScreen}
          />            
          
          <Stack.Screen 
            name="ProviderSignup" 
            component={ProviderSignupScreen}
          />            
          
          <Stack.Screen 
            name="Verification" 
            component={VerificationScreen}
          />            
          
          {/* Dashboard for non-logged in users (if needed) */}
          <Stack.Screen 
            name="ProviderDashboard" 
            component={DashboardScreen}
          />
          
          {/* Profile Update for non-logged in users (if needed) */}
          <Stack.Screen 
            name="ProfileUpdate" 
            component={ProfileUpdateScreen}
          />
        </> 
      ) : (
        /* =========== MAIN APP SCREENS (When user IS logged in) =========== */
        <>
          {/* =========== DASHBOARD & MAIN SCREENS =========== */}
          <Stack.Screen 
            name="ProviderDashboard" 
            component={DashboardScreen}
          />
          
          {/* =========== BOOKING RELATED SCREENS =========== */}
          <Stack.Screen 
            name="Bookings" 
            component={BookingListScreen}
          />
          
          <Stack.Screen 
            name="BookingDetail" 
            component={BookingDetailScreen}
          /> 

          <Stack.Screen 
            name="OTPVerificationScreen" 
            component={OTPVerificationScreen}
            options={modalOptions}
          /> 

          <Stack.Screen 
            name="StartServiceScreen" 
            component={StartServiceScreen}
            options={modalOptions}
          /> 
          
          <Stack.Screen 
            name="SelfieCaptureScreen" 
            component={SelfieCaptureScreen}
            options={modalOptions}
          /> 
          
          <Stack.Screen 
            name="MediaCaptureScreen" 
            component={MediaCaptureScreen}
            options={modalOptions}
          /> 
          
          <Stack.Screen 
            name="CompleteBookingScreen" 
            component={CompleteBookingScreen}
            options={modalOptions}
          /> 
          
          <Stack.Screen 
            name="PartsSelectionScreen" 
            component={PartsSelectionScreen}
            options={modalOptions}
          /> 
          
          <Stack.Screen 
            name="QrPaymentScreen" 
            component={QrPaymentScreen}
            options={modalOptions}
          /> 

          {/* =========== PROFILE SCREENS =========== */}
          <Stack.Screen 
            name="ProviderProfile" 
            component={ProviderProfileScreen}
          />
          
          <Stack.Screen 
            name="ProfileUpdate" 
            component={ProfileUpdateScreen}
          />

          {/* =========== KYC SCREENS =========== */}
          <Stack.Screen 
            name="KycScreen" 
            component={KYCUpdateScreen}
          /> 
          
          <Stack.Screen 
            name="KYCView" 
            component={KYCViewScreen}
          /> 

          {/* =========== TRAINING SCREENS =========== */}
          <Stack.Screen 
            name="TrainingHistory" 
            component={TrainingHistoryScreen}
          /> 
          
          <Stack.Screen 
            name="Training" 
            component={TrainingScheduleScreen}
          /> 
          
          <Stack.Screen 
            name="TrainingStatus" 
            component={TrainingStatusScreen}
          />

          {/* =========== AVAILABILITY SCREENS =========== */}
          <Stack.Screen 
            name="AvailabilityScreen" 
            component={ServiceAvailabilityScreen}
          />

          {/* =========== ZONE SCREENS =========== */}
          <Stack.Screen 
            name="ZonesScreen" 
            component={ZonesScreen}
          />

          {/* =========== JOBS SCREENS =========== */}
          <Stack.Screen 
            name="TodayJobs" 
            component={TodayJobsScreen}
          />            
          
          <Stack.Screen 
            name="JobDetails" 
            component={JobDetailsScreen}
          />                        

          {/* =========== EARNINGS SCREENS =========== */}
          <Stack.Screen 
            name="Earnings" 
            component={EarningsScreen}
          />
          
          <Stack.Screen 
            name="EarningDetails" 
            component={EarningDetailsScreen}
          />

          {/* =========== WALLET SCREENS =========== */}
          <Stack.Screen 
            name="Wallet" 
            component={WalletScreen}
          />
          
          <Stack.Screen 
            name="AddWallet" 
            component={AddWalletScreen}
            options={modalOptions}
          />

          {/* =========== TRANSACTION SCREENS =========== */}
          <Stack.Screen 
            name="TransactionHistory" 
            component={TransactionHistoryScreen}
          />
          
          <Stack.Screen 
            name="TransactionDetails" 
            component={TransactionDetailsScreen}
          />

          {/* =========== OTHER SCREENS =========== */}
          <Stack.Screen 
            name="Schedule" 
            component={ScheduleScreen}
          />            
          
          <Stack.Screen 
            name="Performance" 
            component={PerformanceScreen}
          />            
          
          <Stack.Screen 
            name="Tools" 
            component={ToolsScreen}
          />
          
          {/* =========== COMMON APP SCREENS =========== */}
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
          />
          
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
          />

          {/* =========== AUTH SCREENS (for logged in users if needed) =========== */}
          <Stack.Screen 
            name="ProviderOTPLogin" 
            component={ProviderOTPLoginScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default ProviderNavigator; 