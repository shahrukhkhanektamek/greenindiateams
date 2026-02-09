import React, { useContext, useEffect, useState } from "react";
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppContext } from "../Context/AppContext";
import MainLayout from '../screens/Common/MainLayout'; // MainLayout import karo

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
import BookingDoneScreen from '../screens/Provider/Booking/BookingDoneScreen';
import TargetScreen from '../screens/Provider/Target/TargetScreen';
import WinnersHistoryScreen from '../screens/Provider/Winner/WinnersHistoryScreen';
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
import BankTransferListScreen  from '../screens/Provider/Earning/BankTransferListScreen';

import WalletScreen from '../screens/Provider/Wallet/WalletScreen';
import AddWalletScreen from '../screens/Provider/Wallet/AddWalletScreen';
import TransactionHistoryScreen from '../screens/Provider/Transaction/TransactionHistoryScreen';
import TransactionDetailsScreen from '../screens/Provider/Transaction/TransactionDetailsScreen';
import ScheduleScreen from '../screens/Provider/ScheduleScreen';
// import PerformanceScreen from '../screens/Provider/PerformanceScreen';
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

// =========== WRAPPER COMPONENTS ===========
// Sabhi logged-in screens ke liye wrappers

// Dashboard with MainLayout
const DashboardWithLayout = (props) => (
  <MainLayout>
    <DashboardScreen {...props} />
  </MainLayout>
);

// Booking List with MainLayout
const BookingListWithLayout = (props) => (
  <MainLayout>
    <BookingListScreen {...props} />
  </MainLayout>
);

// Today Jobs with MainLayout
const TodayJobsWithLayout = (props) => (
  <MainLayout>
    <TodayJobsScreen {...props} />
  </MainLayout>
);

// Earnings with MainLayout
const EarningsWithLayout = (props) => (
  <MainLayout>
    <EarningsScreen {...props} />
  </MainLayout>
);

// BankTransferListScreen with MainLayout
const BankTransferListScreenWithLayout = (props) => (
  <MainLayout>
    <BankTransferListScreen {...props} />
  </MainLayout>
);

// Wallet with MainLayout
const WalletWithLayout = (props) => (
  <MainLayout>
    <WalletScreen {...props} />
  </MainLayout>
);

// Provider Profile with MainLayout
const ProviderProfileWithLayout = (props) => (
  <MainLayout>
    <ProviderProfileScreen {...props} />
  </MainLayout>
);

// Settings with MainLayout
const SettingsWithLayout = (props) => (
  <MainLayout>
    <SettingsScreen {...props} />
  </MainLayout>
);

// Profile with MainLayout
const ProfileWithLayout = (props) => (
  <MainLayout>
    <ProfileScreen {...props} />
  </MainLayout>
);

// Target with MainLayout
const TargetWithLayout = (props) => (
  <MainLayout>
    <TargetScreen {...props} />
  </MainLayout>
);

// Winners History with MainLayout
const WinnersHistoryWithLayout = (props) => (
  <MainLayout>
    <WinnersHistoryScreen {...props} />
  </MainLayout>
);

// Training History with MainLayout
const TrainingHistoryWithLayout = (props) => (
  <MainLayout>
    <TrainingHistoryScreen {...props} />
  </MainLayout>
);

// Training Schedule with MainLayout
const TrainingScheduleWithLayout = (props) => (
  <MainLayout>
    <TrainingScheduleScreen {...props} />
  </MainLayout>
);

// Service Availability with MainLayout
const ServiceAvailabilityWithLayout = (props) => (
  <MainLayout>
    <ServiceAvailabilityScreen {...props} />
  </MainLayout>
);

// Zones with MainLayout
const ZonesWithLayout = (props) => (
  <MainLayout>
    <ZonesScreen {...props} />
  </MainLayout>
);

// Transaction History with MainLayout
const TransactionHistoryWithLayout = (props) => (
  <MainLayout>
    <TransactionHistoryScreen {...props} />
  </MainLayout>
);

// Schedule with MainLayout
const ScheduleWithLayout = (props) => (
  <MainLayout>
    <ScheduleScreen {...props} />
  </MainLayout>
);

// Performance with MainLayout
const PerformanceWithLayout = (props) => (
  <MainLayout>
    <PerformanceScreen {...props} />
  </MainLayout>
);

// Tools with MainLayout
const ToolsWithLayout = (props) => (
  <MainLayout>
    <ToolsScreen {...props} />
  </MainLayout>
);

// =========== SCREENS WITHOUT LAYOUT ===========
// Modal screens aur detailed screens jo layout ke andar nahi aayengi
// Yeh screens direct render hongi

// Booking Detail without Layout
const BookingDetailWithoutLayout = (props) => (
  <BookingDetailScreen {...props} />
);

// OTP Verification without Layout
const OTPVerificationWithoutLayout = (props) => (
  <OTPVerificationScreen {...props} />
);

