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
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import { AppContext } from '../../../Context/AppContext';
import Header from '../../../components/Common/Header';
import { Picker } from '@react-native-picker/picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BookingListScreen = ({ navigation }) => {
  const {
    Toast,
    Urls,
    postData,
  } = useContext(AppContext);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // Track individual booking actions
  const [activeTab, setActiveTab] = useState('all');
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
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

  // API filter parameters
  const [apiFilters, setApiFilters] = useState({
    status: '',
    search: '',
    category: '',
    dateRange: '',
    minPrice: '',
    maxPrice: '',
  });

  const tabs = [
    { id: 'all', label: 'All', status: '' },
    { id: 'new', label: 'New', status: 'new' },
    { id: 'assign', label: 'Assigned', status: 'assign' },
    { id: 'accept', label: 'Accepted', status: 'accept' },
    { id: 'ongoing', label: 'Ongoing', status: 'ongoing' },
    { id: 'complete', label: 'Completed', status: 'complete' },
    { id: 'cancel', label: 'Cancelled', status: 'cancel' },
    { id: 'reject', label: 'Rejected', status: 'reject' },
    { id: 'partstatusnew', label: 'Parts Submitted', status: 'partstatusnew' },
    { id: 'partstatusconfirm', label: 'Parts Confirmed', status: 'partstatusconfirm' },
    { id: 'partstatusapprove', label: 'Parts Approved', status: 'partstatusapprove' },
    { id: 'partstatusreject', label: 'Parts Rejected', status: 'partstatusreject' },
  ];
  // Refs for tab scroll
  const tabScrollViewRef = React.useRef(null);

  const serviceTypes = [
    { id: '', label: 'All Services', category: '' },
    { id: 'ac', label: 'AC Services', category: 'ac' },
    { id: 'cleaning', label: 'Cleaning', category: 'cleaning' },
    { id: 'plumbing', label: 'Plumbing', category: 'plumbing' },
    { id: 'electrical', label: 'Electrical', category: 'electrical' },
    { id: 'water', label: 'Water Purifier', category: 'water' },
  ];

  const dateRanges = [
    { id: '', label: 'All Time', dateRange: '' },
    { id: 'today', label: 'Today', dateRange: 'today' },
    { id: 'week', label: 'This Week', dateRange: 'week' },
    { id: 'month', label: 'This Month', dateRange: 'month' },
  ];

  const priceRanges = [
    { id: '', label: 'All Prices', minPrice: '', maxPrice: '' },
    { id: 'low', label: '₹0 - ₹1000', minPrice: '0', maxPrice: '1000' },
    { id: 'medium', label: '₹1000 - ₹3000', minPrice: '1000', maxPrice: '3000' },
    { id: 'high', label: '₹3000+', minPrice: '3000', maxPrice: '' },
  ];

  const [selectedFilters, setSelectedFilters] = useState({
    serviceType: '',
    dateRange: '',
    priceRange: '',
  });

  const fetchBookings = async (page = 1, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      if (isLoadMore) setLoadingMore(true);

      const params = {
        page,
        limit: 10,
      };

      // Add API filters
      if (apiFilters.status) params.status = apiFilters.status;
      if (apiFilters.search) params.search = apiFilters.search;
      if (apiFilters.category) params.category = apiFilters.category;
      if (apiFilters.dateRange) params.dateRange = apiFilters.dateRange;
      if (apiFilters.minPrice) params.minPrice = apiFilters.minPrice;
      if (apiFilters.maxPrice) params.maxPrice = apiFilters.maxPrice;

      console.log('Fetching with params:', params);

      const response = await postData(params, Urls.booking, 'GET', {
        showErrorMessage: false, 
        showSuccessMessage: false
      });

      if (response?.success) {
        const { data, total, page: currentPage, limit, totalPages, hasPrevPage, hasNextPage } = response;

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

  // Function to handle booking status update
  const handleStatusUpdate = async (bookingId, action, bookingOData) => {
    try {
      // Set loading for this specific booking
      setActionLoading(prev => ({ ...prev, [bookingId]: true }));

      const endpoint = action === 'accept' ? Urls.bookingAccept+'/'+bookingId : Urls.bookingReject+'/'+bookingId;
      const actionText = action === 'accept' ? 'accept' : 'reject';

      const response = await postData(
        { bookingId },
        endpoint,
        'POST'
      );

      if (response?.success) {
        // Update local state
        setBookings(prev => prev.map(booking => {
          if (booking.id === bookingId) {
            return {
              ...booking,
              status: action === 'accept' ? 'accept' : 'reject'
            };
          }
          return booking;
        }));

        
        navigation.navigate('BookingDetail', { booking: bookingOData });

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `Booking ${actionText}ed successfully`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || `Failed to ${actionText} booking`,
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to ${action} booking. Please try again.`,
      });
    } finally {
      // Clear loading for this booking
      setActionLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  // Function to show confirmation for accept/reject
  const showConfirmation = (bookingId, action) => {

    handleStatusUpdate(bookingId, action)
    return true;

    const actionText = action === 'accept' ? 'Accept' : 'Reject';
    const message = action === 'accept' 
      ? 'Are you sure you want to accept this booking?' 
      : 'Are you sure you want to reject this booking?';

    Alert.alert(
      `Confirm ${actionText}`,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: actionText, 
          style: action === 'accept' ? 'default' : 'destructive',
          onPress: () => handleStatusUpdate(bookingId, action)
        }
      ]
    );
  };

  useEffect(() => {
    loadBookings();
  }, [activeTab, apiFilters]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      setApiFilters(prev => ({
        ...prev,
        search: searchQuery
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const tab = tabs.find(t => t.id === tabId);
    setApiFilters(prev => ({
      ...prev,
      status: tab?.status || ''
    }));
  };

  const handleFilterApply = () => {
    const serviceFilter = serviceTypes.find(st => st.id === selectedFilters.serviceType);
    const dateFilter = dateRanges.find(dr => dr.id === selectedFilters.dateRange);
    const priceFilter = priceRanges.find(pr => pr.id === selectedFilters.priceRange);

    const newFilters = {
      ...apiFilters,
      category: serviceFilter?.category || '',
      dateRange: dateFilter?.dateRange || '',
      minPrice: priceFilter?.minPrice || '',
      maxPrice: priceFilter?.maxPrice || '',
    };

    setApiFilters(newFilters);
    setFilterModalVisible(false);
  };

  const handleFilterReset = () => {
    setSelectedFilters({
      serviceType: '',
      dateRange: '',
      priceRange: '',
    });
    
    setApiFilters({
      status: '',
      search: '',
      category: '',
      dateRange: '',
      minPrice: '',
      maxPrice: '',
    });
    
    setActiveTab('all');
    setSearchQuery('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return colors.success;
      case 'accept': return colors.primary;
      case 'new': return colors.info;
      case 'assign': return colors.warning;
      case 'ongoing': return colors.info;
      case 'cancel': return colors.error;
      case 'reject': return colors.error;
      case 'partstatusnew': return colors.warning;
      case 'partstatusconfirm': return colors.info;
      case 'partstatusapprove': return colors.success;
      case 'partstatusreject': return colors.error;
      default: return colors.gray;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'complete': return colors.success + '20';
      case 'accept': return colors.primary + '20';
      case 'new': return colors.info + '20';
      case 'assign': return colors.warning + '20';
      case 'ongoing': return colors.info + '20';
      case 'cancel': return colors.error + '20';
      case 'reject': return colors.error + '20';
      case 'partstatusnew': return colors.warning + '20';
      case 'partstatusconfirm': return colors.info + '20';
      case 'partstatusapprove': return colors.success + '20';
      case 'partstatusreject': return colors.error + '20';
      default: return colors.gray + '20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'complete': return 'Completed';
      case 'accept': return 'Accepted';
      case 'new': return 'New';
      case 'assign': return 'Assigned';
      case 'ongoing': return 'In Progress';
      case 'cancel': return 'Cancelled';
      case 'reject': return 'Rejected';
      case 'partstatusnew': return 'Parts Pending';
      case 'partstatusconfirm': return 'Parts Confirmed';
      case 'partstatusapprove': return 'Parts Approved';
      case 'partstatusreject': return 'Parts Rejected';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  const getServiceIcon = (serviceName) => {
    if (!serviceName) return 'home-repair-service';
    
    const service = serviceName.toLowerCase();
    if (service.includes('ac') || service.includes('air')) return 'ac-unit';
    if (service.includes('clean')) return 'cleaning-services';
    if (service.includes('plumb')) return 'plumbing';
    if (service.includes('electr')) return 'electrical-services';
    if (service.includes('water') || service.includes('ro')) return 'water-drop';
    if (service.includes('tv')) return 'tv';
    return 'home-repair-service';
  };

  // Render buttons based on booking status
  const renderActionButtons = (booking) => {
    const isActionLoading = actionLoading[booking.id];
    
    // If status is "new", show Accept and Reject buttons
    if (booking.status === 'new') {
      return (
        <View style={clsx(styles.flexRow, styles.gap2)}>
          {/* Reject Button */}
          {/* <TouchableOpacity 
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.px3,
              styles.py2,
              styles.border,
              styles.borderError,
              styles.bgWhite,
              styles.roundedFull,
              isActionLoading && styles.opacity50
            )}
            onPress={(e) => {
              e.stopPropagation();
              showConfirmation(booking.id, 'reject');
            }}
            disabled={isActionLoading}
            activeOpacity={0.7}
          >
            {isActionLoading ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <>
                <Icon name="close" size={16} color={colors.error} />
                <Text style={clsx(styles.textError, styles.fontMedium, styles.ml1)}>
                  Reject
                </Text>
              </>
            )}
          </TouchableOpacity> */}

          {/* Accept Button */}
          <TouchableOpacity 
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.px3,
              styles.py2,
              styles.bgSuccess,
              styles.roundedFull,
              isActionLoading && styles.opacity50
            )}
            onPress={(e) => {
              e.stopPropagation();
              showConfirmation(booking.id, 'accept');
            }}
            disabled={isActionLoading}
            activeOpacity={0.7}
          >
            {isActionLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="check" size={16} color={colors.white} />
                <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
                  Accept
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }
    
    // For other statuses (accepted, ongoing, completed, etc.), show Details button
    return (
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
        activeOpacity={0.7}
      >
        <Text style={clsx(styles.textPrimary, styles.fontMedium, styles.mr1)}>
          Details
        </Text>
        <Icon name="chevron-right" size={16} color={colors.primary} />
      </TouchableOpacity>
    );
  };

  // renderBookingCard function को इस तरह बदलें:
  const renderBookingCard = ({ item: booking }) => {
    const isActionLoading = actionLoading[booking.id];
    
    // Function to handle card press
    const handleCardPress = () => {
      if (booking.status === 'new') {
        // Show confirmation for accept
        Alert.alert(
          'Accept Booking',
          'Are you sure you want to accept this booking?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Accept', 
              style: 'default',
              onPress: () => {
                // Accept the booking
                handleStatusUpdate(booking.id, 'accept', booking.originalData);
                // Then navigate to detail
                // navigation.navigate('BookingDetail', { booking: booking.originalData });
              }
            }
          ]
        );
      } else {
        // For other statuses, directly navigate to detail
        navigation.navigate('BookingDetail', { booking: booking.originalData });
      }
    };
    
    return (
      <TouchableOpacity
        style={clsx(
          styles.bgWhite,
          styles.roundedLg,
          styles.p4,
          styles.mb3,
          styles.shadowSm,
          isActionLoading && styles.opacity50
        )}
        onPress={handleCardPress}
        disabled={isActionLoading}
        activeOpacity={0.7}
      >
        {/* Top Section - Service & Status */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsStart, styles.mb3)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.flex1)}>
            <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), { backgroundColor: getStatusBgColor(booking.status) }]}>
              <Icon name={getServiceIcon(booking.service)} size={20} color={getStatusColor(booking.status)} />
            </View>
            <View style={clsx(styles.flex1)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb1)} numberOfLines={1}>
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
              styles.textXs,
              styles.fontMedium,
              { color: getStatusColor(booking.status) }
            )} numberOfLines={1}>
              {getStatusLabel(booking.status)}
            </Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={clsx(styles.mb3)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
            <Icon name="person" size={16} color={colors.textMuted} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textSm, styles.textBlack, styles.flex1)} numberOfLines={1}>
              {booking.customerName}
            </Text>
          </View>

          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
            <Icon name="phone" size={16} color={colors.textMuted} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textSm, styles.textBlack, styles.flex1)} numberOfLines={1}>
              {booking.mobile}
            </Text>
          </View>

          {booking.date && (
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
              <Icon name="calendar-today" size={16} color={colors.textMuted} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textSm, styles.textBlack, styles.flex1)} numberOfLines={1}>
                {booking.date} {booking.time ? `• ${booking.time}` : ''}
              </Text>
            </View>
          )}

          <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb2)}>
            <Icon name="location-on" size={16} color={colors.textMuted} style={clsx(styles.mr2, styles.mt1)} />
            <Text style={clsx(styles.textSm, styles.textBlack, styles.flex1)} numberOfLines={2}>
              {booking.address}
            </Text>
          </View>
        </View>

        {/* Bottom Section - Amount & Action Info */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
          <View>
            {/* <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
              Total Amount
            </Text>
            <Text style={clsx(styles.textXl, styles.fontBold, styles.textPrimary)}>
              ₹{booking.amount}
            </Text> */}
          </View>
          
          {/* Status based instruction */}
          {booking.status === 'new' ? (
            <View style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.px3,
              styles.py2,
              styles.bgInfoLight,
              styles.roundedFull
            )}>
              <Icon name="touch-app" size={16} color={colors.info} />
              <Text style={clsx(styles.textInfo, styles.fontMedium, styles.ml1)}>
                Tap to Accept
              </Text>
            </View>
          ) : (
            <View style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.px3,
              styles.py2,
              styles.border,
              styles.borderPrimary,
              styles.bgWhite,
              styles.roundedFull
            )}>
              <Text style={clsx(styles.textPrimary, styles.fontMedium, styles.mr1)}>
                View Details
              </Text>
              <Icon name="chevron-right" size={16} color={colors.primary} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTabItem = (tab) => (
    <TouchableOpacity
      key={tab.id}
      style={clsx(
        styles.px3,
        styles.py2,
        styles.mr2,
        styles.roundedFull,
        activeTab === tab.id ? styles.bgPrimary : styles.bgGray100,
        { minWidth: 80 }
      )}
      onPress={() => handleTabChange(tab.id)}
      activeOpacity={0.7}
    >
      <Text style={clsx(
        styles.textSm,
        styles.fontMedium,
        styles.textCenter,
        activeTab === tab.id ? styles.textWhite : styles.textBlack
      )} numberOfLines={1}>
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
              styles.px3,
              styles.py2,
              styles.mr2,
              styles.roundedFull,
              selectedFilters[filterType] === option.id ? styles.bgPrimary : styles.bgGray100,
              { minWidth: 80 }
            )}
            onPress={() => setSelectedFilters({...selectedFilters, [filterType]: option.id})}
            activeOpacity={0.7}
          >
            <Text style={clsx(
              styles.textSm,
              styles.fontMedium,
              styles.textCenter,
              selectedFilters[filterType] === option.id ? styles.textWhite : styles.textBlack
            )} numberOfLines={1}>
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
      {/* <View style={clsx(styles.bgWhite, styles.px4, styles.py3)}>
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
            <TouchableOpacity onPress={() => setSearchQuery('')} style={clsx(styles.p1)}>
              <Icon name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View> */}

      {/* Tab Navigation - Horizontal Scroll */}
      <View style={clsx(styles.bgWhite, styles.px4, styles.py3, styles.shadowSm)}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={clsx(styles.pb2)}
          ref={tabScrollViewRef}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={clsx(
                styles.px3,
                styles.py2,
                styles.mr2,
                styles.roundedFull,
                activeTab === tab.id ? styles.bgPrimary : styles.bgGray100,
                { minWidth: 80 }
              )}
              onPress={() => handleTabChange(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={clsx(
                styles.textSm,
                styles.fontMedium,
                styles.textCenter,
                activeTab === tab.id ? styles.textWhite : styles.textBlack
              )} numberOfLines={1}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
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
        contentContainerStyle={clsx(styles.px4, styles.py3)}
        ListEmptyComponent={
          <View style={clsx(styles.itemsCenter, styles.justifyCenter, styles.py12, styles.px4)}>
            <Icon name="inbox" size={80} color={colors.gray300} />
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt4, styles.textCenter)}>
              No bookings found
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter, styles.mt2)}>
              {searchQuery || apiFilters.status || apiFilters.category 
                ? 'No bookings match your current filters'
                : 'You have no bookings yet'
              }
            </Text>
            {(searchQuery || apiFilters.status || apiFilters.category) && (
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.mt6,
                  styles.px4,
                  styles.py3,
                  styles.bgPrimary,
                  styles.roundedFull
                )}
                onPress={handleFilterReset}
                activeOpacity={0.7}
              >
                <Icon name="refresh" size={18} color={colors.white} />
                <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml2)}>
                  Reset Filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListHeaderComponent={
          bookings.length > 0 ? (
            <View style={clsx(styles.mb3)}>
              <Text style={clsx(styles.textBase, styles.textMuted)}>
                Showing {bookings.length} of {pagination.total} booking{bookings.length !== 1 ? 's' : ''}
              </Text>
              {(apiFilters.status || apiFilters.category || apiFilters.search) && (
                <TouchableOpacity
                  style={clsx(
                    styles.flexRow,
                    styles.itemsCenter,
                    styles.mt2,
                    styles.selfStart,
                    styles.px3,
                    styles.py1,
                    styles.bgGray100,
                    styles.roundedFull
                  )}
                  onPress={handleFilterReset}
                  activeOpacity={0.7}
                >
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Clear filters
                  </Text>
                  <Icon name="close" size={14} color={colors.textMuted} style={clsx(styles.ml1)} />
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreBookings}
        onEndReachedThreshold={0.3}
      />

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={clsx(styles.flex1, styles.justifyEnd, styles.bgBlack50)}>
          <View style={clsx(styles.bgWhite, styles.p6, { height: 600 })}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
              <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                Filter Bookings
              </Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} activeOpacity={0.7}>
                <Icon name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={clsx(styles.flex1)}>
              

              {/* Price Range Filter */}
              {renderFilterOption('priceRange', priceRanges)}

              {/* Date Range Filter */}
              {renderFilterOption('dateRange', dateRanges)}

              {/* Action Buttons */}
              <View style={clsx(styles.flexRow, styles.gap3, styles.mt4, styles.mb6)}>
                <TouchableOpacity
                  style={clsx(
                    styles.flex1,
                    styles.border,
                    styles.borderPrimary,
                    styles.roundedLg,
                    styles.p3,
                    styles.itemsCenter,
                    styles.justifyCenter
                  )}
                  onPress={handleFilterReset}
                  activeOpacity={0.7}
                >
                  <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                    Reset All
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={clsx(
                    styles.flex1,
                    styles.bgPrimary,
                    styles.roundedLg,
                    styles.p3,
                    styles.itemsCenter,
                    styles.justifyCenter
                  )}
                  onPress={handleFilterApply}
                  activeOpacity={0.7}
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