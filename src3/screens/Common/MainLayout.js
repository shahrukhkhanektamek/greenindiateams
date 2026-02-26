import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppContext } from '../../Context/AppContext';
import FooterMenu from '../../components/Provider/FooterMenu';
import { colors } from '../../styles/colors';

// Navigation service imports
import { 
  goBack, 
  reset, 
  navigate, 
  getCurrentRouteName,
  onNavigationStateChange 
} from "../../navigation/navigationService"; 
import MovableButton from '../../components/Common/MovableButton';

const MainLayout = ({ children, route }) => {
  const { 
    user, 
    profileStatus,
    rootType
  } = useContext(AppContext);
  
  const [currentScreen, setCurrentScreen] = useState('');
  let type = '';

  // Get current screen from navigation service
  useEffect(() => {

    const profileStatusvar = profileStatus();
    type = profileStatusvar?.type;
    // Get initial screen
    const initialScreen = getCurrentRouteName();
    if (initialScreen) {
      setCurrentScreen(initialScreen);
    }

    // Subscribe to navigation changes
    const unsubscribe = onNavigationStateChange((routeName) => {
      if (routeName) {
        setCurrentScreen(routeName);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Check if footer should be shown
  const shouldShowFooter = () => {
    if (!user) return false;
    if (type=='new') return false;
    
    const hideFooterOn = [
      'Intro',
      'IntroEarning', 
      'ProviderLogin',
      'ProviderOTPLogin',
      'ProviderForgotPassword',
      'ProviderSignup',
      'Verification',
      'SplashScreen',
      'KYCStatus',
      'TrainingStatus',
      'Support',
      'TermsCondition',
      'KycScreen',
      'KYCView',
      'TrainingHistory',
      'Training',
      'ProfileUpdate',
      'BookingDetail',
      'OTPVerificationScreen',
      'SelfieCaptureScreen',
      'MediaCaptureScreen',
      'CompleteBookingScreen',
      'PartsSelectionScreen',
      'EarningDetails',
      'AddWallet',
      'TransactionHistory',
      'TransactionDetails',
      'Schedule',
      'Performance',
      'Tools',
      'JobDetails',
    ];
    
    return !hideFooterOn.includes(currentScreen);
  };

  // Check if footer should be shown
  const shouldShowSupport = () => {
    if (!user) return false;
    if (type=='new') return false;
    
    const hideFooterOn = [
      'Intro',
      'IntroEarning', 
      'ProviderLogin',
      'ProviderOTPLogin',
      'ProviderForgotPassword',
      'ProviderSignup',
      'Verification',
      'SplashScreen',
      'KYCStatus',
      'TrainingStatus',
      'Support',
      'TermsCondition',
      'KycScreen',
      'KYCView',
      'TrainingHistory',
      'Training',
      'ProfileUpdate',
      'BookingDetail',
      'OTPVerificationScreen',
      'SelfieCaptureScreen',
      'MediaCaptureScreen',
      'CompleteBookingScreen',
      'PartsSelectionScreen',
      'EarningDetails',
      'AddWallet',
      'TransactionHistory',
      'TransactionDetails',
      'Schedule',
      'Performance',
      'Tools',
      'JobDetails',
    ];
    
    return !hideFooterOn.includes(currentScreen);
  };





  return (
    <>
      {/* Main Content */}
      <View style={styles.container}>
        {children}
      </View>

      {/* Footer Menu - conditional show */}
      {shouldShowFooter() && (
        <FooterMenu />
      )}

      {shouldShowSupport() && (
        <MovableButton 
        onPress={()=>{navigate('Support')}}
        buttonText="Help"
        initialPosition="right-bottom"
        />
      )}
      
    </>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 1000,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default MainLayout;