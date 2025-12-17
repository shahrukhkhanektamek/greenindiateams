import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  Linking,
  Share,
  Modal,
  ActivityIndicator,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BookingDetailScreen = ({ navigation, route }) => {
  const bookingId = '6942a02419205552122790f5';
  console.log('Booking ID:', bookingId);
  const { Toast, Urls, postData, user } = useContext(AppContext);

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  
  // OTP Verification States
  const [otpModalVisible, setOtpModalVisible] = useState(false); 
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  
  // Selfie States
  const [selfieModalVisible, setSelfieModalVisible] = useState(false);
  const [selectedSelfie, setSelectedSelfie] = useState(null);
  const [takingSelfie, setTakingSelfie] = useState(false);
  
  // Media Upload States
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [mediaType, setMediaType] = useState('');
  const [beforeImages, setBeforeImages] = useState([]);
  const [beforeVideos, setBeforeVideos] = useState([]);
  const [afterImages, setAfterImages] = useState([]);
  const [afterVideos, setAfterVideos] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  
  // Complete Booking States
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [cashCollected, setCashCollected] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [additionalItems, setAdditionalItems] = useState([]);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '1', price: '' });
  const [completingBooking, setCompletingBooking] = useState(false);

  // OTP Input Refs
  const otpInputRefs = useRef([]);

  useEffect(() => {
    loadBookingDetails();
  }, []);

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const startOtpTimer = () => {
    setOtpTimer(120); // 2 minutes
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await postData(
        {},
        `${Urls.getBookingDetail}/${bookingId}`,
        'GET'
      );

      if (response?.success && response.data) {
        setBookingData(response.data);
        if (response.data.beforeStartImages) {
          setBeforeImages(response.data.beforeStartImages);
        }
        if (response.data.beforeStartVideos) {
          setBeforeVideos(response.data.beforeStartVideos);
        }
        if (response.data.afterCompleteImages) {
          setAfterImages(response.data.afterCompleteImages);
        }
        if (response.data.afterCompleteVideos) {
          setAfterVideos(response.data.afterCompleteVideos);
        }
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

    const totalAmount = booking.payableAmount || booking.amount || 0;

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return colors.success;
      case 'accept': return colors.primary;
      case 'new': return colors.info;
      case 'upcoming': return colors.warning;
      case 'cancel': return colors.error;
      case 'reject': return colors.error;
      case 'ongoing': return colors.info;
      default: return colors.gray;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'complete': return colors.successLight;
      case 'accept': return colors.primaryLight;
      case 'new': return colors.infoLight;
      case 'upcoming': return colors.warningLight;
      case 'cancel': return colors.errorLight;
      case 'reject': return colors.errorLight;
      case 'ongoing': return colors.infoLight;
      default: return colors.gray100;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return 'New';
      case 'accept': return 'Accepted';
      case 'upcoming': return 'Upcoming';
      case 'complete': return 'Completed';
      case 'cancel': return 'Cancelled';
      case 'reject': return 'Rejected';
      case 'ongoing': return 'In Progress';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  // 1️⃣ FIXED OTP FUNCTIONS
  const sendOtp = async () => {
    try {
      setSendingOtp(true);
      setOtpError('');
      
      console.log('Sending OTP for booking:', bookingData?._id);
      
      const response = await postData(
        { 
          bookingId: bookingData?._id,
        },
        Urls.sendOtp,
        'POST'
      );

      console.log('Send OTP Response:', response);

      if (response?.success) {
        setOtpSent(true);
        startOtpTimer();
        
        Toast.show({
          type: 'success',
          text1: 'OTP Sent Successfully',
          text2: 'OTP has been sent to customer\'s mobile',
        });
      } else {
        setOtpError(response?.message || 'Failed to send OTP');
        Toast.show({
          type: 'error',
          text1: 'Failed to Send OTP',
          text2: response?.message || 'Please try again',
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError('Failed to send OTP');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send OTP. Please check your connection.',
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const resendOtp = async () => {
    if (otpTimer > 0) {
      Toast.show({
        type: 'info',
        text1: 'Please wait',
        text2: `You can resend OTP in ${formatTime(otpTimer)}`,
      });
      return;
    }
    await sendOtp();
  };

  const verifyOtpAndStartService = async () => {
    const otpString = otp.join('');
    
    // Validate OTP
    if (otpString.length !== 4) {
      setOtpError('Please enter 4-digit OTP');
      return;
    }

    // Validate selfie
    if (!selectedSelfie) {
      setOtpError('Please take a selfie first');
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpError('');

      // Create form data properly
      const formData = new FormData();
      formData.append('bookingId', bookingData?._id);
      formData.append('otp', otpString);
      
      // Append selfie correctly
      if (selectedSelfie.uri) {
        const selfieFile = {
          uri: selectedSelfie.uri,
          type: selectedSelfie.type || 'image/jpeg',
          name: `selfie_${Date.now()}.jpg`,
        };
        formData.append('selfie', selfieFile);
        console.log('Selfie appended:', selfieFile);
      }

      console.log('Verifying OTP...');
      
      const response = await postData(
        formData,
        Urls.verifyOtpAndStart+'/'+bookingId,
        'POST',
        { 
          isFileUpload: true,
        }
      );

      console.log('OTP Verification Response:', response);

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Service Started Successfully',
          text2: 'Booking has been marked as ongoing',
        });
        
        // Reset all states
        setOtpModalVisible(false);
        setSelfieModalVisible(false);
        setSelectedSelfie(null);
        setOtp(['', '', '', '']);
        setOtpSent(false);
        setOtpTimer(0);
        setOtpError('');
        
        // Clear OTP input refs focus
        otpInputRefs.current.forEach(ref => ref?.blur());
        
        // Refresh booking data
        setTimeout(() => {
          loadBookingDetails();
        }, 1500);
        
      } else {
        setOtpError(response?.message || 'Invalid OTP or failed to start service');
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: response?.message || 'Invalid OTP. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('Network error. Please try again.');
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Failed to verify OTP. Please check your connection.',
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  // 2️⃣ MEDIA UPLOAD FUNCTIONS
  const openMediaModal = (type) => {
    setMediaType(type);
    setMediaModalVisible(true);
  };

  const captureMedia = async (type) => {
    try {
      setUploadingMedia(true);
      
      const options = {
        mediaType: type.includes('image') ? 'photo' : 'video',
        includeBase64: false,
        quality: type.includes('image') ? 0.8 : 0.7,
        videoQuality: 'high',
        durationLimit: 60,
      };

      const result = await launchCamera(options);

      if (result.didCancel) {
        setUploadingMedia(false);
        return;
      }
      
      if (result.errorCode) {
        Alert.alert('Error', `Camera error: ${result.errorMessage}`);
        setUploadingMedia(false);
        return;
      }

      if (result.assets && result.assets[0]) {
        const media = result.assets[0];
        await uploadMedia(media);
      }
    } catch (error) {
      console.error('Error capturing media:', error);
      Alert.alert('Error', 'Failed to capture media');
      setUploadingMedia(false);
    }
  };

  const uploadMedia = async (media) => {
    try {
      const formData = new FormData();
      formData.append('bookingId', bookingData?._id);
      formData.append('type', mediaType);
      
      const mediaFile = {
        uri: media.uri,
        type: media.type || (mediaType.includes('image') ? 'image/jpeg' : 'video/mp4'),
        name: `${mediaType}_${Date.now()}.${mediaType.includes('image') ? 'jpg' : 'mp4'}`,
      };
      
      formData.append('file', mediaFile);

      const response = await postData(
        formData,
        Urls.uploadMedia,
        'POST',
        { isFormData: true }
      );

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Upload Successful',
          text2: 'Media uploaded successfully',
        });
        
        // Update local state
        if (mediaType === 'before-image') {
          setBeforeImages(prev => [...prev, media.uri]);
        } else if (mediaType === 'before-video') {
          setBeforeVideos(prev => [...prev, media.uri]);
        } else if (mediaType === 'after-image') {
          setAfterImages(prev => [...prev, media.uri]);
        } else if (mediaType === 'after-video') {
          setAfterVideos(prev => [...prev, media.uri]);
        }
        
        setMediaModalVisible(false);
        loadBookingDetails();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Upload Failed',
          text2: response?.message || 'Failed to upload media',
        });
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: 'Failed to upload media. Please try again.',
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const deleteMedia = async (mediaUri, type) => {
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
              const response = await postData(
                { mediaUri, type },
                Urls.deleteMedia,
                'POST'
              );

              if (response?.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Deleted',
                  text2: 'Media deleted successfully',
                });
                
                // Update local state
                if (type === 'before-image') {
                  setBeforeImages(prev => prev.filter(uri => uri !== mediaUri));
                } else if (type === 'before-video') {
                  setBeforeVideos(prev => prev.filter(uri => uri !== mediaUri));
                } else if (type === 'after-image') {
                  setAfterImages(prev => prev.filter(uri => uri !== mediaUri));
                } else if (type === 'after-video') {
                  setAfterVideos(prev => prev.filter(uri => uri !== mediaUri));
                }
                
                loadBookingDetails();
              }
            } catch (error) {
              console.error('Error deleting media:', error);
            }
          },
        },
      ]
    );
  };

  // 3️⃣ COMPLETE BOOKING FUNCTIONS
  const openCompleteModal = () => {
    setCompleteModalVisible(true);
    if (formattedData?.paymentStatus === 'Pending') {
      setCashAmount(formattedData.amount.toString());
    }
  };

  const addAdditionalItem = () => {
    if (!newItem.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter item name',
      });
      return;
    }
    
    if (!newItem.price || parseFloat(newItem.price) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter valid price',
      });
      return;
    }

    const item = {
      id: Date.now().toString(),
      name: newItem.name.trim(),
      quantity: parseInt(newItem.quantity) || 1,
      price: parseFloat(newItem.price) || 0,
    };

    setAdditionalItems(prev => [...prev, item]);
    setNewItem({ name: '', quantity: '1', price: '' });
    setAddItemModalVisible(false);
    
    Toast.show({
      type: 'success',
      text1: 'Item Added',
      text2: 'Additional item added successfully',
    });
  };

  const removeAdditionalItem = (id) => {
    setAdditionalItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotalAmount = () => {
    let total = formattedData?.originalBookingAmount || 0;
    additionalItems.forEach(item => {
      total += item.price * item.quantity;
    });
    return total;
  };

  const calculateDueAmount = () => {
    const total = calculateTotalAmount();
    if (formattedData?.paymentStatus === 'Paid') {
      const additionalTotal = additionalItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      return additionalTotal;
    }
    return total;
  };

  const handleShareBooking = async () => {
    try {
      const shareMessage = `Booking Details:
ID: ${formattedData?.bookingId}
Service: ${formattedData?.service}
Customer: ${formattedData?.customerName}
Date: ${formattedData?.date}
Time: ${formattedData?.time}
Address: ${formattedData?.address}
Amount: ₹${formattedData?.amount}
Status: ${getStatusLabel(formattedData?.status)}`;

      await Share.share({
        message: shareMessage,
        title: 'Booking Details',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share booking details');
    }
  };

  const completeBooking = async () => {
    try {
      setCompletingBooking(true);
      
      const data = {
        bookingId: bookingData?._id,
        cashCollected: cashCollected,
        cashAmount: cashCollected ? parseFloat(cashAmount) : 0,
        additionalItems: additionalItems,
        totalAmount: calculateTotalAmount(),
        dueAmount: calculateDueAmount(),
      };

      const response = await postData(
        data,
        Urls.completeBooking,
        'POST'
      );

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Booking Completed',
          text2: 'Booking has been completed successfully',
        });
        
        setCompleteModalVisible(false);
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to complete booking',
        });
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to complete booking',
      });
    } finally {
      setCompletingBooking(false);
    }
  };

  // 4️⃣ MODAL COMPONENTS
  const OTPModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={otpModalVisible}
      onRequestClose={() => {
        if (!verifyingOtp) {
          setOtpModalVisible(false);
          setOtpError('');
        }
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={clsx(styles.flex1)}
      >
        <View style={clsx(styles.flex1, styles.justifyEnd, styles.bgBlack50)}>
          <View style={clsx(styles.bgWhite, styles.roundedT3xl, styles.p6)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
              <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                Start Service - OTP Verification
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  if (!verifyingOtp) {
                    setOtpModalVisible(false);
                    setOtpError('');
                  }
                }}
                disabled={verifyingOtp}
              >
                <Icon name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={clsx(styles.textBase, styles.textBlack, styles.mb6)}>
              Enter 4-digit OTP received from customer
            </Text>

            {/* Selfie Preview */}
            {selectedSelfie ? (
              <View style={clsx(styles.mb6, styles.itemsCenter)}>
                <Image
                  source={{ uri: selectedSelfie.uri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: colors.success,
                  }}
                />
                <Text style={clsx(styles.textSm, styles.textSuccess, styles.mt2)}>
                  ✓ Selfie captured
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={clsx(
                  styles.mb6,
                  styles.p4,
                  styles.border,
                  styles.borderDashed,
                  styles.borderPrimary,
                  styles.roundedLg,
                  styles.itemsCenter
                )}
                onPress={() => {
                  setOtpModalVisible(false);
                  setSelfieModalVisible(true);
                }}
                disabled={verifyingOtp}
              >
                <Icon name="camera-alt" size={40} color={colors.primary} />
                <Text style={clsx(styles.textPrimary, styles.fontMedium, styles.mt2)}>
                  Take Selfie First
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Selfie is required to start service
                </Text>
              </TouchableOpacity>
            )}

            {/* OTP Input */}
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb4)}>
              {[0,1,2,3].map((index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpInputRefs.current[index] = ref)}
                  style={clsx(
                    styles.w12,
                    styles.h12,
                    styles.border,
                    styles.roundedLg,
                    styles.textCenter,
                    styles.textXl,
                    styles.fontBold,
                    { 
                      borderColor: otpError ? colors.error : colors.primary,
                      backgroundColor: otp[index] ? colors.primaryLight : colors.white,
                    }
                  )}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={otp[index]}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    if (!numericText) return;
                    
                    const newOtp = [...otp];
                    newOtp[index] = numericText;
                    setOtp(newOtp);
                    setOtpError('');
                    
                    // Auto focus next input
                    if (numericText && index < 3) {
                      otpInputRefs.current[index + 1]?.focus();
                    }
                    
                    // If all fields filled, focus verify button
                    if (index === 3 && numericText) {
                      // You can add logic to auto-submit if needed
                    }
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
                      otpInputRefs.current[index - 1]?.focus();
                    }
                  }}
                  editable={!verifyingOtp}
                  selectTextOnFocus
                />
              ))}
            </View>

            {otpError ? (
              <Text style={clsx(styles.textSm, styles.textError, styles.mb4, styles.textCenter)}>
                {otpError}
              </Text>
            ) : null}


            {/* Verify Button */}
            <TouchableOpacity
              style={clsx(
                styles.bgPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                (verifyingOtp || !selectedSelfie || otp.join('').length !== 4) && styles.opacity50
              )}
              onPress={verifyOtpAndStartService}
              disabled={verifyingOtp || !selectedSelfie || otp.join('').length !== 4}
            >
              {verifyingOtp ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={clsx(styles.textWhite, styles.fontBold)}>
                  Verify OTP & Start Service
                </Text>
              )}
            </TouchableOpacity>
            
            {/* Debug - For testing only */}
            {__DEV__ && (
              <TouchableOpacity
                style={clsx(styles.mt4, styles.p2, styles.bgGray200, styles.roundedFull)}
                onPress={() => {
                  setOtp(['1','2','3','4']);
                  Toast.show({
                    type: 'info',
                    text1: 'Debug',
                    text2: 'Test OTP filled',
                  });
                }}
              >
                <Text style={clsx(styles.textXs, styles.textCenter)}>Fill Test OTP (1234)</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const SelfieModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={selfieModalVisible}
      onRequestClose={() => !takingSelfie && setSelfieModalVisible(false)}
    >
      <View style={clsx(styles.flex1, styles.justifyEnd, styles.bgBlack50)}>
        <View style={clsx(styles.bgWhite, styles.roundedT3xl, styles.p6)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
            <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
              Take Selfie
            </Text>
            <TouchableOpacity 
              onPress={() => !takingSelfie && setSelfieModalVisible(false)}
              disabled={takingSelfie}
            >
              <Icon name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={clsx(styles.textBase, styles.textBlack, styles.mb6)}>
            Take a selfie to verify your identity before starting the service
          </Text>

          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.gap3)}>
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.border,
                styles.borderPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                takingSelfie && styles.opacity50
              )}
              onPress={async () => {
                try {
                  setTakingSelfie(true);
                  const result = await launchCamera({
                    mediaType: 'photo',
                    cameraType: 'front',
                    quality: 0.8,
                    includeBase64: false,
                  });
                  
                  if (result.didCancel) {
                    setTakingSelfie(false);
                    return;
                  }
                  
                  if (result.errorCode) {
                    Alert.alert('Error', `Camera error: ${result.errorMessage}`);
                    setTakingSelfie(false);
                    return;
                  }
                  
                  if (result.assets && result.assets[0]) {
                    setSelectedSelfie(result.assets[0]);
                    Toast.show({
                      type: 'success',
                      text1: 'Selfie Captured',
                      text2: 'Selfie captured successfully',
                    });
                    setSelfieModalVisible(false);
                    setOtpModalVisible(true);
                  }
                } catch (error) {
                  console.error('Error taking selfie:', error);
                  Alert.alert('Error', 'Failed to take selfie');
                } finally {
                  setTakingSelfie(false);
                }
              }}
              disabled={takingSelfie}
            >
              {takingSelfie ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Icon name="camera-alt" size={32} color={colors.primary} />
                  <Text style={clsx(styles.textPrimary, styles.fontBold, styles.mt2)}>
                    Take Selfie
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.border,
                styles.borderSuccess,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter
              )}
              onPress={async () => {
                try {
                  const result = await launchImageLibrary({
                    mediaType: 'photo',
                    quality: 0.8,
                    includeBase64: false,
                  });
                  
                  if (result.assets && result.assets[0]) {
                    setSelectedSelfie(result.assets[0]);
                    Toast.show({
                      type: 'success',
                      text1: 'Selfie Selected',
                      text2: 'Selfie selected from gallery',
                    });
                    setSelfieModalVisible(false);
                    setOtpModalVisible(true);
                  }
                } catch (error) {
                  console.error('Error selecting selfie:', error);
                  Alert.alert('Error', 'Failed to select image');
                }
              }}
            >
              <Icon name="photo-library" size={32} color={colors.success} />
              <Text style={clsx(styles.textSuccess, styles.fontBold, styles.mt2)}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const MediaModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={mediaModalVisible}
      onRequestClose={() => !uploadingMedia && setMediaModalVisible(false)}
    >
      <View style={clsx(styles.flex1, styles.justifyEnd, styles.bgBlack50)}>
        <View style={clsx(styles.bgWhite, styles.roundedT3xl, styles.p6)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
            <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
              {mediaType === 'before-image' ? 'Upload Before Service Image' :
               mediaType === 'before-video' ? 'Upload Before Service Video' :
               mediaType === 'after-image' ? 'Upload After Service Image' : 'Upload After Service Video'}
            </Text>
            <TouchableOpacity 
              onPress={() => setMediaModalVisible(false)}
              disabled={uploadingMedia}
            >
              <Icon name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.gap3)}>
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.border,
                styles.borderPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                uploadingMedia && styles.opacity50
              )}
              onPress={() => captureMedia(mediaType)}
              disabled={uploadingMedia}
            >
              {uploadingMedia ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Icon 
                    name={mediaType.includes('image') ? 'camera-alt' : 'videocam'} 
                    size={32} 
                    color={colors.primary} 
                  />
                  <Text style={clsx(styles.textPrimary, styles.fontBold, styles.mt2)}>
                    {mediaType.includes('image') ? 'Take Photo' : 'Record Video'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.border,
                styles.borderSuccess,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                uploadingMedia && styles.opacity50
              )}
              onPress={async () => {
                try {
                  setUploadingMedia(true);
                  const result = await launchImageLibrary({
                    mediaType: mediaType.includes('image') ? 'photo' : 'video',
                    quality: 0.8,
                    includeBase64: false,
                  });
                  
                  if (result.assets && result.assets[0]) {
                    await uploadMedia(result.assets[0]);
                  } else {
                    setUploadingMedia(false);
                  }
                } catch (error) {
                  console.error('Error selecting media:', error);
                  setUploadingMedia(false);
                }
              }}
              disabled={uploadingMedia}
            >
              <Icon name="photo-library" size={32} color={colors.success} />
              <Text style={clsx(styles.textSuccess, styles.fontBold, styles.mt2)}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const CompleteBookingModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={completeModalVisible}
      onRequestClose={() => !completingBooking && setCompleteModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={clsx(styles.flex1)}
      >
        <View style={clsx(styles.flex1, styles.justifyEnd, styles.bgBlack50)}>
          <ScrollView 
            style={clsx(styles.bgWhite, styles.roundedT3xl, styles.maxH80)}
            showsVerticalScrollIndicator={false}
          >
            <View style={clsx(styles.p6)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
                <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                  Complete Booking
                </Text>
                <TouchableOpacity 
                  onPress={() => setCompleteModalVisible(false)}
                  disabled={completingBooking}
                >
                  <Icon name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Payment Summary */}
              <View style={clsx(styles.mb6, styles.p4, styles.bgGray50, styles.roundedLg)}>
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
                  Payment Summary
                </Text>
                
                <View style={clsx(styles.mb3)}>
                  <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                    <Text style={clsx(styles.textBase, styles.textBlack)}>Original Amount:</Text>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                      ₹{formattedData?.originalBookingAmount || 0}
                    </Text>
                  </View>
                  
                  {additionalItems.length > 0 && (
                    <>
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mt3, styles.mb2)}>
                        Additional Items:
                      </Text>
                      {additionalItems.map(item => (
                        <View key={item.id} style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                          <Text style={clsx(styles.textSm, styles.textMuted)}>
                            {item.quantity}x {item.name}
                          </Text>
                          <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                            ₹{item.price * item.quantity}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}
                  
                  <View style={clsx(styles.borderTop, styles.borderLight, styles.pt3, styles.mt3)}>
                    <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                      <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>Total Amount:</Text>
                      <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                        ₹{calculateTotalAmount()}
                      </Text>
                    </View>
                    
                    <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                      <Text style={clsx(styles.textBase, styles.textMuted)}>Payment Status:</Text>
                      <Text style={clsx(
                        styles.textBase,
                        styles.fontMedium,
                        formattedData?.paymentStatus === 'Paid' ? styles.textSuccess : styles.textWarning
                      )}>
                        {formattedData?.paymentStatus}
                      </Text>
                    </View>
                    
                    <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mt2)}>
                      <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary)}>Amount Due:</Text>
                      <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary)}>
                        ₹{calculateDueAmount()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Cash Collection */}
              {calculateDueAmount() > 0 && (
                <View style={clsx(styles.mb6, styles.p4, styles.bgGray50, styles.roundedLg)}>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
                    Cash Collection
                  </Text>
                  
                  <TouchableOpacity
                    style={clsx(
                      styles.flexRow,
                      styles.itemsCenter,
                      styles.mb4,
                      styles.p3,
                      styles.roundedLg,
                      cashCollected ? styles.bgSuccessLight : styles.bgWhite,
                      styles.border,
                      cashCollected ? styles.borderSuccess : styles.borderLight
                    )}
                    onPress={() => setCashCollected(!cashCollected)}
                  >
                    <View style={clsx(
                      styles.w6,
                      styles.h6,
                      styles.border,
                      styles.roundedFull,
                      styles.itemsCenter,
                      styles.justifyCenter,
                      styles.mr3,
                      cashCollected ? styles.bgSuccess : styles.bgWhite,
                      cashCollected ? styles.borderSuccess : styles.borderGray
                    )}>
                      {cashCollected && <Icon name="check" size={16} color={colors.white} />}
                    </View>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                      Cash Collected
                    </Text>
                  </TouchableOpacity>
                  
                  {cashCollected && (
                    <View>
                      <Text style={clsx(styles.textSm, styles.textMuted, styles.mb2)}>
                        Amount Collected
                      </Text>
                      <TextInput
                        style={clsx(
                          styles.border,
                          styles.borderPrimary,
                          styles.roundedLg,
                          styles.p3,
                          styles.textBase,
                          styles.textBlack
                        )}
                        placeholder="Enter amount"
                        keyboardType="numeric"
                        value={cashAmount}
                        onChangeText={setCashAmount}
                        editable={!completingBooking}
                      />
                    </View>
                  )}
                </View>
              )}

              {/* Additional Items */}
              <View style={clsx(styles.mb6)}>
                <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                    Additional Items
                  </Text>
                  <TouchableOpacity
                    style={clsx(
                      styles.flexRow,
                      styles.itemsCenter,
                      styles.px3,
                      styles.py2,
                      styles.bgPrimary,
                      styles.roundedFull
                    )}
                    onPress={() => setAddItemModalVisible(true)}
                    disabled={completingBooking}
                  >
                    <Icon name="add" size={20} color={colors.white} />
                    <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
                      Add Item
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {additionalItems.length === 0 ? (
                  <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter, styles.p4)}>
                    No additional items added
                  </Text>
                ) : (
                  <View>
                    {additionalItems.map(item => (
                      <View key={item.id} style={clsx(
                        styles.flexRow,
                        styles.itemsCenter,
                        styles.justifyBetween,
                        styles.p3,
                        styles.bgWhite,
                        styles.roundedLg,
                        styles.mb2,
                        styles.shadowSm
                      )}>
                        <View style={clsx(styles.flex1)}>
                          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                            {item.quantity}x {item.name}
                          </Text>
                          <Text style={clsx(styles.textSm, styles.textMuted)}>
                            ₹{item.price} each
                          </Text>
                        </View>
                        <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                          <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary, styles.mr3)}>
                            ₹{item.price * item.quantity}
                          </Text>
                          <TouchableOpacity 
                            onPress={() => removeAdditionalItem(item.id)}
                            disabled={completingBooking}
                          >
                            <Icon name="delete" size={20} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Complete Button */}
              <TouchableOpacity
                style={clsx(
                  styles.bgSuccess,
                  styles.roundedLg,
                  styles.p4,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  completingBooking && styles.opacity50
                )}
                onPress={completeBooking}
                disabled={completingBooking}
              >
                {completingBooking ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                    Complete Booking
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const AddItemModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addItemModalVisible}
      onRequestClose={() => setAddItemModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={clsx(styles.flex1)}
      >
        <View style={clsx(styles.flex1, styles.justifyEnd, styles.bgBlack50)}>
          <View style={clsx(styles.bgWhite, styles.roundedT3xl, styles.p6)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
              <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                Add Additional Item
              </Text>
              <TouchableOpacity onPress={() => setAddItemModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mb2)}>Item Name</Text>
              <TextInput
                style={clsx(
                  styles.border,
                  styles.borderPrimary,
                  styles.roundedLg,
                  styles.p3,
                  styles.textBase,
                  styles.textBlack
                )}
                placeholder="e.g., AC Gas, Spare Parts"
                value={newItem.name}
                onChangeText={(text) => setNewItem({...newItem, name: text})}
              />
            </View>

            <View style={clsx(styles.flexRow, styles.gap3, styles.mb4)}>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mb2)}>Quantity</Text>
                <TextInput
                  style={clsx(
                    styles.border,
                    styles.borderPrimary,
                    styles.roundedLg,
                    styles.p3,
                    styles.textBase,
                    styles.textBlack,
                    styles.textCenter
                  )}
                  placeholder="1"
                  keyboardType="numeric"
                  value={newItem.quantity}
                  onChangeText={(text) => setNewItem({...newItem, quantity: text})}
                />
              </View>
              
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mb2)}>Price (₹)</Text>
                <TextInput
                  style={clsx(
                    styles.border,
                    styles.borderPrimary,
                    styles.roundedLg,
                    styles.p3,
                    styles.textBase,
                    styles.textBlack,
                    styles.textCenter
                  )}
                  placeholder="0"
                  keyboardType="numeric"
                  value={newItem.price}
                  onChangeText={(text) => setNewItem({...newItem, price: text})}
                />
              </View>
            </View>

            <TouchableOpacity
              style={clsx(
                styles.bgPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter
              )}
              onPress={addAdditionalItem}
            >
              <Text style={clsx(styles.textWhite, styles.fontBold)}>
                Add Item
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // 5️⃣ MEDIA DISPLAY COMPONENTS
  const MediaSection = ({ title, images, videos, type }) => (
    <View style={clsx(styles.mb6)}>
      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
          {title}
        </Text>
        <TouchableOpacity
          style={clsx(
            styles.flexRow,
            styles.itemsCenter,
            styles.px3,
            styles.py1,
            styles.bgPrimary,
            styles.roundedFull
          )}
          onPress={() => openMediaModal(`${type}-image`)}
        >
          <Icon name="add" size={16} color={colors.white} />
          <Text style={clsx(styles.textWhite, styles.textSm, styles.ml1)}>
            Add {images.length + videos.length > 0 ? 'More' : ''}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Images Grid */}
      {images.length > 0 && (
        <View style={clsx(styles.mb4)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
            Images ({images.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, index) => (
              <View key={index} style={clsx(styles.mr3, styles.positionRelative)}>
                <Image
                  source={{ uri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                  }}
                />
                <TouchableOpacity
                  style={clsx(
                    styles.absolute,
                    styles.top1,
                    styles.right1,
                    styles.bgWhite,
                    styles.roundedFull,
                    styles.p1,
                    styles.shadowSm
                  )}
                  onPress={() => deleteMedia(uri, `${type}-image`)}
                >
                  <Icon name="close" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Videos Grid */}
      {videos.length > 0 && (
        <View>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
            Videos ({videos.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {videos.map((uri, index) => (
              <View key={index} style={clsx(styles.mr3, styles.positionRelative)}>
                <View style={{
                  width: 100,
                  height: 100,
                  borderRadius: 8,
                  backgroundColor: colors.gray300,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon name="play-circle-filled" size={40} color={colors.white} />
                </View>
                <TouchableOpacity
                  style={clsx(
                    styles.absolute,
                    styles.top1,
                    styles.right1,
                    styles.bgWhite,
                    styles.roundedFull,
                    styles.p1,
                    styles.shadowSm
                  )}
                  onPress={() => deleteMedia(uri, `${type}-video`)}
                >
                  <Icon name="close" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      
      {images.length === 0 && videos.length === 0 && (
        <View style={clsx(styles.p4, styles.bgGray50, styles.roundedLg, styles.itemsCenter)}>
          <Icon name="photo-library" size={40} color={colors.gray400} />
          <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2)}>
            No {title.toLowerCase()} uploaded yet
          </Text>
        </View>
      )}
    </View>
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
          <TouchableOpacity onPress={handleShareBooking}>
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
        contentContainerStyle={clsx(styles.pb24)}
      >
        {/* Service Card */}
        <View style={clsx(styles.px4, styles.pt4)}>
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
                  ₹{formattedData.amount}
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
            </View>
          </View>
        </View>

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
                    source={{ uri: formattedData.profileImage }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <View style={clsx(styles.flex1, styles.itemsCenter, styles.justifyCenter)}>
                    <Icon name="person" size={32} color={colors.gray500} />
                  </View>
                )}
              </View>
              <View style={clsx(styles.ml3, styles.flex1)}>
                <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                  {formattedData.customerName}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  📞 {formattedData.mobile}
                </Text>
              </View>
            </View>

            {/* Contact Buttons */}
            <View style={clsx(styles.flexRow, styles.gap2)}>
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.flex1,
                  styles.bgPrimary,
                  styles.py2,
                  styles.roundedLg
                )}
                onPress={() => Linking.openURL(`tel:${formattedData.mobile}`)}
              >
                <Icon name="call" size={20} color={colors.white} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textWhite, styles.fontMedium)}>
                  Call
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.flex1,
                  styles.bgSuccess,
                  styles.py2,
                  styles.roundedLg
                )}
                onPress={() => Linking.openURL(`sms:${formattedData.mobile}`)}
              >
                <Icon name="message" size={20} color={colors.white} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textWhite, styles.fontMedium)}>
                  Message
                </Text>
              </TouchableOpacity>
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
            onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedData.address)}`)}
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

        {/* Media Upload Sections - Only show if booking is ongoing */}
        {formattedData.status === 'ongoing' && (
          <View style={clsx(styles.px4, styles.mt4)}>
            <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack, styles.mb4)}>
              Service Proof Upload
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mb6)}>
              Upload images/videos before and after service
            </Text>
            
            <MediaSection
              title="Before Service"
              images={beforeImages}
              videos={beforeVideos}
              type="before"
            />
            
            <MediaSection
              title="After Service"
              images={afterImages}
              videos={afterVideos}
              type="after"
            />
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
              onPress={() => setOtpModalVisible(true)}
            />
          </>
        ) : formattedData.status === 'ongoing' ? (
          <>
            <ActionButton
              icon="add-a-photo"
              label="Add Media"
              color={colors.info}
              outlined={true}
              onPress={() => openMediaModal('before-image')}
            />
            <ActionButton
              icon="check-circle"
              label="Complete"
              color={colors.success}
              onPress={openCompleteModal}
            />
          </>
        ) : null}
      </View>

      {/* All Modals */}
      <OTPModal />
      <SelfieModal />
      <MediaModal />
      <CompleteBookingModal />
      <AddItemModal />
    </View>
  );
};

export default BookingDetailScreen;