import React, { useState, useEffect, useContext, useRef } from 'react';
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
  TextInput,
  StyleSheet,
  PermissionsAndroid,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';
import Geolocation from '@react-native-community/geolocation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const StartServiceScreen = ({ navigation, route }) => {
  const { bookingData } = route.params || {};
  
  const { Toast, Urls, postData } = useContext(AppContext);

  // Step Management
  const [currentStep, setCurrentStep] = useState(1); // 1: Location, 2: Selfie, 3: OTP
  const [loading, setLoading] = useState(false);
  const [processStarted, setProcessStarted] = useState(false);
  const [automaticMode, setAutomaticMode] = useState(false);
  
  // Location States
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distanceToBooking, setDistanceToBooking] = useState(null);
  const [locationStatus, setLocationStatus] = useState('checking');
  const [locationError, setLocationError] = useState('');
  
  // Selfie States
  const [selectedSelfie, setSelectedSelfie] = useState(null);
  const [takingSelfie, setTakingSelfie] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [selfieTaken, setSelfieTaken] = useState(false);
  
  // OTP States
  const otpInputRefs = useRef([]);
  const [otpInputs, setOtpInputs] = useState(['', '', '', '']);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [autoSendingOTP, setAutoSendingOTP] = useState(false);
  const [autoVerifyingOTP, setAutoVerifyingOTP] = useState(false);
  
  // Camera
  const devices = useCameraDevices();
  const device = devices[1];
  const cameraRef = useRef(null);

  useEffect(() => {

    // Start automatic process when screen loads
    startAutomaticProcess();
    checkCameraPermission();
    // OTP refs initialize करें
    otpInputRefs.current = otpInputRefs.current.slice(0, 4);
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

  // Automatically move to next steps
  useEffect(() => {
    if (!processStarted || !automaticMode) return;

    const handleAutomaticFlow = async () => {
      try {
        switch (currentStep) {
          case 1: // Location step
            if (locationStatus === 'success') {
              // Auto move to step 2 after 1 second
              setTimeout(() => {
                setCurrentStep(2);
                setAutomaticMode(true);
              }, 1000);
            } else if (locationStatus === 'far' || locationStatus === 'error') {
              setAutomaticMode(false);
            }
            break;

          case 2: // Selfie step
            if (cameraPermission && !selfieTaken && !showCamera) {
              // Auto open camera after 0.5 seconds
              setTimeout(() => {
                takeSelfieAutomatically();
              }, 500);
            } else if (selfieTaken && !takingSelfie) {
              // Auto move to step 3 after selfie is taken
              setTimeout(() => {
                setCurrentStep(3);
                setAutomaticMode(true);
              }, 1000);
            }
            break;

          case 3: // OTP step
            if (!otpSent && !autoSendingOTP) {
              // Auto send OTP
              setTimeout(() => {
                sendOTPAutomatically();
              }, 500);
            } else if (otpSent && !autoVerifyingOTP) {
              // Wait for OTP input
              // OTP auto verification will be triggered when all digits are entered
            }
            break;
        }
      } catch (error) {
        console.error('Error in automatic flow:', error);
        setAutomaticMode(false);
      }
    };

    handleAutomaticFlow();
  }, [currentStep, locationStatus, cameraPermission, selfieTaken, otpSent, processStarted, automaticMode]);

  // Auto verify OTP when all digits are entered
  useEffect(() => {
    if (currentStep === 3 && otpSent && !autoVerifyingOTP) {
      const otpString = otpInputs.join('');
      if (otpString.length === 4) {
        // Auto verify OTP after 1 second
        setTimeout(() => {
          verifyOTPAutomatically();
        }, 1000);
      }
    }
  }, [otpInputs, currentStep, otpSent]);

  const startAutomaticProcess = () => {
    setProcessStarted(true);
    setAutomaticMode(true);
    verifyLocation();
  };

  const checkCameraPermission = async () => {
    setCameraPermission(true);
    return false;
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


  

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};


  // Location Functions
  const getCurrentLocation = async () => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    console.log('Location permission denied');
    return null;
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const locations = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        console.log('Location fetched:', locations);
        resolve(locations); // ✅ yahin se return hoga
      },
      error => {
        console.log('Location error:', error.code, error.message);
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 10000,
      }
    );
  });
};


  const verifyLocation = async () => {
    //  setLocationStatus('success');
    //  return true;
    try {
      setCheckingLocation(true);
      setLocationStatus('checking');
      setLocationError('');
      
      const booking = bookingData?.booking;
      const address = booking?.addressId;
      
      if (!address || !address.lat || !address.long) {
        setLocationStatus('error');
        setLocationError('Booking address coordinates not available');
        setAutomaticMode(false);
        return false;
      }
      
      const bookingLat = parseFloat(address.lat);
      const bookingLng = parseFloat(address.long);
      
      const location = await getCurrentLocation();
      console.log(location);
      setCurrentLocation(location);
      
      if (!location) {
        setLocationStatus('error');
        setLocationError('Could not get your current location');
        setAutomaticMode(false);
        return false;
      }

      const response = await postData(
        {
            "servicemanLat": location.latitude,
            "servicemanLng": location.longitude,
            "userLat": bookingLat,
            "userLng": bookingLng
        },
        `${Urls.getDistence}`,
        'POST'
      );
      
      if(response.success === true) {
        const distance = response.data.distance;
        const distanceCheck = response.data.distanceCheck;
        setDistanceToBooking(distance);
        
       

        if (distance <= distanceCheck) {
          setLocationStatus('success');
          Toast.show({
            type: 'success',
            text1: 'Location Verified',
            text2: 'Moving to selfie verification...',
          });
          return true;
        } else {
          setLocationStatus('far');
          setAutomaticMode(false);
          Toast.show({
            type: 'error',
            text1: 'Too Far',
            text2: `You need to be within ${distanceCheck*1000} meters`,
          });
          return false;
        }
      }

      setLocationStatus('error');
      setLocationError('Failed to verify distance');
      setAutomaticMode(false);
      return false;
      
    } catch (error) {
      console.error('Error verifying location:', error);
      setLocationStatus('error');
      setLocationError(error.message || 'Failed to get location');
      setAutomaticMode(false);
      return false;
    } finally {
      setCheckingLocation(false);
    }
  };

  const retryLocationCheck = async () => {
    setAutomaticMode(true);
    const isAtLocation = await verifyLocation();
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} meters`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  };

  const navigateToLocation = () => {
    const booking = bookingData?.booking;
    const address = booking?.addressId;
    
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
  };

  // Selfie Functions
  const takeSelfieAutomatically = async () => {
    try {
      setTakingSelfie(true);
      
      // // Check camera permission again
      // const permissionGranted = await checkCameraPermission();
      // if (!permissionGranted) {
      //   setTakingSelfie(false);
      //   setAutomaticMode(false);
      //   Alert.alert(
      //     'Camera Permission Required',
      //     'Camera permission is required to take selfie.',
      //     [
      //       {
      //         text: 'Open Settings',
      //         onPress: () => Linking.openSettings(),
      //       },
      //       {
      //         text: 'Cancel',
      //         style: 'cancel',
      //       },
      //     ]
      //   );
      //   return;
      // }
      
      // Check if front camera is available
      if (!device) {
        setTakingSelfie(true);
        setAutomaticMode(false);
        Alert.alert('Error', 'Front camera not available');
        return;
      }
      
      // Show camera
      setShowCamera(true);
      
    } catch (error) {
      console.error('Error opening camera:', error);
      setTakingSelfie(false);
      setAutomaticMode(false);
    }
  };

  const captureSelfie = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePhoto({
          qualityPrioritization: 'balanced',
          flash: 'off',
          enableShutterSound: false,
        });
        
        console.log('Photo captured:', photo);
        
        // Process photo
        const selfie = {
          uri: `file://${photo.path}`,
          type: 'image/jpeg',
          fileName: `selfie_${Date.now()}.jpg`,
          width: photo.width,
          height: photo.height,
          fileSize: photo.size,
        };
        
        setSelectedSelfie(selfie);
        setSelfieTaken(true);
        setShowCamera(false);
        setTakingSelfie(false);
        
        Toast.show({
          type: 'success',
          text1: 'Selfie Captured',
          text2: 'Moving to OTP verification...',
        });
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      setTakingSelfie(false);
      setAutomaticMode(false);
    }
  };

  const retakeSelfie = () => {
    setSelectedSelfie(null);
    setSelfieTaken(false);
    setShowCamera(true);
    setAutomaticMode(true);
  };

  // OTP Functions
  const sendOTPAutomatically = async () => {
    setOtpSent(true);
    setOtpTimer(120);
    return true;

    try {
      setAutoSendingOTP(true);
      setLoading(true);
      
      const response = await postData(
        { bookingId: bookingData?._id },
        `${Urls.resendOTP}`,
        'POST'
      );
      
      if (response?.success) {
        setOtpSent(true);
        setOtpTimer(120); // 2 minutes timer
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'OTP has been sent to customer',
        });
      } else {
        setOtpError(response?.message || 'Failed to send OTP');
        setAutoSendingOTP(false);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError('Failed to send OTP');
      setAutoSendingOTP(false);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPAutomatically = async () => {
    try {
      setAutoVerifyingOTP(true);
      setVerifyingOTP(true);
      const otpString = otpInputs.join('');
      
      if (otpString.length !== 4) {
        setOtpError('Please enter 4-digit OTP');
        setAutoVerifyingOTP(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('otp', otpString);
      formData.append('bookingId', bookingData?._id);
      
      if (selectedSelfie && selectedSelfie.uri) {
        formData.append('selfie', {
          uri: selectedSelfie.uri,
          type: selectedSelfie.type || 'image/jpeg',
          name: selectedSelfie.fileName || `selfie_${Date.now()}.jpg`,
        });
      }
      console.log('formData', formData)
      console.log(`${Urls.verifyOtpAndStart}/${bookingData?._id}`)
 
 

      // return;
      // return;
      const response = await postData(
        formData,
        `${Urls.verifyOtpAndStart}/${bookingData?._id}`,
        'POST',
        {
          isFileUpload: true,
        }
      );
      
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Service Started',
          text2: 'Service has been started successfully.',
        });

        clearOtpInputs(); // OTP inputs clear करें
        
        // Navigate back and refresh
        setTimeout(() => {
          navigation.goBack();
          if (route.params?.loadBookingDetails) {
            route.params.loadBookingDetails();
          }
        }, 1500);
        
      } else {
        setOtpError(response?.message || 'Invalid OTP');
        setAutoVerifyingOTP(false);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('Failed to verify OTP');
      setAutoVerifyingOTP(false);
    } finally {
      setVerifyingOTP(false);
    }
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otpInputs];
    
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    // If text is being deleted
    if (text === '' && index > 0) {
      newOtp[index] = '';
      setOtpInputs(newOtp);
      
      // Move focus to previous input
      if (otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1].focus();
      }
      return;
    }
    
    // If text is being entered
    if (numericText) {
      newOtp[index] = numericText;
      setOtpInputs(newOtp);
      
      // Move focus to next input if available
      if (index < 3 && otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1].focus();
      }
    }
    
    setOtpError('');
  };
  
  const handleOtpKeyPress = (event, index) => {
    // Handle backspace key
    if (event.nativeEvent.key === 'Backspace') {
      if (otpInputs[index] === '' && index > 0) {
        // Move focus to previous input
        if (otpInputRefs.current[index - 1]) {
          otpInputRefs.current[index - 1].focus();
        }
      }
    }
  };

  // OTP verify करने के बाद inputs clear करें
  const clearOtpInputs = () => {
    setOtpInputs(['', '', '', '']);
    // Focus को first input पर वापस ले जाएं
    if (otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  };

  const manualSendOTP = async () => {
    setAutomaticMode(true);
    clearOtpInputs();
    await sendOTPAutomatically();
  };

  const manualVerifyOTP = async () => {
    setAutomaticMode(true);
    await verifyOTPAutomatically();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step Navigation
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setAutomaticMode(true);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setAutomaticMode(true);
    } else {
      navigation.goBack();
    }
  };

  // Camera View
  const renderCameraView = () => (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }]}>
      {device && cameraPermission && (
        <>
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={showCamera}
            photo={true}
            enableZoomGesture={false}
          />
          
          {/* Camera Overlay */}
          <SafeAreaView style={styless.cameraContainer}>
            {/* Header */}
            <View style={styless.cameraHeader}>
              <TouchableOpacity
                style={styless.closeButton}
                onPress={() => {
                  setShowCamera(false);
                  setTakingSelfie(false);
                  setAutomaticMode(false);
                }}
              >
                <Icon name="close" size={30} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Instructions */}
            <View style={styless.cameraInstructions}>
              <Text style={styless.instructionText}>Position your face in the circle</Text>
              <Text style={styless.instructionSubText}>Look straight at the camera</Text>
            </View>
            
            {/* Face Guide */}
            <View style={styless.faceGuideContainer}>
              <View style={styless.faceGuide} />
            </View>
            
            {/* Footer with Capture Button */}
            <View style={styless.cameraFooter}>
              <TouchableOpacity
                style={styless.captureButton}
                onPress={captureSelfie}
                // disabled={takingSelfie}
              >
                <View style={styless.captureButtonInner}>
                  {/* {takingSelfie ? ( */}
                    {/* <ActivityIndicator size="small" color="white" /> */}
                  {/* ) : ( */}
                    <View style={styless.captureCircle} />
                  {/* )} */}
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </>
      )}
    </View>
  );

  // Render Step 1: Location Verification
  const renderLocationStep = () => (
    <View style={clsx(styles.p4)}>
      <View style={clsx(styles.itemsCenter, styles.mb8)}>
        <View style={[
          clsx(styles.roundedFull, styles.p4, styles.mb4),
          locationStatus === 'success' ? { backgroundColor: `${colors.success}20` } :
          locationStatus === 'far' ? { backgroundColor: `${colors.warning}20` } :
          locationStatus === 'error' ? { backgroundColor: `${colors.error}20` } :
          { backgroundColor: `${colors.primary}20` }
        ]}>
          <Icon 
            name={
              locationStatus === 'success' ? 'check-circle' :
              locationStatus === 'far' ? 'location-off' :
              locationStatus === 'error' ? 'error' :
              'my-location'
            } 
            size={50} 
            color={
              locationStatus === 'success' ? colors.success :
              locationStatus === 'far' ? colors.warning :
              locationStatus === 'error' ? colors.error :
              colors.primary
            } 
          />
        </View>
        
        <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack, styles.textCenter, styles.mb2)}>
          {locationStatus === 'success' ? 'Location Verified!' :
           locationStatus === 'far' ? 'Too Far From Location' :
           locationStatus === 'error' ? 'Location Error' :
           'Verifying Your Location...'}
        </Text>
        
        <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter)}>
          {locationStatus === 'success' ? 'You are at the service location ✅' :
           locationStatus === 'far' ? 'You need to be at the service location to start' :
           locationStatus === 'error' ? 'Could not verify your location' :
           'Checking your current location...'}
        </Text>
      </View>

      {/* Location Details */}
      {currentLocation && distanceToBooking !== null && bookingData?.booking?.addressId && (
        <View style={clsx(styles.mb8)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb3)}>
            <Text style={clsx(styles.textBase, styles.textMuted)}>Your Location:</Text>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb3)}>
            <Text style={clsx(styles.textBase, styles.textMuted)}>Service Location:</Text>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
              {parseFloat(bookingData.booking.addressId.lat).toFixed(6)}, 
              {parseFloat(bookingData.booking.addressId.long).toFixed(6)}
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb6)}>
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
          <View style={clsx(styles.mb8)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
              <Text style={clsx(styles.textSm, styles.textMuted)}>Allowed: 500 meters</Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>Current: {formatDistance(distanceToBooking)}</Text>
            </View>
            <View style={clsx(styles.bgGray200, styles.roundedFull, styles.overflowHidden, { height: 10 })}>
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
        <View style={clsx(styles.bgErrorLight, styles.p4, styles.roundedLg, styles.mb8)}>
          <Text style={clsx(styles.textSm, styles.textError, styles.textCenter)}>
            {locationError}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={clsx(styles.flexRow, styles.gap4, styles.mt2)}>
        {locationStatus === 'far' && (
          <>
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.border2,
                styles.borderPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter
              )}
              onPress={() => {
                setAutomaticMode(false);
                goToPreviousStep();
              }}
            >
              <Text style={clsx(styles.textPrimary, styles.fontBold, styles.textLg)}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.bgPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter
              )}
              onPress={() => {
                setAutomaticMode(false);
                navigateToLocation();
              }}
            >
              <Icon name="directions" size={24} color={colors.white} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
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
                styles.border2,
                styles.borderPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter
              )}
              onPress={() => {
                setAutomaticMode(false);
                goToPreviousStep();
              }}
            >
              <Text style={clsx(styles.textPrimary, styles.fontBold, styles.textLg)}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.bgPrimary,
                styles.roundedLg,
                styles.p4,
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
                  <Icon name="refresh" size={24} color={colors.white} style={clsx(styles.mr2)} />
                  <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                    Retry
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
        
        {locationStatus === 'success' && automaticMode && (
          <View style={clsx(styles.flex1, styles.itemsCenter, styles.justifyCenter)}>
            <ActivityIndicator size="large" color={colors.success} />
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mt4)}>
              Moving to selfie verification...
            </Text>
          </View>
        )}
        
        {(locationStatus === 'checking' || checkingLocation) && (
          <View style={clsx(styles.flex1, styles.itemsCenter, styles.justifyCenter)}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mt4)}>
              Checking location...
            </Text>
          </View>
        )}
      </View>
      
      <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter, styles.mt8)}>
        Note: You must be within 500 meters of the service location to start
      </Text>
    </View>
  );

  // Render Step 2: Selfie Capture
  const renderSelfieStep = () => (
    <View style={clsx(styles.p4)}>
      <View style={clsx(styles.itemsCenter, styles.mb8)}>
        <View style={[
          clsx(styles.roundedFull, styles.p4, styles.mb4),
          { backgroundColor: `${colors.primary}20` }
        ]}>
          <Icon name="camera-alt" size={50} color={selfieTaken ? colors.success : colors.primary} />
        </View>
        
        <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack, styles.textCenter, styles.mb2)}>
          {selfieTaken ? 'Selfie Verified!' : 'Take Selfie Verification'}
        </Text>
        
        <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter)}>
          {selfieTaken 
            ? 'Selfie captured successfully ✅' 
            : automaticMode 
              ? 'Opening camera automatically...' 
              : 'Please take a selfie to verify your identity'}
        </Text>
      </View>

      {/* Selfie Preview */}
      <View style={clsx(styles.mb8, styles.itemsCenter)}>
        <View style={[clsx(styles.roundedLg, styles.overflowHidden, styles.mb4), 
          { width: SCREEN_WIDTH * 0.7, height: SCREEN_WIDTH * 0.7 }]}
        >
          {selectedSelfie ? (
            <Image
              source={{ uri: selectedSelfie.uri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={[clsx(styles.flex1, styles.bgGray200, styles.itemsCenter, styles.justifyCenter)]}>
              {automaticMode && !showCamera ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <>
                  <Icon name="camera-alt" size={80} color={colors.gray400} />
                  <Text style={clsx(styles.textBase, styles.textMuted, styles.mt4)}>
                    No selfie taken yet
                  </Text>
                </>
              )}
            </View>
          )}
        </View>
        
        {selectedSelfie ? (
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textSuccess)}>
            ✅ Selfie captured successfully
          </Text>
        ) : automaticMode && !showCamera ? (
          <Text style={clsx(styles.textBase, styles.textMuted)}>
            Preparing camera...
          </Text>
        ) : (
          <Text style={clsx(styles.textBase, styles.textMuted)}>
            Tap the button below to take selfie
          </Text>
        )}
      </View>

      {/* Selfie Actions */}
      <View style={clsx(styles.flexRow, styles.gap4, styles.mb8)}>
        {!automaticMode && (
          <TouchableOpacity
            style={clsx(
              styles.flex1,
              styles.border2,
              styles.borderPrimary,
              styles.roundedLg,
              styles.p4,
              styles.itemsCenter,
              styles.justifyCenter
            )}
            onPress={goToPreviousStep}
          >
            <Icon name="arrow-back" size={24} color={colors.primary} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textPrimary, styles.fontBold, styles.textLg)}>
              Back
            </Text>
          </TouchableOpacity>
        )}
        
        {selectedSelfie ? (
          <>
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.border2,
                styles.borderPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter
              )}
              onPress={retakeSelfie}
              disabled={takingSelfie}
            >
              <Icon name="refresh" size={24} color={colors.primary} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textPrimary, styles.fontBold, styles.textLg)}>
                Retake
              </Text>
            </TouchableOpacity>
            
            {!automaticMode && (
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.bgPrimary,
                  styles.roundedLg,
                  styles.p4,
                  styles.itemsCenter,
                  styles.justifyCenter
                )}
                onPress={() => {
                  setAutomaticMode(true);
                  goToNextStep();
                }}
              >
                <Icon name="check-circle" size={24} color={colors.white} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                  Continue
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : !automaticMode && (
          <TouchableOpacity
            style={clsx(
              styles.flex1,
              styles.bgPrimary,
              styles.roundedLg,
              styles.p4,
              styles.itemsCenter,
              styles.justifyCenter
            )}
            onPress={() => {
              setAutomaticMode(true);
              takeSelfieAutomatically();
            }}
            disabled={takingSelfie}
          >
            {takingSelfie ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="camera-alt" size={24} color={colors.white} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                  {cameraPermission ? 'Take Selfie' : 'Permission Needed'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {automaticMode && !selectedSelfie && !showCamera && (
        <View style={clsx(styles.itemsCenter, styles.mt4)}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
            Auto-capturing selfie...
          </Text>
        </View>
      )}

      {!cameraPermission && !automaticMode && (
        <Text style={clsx(styles.textSm, styles.textError, styles.textCenter, styles.mt4)}>
          Camera permission is required to take selfie.
        </Text>
      )}
    </View>
  );

  // Render Step 3: OTP Verification
  const renderOTPStep = () => (
    <View style={clsx(styles.p4)}>
      <View style={clsx(styles.itemsCenter, styles.mb8)}>
        <View style={[
          clsx(styles.roundedFull, styles.p4, styles.mb4),
          { backgroundColor: `${colors.info}20` }
        ]}>
          <Icon name="lock" size={50} color={colors.info} />
        </View>
        
        <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack, styles.textCenter, styles.mb2)}>
          {autoVerifyingOTP ? 'Verifying OTP...' : 'Enter OTP'}
        </Text>
        
        <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter)}>
          {!otpSent && automaticMode 
            ? 'Sending OTP to customer...' 
            : otpSent 
              ? 'Enter the OTP sent to the customer' 
              : 'Please send OTP to customer'}
        </Text>
      </View>

      {/* Selected Selfie Preview */}
      {selectedSelfie && (
        <View style={clsx(styles.mb8, styles.itemsCenter)}>
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

      {/* OTP Status */}
      {!otpSent && automaticMode && (
        <View style={clsx(styles.itemsCenter, styles.mb6)}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2)}>
            Sending OTP to customer...
          </Text>
        </View>
      )}

      {/* OTP Input Fields */}
      {otpSent && (
        <View style={clsx(styles.mb8)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb4, styles.textCenter)}>
            Enter 4-digit OTP
          </Text>
          
          <View style={clsx(styles.flexRow, styles.justifyCenter, styles.gap4, styles.mb6)}>
            {[0, 1, 2, 3].map((index) => (
              <View key={index} style={[
                clsx(styles.border2, styles.borderPrimary, styles.roundedLg),
                { 
                  width: 60, 
                  height: 60,
                  backgroundColor: otpInputs[index] ? colors.primaryLight : colors.white,
                  borderColor: otpInputs[index] ? colors.primary : colors.primary
                }
              ]}>
                <TextInput
                  ref={ref => otpInputRefs.current[index] = ref}
                  style={[
                    clsx(styles.text2xl, styles.fontBold, styles.textCenter),
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
                  onKeyPress={(event) => handleOtpKeyPress(event, index)}
                  autoFocus={index === 0 && !autoVerifyingOTP}
                  editable={!verifyingOTP && !autoVerifyingOTP}
                  selectTextOnFocus={true}
                />
              </View>
            ))}
          </View>
          
          {/* OTP Timer */}
          {otpTimer > 0 && (
            <View style={clsx(styles.itemsCenter, styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.textMuted)}>
                Resend OTP in {formatTime(otpTimer)}
              </Text>
            </View>
          )}
          
          {/* Auto Verification Status */}
          {autoVerifyingOTP && (
            <View style={clsx(styles.itemsCenter, styles.mb4)}>
              <ActivityIndicator size="small" color={colors.success} />
              <Text style={clsx(styles.textSm, styles.textSuccess, styles.mt2)}>
                Verifying OTP automatically...
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Manual Actions */}
      {!automaticMode && (
        <View style={clsx(styles.mb6)}>
          {!otpSent ? (
            <TouchableOpacity
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.px6,
                styles.py3,
                styles.bgPrimary,
                styles.roundedFull
              )}
              onPress={manualSendOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Icon name="send" size={20} color={colors.white} style={clsx(styles.mr2)} />
                  <Text style={clsx(styles.textWhite, styles.fontBold)}>
                    Send OTP to Customer
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : otpTimer === 0 && (
            <TouchableOpacity
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.px6,
                styles.py3,
                styles.bgPrimaryLight,
                styles.roundedFull
              )}
              onPress={manualSendOTP}
              disabled={loading}
            >
              <Icon name="refresh" size={20} color={colors.primary} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* OTP Error */}
      {otpError && (
        <View style={clsx(styles.bgErrorLight, styles.p3, styles.roundedLg, styles.mb6)}>
          <Text style={clsx(styles.textSm, styles.textError, styles.textCenter)}>
            {otpError}
          </Text>
        </View>
      )}

      {/* Manual Verify Button */}
      {!automaticMode && otpSent && otpInputs.every(digit => digit) && (
        <View style={clsx(styles.mb8)}>
          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.p4,
              styles.roundedLg,
              styles.bgSuccess,
              verifyingOTP && styles.opacity50
            )}
            onPress={manualVerifyOTP}
            disabled={verifyingOTP}
          >
            {verifyingOTP ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="check-circle" size={24} color={colors.white} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                  Verify & Start Service
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Navigation Buttons */}
      {!automaticMode && (
        <View style={clsx(styles.flexRow, styles.gap4)}>
          <TouchableOpacity
            style={clsx(
              styles.flex1,
              styles.border2,
              styles.borderPrimary,
              styles.roundedLg,
              styles.p4,
              styles.itemsCenter,
              styles.justifyCenter
            )}
            onPress={goToPreviousStep}
            disabled={verifyingOTP}
          >
            <Icon name="arrow-back" size={24} color={colors.primary} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textPrimary, styles.fontBold, styles.textLg)}>
              Back
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={clsx(
              styles.flex1,
              styles.border2,
              styles.borderError,
              styles.roundedLg,
              styles.p4,
              styles.itemsCenter,
              styles.justifyCenter
            )}
            onPress={() => {
              setAutomaticMode(false);
              navigation.goBack();
            }}
            disabled={verifyingOTP}
          >
            <Icon name="cancel" size={24} color={colors.error} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textError, styles.fontBold, styles.textLg)}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Step Indicator
  const renderStepIndicator = () => (
    <View style={clsx(styles.px4, styles.py3, styles.bgGray50)}>
      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
        {[1, 2, 3].map((step, index) => (
          <React.Fragment key={step}>
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <View style={[
                clsx(styles.roundedFull, styles.itemsCenter, styles.justifyCenter),
                { 
                  width: 40, 
                  height: 40,
                  backgroundColor: currentStep === step 
                    ? (step === 1 && locationStatus === 'success') 
                      ? colors.success 
                      : (step === 2 && selfieTaken) 
                        ? colors.success 
                        : colors.primary
                    : currentStep > step 
                      ? colors.success 
                      : colors.gray300
                }
              ]}>
                {currentStep > step ? (
                  <Icon name="check" size={20} color={colors.white} />
                ) : (
                  <Text style={[
                    clsx(styles.textBase, styles.fontBold),
                    { color: colors.white }
                  ]}>
                    {step}
                  </Text>
                )}
              </View>
              <Text style={[
                clsx(styles.textSm, styles.ml2, styles.fontMedium),
                { 
                  color: currentStep === step 
                    ? colors.primary 
                    : currentStep > step 
                      ? colors.success 
                      : colors.gray500
                }
              ]}>
                {step === 1 ? 'Location' : 
                 step === 2 ? 'Selfie' : 'OTP'}
              </Text>
            </View>
            
            {index < 2 && (
              <View style={[
                clsx(styles.flex1, styles.h1, styles.mx2),
                { 
                  backgroundColor: currentStep > step ? colors.success : colors.gray300
                }
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  // Main Render
  return (
    <SafeAreaView style={clsx(styles.flex1, styles.bgSurface)}>
      {/* Camera Overlay */}
      {showCamera && renderCameraView()}
      
      {/* Main Content */}
      {!showCamera && (
        <>
          {/* Header */}
          <View style={clsx(styles.bgPrimary, styles.px4, styles.py4)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <TouchableOpacity 
                onPress={goToPreviousStep}
                style={clsx(styles.mr3)}
                disabled={verifyingOTP}
              >
                <Icon name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold)}>
                  Start Service {automaticMode && '(Auto)'}
                </Text>
                <Text style={clsx(styles.textWhite, styles.textSm, styles.opacity75)}>
                  Complete verification to start service
                </Text>
              </View>
            </View>
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
          <ScrollView 
            style={clsx(styles.flex1)}
            showsVerticalScrollIndicator={false}
          >
            {currentStep === 1 && renderLocationStep()}
            {currentStep === 2 && renderSelfieStep()}
            {currentStep === 3 && renderOTPStep()}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

// Styles for Camera View
const styless = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    padding: 16,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraInstructions: {
    alignItems: 'center',
    marginTop: 40,
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  instructionSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  faceGuideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
  },
  cameraFooter: {
    padding: 40,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
});

export default StartServiceScreen;