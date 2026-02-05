import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';
import { navigate } from '../../../navigation/navigationService';

const EarningScreen = ({ navigation }) => {
  const {
    Toast,
    Urls,
    postData,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Fetch earnings summary data
  const fetchEarningsSummary = async () => {
    try {
      setLoading(true);
      
      const response = await postData({}, Urls.myEarnings, 'GET', { 
        showErrorMessage: false 
      });
      
      if (response?.success) {
        console.log('Earnings Summary API Response:', response);
        setSummaryData(response.data);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Earnings data loaded successfully',
        });
      } else {
        Alert.alert('Error', response?.message || 'Failed to fetch earnings data');
        setSummaryData(null);
      }
      
    } catch (error) {
      console.error('Fetch earnings error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch earnings data',
      });
      setSummaryData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarningsSummary();
  };

  useEffect(() => {
    fetchEarningsSummary();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getMonthShortName = (monthName) => {
    const months = {
      'January': 'Jan',
      'February': 'Feb',
      'March': 'Mar',
      'April': 'Apr',
      'May': 'May',
      'June': 'Jun',
      'July': 'Jul',
      'August': 'Aug',
      'September': 'Sep',
      'October': 'Oct',
      'November': 'Nov',
      'December': 'Dec'
    };
    return months[monthName] || monthName.substring(0, 3);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return styles.textSuccess;
      case 'pending':
        return styles.textWarning;
      case 'failed':
        return styles.textError;
      default:
        return styles.textMuted;
    }
  };

  const getStatusBg = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return styles.bgSuccessLight;
      case 'pending':
        return styles.bgWarningLight;
      case 'failed':
        return styles.bgErrorLight;
      default:
        return styles.bgGray;
    }
  };

  const renderMonthWiseEarnings = () => {
    if (!summaryData?.monthWiseEarning) return null;

    const currentMonthIndex = new Date().getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get last 6 months including current
    const recentMonths = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      const monthData = summaryData.monthWiseEarning.find(
        item => getMonthShortName(item.month) === months[monthIndex]
      );
      recentMonths.push({
        name: months[monthIndex],
        amount: monthData?.amount || 0
      });
    }

    return (
      <View style={clsx(styles.mb6)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
          Earned this month
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={clsx(styles.mb4)}
        >
          {recentMonths.map((month, index) => (
            <View 
              key={index} 
              style={clsx(
                styles.mr3, 
                styles.p3, 
                styles.bgWhite, 
                styles.roundedLg, 
                styles.shadowSm,
                styles.minW24,
                styles.itemsCenter
              )}
            >
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary, styles.mb1)}>
                {month.name}
              </Text>
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textSuccess)}>
                {formatCurrency(month.amount)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderBankTransfers = () => {
    if (!summaryData?.bankTransfer || summaryData.bankTransfer.length === 0) {
      return (
        <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm, styles.mb4)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted, styles.textCenter)}>
            No bank transfers found
          </Text>
        </View>
      );
    }

    return (
      <View style={clsx(styles.mb6)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
          Bank transfers
        </Text>
        
        {summaryData.bankTransfer.map((transfer, index) => (
          <View 
            key={transfer._id || index} 
            style={clsx(
              styles.bgWhite, 
              styles.p4, 
              styles.roundedLg, 
              styles.shadowSm, 
              styles.mb3
            )}
          >
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
              <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
                {formatCurrency(transfer.amount)}
              </Text>
              <View style={clsx(
                styles.px3, 
                styles.py1, 
                styles.roundedFull, 
                getStatusBg(transfer.paymentStatus)
              )}>
                <Text style={clsx(
                  styles.textXs, 
                  styles.fontMedium, 
                  getStatusColor(transfer.paymentStatus)
                )}>
                  {transfer.paymentStatus?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
              <Icon name="calendar-today" size={16} color={colors.textMuted} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                {formatDate(transfer.fromDate)} - {formatDate(transfer.toDate)}
              </Text>
            </View>
            
            {transfer.paymentMode && (
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <Icon name="payment" size={16} color={colors.textMuted} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  {transfer.paymentMode?.toUpperCase()} Transfer
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderPendingDeductions = () => {
    return (
      <View style={clsx(styles.mb6)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
          PENDING DEDUCTIONS
        </Text>
        
        <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm)}>
          <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
            {formatCurrency(0)}
          </Text>
        </View>
      </View>
    );
  };

  const renderSummaryCards = () => {
    if (!summaryData?.totals) return null;

    const totals = summaryData.totals;
    
    return (
      <View style={clsx(styles.mb6)}>
        <View style={clsx(
          styles.bgPrimary, 
          styles.p4, 
          styles.roundedLg, 
          styles.shadowSm,
          styles.mb4
        )}>
          <Text style={clsx(styles.textSm, styles.fontMedium, styles.textWhite, styles.mb1)}>
            Total Earnings
          </Text>
          <Text style={clsx(styles.text3xl, styles.fontBold, styles.textWhite)}>
            {formatCurrency(totals.totalEarningAmount)}
          </Text>
        </View>

        <View style={clsx(styles.flexRow, styles.flexWrap, styles.justifyBetween)}>
          {/* Received Earnings */}
          <View style={clsx(
            styles.bgSuccessLight, 
            styles.p3, 
            styles.roundedLg, 
            styles.flexBasis48,
            styles.mb3
          )}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb1)}>
              <Icon name="check-circle" size={16} color={colors.success} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                Received
              </Text>
            </View>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
              {formatCurrency(totals.receivedEarningAmount)}
            </Text>
          </View>

          {/* Remaining Earnings */}
          <View style={clsx(
            styles.bgWarningLight, 
            styles.p3, 
            styles.roundedLg, 
            styles.flexBasis48,
            styles.mb3
          )}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb1)}>
              <Icon name="pending" size={16} color={colors.warning} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                Remaining
              </Text>
            </View>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textWarning)}>
              {formatCurrency(totals.remainingEarningAmount)}
            </Text>
          </View>

          {/* This Month */}
          <View style={clsx(
            styles.bgInfoLight, 
            styles.p3, 
            styles.roundedLg, 
            styles.flexBasis48,
            styles.mb3
          )}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb1)}>
              <Icon name="calendar-month" size={16} color={colors.info} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                This Month
              </Text>
            </View>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo)}>
              {formatCurrency(totals.thisMonthEarningAmount)}
            </Text>
          </View>

          {/* Last 3 Months */}
          <View style={clsx(
            styles.bgPrimaryLight, 
            styles.p3, 
            styles.roundedLg, 
            styles.flexBasis48,
            styles.mb3
          )}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb1)}>
              <Icon name="trending-up" size={16} color={colors.primary} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                Last 3 Months
              </Text>
            </View>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
              {formatCurrency(totals.lastThreeMonthEarningAmount)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textMuted, styles.mt3)}>
          Loading earnings data...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Money"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        rightActionIcon="settings"
        showProfile={false}
        onRightActionPress={() => navigation.navigate('Settings')}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={clsx(styles.px4, styles.pb6, styles.pt2)}
      >
        {/* Main Summary */}
        {renderSummaryCards()}

        {/* Horizontal line separator */}
        <View style={clsx(styles.h1, styles.bgGrayLight, styles.my4)} />

        {/* Earned this month section */}
        {renderMonthWiseEarnings()}

        {/* Bank transfers section */}
        {renderBankTransfers()}

        

        
      </ScrollView>
    </View>
  );
};

export default EarningScreen;