import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

const KYCViewScreen = ({ navigation, route }) => {
  const {
    Toast,
    Urls,
    postData,
    UploadUrl,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [kycDataLoaded, setKycDataLoaded] = useState(false);
  
  // KYC data state
  const [kycData, setKycData] = useState({
    bankName: '',
    branchName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    panCardNumber: '',
    aadharCardNumber: '',
    gstNumber: '',
    passbookOrCheque: null,
    panCardImage: null,
    aadharFrontImage: null,
    aadharBackImage: null,
    shopImage: null,
    kycStatus: '',
    verifiedBy: '',
    verificationDate: '',
    remarks: '',
  });

  // Fetch KYC data
  const fetchKYCData = async () => {
    try {
      const response = await postData({}, Urls.kycDetail, 'GET', { 
        showErrorMessage: false, 
        showSuccessMessage: false 
      });
      
      if (response?.success) {
        const apiData = response.data || {};
        
        // Transform API response
        setKycData({
          bankName: apiData.bankName || 'Not provided',
          branchName: apiData.branchName || 'Not provided',
          accountHolderName: apiData.accountHolderName || 'Not provided',
          accountNumber: apiData.accountNumber ? `****${apiData.accountNumber.slice(-4)}` : 'Not provided',
          ifscCode: apiData.ifscCode || 'Not provided',
          panCardNumber: apiData.panCardNumber || 'Not provided',
          aadharCardNumber: apiData.aadharCardNumber ? `****${apiData.aadharCardNumber.slice(-4)}` : 'Not provided',
          gstNumber: apiData.gstNumber || 'Not provided',
          // Use UploadUrl for images
          passbookOrCheque: apiData.passbookOrCheque ? { 
            uri: `${UploadUrl}${apiData.passbookOrCheque}` 
          } : null,
          panCardImage: apiData.panCardImage ? { 
            uri: `${UploadUrl}${apiData.panCardImage}` 
          } : null,
          aadharFrontImage: apiData.aadharFrontImage ? { 
            uri: `${UploadUrl}${apiData.aadharFrontImage}` 
          } : null,
          aadharBackImage: apiData.aadharBackImage ? { 
            uri: `${UploadUrl}${apiData.aadharBackImage}` 
          } : null,
          shopImage: apiData.shopImage ? { 
            uri: `${UploadUrl}${apiData.shopImage}` 
          } : null,
          kycStatus: apiData.kycStatus || 'pending',
          verifiedBy: apiData.verifiedBy || 'Not verified yet',
          verificationDate: apiData.verificationDate || 'Not available',
          remarks: apiData.remarks || 'No remarks',
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching KYC data:', error);
      return false;
    }
  };

  // Initial load
  useEffect(() => {
    loadKYCData();
  }, []);

  const loadKYCData = async () => {
    setLoading(true);
    try {
      await fetchKYCData();
    } finally {
      setLoading(false);
      setKycDataLoaded(true);
    }
  };

  // Refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchKYCData();
      // Toast.show({
      //   type: 'success',
      //   text1: 'Refreshed',
      //   text2: 'KYC data updated',
      // });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Refresh failed',
        text2: 'Could not refresh KYC data',
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return colors.success;
      case 'rejected': return colors.error;
      case 'pending': return colors.warning;
      default: return colors.textMuted;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending Review';
      default: return 'Unknown';
    }
  };

  const renderInfoField = (label, value) => {
    return (
      <View style={clsx(styles.mb4)}>
        <Text style={clsx(styles.textSm, styles.fontMedium, styles.textMuted, styles.mb1)}>
          {label}
        </Text>
        <View style={clsx(styles.p3, styles.bgGray, styles.rounded)}>
          <Text style={clsx(styles.textBase, styles.textBlack)}>
            {value || 'Not provided'}
          </Text>
        </View>
      </View>
    );
  };

  const renderImageField = (label, imageUri) => {
    return (
      <View style={clsx(styles.mb4)}>
        <Text style={clsx(styles.textSm, styles.fontMedium, styles.textMuted, styles.mb2)}>
          {label}
        </Text>
        
        {imageUri ? (
          <TouchableOpacity
            // onPress={() => navigation.navigate('ImageView', { uri: imageUri, title: label })}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: imageUri }}
              style={[
                {width: '100%', height: 200},
                styles.roundedLg, 
                styles.bgGray
              ]}
              resizeMode="cover"
            />
            {/* <View style={clsx(styles.flexRow, styles.justifyCenter, styles.itemsCenter, styles.mt2)}>
              <Icon name="zoom-in" size={20} color={colors.primary} />
              <Text style={clsx(styles.textSm, styles.textPrimary, styles.ml2)}>
                Tap to view full image
              </Text>
            </View> */}
          </TouchableOpacity>
        ) : (
          <View style={clsx(styles.p4, styles.bgGray, styles.roundedLg, styles.itemsCenter, styles.justifyCenter)}>
            <Icon name="image-not-supported" size={40} color={colors.textMuted} />
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2)}>
              No image uploaded
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (!kycDataLoaded && loading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading KYC details...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="KYC Details"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        rightActionIcon="refresh"
        showProfile={false}
        onRightActionPress={onRefresh}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.px4, styles.pb8)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Refresh Status Indicator */}
        {refreshing && (
          <View style={clsx(styles.py2, styles.itemsCenter)}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={clsx(styles.textSm, styles.textPrimary, styles.mt1)}>
              Refreshing...
            </Text>
          </View>
        )}

        
        {/* Bank Details */}
        <View style={clsx(styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Bank Account Details
          </Text>

          {renderInfoField('Bank Name', kycData.bankName)}
          {renderInfoField('Branch Name', kycData.branchName)}
          {renderInfoField('Account Holder Name', kycData.accountHolderName)}
          {renderInfoField('Account Number', kycData.accountNumber)}
          {renderInfoField('IFSC Code', kycData.ifscCode)}

          {/* Passbook or Cheque Image */}
          {renderImageField('Passbook/Cheque', kycData.passbookOrCheque?.uri)}
        </View>

        {/* PAN Card Details */}
        <View style={clsx(styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            PAN Card Details
          </Text>

          {renderInfoField('PAN Card Number', kycData.panCardNumber)}

          {/* PAN Card Image */}
          {renderImageField('PAN Card', kycData.panCardImage?.uri)}
        </View>

        {/* Aadhar Card Details */}
        <View style={clsx(styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Aadhar Card Details
          </Text>

          {renderInfoField('Aadhar Card Number', kycData.aadharCardNumber)}

          {/* Aadhar Images */}
          {renderImageField('Aadhar Front Side', kycData.aadharFrontImage?.uri)}
          {renderImageField('Aadhar Back Side', kycData.aadharBackImage?.uri)}
        </View>

        {/* GST Details */}
        {kycData.gstNumber && (
          <View style={clsx(styles.mt6)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
              GST Details
            </Text>
            {renderInfoField('GST Number', kycData.gstNumber)}
          </View>
        )}

        {/* Shop/Workplace Image */}
        <View style={clsx(styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Shop/Workplace Verification
          </Text>
          {renderImageField('Shop/Workplace', kycData.shopImage?.uri)}
        </View>

       

       
      </ScrollView>
    </View>
  );
};

export default KYCViewScreen;