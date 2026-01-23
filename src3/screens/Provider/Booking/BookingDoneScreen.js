import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';

const BookingDoneScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    bookingData,
    formattedData,
    loadBookingDetails
  } = route.params || {};

  const { Toast, Urls, postData, UploadUrl, imageCheck } = useContext(AppContext);
  
  const [loading, setLoading] = useState(false);
  const [partsApprovalStatus, setPartsApprovalStatus] = useState(null);
  const [additionalParts, setAdditionalParts] = useState([]);
  const [partsAmount, setPartsAmount] = useState(0);
  const [originalServiceAmount, setOriginalServiceAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    if (bookingData) {
      initializeData();
    }
  }, [bookingData]);

  const initializeData = () => {
    try {
      // Extract booking data
      const booking = bookingData?.booking || {};
      const user = bookingData?.user || {};
      
      
      
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
      const bookingItems = booking?.bookingItems || [];
      let originalAmt = 0;
      bookingItems.forEach(item => {
        const itemPrice = item.salePrice || 0;
        const itemQuantity = item.quantity || 1;
        originalAmt += itemPrice * itemQuantity;
      });
      setOriginalServiceAmount(originalAmt);
      
      // Set grand total
      setGrandTotal(originalAmt + partsTotal);
      
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };

  const handleBack = () => {
    // Navigate back to Bookings screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Bookings' }],
    });
  };

  const handleDone = async () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Bookings' }],
    });
  };

  const renderSuccessAnimation = () => (
    <View style={clsx(styles.itemsCenter, styles.mb8)}>
      <View style={[clsx(styles.roundedFull, styles.p6, styles.mb4), 
        { backgroundColor: colors.success + '20' }
      ]}>
        <Icon name="check-circle" size={80} color={colors.success} />
      </View>
      <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess, styles.mb2)}>
        Ready to Complete!
      </Text>
      <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter)}>
        All service work is done. Ready to mark this booking as complete.
      </Text>
    </View>
  );

  const renderBookingSummary = () => (
    <View style={clsx(styles.mb6, styles.p4, styles.bgGray50, styles.roundedLg)}>
      <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
        Booking Summary
      </Text>
      
      <View style={clsx(styles.mb3)}>
        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
          <Text style={clsx(styles.textBase, styles.textMuted, styles.flex1)}>Booking ID:</Text>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
            {formattedData?.bookingId || 'N/A'}
          </Text>
        </View>
        
        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
          <Text style={clsx(styles.textBase, styles.textMuted, styles.flex1)}>Customer:</Text>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
            {formattedData?.customerName || 'N/A'}
          </Text>
        </View>
      </View>
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
          >
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold)}>
            Complete Booking Done
          </Text>
        </View>
      </View>

      <ScrollView 
        style={clsx(styles.flex1)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.pb24)}
      >
        <View style={clsx(styles.p6)}>
          
          {/* Success Animation */}
          {renderSuccessAnimation()}
          
          {/* Booking Summary */}
          {renderBookingSummary()}
          
          {/* Done Button */}
          <TouchableOpacity
            style={clsx(
              styles.bgSuccess,
              styles.roundedLg,
              styles.p4,
              styles.itemsCenter,
              styles.justifyCenter,
              loading && styles.opacity50
            )}
            onPress={handleDone}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Text style={clsx(styles.textWhite, styles.fontBold, styles.textLg)}>
                  Done
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default BookingDoneScreen;