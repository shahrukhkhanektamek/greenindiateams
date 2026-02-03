import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BookingDetailScreen = ({ navigation, route }) => {
  const bookingId = route.params.booking._id;
  
  const { Toast, Urls, postData, UploadUrl, imageCheck } = useContext(AppContext);

  const [refreshing, setRefreshing] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Item-wise media states
  const [itemMediaStates, setItemMediaStates] = useState({});
  const [itemMediaData, setItemMediaData] = useState({});
  
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showUploadButton, setShowUploadButton] = useState(false);
  
  const [partsAmount, setPartsAmount] = useState(0);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [additionalParts, setAdditionalParts] = useState([]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPartsModal, setShowPartsModal] = useState(false);

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
        
        const bookingItems = data.booking?.bookingItems || [];
        const newItemMediaData = {};
        const newItemMediaStates = {};
        
        bookingItems.forEach((item, index) => {
          const itemId = item._id || `item_${index}`;
          
          // Get media for this item from bookingMedia
          const bookingMedia = item.bookingMedia || [];
          
          // Separate before media (mediaTimeline == 1)
          const beforeMedia = bookingMedia.filter(media => media.mediaTimeline === 1);
          const beforeImages = beforeMedia.filter(media => media.mediaType === 'image').map(m => m.media);
          const beforeVideos = beforeMedia.filter(media => media.mediaType === 'video').map(m => m.media);
          
          // Separate after media (mediaTimeline == 2 or other)
          const afterMedia = bookingMedia.filter(media => media.mediaTimeline !== 1);
          const afterImages = afterMedia.filter(media => media.mediaType === 'image').map(m => m.media);
          const afterVideos = afterMedia.filter(media => media.mediaType === 'video').map(m => m.media);
          
          newItemMediaData[itemId] = {
            beforeImages: Array.isArray(beforeImages) ? beforeImages : [],
            beforeVideos: Array.isArray(beforeVideos) ? beforeVideos : [],
            afterImages: Array.isArray(afterImages) ? afterImages : [],
            afterVideos: Array.isArray(afterVideos) ? afterVideos : [],
          };
          
          newItemMediaStates[itemId] = {
            capturedBeforeImages: [],
            capturedBeforeVideos: [],
            capturedAfterImages: [],
            capturedAfterVideos: [],
          };
        });
        
        setItemMediaData(newItemMediaData);
        setItemMediaStates(newItemMediaStates);
        
        calculateOriginalAmount(data);
        
        if (data.additionalParts && data.additionalParts.length > 0) {
          setAdditionalParts(data.additionalParts);
          let partsTotal = 0;
          data.additionalParts.forEach(part => {
            partsTotal += (part.price || 0) * (part.quantity || 1);
          });
          setPartsAmount(partsTotal);
        }
        
        determineCurrentStep(data);
        
        // Check for captured media to show upload button
        checkAndShowUploadButton();
        
        // Check if parts button should be shown
        checkPartsButtonVisibility();
        
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
    const bookingItems = data.booking?.bookingItems || [];
    const status = data.status;
    
    // Simplified step logic
    if (status === 'ongoing') {
      setCurrentStep(1);
    } else if (status === 'partstatusnew' || status === 'partstatusconfirm') {
      setCurrentStep(2);
    } else if (status === 'partstatusapprove' || status === 'partstatusreject') {
      setCurrentStep(3);
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

  const handleStartService = () => {
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

    const serviceNames = bookingItems.map(item => 
      item.service?.name || 'Service'
    ).join(', ');

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

  const getCombinedStatus = () => {
    const status = bookingData?.status || '';
    
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
    
    switch (status) {
      case 'complete':
        return { label: 'Completed', color: colors.success, bgColor: colors.successLight };
      case 'accept':
        return { label: 'Accepted', color: colors.primary, bgColor: colors.primaryLight };
      case 'new':
        return { label: 'New', color: colors.info, bgColor: colors.infoLight };
      case 'upcoming':
        return { label: 'Upcoming', color: colors.warning, bgColor: colors.warningLight };
      case 'cancel':
        return { label: 'Cancelled', color: colors.error, bgColor: colors.errorLight };
      case 'reject':
        return { label: 'Rejected', color: colors.error, bgColor: colors.errorLight };
      case 'ongoing':
        return { label: 'In Progress', color: colors.info, bgColor: colors.infoLight };
      default:
        return {
          label: status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown',
          color: colors.gray,
          bgColor: colors.gray100
        };
    }
  };

  const getStatusLabel = () => {
    const combined = getCombinedStatus();
    return combined.label;
  };

  const getStatusColor = () => {
    const combined = getCombinedStatus();
    return combined.color;
  };

  const getStatusBgColor = () => {
    const combined = getCombinedStatus();
    return combined.bgColor;
  };

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

  // Check if all required before media is uploaded for all items
  const isAllRequiredBeforeMediaUploaded = () => {
    const bookingItems = bookingData?.booking?.bookingItems || [];
    
    for (const item of bookingItems) {
      const itemId = item._id;
      const itemData = itemMediaData[itemId] || {};
      const isMediaRequired = item.isMediaUpload === 1;
      
      if (isMediaRequired) {
        const hasBeforeImages = (itemData.beforeImages?.length || 0) > 0;
        const hasBeforeVideos = (itemData.beforeVideos?.length || 0) > 0;
        
        if (!hasBeforeImages && !hasBeforeVideos) {
          return false;
        }
      }
    }
    
    return true;
  };

  // Check if before media is uploaded for an item
  const isBeforeMediaUploaded = (itemId) => {
    const itemData = itemMediaData[itemId] || {};
    return (itemData.beforeImages?.length || 0) > 0 || (itemData.beforeVideos?.length || 0) > 0;
  };

  // Check if all required after media is uploaded for all items
  const isAllRequiredAfterMediaUploaded = () => {
    const bookingItems = bookingData?.booking?.bookingItems || [];
    
    for (const item of bookingItems) {
      const itemId = item._id;
      const itemData = itemMediaData[itemId] || {};
      const isMediaRequired = item.isMediaUpload === 1;
      
      if (isMediaRequired) {
        const hasAfterImages = (itemData.afterImages?.length || 0) > 0;
        const hasAfterVideos = (itemData.afterVideos?.length || 0) > 0;
        
        if (!hasAfterImages && !hasAfterVideos) {
          return false;
        }
      }
    }
    
    return true;
  };

  // Check if user has captured but not uploaded media for any item
  const hasUnuploadedCapturedMedia = () => {
    for (const itemState of Object.values(itemMediaStates)) {
      if ((itemState.capturedBeforeImages?.length || 0) > 0 ||
          (itemState.capturedBeforeVideos?.length || 0) > 0 ||
          (itemState.capturedAfterImages?.length || 0) > 0 ||
          (itemState.capturedAfterVideos?.length || 0) > 0) {
        return true;
      }
    }
    return false;
  };

  // Check if other items have captured but not uploaded media
  const hasUnuploadedCapturedMediaInOtherItems = (currentItemId) => {
    for (const [itemId, itemState] of Object.entries(itemMediaStates)) {
      if (itemId !== currentItemId) {
        if ((itemState.capturedBeforeImages?.length || 0) > 0 ||
            (itemState.capturedBeforeVideos?.length || 0) > 0 ||
            (itemState.capturedAfterImages?.length || 0) > 0 ||
            (itemState.capturedAfterVideos?.length || 0) > 0) {
          return true;
        }
      }
    }
    return false;
  };

  // Check if parts button should be visible
  const checkPartsButtonVisibility = () => {
    const allBeforeMediaUploaded = isAllRequiredBeforeMediaUploaded();
    const noCapturedMedia = !hasUnuploadedCapturedMedia();
    
    // Parts button should show when all required before media is uploaded
    // and there's no captured media waiting to be uploaded
    return allBeforeMediaUploaded && noCapturedMedia;
  };

  const showPartsSelectionButton = checkPartsButtonVisibility();

  const openPartsSelection = () => {
    navigation.navigate('PartsSelectionScreen', {
      bookingData,
      formattedData,
      loadBookingDetails,
    });
  };

  const skipPartsAndContinue = () => {
    setShowPartsModal(false);
    // You can add any logic here for skipping parts
    Toast.show({
      type: 'success',
      text1: 'Parts Skipped',
      text2: 'You can add parts later if needed',
    });
  };

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
                setCurrentStep(3);
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

  // OPEN MEDIA MODAL - SUPPORTS MULTIPLE MEDIA
  const openMediaModal = (itemId, mediaType, isMandatory, isAfterMedia = false) => {
    if (isPartsPending()) {
      Toast.show({
        type: 'info',
        text1: 'Parts Approval Pending',
        text2: 'Please wait for parts approval before uploading media',
      });
      return;
    }
    
    // Check if before media is uploaded for after media
    if (isAfterMedia && !isBeforeMediaUploaded(itemId)) {
      Toast.show({
        type: 'error',
        text1: 'Before Media Required',
        text2: 'Please upload before media first before adding after media',
      });
      return;
    }
    
    // Check if OTHER items have captured but not uploaded media
    if (hasUnuploadedCapturedMediaInOtherItems(itemId)) {
      Toast.show({
        type: 'error',
        text1: 'Upload Pending',
        text2: 'Please upload captured media from other items first',
      });
      return;
    }
    
    navigation.navigate('MediaCaptureScreen', {
      mediaType: mediaType,
      bookingId,
      itemId,
      isMandatory,
      onMediaCaptured: (images, videos, captureType) => {
        console.log('Media captured:', {
          itemId,
          captureType,
          imagesCount: images.length,
          videosCount: videos.length
        });
        
        setItemMediaStates(prev => {
          const currentState = prev[itemId] || {
            capturedBeforeImages: [],
            capturedBeforeVideos: [],
            capturedAfterImages: [],
            capturedAfterVideos: [],
          };
          
          const updatedState = {
            ...prev,
            [itemId]: {
              ...currentState,
              [captureType === 'before' ? 'capturedBeforeImages' : 'capturedAfterImages']: 
                [...currentState[captureType === 'before' ? 'capturedBeforeImages' : 'capturedAfterImages'], ...images],
              [captureType === 'before' ? 'capturedBeforeVideos' : 'capturedAfterVideos']: 
                [...currentState[captureType === 'before' ? 'capturedBeforeVideos' : 'capturedAfterVideos'], ...videos],
            }
          };
          
          return updatedState;
        });
        
        checkAndShowUploadButton();
      },
    });
  };

  // CHECK AND SHOW UPLOAD BUTTON
  const checkAndShowUploadButton = () => {
    let hasCapturedMedia = false;
    
    Object.values(itemMediaStates).forEach(itemState => {
      if ((itemState.capturedBeforeImages?.length || 0) > 0 ||
          (itemState.capturedBeforeVideos?.length || 0) > 0 ||
          (itemState.capturedAfterImages?.length || 0) > 0 ||
          (itemState.capturedAfterVideos?.length || 0) > 0) {
        hasCapturedMedia = true;
      }
    });
    
    console.log('Upload button should show:', hasCapturedMedia);
    setShowUploadButton(hasCapturedMedia);
  };

  // UPLOAD ALL CAPTURED MEDIA
  const uploadAllCapturedMedia = async () => {
    try {
      setUploadingMedia(true);
      
      const uploadPromises = [];
      let totalMediaCount = 0;
      
      for (const [itemId, itemState] of Object.entries(itemMediaStates)) {
        // Upload before media
        if (itemState.capturedBeforeImages?.length > 0 || itemState.capturedBeforeVideos?.length > 0) {
          const beforeImagesCount = itemState.capturedBeforeImages?.length || 0;
          const beforeVideosCount = itemState.capturedBeforeVideos?.length || 0;
          totalMediaCount += beforeImagesCount + beforeVideosCount;
          
          uploadPromises.push(
            uploadMediaBatch(itemId, 
              itemState.capturedBeforeImages || [], 
              itemState.capturedBeforeVideos || [], 
              'before'
            )
          );
        }
        
        // Upload after media
        if (itemState.capturedAfterImages?.length > 0 || itemState.capturedAfterVideos?.length > 0) {
          const afterImagesCount = itemState.capturedAfterImages?.length || 0;
          const afterVideosCount = itemState.capturedAfterVideos?.length || 0;
          totalMediaCount += afterImagesCount + afterVideosCount;
          
          uploadPromises.push(
            uploadMediaBatch(itemId, 
              itemState.capturedAfterImages || [], 
              itemState.capturedAfterVideos || [], 
              'after'
            )
          );
        }
      }
      
      if (uploadPromises.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No Media',
          text2: 'No media to upload',
        });
        setUploadingMedia(false);
        return;
      }
      
      const results = await Promise.all(uploadPromises);
      const allSuccess = results.every(result => result === true);
      
      if (allSuccess) {
        // Clear captured media
        const clearedStates = {};
        Object.keys(itemMediaStates).forEach(key => {
          clearedStates[key] = {
            capturedBeforeImages: [],
            capturedBeforeVideos: [],
            capturedAfterImages: [],
            capturedAfterVideos: [],
          };
        });
        setItemMediaStates(clearedStates);
        setShowUploadButton(false);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `${totalMediaCount} media uploaded successfully`,
        });
        
        // Reload data
        loadBookingDetails();
        
        // Check if parts button should be shown after upload
        checkPartsButtonVisibility();
        
      } else {
        Toast.show({
          type: 'error',
          text1: 'Upload Failed',
          text2: 'Some media failed to upload',
        });
      }
      
    } catch (error) {
      console.error('Error uploading media:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to upload media',
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  // UPLOAD MEDIA BATCH FOR AN ITEM - SUPPORTS MULTIPLE MEDIA
  const uploadMediaBatch = async (itemId, images, videos, type) => {
    try {
      const formData = new FormData();
      formData.append('bookingItemId', itemId);
      
      // Add ALL images
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: `image_${itemId}_${Date.now()}_${index}.jpg`,
        });
      });
      
      // Add ALL videos
      videos.forEach((video, index) => {
        formData.append('videos', {
          uri: video.uri,
          type: video.type || 'video/mp4',
          name: `video_${itemId}_${Date.now()}_${index}.mp4`,
        });
      });
      
      const endpoint = type === 'before' 
        ? `${Urls.uploadBeforeStartMedia}/${bookingId}`
        : `${Urls.uploadAfterCompleteMedia}/${bookingId}`;
      
      console.log(`Uploading ${images.length} images and ${videos.length} videos for item ${itemId}`);
      
      const response = await postData(formData, endpoint, 'POST', {
        showErrorMessage: true,
        isFileUpload: true,
      });

      return response?.success === true;
      
    } catch (error) {
      console.error('Error uploading media batch:', error);
      return false;
    }
  };

  // UPLOAD CAPTURED MEDIA FOR SPECIFIC ITEM
  const uploadCapturedMediaForItem = async (itemId, type) => {
    try {
      setUploadingMedia(true);
      
      const itemState = itemMediaStates[itemId] || {};
      let images = [];
      let videos = [];
      
      if (type === 'before') {
        images = itemState.capturedBeforeImages || [];
        videos = itemState.capturedBeforeVideos || [];
      } else {
        images = itemState.capturedAfterImages || [];
        videos = itemState.capturedAfterVideos || [];
      }
      
      if (images.length === 0 && videos.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No Media',
          text2: 'No captured media to upload',
        });
        setUploadingMedia(false);
        return;
      }
      
      const success = await uploadMediaBatch(itemId, images, videos, type);
      
      if (success) {
        // Clear captured media for this item and type
        setItemMediaStates(prev => {
          const currentState = { ...prev[itemId] };
          
          if (type === 'before') {
            currentState.capturedBeforeImages = [];
            currentState.capturedBeforeVideos = [];
          } else {
            currentState.capturedAfterImages = [];
            currentState.capturedAfterVideos = [];
          }
          
          return {
            ...prev,
            [itemId]: currentState
          };
        });
        
        checkAndShowUploadButton();
        checkPartsButtonVisibility();
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `${images.length + videos.length} media uploaded successfully`,
        });
        
        // Reload data
        loadBookingDetails();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Upload Failed',
          text2: 'Failed to upload media',
        });
      }
      
    } catch (error) {
      console.error('Error uploading media:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to upload media',
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  // DELETE CAPTURED MEDIA
  const deleteCapturedMedia = (itemId, index, mediaType) => {
    Alert.alert(
      'Delete Media',
      'Are you sure you want to delete this captured media?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setItemMediaStates(prev => {
              const currentState = { ...prev[itemId] };
              
              if (mediaType === 'before-image') {
                currentState.capturedBeforeImages = currentState.capturedBeforeImages.filter((_, i) => i !== index);
              } else if (mediaType === 'before-video') {
                currentState.capturedBeforeVideos = currentState.capturedBeforeVideos.filter((_, i) => i !== index);
              } else if (mediaType === 'after-image') {
                currentState.capturedAfterImages = currentState.capturedAfterImages.filter((_, i) => i !== index);
              } else if (mediaType === 'after-video') {
                currentState.capturedAfterVideos = currentState.capturedAfterVideos.filter((_, i) => i !== index);
              }
              
              return {
                ...prev,
                [itemId]: currentState
              };
            });
            
            checkAndShowUploadButton();
            
            Toast.show({
              type: 'success',
              text1: 'Deleted',
              text2: 'Media removed',
            });
          }
        }
      ]
    );
  };

  // DELETE UPLOADED MEDIA
  const deleteMedia = async (itemId, mediaUri, mediaType) => {
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
              const isBefore = mediaType.includes('before');
              const isImage = mediaType.includes('image');
              
              const endpoint = isBefore 
                ? `${Urls.removeBeforeStartMedia}/${bookingId}`
                : `${Urls.removeAfterCompleteMedia}/${bookingId}`;
              
              const requestBody = {
                bookingItemId: itemId,
                [isImage ? 'images' : 'videos']: [mediaUri]
              };
              
              const response = await postData(requestBody, endpoint, 'DELETE');
              
              if (response?.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Deleted',
                  text2: 'Media deleted successfully',
                });
                
                // Update local state
                setItemMediaData(prev => ({
                  ...prev,
                  [itemId]: {
                    ...prev[itemId],
                    [isBefore ? 'beforeImages' : 'afterImages']: 
                      isImage ? prev[itemId][isBefore ? 'beforeImages' : 'afterImages'].filter(uri => uri !== mediaUri) : 
                      prev[itemId][isBefore ? 'beforeImages' : 'afterImages'],
                    [isBefore ? 'beforeVideos' : 'afterVideos']: 
                      !isImage ? prev[itemId][isBefore ? 'beforeVideos' : 'afterVideos'].filter(uri => uri !== mediaUri) : 
                      prev[itemId][isBefore ? 'beforeVideos' : 'afterVideos'],
                  }
                }));
                
                loadBookingDetails();
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to delete media',
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
          }
        }
      ]
    );
  };

  const openCompleteModal = () => {
    const bookingItems = bookingData?.booking?.bookingItems || [];
    
    navigation.navigate('CompleteBookingScreen', {
      bookingData,
      formattedData,
      loadBookingDetails,
    });
  };

  // RENDER MEDIA SECTION FOR EACH ITEM
  const renderItemMediaSection = (item, index) => {
    const itemId = item._id || `item_${index}`;
    const itemData = itemMediaData[itemId] || {};
    const itemState = itemMediaStates[itemId] || {};
    const isMediaMandatory = item.isMediaUpload === 1;
    
    const hasBeforeMedia = (itemData.beforeImages?.length || 0) > 0 || 
                         (itemData.beforeVideos?.length || 0) > 0;
    const hasAfterMedia = (itemData.afterImages?.length || 0) > 0 || 
                        (itemData.afterVideos?.length || 0) > 0;
    
    const hasCapturedBeforeMedia = (itemState.capturedBeforeImages?.length || 0) > 0 || 
                                 (itemState.capturedBeforeVideos?.length || 0) > 0;
    const hasCapturedAfterMedia = (itemState.capturedAfterImages?.length || 0) > 0 || 
                                (itemState.capturedAfterVideos?.length || 0) > 0;
    
    // Check if OTHER items have captured but not uploaded media
    const otherItemsHaveCapturedMedia = hasUnuploadedCapturedMediaInOtherItems(itemId);
    
    // Current item can capture more media even if it has captured media
    const currentItemHasCapturedMedia = hasCapturedBeforeMedia || hasCapturedAfterMedia;
    const canCaptureMoreForCurrentItem = true; // Always allow capturing more for same item
    
    // Check if current item can capture media
    const canCaptureMedia = !otherItemsHaveCapturedMedia;
    
    return (
      <View key={itemId} style={clsx(styles.mb6, styles.p4, styles.bgWhite, styles.roundedLg, styles.shadowSm)}>
        {/* Item Header */}
        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb4)}>
          <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), 
            { backgroundColor: colors.primary + '20' }
          ]}>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
              {index + 1}
            </Text>
          </View>
          <View style={clsx(styles.flex1)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              {item.service?.name || `Item ${index + 1}`}
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              {item.quantity}x • ₹{item.salePrice || 0} each
              {isMediaMandatory && ' • Media Required'}
            </Text>
          </View>
        </View>
        
        {/* BEFORE MEDIA SECTION */}
        <View style={clsx(styles.mb4)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
              Before Service
            </Text>
            <View style={[clsx(styles.px3, styles.py1, styles.roundedFull), 
              { backgroundColor: hasBeforeMedia ? colors.success + '20' : colors.warning + '20' }
            ]}>
              <Text style={clsx(
                styles.textSm,
                styles.fontMedium,
                { color: hasBeforeMedia ? colors.success : colors.warning }
              )}>
                {hasBeforeMedia ? 'Uploaded' : 'Pending'}
              </Text>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={clsx(styles.flexRow, styles.gap2, styles.mb3)}>
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
                !canCaptureMedia && styles.opacity50
              )}
              onPress={() => openMediaModal(itemId, 'before-image', isMediaMandatory, false)}
              disabled={isPartsPending() || !canCaptureMedia}
            >
              <Icon name="add-a-photo" size={18} color={!canCaptureMedia ? colors.gray : colors.primary} />
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.ml2, 
                !canCaptureMedia ? styles.textMuted : styles.textPrimary)}>
                Add Images
              </Text>
            </TouchableOpacity>
            
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
                !canCaptureMedia && styles.opacity50
              )}
              onPress={() => openMediaModal(itemId, 'before-video', isMediaMandatory, false)}
              disabled={isPartsPending() || !canCaptureMedia}
            >
              <Icon name="videocam" size={18} color={!canCaptureMedia ? colors.gray : colors.secondary} />
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.ml2,
                !canCaptureMedia ? styles.textMuted : styles.textSecondary)}>
                Add Videos
              </Text>
            </TouchableOpacity>
          </View>
          
          {!canCaptureMedia && (
            <Text style={clsx(styles.textSm, styles.textWarning, styles.textCenter, styles.mb3)}>
              Please upload captured media from other items first
            </Text>
          )}
          
          {/* Captured Media Preview */}
          {hasCapturedBeforeMedia && (
            <View style={clsx(styles.mb4, styles.p3, styles.bgWarningLight, styles.roundedLg)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                  Captured (Not Uploaded)
                </Text>
                <TouchableOpacity
                  style={clsx(
                    styles.px3,
                    styles.py1,
                    styles.bgSuccess,
                    styles.roundedFull,
                    styles.flexRow,
                    styles.itemsCenter
                  )}
                  onPress={() => uploadCapturedMediaForItem(itemId, 'before')}
                  disabled={uploadingMedia}
                >
                  {uploadingMedia ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Icon name="cloud-upload" size={14} color={colors.white} style={clsx(styles.mr1)} />
                      <Text style={clsx(styles.textXs, styles.textWhite, styles.fontMedium)}>
                        Upload
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Images */}
              {itemState.capturedBeforeImages?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={clsx(styles.mb2)}>
                  {itemState.capturedBeforeImages.map((media, idx) => (
                    <View key={idx} style={clsx(styles.mr2, styles.positionRelative)}>
                      <Image
                        source={{ uri: media.uri }}
                        style={{ width: 70, height: 70, borderRadius: 8 }}
                      />
                      <TouchableOpacity
                        style={clsx(
                          styles.absolute,
                          styles.topNegative1,
                          styles.rightNegative1,
                          styles.bgError,
                          styles.roundedFull,
                          styles.p1
                        )}
                        onPress={() => deleteCapturedMedia(itemId, idx, 'before-image')}
                      >
                        <Icon name="close" size={12} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
              
              {/* Videos */}
              {itemState.capturedBeforeVideos?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {itemState.capturedBeforeVideos.map((media, idx) => (
                    <View key={idx} style={clsx(styles.mr2, styles.positionRelative)}>
                      <View style={{
                        width: 70,
                        height: 70,
                        borderRadius: 8,
                        backgroundColor: colors.gray800,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Icon name="play-circle-filled" size={28} color={colors.white} />
                      </View>
                      <TouchableOpacity
                        style={clsx(
                          styles.absolute,
                          styles.topNegative1,
                          styles.rightNegative1,
                          styles.bgError,
                          styles.roundedFull,
                          styles.p1
                        )}
                        onPress={() => deleteCapturedMedia(itemId, idx, 'before-video')}
                      >
                        <Icon name="close" size={12} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
          
          {/* Uploaded Media */}
          {(itemData.beforeImages?.length > 0 || itemData.beforeVideos?.length > 0) ? (
            <View>
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Uploaded Media
              </Text>
              
              {/* Uploaded Images */}
              {itemData.beforeImages?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={clsx(styles.mb2)}>
                  {itemData.beforeImages.map((uri, idx) => (
                    <View key={idx} style={clsx(styles.mr2, styles.positionRelative)}>
                      <Image
                        source={{ uri: `${UploadUrl}${uri}` }}
                        style={{ width: 70, height: 70, borderRadius: 8 }}
                      />
                      <TouchableOpacity
                        style={clsx(
                          styles.absolute,
                          styles.topNegative1,
                          styles.rightNegative1,
                          styles.bgError,
                          styles.roundedFull,
                          styles.p1
                        )}
                        onPress={() => deleteMedia(itemId, uri, 'before-image')}
                      >
                        <Icon name="close" size={12} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
              
              {/* Uploaded Videos */}
              {itemData.beforeVideos?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {itemData.beforeVideos.map((uri, idx) => (
                    <View key={idx} style={clsx(styles.mr2, styles.positionRelative)}>
                      <TouchableOpacity onPress={() => Linking.openURL(`${UploadUrl}${uri}`)}>
                        <View style={{
                          width: 70,
                          height: 70,
                          borderRadius: 8,
                          backgroundColor: colors.gray800,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Icon name="play-circle-filled" size={28} color={colors.white} />
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={clsx(
                          styles.absolute,
                          styles.topNegative1,
                          styles.rightNegative1,
                          styles.bgError,
                          styles.roundedFull,
                          styles.p1
                        )}
                        onPress={() => deleteMedia(itemId, uri, 'before-video')}
                      >
                        <Icon name="close" size={12} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            !hasCapturedBeforeMedia && (
              <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter, styles.py-3)}>
                No before media {isMediaMandatory && '(Required)'}
              </Text>
            )
          )}
        </View>
        
        {/* Separator Line */}
        <View style={[clsx(styles.my4, styles.hPx), { backgroundColor: colors.gray300 }]} />
        
        {/* AFTER MEDIA SECTION */}
        <View>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
              After Service
            </Text>
            <View style={[clsx(styles.px3, styles.py1, styles.roundedFull), 
              { backgroundColor: hasAfterMedia ? colors.success + '20' : colors.warning + '20' }
            ]}>
              <Text style={clsx(
                styles.textSm,
                styles.fontMedium,
                { color: hasAfterMedia ? colors.success : colors.warning }
              )}>
                {hasAfterMedia ? 'Uploaded' : (hasBeforeMedia ? 'Pending' : 'Before Media Required')}
              </Text>
            </View>
          </View>
          
          {/* Action Buttons - Disabled if before media not uploaded */}
          <View style={clsx(styles.flexRow, styles.gap2, styles.mb3)}>
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.p3,
                hasBeforeMedia ? styles.bgPrimaryLight : styles.bgGray200,
                styles.roundedLg,
                styles.border,
                hasBeforeMedia ? styles.borderPrimary : styles.borderGray300,
                (!hasBeforeMedia || !canCaptureMedia) && styles.opacity50
              )}
              onPress={() => openMediaModal(itemId, 'after-image', isMediaMandatory, true)}
              disabled={isPartsPending() || !hasBeforeMedia || !canCaptureMedia}
            >
              <Icon name="add-a-photo" size={18} color={(!hasBeforeMedia || !canCaptureMedia) ? colors.gray : colors.primary} />
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.ml2,
                (!hasBeforeMedia || !canCaptureMedia) ? styles.textMuted : styles.textPrimary)}>
                Add Images
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.p3,
                hasBeforeMedia ? styles.bgSecondaryLight : styles.bgGray200,
                styles.roundedLg,
                styles.border,
                hasBeforeMedia ? styles.borderSecondary : styles.borderGray300,
                (!hasBeforeMedia || !canCaptureMedia) && styles.opacity50
              )}
              onPress={() => openMediaModal(itemId, 'after-video', isMediaMandatory, true)}
              disabled={isPartsPending() || !hasBeforeMedia || !canCaptureMedia}
            >
              <Icon name="videocam" size={18} color={(!hasBeforeMedia || !canCaptureMedia) ? colors.gray : colors.secondary} />
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.ml2,
                (!hasBeforeMedia || !canCaptureMedia) ? styles.textMuted : styles.textSecondary)}>
                Add Videos
              </Text>
            </TouchableOpacity>
          </View>
          
          {!hasBeforeMedia && (
            <Text style={clsx(styles.textSm, styles.textError, styles.textCenter, styles.mb3)}>
              Please upload before media first
            </Text>
          )}
          
          {!canCaptureMedia && (
            <Text style={clsx(styles.textSm, styles.textWarning, styles.textCenter, styles.mb3)}>
              Please upload captured media from other items first
            </Text>
          )}
          
          {/* Captured Media Preview */}
          {hasCapturedAfterMedia && (
            <View style={clsx(styles.mb4, styles.p3, styles.bgWarningLight, styles.roundedLg)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                  Captured (Not Uploaded)
                </Text>
                <TouchableOpacity
                  style={clsx(
                    styles.px3,
                    styles.py1,
                    styles.bgSuccess,
                    styles.roundedFull,
                    styles.flexRow,
                    styles.itemsCenter
                  )}
                  onPress={() => uploadCapturedMediaForItem(itemId, 'after')}
                  disabled={uploadingMedia}
                >
                  {uploadingMedia ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Icon name="cloud-upload" size={14} color={colors.white} style={clsx(styles.mr1)} />
                      <Text style={clsx(styles.textXs, styles.textWhite, styles.fontMedium)}>
                        Upload
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Images */}
              {itemState.capturedAfterImages?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={clsx(styles.mb2)}>
                  {itemState.capturedAfterImages.map((media, idx) => (
                    <View key={idx} style={clsx(styles.mr2, styles.positionRelative)}>
                      <Image
                        source={{ uri: media.uri }}
                        style={{ width: 70, height: 70, borderRadius: 8 }}
                      />
                      <TouchableOpacity
                        style={clsx(
                          styles.absolute,
                          styles.topNegative1,
                          styles.rightNegative1,
                          styles.bgError,
                          styles.roundedFull,
                          styles.p1
                        )}
                        onPress={() => deleteCapturedMedia(itemId, idx, 'after-image')}
                      >
                        <Icon name="close" size={12} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
              
              {/* Videos */}
              {itemState.capturedAfterVideos?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {itemState.capturedAfterVideos.map((media, idx) => (
                    <View key={idx} style={clsx(styles.mr2, styles.positionRelative)}>
                      <View style={{
                        width: 70,
                        height: 70,
                        borderRadius: 8,
                        backgroundColor: colors.gray800,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Icon name="play-circle-filled" size={28} color={colors.white} />
                      </View>
                      <TouchableOpacity
                        style={clsx(
                          styles.absolute,
                          styles.topNegative1,
                          styles.rightNegative1,
                          styles.bgError,
                          styles.roundedFull,
                          styles.p1
                        )}
                        onPress={() => deleteCapturedMedia(itemId, idx, 'after-video')}
                      >
                        <Icon name="close" size={12} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
          
          {/* Uploaded Media */}
          {(itemData.afterImages?.length > 0 || itemData.afterVideos?.length > 0) ? (
            <View>
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Uploaded Media
              </Text>
              
              {/* Uploaded Images */}
              {itemData.afterImages?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={clsx(styles.mb2)}>
                  {itemData.afterImages.map((uri, idx) => (
                    <View key={idx} style={clsx(styles.mr2, styles.positionRelative)}>
                      <Image
                        source={{ uri: `${UploadUrl}${uri}` }}
                        style={{ width: 70, height: 70, borderRadius: 8 }}
                      />
                      <TouchableOpacity
                        style={clsx(
                          styles.absolute,
                          styles.topNegative1,
                          styles.rightNegative1,
                          styles.bgError,
                          styles.roundedFull,
                          styles.p1
                        )}
                        onPress={() => deleteMedia(itemId, uri, 'after-image')}
                      >
                        <Icon name="close" size={12} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
              
              {/* Uploaded Videos */}
              {itemData.afterVideos?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {itemData.afterVideos.map((uri, idx) => (
                    <View key={idx} style={clsx(styles.mr2, styles.positionRelative)}>
                      <TouchableOpacity onPress={() => Linking.openURL(`${UploadUrl}${uri}`)}>
                        <View style={{
                          width: 70,
                          height: 70,
                          borderRadius: 8,
                          backgroundColor: colors.gray800,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Icon name="play-circle-filled" size={28} color={colors.white} />
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={clsx(
                          styles.absolute,
                          styles.topNegative1,
                          styles.rightNegative1,
                          styles.bgError,
                          styles.roundedFull,
                          styles.p1
                        )}
                        onPress={() => deleteMedia(itemId, uri, 'after-video')}
                      >
                        <Icon name="close" size={12} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            !hasCapturedAfterMedia && (
              <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter, styles.py-3)}>
                No after media {isMediaMandatory && '(Required)'}
              </Text>
            )
          )}
        </View>
      </View>
    );
  };

  // ACTION BUTTON COMPONENT
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

  // INFO CARD COMPONENT
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

  // RENDER PARTS APPROVAL SECTION
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
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb4)}>
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
        </View>
      </View>
    );
  };

  // RENDER PARTS INFO IN SERVICE CARD
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

  // CALCULATE MEDIA SUMMARY
  const calculateMediaSummary = () => {
    const bookingItems = bookingData?.booking?.bookingItems || [];
    let totalBefore = 0;
    let totalAfter = 0;
    let totalCaptured = 0;
    
    bookingItems.forEach(item => {
      const itemId = item._id;
      const itemData = itemMediaData[itemId] || {};
      const itemState = itemMediaStates[itemId] || {};
      
      totalBefore += (itemData.beforeImages?.length || 0) + (itemData.beforeVideos?.length || 0);
      totalAfter += (itemData.afterImages?.length || 0) + (itemData.afterVideos?.length || 0);
      totalCaptured += (itemState.capturedBeforeImages?.length || 0) + 
                      (itemState.capturedBeforeVideos?.length || 0) + 
                      (itemState.capturedAfterImages?.length || 0) + 
                      (itemState.capturedAfterVideos?.length || 0);
    });
    
    return { totalBefore, totalAfter, totalCaptured };
  };

  // RENDER PARTS SELECTION BUTTON SECTION
  const renderPartsSelectionSection = () => {
    if (!showPartsSelectionButton || isPartsApprovalInProgress()) return null;
    
    return (
      <View style={clsx(styles.px4, styles.mt4)}>
        <View style={clsx(
          styles.bgWhite,
          styles.roundedLg,
          styles.p4,
          styles.shadowSm,
          styles.itemsCenter
        )}>
          <Icon name="build" size={48} color={colors.primary} style={clsx(styles.mb3)} />
          
          <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack, styles.mb2)}>
            Add Additional Parts
          </Text>
          
          <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter, styles.mb4)}>
            All before media has been uploaded. You can now add additional parts if needed, or skip to continue with the service.
          </Text>
          
          <View style={clsx(styles.flexRow, styles.wFull)}>
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.bgPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.mr2
              )}
              onPress={openPartsSelection}
            >
              <Text style={clsx(styles.textWhite, styles.fontBold)}>
                Add Parts
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.border,
                styles.borderPrimary,
                styles.bgWhite,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.ml2
              )}
              onPress={skipPartsAndContinue}
            >
              <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                Skip Parts
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // RENDER PARTS MODAL
  const renderPartsModal = () => {
    if (!showPartsModal) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPartsModal}
        onRequestClose={() => setShowPartsModal(false)}
      >
        <View style={clsx(styles.flex1, styles.justifyCenter, styles.itemsCenter, styles.bgBlack50)}>
          <View style={clsx(
            styles.bgWhite,
            styles.roundedLg,
            styles.p6,
            styles.w90,
            styles.shadowLg
          )}>
            <Icon name="build" size={64} color={colors.primary} style={clsx(styles.mb4, styles.selfCenter)} />
            
            <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack, styles.mb2, styles.textCenter)}>
              Add Additional Parts?
            </Text>
            
            <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter, styles.mb6)}>
              All before media has been uploaded successfully. Would you like to add additional parts now?
            </Text>
            
            <TouchableOpacity
              style={clsx(
                styles.bgPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.mb3
              )}
              onPress={openPartsSelection}
            >
              <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                Yes, Add Parts
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={clsx(
                styles.border,
                styles.borderPrimary,
                styles.bgWhite,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter
              )}
              onPress={skipPartsAndContinue}
            >
              <Text style={clsx(styles.textPrimary, styles.fontBold, styles.textLg)}>
                Skip for Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

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

  const bookingItems = bookingData?.booking?.bookingItems || [];
  const mediaSummary = calculateMediaSummary();
  
  // Check if booking can be completed
  const canCompleteBooking = !isPartsPending() && 
                           isAllRequiredBeforeMediaUploaded() && 
                           isAllRequiredAfterMediaUploaded() &&
                           !hasUnuploadedCapturedMedia();

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      
      {/* Header */}
      <View style={clsx(styles.bgPrimary, styles.px4, styles.pt3, styles.pb2)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb0)}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold)}>
            Booking Details
          </Text>
          <View style={clsx(styles.w10)} />
        </View>

        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
          <View>
            <Text style={clsx(styles.textWhite, styles.textBase, styles.opacity75)}>
              Booking ID
            </Text>
            <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
              {formattedData.bookingId}
            </Text>
          </View>
          
          <View style={clsx(
            styles.px4,
            styles.py2,
            styles.roundedFull,
            { backgroundColor: getStatusBgColor() }
          )}>
            <Text style={clsx(
              styles.fontBold,
              { color: getStatusColor() }
            )}>
              {getStatusLabel()}
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
          />
        }
      >

        {/* Customer Information */}
        <View style={clsx(styles.px4, styles.mt4)}>
          <View style={clsx(
            styles.bgWhite,
            styles.roundedLg,
            styles.p4,
            styles.shadowSm
          )}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
              <View style={[clsx(styles.roundedFull, styles.overflowHidden, styles.mr2), 
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
                { backgroundColor: `${getStatusColor()}20` }
              ]}>
                <Icon name="home-repair-service" size={28} color={getStatusColor()} />
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
            {(bookingItems.length > 1) && (
              <View style={clsx(styles.mb4)}>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
                  Service Items
                </Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  {formattedData.serviceDetails}
                </Text>
              </View>
            )}

            {/* Parts Info */}
            {renderPartsInfoInServiceCard()}

            {/* Media Status Summary */}
            <View style={clsx(styles.mt4)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
                Media Status
              </Text>
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <View style={clsx(styles.itemsCenter)}>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>Before</Text>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                    {mediaSummary.totalBefore}
                  </Text>
                </View>
                <View style={clsx(styles.itemsCenter)}>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>After</Text>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                    {mediaSummary.totalAfter}
                  </Text>
                </View>
                <View style={clsx(styles.itemsCenter)}>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>Captured</Text>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textWarning)}>
                    {mediaSummary.totalCaptured}
                  </Text>
                </View>
              </View>
              
              {/* Upload Button Section */}
              {showUploadButton && (
                <TouchableOpacity
                  style={clsx(
                    styles.bgSuccess,
                    styles.roundedLg,
                    styles.p4,
                    styles.itemsCenter,
                    styles.justifyCenter,
                    styles.mt3,
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
                        Upload All Captured Media ({mediaSummary.totalCaptured})
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
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
              if(formattedData.status !== 'complete') {
                if (formattedData?.originalData?.booking?.addressId?.lat && formattedData?.originalData?.booking?.addressId?.long) {
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${formattedData.originalData.booking.addressId.lat},${formattedData.originalData.booking.addressId.long}`);
                } else if (formattedData.address) {
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedData.address)}`);
                }
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

        {/* Parts Selection Section (Shows after all before media uploaded) */}
        {renderPartsSelectionSection()}

        {/* Parts Approval Section */}
        {renderPartsApprovalSection()}

        {/* Item-wise Media Sections */}
        {(formattedData.status === 'ongoing' || isPartsApprovalInProgress()) && (
          <View style={clsx(styles.px4, styles.mt4)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Service Proof by Item
            </Text>
            
            {bookingItems.map((item, index) => renderItemMediaSection(item, index))}
            
            {/* Upload Button (if not shown above) */}
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
                      Upload All Captured Media ({mediaSummary.totalCaptured})
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

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
          <ActionButton
            icon="play-arrow"
            label="Start Now"
            color={colors.primary}
            onPress={handleStartService}
          />
        ) : formattedData.status === 'ongoing' ? (
          <ActionButton
            icon="check-circle"
            label="Complete"
            color={colors.success}
            onPress={openCompleteModal}
            disabled={!canCompleteBooking}
          />
        ) : isPartsApprovalInProgress() ? (
          isPartsPending() ? (
            <ActionButton
              icon="schedule"
              label="Pending Approval"
              color={colors.warning}
              outlined={true}
              disabled={true}
            />
          ) : (
            <ActionButton
              icon="check-circle"
              label="Complete"
              color={colors.success}
              onPress={openCompleteModal}
              disabled={!canCompleteBooking}
            />
          )
        ) : null}
      </View>

      {/* Parts Modal */}
      {renderPartsModal()}
    </View>
  );
};

export default BookingDetailScreen;