// Start Service without Layout
const StartServiceWithoutLayout = (props) => (
  <StartServiceScreen {...props} />
);

// Selfie Capture without Layout
const SelfieCaptureWithoutLayout = (props) => (
  <SelfieCaptureScreen {...props} />
);

// Media Capture without Layout
const MediaCaptureWithoutLayout = (props) => (
  <MediaCaptureScreen {...props} />
);

// Complete Booking without Layout
const CompleteBookingWithoutLayout = (props) => (
  <CompleteBookingScreen {...props} />
);

// Parts Selection without Layout
const PartsSelectionWithoutLayout = (props) => (
  <PartsSelectionScreen {...props} />
);

// QR Payment without Layout
const QrPaymentWithoutLayout = (props) => (
  <QrPaymentScreen {...props} />
);

// Booking Done without Layout
const BookingDoneWithoutLayout = (props) => (
  <BookingDoneScreen {...props} />
);

// Profile Update without Layout
const ProfileUpdateWithoutLayout = (props) => (
  <ProfileUpdateScreen {...props} />
);

// KYC Update without Layout
const KYCUpdateWithoutLayout = (props) => (
  <KYCUpdateScreen {...props} />
);

// KYC View without Layout
const KYCViewWithoutLayout = (props) => (
  <KYCViewScreen {...props} />
);

// KYC Status without Layout
const KYCStatusWithoutLayout = (props) => (
  <KYCStatusScreen {...props} />
);

// Training Status without Layout
const TrainingStatusWithoutLayout = (props) => (
  <TrainingStatusScreen {...props} />
);

// Job Details without Layout
const JobDetailsWithoutLayout = (props) => (
  <JobDetailsScreen {...props} />
);

// Earning Details without Layout
const EarningDetailsWithoutLayout = (props) => (
  <EarningDetailsScreen {...props} />
);

// Add Wallet without Layout
const AddWalletWithoutLayout = (props) => (
  <AddWalletScreen {...props} />
);

// Transaction Details without Layout
const TransactionDetailsWithoutLayout = (props) => (
  <TransactionDetailsScreen {...props} />
);

// Support without Layout
const SupportWithoutLayout = (props) => (
  <SupportScreen {...props} />
);

// Terms Conditions without Layout
const TermsConditionsWithoutLayout = (props) => (
  <TermsConditionsScreen {...props} />
);

