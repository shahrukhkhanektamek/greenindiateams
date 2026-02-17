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

  // Get status background color
  const getStatusBgColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return '#E8F5E9';
      case 'pending':
        return '#FFF3E0';
      case 'rejected':
        return '#FFEBEE';
      default:
        return '#F5F5F5';
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
        {/* Profile Header - Enhanced Design */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <View style={clsx(
            styles.bgWhite, 
            styles.roundedXl, 
            styles.p6, 
            styles.shadow, 
            styles.itemsCenter,
            styles.borderWidth,
            styles.borderGray100
          )}>
            {/* Profile Image with Gradient Border Effect */}
            <TouchableOpacity
              style={clsx(
                styles.positionRelative,
                styles.roundedFull,
                styles.p1,
                {
                  backgroundColor: colors.primary + '20',
                  borderRadius: 54
                }
              )}
              onPress={() => setModalVisible(true)}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: colors.white }}
                />
              ) : (
                <View style={clsx(
                  styles.roundedFull,
                  styles.bgPrimaryLight,
                  { width: 100, height: 100 },
                  styles.itemsCenter,
                  styles.justifyCenter
                )}>
                  <Icon name="person" size={48} color={colors.primary} />
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
                styles.borderWhite,
                styles.shadowSm
              )}>
                <Icon name="camera-alt" size={16} color={colors.white} />
              </View>
            </TouchableOpacity>

            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack, styles.mt4)}>
              {profileData.name || 'Not provided'}
            </Text>
            
            {/* Provider ID Badge */}
            {profileData.servicemanId && (
              <View style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.bgGray100,
                styles.px3,
                styles.py1,
                styles.roundedFull,
                styles.mt2
              )}>
                <Icon name="badge" size={14} color={colors.textMuted} />
                <Text style={clsx(styles.textSm, styles.textMuted, styles.ml1)}>
                  ID: {profileData.servicemanId}
                </Text>
              </View>
            )}
            
           

            {/* Rating Badge */}
            {profileData.averageRating > 0 && (
              <View style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.bgWarningLight,
                styles.px3,
                styles.py1,
                styles.roundedFull,
                styles.mt2
              )}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mx1)}>
                  {profileData.averageRating}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  ({profileData.totalReviews || 0} reviews)
                </Text>
              </View>
            )}

            

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

        {/* Quick Stats - Enhanced Cards */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Performance Overview
          </Text>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.gap2)}>
            <View style={clsx(
              styles.flex1,
              styles.bgWhite,
              styles.roundedLg,
              styles.p4,
              styles.shadow,
              styles.itemsCenter,
              styles.borderWidth,
              styles.borderGray100
            )}>
              <View style={clsx(styles.bgPrimaryLight, styles.p3, styles.roundedFull, styles.mb2)}>
                <Icon name="work" size={24} color={colors.white} />
              </View>
              <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
                {profileData.yearOfExperience || '0'}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
                Years Experience
              </Text>
            </View>
            
            <View style={clsx(
              styles.flex1,
              styles.bgWhite,
              styles.roundedLg,
              styles.p4,
              styles.shadow,
              styles.itemsCenter,
              styles.borderWidth,
              styles.borderGray100
            )}>
              <View style={clsx(styles.bgSuccessLight, styles.p3, styles.roundedFull, styles.mb2)}>
                <Icon name="currency-rupee" size={24} color={colors.success} />
              </View>
              <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess)}>
                ₹{profileData.totalEarning?.toLocaleString('en-IN') || '0'}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
                Total Earnings
              </Text>
            </View>
            
            <View style={clsx(
              styles.flex1,
              styles.bgWhite,
              styles.roundedLg,
              styles.p4,
              styles.shadow,
              styles.itemsCenter,
              styles.borderWidth,
              styles.borderGray100
            )}>
              <View style={clsx(styles.bgSecondaryLight, styles.p3, styles.roundedFull, styles.mb2)}>
                <Icon name="assignment-turned-in" size={24} color={colors.white} />
              </View>
              <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSecondary)}>
                {profileData.completedJob || '0'}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
                Jobs Completed
              </Text>
            </View>
          </View>
        </View>

        {/* Services Section - Enhanced */}
        {(profileData.categories?.length > 0 || profileData.subCategories?.length > 0) && (
          <View style={clsx(styles.mx4, styles.mt4)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mb3)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                Services
              </Text>
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <View style={clsx(styles.w2, styles.h2, styles.bgPrimary, styles.roundedFull, styles.mr1)} />
                <Text style={clsx(styles.textXs, styles.textMuted)}>Categories</Text>
                <View style={clsx(styles.w2, styles.h2, styles.bgSecondary, styles.roundedFull, styles.mx1, styles.ml2)} />
                <Text style={clsx(styles.textXs, styles.textMuted)}>Sub Categories</Text>
              </View>
            </View>
            
            <View style={clsx(styles.bgWhite, styles.roundedXl, styles.p4, styles.shadow, styles.borderWidth, styles.borderGray100)}>
              {/* Categories */}
              {profileData.categories?.length > 0 && (
                <View style={clsx(styles.mb4)}>
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb3)}>
                    <Icon name="category" size={16} color={colors.primary} /> Categories
                  </Text>
                  <View style={clsx(styles.flexRow, styles.flexWrap)}>
                    {profileData.categories.map((category, index) => (
                      <View
                        key={category._id || index}
                        style={clsx(
                          styles.flexRow,
                          styles.itemsCenter,
                          styles.px3,
                          styles.py2,
                          styles.bgPrimaryLight,
                          styles.roundedFull,
                          styles.mr2,
                          styles.mb2,
                          styles.borderWidth,
                          styles.borderPrimary
                        )}
                      >
                        <Icon name="check-circle" size={14} color={colors.white} style={clsx(styles.mr1)} />
                        <Text style={clsx(styles.textSm, styles.fontMedium, styles.textWhite)}>
                          {category.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* SubCategories */}
              {profileData.subCategories?.length > 0 && (
                <View>
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb3)}>
                    <Icon name="apps" size={16} color={colors.secondary} /> Sub Categories
                  </Text>
                  <View style={clsx(styles.flexRow, styles.flexWrap)}>
                    {profileData.subCategories.map((subCategory, index) => (
                      <View
                        key={subCategory._id || index}
                        style={clsx(
                          styles.flexRow,
                          styles.itemsCenter,
                          styles.px3,
                          styles.py2,
                          styles.bgSecondaryLight,
                          styles.roundedFull,
                          styles.mr2,
                          styles.mb2,
                          styles.borderWidth,
                          styles.borderSecondary
                        )}
                      >
                        <Icon name="check-circle" size={14} color={colors.white} style={clsx(styles.mr1)} />
                        <Text style={clsx(styles.textSm, styles.fontMedium, styles.textWhite)}>
                          {subCategory.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Personal Info - Enhanced with Icons */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            <Icon name="person" size={20} color={colors.primary} /> Personal Information
          </Text>
          
          <View style={clsx(styles.bgWhite, styles.roundedXl, styles.p4, styles.shadow, styles.borderWidth, styles.borderGray100)}>
            <View style={clsx(styles.spaceY4)}>
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <View style={clsx(styles.w10, styles.itemsCenter)}>
                  <Icon name="phone" size={20} color={colors.primary} />
                </View>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textXs, styles.textMuted)}>Mobile</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {profileData.mobile || profileData.user?.mobile || 'Not provided'}
                  </Text>
                </View>
              </View>
              
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <View style={clsx(styles.w10, styles.itemsCenter)}>
                  <Icon name="email" size={20} color={colors.primary} />
                </View>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textXs, styles.textMuted)}>Email</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {profileData.email || 'Not provided'}
                  </Text>
                </View>
              </View>
              
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <View style={clsx(styles.w10, styles.itemsCenter)}>
                  <Icon name="cake" size={20} color={colors.primary} />
                </View>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textXs, styles.textMuted)}>Date of Birth</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {formatDate(profileData.dob)}
                  </Text>
                </View>
              </View>
              
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <View style={clsx(styles.w10, styles.itemsCenter)}>
                  <Icon name="business" size={20} color={colors.primary} />
                </View>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textXs, styles.textMuted)}>Company</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {profileData.companyName || 'Not provided'}
                  </Text>
                </View>
              </View>
              
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <View style={clsx(styles.w10, styles.itemsCenter)}>
                  <Icon name="location-on" size={20} color={colors.primary} />
                </View>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textXs, styles.textMuted)}>Current Address</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {profileData.currentAddress || 'Not provided'}
                  </Text>
                </View>
              </View>
              
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <View style={clsx(styles.w10, styles.itemsCenter)}>
                  <Icon name="trending-up" size={20} color={colors.primary} />
                </View>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textXs, styles.textMuted)}>Experience Level</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {profileData.experienceLevel || 'Not provided'}
                  </Text>
                </View>
              </View>

              {profileData.gender && (
                <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                  <View style={clsx(styles.w10, styles.itemsCenter)}>
                    <Icon name="wc" size={20} color={colors.primary} />
                  </View>
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textXs, styles.textMuted)}>Gender</Text>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                      {profileData.gender}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* KYC Status - Enhanced Card */}
        {profileData.kyc && (
          <View style={clsx(styles.mx4, styles.mt4)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              <Icon name="verified" size={20} color={colors.primary} /> KYC Status
            </Text>
            
            <View style={clsx(styles.bgWhite, styles.roundedXl, styles.p4, styles.shadow, styles.borderWidth, styles.borderGray100)}>
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mb4)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                  <View style={clsx(
                    styles.w4,
                    styles.h4,
                    styles.roundedFull,
                    styles.mr2,
                    { backgroundColor: getStatusColor(profileData.kyc.status) }
                  )} />
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                    Verification Status
                  </Text>
                </View>
                <View style={clsx(
                  styles.px3,
                  styles.py1,
                  styles.roundedFull,
                  { backgroundColor: getStatusBgColor(profileData.kyc.status) }
                )}>
                  <Text style={clsx(
                    styles.textSm,
                    styles.fontBold,
                    { color: getStatusColor(profileData.kyc.status) }
                  )}>
                    {profileData.kyc.status?.toUpperCase() || 'PENDING'}
                  </Text>
                </View>
              </View>
              
              <View style={clsx(styles.spaceY3)}>
                <View style={clsx(styles.flexRow, styles.justifyBetween, styles.bgGray50, styles.p3, styles.roundedLg)}>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>Bank Name:</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {profileData.kyc.bankName || 'Not provided'}
                  </Text>
                </View>
                
                <View style={clsx(styles.flexRow, styles.justifyBetween, styles.p3)}>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>Account Number:</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {profileData.kyc.accountNumber ? '••••' + profileData.kyc.accountNumber.slice(-4) : 'Not provided'}
                  </Text>
                </View>
                
                <View style={clsx(styles.flexRow, styles.justifyBetween, styles.bgGray50, styles.p3, styles.roundedLg)}>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>IFSC Code:</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {profileData.kyc.ifscCode || 'Not provided'}
                  </Text>
                </View>
                
                <View style={clsx(styles.flexRow, styles.justifyBetween, styles.p3)}>
                  <Text style={clsx(styles.textBase, styles.textMuted)}>PAN Number:</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {profileData.kyc.panCardNumber || 'Not provided'}
                  </Text>
                </View>

                {profileData.kyc.accountHolderName && (
                  <View style={clsx(styles.flexRow, styles.justifyBetween, styles.bgGray50, styles.p3, styles.roundedLg)}>
                    <Text style={clsx(styles.textBase, styles.textMuted)}>Account Holder:</Text>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                      {profileData.kyc.accountHolderName}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Training Schedule - Enhanced Card */}
        {profileData.trainingScheduleSubmit && (
          <View style={clsx(styles.mx4, styles.mt4, styles.mb4)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              <Icon name="school" size={20} color={colors.primary} /> Training Schedule
            </Text>
            
            <View style={clsx(styles.bgWhite, styles.roundedXl, styles.p4, styles.shadow, styles.border0, styles.borderGray100)}>
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mb4)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                  <Icon name="event" size={20} color={colors.primary} style={clsx(styles.mr2)} />
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                    Training Details
                  </Text>
                </View>
                <View style={clsx(
                  styles.px3,
                  styles.py1,
                  styles.roundedFull,
                  { backgroundColor: getStatusBgColor(profileData.trainingScheduleSubmit.trainingScheduleStatus) }
                )}>
                  <Text style={clsx(
                    styles.textSm,
                    styles.fontBold,
                    { color: getStatusColor(profileData.trainingScheduleSubmit.trainingScheduleStatus) }
                  )}>
                    {profileData.trainingScheduleSubmit.trainingScheduleStatus?.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={clsx(styles.spaceY3)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.bgGray50, styles.p3, styles.roundedLg)}>
                  <Icon name="subject" size={20} color={colors.primary} style={clsx(styles.mr3)} />
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textXs, styles.textMuted)}>Subject</Text>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                      {profileData.trainingScheduleSubmit.training?.subject || 'Not provided'}
                    </Text>
                  </View>
                </View>
                
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.p3)}>
                  <Icon name="calendar-today" size={20} color={colors.primary} style={clsx(styles.mr3)} />
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textXs, styles.textMuted)}>Schedule Date</Text>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                      {formatDate(profileData.trainingScheduleSubmit.scheduleDate)}
                    </Text>
                  </View>
                </View>
                
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.bgGray50, styles.p3, styles.roundedLg)}>
                  <Icon name="access-time" size={20} color={colors.primary} style={clsx(styles.mr3)} />
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textXs, styles.textMuted)}>Schedule Time</Text>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                      {profileData.trainingScheduleSubmit.scheduleTime || 'Not provided'}
                    </Text>
                  </View>
                </View>

                {profileData.trainingScheduleSubmit.attendanceStatus && (
                  <View style={clsx(styles.flexRow, styles.itemsCenter, styles.p3)}>
                    <Icon name="check-circle" size={20} color={colors.primary} style={clsx(styles.mr3)} />
                    <View style={clsx(styles.flex1)}>
                      <Text style={clsx(styles.textXs, styles.textMuted)}>Attendance</Text>
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                        {profileData.trainingScheduleSubmit.attendanceStatus}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

       


        {/* Logout Button */}
        {/* <View style={clsx(styles.mx4, styles.mt4, styles.mb6)}>
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
        </View> */}
      </ScrollView>

      {/* Profile Image Upload Modal - Enhanced */}
      <Modal
        animationType="slide"
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
            styles.roundedXl,
            styles.p6,
            styles.m4,
            styles.wFull,
            styles.maxW96,
            styles.shadowLg
          )}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
              <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                Update Profile Picture
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSelectedImage(null);
                }}
                style={clsx(styles.p2, styles.bgGray100, styles.roundedFull)}
              >
                <Icon name="close" size={20} color={colors.textMuted} />
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
                    borderWidth: 3,
                    borderColor: colors.primary,
                  }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={clsx(
                    styles.mt3,
                    styles.px3,
                    styles.py1,
                    styles.bgErrorLight,
                    styles.roundedFull
                  )}
                  onPress={() => setSelectedImage(null)}
                  disabled={uploading}
                >
                  <Text style={clsx(styles.textSm, styles.textError, styles.fontMedium)}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={clsx(
                styles.itemsCenter,
                styles.justifyCenter,
                styles.bgGray100,
                styles.roundedXl,
                { height: 200 },
                styles.mb6
              )}>
                <Icon name="photo-camera" size={64} color={colors.gray500} />
                <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2)}>
                  No image selected
                </Text>
              </View>
            )}

            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.gap3, styles.mb4)}>
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.py3,
                  styles.px4,
                  styles.bgPrimary,
                  styles.roundedLg,
                  styles.shadowSm
                )}
                onPress={openCamera}
                disabled={uploading}
              >
                <Icon name="camera-alt" size={20} color={colors.white} />
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textWhite, styles.ml2)}>
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
                  styles.bgSecondary,
                  styles.roundedLg,
                  styles.shadowSm
                )}
                onPress={openGallery}
                disabled={uploading}
              >
                <Icon name="photo-library" size={20} color={colors.white} />
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textWhite, styles.ml2)}>
                  Gallery
                </Text>
              </TouchableOpacity>
            </View>

            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.gap3)}>
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.py3,
                  styles.px4,
                  styles.bgGray200,
                  styles.roundedLg
                )}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedImage(null);
                }}
                disabled={uploading}
              >
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
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
                  styles.shadowSm,
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
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProviderProfileScreen;