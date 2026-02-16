import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BarChart } from 'react-native-chart-kit';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';
import { navigate, navigationRef } from '../../../navigation/navigationService';

const EarningScreen = ({ navigation }) => {
  const {
    Toast,
    Urls,
    postData,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const screenWidth = Dimensions.get('window').width;

  // Fetch earnings summary data
  const fetchEarningsSummary = async () => {
    try {
      setLoading(true);
      
      const response = await postData({}, Urls.myEarnings, 'GET', { 
        showErrorMessage: false,
        showSuccessMessage: false 
      });
      
      if (response?.success) {
        console.log('Earnings Summary API Response:', response);
        setSummaryData(response.data);
        
        // Toast.show({
        //   type: 'success',
        //   text1: 'Success',
        //   text2: 'Earnings data loaded successfully',
        // });
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

  const renderChart = () => {
    if (!summaryData?.monthWiseEarning) return null;

    // Get current month index (0-based)
    const currentMonthIndex = new Date().getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Get current month and previous 3 months (total 4 months)
    const lastFourMonths = [];
    for (let i = 3; i >= 0; i--) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      const monthName = monthNames[monthIndex];
      const monthData = summaryData.monthWiseEarning.find(
        item => item.month === monthName
      );
      lastFourMonths.push({
        month: monthName,
        amount: monthData?.amount || 0
      });
    }

    // Prepare chart data
    const monthLabels = lastFourMonths.map(item => 
      getMonthShortName(item.month)
    );
    
    const earningsData = lastFourMonths.map(item => item.amount);

    const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
      : '46, 125, 50'; // Default to primary color RGB
  };

  const darkenHexColor = (hex, percent = 30) => {
    let num = parseInt(hex.replace("#", ""), 16);
    let r = (num >> 16) - Math.round(2.55 * percent);
    let g = ((num >> 8) & 0x00FF) - Math.round(2.55 * percent);
    let b = (num & 0x0000FF) - Math.round(2.55 * percent);

    r = r < 0 ? 0 : r;
    g = g < 0 ? 0 : g;
    b = b < 0 ? 0 : b;

    return `${r}, ${g}, ${b}`;
  };

  const darkPrimaryRgb = darkenHexColor(colors.primary, 35);

  const primaryRgb = hexToRgb(colors.primary);

    // Chart configuration - Remove left Y-axis labels
    const chartConfig = {
      backgroundColor: colors.white,
      backgroundGradientFrom: colors.white,
      backgroundGradientTo: colors.white,
      decimalPlaces: 0,

      color: (opacity = 1) => `rgba(${darkPrimaryRgb}, ${opacity})`,
      labelColor: (opacity = 1) => colors.textMuted,

      style: {
        borderRadius: 16,
      },

      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: `rgba(${darkPrimaryRgb},1)`,
      },

      propsForBackgroundLines: {
        strokeDasharray: '',
        stroke: `rgba(${darkPrimaryRgb},0.2)`,
      },

      fillShadowGradient: `rgba(${darkPrimaryRgb},1)`,
      fillShadowGradientOpacity: 0.5,

      formatYLabel: () => '',
      propsForVerticalLabels: {
        fontSize: 11,
      },
      propsForHorizontalLabels: {
        fontSize: 0,
      },
    };


    const data = {
      labels: monthLabels,
      datasets: [{
        data: earningsData,
      }]
    };

    const chartWidth = screenWidth - 48;

    return (
      <View style={clsx(styles.mb6)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
          Last 4 Months Earnings
        </Text>

        <View style={clsx(
          styles.bgWhite, 
          styles.p4, 
          styles.roundedLg, 
          styles.shadowSm,
          styles.itemsCenter
        )}>
          <BarChart
          data={data}
          width={chartWidth + 20} // Add extra width to push content
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero={true}
          showValuesOnTopOfBars={true}
          withInnerLines={false}
          withHorizontalLabels={false} // Completely disable horizontal labels
          withVerticalLabels={true}
          style={{
            marginVertical: 8,
            borderRadius: 16,
            marginLeft: -60, // Negative margin to remove left space
            paddingLeft: 0,
          }}
          yAxisLabel=""
          yAxisSuffix=""
          xAxisLabel=""
          segments={4}
          yLabelsOffset={0}
          xLabelsOffset={-10}
        />
        </View>
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
      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
          Recent Bank Transfers
        </Text>
        
        <TouchableOpacity
          onPress={() => navigate('BankTransferListScreen')}
          style={clsx(
            styles.flexRow,
            styles.itemsCenter,
            styles.px3,
            styles.py2,
            styles.bgPrimaryLight,
            styles.roundedFull
          )}
        >
          <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary, styles.mr1)}>
            View All
          </Text>
          <Icon name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {summaryData.bankTransfer.slice(0, 2).map((transfer, index) => (
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

  const renderSummaryCards = () => {
    if (!summaryData?.totals) return null;

    const totals = summaryData.totals;
    
    return (
      <View style={clsx(styles.mb6)}>
        <TouchableOpacity style={clsx(
          styles.bgPrimary, 
          styles.p4, 
          styles.roundedLg, 
          styles.shadowSm,
          styles.mb4
        )}
        onPress={()=> navigate('EarningHistory')}
        >
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textWhite, styles.mb1)}>
              Total Earnings
            </Text>
            <Text style={clsx(styles.text3xl, styles.fontBold, styles.textWhite)}>
              {formatCurrency(totals.totalEarningAmount)}
            </Text>
        </TouchableOpacity>

        <View style={clsx(styles.flexRow, styles.flexWrap, styles.justifyBetween)}>
          {/* Received Earnings */}
          <View style={clsx(
            styles.bgSuccessLight, 
            styles.p3, 
            styles.roundedLg, 
            styles.w45,
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
            styles.w45,
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
            styles.w45,
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
            styles.w45,
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

          {/* Pending Deducrtion */}
          <View style={clsx(
            styles.bgPrimary, 
            styles.p3, 
            styles.roundedLg, 
            styles.w12_12,
            styles.mb3
          )}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb1)}>
              <Icon name="trending-up" size={16} color={colors.white} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textWhite)}>
                Pending Deduction
              </Text>
            </View>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textWhite)}>
              {formatCurrency(totals.cashCollectedSubmitPending)}
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
        title="Earnings"
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

        {/* Chart Section */}
        {renderChart()}

        {/* Bank transfers section */}
        {renderBankTransfers()}
      </ScrollView>
    </View>
  );
};

export default EarningScreen;