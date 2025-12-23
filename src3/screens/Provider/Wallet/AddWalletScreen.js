import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

const AddWalletScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { Toast, Urls, postData, user } = useContext(AppContext);

  console.log(user)
  
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [transactionTableId, setTransactionTableId] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const { onSuccess } = route.params || {};

  const handleBack = () => {
    navigation.goBack();
  };

  // Step 1: Create Razorpay Order on your backend
  const createRazorpayOrder = async () => {
    try {
      const data = {
        amount: amount, // Convert to paise (Razorpay requires amount in smallest currency unit)[citation:2][citation:6]
        currency: 'INR',
        type:'wallet',
        userId: user._id,
        receipt: `wallet_${Date.now()}`
      };
      // Call your backend to create Razorpay order
      const response = await postData(
        data,
        Urls.createTransaction, // You need to create this endpoint on your backend
        'POST'
      );

      if (response?.success && response.transactionDetail?._id) {
        setTransactionTableId(response.transactionDetail?._id);
        return response.transactionDetail?._id;
      } else {
        throw new Error(response?.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Create order error:', error);
      Toast.show({
        type: 'error',
        text1: 'Order Creation Failed',
        text2: 'Unable to create payment order',
      });
      return null;
    }
  };

  // Step 2: Process payment with Razorpay
  const processPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Please enter a valid amount',
      });
      return;
    }

    try {
      setPaymentLoading(true);

      // 1. Create Razorpay Order first
      const orderId = await createRazorpayOrder();
      if (!orderId) {
        setPaymentLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        description: 'Wallet Credit Addition',
        image: 'http://145.223.18.56:3001/admin/assets/img/logo.png', // Add your logo URL
        currency: 'INR',
        key: 'rzp_test_RHmDyqCFCKQ5XV', // Replace with your actual Razorpay Key ID[citation:2][citation:3]
        amount: (parseFloat(amount) * 100).toString(), // Convert to paise[string:citation:2][citation:6]
        name: 'Green India', // Your business name[citation:2]
        order_id: orderId, // Order ID from your backend[citation:2]
        prefill: {
          email: 'user@example.com', // You can prefill user email if available
          contact: '+919876543210', // You can prefill user contact if available
          name: 'User Name' // You can prefill user name if available
        },
        theme: { color: colors.primary }, // Use your app's primary color
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setPaymentLoading(false);
          }
        }
      };

      // Open Razorpay payment modal[citation:2][citation:4]
      RazorpayCheckout.open(options)
        .then(async (paymentData) => {
          // Payment successful
          console.log('Payment Success:', paymentData);
          
          // Step 3: Call your wallet API with payment verification
          await confirmWalletCredit(paymentData);
        })
        .catch((error) => {
          // Payment failed or user cancelled
          console.error('Payment Error:', error);
          
          if (error.code === 2) { // User cancelled payment
            Toast.show({
              type: 'info',
              text1: 'Payment Cancelled',
              text2: 'Payment was cancelled by user',
            });
          } else {
            Toast.show({
              type: 'error',
              text1: 'Payment Failed',
              text2: error.description || 'Payment processing failed',
            });
          }
          setPaymentLoading(false);
        });

    } catch (error) {
      console.error('Payment process error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Payment initialization failed',
      });
      setPaymentLoading(false);
    }
  };

  // Step 3: Confirm wallet credit after successful payment
  const confirmWalletCredit = async (paymentData) => {
    try {
      setLoading(true);
      
      const data = {
        depositAmount: parseFloat(amount),
        transactionId: paymentData.razorpay_payment_id, // Use Razorpay payment ID
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpaySignature: paymentData.razorpay_signature,
        paymentMethod: paymentData.method || 'razorpay'
      };

      const response = await postData(
        data,
        Urls.addWalletCredit,
        'POST'
      );

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Payment Successful',
          text2: 'Credit has been added to your wallet',
        });
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Credit Update Failed',
          text2: response?.message || 'Failed to update wallet after payment',
        });
        setPaymentLoading(false);
      }
    } catch (error) {
      console.error('Confirm credit error:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Failed to update wallet',
      });
      setPaymentLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle submit - now triggers payment process
  const handleSubmit = () => {
    processPayment();
  };

  // Predefined amount buttons for quick selection
  const quickAmounts = [100, 500, 1000, 2000, 5000];

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Add Credit"
        showBack
        onBackPress={handleBack}
        showNotification={false}
        type="white"
      />

      <ScrollView 
        style={clsx(styles.flex1)}
        contentContainerStyle={clsx(styles.p6)}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Input */}
        <View style={clsx(styles.mb6)}>
          <Text style={clsx(styles.textBase, styles.textMuted, styles.mb2)}>
            Amount (₹)
          </Text>
          <TextInput
            style={clsx(
              styles.border,
              styles.borderPrimary,
              styles.roundedLg,
              styles.p4,
              styles.textXl,
              styles.fontBold,
              styles.textBlack,
              styles.textCenter
            )}
            placeholder="0"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            maxLength={8}
          />
        </View>

        {/* Quick Amount Selection */}
        <View style={clsx(styles.mb6)}>
          <Text style={clsx(styles.textBase, styles.textMuted, styles.mb3)}>
            Quick Select
          </Text>
          <View style={clsx(styles.flexRow, styles.flexWrap, styles.gap2)}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={clsx(
                  styles.px4,
                  styles.py3,
                  styles.bgGrayLight,
                  styles.roundedLg,
                  styles.flex1,
                  styles.minW24,
                  amount === quickAmount.toString() && styles.bgPrimaryLight,
                  amount === quickAmount.toString() && styles.border,
                  amount === quickAmount.toString() && styles.borderPrimary
                )}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={clsx(
                  styles.textCenter,
                  styles.fontMedium,
                  amount === quickAmount.toString() ? styles.textPrimary : styles.textBlack
                )}>
                  ₹{quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Info */}
        <View style={clsx(styles.bgInfoLight, styles.p4, styles.roundedLg, styles.mb6)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
            <Icon name="payment" size={20} color={colors.info} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo)}>
              Secure Payment via Razorpay
            </Text>
          </View>
          <Text style={clsx(styles.textSm, styles.textInfo)}>
            • Payment processed securely via Razorpay
          </Text>
          <Text style={clsx(styles.textSm, styles.textInfo)}>
            • Supports UPI, Cards, Net Banking, Wallets
          </Text>
          <Text style={clsx(styles.textSm, styles.textInfo)}>
            • Instant wallet credit after successful payment
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={clsx(
            styles.bgSuccess,
            styles.roundedLg,
            styles.p4,
            styles.itemsCenter,
            styles.justifyCenter,
            (loading || paymentLoading) && styles.opacity50
          )}
          onPress={handleSubmit}
          disabled={loading || paymentLoading}
        >
          {paymentLoading ? (
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <ActivityIndicator size="small" color={colors.white} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                Processing Payment...
              </Text>
            </View>
          ) : loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
              Pay ₹{amount || '0'} & Add Credit
            </Text>
          )}
        </TouchableOpacity>

        {/* Payment Processing Info */}
        {(loading || paymentLoading) && (
          <View style={clsx(styles.mt4, styles.p4, styles.bgGrayLight, styles.roundedLg)}>
            <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
              Please wait while we process your payment...
            </Text>
            <Text style={clsx(styles.textXs, styles.textMuted, styles.textCenter, styles.mt1)}>
              Do not close the app during payment
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AddWalletScreen;