import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Header from '../../components/Common/Header';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    // Notification Settings
    newJobAlerts: true,
    paymentAlerts: true,
    ratingAlerts: true,
    promotionalAlerts: false,
    soundEnabled: true,
    vibrationEnabled: true,
    
    // Job Settings
    autoNavigate: true,
    showTraffic: true,
    jobReminderTime: 30, // minutes
    maxJobsPerDay: 8,
    
    // Privacy Settings
    showOnlineStatus: true,
    shareLocation: true,
    showRating: true,
    showEarnings: false,
    
    // App Settings
    darkMode: false,
    language: 'English',
    fontSize: 'Medium',
    dataSaver: false,
    autoUpdate: true,
  });

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali'];
  const fontSizes = ['Small', 'Medium', 'Large', 'Extra Large'];

  const settingsSections = [
    {
      title: 'Notification Settings',
      icon: 'notifications',
      items: [
        {
          id: 'newJobAlerts',
          label: 'New Job Alerts',
          description: 'Get notified about new job requests',
          type: 'switch',
        },
        {
          id: 'paymentAlerts',
          label: 'Payment Alerts',
          description: 'Notifications for payments and withdrawals',
          type: 'switch',
        },
        {
          id: 'ratingAlerts',
          label: 'Rating & Reviews',
          description: 'Get notified when customers rate you',
          type: 'switch',
        },
        {
          id: 'promotionalAlerts',
          label: 'Promotional Offers',
          description: 'Updates about offers and promotions',
          type: 'switch',
        },
        {
          id: 'soundEnabled',
          label: 'Sound',
          description: 'Play sound for notifications',
          type: 'switch',
        },
        {
          id: 'vibrationEnabled',
          label: 'Vibration',
          description: 'Vibrate for notifications',
          type: 'switch',
        },
      ],
    },
    {
      title: 'Job Settings',
      icon: 'work',
      items: [
        {
          id: 'autoNavigate',
          label: 'Auto-Navigate to Jobs',
          description: 'Automatically open maps for job location',
          type: 'switch',
        },
        {
          id: 'showTraffic',
          label: 'Show Traffic Info',
          description: 'Display traffic information in navigation',
          type: 'switch',
        },
        {
          id: 'jobReminderTime',
          label: 'Job Reminder Time',
          description: 'Minutes before job to send reminder',
          type: 'select',
          options: [15, 30, 45, 60],
          unit: 'minutes',
        },
        {
          id: 'maxJobsPerDay',
          label: 'Max Jobs Per Day',
          description: 'Maximum number of jobs to accept per day',
          type: 'select',
          options: [4, 6, 8, 10, 12],
          unit: 'jobs',
        },
      ],
    },
    {
      title: 'Privacy Settings',
      icon: 'privacy-tip',
      items: [
        {
          id: 'showOnlineStatus',
          label: 'Show Online Status',
          description: 'Make your online status visible to customers',
          type: 'switch',
        },
        {
          id: 'shareLocation',
          label: 'Share Live Location',
          description: 'Share your live location during active jobs',
          type: 'switch',
        },
        {
          id: 'showRating',
          label: 'Show My Rating',
          description: 'Display your rating to customers',
          type: 'switch',
        },
        {
          id: 'showEarnings',
          label: 'Show Earnings Publicly',
          description: 'Make your earnings public on leaderboard',
          type: 'switch',
        },
      ],
    },
    {
      title: 'App Settings',
      icon: 'settings',
      items: [
        {
          id: 'darkMode',
          label: 'Dark Mode',
          description: 'Use dark theme throughout the app',
          type: 'switch',
        },
        {
          id: 'language',
          label: 'Language',
          description: 'Preferred language for the app',
          type: 'select',
          options: languages,
        },
        {
          id: 'fontSize',
          label: 'Font Size',
          description: 'Adjust text size throughout the app',
          type: 'select',
          options: fontSizes,
        },
        {
          id: 'dataSaver',
          label: 'Data Saver Mode',
          description: 'Reduce data usage',
          type: 'switch',
        },
        {
          id: 'autoUpdate',
          label: 'Auto Update',
          description: 'Automatically update the app',
          type: 'switch',
        },
      ],
    },
  ];

  const appInfo = {
    version: '2.1.4',
    build: '2024.01.15',
    lastUpdated: '2 days ago',
  };

  const handleToggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            // Reset to default settings
            setSettings({
              newJobAlerts: true,
              paymentAlerts: true,
              ratingAlerts: true,
              promotionalAlerts: false,
              soundEnabled: true,
              vibrationEnabled: true,
              autoNavigate: true,
              showTraffic: true,
              jobReminderTime: 30,
              maxJobsPerDay: 8,
              showOnlineStatus: true,
              shareLocation: true,
              showRating: true,
              showEarnings: false,
              darkMode: false,
              language: 'English',
              fontSize: 'Medium',
              dataSaver: false,
              autoUpdate: true,
            });
            Alert.alert('Success', 'Settings have been reset to default.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderSettingItem = (item) => {
    switch (item.type) {
      case 'switch':
        return (
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
            <View style={clsx(styles.flex1)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                {item.label}
              </Text>
              {item.description && (
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                  {item.description}
                </Text>
              )}
            </View>
            <Switch
              value={settings[item.id]}
              onValueChange={() => handleToggleSetting(item.id)}
              trackColor={{ false: colors.gray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        );

      case 'select':
        return (
          <TouchableOpacity
            style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}
            onPress={() => navigation.navigate('SelectSetting', {
              settingId: item.id,
              title: item.label,
              options: item.options,
              currentValue: settings[item.id],
              onSelect: handleSelectSetting,
            })}
          >
            <View style={clsx(styles.flex1)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                {item.label}
              </Text>
              {item.description && (
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                  {item.description}
                </Text>
              )}
            </View>
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Text style={clsx(styles.textBase, styles.textPrimary, styles.mr2)}>
                {settings[item.id]} {item.unit || ''}
              </Text>
              <Icon name="chevron-right" size={20} color={colors.textLight} />
            </View>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Settings"
        showBack
        onBackPress={() => navigation.goBack()}
        type="white"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={clsx(styles.mx4, styles.mt4)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
              <Icon name={section.icon} size={20} color={colors.primary} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                {section.title}
              </Text>
            </View>

            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.shadow)}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  <View style={clsx(styles.p4)}>
                    {renderSettingItem(item)}
                  </View>
                  {itemIndex < section.items.length - 1 && (
                    <View style={clsx(styles.hPx, styles.bgBorder)} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Action Buttons */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.p4,
              styles.bgPrimary,
              styles.roundedLg,
              styles.mb3
            )}
            onPress={() => Alert.alert('Save Settings', 'All settings have been saved.')}
          >
            <Icon name="save" size={20} color={colors.white} />
            <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold, styles.ml2)}>
              Save Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.p4,
              styles.border,
              styles.borderError,
              styles.roundedLg
            )}
            onPress={handleResetSettings}
          >
            <Icon name="restore" size={20} color={colors.error} />
            <Text style={clsx(styles.textError, styles.textLg, styles.fontBold, styles.ml2)}>
              Reset to Default
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Information */}
        <View style={clsx(styles.mx4, styles.mt4, styles.mb6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            App Information
          </Text>
          
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
            {[
              { label: 'App Version', value: appInfo.version },
              { label: 'Build Number', value: appInfo.build },
              { label: 'Last Updated', value: appInfo.lastUpdated },
              { label: 'Developer', value: 'UrbanService Technologies' },
            ].map((info, index) => (
              <View key={index} style={clsx(styles.flexRow, styles.justifyBetween, styles.mb3)}>
                <Text style={clsx(styles.textBase, styles.textMuted)}>
                  {info.label}
                </Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {info.value}
                </Text>
              </View>
            ))}

            <View style={clsx(styles.hPx, styles.bgBorder, styles.my3)} />

            <TouchableOpacity
              style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mb3)}
              onPress={() => Linking.openURL('https://urbancompany.com/privacy')}
            >
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                Privacy Policy
              </Text>
              <Icon name="open-in-new" size={16} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mb3)}
              onPress={() => Linking.openURL('https://urbancompany.com/terms')}
            >
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                Terms of Service
              </Text>
              <Icon name="open-in-new" size={16} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween)}
              onPress={() => navigation.navigate('About')}
            >
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                About UrbanService
              </Text>
              <Icon name="chevron-right" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Rate App */}
          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.mt4,
              styles.p4,
              styles.bgSuccessLight,
              styles.roundedLg
            )}
            onPress={() => Linking.openURL('market://details?id=com.urbanservice.provider')}
          >
            <Icon name="star" size={20} color={colors.success} />
            <Text style={clsx(styles.textSuccess, styles.textLg, styles.fontBold, styles.ml2)}>
              Rate Our App
            </Text>
          </TouchableOpacity>

          {/* Contact Support */}
          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.mt3,
              styles.p4,
              styles.bgPrimaryLight,
              styles.roundedLg
            )}
            onPress={() => navigation.navigate('ContactSupport')}
          >
            <Icon name="headset-mic" size={20} color={colors.primary} />
            <Text style={clsx(styles.textPrimary, styles.textLg, styles.fontBold, styles.ml2)}>
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={clsx(styles.itemsCenter, styles.mt4, styles.mb6)}>
          <Text style={clsx(styles.textSm, styles.textMuted)}>
            © 2024 UrbanService Technologies
          </Text>
          <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1)}>
            All rights reserved
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;