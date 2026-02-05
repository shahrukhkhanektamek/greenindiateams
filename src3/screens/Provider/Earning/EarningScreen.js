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
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'
  const screenWidth = Dimensions.get('window').width - 32;
  const chartHeight = 200;
  const barWidth = 28;

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
    
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatShortCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(0)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}k`;
    }
    return `₹${amount}`;
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

  const renderCustomBarChart = () => {
    if (!summaryData?.monthWiseEarning) return null;

    const monthData = summaryData.monthWiseEarning;
    const maxAmount = Math.max(...monthData.map(item => item.amount));
    const scaleFactor = chartHeight / (maxAmount || 1);

    return (
      <View style={clsx(styles.mt4)}>
        {/* Y-axis labels */}
        <View style={clsx(styles.absolute, styles.left0, styles.top0, styles.bottom0, styles.w10, styles.justifyBetween)}>
          {[100, 75, 50, 25, 0].map((percent, index) => (
            <View key={index} style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                {formatShortCurrency((percent / 100) * maxAmount)}
              </Text>
              <View style={clsx(styles.h1, styles.w4, styles.bgGrayLight, styles.ml1)} />
            </View>
          ))}
        </View>

        {/* Bars and X-axis */}
        <View style={clsx(styles.ml10, styles.pb6)}>
          {/* Bars */}
          <View style={clsx(styles.flexRow, styles.itemsEnd, styles.h48)}>
            {monthData.map((item, index) => {
              const barHeight = (item.amount * scaleFactor) || 1;
              return (
                <View 
                  key={index} 
                  style={clsx(
                    styles.mx1, 
                    styles.relative,
                    styles.itemsCenter,
                    { flex: 1 }
                  )}
                >
                  {/* Bar */}
                  <View 
                    style={[
                      clsx(
                        styles.bgPrimary, 
                        styles.roundedT, 
                        styles.wFull,
                        styles.minH1,
                        styles.relative
                      ),
                      { height: barHeight }
                    ]}
                  >
                    {/* Bar value on hover/tap */}
                    <TouchableOpacity
                      style={clsx(styles.absolute, styles.bottomFull, styles.left0, styles.right0)}
                    >
                      <View style={clsx(
                        styles.bgBlack, 
                        styles.px2, 
                        styles.py1, 
                        styles.roundedSm,
                        styles.mb1,
                        styles.itemsCenter
                      )}>
                        <Text style={clsx(styles.textXs, styles.textWhite, styles.fontBold)}>
                          {formatCurrency(item.amount)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  
                  {/* X-axis label */}
                  <Text style={clsx(styles.textXs, styles.textMuted, styles.mt2, styles.textCenter)}>
                    {getMonthShortName(item.month)}
                  </Text>
                </View>
              );
            })}
          </View>
          
          {/* X-axis line */}
          <View style={clsx(styles.h1, styles.bgGrayLight, styles.mt2)} />
        </View>
      </View>
    );
  };

  const renderCustomLineChart = () => {
    if (!summaryData?.monthWiseEarning) return null;

    const monthData = summaryData.monthWiseEarning;
    const maxAmount = Math.max(...monthData.map(item => item.amount));
    const scaleFactor = chartHeight / (maxAmount || 1);
    const totalWidth = screenWidth - 40;
    const pointSpacing = totalWidth / (monthData.length - 1);

    // Calculate points for line
    const points = monthData.map((item, index) => ({
      x: index * pointSpacing + (barWidth / 2),
      y: chartHeight - (item.amount * scaleFactor),
      amount: item.amount
    }));

    // Create SVG-like line path (using View with border)
    return (
      <View style={clsx(styles.mt4)}>
        {/* Y-axis labels */}
        <View style={clsx(styles.absolute, styles.left0, styles.top0, styles.bottom0, styles.w10, styles.justifyBetween)}>
          {[100, 75, 50, 25, 0].map((percent, index) => (
            <View key={index} style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                {formatShortCurrency((percent / 100) * maxAmount)}
              </Text>
              <View style={clsx(styles.h1, styles.w4, styles.bgGrayLight, styles.ml1)} />
            </View>
          ))}
        </View>

        {/* Chart area */}
        <View style={clsx(styles.ml10, styles.pb6, styles.h48)}>
          {/* Grid lines */}
          <View style={clsx(styles.absolute, styles.top0, styles.bottom0, styles.right0, styles.left0)}>
            {[0, 25, 50, 75, 100].map((percent, index) => (
              <View 
                key={index}
                style={[
                  clsx(styles.absolute, styles.left0, styles.right0, styles.h1, styles.bgGrayLight),
                  { top: `${percent}%` }
                ]}
              />
            ))}
          </View>

          {/* Line connecting points */}
          <View style={clsx(styles.absolute, styles.top0, styles.bottom0, styles.right0, styles.left0)}>
            {points.map((point, index) => {
              if (index < points.length - 1) {
                const nextPoint = points[index + 1];
                const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
                const length = Math.sqrt(
                  Math.pow(nextPoint.x - point.x, 2) + 
                  Math.pow(nextPoint.y - point.y, 2)
                );
                
                return (
                  <View
                    key={`line-${index}`}
                    style={[
                      clsx(styles.absolute, styles.bgPrimary, styles.h1),
                      {
                        left: point.x,
                        top: point.y,
                        width: length,
                        transform: [{ rotate: `${angle}deg` }],
                        transformOrigin: '0 0',
                      }
                    ]}
                  />
                );
              }
              return null;
            })}
          </View>

          {/* Data points */}
          <View style={clsx(styles.absolute, styles.top0, styles.bottom0, styles.right0, styles.left0)}>
            {points.map((point, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  clsx(
                    styles.absolute, 
                    styles.bgWhite, 
                    styles.border2, 
                    styles.borderPrimary, 
                    styles.roundedFull,
                    styles.itemsCenter,
                    styles.justifyCenter
                  ),
                  {
                    left: point.x - 8,
                    top: point.y - 8,
                    width: 16,
                    height: 16,
                  }
                ]}
              >
                <View style={clsx(styles.bgPrimary, styles.roundedFull, styles.w2, styles.h2)} />
                
                {/* Tooltip on press */}
                <View style={clsx(
                  styles.absolute, 
                  styles.bottomFull, 
                  styles.mb2,
                  styles.bgBlack, 
                  styles.px2, 
                  styles.py1, 
                  styles.roundedSm,
                  styles.itemsCenter
                )}>
                  <Text style={clsx(styles.textXs, styles.textWhite, styles.fontBold)}>
                    {formatCurrency(point.amount)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* X-axis labels */}
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mtAuto)}>
            {monthData.map((item, index) => (
              <Text 
                key={index} 
                style={[
                  clsx(styles.textXs, styles.textMuted),
                  { width: pointSpacing, textAlign: 'center' }
                ]}
              >
                {getMonthShortName(item.month)}
              </Text>
            ))}
          </View>
        </View>

        {/* X-axis line */}
        <View style={clsx(styles.h1, styles.bgGrayLight, styles.mt2)} />
      </View>
    );
  };

  const renderChart = () => {
    if (!summaryData?.monthWiseEarning) return null;

    return (
      <View style={clsx(styles.mb6)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
            Monthly Earnings Trend
          </Text>
          
          <View style={clsx(styles.flexRow, styles.bgGrayLight, styles.roundedFull, styles.p1)}>
            <TouchableOpacity
              onPress={() => setChartType('bar')}
              style={clsx(
                styles.px3,
                styles.py1,
                chartType === 'bar' ? styles.bgPrimary : null,
                styles.roundedFull
              )}
            >
              <Icon 
                name="bar-chart" 
                size={18} 
                color={chartType === 'bar' ? colors.white : colors.textMuted} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setChartType('line')}
              style={clsx(
                styles.px3,
                styles.py1,
                chartType === 'line' ? styles.bgPrimary : null,
                styles.roundedFull
              )}
            >
              <Icon 
                name="show-chart" 
                size={18} 
                color={chartType === 'line' ? colors.white : colors.textMuted} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={clsx(
          styles.bgWhite, 
          styles.p4, 
          styles.roundedLg, 
          styles.shadowSm,
          styles.relative
        )}>
          {/* Chart Type */}
          {chartType === 'bar' ? renderCustomBarChart() : renderCustomLineChart()}

          {/* Legend */}
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween, styles.mt6)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <View 
                style={clsx(
                  styles.w4, 
                  styles.h4, 
                  chartType === 'bar' ? styles.bgPrimary : styles.border2, 
                  chartType === 'bar' ? null : styles.borderPrimary,
                  styles.roundedSm,
                  styles.mr2
                )} 
              />
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                Monthly Earnings
              </Text>
            </View>
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary)}>
              Total: {formatCurrency(summaryData.totals?.totalEarningAmount || 0)}
            </Text>
          </View>

          {/* Statistics */}
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mt4, styles.pt4, styles.borderT, styles.borderGrayLight)}>
            <View style={clsx(styles.itemsCenter)}>
              <Text style={clsx(styles.textXs, styles.textMuted)}>Highest</Text>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
                {formatCurrency(Math.max(...summaryData.monthWiseEarning.map(item => item.amount)))}
              </Text>
            </View>
            <View style={clsx(styles.itemsCenter)}>
              <Text style={clsx(styles.textXs, styles.textMuted)}>Average</Text>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
                {formatCurrency(
                  summaryData.monthWiseEarning.reduce((sum, item) => sum + item.amount, 0) / 
                  summaryData.monthWiseEarning.length
                )}
              </Text>
            </View>
            <View style={clsx(styles.itemsCenter)}>
              <Text style={clsx(styles.textXs, styles.textMuted)}>This Month</Text>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo)}>
                {formatCurrency(summaryData.totals?.thisMonthEarningAmount || 0)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
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
        amount: monthData?.amount || 0,
        fullMonth: monthData?.month || ''
      });
    }

    return (
      <View style={clsx(styles.mb6)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
          Last 6 Months
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={clsx(styles.mb4)}
        >
          {recentMonths.map((month, index) => (
            <TouchableOpacity
              key={index} 
              style={clsx(
                styles.mr3, 
                styles.p3, 
                styles.bgWhite, 
                styles.roundedLg, 
                styles.shadowSm,
                styles.minW24,
                styles.itemsCenter,
                month.amount > 0 ? styles.border2 : null,
                month.amount > 0 ? styles.borderPrimary : null
              )}
            >
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary, styles.mb1)}>
                {month.name}
              </Text>
              <Text style={clsx(
                styles.textSm, 
                styles.fontMedium, 
                month.amount > 0 ? styles.textSuccess : styles.textMuted
              )}>
                {formatCurrency(month.amount)}
              </Text>
              {month.amount > 0 && (
                <View style={clsx(styles.bgSuccess, styles.px2, styles.py1, styles.roundedFull, styles.mt2)}>
                  <Icon name="trending-up" size={12} color={colors.white} />
                </View>
              )}
            </TouchableOpacity>
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

        {/* Chart Section */}
        {renderChart()}

        {/* Earned this month section */}
        {renderMonthWiseEarnings()}

        {/* Bank transfers section */}
        {renderBankTransfers()}
      </ScrollView>
    </View>
  );
};

export default EarningScreen;