// Main Navigator Component
function ProviderNavigator() {
  const { user, setrootScreen, rootScreen, rootType, profileStatus, fetchProfile } = useContext(AppContext);
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
    headerShown: false,
    animation: 'slide_from_right',
    gestureEnabled: false,
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
      <Stack.Screen 
        name="ProviderOTPLogin" 
        component={ProviderOTPLoginScreen}
      />  
      <Stack.Screen 
        name="IntroEarning" 
        component={IntroEarningScreen}
        options={noAnimationOptions} 
      />
      <Stack.Screen 
        name="Intro" 
        component={IntroScreen}
        options={noAnimationOptions}
      />   
    
     
      <Stack.Screen 
        name="KycScreen" 
        component={KYCUpdateWithoutLayout}
      /> 
      
      {/* =========== SUPPORT & TERMS SCREENS =========== */}
      <Stack.Screen 
        name="Support" 
        component={SupportWithoutLayout}
      />
      
      <Stack.Screen 
        name="TermsCondition" 
        component={TermsConditionsWithoutLayout}
      />

      {/* =========== AUTH FLOW (When user is NOT logged in) =========== */}
      {!user ? (
        <>
          {/* Splash/Intro Screens */}
                   
          
          
          
          {/* Login/Signup Screens */}
          <Stack.Screen 
            name="ProviderLogin" 
            component={ProviderLoginScreen}
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
          
          {/* Dashboard for non-logged in users (if needed) - WITHOUT Layout */}
          <Stack.Screen 
            name="ProviderDashboard" 
            component={DashboardScreen}
          />
        </> 
      ) : (
        /* =========== MAIN APP SCREENS (When user IS logged in) =========== */
        <>
          {/* =========== DASHBOARD & MAIN SCREENS (WITH MainLayout) =========== */}
          <Stack.Screen 
            name="ProviderDashboard" 
            component={DashboardWithLayout}
          />
          
          {/* =========== BOOKING RELATED SCREENS =========== */}
          <Stack.Screen 
            name="Bookings" 
            component={BookingListWithLayout}
          />
          
          {/* Booking Detail without Layout (modal/detailed view) */}
          <Stack.Screen 
            name="BookingDetail" 
            component={BookingDetailWithoutLayout}
          /> 

          {/* Modal booking screens without Layout */}
          <Stack.Screen 
            name="OTPVerificationScreen" 
            component={OTPVerificationWithoutLayout}
            options={modalOptions}
          /> 

          <Stack.Screen 
            name="StartServiceScreen" 
            component={StartServiceWithoutLayout}
            options={modalOptions}
          /> 
          
          <Stack.Screen 
            name="SelfieCaptureScreen" 
            component={SelfieCaptureWithoutLayout}
            options={modalOptions}
          /> 
          
          <Stack.Screen 
            name="MediaCaptureScreen" 
            component={MediaCaptureWithoutLayout}
            options={modalOptions}
          /> 
          
          <Stack.Screen 
            name="CompleteBookingScreen" 
            component={CompleteBookingWithoutLayout}
            // options={modalOptions}
          /> 
          
          <Stack.Screen 
            name="PartsSelectionScreen" 
            component={PartsSelectionWithoutLayout}
          /> 
          
          <Stack.Screen 
            name="QrPaymentScreen" 
            component={QrPaymentWithoutLayout}
          /> 
          
          <Stack.Screen 
            name="BookingDone" 
            component={BookingDoneWithoutLayout}
          /> 
          
          {/* =========== TARGET & WINNERS SCREENS =========== */}
          <Stack.Screen 
            name="TargetScreen" 
            component={TargetWithLayout}
          /> 
          
          <Stack.Screen 
            name="WinnersHistoryScreen" 
            component={WinnersHistoryWithLayout}
          /> 

          {/* =========== PROFILE SCREENS =========== */}
          <Stack.Screen 
            name="ProviderProfile" 
            component={ProviderProfileWithLayout}
          />
          
          {/* Profile Update without Layout */}
          <Stack.Screen 
            name="ProfileUpdate" 
            component={ProfileUpdateWithoutLayout}
          />

          {/* =========== KYC SCREENS =========== */}
          {/* KYC Update without Layout */}
          
          
          {/* KYC View without Layout */}
          <Stack.Screen 
            name="KYCView" 
            component={KYCViewWithoutLayout}
          /> 
          
          {/* KYC Status without Layout */}
          <Stack.Screen 
            name="KYCStatus" 
            component={KYCStatusWithoutLayout}
          />

          {/* =========== TRAINING SCREENS =========== */}
          <Stack.Screen 
            name="TrainingHistory" 
            component={TrainingHistoryWithLayout}
          /> 
          
          <Stack.Screen 
            name="Training" 
            component={TrainingScheduleWithLayout}
          /> 
          
          {/* Training Status without Layout */}
          <Stack.Screen 
            name="TrainingStatus" 
            component={TrainingStatusWithoutLayout}
          />

          {/* =========== AVAILABILITY SCREENS =========== */}
          <Stack.Screen 
            name="AvailabilityScreen" 
            component={ServiceAvailabilityWithLayout}
          />

          {/* =========== ZONE SCREENS =========== */}
          <Stack.Screen 
            name="ZonesScreen" 
            component={ZonesWithLayout}
          />

          {/* =========== JOBS SCREENS =========== */}
          <Stack.Screen 
            name="TodayJobs" 
            component={TodayJobsWithLayout}
          />            
          
          {/* Job Details without Layout */}
          <Stack.Screen 
            name="JobDetails" 
            component={JobDetailsWithoutLayout}
          />                        

          {/* =========== EARNINGS SCREENS =========== */}
          <Stack.Screen 
            name="Earnings" 
            component={EarningsWithLayout}
          />
          
          <Stack.Screen 
            name="BankTransferListScreen" 
            component={BankTransferListScreenWithLayout}
          />
          
          {/* Earning Details without Layout */}
          <Stack.Screen 
            name="EarningDetails" 
            component={EarningDetailsWithoutLayout}
          />

          {/* =========== WALLET SCREENS =========== */}
          <Stack.Screen 
            name="Wallet" 
            component={WalletWithLayout}
          />
          
          {/* Add Wallet without Layout */}
          <Stack.Screen 
            name="AddWallet" 
            component={AddWalletWithoutLayout}
            options={modalOptions}
          />

          {/* =========== TRANSACTION SCREENS =========== */}
          <Stack.Screen 
            name="TransactionHistory" 
            component={TransactionHistoryWithLayout}
          />
          
          {/* Transaction Details without Layout */}
          <Stack.Screen 
            name="TransactionDetails" 
            component={TransactionDetailsWithoutLayout}
          />

          {/* =========== OTHER SCREENS =========== */}
          <Stack.Screen 
            name="Schedule" 
            component={ScheduleWithLayout}
          />            
          
          {/* <Stack.Screen 
            name="Performance" 
            component={PerformanceWithLayout}
          />             */}
          
          <Stack.Screen 
            name="Tools" 
            component={ToolsWithLayout}
          />
          
          {/* =========== COMMON APP SCREENS =========== */}
          <Stack.Screen 
            name="Profile" 
            component={ProfileWithLayout}
          />
          
          <Stack.Screen 
            name="Settings" 
            component={SettingsWithLayout}
          />

          
        </>
      )}
    </Stack.Navigator>
  );
}

export default ProviderNavigator;