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
  const [loadingMore, setLoadingMore] = useState(false);
  const [earnings, setEarnings] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [summary, setSummary] = useState({
    totalEarning: 0,
    totalPayable: 0,
    totalRecords: 0,
  });

  // Fetch earnings data
  const fetchEarnings = async (page = 1, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await postData({ page, limit: 10 }, Urls.myEarnings, 'GET', { 
        showErrorMessage: false 
      });
      
      if (response?.success) {
        console.log('Earnings API Response:', response);
        
        const earningsData = response.data || [];
        
        if (isLoadMore) {
          // Append new data for load more
          setEarnings(prev => [...prev, ...earningsData]);
        } else {
          // Replace data for initial load or refresh
          setEarnings(earningsData);
        }
        
        // Set summary data
        if (response.summary) {
          setSummary(response.summary);
        }
        
        // Set pagination data
        if (response.pagination) {
          setPagination(response.pagination);
        }
        
        // Show success message if data loaded
        if (earningsData.length > 0 && !isLoadMore) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Earnings data loaded successfully',
          });
        }
      } else {
        if (!isLoadMore) {
          Alert.alert('Error', response?.message || 'Failed to fetch earnings data');
          setEarnings([]);
        }
      }
      
    } catch (error) {
      console.error('Fetch earnings error:', error);
      if (!isLoadMore) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to fetch earnings data',
        });
        setEarnings([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarnings(1, false);
  };

  const loadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      const nextPage = pagination.page + 1;
      fetchEarnings(nextPage, true);
    }
  };

  useEffect(() => {
    fetchEarnings(1, false);
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

  const getBookingStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'complete':
        return styles.textSuccess;
      case 'pending':
        return styles.textWarning;
      case 'cancelled':
        return styles.textError;
      default:
        return styles.textMuted;
    }
  };

  const getBookingStatusBg = (status) => {
    switch (status?.toLowerCase()) {
      case 'complete':
        return styles.bgSuccessLight;
      case 'pending':
        return styles.bgWarningLight;
      case 'cancelled':
        return styles.bgErrorLight;
      default:
        return styles.bgGray;
    }
  };

  const renderEarningCard = (earning) => {
    const booking = earning.booking || {};
    const service = earning.service || {};
    
    return (
      <View key={earning._id} style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm, styles.mb3)}>
        {/* Booking ID and Status */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.flex1)}>
            <Icon name="receipt" size={20} color={colors.primary} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.flex1)} numberOfLines={1}>
              {booking.bookingId || 'N/A'}
            </Text>
          </View>
          <View style={clsx(styles.px3, styles.py1, styles.roundedFull, getBookingStatusBg(booking.status))}>
            <Text style={clsx(styles.textXs, styles.fontMedium, getBookingStatusColor(booking.status))}>
              {booking.status ? booking.status.toUpperCase() : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Service Details */}
        <View style={clsx(styles.mb3)}>
          <Text style={clsx(styles.textSm, styles.fontMedium, styles.textMuted, styles.mb1)}>
            Service Details
          </Text>
          
          {service.items?.map((item, index) => (
            <View key={index} style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
              <Text style={clsx(styles.textSm, styles.textBlack)} numberOfLines={1}>
                {item.serviceName || 'Service'} ×{item.quantity || 1}
              </Text>
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary)}>
                {formatCurrency(item.total || 0)}
              </Text>
            </View>
          ))}
          
          {/* Additional Parts */}
          {service.additionalParts?.length > 0 && (
            <View style={clsx(styles.mt2, styles.pt2, styles.borderT, styles.borderGrayLight)}>
              <Text style={clsx(styles.textXs, styles.fontMedium, styles.textMuted, styles.mb1)}>
                Additional Parts
              </Text>
              {service.additionalParts.map((part, index) => (
                <View key={index} style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                  <Text style={clsx(styles.textXs, styles.textBlack)} numberOfLines={1}>
                    {part.partName || 'Part'}
                  </Text>
                  <Text style={clsx(styles.textXs, styles.fontMedium, styles.textWarning)}>
                    {formatCurrency(part.price || 0)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Amount Breakdown */}
        <View style={clsx(styles.bgGray, styles.p3, styles.roundedLg, styles.mb3)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
            <Text style={clsx(styles.textSm, styles.textBlack)}>
              Service Amount:
            </Text>
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
              {formatCurrency(service.bookingAmount || 0)}
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
            <Text style={clsx(styles.textSm, styles.textBlack)}>
              GST ({booking.gstPercent || 0}%):
            </Text>
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textError)}>
              {formatCurrency(booking.gstAmount || 0)}
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
            <Text style={clsx(styles.textSm, styles.textBlack)}>
              Total Payable:
            </Text>
            <Text style={clsx(styles.textSm, styles.fontBold, styles.textSuccess)}>
              {formatCurrency(earning.payableAmount || booking.payableAmount || 0)}
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.pt2, styles.borderT, styles.borderGrayLight)}>
            <View>
              <Text style={clsx(styles.textSm, styles.fontBold, styles.textPrimary)}>
                Your Earnings
              </Text>
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                ({earning.earningPercent || 0}% of total)
              </Text>
            </View>
            <View style={clsx(styles.itemsEnd)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textSuccess)}>
                {formatCurrency(earning.earningAmount || 0)}
              </Text>
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                {earning.payoutStatus ? 'Paid' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
          <View>
            <Text style={clsx(styles.textXs, styles.textMuted)}>
              Booking Date
            </Text>
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
              {formatDate(booking.createdAt)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={clsx(styles.px3, styles.py2, styles.bgPrimary, styles.roundedFull)}
            onPress={() => handleViewDetails(earning)}
          >
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textWhite)}>
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={clsx(styles.py4, styles.itemsCenter)}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
          Loading more earnings...
        </Text>
      </View>
    );
  };

  const handleViewDetails = (earning) => {
    navigation.navigate('EarningDetails', { earning });
  };

  const handleWithdraw = () => {
    navigate('ProviderDashboard');
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
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
          
          if (isCloseToBottom && pagination.hasNextPage && !loadingMore) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
        contentContainerStyle={clsx(styles.px4, styles.pb6, styles.pt2)}
      >
        {/* Total Earnings Summary */}
        <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm, styles.mb4)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Earnings Summary
            </Text>
            <Icon name="monetization-on" size={24} color={colors.success} />
          </View>
          
          <View style={clsx(styles.mb4)}>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess, styles.textCenter)}>
              {formatCurrency(summary.totalEarning || 0)}
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
              Total Earnings
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween)}>
            <View style={clsx(styles.itemsCenter, styles.flex1)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
                {formatCurrency(summary.totalPayable || 0)}
              </Text>
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                Total Booking Value
              </Text>
            </View>
            
            <View style={clsx(styles.itemsCenter, styles.flex1, styles.borderL, styles.borderGrayLight)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo)}>
                {summary.totalRecords || 0}
              </Text>
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                Total Bookings
              </Text>
            </View>
            
            <View style={clsx(styles.itemsCenter, styles.flex1, styles.borderL, styles.borderGrayLight)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textWarning)}>
                {formatCurrency((summary.totalEarning || 0) / (summary.totalRecords || 1))}
              </Text>
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                Avg. Per Booking
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb4)}>
          <View style={clsx(styles.bgPrimaryLight, styles.p3, styles.roundedLg, styles.flex1, styles.mr2)}>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
              {pagination.page}
            </Text>
            <Text style={clsx(styles.textXs, styles.textBlack)}>
              Current Page
            </Text>
          </View>
          
          <View style={clsx(styles.bgInfoLight, styles.p3, styles.roundedLg, styles.flex1, styles.mx2)}>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo)}>
              {earnings.length}
            </Text>
            <Text style={clsx(styles.textXs, styles.textBlack)}>
              Loaded Records
            </Text>
          </View>
          
          <View style={clsx(styles.bgSuccessLight, styles.p3, styles.roundedLg, styles.flex1, styles.ml2)}>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
              {pagination.total}
            </Text>
            <Text style={clsx(styles.textXs, styles.textBlack)}>
              Total Records
            </Text>
          </View>
        </View>

        {/* Earning Records */}
        <View style={clsx(styles.mb4)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Earnings History
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Page {pagination.page} of {pagination.totalPages}
            </Text>
          </View>

          {earnings.length === 0 ? (
            <View style={clsx(styles.bgWhite, styles.p6, styles.roundedLg, styles.itemsCenter)}>
              <Icon name="monetization-on" size={48} color={colors.textMuted} />
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted, styles.mt3)}>
                No earnings records found
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2, styles.textCenter)}>
                Complete bookings to see your earnings
              </Text>
              <TouchableOpacity
                style={clsx(styles.mt4, styles.px4, styles.py2, styles.bgPrimary, styles.roundedFull)}
                onPress={() => fetchEarnings(1, false)}
              >
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textWhite)}>
                  Refresh
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {earnings.map(renderEarningCard)}
              
              {/* Load More Button */}
              {pagination.hasNextPage && !loadingMore && (
                <TouchableOpacity
                  style={clsx(styles.bgPrimaryLight, styles.p3, styles.roundedLg, styles.itemsCenter, styles.mt-3)}
                  onPress={loadMore}
                >
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    <Icon name="expand-more" size={20} color={colors.primary} style={clsx(styles.mr2)} />
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textPrimary)}>
                      Load More ({pagination.total - earnings.length} remaining)
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              
              {renderFooter()}
              
              {/* Summary Card */}
              <View style={clsx(styles.bgSuccessLight, styles.p4, styles.roundedLg, styles.mt4)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                  <Icon name="assessment" size={20} color={colors.success} />
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess, styles.ml2)}>
                    Summary
                  </Text>
                </View>
                <View style={clsx(styles.pl1)}>
                  <Text style={clsx(styles.textSm, styles.textBlack, styles.mb1)}>
                    • Total bookings: {summary.totalRecords || 0}
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textBlack, styles.mb1)}>
                    • Total booking value: {formatCurrency(summary.totalPayable || 0)}
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textBlack, styles.mb1)}>
                    • Your total earnings: {formatCurrency(summary.totalEarning || 0)}
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textBlack)}>
                    • Average earnings per booking: {formatCurrency((summary.totalEarning || 0) / (summary.totalRecords || 1))}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Withdraw Button */}
        <TouchableOpacity
          style={clsx(
            styles.button,
            styles.mt4,
            earnings.length === 0 && styles.opacity50
          )}
          onPress={handleWithdraw}
          disabled={earnings.length === 0 || loading}
        >
          <View style={clsx(styles.flexRow, styles.justifyCenter, styles.itemsCenter)}>
            <Icon name="account-balance-wallet" size={20} color={colors.white} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.buttonText)}>
              Go Back Dashboard
            </Text>
          </View>
        </TouchableOpacity>

        {/* Info Message */}
        <View style={clsx(styles.mt4, styles.p3, styles.bgInfoLight, styles.roundedLg)}>
          <Text style={clsx(styles.textSm, styles.textInfo)}>
            <Icon name="info" size={16} color={colors.info} />{' '}
            Note: Earnings are calculated based on completed bookings. Payout status shows if earnings have been paid out.
          </Text>
          <Text style={clsx(styles.textXs, styles.textInfo, styles.mt1)}>
            Scroll to bottom to load more records automatically or tap "Load More" button.
          </Text>
        </View>
      </ScrollView>
    </View>
  ); 
};

export default EarningScreen;