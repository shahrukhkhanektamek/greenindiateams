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
  
  // Parts related states
  const [partsApprovalStatus, setPartsApprovalStatus] = useState(null);
  const [additionalParts, setAdditionalParts] = useState([]);
  const [partsAmount, setPartsAmount] = useState(0);
  const [originalServiceAmount, setOriginalServiceAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    if (formattedData?.paymentStatus === 'Pending') {
      setCashAmount(formattedData.amount.toString());
    }
    
    // Load parts data from booking
    loadPartsData();
  }, [formattedData]);

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
    // Return grand total including parts
    return grandTotal || formattedData?.originalBookingAmount || 0;
  };

  const calculateDueAmount = () => {
    const total = calculateTotalAmount();
    if (formattedData?.paymentStatus === 'Paid') {
      return 0; // Already paid, no due amount
    }
    return total;
  };

  // Check if parts are approved or not
  const isPartsApproved = () => {
    return partsApprovalStatus === 'partstatusapprove';
  };

  const isPartsPending = () => {
    return partsApprovalStatus === 'partstatusnew' || partsApprovalStatus === 'partstatusconfirm';
  };

  const isPartsRejected = () => {
    return partsApprovalStatus === 'partstatusreject';
  };

  const completeBooking = async () => {
    try {
      // Check if parts are pending approval
      if (isPartsPending()) {
        Toast.show({
          type: 'warning',
          text1: 'Parts Approval Pending',
          text2: 'Cannot complete booking while parts approval is pending',
        });
        return;
      }
      
      setCompletingBooking(true);
      
      const data = {
        bookingId: bookingData?.bookingId,
        servicemanBookingId: bookingData?._id,
        paymentMode: cashCollected,
        cashAmount: cashCollected ? parseFloat(cashAmount) : 0,
        additionalItems: additionalParts.map(part => ({
          serviceItemId: part.serviceItemId,
          rateId: part.rateId,
          description: part.description,
          unitPrice: part.unitPrice,
          quantity: part.quantity,
          totalPrice: part.unitPrice * part.quantity
        })),
        totalAmount: calculateTotalAmount(),
        dueAmount: calculateDueAmount(),
        partsIncluded: additionalParts.length > 0,
        partsAmount: partsAmount,
        originalServiceAmount: originalServiceAmount
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

  // Render parts approval status
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
      <View 
        style={clsx(styles.mb4, styles.p3, styles.roundedLg)} 
        // style={{ backgroundColor: statusConfig.bg }}
        >
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

  // Render parts details
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
            
            {/* Parts Status - Show if parts are involved */}
            {partsApprovalStatus && renderPartsStatus()}
            
            {/* Parts Details - Show if parts are added */}
            {renderPartsDetails()}

            {/* Payment Summary */}
            <View style={clsx(styles.mb6, styles.p4, styles.bgGray50, styles.roundedLg)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
                Payment Summary
              </Text>
              
              <View style={clsx(styles.mb3)}>
                {/* Original Service Amount */}
                <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                  <Text style={clsx(styles.textBase, styles.textBlack)}>Original Service Amount:</Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    ₹{originalServiceAmount}
                  </Text>
                </View>
                
                {/* Additional Parts Amount - Show if parts exist */}
                {partsAmount > 0 && (
                  <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                    <Text style={clsx(styles.textBase, styles.textBlack)}>Additional Parts Amount:</Text>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textPrimary)}>
                      + ₹{partsAmount}
                    </Text>
                  </View>
                )}
                
                {/* Total Amount */}
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
                  disabled={isPartsPending()}
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
                    cashCollected ? styles.borderSuccess : styles.borderGray,
                    isPartsPending() && styles.bgGray300
                  )}>
                    {cashCollected && <Icon name="check" size={16} color={colors.white} />}
                  </View>
                  <Text style={clsx(
                    styles.textBase,
                    styles.fontMedium,
                    styles.textBlack,
                    isPartsPending() && styles.textGray500
                  )}>
                    Cash Collected
                    {isPartsPending() && ' (Wait for parts approval)'}
                  </Text>
                </TouchableOpacity>
                
                {cashCollected && !isPartsPending() && (
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
                      editable={!completingBooking && !isPartsPending()}
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
                {additionalParts.length > 0 && "3. Verify parts have been installed properly\n"}
                4. Customer satisfaction should be confirmed{"\n"}
                5. Click "Complete Booking" to finish the service
                {isPartsPending() && "\n\n⚠️ Cannot complete booking while parts approval is pending"}
              </Text>
            </View>

            {/* Complete Button */}
            <TouchableOpacity
              style={clsx(
                isPartsPending() ? styles.bgWarning : styles.bgSuccess,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                (completingBooking || isPartsPending()) && styles.opacity50
              )}
              onPress={completeBooking}
              disabled={completingBooking || isPartsPending()}
            >
              {completingBooking ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                    {isPartsPending() ? 'Parts Approval Pending' : 'Complete Booking'}
                  </Text>
                  {isPartsPending() && (
                    <Text style={clsx(styles.textWhite, styles.textSm, styles.textCenter, styles.mt1)}>
                      Wait for customer approval before completing
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