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
  const { Toast, Urls, postData, user, rzorepay_key } = useContext(AppContext);
  
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [transactionTableId, setTransactionTableId] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  const { onSuccess } = route.params || {};

  const handleBack = () => {
    navigation.goBack();
  };

  // Step 1: Create Razorpay Order on your backend
  const createRazorpayOrder = async () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const data = {
        amount: (parseFloat(amount)).toString(), // Convert to paise
        currency: 'INR',
        type: 'wallet',
        userId: user?._id,
        receipt: `wallet_${Date.now()}`
      };
      
      // console.log('Creating order with data:', data);
      
      // Call your backend to create Razorpay order
      const response = await postData(
        data,
        Urls.createTransaction,
        'POST'
      );

      // console.log('Order creation response:', response);

      if (response?.success) {
        // Check for order ID in different possible response structures
        const orderId = response.order?.id || 
                       response.orderId || 
                       response.data?.orderId ||
                       response.transactionDetail?.orderId;
        
        if (orderId) {
          setTransactionTableId(orderId);
          return orderId;
        } else {
          throw new Error('Order ID not found in response');
        }
      } else {
        throw new Error(response?.message || 'Failed to create order');
      }
    } catch (error) {
      // console.error('Create order error:', error);
      Toast.show({
        type: 'error',
        text1: 'Order Creation Failed',
        text2: error.message || 'Unable to create payment order',
      });
      setPaymentLoading(false);
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

    if (parseFloat(amount) < 1) {
      Toast.show({
        type: 'error',
        text1: 'Minimum Amount',
        text2: 'Minimum amount is ₹1',
      });
      return;
    }

    if (!user?._id) {
      Toast.show({
        type: 'error',
        text1: 'User Not Found',
        text2: 'Please login again',
      });
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError(null);

      // 1. Create Razorpay Order first
      const orderId = await createRazorpayOrder();
      if (!orderId) {
        setPaymentLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        description: 'Wallet Credit Addition',
        image: 'https://145.223.18.56:3001/admin/assets/img/logo.png', // Use HTTPS URL
        currency: 'INR',
        key: rzorepay_key, // Your Razorpay test key
        amount: (parseFloat(amount)).toString(),
        name: 'Green India',
        order_id: orderId, // Make sure this matches your backend response
        prefill: {
          email: user?.email || 'user@example.com',
          contact: user?.mobile || user.user.mobile,
          name: user?.name || 'User'
        },
        theme: { 
          color: colors.primary,
          backdrop_color: '#ffffff'
        },
        modal: {
          ondismiss: () => {
            // console.log('Payment modal dismissed');
            setPaymentLoading(false);
            // Show cancellation message
            Toast.show({
              type: 'info',
              text1: 'Payment Cancelled',
              text2: 'You can try again',
            });
          }
        },
        // Add notes if needed
        notes: {
          userId: user?._id,
          type: 'wallet_recharge'
        }
      };

      // console.log('Opening Razorpay with options:', options);

      // Open Razorpay payment modal
      RazorpayCheckout.open(options)
        .then(async (paymentData) => {
          // console.log('Payment Success Data:', paymentData);
          
          // Validate payment response
          if (!paymentData.razorpay_payment_id) {
            throw new Error('Payment ID not received');
          }
          
          // Step 3: Call your wallet API with payment verification
          await confirmWalletCredit(paymentData);
        })
        .catch((error) => {
          // console.error('Payment Error Details:', {
          //   code: error.code,
          //   description: error.description,
          //   fullError: error
          // });
          
          // Handle specific error codes
          if (error.code === 0 || error.code === 1 || error.code === 2) {
            // User cancelled or network issues
            setPaymentError('Payment was cancelled or interrupted');
            Toast.show({
              type: 'info',
              text1: 'Payment Not Completed',
              text2: 'Payment was cancelled or interrupted',
            });
          } else if (error.code === 3) {
            // Payment failed
            setPaymentError('Transaction was not successful');
            Toast.show({
              type: 'error',
              text1: 'Payment Failed',
              text2: 'Transaction was not successful',
            });
          } else {
            // Other errors
            // setPaymentError(error.description || 'Something went wrong with payment');
            // Toast.show({
            //   type: 'error',
            //   text1: 'Payment Error',
            //   text2: error.description || 'Something went wrong with payment',
            // });
          }
          setPaymentLoading(false);
        });

    } catch (error) {
      // console.error('Payment process error:', error);
      setPaymentError(error.message || 'Payment initialization failed');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Payment initialization failed',
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
        transactionId: paymentData.razorpay_payment_id,
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpaySignature: paymentData.razorpay_signature,
        paymentMethod: paymentData.method || 'razorpay'
      };

      // console.log('Confirming wallet credit with data:', data);

      const response = await postData(
        data,
        Urls.addWalletCredit,
        'POST'
      );

      // console.log('Wallet credit response:', response);

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
      // console.error('Confirm credit error:', error);
      setPaymentError('Failed to update wallet after payment');
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
  const quickAmounts = [500, 1000, 2000, 3000, 5000];

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Add Credit"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        rightActionIcon="refresh"
        showProfile={false}
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
            onChangeText={(text) => {
              setAmount(text);
              setPaymentError(null);
            }}
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
                  styles.px1,
                  styles.py2,
                  styles.bgGrayLight,
                  styles.roundedLg,
                  styles.flex1,
                  styles.minW24,
                  amount === quickAmount.toString() && styles.bgPrimaryLight,
                  amount === quickAmount.toString() && styles.border,
                  amount === quickAmount.toString() && styles.borderPrimary
                )}
                onPress={() => {
                  setAmount(quickAmount.toString());
                  setPaymentError(null);
                }}
              >
                <Text style={clsx(
                  styles.textCenter,
                  styles.fontMedium,
                  // styles.textSm,
                  amount === quickAmount.toString() ? styles.textPrimary : styles.textBlack
                )}>
                  ₹{quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


        {/* Error Message */}
        {paymentError && (
          <View style={clsx(styles.mb4, styles.p4, styles.bgErrorLight, styles.roundedLg, styles.border, styles.borderError)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
              <Icon name="error" size={20} color={colors.error} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textError)}>
                Payment Error
              </Text>
            </View>
            <Text style={clsx(styles.textSm, styles.textError, styles.mb3)}>
              {paymentError}
            </Text>
            <TouchableOpacity
              style={clsx(styles.bgError, styles.rounded, styles.p3, styles.itemsCenter)}
              onPress={() => {
                setPaymentError(null);
                handleSubmit();
              }}
            >
              <Text style={clsx(styles.textWhite, styles.fontBold)}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}

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