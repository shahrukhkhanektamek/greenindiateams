import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

const KYCStatusScreen = ({ navigation }) => {
  const {
    Toast,
    Urls,
    postData,
    fetchProfile,
    user,
  } = useContext(AppContext);

  console.log(user.trainingScheduleSubmit.trainingScheduleStatus)
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [status, setStatus] = useState('pending'); // pending, approved, rejected

  const fetchKYCStatus = async () => {
    try {
      const response = await postData({}, Urls.kycDetail, 'GET', { showErrorMessage: false, showSuccessMessage:false });
      
      if (response?.success) {
        const apiData = response.data || {};
        setKycData(apiData);
        
        // Status ko set karein based on API response
        // Assuming API returns status field like: pending, approved, rejected
        const kycStatus = apiData.status || 'pending';
        // const kycStatus = 'approved';

        fetchProfile()

        setStatus(kycStatus);
        
        return true;
      } else {
        // If API fails, show pending status
        setStatus('pending');
        return false;
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      setStatus('pending');
      return false;
    }
  };

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    setLoading(true);
    await fetchKYCStatus();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchKYCStatus();
    setRefreshing(false);
    // Toast.show({
    //   type: 'success',
    //   text1: 'Status refreshed',
    //   text2: 'Latest KYC status loaded',
    // });
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: 'check-circle',
          iconColor: colors.success,
          title: 'KYC Approved',
          message: 'Your KYC verification has been successfully approved.',
          bgColor: colors.successLight,
          textColor: colors.success,
          buttonText: user.trainingScheduleSubmit.trainingScheduleStatus=='Complete'?'Update Kyc':'Go To Training',
          buttonAction: () => user.trainingScheduleSubmit.trainingScheduleStatus=='Complete'?navigation.navigate('KycScreen'):navigation.navigate('Training'),
        };
      
      case 'rejected':
        return {
          icon: 'cancel',
          iconColor: colors.error,
          title: 'KYC Rejected',
          message: kycData?.remarks || 'Your KYC verification has been rejected. Please update your details.',
          bgColor: colors.errorLight,
          textColor: colors.error,
          buttonText: 'Update KYC',
          buttonAction: () => navigation.navigate('KycScreen'),
        };
      
      case 'pending':
      default:
        return {
          icon: 'pending',
          iconColor: colors.warning,
          title: 'KYC Pending',
          message: 'Your KYC verification is under review. Please wait for approval.',
          bgColor: colors.warningLight,
          textColor: colors.warning,
          buttonText: 'Check Status',
          buttonAction: onRefresh,
        };
    }
  };

  if (loading) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading KYC status...
        </Text>
      </View>
    );
  }

  const statusConfig = getStatusConfig();

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="KYC Status"
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
        contentContainerStyle={clsx(styles.px4, styles.py-6, styles.flexGrow)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Status Card */}
        <View style={clsx(
          styles.mt8,
          styles.p6,
          styles.roundedXl,
          styles.itemsCenter,
          { backgroundColor: statusConfig.bgColor }
        )}>
          {/* Status Icon */}
          <View style={clsx(
            styles.p4,
            styles.roundedFull,
            styles.mb4,
            { backgroundColor: `${statusConfig.iconColor}20` } // 20 = 12% opacity
          )}>
            <Icon 
              name={statusConfig.icon} 
              size={64} 
              color={statusConfig.iconColor} 
            />
          </View>

          {/* Status Title */}
          <Text style={clsx(
            styles.text2xl,
            styles.fontBold,
            styles.mb3,
            { color: statusConfig.textColor }
          )}>
            {statusConfig.title}
          </Text>

          {/* Status Message */}
          <Text style={clsx(
            styles.textBase,
            styles.textCenter,
            styles.textGray,
            styles.mb6
          )}>
            {statusConfig.message}
          </Text>

          {/* Last Updated */}
          {kycData?.updatedAt && (
            <View style={clsx(styles.mb6, styles.itemsCenter)}>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                Last updated:
              </Text>
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                {new Date(kycData.updatedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={clsx(
              styles.button,
              styles.px6,
              { backgroundColor: statusConfig.iconColor }
            )}
            onPress={statusConfig.buttonAction}
            disabled={refreshing}
          >
            <Text style={clsx(styles.buttonText)}>
              {statusConfig.buttonText}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info Section */}
        <View style={clsx(styles.mt8, styles.p4, styles.bgGray, styles.roundedLg)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            What happens next?
          </Text>
          
          {status === 'pending' && (
            <View>
              <Text style={clsx(styles.textBase, styles.textGray, styles.mb2)}>
                • Our team is reviewing your documents
              </Text>
              <Text style={clsx(styles.textBase, styles.textGray, styles.mb2)}>
                • You will receive a notification once approved
              </Text>
              <Text style={clsx(styles.textBase, styles.textGray)}>
                • Usually takes 24-48 hours
              </Text>
            </View>
          )}
          
          {status === 'approved' && (
            <View>
              <Text style={clsx(styles.textBase, styles.textGray, styles.mb2)}>
                • You can now access all features
              </Text>
              <Text style={clsx(styles.textBase, styles.textGray, styles.mb2)}>
                • Your account is fully verified
              </Text>
              <Text style={clsx(styles.textBase, styles.textGray)}>
                • You can update KYC anytime if needed
              </Text>
            </View>
          )}
          
          {status === 'rejected' && (
            <View>
              <Text style={clsx(styles.textBase, styles.textGray, styles.mb2)}>
                • Please update incorrect information
              </Text>
              <Text style={clsx(styles.textBase, styles.textGray, styles.mb2)}>
                • Upload clear documents
              </Text>
              <Text style={clsx(styles.textBase, styles.textGray)}>
                • Resubmit for review
              </Text>
            </View>
          )}
        </View>

        {/* Contact Support */}
        <TouchableOpacity
          style={clsx(
            styles.mt6,
            styles.p4,
            styles.border,
            styles.borderPrimary,
            styles.roundedLg,
            styles.itemsCenter,
            styles.flexRow,
            styles.justifyCenter
          )}
          onPress={() => navigation.navigate('Support')}
        >
          <Icon name="help" size={20} color={colors.primary} />
          <Text style={clsx(styles.textBase, styles.textPrimary, styles.ml2)}>
            Need Help? Contact Support
          </Text>
        </TouchableOpacity>
      </ScrollView>

    </View>
  );
};

export default KYCStatusScreen;