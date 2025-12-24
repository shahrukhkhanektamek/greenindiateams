import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { colors } from "../../styles/colors";
import { AppContext } from "../../Context/AppContext";
import { navigate, reset } from '../../navigation/navigationService';

const { width, height } = Dimensions.get('window');

const CustomSidebar = ({ state, isVisible, onClose }) => {
  const { setUser, user, setLoading, storage, UploadUrl } = useContext(AppContext);

 
  
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [sidebarOpen, setSidebarOpen] = useState(isVisible);

 

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', screen: 'MainTabs' },
    { id: 'profile', label: 'Profile', icon: 'person', screen: 'ProviderProfile' },
    { id: 'kyc', label: 'KYC', icon: 'verified', screen: 'KYCStatus' },
    { id: 'training', label: 'Training', icon: 'school', screen: 'TrainingStatus' },
    { id: 'bookings', label: 'Bookings', icon: 'list-alt', screen: 'Bookings' },
    { id: 'zones', label: 'Zones', icon: 'list-alt', screen: 'ZonesScreen' },
    // { id: 'todayJobs', label: "Today's Jobs", icon: 'today', screen: 'TodayJobs' },
    { id: 'earnings', label: 'Earnings', icon: 'attach-money', screen: 'Earnings' },
    // { id: 'transaction', label: 'Transaction History', icon: 'history', screen: 'TransactionHistory' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet', screen: 'Wallet' },
    // { id: 'performance', label: 'Performance', icon: 'trending-up', screen: 'Performance' },
    // { id: 'tools', label: 'Tools & Equipment', icon: 'handyman', screen: 'Tools' },
    { id: 'support', label: 'Help & Support', icon: 'support-agent', screen: 'Support' },
    // { id: 'settings', label: 'Settings', icon: 'settings', screen: 'Settings' },
  ];

  // Open animation
  useEffect(() => {
    if (isVisible) {
      setSidebarOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setSidebarOpen(false);
      });
    }
  }, [isVisible]);

  const closeSidebar = () => {
    setLoading('sideBar', false)
  };

  const handleLogout = () => {
    setUser(null);
    storage.delete('token');
    storage.delete('user');
    closeSidebar();


    
    reset('ProviderOTPLogin')

  };

  const isActiveRoute = (routeName) => {
    if (!state || !state.routes || !state.index) return false;
    const currentRoute = state.routes[state.index]?.name;
    return currentRoute === routeName;
  };

  const MenuItem = ({ item }) => {
    const isActive = isActiveRoute(item.screen);
    
    return (
      <TouchableOpacity
        style={[
          styles.menuItem,
          isActive && styles.activeMenuItem
        ]}
        onPress={() => {
          navigate(item.screen);
          closeSidebar();
        }}
        activeOpacity={0.7}
      >
        <View style={[
          styles.menuIcon,
          isActive && styles.activeMenuIcon
        ]}>
          <Icon 
            name={item.icon} 
            size={20} 
            color={isActive ? colors.white : colors.primary} 
          />
        </View>
        <Text style={[
          styles.menuText,
          isActive && styles.activeMenuText
        ]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // If sidebar is closed, don't render anything
  if (!sidebarOpen) return null;

  return (
    <Modal
      transparent={true}
      visible={sidebarOpen}
      animationType="none"
      onRequestClose={closeSidebar}
    >
      <View style={styles.modalContainer}>
        {/* Overlay */}
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1}
          onPress={closeSidebar}
        >
          <Animated.View 
            style={[
              styles.overlayBackground,
              {
                opacity: fadeAnim
              }
            ]}
          />
        </TouchableOpacity>
        
        {/* Sidebar Content */}
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity 
            onPress={closeSidebar} 
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={24} color={colors.white} />
          </TouchableOpacity>

          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileRow}>
              <Image 
                source={{ uri: UploadUrl+''+user?.profileImage }} 
                style={styles.profileImage}
              />
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileID}>ID: RRR1000</Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={14} color={colors.warning} />
                  <Text style={styles.ratingText}>
                    {user.averageRating} • {user?.categories[0]?.name}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.totalEarning}</Text>
                <Text style={styles.statLabel}>Total Earnings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.completedJob}</Text>
                <Text style={styles.statLabel}>Jobs Completed</Text>
              </View>
            </View>
          </View>

          {/* Menu List */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            style={styles.menuContainer}
            contentContainerStyle={styles.menuContent}
          >
            {menuItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}

            {/* Divider */}
            {/* <View style={styles.divider} /> */}

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.errorLight }]}>
                <Icon name="logout" size={20} color={colors.error} />
              </View>
              <Text style={[styles.menuText, { color: colors.error }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </ScrollView>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 36,
    height: 36,
    backgroundColor: colors.primary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileSection: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 50,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.white,
    marginRight: 12,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 2,
  },
  profileID: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: colors.white,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  menuContainer: {
    flex: 1,
  },
  menuContent: {
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  activeMenuItem: {
    backgroundColor: colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeMenuIcon: {
    backgroundColor: colors.primary,
  },
  menuText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  activeMenuText: {
    color: colors.primary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.gray100,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  version: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default CustomSidebar;