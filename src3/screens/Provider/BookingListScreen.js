import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  RefreshControl,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';

const BookingListScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, upcoming, completed, cancelled
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    serviceType: 'all',
    dateRange: 'all',
    priceRange: 'all',
  });

  // Sample bookings data
  const allBookings = [
    {
      id: 'BK001',
      customerName: 'Rahul Sharma',
      service: 'AC Service & Repair',
      date: '15 Dec 2023',
      time: '10:00 AM',
      address: 'Sector 15, Noida',
      status: 'confirmed',
      amount: 1499,
      serviceType: 'ac',
      phone: '+91 98765 43210',
    },
    {
      id: 'BK002',
      customerName: 'Priya Singh',
      service: 'Deep Cleaning',
      date: '15 Dec 2023',
      time: '12:30 PM',
      address: 'GK-1, Delhi',
      status: 'upcoming',
      amount: 1999,
      serviceType: 'cleaning',
      phone: '+91 98765 43211',
    },
    {
      id: 'BK003',
      customerName: 'Amit Verma',
      service: 'Plumbing Repair',
      date: '14 Dec 2023',
      time: '2:00 PM',
      address: 'Pitampura, Delhi',
      status: 'completed',
      amount: 1299,
      serviceType: 'plumbing',
      phone: '+91 98765 43212',
    },
    {
      id: 'BK004',
      customerName: 'Neha Gupta',
      service: 'AC Installation',
      date: '14 Dec 2023',
      time: '4:00 PM',
      address: 'Saket, Delhi',
      status: 'cancelled',
      amount: 4999,
      serviceType: 'ac',
      phone: '+91 98765 43213',
    },
    {
      id: 'BK005',
      customerName: 'Rajesh Kumar',
      service: 'Electrician Service',
      date: '13 Dec 2023',
      time: '11:00 AM',
      address: 'Dwarka, Delhi',
      status: 'completed',
      amount: 899,
      serviceType: 'electrical',
      phone: '+91 98765 43214',
    },
    {
      id: 'BK006',
      customerName: 'Sonia Mehta',
      service: 'RO Service',
      date: '13 Dec 2023',
      time: '3:00 PM',
      address: 'Vasant Kunj, Delhi',
      status: 'confirmed',
      amount: 699,
      serviceType: 'water',
      phone: '+91 98765 43215',
    },
  ];

  const tabs = [
    { id: 'all', label: 'All', count: allBookings.length },
    { id: 'upcoming', label: 'Upcoming', count: allBookings.filter(b => b.status === 'upcoming' || b.status === 'confirmed').length },
    { id: 'completed', label: 'Completed', count: allBookings.filter(b => b.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: allBookings.filter(b => b.status === 'cancelled').length },
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

  // Filter bookings based on active tab, search query, and filters
  const filteredBookings = allBookings.filter(booking => {
    // Tab filter
    let tabFilter = true;
    if (activeTab === 'upcoming') {
      tabFilter = booking.status === 'upcoming' || booking.status === 'confirmed';
    } else if (activeTab !== 'all') {
      tabFilter = booking.status === activeTab;
    }

    // Search filter
    const searchFilter = searchQuery === '' || 
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.address.toLowerCase().includes(searchQuery.toLowerCase());

    // Service type filter
    const serviceFilter = selectedFilters.serviceType === 'all' || 
      booking.serviceType === selectedFilters.serviceType;

    // Price range filter
    let priceFilter = true;
    if (selectedFilters.priceRange === 'low') {
      priceFilter = booking.amount <= 1000;
    } else if (selectedFilters.priceRange === 'medium') {
      priceFilter = booking.amount > 1000 && booking.amount <= 3000;
    } else if (selectedFilters.priceRange === 'high') {
      priceFilter = booking.amount > 3000;
    }

    return tabFilter && searchFilter && serviceFilter && priceFilter;
  });

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleStatusUpdate = (bookingId, newStatus) => {
    // Update booking status
    console.log(`Updating booking ${bookingId} to ${newStatus}`);
    // In real app, make API call here
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'confirmed': return colors.primary;
      case 'upcoming': return colors.warning;
      case 'cancelled': return colors.error;
      default: return colors.gray;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'completed': return colors.successLight;
      case 'confirmed': return colors.primaryLight;
      case 'upcoming': return colors.warningLight;
      case 'cancelled': return colors.errorLight;
      default: return colors.gray100;
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'ac': return 'ac-unit';
      case 'cleaning': return 'cleaning-services';
      case 'plumbing': return 'plumbing';
      case 'electrical': return 'electrical-services';
      case 'water': return 'water-drop';
      default: return 'home-repair-service';
    }
  };

  const renderBookingCard = (booking) => (
    <TouchableOpacity
      key={booking.id}
      style={clsx(
        styles.bgWhite,
        styles.roundedLg,
        styles.p4,
        styles.mb3,
        styles.shadowSm
      )}
      onPress={() => navigation.navigate('BookingDetails', { booking })}
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
              Booking ID: {booking.id}
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
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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
          {booking.phone}
        </Text>
      </View>

      <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
        <Icon name="calendar-today" size={16} color={colors.textLight} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2)}>
          {booking.date} • {booking.time}
        </Text>
      </View>

      <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
        <Icon name="location-on" size={16} color={colors.textLight} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2, styles.flex1)}>
          {booking.address}
        </Text>
      </View>

      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
        <View>
          <Text style={clsx(styles.textSm, styles.textMuted)}>
            Service Charge
          </Text>
          <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
            ₹{booking.amount}
          </Text>
        </View>
        
        <View style={clsx(styles.flexRow, styles.gap2)}>
          {booking.status === 'confirmed' && (
            <TouchableOpacity 
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.px3,
                styles.py2,
                styles.bgSuccess,
                styles.roundedFull
              )}
              onPress={(e) => {
                e.stopPropagation();
                handleStatusUpdate(booking.id, 'completed');
              }}
            >
              <Icon name="check" size={16} color={colors.white} />
              <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
                Mark Complete
              </Text>
            </TouchableOpacity>
          )}
          
          {booking.status === 'upcoming' && (
            <TouchableOpacity 
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.px3,
                styles.py2,
                styles.bgPrimary,
                styles.roundedFull
              )}
              onPress={(e) => {
                e.stopPropagation();
                handleStatusUpdate(booking.id, 'confirmed');
              }}
            >
              <Icon name="check-circle" size={16} color={colors.white} />
              <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
                Confirm
              </Text>
            </TouchableOpacity>
          )}
          
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
              navigation.navigate('BookingDetails', { booking });
            }}
          >
            <Text style={clsx(styles.textPrimary, styles.fontMedium, styles.mr1)}>
              Details
            </Text>
            <Icon name="chevron-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header */}
      <View style={clsx(styles.bgPrimary, styles.px4, styles.pt12, styles.pb4)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold)}>
            My Bookings
          </Text>
          <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
            <Icon name="filter-list" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={clsx(styles.bgWhite, styles.roundedLg, styles.px3, styles.py2, styles.flexRow, styles.itemsCenter)}>
          <Icon name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={clsx(styles.flex1, styles.textBase, styles.textBlack, styles.ml2)}
            placeholder="Search bookings by name, service, or address..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={clsx(styles.bgWhite, styles.px4, styles.py2, styles.shadowSm)}
        contentContainerStyle={clsx(styles.flexRow)}
      >
        {tabs.map((tab) => (
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
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Text style={clsx(
                styles.fontMedium,
                activeTab === tab.id ? styles.textWhite : styles.textBlack
              )}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={clsx(
                  styles.ml2,
                  styles.px1,
                  styles.py0,
                  styles.roundedFull,
                  activeTab === tab.id ? styles.bgWhite : styles.bgPrimary,
                  { minWidth: 24, height: 20 }
                )}>
                  <Text style={clsx(
                    styles.textXs,
                    styles.fontBold,
                    styles.textCenter,
                    activeTab === tab.id ? styles.textPrimary : styles.textWhite
                  )}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
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
        contentContainerStyle={clsx(styles.px4, styles.py4)}
      >
        {filteredBookings.length > 0 ? (
          <>
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mb3)}>
              Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
            </Text>
            {filteredBookings.map(renderBookingCard)}
          </>
        ) : (
          <View style={clsx(styles.itemsCenter, styles.justifyCenter, styles.p8)}>
            <Icon name="inbox" size={80} color={colors.gray300} />
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt4)}>
              No bookings found
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter, styles.mt2)}>
              {searchQuery ? 'Try changing your search query' : 'No bookings match your current filters'}
            </Text>
            {(searchQuery || selectedFilters.serviceType !== 'all' || selectedFilters.priceRange !== 'all') && (
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
                onPress={() => {
                  setSearchQuery('');
                  setSelectedFilters({
                    serviceType: 'all',
                    dateRange: 'all',
                    priceRange: 'all',
                  });
                }}
              >
                <Icon name="refresh" size={16} color={colors.white} />
                <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml2)}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={clsx(styles.flex1, styles.justifyEnd)}>
          <View style={clsx(styles.bgWhite, styles.roundedT3xl, styles.p6)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb6)}>
              <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                Filter Bookings
              </Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Service Type Filter */}
            <View style={clsx(styles.mb6)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb3)}>
                Service Type
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={clsx(styles.flexRow)}
              >
                {serviceTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={clsx(
                      styles.px4,
                      styles.py2,
                      styles.mr3,
                      styles.roundedFull,
                      selectedFilters.serviceType === type.id ? styles.bgPrimary : styles.bgGray100
                    )}
                    onPress={() => setSelectedFilters({...selectedFilters, serviceType: type.id})}
                  >
                    <Text style={clsx(
                      styles.fontMedium,
                      selectedFilters.serviceType === type.id ? styles.textWhite : styles.textBlack
                    )}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Price Range Filter */}
            <View style={clsx(styles.mb6)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb3)}>
                Price Range
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={clsx(styles.flexRow)}
              >
                {priceRanges.map((range) => (
                  <TouchableOpacity
                    key={range.id}
                    style={clsx(
                      styles.px4,
                      styles.py2,
                      styles.mr3,
                      styles.roundedFull,
                      selectedFilters.priceRange === range.id ? styles.bgPrimary : styles.bgGray100
                    )}
                    onPress={() => setSelectedFilters({...selectedFilters, priceRange: range.id})}
                  >
                    <Text style={clsx(
                      styles.fontMedium,
                      selectedFilters.priceRange === range.id ? styles.textWhite : styles.textBlack
                    )}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Action Buttons */}
            <View style={clsx(styles.flexRow, styles.gap3)}>
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
          </View>
        </View>
      </Modal>

      {/* FAB for New Booking (Optional) */}
      <TouchableOpacity
        style={[
          clsx(
            styles.bgPrimary,
            styles.roundedFull,
            styles.itemsCenter,
            styles.justifyCenter,
            styles.shadowLg
          ),
          {
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 56,
            height: 56,
          }
        ]}
        onPress={() => navigation.navigate('NewBooking')}
      >
        <Icon name="add" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

export default BookingListScreen;