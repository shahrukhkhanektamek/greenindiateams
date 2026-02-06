import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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

  const { Toast, Urls, postData } = useContext(AppContext);
  
  const [paymentMode, setPaymentMode] = useState(''); // 'cash' or 'online'
  const [cashAmount, setCashAmount] = useState('');
  const [onlineAmount, setOnlineAmount] = useState('');
  const [completingBooking, setCompletingBooking] = useState(false);
  const [onlinePaymentSuccess, setOnlinePaymentSuccess] = useState(false);
  const [onlinePaymentData, setOnlinePaymentData] = useState(null);
  
  // Parts related states
  const [partsApprovalStatus, setPartsApprovalStatus] = useState(null);
  const [additionalParts, setAdditionalParts] = useState([]);
  const [partsAmount, setPartsAmount] = useState(0);
  const [originalServiceAmount, setOriginalServiceAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    initializePaymentData();
    loadPartsData();
  }, [formattedData]);

  const initializePaymentData = () => {
    if (!formattedData) return;
    
    const totalAmount = calculateTotalAmount();
    
    if (formattedData.paymentStatus === 'Paid') {
      // Already paid online
      setPaymentMode('online');
      setOnlineAmount(totalAmount.toString());
      setOnlinePaymentSuccess(true);
    } else {
      // COD booking
      setPaymentMode('cash');
      setCashAmount(totalAmount.toString());
    }
  };

  const loadPartsData = () => {
    try {
      if (bookingData) {
        // Check parts approval status
        const status = bookingData.status;
        if (status.includes('partstatus')) {
          setPartsApprovalStatus(status);
        }
        
        // Get additional parts from booking
        let partsTotal = 0;
        if (bookingData.parts && bookingData.parts.length > 0) {
          setAdditionalParts(bookingData.parts);
          
          // Calculate parts amount
          bookingData.parts.forEach(part => {
            partsTotal += (part.unitPrice || 0) * (part.quantity || 1);
          });
          setPartsAmount(partsTotal);
        }
        
        // Calculate original service amount
        const bookingItems = bookingData.booking?.bookingItems || [];
        let originalAmt = 0;
        bookingItems.forEach(item => {
          const itemPrice = item.salePrice || 0;
          const itemQuantity = item.quantity || 1;
          originalAmt += itemPrice * itemQuantity;
        });
        setOriginalServiceAmount(originalAmt);
        
        // Set grand total
        setGrandTotal(originalAmt + partsTotal);
      }
    } catch (error) {
      console.error('Error loading parts data:', error);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const calculateTotalAmount = () => {
    return grandTotal || formattedData?.originalBookingAmount || 0;
  };

  const calculateDueAmount = () => {
    const total = calculateTotalAmount();
    if (formattedData?.paymentStatus === 'Paid') {
      return 0;
    }
    return total;
  };

  const isPartsPending = () => {
    return partsApprovalStatus === 'partstatusnew' || partsApprovalStatus === 'partstatusconfirm';
  };

  const handleOnlinePaymentSuccess = (paymentData) => {
    // console.log('Online payment success:', paymentData);
    // setOnlinePaymentSuccess(true);
    // setOnlinePaymentData(paymentData);
    // setOnlineAmount(paymentData.amount.toString());

    navigation.navigate('BookingDone', {
      bookingData: bookingData,
      formattedData: formattedData,
      loadBookingDetails: loadBookingDetails,
    });
    
    Toast.show({
      type: 'success',
      text1: 'Payment Successful',
      text2: 'Online payment completed successfully',
    });
  };

  const navigateToPaymentScreen = () => {
    const totalAmount = calculateTotalAmount();
    
    navigation.navigate('QrPaymentScreen', {
      bookingData: bookingData,
      totalAmount: totalAmount,
      onPaymentSuccess: handleOnlinePaymentSuccess
    });
  };

  const selectPaymentMode = (mode) => {
    if (mode === 'online') {
      navigateToPaymentScreen();
    } else {
      setPaymentMode(mode);
      const totalAmount = calculateTotalAmount();
      if (mode === 'cash') {
        setCashAmount(totalAmount.toString());
        setOnlineAmount('');
        setOnlinePaymentSuccess(false);
      }
    }
  };

  const completeBooking = async () => {
    try {
      // Check if parts are pending approval
      if (isPartsPending()) {
        Toast.show({
          type: 'error',
          text1: 'Parts Approval Pending',
          text2: 'Cannot complete booking while parts approval is pending',
        });
        return;
      }
      
      // Validate payment for online mode
      if (paymentMode === 'online' && !onlinePaymentSuccess) {
        Toast.show({
          type: 'error',
          text1: 'Payment Required',
          text2: 'Please complete online payment first',
        });
        return;
      }
      
      // Validate payment amounts
      const totalAmount = calculateTotalAmount();
      let paidAmount = 0;
      let razorpayPaymentId = '';
      let razorpayOrderId = '';
      
      if (paymentMode === 'cash') {
        const cashAmt = parseFloat(cashAmount) || 0;
        if (cashAmt <= 0) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Amount',
            text2: 'Please enter valid cash amount',
          });
          return;
        }
        paidAmount = cashAmt;
      } else if (paymentMode === 'online') {
        const onlineAmt = parseFloat(onlineAmount) || 0;
        if (onlineAmt <= 0) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Amount',
            text2: 'Please complete online payment first',
          });
          return;
        }
        paidAmount = onlineAmt;
        razorpayPaymentId = onlinePaymentData?.paymentId || '';
        razorpayOrderId = onlinePaymentData?.orderId || '';
      }
      
      // Check if paid amount matches total amount
      if (Math.abs(paidAmount - totalAmount) > 1) {
        Toast.show({
          type: 'error',
          text1: 'Amount Mismatch',
          text2: `Paid amount (₹${paidAmount}) should match total amount (₹${totalAmount})`,
        });
        return;
      }
      
      setCompletingBooking(true); 
      
      const data = {
        bookingId: bookingData?.bookingId,
        servicemanBookingId: bookingData?._id,
        paymentMode: paymentMode, 
        cashAmount: paymentMode === 'cash' ? parseFloat(cashAmount) : 0,
        onlineAmount: paymentMode === 'online' ? parseFloat(onlineAmount) : 0,
        razorpayPaymentId: razorpayPaymentId,
        razorpayOrderId: razorpayOrderId,
        additionalItems: additionalParts.map(part => ({
          serviceItemId: part.serviceItemId,
          rateId: part.rateId,
          description: part.description,
          unitPrice: part.unitPrice,
          quantity: part.quantity,
          totalPrice: part.unitPrice * part.quantity
        })),
        totalAmount: totalAmount,
        paidAmount: paidAmount,
        dueAmount: 0,
        partsIncluded: additionalParts.length > 0,
        partsAmount: partsAmount,
        originalServiceAmount: originalServiceAmount,
        originalPaymentType: formattedData?.paymentStatus === 'Paid' ? 'online' : 'cod'
      };

      const response = await postData(
        data,
        Urls.bookingComplete,
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

  const renderPaymentModeSelection = () => {
    if (calculateDueAmount() <= 0) return null;
    
    return (
      <View style={clsx(styles.mb6, styles.p4, styles.bgGray50, styles.roundedLg)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
          Payment Collection
        </Text>
        
        <View style={clsx(styles.flexRow, styles.spaceX4, styles.mb4)}>
          {/* Cash Payment Option */}
          <TouchableOpacity
            style={clsx(
              styles.flex1,
              styles.p4,
              styles.roundedLg,
              styles.itemsCenter,
              styles.justifyCenter,
              paymentMode === 'cash' ? styles.bgSuccessLight : styles.bgWhite,
              paymentMode === 'cash' ? styles.borderSuccess : styles.borderLight,
              styles.border,
              isPartsPending() && styles.opacity50
            )}
            onPress={() => selectPaymentMode('cash')}
            disabled={isPartsPending()}
          >
            <Icon 
              name="money" 
              size={24} 
              color={paymentMode === 'cash' ? colors.success : colors.gray500} 
              style={clsx(styles.mb2)}
            />
            <Text style={clsx(
              styles.textBase,
              styles.fontBold,
              paymentMode === 'cash' ? styles.textSuccess : styles.textGray500
            )}>
              Cash
            </Text>
            {formattedData?.paymentStatus !== 'Paid' && (
              <Text style={clsx(styles.textXs, styles.textMuted, styles.textCenter, styles.mt1)}>
                COD Booking
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Online Payment Option */}
          <TouchableOpacity
            style={clsx(
              styles.flex1,
              styles.p4,
              styles.roundedLg,
              styles.itemsCenter,
              styles.justifyCenter,
              paymentMode === 'online' ? styles.bgPrimaryLight : styles.bgWhite,
              paymentMode === 'online' ? styles.borderPrimary : styles.borderLight,
              styles.border,
              isPartsPending() && styles.opacity50
            )}
            onPress={() => selectPaymentMode('online')}
            disabled={isPartsPending()}
          >
            <Icon 
              name="credit-card" 
              size={24} 
              color={paymentMode === 'online' ? colors.primary : colors.gray500} 
              style={clsx(styles.mb2)}
            />
            <Text style={clsx(
              styles.textBase,
              styles.fontBold,
              paymentMode === 'online' ? styles.textPrimary : styles.textGray500
            )}>
              Online
            </Text>
            {formattedData?.paymentStatus === 'Paid' ? (
              <Text style={clsx(styles.textXs, styles.textMuted, styles.textCenter, styles.mt1)}>
                Pre-paid
              </Text>
            ) : (
              <Text style={clsx(styles.textXs, styles.textMuted, styles.textCenter, styles.mt1)}>
                Pay Now
              </Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Payment Amount Input for Cash */}
        {paymentMode === 'cash' && (
          <View>
            <Text style={clsx(styles.textSm, styles.textMuted, styles.mb2)}>
              Cash Amount Collected
              {isPartsPending() && ' (Wait for parts approval)'}
            </Text>
            <TextInput
              style={clsx(
                styles.border,
                styles.borderSuccess,
                styles.roundedLg,
                styles.p3,
                styles.textBase,
                styles.textBlack,
                isPartsPending() && styles.bgGray200
              )}
              placeholder="Enter cash amount"
              keyboardType="numeric"
              value={cashAmount}
              onChangeText={setCashAmount}
              editable={!completingBooking && !isPartsPending()}
            />
          </View>
        )}
        
        {/* Payment Status for Online */}
        {paymentMode === 'online' && (
          <View>
            {onlinePaymentSuccess ? (
              <View style={clsx(
                styles.p3,
                styles.bgSuccessLight,
                styles.roundedLg,
                styles.flexRow,
                styles.itemsCenter
              )}>
                <Icon name="check-circle" size={20} color={colors.success} style={clsx(styles.mr2)} />
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
                    Online Payment Received
                  </Text>
                  <Text style={clsx(styles.textXs, styles.textMuted)}>
                    Amount: ₹{onlineAmount}
                    {onlinePaymentData?.paymentId && ` | Payment ID: ${onlinePaymentData.paymentId.substring(0, 10)}...`}
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={clsx(
                  styles.p3,
                  styles.bgPrimaryLight,
                  styles.roundedLg,
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyBetween
                )}
                onPress={navigateToPaymentScreen}
              >
                <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                  <Icon name="qr-code-scanner" size={20} color={colors.primary} style={clsx(styles.mr2)} />
                  <View>
                    <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
                      Complete Online Payment
                    </Text>
                    <Text style={clsx(styles.textXs, styles.textMuted)}>
                      Tap to pay via QR code, UPI or Cards
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderPaymentSummary = () => {
    const totalAmount = calculateTotalAmount();
    const originalPaymentType = formattedData?.paymentStatus === 'Paid' ? 'Online (Pre-paid)' : 'COD';
    
    return (
      <View style={clsx(styles.mb6, styles.p4, styles.bgGray50, styles.roundedLg)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
          Payment Summary
        </Text>
        
        <View style={clsx(styles.mb3)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb3)}>
            <Text style={clsx(styles.textBase, styles.textMuted)}>Booking Type:</Text>
            <Text style={clsx(
              styles.textBase,
              styles.fontMedium,
              originalPaymentType.includes('Online') ? styles.textPrimary : styles.textSuccess
            )}>
              {originalPaymentType}
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
            <Text style={clsx(styles.textBase, styles.textBlack)}>Original Service Amount:</Text>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
              ₹{originalServiceAmount}
            </Text>
          </View>
          
          {partsAmount > 0 && (
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
              <Text style={clsx(styles.textBase, styles.textBlack)}>Additional Parts Amount:</Text>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textPrimary)}>
                + ₹{partsAmount}
              </Text>
            </View>
          )}
          
          <View style={clsx(styles.borderTop, styles.borderLight, styles.pt3, styles.mt3)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>Total Amount:</Text>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                ₹{totalAmount}
              </Text>
            </View>
            
            {paymentMode && (
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                <Text style={clsx(styles.textBase, styles.textMuted)}>Collecting as:</Text>
                <Text style={clsx(
                  styles.textBase,
                  styles.fontMedium,
                  paymentMode === 'cash' ? styles.textSuccess : styles.textPrimary
                )}>
                  {paymentMode === 'cash' ? 'Cash Payment' : 'Online Payment'}
                </Text>
              </View>
            )}
            
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mt2)}>
              <Text style={clsx(styles.textLg, styles.fontBold, 
                calculateDueAmount() > 0 ? styles.textWarning : styles.textSuccess
              )}>
                {calculateDueAmount() > 0 ? 'Amount Due:' : 'Amount Paid:'}
              </Text>
              <Text style={clsx(
                styles.textLg,
                styles.fontBold,
                calculateDueAmount() > 0 ? styles.textWarning : styles.textSuccess
              )}>
                {calculateDueAmount() > 0 ? `₹${calculateDueAmount()}` : `₹${totalAmount}`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPartsStatus = () => {
    if (!partsApprovalStatus) return null;
    
    const statusColors = {
      'partstatusnew': { bg: colors.warningLight, text: colors.warning, label: 'Parts Submitted' },
      'partstatusconfirm': { bg: colors.infoLight, text: colors.info, label: 'Parts Confirmed' },
      'partstatusapprove': { bg: colors.successLight, text: colors.success, label: 'Parts Approved' },
      'partstatusreject': { bg: colors.errorLight, text: colors.error, label: 'Parts Rejected' }
    };
    
    const statusConfig = statusColors[partsApprovalStatus] || statusColors['partstatusnew'];
    
    return (
      <View style={[clsx(styles.mb4, styles.p3, styles.roundedLg), { backgroundColor: statusConfig.bg }]}>
        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb1)}>
          <Icon 
            name={partsApprovalStatus === 'partstatusapprove' ? 'check-circle' : 
                  partsApprovalStatus === 'partstatusreject' ? 'cancel' : 'schedule'} 
            size={20} 
            color={statusConfig.text} 
            style={clsx(styles.mr2)}
          />
          <Text style={[clsx(styles.textBase, styles.fontBold), { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>
        <Text style={clsx(styles.textSm, styles.textMuted)}>
          {partsApprovalStatus === 'partstatusnew' ? 'Waiting for customer confirmation' :
           partsApprovalStatus === 'partstatusconfirm' ? 'Customer has confirmed parts' :
           partsApprovalStatus === 'partstatusapprove' ? 'Parts approved by customer' :
           'Parts rejected by customer'}
        </Text>
      </View>
    );
  };

  const renderPartsDetails = () => {
    if (additionalParts.length === 0) return null;
    
    return (
      <View style={clsx(styles.mb4, styles.p3, styles.bgGray50, styles.roundedLg)}>
        <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
          Additional Parts
        </Text>
        
        {additionalParts.map((part, index) => (
          <View key={index} style={clsx(
            styles.flexRow,
            styles.justifyBetween,
            styles.itemsCenter,
            styles.mb1,
            styles.p2,
            styles.bgWhite,
            styles.rounded
          )}>
            <View style={clsx(styles.flex1)}>
              <Text style={clsx(styles.textSm, styles.textBlack)}>
                • {part.description}
              </Text>
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                Qty: {part.quantity} × ₹{part.unitPrice}
              </Text>
            </View>
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary)}>
              ₹{(part.unitPrice || 0) * (part.quantity || 1)}
            </Text>
          </View>
        ))}
        
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mt2, styles.pt2, styles.borderTop, styles.borderGray300)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
            Total Parts Amount:
          </Text>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
            ₹{partsAmount}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={clsx(styles.flex1, styles.bgWhite)}>
      
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
            
            {partsApprovalStatus && renderPartsStatus()}
            {renderPartsDetails()}
            {renderPaymentSummary()}
            {calculateDueAmount() > 0 && renderPaymentModeSelection()}

            <View style={clsx(styles.mb6, styles.p4, styles.bgInfoLight, styles.roundedLg)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
                📋 Important Instructions:
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                1. Ensure all service work is completed{"\n"}
                2. All media (photos/videos) should be uploaded{"\n"}
                {additionalParts.length > 0 && "3. Verify parts have been installed properly\n"}
                4. Customer satisfaction should be confirmed{"\n"}
                5. Collect payment as per booking type{"\n"}
                6. Click "Complete Booking" to finish the service
                {isPartsPending() && "\n\n⚠️ Cannot complete booking while parts approval is pending"}
              </Text>
            </View>

            <TouchableOpacity
              style={clsx(
                isPartsPending() ? styles.bgWarning : styles.bgSuccess,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                (completingBooking || isPartsPending() || (paymentMode === 'online' && !onlinePaymentSuccess)) && styles.opacity50
              )}
              onPress={completeBooking}
              disabled={completingBooking || isPartsPending() || (paymentMode === 'online' && !onlinePaymentSuccess)}
            >
              {completingBooking ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                    {isPartsPending() ? 'Parts Approval Pending' : 
                     paymentMode === 'online' && !onlinePaymentSuccess ? 'Complete Payment First' : 
                     'Complete Booking'}
                  </Text>
                  
                  {!isPartsPending() && paymentMode === 'online' && !onlinePaymentSuccess && (
                    <Text style={clsx(styles.textWhite, styles.textSm, styles.textCenter, styles.mt1)}>
                      Tap on Online Payment option to pay
                    </Text>
                  )}
                  
                  {!isPartsPending() && paymentMode === 'online' && onlinePaymentSuccess && (
                    <Text style={clsx(styles.textWhite, styles.textSm, styles.textCenter, styles.mt1)}>
                      Online Payment: ₹{onlineAmount} Received ✓
                    </Text>
                  )}
                  
                  {!isPartsPending() && paymentMode === 'cash' && (
                    <Text style={clsx(styles.textWhite, styles.textSm, styles.textCenter, styles.mt1)}>
                      Cash Payment: ₹{cashAmount} to Collect
                    </Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CompleteBookingScreen;