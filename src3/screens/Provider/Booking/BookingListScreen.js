import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';
import Header from '../../../components/Common/Header';

const BookingListScreen = ({ navigation }) => {
  const {
    Toast,
    Urls,
    postData,
  } = useContext(AppContext);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, upcoming, completed, cancelled, new
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });

  const tabs = [
    { id: 'all', label: 'All', status: 'all' },
    { id: 'new', label: 'New', status: 'new' },
    { id: 'upcoming', label: 'Upcoming', status: 'upcoming' },
    { id: 'completed', label: 'Completed', status: 'completed' },
    { id: 'cancelled', label: 'Cancelled', status: 'cancelled' },
  ];

  const serviceTypes = [
    { id: 'all', label: 'All Services' },
    { id: 'ac', label: 'AC Services' },
    { id: 'cleaning', label: 'Cleaning' },
    { id: 'plumbing', label: 'Plumbing' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'water', label: 'Water Purifier' },
  ];

  const dateRanges = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: 'low', label: '₹0 - ₹1000' },
    { id: 'medium', label: '₹1000 - ₹3000' },
    { id: 'high', label: '₹3000+' },
  ];

  const [selectedFilters, setSelectedFilters] = useState({
    serviceType: 'all',
    dateRange: 'all',
    priceRange: 'all',
  });

  const fetchBookings = async (page = 1, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      if (isLoadMore) setLoadingMore(true);

      const params = {
        page,
        limit: 10,
      };

      // Add status filter if not 'all'
      if (activeTab !== 'all') {
        params.status = activeTab;
      }

      // Add search query if exists
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await postData(params, Urls.booking, 'GET', {
        showErrorMessage: false,
      });

      if (response?.success) {
        const { data, total, page: currentPage, limit, totalPages, hasPrevPage, hasNextPage, pagination: paginationData } = response;

        const formattedBookings = data.map(item => {
          const booking = item.booking || {};
          const user = item.user || {};
          const address = booking.addressId || {};
          const bookingItems = booking.bookingItems || [];
          const id = item._id || '';

          // Get service names
          const serviceNames = bookingItems.map(item => 
            item.service?.name || 'Service'
          ).join(', ');

          // Calculate total amount
          const totalAmount = booking.payableAmount || booking.amount || 0;

          // Format date
          let formattedDate = '';
          if (booking.scheduleDate) {
            const date = new Date(booking.scheduleDate);
            formattedDate = date.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
          }

          // Format time
          let formattedTime = '';
          if (booking.scheduleTime) {
            formattedTime = booking.scheduleTime;
          }

          // Determine service type from services
          let serviceType = 'other';
          if (serviceNames.toLowerCase().includes('ac') || serviceNames.toLowerCase().includes('air')) {
            serviceType = 'ac';
          } else if (serviceNames.toLowerCase().includes('clean')) {
            serviceType = 'cleaning';
          } else if (serviceNames.toLowerCase().includes('plumb')) {
            serviceType = 'plumbing';
          } else if (serviceNames.toLowerCase().includes('electr')) {
            serviceType = 'electrical';
          } else if (serviceNames.toLowerCase().includes('water') || serviceNames.toLowerCase().includes('ro')) {
            serviceType = 'water';
          } else if (serviceNames.toLowerCase().includes('tv')) {
            serviceType = 'tv';
          }

          return {
            id: item._id,
            bookingId: booking.bookingId || `BK${item._id.slice(-6)}`,
            customerName: user.name || `User ${user.mobile}`,
            mobile: user.mobile || '',
            service: serviceNames || 'Service',
            date: formattedDate,
            time: formattedTime,
            address: `${address.houseNumber || ''} ${address.landmark || ''}`.trim() || 'Address not available',
            status: item.status || booking.status || 'new',
            amount: totalAmount,
            serviceType: serviceType,
            originalData: item,
          };
        });

        if (isLoadMore) {
          setBookings(prev => [...prev, ...formattedBookings]);
        } else {
          setBookings(formattedBookings);
        }

        setPagination({
          page: currentPage,
          limit,
          total,
          totalPages,
          hasPrevPage,
          hasNextPage,
        });

        return { success: true };
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to load bookings',
        });
        return { success: false };
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load bookings. Please try again.',
      });
      return { success: false };
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [activeTab, searchQuery]);

  const loadBookings = async () => {
    await fetchBookings(1, false);
  };

  const loadMoreBookings = async () => {
    if (loadingMore || !pagination.hasNextPage) return;
    
    const nextPage = pagination.page + 1;
    await fetchBookings(nextPage, true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings(1, false);
    setRefreshing(false);
    
    Toast.show({
      type: 'success',
      text1: 'Refreshed',
      text2: 'Bookings list updated',
    });
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      // Show loading
      Toast.show({
        type: 'info',
        text1: 'Updating status...',
        text2: 'Please wait',
      });

      const response = await postData(
        { status: newStatus },
        `${Urls.bookingAccept}/${bookingId}`,
        'POST'
      );

      if (response?.success) {
        // Update local state
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        ));

        Toast.show({
          type: 'success',
          text1: 'Status Updated',
          text2: `Booking ${bookingId} updated to ${newStatus}`,
        });

        // Refresh list
        await fetchBookings(1, false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to update status',
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update status. Please try again.',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'accepted': return colors.primary;
      case 'new': return colors.info;
      case 'upcoming': return colors.warning;
      case 'cancelled': return colors.error;
      case 'rejected': return colors.error;
      default: return colors.gray;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'completed': return colors.success + '20';
      case 'accepted': return colors.primary + '20';
      case 'new': return colors.info + '20';
      case 'upcoming': return colors.warning + '20';
      case 'cancelled': return colors.error + '20';
      case 'rejected': return colors.error + '20';
      default: return colors.gray + '20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return 'New';
      case 'accepted': return 'Accepted';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'rejected': return 'Rejected';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'ac': return 'ac-unit';
      case 'cleaning': return 'cleaning-services';
      case 'plumbing': return 'plumbing';
      case 'electrical': return 'electrical-services';
      case 'water': return 'water-drop';
      case 'tv': return 'tv';
      default: return 'home-repair-service';
    }
  };

  const getActionButtons = (booking) => {
    const buttons = [];
    
    switch (booking.status) {
      case 'new':
        buttons.push(
          {
            label: 'Accept',
            icon: 'check-circle',
            color: colors.success,
            action: () => handleStatusUpdate(booking.id, 'accepted'),
          },
          {
            label: 'Reject',
            icon: 'close',
            color: colors.error,
            action: () => handleStatusUpdate(booking.id, 'rejected'),
          }
        );
        break;
        
      case 'accepted':
        buttons.push(
          {
            label: 'Start',
            icon: 'play-circle',
            color: colors.primary,
            action: () => handleStatusUpdate(booking.id, 'upcoming'),
          }
        );
        break;
        
      case 'upcoming':
        buttons.push(
          {
            label: 'Complete',
            icon: 'check',
            color: colors.success,
            action: () => handleStatusUpdate(booking.id, 'completed'),
          }
        );
        break;
    }
    
    return buttons;
  };

  const renderBookingCard = ({ item: booking }) => {
    const actionButtons = getActionButtons(booking);
    
    return (
      <TouchableOpacity
        style={clsx(
          styles.bgWhite,
          styles.roundedLg,
          styles.p4,
          styles.mb3,
          styles.shadowSm
        )}
        onPress={() => navigation.navigate('BookingDetail', { booking: booking.originalData })}
      >
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <View style={[clsx(styles.roundedFull, styles.p2), { backgroundColor: getStatusBgColor(booking.status) }]}>
              <Icon name={getServiceIcon(booking.serviceType)} size={20} color={getStatusColor(booking.status)} />
            </View>
            <View style={clsx(styles.ml3)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                {booking.service}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                Booking ID: {booking.bookingId}
              </Text>
            </View>
          </View>
          <View style={clsx(
            styles.px3,
            styles.py1,
            styles.roundedFull,
            { backgroundColor: getStatusBgColor(booking.status) }
          )}>
            <Text style={clsx(
              styles.textSm,
              styles.fontMedium,
              { color: getStatusColor(booking.status) }
            )}>
              {getStatusLabel(booking.status)}
            </Text>
          </View>
        </View>

        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
          <Icon name="person" size={16} color={colors.textLight} />
          <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2)}>
            {booking.customerName}
          </Text>
        </View>

        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
          <Icon name="phone" size={16} color={colors.textLight} />
          <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2)}>
            {booking.mobile}
          </Text>
        </View>

        {booking.date && (
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
            <Icon name="calendar-today" size={16} color={colors.textLight} />
            <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2)}>
              {booking.date} {booking.time ? `• ${booking.time}` : ''}
            </Text>
          </View>
        )}

        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
          <Icon name="location-on" size={16} color={colors.textLight} />
          <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2, styles.flex1)}>
            {booking.address}
          </Text>
        </View>

        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
          <View>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Total Amount
            </Text>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
              ₹{booking.amount}
            </Text>
          </View>
          
          {actionButtons.length > 0 ? (
            <View style={clsx(styles.flexRow)}>
              {actionButtons.map((button, index) => (
                <TouchableOpacity 
                  key={index}
                  style={clsx(
                    styles.flexRow,
                    styles.itemsCenter,
                    styles.px3,
                    styles.py2,
                    styles.mr2,
                    styles.roundedFull,
                    { backgroundColor: button.color }
                  )}
                  onPress={(e) => {
                    e.stopPropagation();
                    button.action();
                  }}
                >
                  <Icon name={button.icon} size={16} color={colors.white} />
                  <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
                    {button.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity 
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.px3,
                styles.py2,
                styles.border,
                styles.borderPrimary,
                styles.bgWhite,
                styles.roundedFull
              )}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('BookingDetail', { booking: booking.originalData });
              }}
            >
              <Text style={clsx(styles.textPrimary, styles.fontMedium, styles.mr1)}>
                Details
              </Text>
              <Icon name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTabItem = (tab) => (
    <TouchableOpacity
      key={tab.id}
      style={clsx(
        styles.px4,
        styles.py2,
        styles.mr3,
        styles.roundedFull,
        activeTab === tab.id ? styles.bgPrimary : styles.bgGray100
      )}
      onPress={() => setActiveTab(tab.id)}
    >
      <Text style={clsx(
        styles.fontMedium,
        activeTab === tab.id ? styles.textWhite : styles.textBlack
      )}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterOption = (filterType, options) => (
    <View style={clsx(styles.mb6)}>
      <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb3)}>
        {filterType === 'serviceType' ? 'Service Type' : 
         filterType === 'dateRange' ? 'Date Range' : 'Price Range'}
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={clsx(styles.pb2)}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={clsx(
              styles.px4,
              styles.py2,
              styles.mr3,
              styles.roundedFull,
              selectedFilters[filterType] === option.id ? styles.bgPrimary : styles.bgGray100
            )}
            onPress={() => setSelectedFilters({...selectedFilters, [filterType]: option.id})}
          >
            <Text style={clsx(
              styles.fontMedium,
              selectedFilters[filterType] === option.id ? styles.textWhite : styles.textBlack
            )}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={clsx(styles.p4, styles.itemsCenter)}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
          Loading more bookings...
        </Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading bookings...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="My Bookings"
        showBack
        showNotification={false}
        type="white"
        rightAction={true}
        rightActionIcon="filter-list"
        showProfile={false}
        onRightActionPress={() => setFilterModalVisible(true)}
      />

      {/* Search Bar */}
      <View style={clsx(styles.bgWhite, styles.px4, styles.py3)}>
        <View style={clsx(
          styles.bgGray50, 
          styles.roundedLg, 
          styles.px3, 
          styles.py2, 
          styles.flexRow, 
          styles.itemsCenter
        )}>
          <Icon name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={clsx(styles.flex1, styles.textBase, styles.textBlack, styles.ml2)}
            placeholder="Search bookings by name, service, or booking ID..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={clsx(styles.bgWhite, styles.px4, styles.py3, styles.shadowSm)}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={clsx(styles.flexRow)}
        >
          {tabs.map(renderTabItem)}
        </ScrollView>
      </View>

      {/* Bookings List */}
      <FlatList
        data={bookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={clsx(styles.px4, styles.py4)}
        ListEmptyComponent={
          <View style={clsx(styles.itemsCenter, styles.justifyCenter, styles.p8)}>
            <Icon name="inbox" size={80} color={colors.gray300} />
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt4)}>
              No bookings found
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter, styles.mt2)}>
              {searchQuery ? 'Try changing your search query' : 'No bookings match your current filters'}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.mt4,
                  styles.px4,
                  styles.py2,
                  styles.bgPrimary,
                  styles.roundedFull
                )}
                onPress={() => setSearchQuery('')}
              >
                <Icon name="refresh" size={16} color={colors.white} />
                <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml2)}>
                  Clear Search
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListHeaderComponent={
          bookings.length > 0 ? (
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mb3)}>
              Showing {bookings.length} of {pagination.total} booking{bookings.length !== 1 ? 's' : ''}
            </Text>
          ) : null
        }
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreBookings}
        onEndReachedThreshold={0.5}
      />

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={clsx(styles.flex1, styles.justifyEnd, styles.bgBlack50)}>
          <View style={clsx(styles.bgWhite, styles.roundedT3xl, styles.p6, styles.maxH80)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
              <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                Filter Bookings
              </Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Service Type Filter */}
              {renderFilterOption('serviceType', serviceTypes)}

              {/* Price Range Filter */}
              {renderFilterOption('priceRange', priceRanges)}

              {/* Date Range Filter */}
              {renderFilterOption('dateRange', dateRanges)}

              {/* Action Buttons */}
              <View style={clsx(styles.flexRow, styles.gap3, styles.mt4)}>
                <TouchableOpacity
                  style={clsx(
                    styles.flex1,
                    styles.border,
                    styles.borderPrimary,
                    styles.roundedLg,
                    styles.p4,
                    styles.itemsCenter,
                    styles.justifyCenter
                  )}
                  onPress={() => {
                    setSelectedFilters({
                      serviceType: 'all',
                      dateRange: 'all',
                      priceRange: 'all',
                    });
                  }}
                >
                  <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                    Reset Filters
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={clsx(
                    styles.flex1,
                    styles.bgPrimary,
                    styles.roundedLg,
                    styles.p4,
                    styles.itemsCenter,
                    styles.justifyCenter
                  )}
                  onPress={() => setFilterModalVisible(false)}
                >
                  <Text style={clsx(styles.textWhite, styles.fontBold)}>
                    Apply Filters
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BookingListScreen;