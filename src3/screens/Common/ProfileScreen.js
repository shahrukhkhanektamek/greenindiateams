import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';
import styles, { clsx } from '../../styles/globalStyles';
import responsive from '../../utils/responsive';
import { colors } from '../../styles/colors';
import Header from '../../components/Common/Header';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    name: 'Rajesh Kumar',
    phone: '+91 9876543210',
    email: 'rajesh.kumar@example.com',
    serviceCategory: 'AC Repair Specialist',
    experience: '5 years',
    rating: 4.8,
    totalJobs: 1247,
    memberSince: '2020',
    location: 'Delhi, NCR',
    about: 'Professional AC repair technician with 5+ years of experience. Specialized in all types of AC repairs and maintenance.',
  });

  const [settings, setSettings] = useState({
    notifications: true,
    smsAlerts: true,
    emailUpdates: false,
    locationTracking: true,
    autoAcceptJobs: false,
    offlineMode: false,
  });

  const [profileImage, setProfileImage] = useState('https://picsum.photos/200?random=provider');

  const menuItems = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: 'person',
      color: colors.primary,
      onPress: () => navigation.navigate('PersonalInfo', { profile }),
    },
    {
      id: 'documents',
      title: 'My Documents',
      icon: 'description',
      color: colors.success,
      badge: '3',
      onPress: () => navigation.navigate('Documents'),
    },
    {
      id: 'bank',
      title: 'Bank & Payment',
      icon: 'account-balance',
      color: colors.secondary,
      onPress: () => navigation.navigate('BankDetails'),
    },
    {
      id: 'services',
      title: 'My Services',
      icon: 'handyman',
      color: colors.warning,
      onPress: () => navigation.navigate('MyServices'),
    },
    {
      id: 'areas',
      title: 'Service Areas',
      icon: 'location-on',
      color: colors.error,
      onPress: () => navigation.navigate('ServiceAreas'),
    },
    {
      id: 'tools',
      title: 'My Tools & Equipment',
      icon: 'build',
      color: colors.info,
      onPress: () => navigation.navigate('Tools'),
    },
    {
      id: 'training',
      title: 'Training & Certificates',
      icon: 'school',
      color: colors.success,
      badge: '2 new',
      onPress: () => navigation.navigate('Training'),
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: 'help',
      color: colors.primary,
      onPress: () => navigation.navigate('Support'),
    },
    {
      id: 'about',
      title: 'About App',
      icon: 'info',
      color: colors.textMuted,
      onPress: () => navigation.navigate('About'),
    },
  ];

  const handleImagePick = () => {
    const options = {
      title: 'Select Profile Picture',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        setProfileImage(source.uri);
      }
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'ProviderLogin' }],
            });
          },
          style: 'destructive',
        },
      ]
    );
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={clsx(
        styles.flexRow,
        styles.itemsCenter,
        styles.justifyBetween,
        styles.p4,
        styles.bgWhite,
        styles.roundedLg,
        styles.mb2,
        styles.shadowSm
      )}
      onPress={item.onPress}
    >
      <View style={clsx(styles.flexRow, styles.itemsCenter)}>
        <View style={clsx(
          styles.roundedFull,
          styles.p2,
          styles.mr3,
          { backgroundColor: `${item.color}20` }
        )}>
          <Icon name={item.icon} size={20} color={item.color} />
        </View>
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
          {item.title}
        </Text>
      </View>
      <View style={clsx(styles.flexRow, styles.itemsCenter)}>
        {item.badge && (
          <View style={clsx(
            styles.bgPrimary,
            styles.roundedFull,
            styles.px2,
            styles.py1,
            styles.mr2
          )}>
            <Text style={clsx(styles.textXs, styles.textWhite, styles.fontMedium)}>
              {item.badge}
            </Text>
          </View>
        )}
        <Icon name="chevron-right" size={20} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="My Profile"
        showBack={false}
        showNotification={false}
        type="white"
        rightAction
        rightActionIcon="settings"
        onRightActionPress={() => navigation.navigate('Settings')}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow, styles.itemsCenter)}>
            <TouchableOpacity
              style={clsx(styles.positionRelative)}
              onPress={handleImagePick}
            >
              <Image
                source={{ uri: profileImage }}
                style={clsx(styles.roundedFull, { width: 100, height: 100 })}
              />
              <View style={clsx(
                styles.positionAbsolute,
                styles.bottom0,
                styles.right0,
                styles.bgPrimary,
                styles.roundedFull,
                styles.p2,
                styles.border,
                styles.borderWhite,
                styles.border4
              )}>
                <Icon name="camera-alt" size={16} color={colors.white} />
              </View>
            </TouchableOpacity>

            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack, styles.mt4)}>
              {profile.name}
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mt1)}>
              {profile.serviceCategory}
            </Text>

            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt2)}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mx1)}>
                {profile.rating}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                ({profile.totalJobs} jobs)
              </Text>
            </View>

            <TouchableOpacity
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.mt4,
                styles.px4,
                styles.py2,
                styles.border,
                styles.borderPrimary,
                styles.roundedFull
              )}
              onPress={() => navigation.navigate('EditProfile', { profile })}
            >
              <Icon name="edit" size={16} color={colors.primary} />
              <Text style={clsx(styles.textPrimary, styles.fontMedium, styles.ml1)}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Profile Overview
          </Text>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb4)}>
            <View style={clsx(styles.itemsCenter, styles.flex1)}>
              <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
                {profile.experience}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                Experience
              </Text>
            </View>
            <View style={clsx(styles.itemsCenter, styles.flex1)}>
              <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess)}>
                {profile.memberSince}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                Member Since
              </Text>
            </View>
            <View style={clsx(styles.itemsCenter, styles.flex1)}>
              <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSecondary)}>
                {profile.location.split(',')[0]}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                Location
              </Text>
            </View>
          </View>

          {/* About Section */}
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb2)}>
              About Me
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted)}>
              {profile.about}
            </Text>
          </View>
        </View>

        {/* Settings */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Account Settings
          </Text>
          
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.overflowHidden, styles.shadow)}>
            {[
              { key: 'notifications', label: 'Push Notifications', icon: 'notifications' },
              { key: 'smsAlerts', label: 'SMS Alerts', icon: 'sms' },
              { key: 'emailUpdates', label: 'Email Updates', icon: 'email' },
              { key: 'locationTracking', label: 'Location Tracking', icon: 'location-on' },
              { key: 'autoAcceptJobs', label: 'Auto Accept Jobs', icon: 'flash-on' },
              { key: 'offlineMode', label: 'Go Offline', icon: 'wifi-off' },
            ].map((setting, index) => (
              <View key={setting.key}>
                <TouchableOpacity
                  style={clsx(
                    styles.flexRow,
                    styles.itemsCenter,
                    styles.justifyBetween,
                    styles.p4
                  )}
                  onPress={() => toggleSetting(setting.key)}
                >
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    <Icon name={setting.icon} size={20} color={colors.text} style={clsx(styles.mr3)} />
                    <Text style={clsx(styles.textBase, styles.textBlack)}>
                      {setting.label}
                    </Text>
                  </View>
                  <Switch
                    value={settings[setting.key]}
                    onValueChange={() => toggleSetting(setting.key)}
                    trackColor={{ false: colors.gray, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                </TouchableOpacity>
                {index < 5 && <View style={clsx(styles.hPx, styles.bgBorder)} />}
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            More Options
          </Text>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Logout Button */}
        <View style={clsx(styles.mx4, styles.mt4, styles.mb6)}>
          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.p4,
              styles.bgErrorLight,
              styles.roundedLg
            )}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color={colors.error} />
            <Text style={clsx(styles.textError, styles.textLg, styles.fontBold, styles.ml2)}>
              Logout
            </Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter, styles.mt4)}>
            UrbanService Partner App v2.1.4
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;