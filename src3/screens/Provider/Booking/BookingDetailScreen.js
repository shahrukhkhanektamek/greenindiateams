import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Share,
  ActivityIndicator,
  Dimensions,
  TextInput,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BookingDetailScreen = ({ navigation, route }) => {
  const bookingId = route.params.booking._id;
  
  const { Toast, Urls, postData, user, token, UploadUrl, imageCheck } = useContext(AppContext);

  const [refreshing, setRefreshing] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Media Upload States
  const [capturedBeforeImages, setCapturedBeforeImages] = useState([]);
  const [capturedBeforeVideos, setCapturedBeforeVideos] = useState([]);
  const [capturedAfterImages, setCapturedAfterImages] = useState([]);
  const [capturedAfterVideos, setCapturedAfterVideos] = useState([]);
  
  // Server Media States
  const [beforeImages, setBeforeImages] = useState([]);
  const [beforeVideos, setBeforeVideos] = useState([]);
  const [afterImages, setAfterImages] = useState([]);
  const [afterVideos, setAfterVideos] = useState([]);
  
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showUploadButton, setShowUploadButton] = useState(false);
  
  // Parts Approval States
  const [partsAmount, setPartsAmount] = useState(0);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [additionalParts, setAdditionalParts] = useState([]);
  
  // New State for tracking current step
  const [currentStep, setCurrentStep] = useState(1); // 1: Before media, 2: Parts, 3: After media, 4: Complete

  useEffect(() => {
    loadBookingDetails();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadBookingDetails().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await postData(
        {},
        `${Urls.getBookingDetail}/${bookingId}`,
        'GET'
      );

      if (response?.success && response.data) {
        const data = response.data;
        setBookingData(data);
        
        // Set media data
        if (data.beforeStartImages) {
          setBeforeImages(data.beforeStartImages);
        }
        if (data.beforeStartVideos) {
          setBeforeVideos(data.beforeStartVideos);
        }
        if (data.afterCompleteImages) {
          setAfterImages(data.afterCompleteImages);
        }
        if (data.afterCompleteVideos) {
          setAfterVideos(data.afterCompleteVideos);
        }
        
        // Calculate original amount
        calculateOriginalAmount(data);
        
        // Check for additional parts
        if (data.additionalParts && data.additionalParts.length > 0) {
          setAdditionalParts(data.additionalParts);
          
          // Calculate parts amount
          let partsTotal = 0;
          data.additionalParts.forEach(part => {
            partsTotal += (part.price || 0) * (part.quantity || 1);
          });
          setPartsAmount(partsTotal);
        }
        
        // Determine current step based on data
        determineCurrentStep(data);
        
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to load booking details',
        });
      }
    } catch (error) {
      console.error('Error loading booking details:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load booking details',
      });
    } finally {
      setLoading(false);
    }
  };

  const determineCurrentStep = (data) => {
    const hasBeforeMedia = (data.beforeStartImages && data.beforeStartImages.length > 0) || 
                          (data.beforeStartVideos && data.beforeStartVideos.length > 0);
    const hasAfterMedia = (data.afterCompleteImages && data.afterCompleteImages.length > 0) || 
                         (data.afterCompleteVideos && data.afterCompleteVideos.length > 0);
    const status = data.status;
    
    if (!hasBeforeMedia) {
      setCurrentStep(1); // Step 1: Before media upload
    } else if (hasBeforeMedia && !isPartsApprovalInProgress() && additionalParts.length === 0 && !hasAfterMedia) {
      setCurrentStep(2); // Step 2: Parts selection (user can skip)
    } else if (isPartsApprovalInProgress() && isPartsPending()) {
      setCurrentStep(3); // Step 3: Waiting for parts approval
    } else if ((isPartsApproved() || isPartsRejected() || additionalParts.length === 0) && !hasAfterMedia) {
      setCurrentStep(4); // Step 4: After media upload
    } else if (hasAfterMedia) {
      setCurrentStep(5); // Step 5: Ready to complete
    }
  };

  const calculateOriginalAmount = (data) => {
    try {
      const booking = data.booking || {};
      const bookingItems = booking.bookingItems || [];
      
      let total = 0;
      bookingItems.forEach(item => {
        const itemPrice = item.salePrice || 0;
        const itemQuantity = item.quantity || 1;
        total += itemPrice * itemQuantity;
      });
      
      setOriginalAmount(total);
    } catch (error) {
      console.error('Error calculating original amount:', error);
    }
  };

  // Function to handle start service - SIMPLIFIED
  const handleStartService = async () => {
    navigation.navigate('StartServiceScreen', {
      bookingData,
      loadBookingDetails,
    });
  };

  const formatBookingData = (data) => {
    if (!data) return null;

    const booking = data.booking || {};
    const userData = data.user || {};
    const address = booking.addressId || {};
    const bookingItems = booking.bookingItems || [];
    const review = data.review || {};

    const serviceNames = bookingItems.map(item => 
      item.service?.name || 'Service'
    ).join(', ');

    // Calculate total amount including parts
    let totalAmount = booking.payableAmount || booking.amount || 0;
    if (additionalParts.length > 0) {
      totalAmount += partsAmount;
    }

    let formattedDate = '';
    if (booking.scheduleDate) {
      const date = new Date(booking.scheduleDate);
      formattedDate = date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    let formattedTime = booking.scheduleTime || '';
    const formattedAddress = `${address.houseNumber || ''} ${address.landmark || ''}`.trim();

    return {
      id: data._id,
      bookingId: booking.bookingId || `BK${data._id.slice(-6)}`,
      customerName: userData.name || `User ${userData.mobile}`,
      mobile: userData.mobile || '',
      email: userData.email || 'Not provided',
      profileImage: userData.profileImage ? `${Urls.UploadUrl}/${userData.profileImage}` : null,
      service: serviceNames || 'Service',
      date: formattedDate,
      time: formattedTime,
      address: formattedAddress || 'Address not available',
      status: data.status,
      amount: totalAmount,
      serviceDetails: bookingItems.map(item => 
        `${item.quantity}x ${item.service?.name} - ₹${item.salePrice}`
      ).join('\n'),
      paymentStatus: booking.paymentStatus === 1 ? 'Paid' : 'Pending',
      paymentMethod: booking.paymentMode === 'online' ? 'Online Payment' : 'Cash on Delivery',
      originalBookingAmount: booking.amount || 0,
      originalData: data,
    };
  };

  const formattedData = formatBookingData(bookingData);

  // Function to get combined status with parts approval
  const getCombinedStatus = () => {
    const status = bookingData?.status || '';
    
    // Parts approval statuses
    if (status === 'partstatusnew') {
      return {
        label: 'In Progress • ⏳ Parts Submitted',
        color: colors.warning,
        bgColor: colors.warningLight,
        isPartsPending: true
      };
    }
    
    if (status === 'partstatusconfirm') {
      return {
        label: 'In Progress • 📋 Parts Confirmed',
        color: colors.info,
        bgColor: colors.infoLight,
        isPartsPending: true
      };
    }
    
    if (status === 'partstatusapprove') {
      return {
        label: 'In Progress • ✅ Parts Approved',
        color: colors.success,
        bgColor: colors.successLight,
        isPartsApproved: true
      };
    }
    
    if (status === 'partstatusreject') {
      return {
        label: 'In Progress • ❌ Parts Rejected',
        color: colors.error,
        bgColor: colors.errorLight,
        isPartsRejected: true
      };
    }
    
    // Regular booking statuses
    switch (status) {
      case 'complete':
        return {
          label: 'Completed',
          color: colors.success,
          bgColor: colors.successLight
        };
      case 'accept':
        return {
          label: 'Accepted',
          color: colors.primary,
          bgColor: colors.primaryLight
        };
      case 'new':
        return {
          label: 'New',
          color: colors.info,
          bgColor: colors.infoLight
        };
      case 'upcoming':
        return {
          label: 'Upcoming',
          color: colors.warning,
          bgColor: colors.warningLight
        };
      case 'cancel':
        return {
          label: 'Cancelled',
          color: colors.error,
          bgColor: colors.errorLight
        };
      case 'reject':
        return {
          label: 'Rejected',
          color: colors.error,
          bgColor: colors.errorLight
        };
      case 'ongoing':
        return {
          label: 'In Progress',
          color: colors.info,
          bgColor: colors.infoLight
        };
      default:
        return {
          label: status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown',
          color: colors.gray,
          bgColor: colors.gray100
        };
    }
  };

  const getStatusLabel = (status) => {
    const combined = getCombinedStatus();
    return combined.label;
  };

  const getStatusColor = (status) => {
    const combined = getCombinedStatus();
    return combined.color;
  };

  const getStatusBgColor = (status) => {
    const combined = getCombinedStatus();
    return combined.bgColor;
  };

  // Check if parts approval is in progress
  const isPartsApprovalInProgress = () => {
    const status = bookingData?.status || '';
    return status.includes('partstatus');
  };

  const isPartsApproved = () => {
    return bookingData?.status === 'partstatusapprove';
  };

  const isPartsRejected = () => {
    return bookingData?.status === 'partstatusreject';
  };

  const isPartsPending = () => {
    const status = bookingData?.status || '';
    return status === 'partstatusnew' || status === 'partstatusconfirm';
  };

  // Function to open parts selection
  const openPartsSelection = () => {
    navigation.navigate('PartsSelectionScreen', {
      bookingData,
      formattedData,
      loadBookingDetails,
    });
  };

  // Function to skip parts
  const skipParts = async () => {
    Alert.alert(
      'Skip Parts',
      'Are you sure you want to skip parts selection? You can proceed directly to after service media upload.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Skip',
          onPress: async () => {
            try {
              // Mark that user has skipped parts
              // You might want to add an API call here if needed
              setCurrentStep(4); // Move to after media step
              Toast.show({
                type: 'info',
                text1: 'Parts Skipped',
                text2: 'You can now upload after service media',
              });
            } catch (error) {
              console.error('Error skipping parts:', error);
            }
          }
        }
      ]
    );
  };

  // Function to cancel parts request
  const cancelPartsRequest = async () => {
    Alert.alert(
      'Cancel Parts Request',
      'Are you sure you want to cancel the parts request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await postData(
                { bookingId: bookingData.bookingId, servicemanBookingId: bookingData._id },
                `${Urls.cancelPartsRequest}`,
                'POST'
              );
              
              if (response?.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Cancelled',
                  text2: 'Parts request cancelled successfully',
                });
                setCurrentStep(4); // Move to after media step
                loadBookingDetails();
              }
            } catch (error) {
              console.error('Error cancelling parts request:', error);
            }
          }
        }
      ]
    );
  };

  // MEDIA UPLOAD FUNCTIONS
  const openMediaModal = (type) => {
    // Check if parts approval is pending
    if (isPartsPending()) {
      Toast.show({
        type: 'info',
        text1: 'Parts Approval Pending',
        text2: 'Please wait for parts approval before uploading media',
      });
      return;
    }
    
    navigation.navigate('MediaCaptureScreen', {
      mediaType: type,
      bookingId,
      setCapturedBeforeImages,
      setCapturedBeforeVideos,
      setCapturedAfterImages,
      setCapturedAfterVideos,
      checkAndShowUploadButton,
    });
  };

  const checkAndShowUploadButton = () => {
    const totalCaptured = 
      capturedBeforeImages.length + 
      capturedBeforeVideos.length + 
      capturedAfterImages.length + 
      capturedAfterVideos.length;
    
    setShowUploadButton(totalCaptured > 0);
  };

  const uploadAllCapturedMedia = async () => {
    try {
      setUploadingMedia(true);
      
      // Upload before media if exists
      if (capturedBeforeImages.length > 0 || capturedBeforeVideos.length > 0) {
        const beforeSuccess = await uploadMediaBatch(capturedBeforeImages, capturedBeforeVideos, 'before');
        if (!beforeSuccess) {
          Toast.show({
            type: 'error',
            text1: 'Upload Failed',
            text2: 'Failed to upload before service media',
          });
          setUploadingMedia(false);
          return;
        }
      }
      
      // Upload after media if exists
      if (capturedAfterImages.length > 0 || capturedAfterVideos.length > 0) {
        const afterSuccess = await uploadMediaBatch(capturedAfterImages, capturedAfterVideos, 'after');
        if (!afterSuccess) {
          Toast.show({
            type: 'error',
            text1: 'Upload Failed',
            text2: 'Failed to upload after service media',
          });
          setUploadingMedia(false);
          return;
        }
      }
      
      // Clear all captured media
      setCapturedBeforeImages([]);
      setCapturedBeforeVideos([]);
      setCapturedAfterImages([]);
      setCapturedAfterVideos([]);
      setShowUploadButton(false);
      
      Toast.show({
        type: 'success',
        text1: 'Upload Complete',
        text2: 'All media uploaded successfully',
      });
      
      // Refresh booking data and determine next step
      loadBookingDetails();
      
      // If before media was just uploaded and no parts yet, move to step 2
      if (capturedBeforeImages.length > 0 || capturedBeforeVideos.length > 0) {
        if (additionalParts.length === 0 && !isPartsApprovalInProgress()) {
          setCurrentStep(2);
        }
      }
      
      // If after media was just uploaded, move to step 5
      if (capturedAfterImages.length > 0 || capturedAfterVideos.length > 0) {
        setCurrentStep(5);
      }
      
    } catch (error) {
      console.error('Error uploading all media:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: 'Failed to upload media. Please try again.',
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const uploadMediaBatch = async (images, videos, type) => {
    try {
      const formData = new FormData();
      
      // Append images to formData
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: `image_${Date.now()}_${index}.jpg`,
        });
      });
      
      // Append videos to formData
      videos.forEach((video, index) => {
        formData.append('videos', {
          uri: video.uri,
          type: video.type || 'video/mp4',
          name: `video_${Date.now()}_${index}.mp4`,
        });
      });
      
      // Determine endpoint based on type
      const endpoint = type === 'before' 
        ? `${Urls.uploadBeforeStartMedia}/${bookingId}`
        : `${Urls.uploadAfterCompleteMedia}/${bookingId}`;
      
      console.log('Uploading to:', endpoint);
      console.log('Images count:', images.length);
      console.log('Videos count:', videos.length);

      const response = await postData(formData, endpoint, 'POST', {
        showErrorMessage: true,
        isFileUpload: true,
        showLoader: false,
      });

      const result = response;
      console.log('Upload response:', result);
      
      return result?.success === true;
      
    } catch (error) {
      console.error('Error in uploadMediaBatch:', error);
      return false;
    }
  };

  // UPDATED: Delete media function according to your backend API
  const deleteMedia = async (mediaUri, mediaType) => {
    Alert.alert(
      'Delete Media',
      'Are you sure you want to delete this media?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Determine if it's before or after media
              const isBefore = mediaType.includes('before');
              const isImage = mediaType.includes('image');
              
              const endpoint = isBefore 
                ? `${Urls.removeBeforeStartMedia}/${bookingId}`
                : `${Urls.removeAfterCompleteMedia}/${bookingId}`;
              
              const requestBody = {
                [isImage ? 'images' : 'videos']: [mediaUri]
              };
              
              console.log('Deleting from:', endpoint);
              console.log('Request body:', requestBody);

              const response = await postData(requestBody, endpoint, 'DELETE', {
                showErrorMessage: true,
                isFileUpload: false,
                showLoader: false,
              });
              const result = response;

              console.log('Delete response:', result);
              
              if (result?.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Deleted',
                  text2: 'Media deleted successfully',
                });
                
                // Update local state
                if (mediaType === 'before-image') {
                  setBeforeImages(prev => prev.filter(uri => uri !== mediaUri));
                } else if (mediaType === 'before-video') {
                  setBeforeVideos(prev => prev.filter(uri => uri !== mediaUri));
                } else if (mediaType === 'after-image') {
                  setAfterImages(prev => prev.filter(uri => uri !== mediaUri));
                } else if (mediaType === 'after-video') {
                  setAfterVideos(prev => prev.filter(uri => uri !== mediaUri));
                }
                
                loadBookingDetails();
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Delete Failed',
                  text2: result?.message || 'Failed to delete media',
                });
              }
            } catch (error) {
              console.error('Error deleting media:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete media',
              });
            }
          },
        },
      ]
    );
  };

  const deleteCapturedMedia = (index, type) => {
    Alert.alert(
      'Delete Captured Media',
      'Are you sure you want to delete this captured media?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (type === 'before-image') {
              setCapturedBeforeImages(prev => prev.filter((_, i) => i !== index));
            } else if (type === 'before-video') {
              setCapturedBeforeVideos(prev => prev.filter((_, i) => i !== index));
            } else if (type === 'after-image') {
              setCapturedAfterImages(prev => prev.filter((_, i) => i !== index));
            } else if (type === 'after-video') {
              setCapturedAfterVideos(prev => prev.filter((_, i) => i !== index));
            }
            
            checkAndShowUploadButton();
            
            Toast.show({
              type: 'success',
              text1: 'Deleted',
              text2: 'Captured media removed',
            });
          },
        },
      ]
    );
  };

  // COMPLETE BOOKING FUNCTIONS
  const openCompleteModal = () => {
    // Check if after media is uploaded
    if (afterImages.length === 0 && afterVideos.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'After Media Required',
        text2: 'Please upload after service media before completing',
      });
      return;
    }
    
    // Check if parts approval is pending
    if (isPartsPending()) {
      Toast.show({
        type: 'info',
        text1: 'Parts Approval Pending',
        text2: 'Please wait for parts approval before completing service',
      });
      return;
    }
    
    navigation.navigate('CompleteBookingScreen', {
      bookingData,
      formattedData,
      loadBookingDetails,
    });
  };

  const ActionButton = ({ icon, label, color, onPress, outlined = false, disabled = false }) => (
    <TouchableOpacity
      style={clsx(
        styles.flexRow,
        styles.itemsCenter,
        styles.justifyCenter,
        styles.px4,
        styles.py3,
        outlined ? styles.border : null,
        outlined ? styles.borderPrimary : null,
        outlined ? styles.bgWhite : null,
        !outlined ? (disabled ? styles.bgGray300 : { backgroundColor: color || colors.primary }) : null,
        styles.roundedLg,
        styles.flex1,
        styles.mx1,
        disabled && styles.opacity50
      )}
      onPress={onPress}
      disabled={disabled}
    >
      <Icon 
        name={icon} 
        size={20} 
        color={outlined ? colors.primary : (disabled ? colors.gray500 : colors.white)} 
        style={clsx(styles.mr2)}
      />
      <Text style={clsx(
        styles.fontMedium,
        outlined ? styles.textPrimary : (disabled ? styles.textGray500 : styles.textWhite)
      )}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const InfoCard = ({ title, value, icon, onPress }) => (
    <TouchableOpacity
      style={clsx(
        styles.flexRow,
        styles.itemsCenter,
        styles.p3,
        styles.bgWhite,
        styles.roundedLg,
        styles.mb2,
        styles.shadowSm
      )}
      onPress={onPress}
      disabled={!onPress}
    >
      {icon && (
        <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), { backgroundColor: `${colors.primary}10` }]}>
          <Icon name={icon} size={20} color={colors.primary} />
        </View>
      )}
      <View style={clsx(styles.flex1)}>
        <Text style={clsx(styles.textSm, styles.textMuted)}>
          {title}
        </Text>
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
          {value}
        </Text>
      </View>
      {onPress && (
        <Icon name="chevron-right" size={20} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );

  // Render parts approval section
  const renderPartsApprovalSection = () => {
    if (!isPartsApprovalInProgress()) return null;
    
    const status = bookingData?.status || '';
    
    return (
      <View style={clsx(styles.px4, styles.mt4)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
          Parts Approval Status
        </Text>
        
        <View style={clsx(
          styles.bgWhite,
          styles.roundedLg,
          styles.p4,
          styles.shadowSm
        )}>
          {/* Status Badge */}
          <View style={clsx(
            styles.flexRow,
            styles.itemsCenter,
            styles.justifyBetween,
            styles.mb4
          )}>
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <View style={[clsx(
                styles.w3,
                styles.h3,
                styles.roundedFull,
                styles.mr3
              ), {
                backgroundColor: 
                  status === 'partstatusnew' || status === 'partstatusconfirm' ? colors.warning :
                  status === 'partstatusapprove' ? colors.success :
                  colors.error
              }]} />
              <View>
                <Text style={clsx(styles.textLg, styles.fontBold, {
                  color: 
                    status === 'partstatusnew' || status === 'partstatusconfirm' ? colors.warning :
                    status === 'partstatusapprove' ? colors.success :
                    colors.error
                })}>
                  {status === 'partstatusnew' ? 'Parts Submitted' :
                   status === 'partstatusconfirm' ? 'Parts Confirmed' :
                   status === 'partstatusapprove' ? 'Parts Approved' :
                   'Parts Rejected'}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  {status === 'partstatusnew' ? 'Waiting for customer confirmation' :
                   status === 'partstatusconfirm' ? 'Customer has confirmed parts' :
                   status === 'partstatusapprove' ? 'Parts approved by customer' :
                   'Parts rejected by customer'}
                </Text>
              </View>
            </View>
            
            {isPartsPending() && (
              <TouchableOpacity
                onPress={cancelPartsRequest}
                style={clsx(
                  styles.px3,
                  styles.py1,
                  styles.bgErrorLight,
                  styles.roundedFull
                )}
              >
                <Text style={clsx(styles.textSm, styles.textError, styles.fontMedium)}>
                  Cancel Request
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Parts List */}
          {additionalParts.length > 0 && (
            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
                Additional Parts:
              </Text>
              {additionalParts.map((part, index) => (
                <View key={index} style={clsx(
                  styles.flexRow,
                  styles.justifyBetween,
                  styles.itemsCenter,
                  styles.p2,
                  styles.bgGray50,
                  styles.rounded,
                  styles.mb1
                )}>
                  <Text style={clsx(styles.textSm, styles.textBlack)}>
                    {part.name} (×{part.quantity || 1})
                  </Text>
                  <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary)}>
                    ₹{part.price || 0} × {part.quantity || 1} = ₹{(part.price || 0) * (part.quantity || 1)}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Amount Breakdown */}
          {partsAmount > 0 && (
            <View style={clsx(
              styles.bgGray50,
              styles.p3,
              styles.roundedLg
            )}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
                Amount Breakdown
              </Text>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Original Service Amount:
                </Text>
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                  ₹{originalAmount}
                </Text>
              </View>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Additional Parts Amount:
                </Text>
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary)}>
                  + ₹{partsAmount}
                </Text>
              </View>
              
              <View style={clsx(
                styles.flexRow,
                styles.justifyBetween,
                styles.mt2,
                styles.pt2,
                styles.borderTop,
                styles.borderGray300
              )}>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                  New Total Amount:
                </Text>
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textSuccess)}>
                  ₹{originalAmount + partsAmount}
                </Text>
              </View>
            </View>
          )}
          
          {/* Status Message */}
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mt4)}>
            {isPartsPending() 
              ? 'Parts are pending approval. You cannot upload after service media until parts are approved.' 
              : isPartsApproved()
              ? 'Parts have been approved. You can now upload after service media.'
              : 'Parts have been rejected. Please proceed with original service only.'}
          </Text>
        </View>
      </View>
    );
  };

  // Render parts info in service card
  const renderPartsInfoInServiceCard = () => {
    if (additionalParts.length === 0) return null;
    
    return (
      <View style={clsx(styles.mt4, styles.p3, styles.bgInfoLight, styles.roundedLg)}>
        <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
          Additional Parts Added
        </Text>
        
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
          <Text style={clsx(styles.textSm, styles.textMuted)}>Parts Amount:</Text>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
            ₹{partsAmount}
          </Text>
        </View>
        
        <View style={clsx(styles.flexRow, styles.justifyBetween)}>
          <Text style={clsx(styles.textSm, styles.textMuted)}>Total Amount:</Text>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textSuccess)}>
            ₹{originalAmount + partsAmount}
          </Text>
        </View>
      </View>
    );
  };

  // Render Step Progress
  const renderStepProgress = () => {
    if (formattedData?.status !== 'ongoing' && !isPartsApprovalInProgress()) return null;
    
    const steps = [
      { number: 1, title: 'Before Media', completed: beforeImages.length > 0 || beforeVideos.length > 0 },
      { number: 2, title: 'Parts', completed: additionalParts.length > 0 || isPartsApprovalInProgress() },
      { number: 3, title: 'After Media', completed: afterImages.length > 0 || afterVideos.length > 0 },
      { number: 4, title: 'Complete', completed: false }
    ];
    
    return (
      <View style={clsx(styles.px4, styles.mt4)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
          Service Progress
        </Text>
        
        <View style={clsx(
          styles.bgWhite,
          styles.roundedLg,
          styles.p4,
          styles.shadowSm
        )}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <View style={clsx(styles.itemsCenter)}>
                  <View style={[clsx(
                    styles.w10,
                    styles.h10,
                    styles.roundedFull,
                    styles.itemsCenter,
                    styles.justifyCenter,
                    styles.mb2
                  ), {
                    backgroundColor: step.completed ? colors.success : 
                                    currentStep === step.number ? colors.primary : colors.gray200,
                    borderWidth: currentStep === step.number ? 2 : 0,
                    borderColor: colors.primary
                  }]}>
                    <Text style={clsx(
                      styles.fontBold,
                      { color: step.completed || currentStep === step.number ? colors.white : colors.gray500 }
                    )}>
                      {step.number}
                    </Text>
                  </View>
                  <Text style={clsx(
                    styles.textSm,
                    styles.fontMedium,
                    { color: step.completed || currentStep === step.number ? colors.primary : colors.gray500 }
                  )}>
                    {step.title}
                  </Text>
                </View>
                
                {index < steps.length - 1 && (
                  <View style={clsx(styles.flex1, styles.mx2)}>
                    <View style={[clsx(styles.h1, styles.roundedFull), {
                      backgroundColor: steps[index + 1].completed ? colors.success : colors.gray300
                    }]} />
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>
          
          {/* Current Step Message */}
          <View style={clsx(
            styles.p3,
            styles.roundedLg,
            styles.bgPrimaryLight
          )}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.textCenter)}>
              {currentStep === 1 ? '📸 Step 1: Upload before service images/videos' :
               currentStep === 2 ? '🔧 Step 2: Add parts if needed (or skip)' :
               currentStep === 3 ? '⏳ Step 3: Waiting for parts approval' :
               currentStep === 4 ? '📸 Step 4: Upload after service images/videos' :
               '✅ Ready to complete service'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // MEDIA DISPLAY COMPONENTS
  const MediaSection = ({ title, uploadedImages, uploadedVideos, capturedImages, capturedVideos, type, showSection = true }) => (
    showSection ? (
      <View style={clsx(styles.mb6, styles.p4, styles.bgWhite, styles.roundedLg, styles.shadowSm)}>
        {/* Header with Progress Indicator */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
          <View>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              {title}
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
              Total uploaded: {uploadedImages.length} images, {uploadedVideos.length} videos
            </Text>
          </View>
          
          {/* Progress Circle */}
          <View style={clsx(styles.itemsCenter)}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
                {uploadedImages.length + uploadedVideos.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Media Action Buttons - Improved UI */}
        <View style={clsx(styles.mb4)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
            Add Media Proof
          </Text>
          
          <View style={clsx(styles.flexRow, styles.gap3)}>
            {/* Add Image Button */}
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.p3,
                styles.bgPrimaryLight,
                styles.roundedLg,
                styles.border,
                styles.borderPrimary,
                isPartsPending() && styles.opacity50
              )}
              onPress={() => openMediaModal(`${type}-image`)}
              disabled={isPartsPending() || (type === 'after' && isPartsPending())}
            >
              <View style={clsx(styles.mr2)}>
                <Icon name="add-a-photo" size={20} color={isPartsPending() ? colors.gray500 : colors.primary} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(
                  styles.textBase,
                  styles.fontMedium,
                  isPartsPending() ? styles.textGray500 : styles.textPrimary
                )}>
                  Add Image
                </Text>
                <Text style={clsx(styles.textXs, styles.textMuted)}>
                  JPG, PNG
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* Add Video Button */}
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.p3,
                styles.bgSecondaryLight,
                styles.roundedLg,
                styles.border,
                styles.borderSecondary,
                isPartsPending() && styles.opacity50
              )}
              onPress={() => openMediaModal(`${type}-video`)}
              disabled={isPartsPending() || (type === 'after' && isPartsPending())}
            >
              <View style={clsx(styles.mr2)}>
                <Icon name="videocam" size={20} color={isPartsPending() ? colors.gray500 : colors.secondary} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(
                  styles.textBase,
                  styles.fontMedium,
                  isPartsPending() ? styles.textGray500 : styles.textSecondary
                )}>
                  Add Video
                </Text>
                <Text style={clsx(styles.textXs, styles.textMuted)}>
                  MP4, MOV
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
        </View>

        {/* Captured Media Section (Not Uploaded Yet) */}
        {(capturedImages.length > 0 || capturedVideos.length > 0) && (
          <View style={clsx(
            styles.mb4, 
            styles.p3, 
            styles.bgWarningLight, 
            styles.roundedLg, 
            styles.border, 
            styles.borderWarning
          )}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
              <Icon name="hourglass-empty" size={18} color={colors.warning} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                Captured Media (Not Uploaded)
              </Text>
              <View style={clsx(styles.mlAuto, styles.flexRow, styles.itemsCenter)}>
                <View style={[clsx(styles.w2, styles.h2, styles.roundedFull, styles.mr1), 
                  { backgroundColor: colors.warning }
                ]} />
                <Text style={clsx(styles.textSm, styles.fontBold, styles.textBlack)}>
                  {capturedImages.length + capturedVideos.length}
                </Text>
              </View>
            </View>
            
            {/* Captured Images */}
            {capturedImages.length > 0 && (
              <View style={clsx(styles.mb3)}>
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.mb2)}>
                  📸 Images ({capturedImages.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {capturedImages.map((media, index) => (
                    <View key={index} style={clsx(styles.mr3, styles.positionRelative)}>
                      <Image
                        source={{ uri: media.uri }}
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: colors.warning,
                        }}
                      />
                      <TouchableOpacity
                        style={clsx(
                          styles.absolute,
                          styles.topNegative1,
                          styles.rightNegative1,
                          styles.bgError,
                          styles.roundedFull,
                          styles.p1,
                          styles.shadowSm
                        )}
                        onPress={() => deleteCapturedMedia(index, `${type}-image`)}
                      >
                        <Icon name="close" size={14} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            
            {/* Captured Videos */}
            {capturedVideos.length > 0 && (
              <View>
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.mb2)}>
                  🎥 Videos ({capturedVideos.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {capturedVideos.map((media, index) => (
                    <View key={index} style={clsx(styles.mr3, styles.positionRelative)}>
                      <View style={{
                        width: 90,
                        height: 90,
                        borderRadius: 8,
                        backgroundColor: colors.gray800,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: colors.warning,
                        overflow: 'hidden',
                      }}>
                        <Icon name="play-circle-filled" size={36} color={colors.white} />
                        <View style={{
                          position: 'absolute',
                          bottom: 4,
                          left: 4,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}>
                          <Text style={clsx(styles.textXs, styles.textWhite)}>
                            Video
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={clsx(
                          styles.absolute,
                          styles.topNegative1,
                          styles.rightNegative1,
                          styles.bgError,
                          styles.roundedFull,
                          styles.p1,
                          styles.shadowSm
                        )}
                        onPress={() => deleteCapturedMedia(index, `${type}-video`)}
                      >
                        <Icon name="close" size={14} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
        
        {/* Uploaded Media Section */}
        {uploadedImages.length > 0 && (
          <View style={clsx(styles.mb4)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
              <Icon name="check-circle" size={18} color={colors.success} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                Uploaded Images ({uploadedImages.length})
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {uploadedImages.map((uri, index) => {
                const imageUri = `${UploadUrl}${uri}`;
                return (
                  <View key={index} style={clsx(styles.mr3, styles.positionRelative)}>
                    <Image
                      source={{ uri: imageUri }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.gray300,
                      }}
                      resizeMode="cover"
                    />
                    <View style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}>
                      <Text style={clsx(styles.textXs, styles.textWhite)}>
                        #{index + 1}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={clsx(
                        styles.absolute,
                        styles.top1,
                        styles.right1,
                        styles.bgError,
                        styles.roundedFull,
                        styles.p1,
                        styles.shadowSm
                      )}
                      onPress={() => deleteMedia(uri, `${type}-image`)}
                    >
                      <Icon name="close" size={14} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
        
        {uploadedVideos.length > 0 && (
          <View>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
              <Icon name="check-circle" size={18} color={colors.success} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                Uploaded Videos ({uploadedVideos.length})
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {uploadedVideos.map((uri, index) => {
                const videoUri = `${UploadUrl}${uri}`;
                
                return (
                  <View key={index} style={clsx(styles.mr3, styles.positionRelative)}>
                    <TouchableOpacity
                      onPress={() => {
                        if (videoUri) {
                          Linking.openURL(videoUri).catch(err => 
                            console.log('Failed to open video:', err)
                          );
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{
                        width: 100,
                        height: 100,
                        borderRadius: 8,
                        backgroundColor: colors.gray900,
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: colors.gray300,
                      }}>
                        <View style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Icon name="play-circle-filled" size={40} color={colors.white} style={clsx(styles.shadowSm)} />
                        </View>
                        <View style={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}>
                          <Text style={clsx(styles.textXs, styles.textWhite)}>
                            #{index + 1}
                          </Text>
                        </View>
                        <View style={{
                          position: 'absolute',
                          bottom: 4,
                          right: 4,
                        }}>
                          <Icon name="videocam" size={16} color={colors.white} />
                        </View>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={clsx(
                        styles.absolute,
                        styles.top1,
                        styles.right1,
                        styles.bgError,
                        styles.roundedFull,
                        styles.p1,
                        styles.shadowSm
                      )}
                      onPress={() => deleteMedia(uri, `${type}-video`)}
                    >
                      <Icon name="close" size={14} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
        
        {/* Empty State */}
        {uploadedImages.length === 0 && uploadedVideos.length === 0 && 
        capturedImages.length === 0 && capturedVideos.length === 0 && (
          <View style={clsx(
            styles.p6, 
            styles.bgGray50, 
            styles.roundedLg, 
            styles.itemsCenter,
            styles.justifyCenter
          )}>
            <View style={[clsx(styles.roundedFull, styles.p4, styles.mb3), 
              { backgroundColor: colors.primary + '20' }
            ]}>
              <Icon name="photo-library" size={40} color={colors.primary} />
            </View>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb1)}>
              No {title.toLowerCase()} uploaded yet
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
              Capture images or videos to provide service proof
            </Text>
          </View>
        )}
      </View>
    ) : (
      // Locked State - Before media not uploaded yet
      <View style={clsx(styles.mb6, styles.p4, styles.bgGray50, styles.roundedLg, styles.border, styles.borderGray300)}>
        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
          <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), 
            { backgroundColor: colors.gray300 }
          ]}>
            <Icon name="lock" size={24} color={colors.gray500} />
          </View>
          <View style={clsx(styles.flex1)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              {title}
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
              Upload before service media first to unlock this section
            </Text>
          </View>
        </View>
        
        <View style={clsx(styles.p3, styles.bgGray100, styles.roundedLg)}>
          <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.textCenter)}>
            🔒 Locked - Complete before service media upload first
          </Text>
        </View>
      </View>
    )
  );

  if (loading) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading booking details...
        </Text>
      </View>
    );
  }

  if (!formattedData) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <Icon name="error-outline" size={64} color={colors.error} />
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt4)}>
          Booking not found
        </Text>
        <TouchableOpacity
          style={clsx(
            styles.mt6,
            styles.px6,
            styles.py3,
            styles.bgPrimary,
            styles.roundedFull
          )}
          onPress={() => navigation.goBack()}
        >
          <Text style={clsx(styles.textWhite, styles.fontBold)}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      
      {/* Header */}
      <View style={clsx(styles.bgPrimary, styles.px4, styles.pt3, styles.pb4)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold)}>
            Booking Details
          </Text>
          <TouchableOpacity onPress={() => {
            const shareMessage = `Booking Details:
              ID: ${formattedData?.bookingId}
              Service: ${formattedData?.service}
              Customer: ${formattedData?.customerName}
              Date: ${formattedData?.date}
              Time: ${formattedData?.time}
              Address: ${formattedData?.address}
              Amount: ₹${formattedData?.amount}
              Status: ${getStatusLabel(formattedData?.status)}`;

            Share.share({
              message: shareMessage,
              title: 'Booking Details',
            }).catch(error => Alert.alert('Error', 'Failed to share booking details'));
          }}>
            <Icon name="share" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Booking ID and Status */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
          <View>
            <Text style={clsx(styles.textWhite, styles.textBase, styles.opacity75)}>
              Booking ID
            </Text>
            <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
              {formattedData.bookingId}
            </Text>
          </View>
          
          {/* Combined Status Badge */}
          <View style={clsx(
            styles.px4,
            styles.py2,
            styles.roundedFull,
            { backgroundColor: getStatusBgColor(formattedData.status) }
          )}>
            <Text style={clsx(
              styles.fontBold,
              { color: getStatusColor(formattedData.status) }
            )}>
              {getStatusLabel(formattedData.status)}
            </Text>
          </View>
        </View>
      </View>
 
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.pb8)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="Pull to refresh"
            titleColor={colors.primary}
          />
        }
      >
        {/* Service Card */}
        <View style={clsx(styles.px4, styles.pt4, styles.mt4)}>
          <View style={clsx(
            styles.bgWhite,
            styles.roundedLg,
            styles.p4,
            styles.shadowSm
          )}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb4)}>
              <View style={[clsx(styles.roundedFull, styles.p3, styles.mr3), 
                { backgroundColor: `${getStatusColor(formattedData.status)}20` }
              ]}>
                <Icon name="home-repair-service" size={28} color={getStatusColor(formattedData.status)} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
                  {formattedData.service}
                </Text>
                <Text style={clsx(styles.textBase, styles.textPrimary, styles.fontMedium)}>
                  ₹{originalAmount + partsAmount}
                  {partsAmount > 0 && (
                    <Text style={clsx(styles.textSm, styles.textMuted)}>
                      {' '}(Service: ₹{originalAmount} + Parts: ₹{partsAmount})
                    </Text>
                  )}
                </Text>
              </View>
            </View>

            {/* Service Details */}
            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
                Service Items
              </Text>
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                {formattedData.serviceDetails}
              </Text>
            </View>

            {/* Parts Info */}
            {renderPartsInfoInServiceCard()}

            {/* Media Status */}
            <View style={clsx(styles.mt4)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
                Service Proof Status
              </Text>
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <View style={clsx(styles.itemsCenter)}>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>Before Images</Text>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                    {beforeImages.length}
                  </Text>
                </View>
                <View style={clsx(styles.itemsCenter)}>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>Before Videos</Text>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                    {beforeVideos.length}
                  </Text>
                </View>
                <View style={clsx(styles.itemsCenter)}>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>After Images</Text>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                    {afterImages.length}
                  </Text>
                </View>
                <View style={clsx(styles.itemsCenter)}>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>After Videos</Text>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                    {afterVideos.length}
                  </Text>
                </View>
              </View>
              
              {/* Captured Media Count */}
              {(capturedBeforeImages.length > 0 || capturedBeforeVideos.length > 0 || 
                capturedAfterImages.length > 0 || capturedAfterVideos.length > 0) && (
                <View style={clsx(styles.mt3, styles.p2, styles.bgWarningLight, styles.roundedLg)}>
                  <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.textCenter)}>
                    📸 {capturedBeforeImages.length + capturedBeforeVideos.length + capturedAfterImages.length + capturedAfterVideos.length} 
                    media captured (not uploaded)
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Step Progress */}
        {renderStepProgress()}

        {/* Parts Approval Section */}
        {renderPartsApprovalSection()}

        {/* Customer Information */}
        <View style={clsx(styles.px4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Customer Information
          </Text>
          
          <View style={clsx(
            styles.bgWhite,
            styles.roundedLg,
            styles.p4,
            styles.shadowSm
          )}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
              <View style={[clsx(styles.roundedFull, styles.overflowHidden), 
                { width: 60, height: 60, backgroundColor: colors.gray200 }
              ]}>
                {formattedData.profileImage ? (
                  <Image
                    source={{ uri: imageCheck(UploadUrl+'/'+formattedData.profileImage, 'user.png') }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <View style={clsx(styles.flex1, styles.itemsCenter, styles.justifyCenter)}>
                    <Icon name="person" size={32} color={colors.gray500} />
                  </View>
                )}
              </View>
              <View style={clsx(styles.ml2, styles.flex1)}>
                <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                  {formattedData.customerName}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Service Details Section */}
        <View style={clsx(styles.px4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Service Details
          </Text>

          <InfoCard
            title="Date & Time"
            value={`${formattedData.date} • ${formattedData.time}`}
            icon="calendar-today"
          />

          <InfoCard
            title="Address"
            value={formattedData.address}
            icon="location-on"
            onPress={() => { 
                if (formattedData?.originalData?.booking?.addressId?.lat && formattedData?.originalData?.booking?.addressId?.long) {
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${formattedData.originalData.booking.addressId.lat},${formattedData.originalData.booking.addressId.long}`);
                } else if (formattedData.address) {
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedData.address)}`);
                }
              }}
          />

          <InfoCard
            title="Payment Status"
            value={
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <View style={[clsx(styles.w2, styles.h2, styles.roundedFull, styles.mr2), 
                  { backgroundColor: formattedData.paymentStatus === 'Paid' ? colors.success : colors.warning }
                ]} />
                <Text style={clsx(
                  styles.textBase,
                  styles.fontMedium,
                  { color: formattedData.paymentStatus === 'Paid' ? colors.success : colors.warning }
                )}>
                  {formattedData.paymentStatus}
                </Text>
              </View>
            }
            icon="payment"
          />

          <InfoCard
            title="Payment Method"
            value={formattedData.paymentMethod}
            icon="credit-card"
          />
        </View>
        
        {/* Media Upload Sections - Step by Step */}
        {(formattedData.status === 'ongoing' || isPartsApprovalInProgress()) && (
          <View style={clsx(styles.px4, styles.mt4)}>
            
            {/* STEP 1: Before Service Media (Always show if not uploaded yet) */}
            {(beforeImages.length === 0 && beforeVideos.length === 0) && (
              <MediaSection
                title="Step 1: Before Service"
                uploadedImages={beforeImages}
                uploadedVideos={beforeVideos}
                capturedImages={capturedBeforeImages}
                capturedVideos={capturedBeforeVideos}
                type="before"
                showSection={true}
              />
            )}
            
            {/* STEP 2: Parts Selection (Only show if before media is uploaded AND no parts yet AND not in parts approval) */}
            {(beforeImages.length > 0 || beforeVideos.length > 0) && 
             additionalParts.length === 0 && 
             !isPartsApprovalInProgress() && (
              <View style={clsx(styles.mb6, styles.p4, styles.bgWhite, styles.roundedLg, styles.shadowSm)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb4)}>
                  <View style={[clsx(styles.roundedFull, styles.p3, styles.mr3), 
                    { backgroundColor: colors.info + '20' }
                  ]}>
                    <Icon name="build" size={28} color={colors.info} />
                  </View>
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                      Step 2: Parts Selection
                    </Text>
                    <Text style={clsx(styles.textSm, styles.textMuted)}>
                      Add additional parts if needed (Optional)
                    </Text>
                  </View>
                  <View style={[clsx(styles.px3, styles.py1, styles.roundedFull), 
                    { backgroundColor: colors.info + '20' }
                  ]}>
                    <Text style={clsx(styles.textSm, styles.fontBold, styles.textInfo)}>
                      Optional
                    </Text>
                  </View>
                </View>
                
                <Text style={clsx(styles.textBase, styles.textMuted, styles.mb4)}>
                  Do you need to add any additional parts for this service? 
                  You can add parts now or skip to proceed directly to after service media.
                </Text>
                
                <View style={clsx(styles.flexRow, styles.gap3)}>
                  <TouchableOpacity
                    style={clsx(
                      styles.flex1,
                      styles.flexRow,
                      styles.itemsCenter,
                      styles.justifyCenter,
                      styles.p4,
                      styles.bgInfo,
                      styles.roundedLg
                    )}
                    onPress={openPartsSelection}
                  >
                    <Icon name="add" size={20} color={colors.white} style={clsx(styles.mr2)} />
                    <Text style={clsx(styles.textWhite, styles.fontBold, styles.textBase)}>
                      Add Parts
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={clsx(
                      styles.flex1,
                      styles.flexRow,
                      styles.itemsCenter,
                      styles.justifyCenter,
                      styles.p4,
                      styles.bgGray200,
                      styles.roundedLg
                    )}
                    onPress={skipParts}
                  >
                    <Icon name="skip-next" size={20} color={colors.gray700} style={clsx(styles.mr2)} />
                    <Text style={clsx(styles.textGray700, styles.fontBold, styles.textBase)}>
                      Skip Parts
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* STEP 3/4: After Service Media (Only show if before media is uploaded AND (parts approved/rejected OR parts skipped)) */}
            {((beforeImages.length > 0 || beforeVideos.length > 0) && 
              (isPartsApproved() || isPartsRejected() || 
               (additionalParts.length === 0 && !isPartsApprovalInProgress()))) && (
              <MediaSection
                title="Step 3: After Service"
                uploadedImages={afterImages}
                uploadedVideos={afterVideos}
                capturedImages={capturedAfterImages}
                capturedVideos={capturedAfterVideos}
                type="after"
                showSection={true}
              />
            )}
            
            {/* Upload All Button - Only show when there are captured media */}
            {showUploadButton && !isPartsPending() && (
              <TouchableOpacity
                style={clsx(
                  styles.bgSuccess,
                  styles.roundedLg,
                  styles.p4,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.mt4,
                  uploadingMedia && styles.opacity50
                )}
                onPress={uploadAllCapturedMedia}
                disabled={uploadingMedia || isPartsPending()}
              >
                {uploadingMedia ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Icon name="cloud-upload" size={24} color={colors.white} style={clsx(styles.mr2)} />
                    <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                      Upload All Captured Media
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            
          </View>
        )}

        {/* Spacer for bottom buttons */}
        <View style={clsx(styles.h24)} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[
        clsx(
          styles.bgWhite,
          styles.px4,
          styles.py3,
          styles.borderTop,
          styles.borderLight,
          styles.flexRow,
          styles.justifyBetween,
          styles.itemsCenter
        ),
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }
      ]}>
        {formattedData.status === 'accept' || formattedData.status === 'new' ? (
          <>
            <ActionButton
              icon="cancel"
              label="Reject"
              color={colors.error}
              outlined={true}
              onPress={() => Alert.alert(
                'Reject Booking',
                'Are you sure you want to reject this booking?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Reject', 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        const response = await postData(
                          { bookingId: bookingData?._id },
                          Urls.rejectBooking,
                          'POST'
                        );
                        
                        if (response?.success) {
                          Toast.show({
                            type: 'success',
                            text1: 'Booking Rejected',
                            text2: 'Booking has been rejected successfully',
                          });
                          navigation.goBack();
                        }
                      } catch (error) {
                        console.error('Error rejecting booking:', error);
                      }
                    }
                  },
                ]
              )}
            />
            <ActionButton
              icon="play-arrow"
              label="Start Service"
              color={colors.primary}
              onPress={handleStartService}
            />
          </>
        ) : formattedData.status === 'ongoing' ? (
          <>
            {(afterImages.length > 0 || afterVideos.length > 0) ? (
              <ActionButton
                icon="check-circle"
                label="Complete"
                color={colors.success}
                onPress={openCompleteModal}
                disabled={isPartsPending()}
              />
            ) : (
              <ActionButton
                icon="schedule"
                label="In Progress"
                color={colors.warning}
                outlined={true}
                disabled={true}
              />
            )}
          </>
        ) : isPartsApprovalInProgress() ? (
          <>
            {isPartsPending() && (
              <ActionButton
                icon="schedule"
                label="Pending Approval"
                color={colors.warning}
                outlined={true}
                disabled={true}
              />
            )}
            
            {(afterImages.length > 0 || afterVideos.length > 0) && !isPartsPending() ? (
              <ActionButton
                icon="check-circle"
                label="Complete"
                color={colors.success}
                onPress={openCompleteModal}
                disabled={isPartsPending()}
              />
            ) : isPartsApproved() || isPartsRejected() ? (
              <ActionButton
                icon="arrow-forward"
                label="Continue Service"
                color={colors.primary}
                onPress={() => setCurrentStep(4)}
              />
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
};

export default BookingDetailScreen;