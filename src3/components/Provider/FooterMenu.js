import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { colors } from "../../styles/colors";
import { AppContext } from "../../Context/AppContext";

// Navigation service imports
import { 
  navigate, 
  getCurrentScreen,
  onNavigationStateChange,
  getCurrentRouteName 
} from "../../navigation/navigationService";

const { width } = Dimensions.get('window');

const FooterMenu = () => {
    const { user, setLoading, currentScreen: contextScreen } = useContext(AppContext);
    const [currentScreen, setCurrentScreen] = useState(contextScreen || '');
    
    console.log(getCurrentRouteName)
  // Get current screen from navigation service
  useEffect(() => {
    // Get initial screen
    const getScreen = () => { 
      const screen = getCurrentScreen() || getCurrentRouteName();
      if (screen) {
        setCurrentScreen(screen);
      }
    };

    getScreen();

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
  
  // Use either context screen or local state
  const activeScreen = contextScreen || currentScreen;
  
  const footerItems = [
    { 
      id: 'dashboard', 
      label: 'Home', 
      icon: 'home', 
      screen: 'ProviderDashboard',
      activeIcon: 'home'
    },
    { 
      id: 'bookings', 
      label: 'Bookings', 
      icon: 'list-alt', 
      screen: 'Bookings',
      activeIcon: 'list-alt'
    },
    { 
      id: 'TargetScreen', 
      label: 'Target', 
      icon: 'track-changes', 
      screen: 'TargetScreen',
      activeIcon: 'track-changes'
    },
    { 
      id: 'Earnings', 
      label: 'Earnings', 
      icon: 'currency-rupee', 
      screen: 'Earnings',
      activeIcon: 'person'
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: 'person-outline', 
      screen: 'ProviderProfile',
      activeIcon: 'person'
    },
  ];

  // Check if current route matches
  const isActive = (screenName) => {
    return activeScreen === screenName;
  };

  const handlePress = (screen) => {
    // Don't navigate if already on the same screen
    if (activeScreen === screen) return;
    
    navigate(screen);
    // Close sidebar if open
    setLoading('sideBar', false);
  };

  // Don't render if no user
  if (!user) return null;

  // Don't render on screens that shouldn't show footer
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
     

//  console.log(currentScreen) 
//  if(!getCurrentRouteName)
//  {
//     return null; 
//  }
//   if (hideFooterOn.includes(getCurrentRouteName)) {
//     return null; 
//   }

  return (
    <View style={styles.container}> 
      {footerItems.map((item) => {
        const active = isActive(item.screen);
        const iconName = active ? (item.activeIcon || item.icon) : item.icon;
        
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.footerItem,
              active && styles.footerItemActive
            ]}
            onPress={() => handlePress(item.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Icon 
                name={iconName} 
                size={24} 
                color={active ? colors.primary : colors.textMuted} 
              />
              {active && <View style={styles.activeIndicator} />}
            </View>
            <Text style={[
              styles.footerLabel,
              { color: active ? colors.primary : colors.textMuted }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    zIndex: 1000,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  footerItemActive: {
    // Optional: Add active styling if needed
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  footerLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default FooterMenu;