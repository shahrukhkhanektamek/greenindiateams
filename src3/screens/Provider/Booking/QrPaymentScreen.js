// screens/QRPaymentScreen.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Linking,
  Clipboard,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

const QRPaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { Toast, Urls, postData } = useContext(AppContext);
  
  const { 
    bookingData, 
    totalAmount,
    onPaymentSuccess 
  } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [pollingError, setPollingError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [isPaymentDone, setIsPaymentDone] = useState(false);
  
  const pollingIntervalRef = useRef(null);
  const backHandlerRef = useRef(null);

  const bookingId = bookingData?.bookingId;

  // 1. Initial setup and transaction creation
  useEffect(() => {
    if (!bookingId) {
      Toast.show({
        type: 'error',
        text1: 'Booking Not Found',
        text2: 'Booking ID is required',
      });
      navigation.goBack();
      return;
    }

    createTransaction();

    // Back button handler
    backHandlerRef.current = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => {
      if (backHandlerRef.current) {
        backHandlerRef.current.remove();
      }
      stopPolling();
    };
  }, []);

  // 2. Handle back press
  const handleBackPress = () => {
    if (polling && !isPaymentDone) {
      showExitConfirmation();
      return true;
    }
    return false;
  };

  const showExitConfirmation = () => {
    Alert.alert(
      'Payment in Progress',
      'Payment is being processed. Are you sure you want to go back?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit', 
          onPress: () => {
            stopPolling();
            navigation.goBack();
          }
        }
      ]
    );
  };

  // 3. Create transaction
  const createTransaction = async () => {
    try {
      setLoading(true);
      setPollingError(null);
      
      const data = {
        bookingId: bookingId,
        pId: bookingId,
        type: 'bookingComplete',
      };

      const response = await postData(data, Urls.createTransaction, 'POST');
      
      if (response?.success) {
        setTransaction(response);
        // console.log(transaction) 
        
        // Create proxy URL for QR image
        const proxyUrl = `${Urls.qrServe}?imageUrl=${encodeURIComponent(response.qrImage)}`;
        setQrImage(proxyUrl);
        
        // Start polling with transaction ID
        startPolling(response.transactionDetail._id, response.qrId);
      } else {
        throw new Error(response?.message || 'Failed to create transaction');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Transaction Failed',
        text2: error.message || 'Unable to create payment QR',
      });
      console.error('Create transaction error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 4. Polling function
  const startPolling = (transactionId, qrId) => {
    setPolling(true);
    setPollingError(null);
    
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Set new interval
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const data = {
          transactionTableId: transactionId,
          qrId: qrId,
          // qrId: 'qr_S6wTbVU885VMVP',
          type: 'bookingComplete'
        };
        const response = await postData(data, Urls.verifyTransaction, 'POST', {showErrorMessage:false});
        
        if (response?.success) {
          handlePaymentSuccess(response);
        }
      } catch (error) {
        console.error('Polling error:', error);
        setPollingError('Error checking payment status');
      }
    }, 3000);
  };

  // 5. Handle payment success
  const handlePaymentSuccess = (response) => {
    stopPolling();
    setPaymentStatus('success');
    setIsPaymentDone(true);
    
    // Update transaction with new data
    if (response.transactionDetail) {
      setTransaction(prev => ({
        ...prev,
        ...response.transactionDetail
      }));
    }

    // Call the success callback if provided
    if (onPaymentSuccess && typeof onPaymentSuccess === 'function') {
      onPaymentSuccess(response);
    }

    Toast.show({
      type: 'success',
      text1: 'Payment Successful!',
      text2: `₹${totalAmount?.toFixed(2) || '0'} has been received.`,
    });
  };

  // 6. Stop polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setPolling(false);
  };

  // 7. Copy QR link
  const copyQRLink = () => {
    if (!qrImage) return;
    
    Clipboard.setString(qrImage);
    Toast.show({
      type: 'success',
      text1: 'Copied!',
      text2: 'Payment link copied to clipboard',
    });
  };

  // 8. Open in browser
  const openInBrowser = () => {
    if (!qrImage) return;
    
    Linking.openURL(qrImage).catch(err => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not open payment link',
      });
    });
  };

  // 9. Retry polling
  const retryPolling = () => {
    if (transaction?._id) {
      setPollingError(null);
      startPolling(transaction._id);
    }
  };

  // 10. Handle cancel
  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: () => {
            stopPolling();
            navigation.goBack();
          }
        }
      ]
    );
  };

  // 11. Format date
  const formatDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.itemsCenter, styles.justifyCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textLg, styles.textPrimary, styles.mt4, styles.fontMedium)}>
          Generating QR Code...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Scan & Pay"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        showProfile={false}
        onBackPress={isPaymentDone ? () => navigation.goBack() : handleCancel}
      />

      <ScrollView  
        style={clsx(styles.flex1)}
        contentContainerStyle={clsx(styles.p6)}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking Info Card */}
        <View style={clsx(styles.mb6, styles.p4, styles.bgGrayLight, styles.roundedLg)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mb3)}>
            <Text style={clsx(styles.textBase, styles.textMuted)}>Booking ID</Text>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
              {bookingData?.booking?.bookingId || 'N/A'}
            </Text>
          </View>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mb3)}>
            <Text style={clsx(styles.textBase, styles.textMuted)}>Customer</Text>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
              {bookingData?.customerName || bookingData?.user?.name || 'Customer'}
            </Text>
          </View>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween)}>
            <Text style={clsx(styles.textBase, styles.textMuted)}>Date</Text>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
              {formatDate()}
            </Text>
          </View>
        </View>

        {/* Amount Display */}
        <View style={clsx(styles.mb6, styles.p6, styles.bgPrimaryLight, styles.roundedLg, styles.itemsCenter)}>
          <Text style={clsx(styles.textBase, styles.textWhite, styles.mb2)}>
            Total Amount to Pay
          </Text>
          <Text style={clsx(styles.text4xl, styles.fontBold, styles.textWhite)}>
            ₹{totalAmount?.toFixed(2) || '0.00'}
          </Text>
          {bookingData?.originalPaymentType === 'cod' && (
            <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
              COD Booking - Collecting Payment
            </Text>
          )}
        </View>

        {/* QR Code Section */}
        <View style={clsx(styles.mb6, styles.p6, styles.bgWhite, styles.roundedLg, styles.shadowMd, styles.itemsCenter)}>
          {/* QR Image Container */}
          <View style={clsx(styles.p4, styles.bgWhite, styles.roundedLg, styles.border, styles.borderGray, styles.mb6)}>
            {qrImage ? (
              <Image
                source={{ uri: qrImage }}
                style={clsx(styles.w64, styles.h80)}
                resizeMode="cover"
              />
            ) : (
              <View style={clsx(styles.w64, styles.h64, styles.itemsCenter, styles.justifyCenter)}>
                <Icon name="qr-code-2" size={48} color={colors.gray400} />
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
                  QR Code Not Available
                </Text>
              </View>
            )}
          </View>

          {/* Status Messages */}
          {polling && paymentStatus === 'pending' && (
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb4)}>
              <ActivityIndicator size="small" color={colors.primary} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.textPrimary, styles.fontMedium)}>
                Checking payment status...
              </Text>
            </View>
          )}

          {paymentStatus === 'success' && (
            <View style={clsx(styles.mb4, styles.p4, styles.bgSuccessLight, styles.roundedLg, styles.border, styles.borderSuccess)}>
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                <Icon name="check-circle" size={24} color={colors.success} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textSuccess)}>
                  Payment Successful!
                </Text>
              </View>
              <Text style={clsx(styles.textBase, styles.textSuccess)}>
                Payment of ₹{totalAmount?.toFixed(2) || '0'} has been received.
              </Text>
            </View>
          )}

          {pollingError && (
            <View style={clsx(styles.mb4, styles.p4, styles.bgErrorLight, styles.roundedLg, styles.border, styles.borderError)}>
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                <Icon name="error" size={20} color={colors.error} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textError)}>
                  Connection Error
                </Text>
              </View>
              <Text style={clsx(styles.textSm, styles.textError, styles.mb3)}>
                {pollingError}
              </Text>
              <TouchableOpacity
                style={clsx(styles.bgError, styles.rounded, styles.p3, styles.itemsCenter)}
                onPress={retryPolling}
              >
                <Text style={clsx(styles.textWhite, styles.fontBold)}>
                  Retry Checking
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </View>

        {/* Action Buttons */}
        <View style={clsx(styles.gap3, styles.mb6)}>

          {!isPaymentDone && (
            <TouchableOpacity
              style={clsx(
                styles.border,
                styles.borderGray,
                styles.roundedLg,
                styles.p4, 
                styles.itemsCenter
              )}
              onPress={handleCancel}
            >
              <Text style={clsx(styles.fontBold, styles.textBlack)}>
                Cancel Payment
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Transaction Details */}
        {transaction && (
          <View style={clsx(styles.mb6, styles.p4, styles.bgGrayLight, styles.roundedLg)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Transaction Details
            </Text>
            <View style={clsx(styles.gap2)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <Text style={clsx(styles.textBase, styles.textMuted)}>Transaction ID:</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {transaction?.transactionId || 'Pending'}
                </Text>
              </View>
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <Text style={clsx(styles.textBase, styles.textMuted)}>Order ID:</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {transaction?.razorpayOrderId || transaction?.orderId || 'N/A'}
                </Text>
              </View>
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <Text style={clsx(styles.textBase, styles.textMuted)}>Status:</Text>
                <View style={clsx(
                  styles.px3,
                  styles.py1,
                  styles.roundedFull,
                  paymentStatus === 'success' ? styles.bgSuccessLight : 
                  paymentStatus === 'failed' ? styles.bgErrorLight : 
                  styles.bgWarningLight
                )}>
                  <Text style={clsx(
                    styles.textXs,
                    styles.fontBold,
                    paymentStatus === 'success' ? styles.textSuccess : 
                    paymentStatus === 'failed' ? styles.textError : 
                    styles.textWarning
                  )}>
                    {paymentStatus.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Polling Info */}
        {polling && !isPaymentDone && (
          <View style={clsx(styles.p4, styles.bgInfoLight, styles.roundedLg, styles.border, styles.borderInfo)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
              <Icon name="info" size={20} color={colors.info} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo)}>
                Auto-checking enabled
              </Text>
            </View>
            <Text style={clsx(styles.textSm, styles.textInfo)}>
              Payment status is being checked automatically every 3 seconds.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}; 

export default QRPaymentScreen;