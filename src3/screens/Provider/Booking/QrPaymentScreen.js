import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';

const QrPaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    bookingData,
    totalAmount,
    onPaymentSuccess
  } = route.params || {};

  const { Toast, Urls, postData } = useContext(AppContext);
  
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(''); // 'qr', 'upi', 'card'

  useEffect(() => {
    // Initialize payment options when screen loads
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setPaymentInProgress(true);
      
      // Step 1: Create order on your backend
      const amountInPaise = Math.round(totalAmount * 100);
      
      const orderData = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `booking_${bookingData?.bookingId}_${Date.now()}`,
        notes: {
          bookingId: bookingData?.bookingId,
          customerName: bookingData?.customerName || 'Customer',
          serviceType: "Service Booking"
        }
      };

      // Call your backend API to create Razorpay order
      const orderResponse = await postData(
        orderData,
        `${Urls.baseUrl}/api/razorpay/create-order`,
        'POST'
      );

      if (orderResponse?.success) {
        const { id: razorpayOrderId } = orderResponse.data;
        setOrderId(razorpayOrderId);
        
        // Generate QR code for UPI payment
        // Format: upi://pay?pa=merchant-vpa@razorpay&pn=MerchantName&am=amount&cu=INR
        const upiId = 'YOUR_MERCHANT_UPI_ID@razorpay'; // Replace with your UPI ID
        const merchantName = 'Your Service Company';
        const qrData = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount}&cu=INR&tn=Booking-${bookingData?.bookingId}`;
        
        // Generate QR code using a service
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&format=png`;
        setQrCodeImage(qrCodeUrl);
        
      } else {
        Toast.show({
          type: 'error',
          text1: 'Payment Error',
          text2: 'Failed to initialize payment. Please try again.',
        });
      }
      
    } catch (error) {
      console.error('Payment initialization error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to setup payment',
      });
    } finally {
      setPaymentInProgress(false);
    }
  };

  const handleBack = () => {
    if (paymentInProgress) {
      Alert.alert(
        'Payment in Progress',
        'Are you sure you want to leave? Payment process will be cancelled.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleUPIPayment = () => {
    setPaymentMethod('upi');
    startRazorpayPayment();
  };

  const handleCardPayment = () => {
    setPaymentMethod('card');
    startRazorpayPayment();
  };

  const startRazorpayPayment = async () => {
    try {
      setPaymentInProgress(true);
      
      const options = {
        description: `Payment for Booking #${bookingData?.bookingId}`,
        image: 'https://your-company-logo.png', // Add your logo URL
        currency: 'INR',
        key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay key
        amount: Math.round(totalAmount * 100),
        name: 'Your Service Company',
        order_id: orderId, // Use the order ID created earlier
        prefill: {
          email: bookingData?.customerEmail || 'customer@example.com',
          contact: bookingData?.customerPhone || '+919876543210',
          name: bookingData?.customerName || 'Customer Name'
        },
        theme: { color: colors.primary },
        method: paymentMethod === 'upi' ? {
          upi: true
        } : {
          card: true,
          netbanking: true,
          wallet: true
        }
      };

      RazorpayCheckout.open(options)
        .then(async (data) => {
          // Handle successful payment
          console.log('Payment success:', data);
          
          const paymentData = {
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature,
            bookingId: bookingData?.bookingId,
            amount: totalAmount,
            paymentMethod: paymentMethod
          };
          
          // Verify payment with your backend
          const verifyResponse = await verifyPayment(paymentData);
          
          if (verifyResponse?.success) {
            setPaymentSuccess(true);
            setPaymentId(data.razorpay_payment_id);
            
            Toast.show({
              type: 'success',
              text1: 'Payment Successful',
              text2: 'Your payment has been received',
            });
            
            // Call success callback after 2 seconds
            setTimeout(() => {
              if (onPaymentSuccess) {
                onPaymentSuccess({
                  paymentId: data.razorpay_payment_id,
                  orderId: data.razorpay_order_id,
                  amount: totalAmount,
                  paymentMethod: paymentMethod
                });
              }
              navigation.goBack();
            }, 2000);
            
          } else {
            setPaymentFailed(true);
            Toast.show({
              type: 'error',
              text1: 'Payment Verification Failed',
              text2: 'Please contact support',
            });
          }
        })
        .catch((error) => {
          // Handle payment failure
          console.error('Payment error:', error);
          setPaymentFailed(true);
          
          let errorMessage = 'Payment failed or cancelled';
          if (error.error) {
            errorMessage = error.error.description || errorMessage;
          }
          
          Toast.show({
            type: 'error',
            text1: 'Payment Failed',
            text2: errorMessage,
          });
        })
        .finally(() => {
          setPaymentInProgress(false);
        });
        
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentInProgress(false);
      setPaymentFailed(true);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Payment process failed',
      });
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await postData(
        paymentData,
        `${Urls.baseUrl}/api/razorpay/verify-payment`,
        'POST'
      );
      return response;
    } catch (error) {
      console.error('Verification error:', error);
      return { success: false, message: 'Verification failed' };
    }
  };

  const checkQRPaymentStatus = async () => {
    try {
      setPaymentInProgress(true);
      
      // Check if payment was made via QR code
      const checkData = {
        orderId: orderId,
        bookingId: bookingData?.bookingId,
        amount: totalAmount
      };
      
      const response = await postData(
        checkData,
        `${Urls.baseUrl}/api/razorpay/check-payment`,
        'POST'
      );
      
      if (response?.success && response.data.status === 'captured') {
        setPaymentSuccess(true);
        setPaymentId(response.data.paymentId);
        
        Toast.show({
          type: 'success',
          text1: 'Payment Received',
          text2: 'QR Code payment successful!',
        });
        
        // Call success callback
        setTimeout(() => {
          if (onPaymentSuccess) {
            onPaymentSuccess({
              paymentId: response.data.paymentId,
              orderId: orderId,
              amount: totalAmount,
              paymentMethod: 'qr'
            });
          }
          navigation.goBack();
        }, 2000);
        
      } else {
        Toast.show({
          type: 'warning',
          text1: 'Payment Pending',
          text2: 'Scan and complete the payment',
        });
      }
      
    } catch (error) {
      console.error('Check payment error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to check payment status',
      });
    } finally {
      setPaymentInProgress(false);
    }
  };

  const renderQRCodeSection = () => (
    <View style={clsx(styles.itemsCenter, styles.justifyCenter, styles.mb8)}>
      <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
        Scan QR Code to Pay
      </Text>
      
      <View style={clsx(
        styles.p6,
        styles.bgWhite,
        styles.border,
        styles.borderGray300,
        styles.roundedXl,
        styles.itemsCenter,
        styles.justifyCenter,
        styles.mb4
      )}>
        {qrCodeImage ? (
          <Image
            source={{ uri: qrCodeImage }}
            style={clsx(styles.w64, styles.h64)}
            resizeMode="contain"
          />
        ) : (
          <ActivityIndicator size="large" color={colors.primary} />
        )}
        
        {paymentSuccess && (
          <View style={clsx(styles.mt4, styles.p2, styles.bgSuccess, styles.roundedFull)}>
            <Icon name="check" size={24} color={colors.white} />
          </View>
        )}
      </View>
      
      <View style={clsx(styles.mb6, styles.wFull)}>
        <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
          How to Pay via QR Code:
        </Text>
        <View style={clsx(styles.pl4)}>
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
            1. Open any UPI app (GPay, PhonePe, Paytm)
          </Text>
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
            2. Tap on 'Scan QR Code'
          </Text>
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
            3. Scan the QR code above
          </Text>
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
            4. Verify amount: ₹{totalAmount}
          </Text>
          <Text style={clsx(styles.textSm, styles.textMuted)}>
            5. Enter UPI PIN and complete payment
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPaymentOptions = () => (
    <View style={clsx(styles.mb8)}>
      <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
        Other Payment Options
      </Text>
      
      <TouchableOpacity
        style={clsx(
          styles.flexRow,
          styles.itemsCenter,
          styles.p4,
          styles.mb3,
          styles.bgWhite,
          styles.border,
          styles.borderPrimary,
          styles.roundedLg
        )}
        onPress={handleUPIPayment}
        disabled={paymentInProgress || paymentSuccess}
      >
        <View style={clsx(styles.w10, styles.h10, styles.bgPrimaryLight, styles.roundedFull, styles.itemsCenter, styles.justifyCenter, styles.mr3)}>
          <Icon name="account-balance-wallet" size={24} color={colors.primary} />
        </View>
        <View style={clsx(styles.flex1)}>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
            Pay via UPI
          </Text>
          <Text style={clsx(styles.textSm, styles.textMuted)}>
            Instant payment using any UPI app
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color={colors.primary} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={clsx(
          styles.flexRow,
          styles.itemsCenter,
          styles.p4,
          styles.bgWhite,
          styles.border,
          styles.borderPrimary,
          styles.roundedLg
        )}
        onPress={handleCardPayment}
        disabled={paymentInProgress || paymentSuccess}
      >
        <View style={clsx(styles.w10, styles.h10, styles.bgPrimaryLight, styles.roundedFull, styles.itemsCenter, styles.justifyCenter, styles.mr3)}>
          <Icon name="credit-card" size={24} color={colors.primary} />
        </View>
        <View style={clsx(styles.flex1)}>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
            Pay via Card / Net Banking
          </Text>
          <Text style={clsx(styles.textSm, styles.textMuted)}>
            Credit Card, Debit Card or Net Banking
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderPaymentStatus = () => {
    if (paymentSuccess) {
      return (
        <View style={clsx(
          styles.p4,
          styles.bgSuccessLight,
          styles.roundedLg,
          styles.itemsCenter,
          styles.mb6
        )}>
          <Icon name="check-circle" size={32} color={colors.success} style={clsx(styles.mb2)} />
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
            Payment Successful!
          </Text>
          <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
            Payment ID: {paymentId?.substring(0, 12)}...
          </Text>
          <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1)}>
            Redirecting back to booking...
          </Text>
        </View>
      );
    }
    
    if (paymentFailed) {
      return (
        <View style={clsx(
          styles.p4,
          styles.bgErrorLight,
          styles.roundedLg,
          styles.itemsCenter,
          styles.mb6
        )}>
          <Icon name="error" size={32} color={colors.error} style={clsx(styles.mb2)} />
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textError)}>
            Payment Failed
          </Text>
          <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
            Please try another payment method
          </Text>
        </View>
      );
    }
    
    return null;
  };

  const renderActionButtons = () => (
    <View style={clsx(styles.spaceY3)}>
      {/* Check QR Payment Status Button */}
      <TouchableOpacity
        style={clsx(
          styles.bgPrimary,
          styles.roundedLg,
          styles.p4,
          styles.itemsCenter,
          styles.justifyCenter,
          (paymentInProgress || paymentSuccess) && styles.opacity50
        )}
        onPress={checkQRPaymentStatus}
        disabled={paymentInProgress || paymentSuccess}
      >
        {paymentInProgress ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={clsx(styles.textWhite, styles.fontBold, styles.textBase)}>
            {paymentSuccess ? 'Payment Verified' : 'Check Payment Status'}
          </Text>
        )}
      </TouchableOpacity>

      {/* For Testing: Manual Success Button */}
      {__DEV__ && (
        <TouchableOpacity
          style={clsx(
            styles.bgInfo,
            styles.roundedLg,
            styles.p4,
            styles.itemsCenter,
            styles.justifyCenter,
            styles.mt3
          )}
          onPress={() => {
            setPaymentSuccess(true);
            setPaymentId(`test_payment_${Date.now()}`);
            Toast.show({
              type: 'success',
              text1: 'Test Payment',
              text2: 'Payment marked as successful for testing',
            });
            setTimeout(() => {
              if (onPaymentSuccess) {
                onPaymentSuccess({
                  paymentId: `test_payment_${Date.now()}`,
                  orderId: orderId || `test_order_${Date.now()}`,
                  amount: totalAmount,
                  paymentMethod: 'test'
                });
              }
              navigation.goBack();
            }, 1500);
          }}
        >
          <Text style={clsx(styles.textWhite, styles.fontBold, styles.textBase)}>
            Test: Mark as Paid (Dev Only)
          </Text>
        </TouchableOpacity>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={clsx(
          styles.border,
          styles.borderGray400,
          styles.roundedLg,
          styles.p4,
          styles.itemsCenter,
          styles.justifyCenter,
          styles.mt3
        )}
        onPress={handleBack}
        disabled={paymentInProgress}
      >
        <Text style={clsx(styles.textGray700, styles.fontBold, styles.textBase)}>
          Back to Booking
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={clsx(styles.flex1, styles.bgWhite)}>
      {/* Header */}
      <View style={[clsx(styles.bgPrimary, styles.px4, styles.py3)]}>
        <View style={clsx(styles.flexRow, styles.itemsCenter)}>
          <TouchableOpacity 
            onPress={handleBack}
            style={clsx(styles.mr3)}
            disabled={paymentInProgress}
          >
            <Icon 
              name="arrow-back" 
              size={24} 
              color={paymentInProgress ? colors.gray300 : colors.white} 
            />
          </TouchableOpacity>
          <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold)}>
            Make Payment
          </Text>
        </View>
      </View>

      <ScrollView 
        style={clsx(styles.flex1)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.p6)}
      >
        {/* Amount Display */}
        <View style={clsx(styles.itemsCenter, styles.mb6)}>
          <Text style={clsx(styles.text4xl, styles.fontBold, styles.textPrimary)}>
            ₹{totalAmount}
          </Text>
          <Text style={clsx(styles.textBase, styles.textMuted)}>
            Payment for Booking #{bookingData?.bookingId}
          </Text>
        </View>

        {/* Payment Status */}
        {renderPaymentStatus()}

        {/* QR Code Section */}
        {renderQRCodeSection()}

        {/* Other Payment Options */}
        {renderPaymentOptions()}

        {/* Action Buttons */}
        {renderActionButtons()}

        {/* Payment Info */}
        <View style={clsx(styles.mt8, styles.p4, styles.bgGray50, styles.roundedLg)}>
          <Text style={clsx(styles.textSm, styles.fontBold, styles.textBlack, styles.mb2)}>
            Payment Information:
          </Text>
          <Text style={clsx(styles.textXs, styles.textMuted)}>
            • Secure payment via Razorpay{"\n"}
            • All transactions are encrypted{"\n"}
            • You'll receive payment confirmation{"\n"}
            • For issues, contact: support@yourcompany.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default QrPaymentScreen;