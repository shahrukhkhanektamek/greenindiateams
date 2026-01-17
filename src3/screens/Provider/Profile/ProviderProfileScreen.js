import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';
import { FlatList } from 'react-native-gesture-handler';

const ProviderProfileScreen = ({ navigation, route }) => {
  const { Toast, Urls, postData, user, UploadUrl, fetchProfile } = useContext(AppContext);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [settings, setSettings] = useState({
    notifications: true,
    smsAlerts: true,
    emailUpdates: false,
    locationTracking: true,
    autoAcceptJobs: false,
    offlineMode: false,
  });

  const menuItems = [
    {
      id: 'areas',
      title: 'Service Areas',
      icon: 'location-on',
      color: colors.error,
      onPress: () => navigation.navigate('ZonesScreen'),
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
      title: 'Terms Condition',
      icon: 'info',
      color: colors.textMuted,
      onPress: () => navigation.navigate('TermsCondition'),
    },
  ];

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await postData(
        {},
        `${Urls.profileDetail}`,
        'GET'
      );

      if (response?.success && response.data) {
        setProfileData(response.data);
        
        // Set profile image if exists
        if (response.data.profileImage) {
          setProfileImage(`${UploadUrl}${response.data.profileImage}`);
        }
        
        // Check if refresh was triggered from route params
        if (route.params?.refresh) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Profile updated successfully',
          });
          navigation.setParams({ refresh: false });
        }
        
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to load profile',
        });
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Failed to load profile data',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [Urls.profileDetail, UploadUrl, postData, Toast, navigation, route.params]);

  // Initial fetch
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Refresh when focused or route params change
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.refresh) {
        fetchProfileData();
      }
    });
    
    return unsubscribe;
  }, [navigation, route.params, fetchProfileData]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfileData();
  }, [fetchProfileData]);

  // Handle image response for modal
  const handleImageResponse = (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image',
      });
    } else if (response.assets && response.assets[0]) {
      setSelectedImage(response.assets[0].uri);
    }
  };

  // Open camera from modal
  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    };
    
    ImagePicker.launchCamera(options, handleImageResponse);
  };

  // Open gallery from modal
  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    };
    
    ImagePicker.launchImageLibrary(options, handleImageResponse);
  };

  // Upload image from modal
  const uploadProfileImage = async () => {
    if (selectedImage && !uploading) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('profileImage', {
          uri: selectedImage,
          type: 'image/jpeg',
          name: `profile_${Date.now()}.jpg`,
        });
        
        const updateResponse = await postData(
          formData,
          `${Urls.profileUpdate}`,
          'POST',
          { isFileUpload: true }
        );
        
        if (updateResponse?.success) {
          setProfileImage(selectedImage);
          await fetchProfileData();
          await fetchProfile();
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Profile picture updated successfully',
          });
          setModalVisible(false);
          setSelectedImage(null);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: updateResponse?.message || 'Failed to update profile picture',
          });
        }
      } catch (error) {
        console.error('Upload image error:', error);
        Toast.show({
          type: 'error',
          text1: 'Upload Failed',
          text2: 'Failed to upload profile picture',
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              // Call logout API if exists
              // await postData({}, Urls.logout, 'POST');
              
              // Navigate to login
              navigation.reset({
                index: 0,
                routes: [{ name: 'ProviderLogin' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              navigation.reset({
                index: 0,
                routes: [{ name: 'ProviderLogin' }],
              });
            }
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'rejected':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  // Manual refresh function
  const refreshProfile = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  if (loading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textMuted, styles.mt3)}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!profileData && !loading) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <Icon name="error-outline" size={48} color={colors.error} />
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt3)}>
          Failed to load profile
        </Text>
        <TouchableOpacity
          style={clsx(styles.mt4, styles.px4, styles.py2, styles.bgPrimary, styles.roundedFull)}
          onPress={refreshProfile}
        >
          <Text style={clsx(styles.textWhite, styles.fontMedium)}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="My Profile"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        rightActionIcon="refresh"
        showProfile={false}
        onRightActionPress={refreshProfile}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile Header */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow, styles.itemsCenter)}>
            <TouchableOpacity
              style={clsx(styles.positionRelative)}
              onPress={() => setModalVisible(true)}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
              ) : (
                <View style={clsx(
                  styles.roundedFull,
                  styles.bgGray300,
                  { width: 100, height: 100 },
                  styles.itemsCenter,
                  styles.justifyCenter
                )}>
                  <Icon name="person" size={48} color={colors.gray500} />
                </View>
              )}
              
              <View style={clsx(
                styles.positionAbsolute,
                styles.bottom0,
                styles.right0,
                styles.bgPrimary,
                styles.roundedFull,
                styles.p2,
                styles.border2,
                styles.borderWhite
              )}>
                <Icon name="camera-alt" size={16} color={colors.white} />
              </View>
            </TouchableOpacity>

            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack, styles.mt4)}>
              {profileData.name || 'Not provided'}
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mt1)}>
              {profileData.categories?.[0]?.name || 'Service Provider'} 
            </Text>

            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt2)}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mx1)}>
                {profileData.averageRating}
              </Text>
              {/* <Text style={clsx(styles.textSm, styles.textMuted)}>
                ({profileData.completedJob || 0} completed jobs)
              </Text> */}
            </View>

            {/* <TouchableOpacity
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
              onPress={() => navigation.navigate('ProfileUpdate', { profileData })}
            >
              <Icon name="edit" size={16} color={colors.primary} />
              <Text style={clsx(styles.textPrimary, styles.fontMedium, styles.ml1)}>
                Edit Profile
              </Text>
            </TouchableOpacity> */}
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
                {profileData.yearOfExperience || 'N/A'}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                Years Experience
              </Text>
            </View>
            <View style={clsx(styles.itemsCenter, styles.flex1)}>
              <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess)}>
                ₹{profileData.totalEarning?.toLocaleString('en-IN') || '0'}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                Total Earnings
              </Text>
            </View>
            <View style={clsx(styles.itemsCenter, styles.flex1)}>
              <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSecondary)}>
                {profileData.completedJob || '0'}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                Jobs Completed
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Info */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Personal Information
          </Text>
          
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
            <View style={clsx(styles.spaceY3)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <Text style={clsx(styles.textBase, styles.textMuted)}>Mobile:</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {profileData.mobile || profileData.user?.mobile || 'Not provided'}
                </Text>
              </View>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <Text style={clsx(styles.textBase, styles.textMuted)}>Email:</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {profileData.email || 'Not provided'}
                </Text>
              </View>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <Text style={clsx(styles.textBase, styles.textMuted)}>Date of Birth:</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {formatDate(profileData.dob)}
                </Text>
              </View>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <Text style={clsx(styles.textBase, styles.textMuted)}>Company:</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {profileData.companyName || 'Not provided'}
                </Text>
              </View>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <Text style={clsx(styles.textBase, styles.textMuted)}>Current Address:</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {profileData.currentAddress || 'Not provided'}
                </Text>
              </View>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <Text style={clsx(styles.textBase, styles.textMuted)}>Experience Level:</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {profileData.experienceLevel || 'Not provided'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* KYC Status */}
        {profileData.kyc && (
          <View style={clsx(styles.mx4, styles.mt4)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              KYC Status
            </Text>
            
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mb3)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                  <View style={clsx(
                    styles.w3,
                    styles.h3,
                    styles.roundedFull,
                    styles.mr2,
                    { backgroundColor: getStatusColor(profileData.kyc.status) }
                  )} />
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    KYC Verification
                  </Text>
                </View>
                <Text style={clsx(
                  styles.textBase,
                  styles.fontMedium,
                  { color: getStatusColor(profileData.kyc.status) }
                )}>
                  {profileData.kyc.status?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
              
              <View style={clsx(styles.spaceY2)}>
                <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>Bank Name:</Text>
                  <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                    {profileData.kyc.bankName || 'Not provided'}
                  </Text>
                </View>
                
                <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>Account Number:</Text>
                  <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                    {profileData.kyc.accountNumber ? '••••' + profileData.kyc.accountNumber.slice(-4) : 'Not provided'}
                  </Text>
                </View>
                
                <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>IFSC Code:</Text>
                  <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                    {profileData.kyc.ifscCode || 'Not provided'}
                  </Text>
                </View>
                
                <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>PAN Number:</Text>
                  <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                    {profileData.kyc.panCardNumber || 'Not provided'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Training Schedule */}
        {profileData.trainingScheduleSubmit && (
          <View style={clsx(styles.mx4, styles.mt4)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Training Schedule
            </Text>
            
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
              <View style={clsx(styles.spaceY2)}>
                <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>Subject:</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {profileData.trainingScheduleSubmit.training?.subject || 'Not provided'}
                  </Text>
                </View>
                
                <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>Schedule Date:</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {formatDate(profileData.trainingScheduleSubmit.scheduleDate)}
                  </Text>
                </View>
                
                <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>Schedule Time:</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {profileData.trainingScheduleSubmit.scheduleTime || 'Not provided'}
                  </Text>
                </View>
                
                <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>Status:</Text>
                  <Text style={clsx(
                    styles.textBase,
                    styles.fontMedium,
                    { color: getStatusColor(profileData.trainingScheduleSubmit.trainingScheduleStatus) }
                  )}>
                    {profileData.trainingScheduleSubmit.trainingScheduleStatus?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Categories */}
        {/* {profileData.categories && profileData.categories.length > 0 && (
          <View style={clsx(styles.mx4, styles.mt4)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Service Categories
            </Text>
            
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={profileData.categories}
                keyExtractor={(item, index) => item._id || index.toString()}
                renderItem={({ item }) => (
                  <View
                    style={clsx(
                      styles.px3,
                      styles.py2,
                      styles.bgPrimaryLight,
                      styles.roundedFull,
                      styles.border,
                      styles.borderPrimary,
                      styles.mr2
                    )}
                  >
                    <Text style={clsx(styles.textSm, styles.fontMedium, styles.textWhite)}>
                      {item.name}
                    </Text>
                  </View>
                )}
                contentContainerStyle={clsx(styles.flexGrow)}
              />
            </View>
          </View>
        )} */}

        {/* Settings */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.overflowHidden, styles.shadow)}>
            {[
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
              </View>
            ))}
          </View>
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
        </View>
      </ScrollView>

      {/* Profile Image Upload Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={clsx(
          styles.flex1,
          styles.justifyCenter,
          styles.itemsCenter,
          styles.bgBlack50
        )}>
          <View style={clsx(
            styles.bgWhite,
            styles.roundedLg,
            styles.p6,
            styles.m4,
            styles.wFull,
            styles.maxW96
          )}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                Update Profile Picture
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSelectedImage(null);
                }}
                style={clsx(styles.p1)}
              >
                <Icon name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedImage ? (
              <View style={clsx(styles.itemsCenter, styles.mb6)}>
                <Image
                  source={{ uri: selectedImage }}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: colors.primary,
                  }}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={clsx(
                styles.itemsCenter,
                styles.justifyCenter,
                styles.bgGray100,
                styles.roundedLg,
                { height: 200 },
                styles.mb6
              )}>
                <Icon name="photo-camera" size={64} color={colors.gray500} />
                <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2)}>
                  No image selected
                </Text>
              </View>
            )}

            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.spaceX2)}>
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.py3,
                  styles.px4,
                  styles.bgGray100,
                  styles.roundedLg,
                  styles.mr1
                )}
                onPress={openCamera}
                disabled={uploading}
              >
                <Icon name="camera-alt" size={20} color={colors.text} />
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                  Camera
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.py3,
                  styles.px4,
                  styles.bgGray100,
                  styles.roundedLg,
                  styles.ml1
                )}
                onPress={openGallery}
                disabled={uploading}
              >
                <Icon name="photo-library" size={20} color={colors.text} />
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                  Gallery
                </Text>
              </TouchableOpacity>
            </View>

            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mt4)}>
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.py3,
                  styles.px4,
                  styles.bgErrorLight,
                  styles.roundedLg,
                  styles.mr1
                )}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedImage(null);
                }}
                disabled={uploading}
              >
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textError)}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.py3,
                  styles.px4,
                  styles.bgPrimary,
                  styles.roundedLg,
                  styles.ml1,
                  { opacity: selectedImage ? 1 : 0.5 }
                )}
                onPress={uploadProfileImage}
                disabled={!selectedImage || uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textWhite)}>
                    Upload
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {selectedImage && (
              <TouchableOpacity
                style={clsx(
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.mt4,
                  styles.py2
                )}
                onPress={() => setSelectedImage(null)}
                disabled={uploading}
              >
                <Text style={clsx(styles.textSm, styles.textError, styles.fontMedium)}>
                  Remove Selected Image
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProviderProfileScreen;