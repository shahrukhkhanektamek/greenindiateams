import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';

const CompleteBookingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    bookingData,
    formattedData,
    loadBookingDetails
  } = route.params || {};

  console.log(formattedData)
  
  const { Toast, Urls, postData } = useContext(AppContext);
  
  const [cashCollected, setCashCollected] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [completingBooking, setCompletingBooking] = useState(false);

  useEffect(() => {
    if (formattedData?.paymentStatus === 'Pending') {
      setCashAmount(formattedData.amount.toString());
    }
  }, [formattedData]);

  const handleBack = () => {
    navigation.goBack();
  };

  const calculateTotalAmount = () => {
    return formattedData?.originalBookingAmount || 0;
  };

  const calculateDueAmount = () => {
    const total = calculateTotalAmount();
    if (formattedData?.paymentStatus === 'Paid') {
      return 0; // Already paid, no due amount
    }
    return total;
  };

  const completeBooking = async () => {
    try {
      setCompletingBooking(true);
      
      const data = {
        bookingId: bookingData?._id,
        cashCollected: cashCollected,
        cashAmount: cashCollected ? parseFloat(cashAmount) : 0,
        additionalItems: [], // Empty array
        totalAmount: calculateTotalAmount(),
        dueAmount: calculateDueAmount(),
      };

      const response = await postData(
        data,
        Urls.bookingComplete+'/'+formattedData.originalData._id,
        'POST'
      );

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Booking Completed',
          text2: 'Booking has been completed successfully',
        });
        
        navigation.goBack();
        setTimeout(() => {
          if (loadBookingDetails) {
            loadBookingDetails();
          }
        }, 500);
        
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

  return (
    <View style={clsx(styles.flex1, styles.bgWhite)}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header Bar */}
      <View style={[clsx(styles.bgPrimary, styles.px4, styles.py3)]}>
        <View style={clsx(styles.flexRow, styles.itemsCenter)}>
          <TouchableOpacity 
            onPress={handleBack}
            style={clsx(styles.mr3)}
          >
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold)}>
            Complete Booking
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={clsx(styles.flex1)}
      >
        <ScrollView 
          style={clsx(styles.flex1)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={clsx(styles.pb24)}
          keyboardShouldPersistTaps="handled"
        >
          <View style={clsx(styles.p6)}>
            {/* Header */}
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb6)}>
              <TouchableOpacity 
                onPress={handleBack}
                style={clsx(styles.mr3)}
              >
                <Icon name="arrow-back" size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                Complete Booking
              </Text>
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

            {/* Cash Collection - Only show if there is due amount */}
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

            {/* Instructions */}
            <View style={clsx(styles.mb6, styles.p4, styles.bgInfoLight, styles.roundedLg)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
                📋 Important Instructions:
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                1. Ensure all service work is completed{"\n"}
                2. All media (photos/videos) should be uploaded{"\n"}
                3. Customer satisfaction should be confirmed{"\n"}
                4. Click "Complete Booking" to finish the service
              </Text>
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
      </KeyboardAvoidingView>
    </View>
  );
};

export default CompleteBookingScreen;