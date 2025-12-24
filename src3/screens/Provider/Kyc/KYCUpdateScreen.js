import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

import { navigate, reset } from '../../../navigation/navigationService';

const KYCUpdateScreen = ({ navigation, route }) => {
  const {
    Toast,
    Urls,
    postData,
    UploadUrl,
    fetchProfile,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [kycDataLoaded, setKycDataLoaded] = useState(false);
  
  // Initial KYC data
  const initialKYCData = {
    bankName: '',
    branchName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    panCardNumber: '',
    aadharCardNumber: '',
    gstNumber: '',
    passbookOrCheque: null,
    panCardImage: null,
    aadharFrontImage: null,
    aadharBackImage: null,
    shopImage: null,
  };

  const [formData, setFormData] = useState(initialKYCData);
  const [errors, setErrors] = useState({});

  // Fetch KYC data
  const fetchKYCData = async () => {
    try {
      const response = await postData({}, Urls.kycDetail, 'GET', { showErrorMessage: false, showSuccessMessage: false });
      if (response?.success) {
        const apiData = response.data || {};
        
        // Transform API response to match formData structure
        setFormData({
          bankName: apiData.bankName || '',
          branchName: apiData.branchName || '',
          accountNumber: apiData.accountNumber || '',
          confirmAccountNumber: apiData.accountNumber || '', // For confirmation field
          ifscCode: apiData.ifscCode || '',
          panCardNumber: apiData.panCardNumber || '',
          aadharCardNumber: apiData.aadharCardNumber || '', 
          gstNumber: apiData.gstNumber || '',
          // Use UploadUrl for all image fields
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
        });
        
        // If KYC data is also passed via route params, use it (overrides API data)
        if (route.params?.kycData) {
          setFormData(prev => ({ ...prev, ...route.params.kycData }));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching KYC data:', error);
      // If API fails but route params exist, use them
      if (route.params?.kycData) {
        setFormData(route.params.kycData);
      }
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
      //   text1: 'KYC data refreshed',
      //   text2: 'Latest data loaded successfully',
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

  const validateForm = () => {
    const newErrors = {};

    // Bank Details Validation
    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{9,18}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Enter a valid account number (9-18 digits)';
    }

    if (!formData.confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = 'Please confirm account number';
    } else if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'Enter a valid IFSC code';
    }

    // PAN Card Validation
    if (!formData.panCardNumber.trim()) {
      newErrors.panCardNumber = 'PAN card number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panCardNumber.toUpperCase())) {
      newErrors.panCardNumber = 'Enter a valid PAN card number';
    }

    // Aadhar Card Validation
    if (!formData.aadharCardNumber.trim()) {
      newErrors.aadharCardNumber = 'Aadhar card number is required';
    } else if (!/^\d{12}$/.test(formData.aadharCardNumber)) {
      newErrors.aadharCardNumber = 'Enter a valid 12-digit Aadhar number';
    }

    // GST Number Validation (Optional but validate if entered)
    if (formData.gstNumber.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber.toUpperCase())) {
      newErrors.gstNumber = 'Enter a valid GST number';
    }

    // Image Validation
    if (!formData.passbookOrCheque) {
      newErrors.passbookOrCheque = 'Passbook or Cheque image is required';
    }

    if (!formData.panCardImage) {
      newErrors.panCardImage = 'PAN card image is required';
    }

    if (!formData.aadharFrontImage) {
      newErrors.aadharFrontImage = 'Aadhar front image is required';
    }

    if (!formData.aadharBackImage) {
      newErrors.aadharBackImage = 'Aadhar back image is required';
    }

    if (!formData.shopImage) {
      newErrors.shopImage = 'Shop/Workplace image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePicker = async (field) => {
    try {
      const options = {
        mediaType: 'photo',
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
      };

      ImagePicker.launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to pick image',
          });
        } else if (response.assets && response.assets[0]) {
          const image = response.assets[0];
          
          // Check file size (max 5MB)
          if (image.fileSize > 5 * 1024 * 1024) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Image size should be less than 5MB',
            });
            return;
          }

          setFormData({
            ...formData,
            [field]: {
              uri: image.uri,
              type: image.type || 'image/jpeg',
              name: image.fileName || `${field}_${Date.now()}.jpg`,
            }
          });

          // Clear error for this field
          if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
          }
        }
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to open image picker',
      });
    }
  };

  const handleCameraCapture = async (field) => {
    try {
      const options = {
        mediaType: 'photo',
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        saveToPhotos: true,
        cameraType: 'back',
      };

      ImagePicker.launchCamera(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.error) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to capture image',
          });
        } else if (response.assets && response.assets[0]) {
          const image = response.assets[0];
          
          // Check file size (max 5MB)
          if (image.fileSize > 5 * 1024 * 1024) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Image size should be less than 5MB',
            });
            return;
          }

          setFormData({
            ...formData,
            [field]: {
              uri: image.uri,
              type: image.type || 'image/jpeg',
              name: image.fileName || `${field}_${Date.now()}.jpg`,
            }
          });

          // Clear error for this field
          if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
          }
        }
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to open camera',
      });
    }
  };

  const handleUpdateKYC = async () => {
    // if (!validateForm()) {
    //   Alert.alert('Validation Error', 'Please fix the errors in the form');
    //   return;
    // }

    setLoading(true);

    try {
      // Prepare FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('bankName', formData.bankName);
      formDataToSend.append('branchName', formData.branchName);
      formDataToSend.append('accountNumber', formData.accountNumber);
      formDataToSend.append('confirmAccountNumber', formData.confirmAccountNumber);
      formDataToSend.append('ifscCode', formData.ifscCode.toUpperCase());
      formDataToSend.append('panCardNumber', formData.panCardNumber.toUpperCase());
      formDataToSend.append('aadharCardNumber', formData.aadharCardNumber);
      formDataToSend.append('gstNumber', formData.gstNumber);
      
      // Add image files if they exist
      const imageFields = [
        'passbookOrCheque',
        'panCardImage',
        'aadharFrontImage',
        'aadharBackImage',
        'shopImage'
      ];
      
      imageFields.forEach(field => {
        if (formData[field] && formData[field].uri) {
          // Check if it's a local file or remote URL
          const isLocalFile = formData[field].uri.startsWith('file://') || 
                              formData[field].uri.startsWith('content://');
          
          if (isLocalFile) {
            // It's a local file selected from gallery/camera
            formDataToSend.append(field, {
              uri: formData[field].uri,
              type: formData[field].type || 'image/jpeg',
              name: formData[field].name || `${field}.jpg`,
            });
          } else {
            // It's a remote URL from API (already uploaded)
            // Don't append to formData if it's already on server
            // Just send the URL if your backend expects it
            formDataToSend.append(`${field}Url`, formData[field].uri);
          }
        }
      });

      console.log('Updating KYC with data...');
      console.log('FormData to send:', formDataToSend);

      const response = await postData(formDataToSend, Urls.kycUpdate, 'POST', { 
        showErrorMessage: true,
        isFileUpload: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: response.message || 'KYC updated successfully',
        });
        
        // Refresh data after successful update
        await fetchKYCData();

        await fetchProfile();
      
        navigate('KYCStatus');
      } else {
        Alert.alert('Error', response?.message || 'Failed to update KYC');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update KYC. Please try again.',
      });
      console.error('KYC Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (label, field, placeholder, options = {}) => {
    const {
      keyboardType = 'default',
      multiline = false,
      editable = true,
      secureTextEntry = false,
      maxLength,
      autoCapitalize = 'sentences',
    } = options;

    return (
      <View style={clsx(styles.mb4)}>
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
          {label}
        </Text>
        <TextInput
          style={clsx(
            styles.input,
            errors[field] && styles.borderError,
            !editable && styles.bgGray,
            multiline && { minHeight: 80, textAlignVertical: 'top' }
          )}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={formData[field]}
          onChangeText={(text) => {
            setFormData({ ...formData, [field]: text });
            if (errors[field]) {
              setErrors({ ...errors, [field]: '' });
            }
          }}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={editable}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
        />
        {errors[field] && (
          <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
            {errors[field]}
          </Text>
        )}
      </View>
    );
  };

  const renderImageUploadField = (field, label) => {
    return (
      <View style={clsx(styles.mb4)}>
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
          {label}
        </Text>
        
        {formData[field] ? (
          <View style={clsx(styles.mb2)}>
            <Image
              source={{ uri: formData[field].uri }}
              style={[
                {width: '100%', height: 192},  // ✅ Hardcode dimensions for proper display
                styles.roundedLg, 
                styles.bgGray
              ]}
              resizeMode="cover"
            />
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mt2)}>
              <TouchableOpacity
                style={clsx(styles.flexRow, styles.itemsCenter)}
                onPress={() => setFormData({ ...formData, [field]: null })}
              >
                <Icon name="delete" size={20} color={colors.error} />
                <Text style={clsx(styles.textSm, styles.textError, styles.ml2)}>
                  Remove
                </Text>
              </TouchableOpacity>
              
              <View style={clsx(styles.flexRow)}>
                <TouchableOpacity
                  style={clsx(styles.flexRow, styles.itemsCenter, styles.mr4)}
                  onPress={() => handleImagePicker(field)}
                >
                  <Icon name="edit" size={20} color={colors.primary} />
                  <Text style={clsx(styles.textSm, styles.textPrimary, styles.ml2)}>
                    Change
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={clsx(styles.border2, styles.borderDashed, styles.borderGray, styles.roundedLg, styles.p4)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween)}>
              <TouchableOpacity
                style={clsx(styles.flex1, styles.mr2, styles.itemsCenter, styles.p3, styles.bgPrimary, styles.rounded)}
                onPress={() => handleImagePicker(field)}
              >
                <Icon name="photo-library" size={24} color={colors.white} />
                <Text style={clsx(styles.textSm, styles.textWhite, styles.mt1)}>
                  Gallery
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={clsx(styles.flex1, styles.ml2, styles.itemsCenter, styles.p3, styles.bgSecondary, styles.rounded)}
                onPress={() => handleCameraCapture(field)}
              >
                <Icon name="camera-alt" size={24} color={colors.white} />
                <Text style={clsx(styles.textSm, styles.textWhite, styles.mt1)}>
                  Camera
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {errors[field] && (
          <Text style={clsx(styles.textSm, styles.textError, styles.mt1)}>
            {errors[field]}
          </Text>
        )}
      </View>
    );
  };

  if (!kycDataLoaded && loading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading KYC data...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={clsx(styles.flex1, styles.bgSurface)}
    >
      <Header
        title="Update KYC Details"
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
        contentContainerStyle={clsx(styles.px4, styles.pb6)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="Pull to refresh"
            titleColor={colors.textMuted}
          />
        }
      >
        {/* Refresh Status Indicator */}
        {refreshing && (
          <View style={clsx(styles.py2, styles.itemsCenter)}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={clsx(styles.textSm, styles.textPrimary, styles.mt1)}>
              Refreshing KYC data...
            </Text>
          </View>
        )}

        {/* Bank Details */}
        <View style={clsx(styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Bank Account Details
          </Text>

          {renderInputField('Bank Name', 'bankName', 'Enter bank name')}
          
          {renderInputField('Branch Name', 'branchName', 'Enter branch name')}
          
          {renderInputField('Account Number', 'accountNumber', 'Enter account number', {
            keyboardType: 'number-pad',
            maxLength: 18,
          })}
          
          {renderInputField('Confirm Account Number', 'confirmAccountNumber', 'Re-enter account number', {
            keyboardType: 'number-pad',
            maxLength: 18,
          })}
          
          {renderInputField('IFSC Code', 'ifscCode', 'Enter IFSC code', {
            autoCapitalize: 'characters',
            maxLength: 11,
          })}

          {/* Passbook or Cheque Image */}
          {renderImageUploadField('passbookOrCheque', 'Passbook/Cheque Image')}
        </View>

        {/* PAN Card Details */}
        <View style={clsx(styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            PAN Card Details
          </Text>

          {renderInputField('PAN Card Number', 'panCardNumber', 'Enter PAN card number', {
            autoCapitalize: 'characters',
            maxLength: 10,
          })}

          {/* PAN Card Image */}
          {renderImageUploadField('panCardImage', 'PAN Card Image')}
        </View>

        {/* Aadhar Card Details */}
        <View style={clsx(styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Aadhar Card Details
          </Text>

          {renderInputField('Aadhar Card Number', 'aadharCardNumber', 'Enter 12-digit Aadhar number', {
            keyboardType: 'number-pad',
            maxLength: 12,
          })}

          {/* Aadhar Front Image */}
          {renderImageUploadField('aadharFrontImage', 'Aadhar Front Side Image')}

          {/* Aadhar Back Image */}
          {renderImageUploadField('aadharBackImage', 'Aadhar Back Side Image')}
        </View>

        {/* GST Details */}
        <View style={clsx(styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            GST Details (Optional)
          </Text>

          {renderInputField('GST Number', 'gstNumber', 'Enter GST number', {
            autoCapitalize: 'characters',
            maxLength: 15,
          })}
        </View>

        {/* Shop/Workplace Image */}
        <View style={clsx(styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Shop/Workplace Verification
          </Text>

          {renderImageUploadField('shopImage', 'Shop/Workplace Image')}
          
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
            Please upload a clear photo of your shop or workplace for verification
          </Text>
        </View>

        {/* Important Notes */}
        <View style={clsx(styles.mt6, styles.p4, styles.bgWarningLight, styles.roundedLg)}>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textWarning, styles.mb2)}>
            Important Notes:
          </Text>
          <Text style={clsx(styles.textSm, styles.textWarning)}>
            • All images should be clear and readable
            {'\n'}• File size should not exceed 5MB
            {'\n'}• Supported formats: JPG, PNG
            {'\n'}• Ensure all documents are valid and not expired
          </Text>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={clsx(
            styles.button,
            styles.mt6,
            (loading || refreshing) && styles.opacity50
          )}
          onPress={handleUpdateKYC}
          disabled={loading || refreshing}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={clsx(styles.buttonText)}>
              Update KYC Details
            </Text>
          )}
        </TouchableOpacity>

        
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
 
export default KYCUpdateScreen;