import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';
import { navigate } from '../../../navigation/navigationService';

const EarningHistoryScreen = ({ navigation }) => {
  const {
    Toast,
    Urls,
    postData,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch earnings history
  const fetchEarningsHistory = async (page = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const response = await postData({ 
        page, 
        limit: 10 
      }, Urls.myEarningsHistory, 'GET', { 
        showErrorMessage: false,
        showSuccessMessage: false 
      });
      
      if (response?.success) {
        console.log('Earnings History API Response:', response);
        
        if (isLoadMore) {
          setHistoryData(prev => [...prev, ...response.data]);
        } else {
          setHistoryData(response.data);
          setSummary(response.summary);
        }
        
        setPagination({
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
          hasNextPage: response.hasNextPage,
          hasPrevPage: response.hasPrevPage,
        });
        
      } else {
        Alert.alert('Error', response?.message || 'Failed to fetch earnings history');
        if (!isLoadMore) {
          setHistoryData([]);
        }
      }
      
    } catch (error) {
      console.error('Fetch earnings history error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch earnings history',
      });
      if (!isLoadMore) {
        setHistoryData([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarningsHistory(1, false);
  };

  const loadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchEarningsHistory(pagination.page + 1, true);
    }
  };

  useEffect(() => {
    fetchEarningsHistory();
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

  const formatTime = (timeString) => {
    return timeString || 'N/A';
  };

  const getPaymentModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'online':
        return 'payment';
      case 'cash':
        return 'money';
      default:
        return 'account-balance-wallet';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'complete':
      case 'completed':
        return styles.textSuccess;
      case 'pending':
        return styles.textWarning;
      case 'cancelled':
      case 'cancel':
        return styles.textError;
      default:
        return styles.textMuted;
    }
  };

  const getStatusBg = (status) => {
    switch (status?.toLowerCase()) {
      case 'complete':
      case 'completed':
        return styles.bgSuccessLight;
      case 'pending':
        return styles.bgWarningLight;
      case 'cancelled':
      case 'cancel':
        return styles.bgErrorLight;
      default:
        return styles.bgGray;
    }
  };

  const getPayoutStatusColor = (status) => {
    return status ? styles.textSuccess : styles.textWarning;
  };

  const getPayoutStatusBg = (status) => {
    return status ? styles.bgSuccessLight : styles.bgWarningLight;
  };

  const renderHeader = () => {
     return null;
  };

  const renderBookingItems = (items) => {
    if (!items || items.length === 0) return null;

    return (
      <View style={clsx(styles.mt2, styles.pt2, styles.borderTop, styles.borderGrayLight)}>
        <Text style={clsx(styles.textSm, styles.fontMedium, styles.textMuted, styles.mb2)}>
          Services:
        </Text>
        {items.map((item, idx) => (
          <View key={idx} style={clsx(styles.mb2)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween)}>
              <View style={clsx(styles.flex1, styles.mr2)}>
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                  {item.service?.name || 'Service'}
                </Text>
                <Text style={clsx(styles.textXs, styles.textMuted)}>
                  Qty: {item.quantity} × {formatCurrency(item.salePrice)}
                </Text>
              </View>
              <Text style={clsx(styles.textSm, styles.fontBold, styles.textBlack)}>
                {formatCurrency(item.salePrice * item.quantity)}
              </Text>
            </View>

            {/* Additional Parts */}
            {item.additionalParts && item.additionalParts.length > 0 && (
              <View style={clsx(styles.ml3, styles.mt1)}>
                <Text style={clsx(styles.textXs, styles.fontMedium, styles.textMuted)}>
                  Additional Parts:
                </Text>
                {item.additionalParts.map((part, pIdx) => (
                  <View key={pIdx} style={clsx(styles.flexRow, styles.justifyBetween, styles.mt1)}>
                    <Text style={clsx(styles.textXs, styles.textMuted, styles.flex1)}>
                      {part.description}
                    </Text>
                    <Text style={clsx(styles.textXs, styles.textBlack)}>
                      {formatCurrency(part.price || 0)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderHistoryItem = ({ item }) => {
    const booking = item.booking || {};
    const servicemanBooking = item.servicemanBooking || {};
    const customer = item.customer || {};
    
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        // onPress={() => navigate('EarningDetailScreen', { earningId: item._id, data: item })}
        style={clsx(
          styles.bgWhite,
          styles.p4,
          styles.roundedLg,
          styles.shadowSm,
          styles.mb3
        )}
      >
        {/* Header with Booking ID and Status */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
          <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary)}>
            {booking.bookingId || 'N/A'}
          </Text>
          <View style={clsx(
            styles.px2, 
            styles.py1, 
            styles.roundedFull, 
            getStatusBg(booking.status)
          )}>
            <Text style={clsx(
              styles.textXs, 
              styles.fontMedium, 
              getStatusColor(booking.status)
            )}>
              {booking.status?.toUpperCase() || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Amount and Payment Mode */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
          <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
            {formatCurrency(item.payableAmount || booking.payableAmount)}
          </Text>
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <Icon 
              name={getPaymentModeIcon(servicemanBooking.paymentMode || booking.paymentMode)} 
              size={16} 
              color={colors.textMuted} 
              style={clsx(styles.mr1)} 
            />
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              {(servicemanBooking.paymentMode || booking.paymentMode || 'N/A').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Date and Time */}
        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
          <Icon name="calendar-today" size={14} color={colors.textMuted} style={clsx(styles.mr1)} />
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mr3)}>
            {formatDate(booking.scheduleDate)}
          </Text>
          <Icon name="access-time" size={14} color={colors.textMuted} style={clsx(styles.mr1)} />
          <Text style={clsx(styles.textSm, styles.textMuted)}>
            {booking.scheduleTime || 'N/A'}
          </Text>
        </View>

        {/* Customer Info */}
        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
          <Icon name="person" size={14} color={colors.textMuted} style={clsx(styles.mr1)} />
          <Text style={clsx(styles.textSm, styles.textMuted, styles.flex1)}>
            {customer.name || 'N/A'} • {customer.mobile || 'N/A'}
          </Text>
        </View>

        {/* Payout Status */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <Icon 
              name={item.payoutStatus ? 'check-circle' : 'hourglass-empty'} 
              size={14} 
              color={item.payoutStatus ? colors.success : colors.warning} 
              style={clsx(styles.mr1)} 
            />
            <Text style={clsx(
              styles.textXs,
              styles.fontMedium,
              getPayoutStatusColor(item.payoutStatus)
            )}>
              Payout: {item.payoutStatus ? 'Completed' : 'Pending'}
            </Text>
          </View>
          <Text style={clsx(styles.textXs, styles.textMuted)}>
            Earning: {formatCurrency(item.earningAmount || 0)}
          </Text>
        </View>

        {/* Booking Items (Collapsible - shown on press of detail screen) */}
        {renderBookingItems(item.bookingItems)}
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={clsx(styles.py10, styles.itemsCenter)}>
      <Icon name="history" size={64} color={colors.grayLight} />
      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted, styles.mt3)}>
        No transaction history found
      </Text>
      <TouchableOpacity
        onPress={onRefresh}
        style={clsx(
          styles.mt4,
          styles.px4,
          styles.py2,
          styles.bgPrimary,
          styles.roundedFull
        )}
      >
        <Text style={clsx(styles.textSm, styles.fontMedium, styles.textWhite)}>
          Refresh
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={clsx(styles.py4, styles.itemsCenter)}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={clsx(styles.textXs, styles.textMuted, styles.mt2)}>
          Loading more...
        </Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textMuted, styles.mt3)}>
          Loading earnings history...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Earnings History"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        showProfile={false}
      />

      <FlatList
        data={historyData}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item._id}
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
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
};

export default EarningHistoryScreen;