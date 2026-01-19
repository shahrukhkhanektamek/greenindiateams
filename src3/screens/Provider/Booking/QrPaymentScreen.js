// screens/QRPaymentScreen.js
import React, { useState, useEffect, useContext } from 'react';
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
  const { Toast, Urls, postData, user } = useContext(AppContext);
  
  const { 
    bookingData, 
    totalAmount,
    onPaymentSuccess 
  } = route.params || {};

  console.log('QRPaymentScreen bookingData:', bookingData);
  
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [pollingError, setPollingError] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const bookingId = bookingData?.bookingId;

  // 1. Screen खुलते ही Transaction Create API Call
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
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => {
      backHandler.remove();
      stopPolling();
    };
  }, [bookingId]);

  const handleBackPress = () => {
    if (polling && !paymentCompleted) {
      Alert.alert(
        'Payment in Progress',
        'Payment is being processed. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Yes', 
            onPress: () => {
              stopPolling();
              navigation.goBack();
            }
          }
        ]
      );
      return true;
    }
    return false;
  };

  // 2. Transaction Create Function - CompleteBooking से आया हुआ amount use करें
  const createTransaction = async () => {
    try {
      setLoading(true);
      setPollingError(null);
      
      // Use amount from CompleteBookingScreen or calculate from bookingData
      const payableAmount = totalAmount;
      
      
      const data = {
        bookingId: bookingId,
        type: 'bookingComplete',
        // amount: payableAmount // CompleteBookingScreen से आया हुआ amount
      };
      
      console.log('Creating transaction for amount:', data);
      const response = await postData(
        data,
        Urls.createTransaction,
        'POST'
      );

      console.log('Transaction response:', response);

      if (response?.success) {
        setTransaction(response.transactionDetail);
        setQrImage(response.qrImage);
        
        // Start polling for payment status
        startPolling(response.transactionDetail.id);
        
        Toast.show({
          type: 'success',
          text1: 'QR Generated',
          text2: 'Scan QR to complete payment',
        });
      } else {
        throw new Error(response?.message || 'Failed to create QR transaction');
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

  // 3. Polling Function - हर 3 सेकंड में
  const startPolling = (transactionId) => {
    return true;
    setPolling(true);
    setPollingError(null);
    
    const interval = setInterval(async () => {
      try {
        const data = {
          transactionTableId:transactionId
        };
        
        const response = await postData(
          data,
          Urls.verifyTransaction,
          'POST'
        );

        console.log('Polling response:', response);

        if (response?.success) {
          if (response.paymentStatus === 'success' || response.transaction?.status === 'success') {
            handlePaymentSuccess(response);
          } else if (response.paymentStatus === 'failed' || response.transaction?.status === 'failed') {
            setPaymentStatus('failed');
            stopPolling();
            
            Toast.show({
              type: 'error',
              text1: 'Payment Failed',
              text2: 'Please try again or use another payment method.',
            });
          }
          // If pending, continue polling
        } else {
          setPollingError(response?.message || 'Polling failed');
        }
      } catch (error) {
        console.error('Polling error:', error);
        setPollingError('Error checking payment status');
      }
    }, 3000); // 3 seconds

    setPollingInterval(interval);
  };

  const handlePaymentSuccess = (response) => {
    setPaymentStatus('success');
    setPaymentCompleted(true);
    stopPolling();
    
    const paymentData = {
      success: true,
      amount: totalAmount,
      paymentId: response.transaction?.transactionId || response.paymentId,
      orderId: transaction?.razorpayOrderId || response.orderId,
      transactionId: response.transaction?._id
    };
    
    Toast.show({
      type: 'success',
      text1: 'Payment Successful!',
      text2: 'Your payment has been confirmed.',
    });
    
    // Call onPaymentSuccess callback if provided from CompleteBookingScreen
    if (onPaymentSuccess && typeof onPaymentSuccess === 'function') {
      onPaymentSuccess(paymentData);
    }
    
    // Auto navigate back after 2 seconds
    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setPolling(false);
  };

  // 4. Copy QR Link
  const copyQRLink = () => {
    if (!qrImage) return;
    
    Clipboard.setString(qrImage);
    Toast.show({
      type: 'success',
      text1: 'Copied!',
      text2: 'Payment link copied to clipboard',
    });
  };

  // 5. Open in Browser
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

  // 6. Retry polling
  const retryPolling = () => {
    if (transaction?._id) {
      setPollingError(null);
      startPolling(transaction._id);
    }
  };

  // 7. Handle cancel payment
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

  // 8. Manual Payment Verify Button
  const handleManualVerify = async () => {
    return false;
    try {
      if (!transaction?._id) {
        Toast.show({
          type: 'error',
          text1: 'No Transaction',
          text2: 'Transaction not found',
        });
        return;
      }
      
      const data = {
        transactionId: transaction._id
      };
      
      const response = await postData(
        data,
        Urls.verifyTransaction,
        'POST'
      );

      if (response?.success) {
        if (response.paymentStatus === 'success') {
          handlePaymentSuccess(response);
        } else {
          Toast.show({
            type: 'info',
            text1: 'Payment Pending',
            text2: 'Payment not yet received',
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: response?.message || 'Unable to verify payment',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to verify payment',
      });
    }
  };

  if (loading) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.itemsCenter, styles.justifyCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textLg, styles.textPrimary, styles.mt4, styles.fontMedium)}>
          Creating QR Code...
        </Text>
      </View>
    );
  }

  // Calculate display amount
  const displayAmount = totalAmount || 0;

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Scan & Pay"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        showProfile={false}
        onBackPress={() => {
          if (paymentCompleted) {
            navigation.goBack();
          } else {
            handleCancel();
          }
        }}
      />

      <ScrollView  
        style={clsx(styles.flex1)}
        contentContainerStyle={clsx(styles.p6)}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking Info */}
        <View style={clsx(styles.mb6, styles.p4, styles.bgGrayLight, styles.roundedLg)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mb2)}>
            <Text style={clsx(styles.textBase, styles.textMuted)}>
              Booking ID
            </Text>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
              {bookingData?.bookingNumber || bookingData?.bookingId || 'N/A'}
            </Text>
          </View>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mb2)}>
            <Text style={clsx(styles.textBase, styles.textMuted)}>
              Customer
            </Text>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
              {bookingData?.customerName || bookingData?.user?.name || 'Customer'}
            </Text>
          </View>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween)}>
            <Text style={clsx(styles.textBase, styles.textMuted)}>
              Date
            </Text>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Amount Display */}
        <View style={clsx(styles.mb6, styles.p6, styles.bgPrimaryLight, styles.roundedLg, styles.itemsCenter)}>
          <Text style={clsx(styles.textBase, styles.textMuted, styles.mb2)}>
            Total Amount to Pay
          </Text>
          <Text style={clsx(styles.text4xl, styles.fontBold, styles.textPrimary)}>
            ₹{displayAmount.toFixed(2)}
          </Text>
          {bookingData?.originalPaymentType === 'cod' && (
            <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
              COD Booking - Collecting Payment
            </Text>
          )}
        </View>

        {/* QR Code Container */}
        <View style={clsx(styles.mb6, styles.p6, styles.bgWhite, styles.roundedLg, styles.shadowMd, styles.itemsCenter)}>
          {/* QR Code */}
          <View style={clsx(styles.p4, styles.bgWhite, styles.roundedLg, styles.border, styles.borderGray, styles.mb4)}>
            {qrImage ? (
              <Image
                source={{ uri: qrImage }}
                style={clsx(styles.w64, styles.h64)}
                resizeMode="contain"
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
          
          {/* Payment Status Indicator */}
          {paymentStatus === 'pending' && polling && (
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
                Payment of ₹{displayAmount.toFixed(2)} has been received.
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                Redirecting back to booking...
              </Text>
            </View>
          )}

          {paymentStatus === 'failed' && (
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb4, styles.p3, styles.bgErrorLight, styles.roundedFull)}>
              <Icon name="error" size={20} color={colors.error} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textError)}>
                Payment Failed
              </Text>
            </View>
          )}

          {/* Polling Error */}
          {pollingError && (
            <View style={clsx(styles.mb4, styles.p4, styles.bgErrorLight, styles.roundedLg, styles.border, styles.borderError)}>
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                <Icon name="error" size={20} color={colors.error} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textError)}>
                  Polling Error
                </Text>
              </View>
              <Text style={clsx(styles.textSm, styles.textError, styles.mb3)}>
                {pollingError}
              </Text>
              <TouchableOpacity
                style={clsx(styles.bgError, styles.rounded, styles.p3, styles.itemsCenter, styles.mb2)}
                onPress={retryPolling}
              >
                <Text style={clsx(styles.textWhite, styles.fontBold)}>
                  Retry Checking
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Manual Verify Button */}
          {!paymentCompleted && (
            <TouchableOpacity
              style={clsx(
                styles.bgInfo,
                styles.roundedLg,
                styles.p3,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.mb4
              )}
              onPress={handleManualVerify}
            >
              <Text style={clsx(styles.textWhite, styles.fontBold)}>
                <Icon name="refresh" size={16} color={colors.white} /> Check Payment Status
              </Text>
            </TouchableOpacity>
          )}

          {/* Instructions */}
          <View style={clsx(styles.mt4, styles.selfStart)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              How to Pay:
            </Text>
            <View style={clsx(styles.ml2)}>
              <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb2)}>
                <Text style={clsx(styles.textBase, styles.textPrimary, styles.mr2)}>1.</Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  Open any UPI app (GPay, PhonePe, Paytm, etc.)
                </Text>
              </View>
              <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb2)}>
                <Text style={clsx(styles.textBase, styles.textPrimary, styles.mr2)}>2.</Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  Scan the QR code above
                </Text>
              </View>
              <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb2)}>
                <Text style={clsx(styles.textBase, styles.textPrimary, styles.mr2)}>3.</Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  Confirm payment of ₹{displayAmount.toFixed(2)} in your UPI app
                </Text>
              </View>
              <View style={clsx(styles.flexRow, styles.itemsStart)}>
                <Text style={clsx(styles.textBase, styles.textPrimary, styles.mr2)}>4.</Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  Payment will be confirmed automatically
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={clsx(styles.gap3)}>
          {/* Copy Link Button */}
          <TouchableOpacity
            style={clsx(
              styles.bgPrimary,
              styles.roundedLg,
              styles.p4,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.flexRow,
              (!qrImage || paymentCompleted) && styles.opacity50
            )}
            onPress={copyQRLink}
            disabled={!qrImage || paymentCompleted}
          >
            <Icon name="content-copy" size={20} color={colors.white} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
              Copy Payment Link
            </Text>
          </TouchableOpacity>

          {/* Open in Browser Button */}
          <TouchableOpacity
            style={clsx(
              styles.bgSecondary,
              styles.roundedLg,
              styles.p4,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.flexRow,
              (!qrImage || paymentCompleted) && styles.opacity50
            )}
            onPress={openInBrowser}
            disabled={!qrImage || paymentCompleted}
          >
            <Icon name="open-in-browser" size={20} color={colors.white} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
              Open in Browser
            </Text>
          </TouchableOpacity>

          {/* Stop Polling Button (if polling and not completed) */}
          {polling && !paymentCompleted && (
            <TouchableOpacity
              style={clsx(
                styles.bgError,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.flexRow
              )}
              onPress={stopPolling}
            >
              <Icon name="stop" size={20} color={colors.white} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                Stop Checking
              </Text>
            </TouchableOpacity>
          )}

          {/* Back Button - shows different text based on payment status */}
          <TouchableOpacity
            style={clsx(
              styles.border,
              paymentCompleted ? styles.borderSuccess : styles.borderGray,
              styles.roundedLg,
              styles.p4,
              styles.itemsCenter,
              styles.justifyCenter
            )}
            onPress={() => navigation.goBack()}
          >
            <Text style={clsx(
              styles.fontBold,
              styles.textLg,
              paymentCompleted ? styles.textSuccess : styles.textBlack
            )}>
              {paymentCompleted ? 'Payment Done ✓ Go Back' : 'Cancel Payment'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction Details */}
        {transaction && (
          <View style={clsx(styles.mt6, styles.p4, styles.bgGrayLight, styles.roundedLg)}>
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
                <Text style={clsx(styles.textBase, styles.textMuted)}>QR ID:</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {transaction?.qrId || 'N/A'}
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

        {/* Polling Status Info */}
        {polling && !paymentCompleted && (
          <View style={clsx(styles.mt4, styles.p4, styles.bgInfoLight, styles.roundedLg, styles.border, styles.borderInfo)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
              <Icon name="info" size={20} color={colors.info} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo)}>
                Auto-checking enabled
              </Text>
            </View>
            <Text style={clsx(styles.textSm, styles.textInfo)}>
              We're checking payment status every 3 seconds. You'll be notified automatically when payment is confirmed.
            </Text>
          </View>
        )}

        {/* Payment Completed Info */}
        {paymentCompleted && (
          <View style={clsx(styles.mt4, styles.p4, styles.bgSuccessLight, styles.roundedLg, styles.border, styles.borderSuccess)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
              <Icon name="check-circle" size={24} color={colors.success} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
                Payment Received Successfully
              </Text>
            </View>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              You can now go back to complete the booking. The payment details have been recorded.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default QRPaymentScreen;