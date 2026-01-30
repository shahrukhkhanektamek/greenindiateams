import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal, // ADDED
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { AppContext } from '../../Context/AppContext';
import FooterMenu from '../../components/Provider/FooterMenu';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const {
    setUser,
    setLoading,
    user,
    UploadUrl,
    Toast,
    Urls,
    postData,
    imageCheck,
  } = useContext(AppContext);

  const [refreshing, setRefreshing] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    newBookings: 0,
    assignedBookings: 0,
    acceptedBookings: 0,
    ongoingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    rejectedBookings: 0,
    todayBookings: 0,
    todayEarnings: 0,
    totalEarnings: 0,
    walletBalance: 0,
    rating: 0,
    todayTimeSlots: 0, // ADDED
    tomorrowTimeSlots: 0, // ADDED
  });

  const [todayBookings, setTodayBookings] = useState([]);
  const [quickStats, setQuickStats] = useState([]);
  const [winnersOfWeek, setWinnersOfWeek] = useState([]);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false); // ADDED: Modal visibility state

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);

      // Fetch dashboard stats
      const statsResponse = await postData(
        {},
        Urls.dashboard,
        'GET',
        { showErrorMessage: false, showSuccessMessage: false }
      );

      if (statsResponse?.success) {
        const data = statsResponse.data || statsResponse;
        const bookingsData = data.bookings || {};
        const walletData = data.wallet || {};
        
        // Set all stats from API response
        setStats(prevStats => ({
          ...prevStats,
          totalBookings: bookingsData.total || 0,
          newBookings: bookingsData.new || 0,
          assignedBookings: 0,
          acceptedBookings: bookingsData.accept || 0,
          ongoingBookings: bookingsData.ongoing || 0,
          completedBookings: bookingsData.complete || 0,
          cancelledBookings: bookingsData.cancel || 0,
          rejectedBookings: bookingsData.reject || 0,
          todayBookings: data.todayBookings?.length || 0,
          todayEarnings: data.todayEarnning || 0,
          totalEarnings: data.totalEarnning || 0,
          walletBalance: walletData.totalCreditPoints || walletData.balance || 0,
          todayTimeSlots: data.todayTimeSlots || 0, // ADDED
          tomorrowTimeSlots: data.tomorrowTimeSlots || 0, // ADDED
        }));

        // Set quick stats for display based on API data
        setQuickStats([
          {
            id: 'new',
            title: 'New',
            count: bookingsData.new || 0,
            icon: 'fiber-new',
            color: colors.info,
            status: 'new',
          },
          {
            id: 'assigned',
            title: 'Assigned',
            count: 0,
            icon: 'assignment-ind',
            color: colors.warning,
            status: 'assign',
          },
          {
            id: 'accepted',
            title: 'Accepted',
            count: bookingsData.accept || 0,
            icon: 'check-circle',
            color: colors.primary,
            status: 'accept',
          },
          {
            id: 'ongoing',
            title: 'Ongoing',
            count: bookingsData.ongoing || 0,
            icon: 'hourglass-empty',
            color: colors.secondary,
            status: 'ongoing',
          },
          {
            id: 'completed',
            title: 'Completed',
            count: bookingsData.complete || 0,
            icon: 'task-alt',
            color: colors.success,
            status: 'complete',
          },
          {
            id: 'cancelled',
            title: 'Cancelled',
            count: bookingsData.cancel || 0,
            icon: 'cancel',
            color: colors.error,
            status: 'cancel',
          },
        ]);

        // Set winners of the week
        if (data.winnerOfTheWeek && Array.isArray(data.winnerOfTheWeek)) {
          setWinnersOfWeek(data.winnerOfTheWeek);
        }

        // Check time slots and show modal if needed
        // ADDED: Check if todayTimeSlots or tomorrowTimeSlots is 0
        const todaySlots = data.todayTimeSlots || 0;
        const tomorrowSlots = data.tomorrowTimeSlots || 0;
        
        if (todaySlots === 0 || tomorrowSlots === 0) { 
          // Show modal after a short delay to ensure UI is loaded
          setTimeout(() => {
            setShowTimeSlotModal(true);
          }, 500);
        }
      }

      // Fetch today's bookings
      const todayResponse = await postData( 
        {},
        Urls.dashboard, 
        'GET',
        { showErrorMessage: false, showSuccessMessage: false }
      );

      if (todayResponse?.success) {
        const bookings = todayResponse.data?.todayBookings || [];
        const formattedBookings = bookings.map((item) => {
          const booking = item.booking || {};
          const user = item.user || {};
          
          let addressText = 'Address not available';
          
          // Format time
          let formattedTime = '';
          if (booking.scheduleTime) {
            formattedTime = booking.scheduleTime;
          }

          return {
            id: item._id || booking._id,
            bookingId: booking.bookingId || `BK${(item._id || '').slice(-6)}`,
            customerName: user.name || `User ${user?.mobile || ''}`,
            mobile: user.mobile || '',
            service: booking.bookingItems ? 
              (Array.isArray(booking.bookingItems) ? 
                booking.bookingItems.map(item => item.service?.name || 'Service').join(', ') : 
                'Service') : 'Service',
            time: formattedTime,
            address: addressText,
            status: item.status || booking.status || 'new',
            amount: booking.payableAmount || booking.amount || 0,
            originalData: item,
          };
        });
        setTodayBookings(formattedBookings);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load dashboard data',
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); 

  // ADDED: Function to handle TimeTable navigation
  const handleSetTimeTable = () => {
    setShowTimeSlotModal(false);
    navigation.navigate('AvailabilityScreen'); // Replace with your actual timetable screen name
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData().finally(() => {
      setRefreshing(false);
      Toast.show({
        type: 'success',
        text1: 'Refreshed',
        text2: 'Dashboard data updated',
      });
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return colors.success;
      case 'accept': return colors.primary;
      case 'new': return colors.info;
      case 'assign': return colors.warning;
      case 'ongoing': return colors.secondary;
      case 'cancel': return colors.error;
      case 'reject': return colors.error;
      default: return colors.gray;
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
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  const quickActions = [
    {
      id: '1',
      title: 'Start Day',
      icon: 'play-circle',
      color: colors.success,
      onPress: () => console.log('Start Day'),
    },
    {
      id: '2',
      title: 'Check Schedule',
      icon: 'calendar-today',
      color: colors.primary,
      onPress: () => navigation.navigate('BookingList'),
    },
    {
      id: '3',
      title: 'My Wallet',
      icon: 'account-balance-wallet',
      color: colors.warning,
      onPress: () => navigation.navigate('AddWallet'),
    },
    {
      id: '4',
      title: 'Performance',
      icon: 'trending-up',
      color: colors.secondary,
      onPress: () => navigation.navigate('Performance'),
    },
  ];

  // Render winners of the week in the format: second winner on left, first in middle, third on right
  const renderWinnersOfWeek = () => {
    if (winnersOfWeek.length === 0) {
      return null;
    }

    // Take only first 3 winners
    const winnersToShow = winnersOfWeek.slice(0, 3);
    
    // If we have less than 3 winners, create empty slots
    while (winnersToShow.length < 3) {
      winnersToShow.push(null);
    }

    // Order: [second, first, third]
    const orderedWinners = [
      winnersToShow[1] || null,
      winnersToShow[0] || null,
      winnersToShow[2] || null,
    ];

    return (
      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mt2)}>
        {/* Left Winner (Second Position) */}
        <View style={clsx(
          styles.itemsCenter,styles.bgWinner,styles.h27,
                    styles.roundedLg,
                    styles.border,
                    styles.borderPrimary,
                    styles.p3,
                    styles.shadowSm,
                    styles.itemsCenter, 
           { width: '30%' })}>
          {orderedWinners[0] ? (
            <>
              <Image
                source={{
                  uri: imageCheck(orderedWinners[0].profileImage, 'user.png')
                }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 30,
                  borderWidth: 2,
                  borderColor: colors.gray300,
                }}
              />
              <View style={clsx(styles.mt4, styles.itemsCenter)}>
                <Text style={clsx(styles.textSm, styles.fontBold, styles.textBlack, styles.textCenter)} numberOfLines={1}>
                  {orderedWinners[0].name}
                </Text>
              </View>
            </>
          ) : (
            <View style={clsx(styles.itemsCenter)}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 30,
                backgroundColor: colors.gray100,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: colors.gray300,
                borderStyle: 'dashed',
              }}>
                <Icon name="person" size={24} color={colors.gray400} />
              </View>
              <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1)}>No Data</Text>
            </View>
          )}
        </View>

        {/* Center Winner (First Position) */}
        <View style={clsx(styles.itemsCenter,styles.bgWinner,styles.h27, 
                    styles.roundedLg,
                    styles.border,
                    styles.borderPrimary,
                    styles.p3,
                    styles.shadowSm,
                    styles.itemsCenter, { width: '35%' })}>
          {orderedWinners[1] ? (
            <>
              <Image
                source={{
                  uri: imageCheck(orderedWinners[1].profileImage, 'user.png')
                }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40, 
                  borderWidth: 3, 
                  borderColor: colors.warning,
                }}
              />
              <View style={clsx(styles.mt4, styles.itemsCenter)}>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.textCenter)} numberOfLines={1}>
                  {orderedWinners[1].name}
                </Text>
              </View>
            </>
          ) : (
            <View style={clsx(styles.itemsCenter)}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.gray100,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: colors.gray300,
                borderStyle: 'dashed',
              }}>
                <Icon name="person" size={36} color={colors.gray400} />
              </View>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>No Data</Text>
            </View>
          )}
        </View>

        {/* Right Winner (Third Position) */}
        <View style={clsx(styles.itemsCenter,styles.bgWinner,styles.h27,
                    styles.roundedLg,
                    styles.border,
                    styles.borderPrimary, 
                    styles.p3,
                    styles.shadowSm,
                    styles.itemsCenter,  { width: '30%' })}>
          {orderedWinners[2] ? (
            <>
              <Image
                source={{
                  uri: imageCheck(orderedWinners[2].profileImage, 'user.png')
                }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 30,
                  borderWidth: 2,
                  borderColor: colors.gray300,
                }}
              />
              <View style={clsx(styles.mt4, styles.itemsCenter)}>
                <Text style={clsx(styles.textSm, styles.fontBold, styles.textBlack, styles.textCenter)} numberOfLines={1}>
                  {orderedWinners[2].name}
                </Text>
              </View>
            </>
          ) : (
            <View style={clsx(styles.itemsCenter)}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.gray100,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: colors.gray300,
                borderStyle: 'dashed',
              }}>
                <Icon name="person" size={24} color={colors.gray400} />
              </View>
              <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1)}>No Data</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Custom inline styles
  const customStyles = {
    quickActionCard: {
      width: '48%',
      marginBottom: 16,
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: colors.white,
    },
    statCard: {
      width: '30%',
      minHeight: 80,
    },
  };

  if (dashboardLoading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      
      {/* ADDED: Time Slot Warning Modal */}
      <Modal
        visible={showTimeSlotModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimeSlotModal(false)}
      >
        <View style={clsx(styles.flex1, styles.justifyCenter, styles.itemsCenter, { backgroundColor: 'rgba(0,0,0,0.5)' })}>
          <View style={clsx(styles.bgWhite, styles.roundedXl, styles.p6, styles.mx5, styles.shadowXl, { maxWidth: SCREEN_WIDTH * 0.9 })}>
            <View style={clsx(styles.itemsCenter, styles.mb-4)}>
              <Icon name="schedule" size={60} color={colors.warning} />
              <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack, styles.mt4, styles.textCenter)}>
                Set Your Time Table
              </Text>
            </View>
            
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mb6, styles.textCenter)}>
              {stats.todayTimeSlots === 0 && stats.tomorrowTimeSlots === 0 
                ? "You haven't set your timetable for today or tomorrow. You won't receive any bookings until you set your availability."
                : stats.todayTimeSlots === 0 
                ? "You haven't set your timetable for today. You won't receive any bookings for today."
                : "You haven't set your timetable for tomorrow. You won't receive any bookings for tomorrow."
              }
            </Text>
            
            <Text style={clsx(styles.textBase, styles.textBlack, styles.fontMedium, styles.mb2, styles.textCenter)}>
              Please set your timetable to start receiving bookings.
            </Text>
            
            <View style={clsx(styles.flexRow, styles.justifyCenter, styles.mt6)}>
              <TouchableOpacity
                style={clsx(styles.bgPrimary, styles.px6, styles.py3, styles.roundedFull, styles.flexRow, styles.itemsCenter)}
                onPress={handleSetTimeTable}
                activeOpacity={0.8}
              >
                <Icon name="edit-calendar" size={20} color={colors.white} style={styles.mr2} />
                <Text style={clsx(styles.textWhite, styles.fontMedium, styles.textBase)}>
                  Set Time Table Now
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={clsx(styles.mt4, styles.itemsCenter)}
              onPress={() => setShowTimeSlotModal(false)}
            >
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                I'll do it later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header with Profile */}
      <View style={clsx(styles.bgPrimary, styles.px4, styles.pt2, styles.pb1)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.flex1)}>
            <View style={clsx(styles.flex1)} >
              <Text style={clsx(styles.textWhite, styles.text2xl, styles.fontBold)} numberOfLines={1} onPress={() => setLoading('sideBar', true)}>
                {user?.name || 'Technician'}
              </Text>
              <Text style={clsx(styles.textWhite, styles.textBase, styles.opacity75)} onPress={() => setLoading('sideBar', true)}>
                ID: {user?.servicemanId} . {user?.averageRating} ⭐
              </Text>
            </View>
          </View>
           
          {/* Credit Points moved to header - on right side with icon */}
          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.bgWhite,
              styles.px3,
              styles.py2,
              styles.roundedFull,
              styles.mr1
            )}
            onPress={() => navigation.navigate('AddWallet')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="coins" size={16} color={colors.primary} style={styles.mr1} />
            <Text style={clsx(styles.textPrimary, styles.fontMedium, styles.ml2)}>
              {stats.walletBalance?.toLocaleString() || '0'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.bgWhite,
              styles.px3,
              styles.py2,
              styles.roundedFull,
              styles.mr1
            )}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="bell" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

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
        contentContainerStyle={clsx(styles.pb6)}
      >
        {/* Performer of the Week Section */}
        <View style={clsx(styles.px4, styles.mt2)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb0)}>
            Performer of the Week
          </Text>
          
          {winnersOfWeek.length > 0 ? renderWinnersOfWeek() : (
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p6, styles.itemsCenter)}>
              <FontAwesome5 name="trophy" size={40} color={colors.gray300} />
              <Text style={clsx(styles.textBase, styles.textBlack, styles.mt3)}>
                No winners data available
              </Text>
            </View>
          )}
        </View>

        {/* Today's Bookings */}
        <View style={clsx(styles.px4, styles.mt6)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Today's Bookings ({stats.todayBookings})
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('BookingList', { initialTab: 'all' })}>
              <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {todayBookings.length > 0 ? (
            todayBookings.slice(0, 3).map((job) => (
              <TouchableOpacity
                key={job.id}
                style={clsx(
                  styles.bgWhite,
                  styles.roundedLg,
                  styles.p4,
                  styles.mb3,
                  styles.shadowSm
                )}
                onPress={() => navigation.navigate('BookingDetail', { booking: job.originalData })}
              >
                <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
                  <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)} numberOfLines={1}>
                    {job.service}
                  </Text>
                  <View style={clsx(
                    styles.px3,
                    styles.py1,
                    styles.roundedFull,
                    { backgroundColor: `${getStatusColor(job.status)}20` }
                  )}>
                    <Text style={clsx(
                      styles.textSm,
                      styles.fontMedium,
                      { color: getStatusColor(job.status) }
                    )}>
                      {getStatusLabel(job.status)}
                    </Text>
                  </View>
                </View>

                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                  <Icon name="person" size={16} color={colors.textLight} />
                  <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2, styles.flex1)} numberOfLines={1}>
                    {job.customerName}
                  </Text>
                </View>

                {job.time && (
                  <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                    <Icon name="schedule" size={16} color={colors.textLight} />
                    <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2)}>
                      {job.time}
                    </Text>
                  </View>
                )}

                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
                  <Icon name="location-on" size={16} color={colors.textLight} />
                  <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2, styles.flex1)} numberOfLines={2}>
                    {job.address}
                  </Text>
                </View>

              </TouchableOpacity>
            ))
          ) : (
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p6, styles.itemsCenter)}>
              <Icon name="event-busy" size={40} color={colors.gray300} />
              <Text style={clsx(styles.textBase, styles.textBlack, styles.mt3)}>
                No bookings for today
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mt1)}>
                Check back later for new bookings
              </Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={clsx(styles.px4, styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Booking Status
          </Text>
          <View style={[clsx(styles.flexRow, styles.flexWrap, styles.justifyBetween)]}>
            {quickStats.map((stat) => (
              <TouchableOpacity
                key={stat.id}
                style={[
                  clsx(
                    styles.bgWhite,
                    styles.roundedLg,
                    styles.p3,
                    styles.shadowSm,
                    styles.itemsCenter,
                  ),
                  customStyles.statCard
                ]}
                onPress={() => navigation.navigate('BookingList', { initialTab: stat.status })}
              >
                <View
                  style={[
                    clsx(styles.roundedFull, styles.p2, styles.mb2),
                    { backgroundColor: `${stat.color}20` }
                  ]}
                >
                  <Icon name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
                  {stat.count}
                </Text>
                <Text style={clsx(styles.textXs, styles.textMuted, styles.textCenter, styles.mt1)}>
                  {stat.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Earnings Summary */}
        <View style={clsx(styles.px4, styles.mt6)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Earnings Summary
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Earnings')}>
              <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>

          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadowSm)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb3)}>
              <View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Today's Earnings
                </Text>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess)}>
                  ₹{stats.todayEarnings?.toLocaleString() || '0'}
                </Text>
              </View>
              <View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Total Earnings
                </Text>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
                  ₹{stats.totalEarnings?.toLocaleString() || '0'}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={clsx(styles.mb2)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb1)}>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Weekly Target: ₹50,000
                </Text>
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary)}>
                  {Math.round((stats.todayEarnings / 50000) * 100)}%
                </Text>
              </View>
              <View style={clsx(styles.bgGray200, styles.roundedFull, styles.overflowHidden, { height: 8 })}>
                <View
                  style={[
                    clsx(styles.bgPrimary, styles.hFull, styles.roundedFull),
                    { width: `${Math.min((stats.todayEarnings / 50000) * 100, 100)}%` }
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
      <FooterMenu />
    </View>
  );
};

export default DashboardScreen;