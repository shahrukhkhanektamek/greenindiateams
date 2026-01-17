import React, { useState, useEffect, useContext, useRef } from 'react';
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
  Modal,
  Platform, 
  TextInput,
  StyleSheet,
  PermissionsAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';
import Geolocation from '@react-native-community/geolocation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BookingDetailScreen = ({ navigation, route }) => {
  const bookingId = route.params.booking._id;
  
  const { Toast, Urls, postData, user, token, UploadUrl, imageCheck } = useContext(AppContext);

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  
  // Location Verification States
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distanceToBooking, setDistanceToBooking] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [locationError, setLocationError] = useState('');
  
  // Service Modal Flow States
  const [serviceModalStep, setServiceModalStep] = useState('location'); // 'location', 'selfie', 'otp'
  const [selectedSelfie, setSelectedSelfie] = useState(null);
  const [otpInputs, setOtpInputs] = useState(Array(4).fill(''));
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  
  // Camera States
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices[1];
  const cameraRef = useRef(null);
  console.log(devices)
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

  useEffect(() => {
    loadBookingDetails();
  }, []);

  useEffect(() => {
    // checkCameraPermission();
    setCameraPermission(true);
  }, []);

  const checkCameraPermission = async () => {
    try {
      const cameraPermissionStatus = await Camera.getCameraPermissionStatus();
      if (cameraPermissionStatus === 'authorized') {
        setCameraPermission(true);
      } else {
        const newCameraPermission = await Camera.requestCameraPermission();
        setCameraPermission(newCameraPermission === 'authorized');
      }
    } catch (error) {
      console.error('Error checking camera permission:', error);
    }
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

  // Function to get current location
  const getCurrentLocation = async () => {
    try {
      let positions = {};
      
      // Android के लिए permission check
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission denied');
          return null;
        }
      }

      // Promise का use करके location get करें
      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          resolve,  // success होने पर
          reject,   // error होने पर
          {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 0,
          }
        );
      });

      // Position data format करें
      positions = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      console.log('Location fetched:', positions);
      return positions;

    } catch (error) {
      console.log('Error getting location:', error);
      return null;
    }
  };

  // Main function to verify location
  const verifyLocation = async () => {
    try {
      setCheckingLocation(true);
      setLocationStatus('checking');
      setLocationError('');
      
      // Check if booking has location coordinates
      const booking = bookingData?.booking;
      const address = booking?.addressId;
      
      if (!address || !address.lat || !address.long) {
        setLocationStatus('error');
        setLocationError('Booking address coordinates not available');
        return false;
      }
      
      const bookingLat = parseFloat(address.lat);
      const bookingLng = parseFloat(address.long);
      
      // Get current location
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      let nearby = null;
      let distance = 0;
      let distanceCheck = 0;
      const response = await postData(
        {
            "servicemanLat":location.latitude,
            "servicemanLng":location.longitude,
            "userLat":bookingLat,
            "userLng":bookingLng
        },
        `${Urls.getDistence}`,
        'POST'
      );
      if(response.success==true)
      {
        distance = response.data.distance;
        nearby = response.data.nearby;
        distanceCheck = response.data.distanceCheck;
        setDistanceToBooking(distance);
      
        // Check if within allowed distance
        if (distance <= distanceCheck) {
          setLocationStatus('success');
          return true;
        } else {
          setLocationStatus('far');
          return false;
        }
      }

      return false;
      
    } catch (error) {
      console.error('Error verifying location:', error);
      setLocationStatus('error');
      setLocationError(error.message || 'Failed to get location');
      return false;
    } finally {
      setCheckingLocation(false);
    }
  };

  // Function to handle start service with location verification
  const handleStartService = async () => {

    navigation.navigate('StartServiceScreen', {
      bookingData,
      loadBookingDetails,
    });
    return false;

    try {
      setServiceModalStep('location');
      setShowServiceModal(true);
      setCheckingLocation(true);
      
      // First verify location
      const isAtLocation = await verifyLocation();
      
      if (isAtLocation) {
        // Location is verified, move to selfie step
        setServiceModalStep('selfie');
      }
    } catch (error) {
      console.error('Error in handleStartService:', error);
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Failed to verify location',
      });
    } finally {
      setCheckingLocation(false);
    }
  };

  // Function to retry location verification
  const retryLocationCheck = async () => {
    setCheckingLocation(true);
    const isAtLocation = await verifyLocation();
    if (isAtLocation) {
      setServiceModalStep('selfie');
    }
    setCheckingLocation(false);
  };

  // Function to format distance
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} meters`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  };

  // Camera Functions
  const takeSelfie = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
          quality: 0.8,
        });
        
        setSelectedSelfie({
          uri: `file://${photo.path}`,
          type: 'image/jpeg',
          name: `selfie_${Date.now()}.jpg`,
        });
        
        // Move to OTP step
        setShowCamera(false);
        setServiceModalStep('otp');
      }
    } catch (error) {
      console.error('Error taking selfie:', error);
      Toast.show({
        type: 'error',
        text1: 'Camera Error',
        text2: 'Failed to capture selfie',
      });
    }
  };

  // OTP Functions
  const handleOtpChange = (text, index) => {
    const newOtp = [...otpInputs];
    newOtp[index] = text;
    setOtpInputs(newOtp);
    
    // Auto focus next input
    if (text && index < 3) {
      // Focus next input
    }
  };

  const verifyOTP = async () => {
    try {
      setVerifyingOTP(true);
      const otpString = otpInputs.join('');
      
      // Send OTP verification request
      const response = await postData(
        {
          otp: otpString,
          bookingId: bookingData?._id,
          selfie: selectedSelfie,
        },
        `${Urls.verifyOTP}`,
        'POST',
        {
          isFileUpload: true,
        }
      );
      
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Service Started',
          text2: 'OTP verified successfully. Service has been started.',
        });
        
        // Close modal and refresh booking details
        setShowServiceModal(false);
        loadBookingDetails();
        
        // Reset states
        setServiceModalStep('location');
        setSelectedSelfie(null);
        setOtpInputs(Array(4).fill(''));
      } else {
        Toast.show({
          type: 'error',
          text1: 'OTP Error',
          text2: response?.message || 'Invalid OTP',
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to verify OTP',
      });
    } finally {
      setVerifyingOTP(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    try {
      const response = await postData(
        { bookingId: bookingData?._id },
        `${Urls.resendOTP}`,
        'POST'
      );
      
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'New OTP has been sent to customer',
        });
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
    }
  };

  // Service Modal Component
  const ServiceModal = () => {
    const booking = bookingData?.booking;
    const address = booking?.addressId;
    
    // Render Location Verification Step
    const renderLocationStep = () => (
      <View style={clsx(styles.itemsCenter)}>
        {/* Modal Header */}
        <View style={clsx(styles.itemsCenter, styles.mb6)}>
          <View style={[
            clsx(styles.roundedFull, styles.p3, styles.mb3),
            locationStatus === 'success' ? { backgroundColor: `${colors.success}20` } :
            locationStatus === 'far' ? { backgroundColor: `${colors.warning}20` } :
            locationStatus === 'error' ? { backgroundColor: `${colors.error}20` } :
            { backgroundColor: `${colors.info}20` }
          ]}>
            <Icon 
              name={
                locationStatus === 'success' ? 'check-circle' :
                locationStatus === 'far' ? 'location-off' :
                locationStatus === 'error' ? 'error' :
                'my-location'
              } 
              size={40} 
              color={
                locationStatus === 'success' ? colors.success :
                locationStatus === 'far' ? colors.warning :
                locationStatus === 'error' ? colors.error :
                colors.info
              } 
            />
          </View>
          
          <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack, styles.textCenter)}>
            {locationStatus === 'success' ? 'Location Verified!' :
             locationStatus === 'far' ? 'Too Far From Location' :
             locationStatus === 'error' ? 'Location Error' :
             'Verifying Location...'}
          </Text>
          
          <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter, styles.mt2)}>
            {locationStatus === 'success' ? 'You are at the service location' :
             locationStatus === 'far' ? 'You need to be at the service location to start' :
             locationStatus === 'error' ? 'Could not verify your location' :
             'Checking your current location...'}
          </Text>
        </View>
        
        {/* Location Details */}
        {currentLocation && distanceToBooking !== null && address?.lat && address?.long && (
          <View style={clsx(styles.mb6, styles.wFull)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
              <Text style={clsx(styles.textBase, styles.textMuted)}>Your Location:</Text>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
              <Text style={clsx(styles.textBase, styles.textMuted)}>Service Location:</Text>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                {parseFloat(address.lat).toFixed(6)}, {parseFloat(address.long).toFixed(6)}
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.textMuted)}>Distance:</Text>
              <Text style={clsx(
                styles.textBase,
                styles.fontBold,
                distanceToBooking <= 0.5 ? styles.textSuccess : styles.textError
              )}>
                {formatDistance(distanceToBooking)}
              </Text>
            </View>
            
            {/* Distance Indicator */}
            <View style={clsx(styles.mb6)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                <Text style={clsx(styles.textSm, styles.textMuted)}>Allowed: 500 meters</Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>Current: {formatDistance(distanceToBooking)}</Text>
              </View>
              <View style={clsx(styles.bgGray200, styles.roundedFull, styles.overflowHidden, { height: 8 })}>
                <View 
                  style={[
                    clsx(styles.hFull, styles.roundedFull),
                    { 
                      width: `${Math.min((distanceToBooking * 1000) / 500 * 100, 100)}%`,
                      backgroundColor: distanceToBooking <= 0.5 ? colors.success : colors.error
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        )}
        
        {/* Error Message */}
        {locationError && (
          <View style={clsx(styles.bgErrorLight, styles.p3, styles.roundedLg, styles.mb6, styles.wFull)}>
            <Text style={clsx(styles.textSm, styles.textError)}>{locationError}</Text>
          </View>
        )}
        
        {/* Action Buttons */}
        <View style={clsx(styles.flexRow, styles.gap3, styles.wFull)}>
          {locationStatus === 'far' && (
            <>
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.border,
                  styles.borderPrimary,
                  styles.roundedLg,
                  styles.p3,
                  styles.itemsCenter,
                  styles.justifyCenter
                )}
                onPress={() => setShowServiceModal(false)}
              >
                <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.bgPrimary,
                  styles.roundedLg,
                  styles.p3,
                  styles.itemsCenter,
                  styles.justifyCenter
                )}
                onPress={() => {
                  if (address && address.lat && address.long) {
                    const bookingLat = parseFloat(address.lat);
                    const bookingLng = parseFloat(address.long);
                    
                    const url = Platform.select({
                      ios: `maps://?q=${bookingLat},${bookingLng}`,
                      android: `geo:${bookingLat},${bookingLng}?q=${bookingLat},${bookingLng}`,
                    });
                    
                    Linking.openURL(url).catch(() => {
                      const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${bookingLat},${bookingLng}`;
                      Linking.openURL(fallbackUrl);
                    });
                  }
                }}
              >
                <Icon name="directions" size={20} color={colors.white} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textWhite, styles.fontBold)}>
                  Navigate
                </Text>
              </TouchableOpacity>
            </>
          )}
          
          {locationStatus === 'error' && (
            <>
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.border,
                  styles.borderPrimary,
                  styles.roundedLg,
                  styles.p3,
                  styles.itemsCenter,
                  styles.justifyCenter
                )}
                onPress={() => setShowServiceModal(false)}
              >
                <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.bgPrimary,
                  styles.roundedLg,
                  styles.p3,
                  styles.itemsCenter,
                  styles.justifyCenter
                )}
                onPress={retryLocationCheck}
                disabled={checkingLocation}
              >
                {checkingLocation ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Icon name="refresh" size={20} color={colors.white} style={clsx(styles.mr2)} />
                    <Text style={clsx(styles.textWhite, styles.fontBold)}>
                      Retry
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
          
          {locationStatus === 'success' && (
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.bgSuccess,
                styles.roundedLg,
                styles.p3,
                styles.itemsCenter,
                styles.justifyCenter
              )}
              onPress={() => setServiceModalStep('selfie')}
            >
              <Icon name="check-circle" size={20} color={colors.white} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textWhite, styles.fontBold)}>
                Continue
              </Text>
            </TouchableOpacity>
          )}
          
          {(locationStatus === 'checking' || checkingLocation) && (
            <View style={clsx(styles.flex1, styles.itemsCenter, styles.justifyCenter)}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mt3)}>
                Checking location...
              </Text>
            </View>
          )}
        </View>
        
        {/* Footer Note */}
        <Text style={clsx(styles.textXs, styles.textMuted, styles.textCenter, styles.mt6)}>
          Note: You must be within 500 meters of the service location to start
        </Text>
      </View>
    );

    // Render Selfie Capture Step
    const renderSelfieStep = () => (
      <View style={clsx(styles.itemsCenter)}>
        <View style={clsx(styles.itemsCenter, styles.mb6)}>
          <View style={[
            clsx(styles.roundedFull, styles.p3, styles.mb3),
            { backgroundColor: `${colors.primary}20` }
          ]}>
            <Icon name="camera-alt" size={40} color={colors.primary} />
          </View>
          
          <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack, styles.textCenter)}>
            Take Selfie Verification
          </Text>
          
          <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter, styles.mt2)}>
            Please take a selfie to verify your identity at the service location
          </Text>
        </View>
        
        {/* Camera Preview or Selected Selfie */}
        <View style={[clsx(styles.mb6, styles.roundedLg, styles.overflowHidden), 
          { width: SCREEN_WIDTH * 0.6, height: SCREEN_WIDTH * 0.8 }]}
        >
          {showCamera && device && cameraPermission ? (
            <>
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={showCamera}
                photo={true}
              />
              <View style={[StyleSheet.absoluteFill, 
                { justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 20 }]}
              >
                <TouchableOpacity
                  onPress={takeSelfie}
                  style={clsx(
                    styles.bgWhite,
                    styles.roundedFull,
                    styles.p3,
                    styles.shadowLg
                  )}
                >
                  <View style={[clsx(styles.roundedFull), 
                    { width: 60, height: 60, backgroundColor: colors.primary }]}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : selectedSelfie ? (
            <Image
              source={{ uri: selectedSelfie.uri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={[clsx(styles.flex1, styles.bgGray200, styles.itemsCenter, styles.justifyCenter)]}>
              <Icon name="camera-alt" size={60} color={colors.gray400} />
              <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2)}>
                Camera preview
              </Text>
            </View>
          )}
        </View>
        
        {/* Selfie Actions */}
        <View style={clsx(styles.flexRow, styles.gap3, styles.wFull)}>
          {!selectedSelfie ? (
            <>
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.border,
                  styles.borderPrimary,
                  styles.roundedLg,
                  styles.p3,
                  styles.itemsCenter,
                  styles.justifyCenter
                )}
                onPress={() => setServiceModalStep('location')}
              >
                <Icon name="arrow-back" size={20} color={colors.primary} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                  Back
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.bgPrimary,
                  styles.roundedLg,
                  styles.p3,
                  styles.itemsCenter,
                  styles.justifyCenter
                )}
                onPress={() => {
                  setShowCamera(true);
                }}
                disabled={!cameraPermission}
              >
                <Icon name="camera-alt" size={20} color={colors.white} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textWhite, styles.fontBold)}>
                  {cameraPermission ? 'Open Camera' : 'Permission Needed'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.border,
                  styles.borderPrimary,
                  styles.roundedLg,
                  styles.p3,
                  styles.itemsCenter,
                  styles.justifyCenter
                )}
                onPress={() => {
                  setSelectedSelfie(null);
                  setShowCamera(true);
                }}
              >
                <Icon name="refresh" size={20} color={colors.primary} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                  Retake
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.bgPrimary,
                  styles.roundedLg,
                  styles.p3,
                  styles.itemsCenter,
                  styles.justifyCenter
                )}
                onPress={() => setServiceModalStep('otp')}
              >
                <Icon name="check-circle" size={20} color={colors.white} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textWhite, styles.fontBold)}>
                  Continue
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {/* Camera Permission Note */}
        {!cameraPermission && (
          <Text style={clsx(styles.textXs, styles.textError, styles.textCenter, styles.mt4)}>
            Camera permission is required to take selfie
          </Text>
        )}
      </View>
    );

    // Render OTP Verification Step
    const renderOTPStep = () => (
      <View style={clsx(styles.itemsCenter)}>
        <View style={clsx(styles.itemsCenter, styles.mb6)}>
          <View style={[
            clsx(styles.roundedFull, styles.p3, styles.mb3),
            { backgroundColor: `${colors.info}20` }
          ]}>
            <Icon name="lock" size={40} color={colors.info} />
          </View>
          
          <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack, styles.textCenter)}>
            Enter OTP
          </Text>
          
          <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter, styles.mt2)}>
            Please enter the OTP sent to the customer's mobile number
          </Text>
        </View>
        
        {/* Selected Selfie Preview */}
        {selectedSelfie && (
          <View style={clsx(styles.mb6, styles.itemsCenter)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
              Selfie Preview:
            </Text>
            <Image
              source={{ uri: selectedSelfie.uri }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              resizeMode="cover"
            />
          </View>
        )}
        
        {/* OTP Input Fields */}
        <View style={clsx(styles.flexRow, styles.justifyCenter, styles.gap3, styles.mb8)}>
          {[0, 1, 2, 3].map((index) => (
            <View key={index} style={[
              clsx(styles.border, styles.borderPrimary, styles.roundedLg),
              { 
                width: 50, 
                height: 50,
                backgroundColor: otpInputs[index] ? colors.primaryLight : colors.white
              }
            ]}>
              <TextInput
                style={[
                  clsx(styles.textXl, styles.fontBold, styles.textCenter),
                  { 
                    width: '100%', 
                    height: '100%',
                    color: colors.primary
                  }
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={otpInputs[index]}
                onChangeText={(text) => handleOtpChange(text, index)}
                autoFocus={index === 0}
              />
            </View>
          ))}
        </View>
        
        {/* Resend OTP */}
        <TouchableOpacity
          onPress={resendOTP}
          style={clsx(styles.mb6)}
        >
          <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
            Didn't receive OTP? Resend
          </Text>
        </TouchableOpacity>
        
        {/* OTP Actions */}
        <View style={clsx(styles.flexRow, styles.gap3, styles.wFull)}>
          <TouchableOpacity
            style={clsx(
              styles.flex1,
              styles.border,
              styles.borderPrimary,
              styles.roundedLg,
              styles.p3,
              styles.itemsCenter,
              styles.justifyCenter
            )}
            onPress={() => setServiceModalStep('selfie')}
          >
            <Icon name="arrow-back" size={20} color={colors.primary} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textPrimary, styles.fontBold)}>
              Back
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={clsx(
              styles.flex1,
              styles.bgSuccess,
              styles.roundedLg,
              styles.p3,
              styles.itemsCenter,
              styles.justifyCenter
            )}
            onPress={verifyOTP}
            disabled={verifyingOTP || otpInputs.some(digit => !digit)}
          >
            {verifyingOTP ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="check-circle" size={20} color={colors.white} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textWhite, styles.fontBold)}>
                  Verify & Start
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );

    // Determine which step to render
    const renderStepContent = () => {
      switch (serviceModalStep) {
        case 'location':
          return renderLocationStep();
        case 'selfie':
          return renderSelfieStep();
        case 'otp':
          return renderOTPStep();
        default:
          return renderLocationStep();
      }
    };

    // Get modal title based on step
    const getModalTitle = () => {
      switch (serviceModalStep) {
        case 'location':
          return 'Location Verification';
        case 'selfie':
          return 'Selfie Verification';
        case 'otp':
          return 'OTP Verification';
        default:
          return 'Start Service';
      }
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showServiceModal}
        onRequestClose={() => {
          if (serviceModalStep === 'location') {
            setShowServiceModal(false);
          } else {
            setServiceModalStep('location');
          }
        }}
      >
        <View style={clsx(styles.flex1, styles.justifyCenter, styles.itemsCenter, styles.bgBlack50)}>
          <View style={[
            clsx(styles.bgWhite, styles.roundedLg, styles.p6), 
            { 
              width: SCREEN_WIDTH * 0.9,
              maxHeight: SCREEN_HEIGHT * 0.8
            }
          ]}>
            {/* Modal Header with Step Indicator */}
            <View style={clsx(styles.mb6)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
                <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                  {getModalTitle()}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (serviceModalStep === 'location') {
                      setShowServiceModal(false);
                    } else {
                      setServiceModalStep('location');
                    }
                  }}
                >
                  <Icon name="close" size={24} color={colors.gray500} />
                </TouchableOpacity>
              </View>
              
              {/* Step Indicator */}
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
                {['location', 'selfie', 'otp'].map((step, index) => (
                  <React.Fragment key={step}>
                    <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                      <View style={[
                        clsx(styles.roundedFull, styles.itemsCenter, styles.justifyCenter),
                        { 
                          width: 30, 
                          height: 30,
                          backgroundColor: serviceModalStep === step ? colors.primary : 
                                         ['location', 'selfie', 'otp'].indexOf(serviceModalStep) > index ? colors.success : colors.gray300
                        }
                      ]}>
                        {['location', 'selfie', 'otp'].indexOf(serviceModalStep) > index ? (
                          <Icon name="check" size={16} color={colors.white} />
                        ) : (
                          <Text style={[
                            clsx(styles.textSm, styles.fontBold),
                            { color: serviceModalStep === step ? colors.white : colors.gray600 }
                          ]}>
                            {index + 1}
                          </Text>
                        )}
                      </View>
                      <Text style={[
                        clsx(styles.textSm, styles.ml2, styles.fontMedium),
                        { 
                          color: serviceModalStep === step ? colors.primary : 
                                 ['location', 'selfie', 'otp'].indexOf(serviceModalStep) > index ? colors.success : colors.gray500
                        }
                      ]}>
                        {step === 'location' ? 'Location' : 
                         step === 'selfie' ? 'Selfie' : 'OTP'}
                      </Text>
                    </View>
                    
                    {index < 2 && (
                      <View style={[
                        clsx(styles.flex1, styles.h1, styles.mx2),
                        { 
                          backgroundColor: ['location', 'selfie', 'otp'].indexOf(serviceModalStep) > index ? colors.success : colors.gray300
                        }
                      ]} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
            
            {/* Step Content */}
            {renderStepContent()}
          </View>
        </View>
      </Modal>
    );
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

  // NEW: Function to get combined status with parts approval
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

            console.log(bookingData)
            console.log(bookingId)
            try {
              const response = await postData(
                { bookingId: bookingData.bookingId, servicemanBookingId:bookingData._id },
                `${Urls.cancelPartsRequest}`,
                'POST'
              );
              
              if (response?.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Cancelled',
                  text2: 'Parts request cancelled successfully',
                });
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
      
      // Refresh booking data
      loadBookingDetails();
      
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
              ? 'Parts are pending approval. You cannot upload media or complete service until parts are approved.' 
              : isPartsApproved()
              ? 'Parts have been approved. You can now continue with service.'
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

  // MEDIA DISPLAY COMPONENTS
  const MediaSection = ({ title, uploadedImages, uploadedVideos, capturedImages, capturedVideos, type }) => (
    <View style={clsx(styles.mb6)}>
      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
          {title}
        </Text>
        <View style={clsx(styles.flexRow, styles.gap2)}>
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
            disabled={isPartsPending()}
          >
            <Icon name="add-a-photo" size={16} color={isPartsPending() ? colors.gray500 : colors.white} />
            <Text style={clsx(styles.textSm, styles.ml1, isPartsPending() ? styles.textGray500 : styles.textWhite)}>
              Add Image
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.px3,
              styles.py1,
              styles.bgSecondary,
              styles.roundedFull
            )}
            onPress={() => openMediaModal(`${type}-video`)}
            disabled={isPartsPending()}
          >
            <Icon name="videocam" size={16} color={isPartsPending() ? colors.gray500 : colors.white} />
            <Text style={clsx(styles.textSm, styles.ml1, isPartsPending() ? styles.textGray500 : styles.textWhite)}>
              Add Video
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Captured Media (Not Uploaded Yet) */}
      {(capturedImages.length > 0 || capturedVideos.length > 0) && (
        <View style={clsx(styles.mb4, styles.p3, styles.bgWarningLight, styles.roundedLg, styles.border, styles.borderWarning)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
            📸 Captured Media (Not Uploaded)
          </Text>
          
          {capturedImages.length > 0 && (
            <View style={clsx(styles.mb3)}>
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Images ({capturedImages.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {capturedImages.map((media, index) => (
                  <View key={index} style={clsx(styles.mr3, styles.positionRelative)}>
                    <Image
                      source={{ uri: media.uri }}
                      style={{
                        width: 80,
                        height: 80,
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
                        styles.bgWhite,
                        styles.roundedFull,
                        styles.p1,
                        styles.shadowSm
                      )}
                      onPress={() => deleteCapturedMedia(index, `${type}-image`)}
                    >
                      <Icon name="close" size={14} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
          
          {capturedVideos.length > 0 && (
            <View>
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Videos ({capturedVideos.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {capturedVideos.map((media, index) => (
                  <View key={index} style={clsx(styles.mr3, styles.positionRelative)}>
                    <View style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      backgroundColor: colors.gray300,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: colors.warning,
                    }}>
                      <Icon name="play-circle-filled" size={32} color={colors.white} />
                    </View>
                    <TouchableOpacity
                      style={clsx(
                        styles.absolute,
                        styles.topNegative1,
                        styles.rightNegative1,
                        styles.bgWhite,
                        styles.roundedFull,
                        styles.p1,
                        styles.shadowSm
                      )}
                      onPress={() => deleteCapturedMedia(index, `${type}-video`)}
                    >
                      <Icon name="close" size={14} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}
      
      {/* Uploaded Media */}
      {uploadedImages.length > 0 && (
        <View style={clsx(styles.mb4)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
            ✅ Uploaded Images ({uploadedImages.length})
          </Text>
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
                    }}
                    resizeMode="cover"
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
              );
            })}
          </ScrollView>
        </View>
      )}
      
      {uploadedVideos.length > 0 && (
        <View>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
            ✅ Uploaded Videos ({uploadedVideos.length})
          </Text>
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
                      backgroundColor: colors.gray300,
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      <Image
                        source={{ uri: videoUri }}
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                        }}
                        resizeMode="cover"
                        onError={(e) => {
                          console.log('Video thumbnail error:', e.nativeEvent.error);
                        }}
                      />
                      <View style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Icon name="play-circle-filled" size={40} color={colors.white} />
                      </View>
                    </View>
                  </TouchableOpacity>
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
              );
            })}
          </ScrollView>
        </View>
      )}
      
      {uploadedImages.length === 0 && uploadedVideos.length === 0 && 
       capturedImages.length === 0 && capturedVideos.length === 0 && (
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
              <View style={clsx(styles.ml3, styles.flex1)}>
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
                  // Use coordinates if available (more accurate)
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${formattedData.originalData.booking.addressId.lat},${formattedData.originalData.booking.addressId.long}`);
                } else if (formattedData.address) {
                  // Fallback to address search
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

        {/* Media Upload Sections - Only show if booking is ongoing */}
        {formattedData.status === 'ongoing' || isPartsApprovalInProgress() ? (
          <View style={clsx(styles.px4, styles.mt4)}>
            <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack, styles.mb4)}>
              Service Proof Upload
            </Text>
            
            {isPartsPending() ? (
              <View style={clsx(styles.p4, styles.bgWarningLight, styles.roundedLg, styles.mb6)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.textCenter)}>
                  ⚠️ Media upload is disabled until parts are approved
                </Text>
              </View>
            ) : (
              <Text style={clsx(styles.textBase, styles.textMuted, styles.mb6)}>
                Capture images/videos before and after service. All media will be uploaded together.
              </Text>
            )}
            
            <MediaSection
              title="Before Service"
              uploadedImages={beforeImages}
              uploadedVideos={beforeVideos}
              capturedImages={capturedBeforeImages}
              capturedVideos={capturedBeforeVideos}
              type="before"
            />
            
            <MediaSection
              title="After Service"
              uploadedImages={afterImages}
              uploadedVideos={afterVideos}
              capturedImages={capturedAfterImages}
              capturedVideos={capturedAfterVideos}
              type="after"
            />
            
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
        ) : null}

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
              disabled={checkingLocation}
            />
          </>
        ) : formattedData.status === 'ongoing' ? (
          <>
            {/* Add Parts Button - Only show if not already in parts approval */}
            {!isPartsApprovalInProgress() && (
              <ActionButton
                icon="build"
                label="Add Parts"
                color={colors.info}
                outlined={true}
                onPress={openPartsSelection}
              />
            )}
            
            <ActionButton
              icon="add-a-photo"
              label="Add Media"
              color={colors.info}
              outlined={isPartsApprovalInProgress()}
              onPress={() => openMediaModal('before-image')}
              disabled={isPartsPending()}
            />
            
            <ActionButton
              icon="check-circle"
              label="Complete"
              color={colors.success}
              onPress={openCompleteModal}
              disabled={isPartsPending()}
            />
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
            
            <ActionButton
              icon="add-a-photo"
              label="Add Media"
              color={colors.info}
              outlined={true}
              onPress={() => openMediaModal('before-image')}
              disabled={isPartsPending()}
            />
            
            <ActionButton
              icon="check-circle"
              label="Complete"
              color={colors.success}
              onPress={openCompleteModal}
              disabled={isPartsPending()}
            />
          </>
        ) : null}
      </View>

      {/* Service Modal (Location + Selfie + OTP) */}
      <ServiceModal />
    </View>
  );
};

export default BookingDetailScreen;