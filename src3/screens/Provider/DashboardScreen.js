import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { AppContext } from '../../Context/AppContext';

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
    todayTimeSlots: 0,
    tomorrowTimeSlots: 0,
  });

  const [todayBookings, setTodayBookings] = useState([]);
  const [quickStats, setQuickStats] = useState([]);
  const [winnersOfWeek, setWinnersOfWeek] = useState([]);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Format date for display
  const formatDateForDisplay = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    
    return {
      dayName,
      day,
      monthName,
      fullDate: `${dayName}, ${monthName} ${day.toString().padStart(2, '0')}`,
      fullDateWithYear: `${dayName}, ${monthName} ${day}, ${date.getFullYear()}`
    };
  };

  // Get today and tomorrow dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayFormatted = formatDateForDisplay(today);
  const tomorrowFormatted = formatDateForDisplay(tomorrow);

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
          todayTimeSlots: data.todayTimeSlots || 0,
          tomorrowTimeSlots: data.tomorrowTimeSlots || 0,
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
        const todaySlots = data.todayTimeSlots || 0;
        const tomorrowSlots = data.tomorrowTimeSlots || 0;
        
        if (todaySlots === 0 || tomorrowSlots === 0) { 
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

  // Function to handle TimeTable navigation
  const handleSetTimeTable = () => {
    setShowTimeSlotModal(false);
    navigation.navigate('AvailabilityScreen');
  };

  // Function to handle date button press - navigate to separate screen
  const handleDateButtonPress = (date) => {
    // You can pass the date as parameter if needed
    navigation.navigate('AvailabilityScreen', { selectedDate: date });
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
        <TouchableOpacity activeOpacity={1} style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mt2)} 
        onPress={()=>{
          navigation.navigate('WinnersHistoryScreen');
        }}
        >
          {/* Left Winner (Second Position) */}
          <View style={clsx(
            styles.itemsCenter,styles.bgWinnerL,styles.h26,
                      styles.roundedLg,
                      styles.border,
                      styles.borderPrimary,
                      styles.p3,
                      styles.shadowSm,
                      styles.itemsCenter, 
            { width: '32%' })}>
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
                {/* <View style={clsx(styles.mt4, styles.itemsCenter)}>
                  <Text style={clsx(styles.textSm, styles.fontBold, styles.textBlack, styles.textCenter)} numberOfLines={1}>
                    {orderedWinners[0].name}
                  </Text>
                </View> */}
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
                {/* <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1)}>No Data</Text> */}
              </View>
            )}
          </View>

          {/* Center Winner (First Position) */}
          <View style={clsx(styles.itemsCenter,styles.bgWinner,styles.h26, 
                      styles.roundedLg,
                      styles.border,
                      styles.borderPrimary,
                      styles.p3,
                      styles.shadowSm,
                      styles.itemsCenter, { width: '32%' })}>
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
                {/* <View style={clsx(styles.mt4, styles.itemsCenter)}>
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.textCenter)} numberOfLines={1}>
                    {orderedWinners[1].name}
                  </Text>
                </View> */}
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
                {/* <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1)}>No Data</Text> */}
              </View>
            )}
          </View>

          {/* Right Winner (Third Position) */}
          <View style={clsx(styles.itemsCenter,styles.bgWinnerL,styles.h26,
                      styles.roundedLg,
                      styles.border,
                      styles.borderPrimary, 
                      styles.p3,
                      styles.shadowSm,
                      styles.itemsCenter,  { width: '32%' })}>
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
                {/* <View style={clsx(styles.mt4, styles.itemsCenter)}>
                  <Text style={clsx(styles.textSm, styles.fontBold, styles.textBlack, styles.textCenter)} numberOfLines={1}>
                    {orderedWinners[2].name}
                  </Text>
                </View> */}
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
                {/* <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1)}>No Data</Text> */}
              </View>
            )}
          </View>
        </TouchableOpacity>
    );
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

  // Function to handle accept booking
  const handleAcceptBooking = async (bookingId, job) => {
    try {
      setLoading(true);
      
      const response = await postData(
        { bookingId },
        Urls.bookingAccept + '/' + bookingId,
        'POST'
      );

      if (response?.success) {
        navigation.navigate('BookingDetail', { booking: job.originalData });
        
        // Refresh dashboard data
        await fetchDashboardData();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to accept booking',
        });
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to accept booking. Please try again.',
      });
    } finally {
      setLoading(false);
    }
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
      
      {/* Time Slot Warning Modal */}
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

        <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.bgWhite,
              styles.px3,
              styles.py2,
              styles.roundedSm,
              styles.mr1,
              styles.mr2
            )}
            activeOpacity={0.8}
            onPress={() => setLoading('sideBar', true)}
          >
            <FontAwesome5 name="bars" size={16} color={colors.primary} />
          </TouchableOpacity>

          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.flex1)}>
            <View style={clsx(styles.flex1)}>
              <Text 
                style={clsx(styles.textWhite, styles.text2xl, styles.fontBold)} 
                numberOfLines={1}                 
              >
                {user?.name || 'Technician'}
              </Text>
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt1)}>
                <Text 
                  style={clsx(styles.textWhite, styles.textBase, styles.opacity75, styles.mr1)} 
                >
                  ID: {user?.servicemanId} . 
                </Text>
                <Text 
                  style={clsx(styles.textWhite, styles.textBase, styles.opacity75, styles.mr1)} 
                >
                  {user?.averageRating}
                </Text>
                <Icon name="star" size={13} color="gold" />
              </View>
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
        {/* ADDED: Dual Date Button Section (Like in Screenshot) */}
        <View style={clsx(styles.px4, styles.mt4)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween)}>
            {/* Today's Date Card */}
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.bgWhite,
                styles.roundedLg,
                styles.p2,
                styles.shadowSm,
                styles.mr2,
                styles.border,
                { borderColor: stats.todayTimeSlots === 0 ? colors.error : colors.gray200 }
              )}
              onPress={() => handleDateButtonPress(today)}
              activeOpacity={0.7}
            >
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textBase, styles.fontNormal, styles.textBlack)}>
                    {todayFormatted.fullDate}
                  </Text>
                  <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt1)}>
                    <Icon 
                      name="pause-circle-filled" 
                      size={20} 
                      color={stats.todayTimeSlots === 0 ? colors.error : colors.success} 
                      style={styles.mr2}
                    />
                    <Text style={[
                      clsx(styles.textSm, styles.fontMedium),
                      { color: stats.todayTimeSlots === 0 ? colors.error : colors.textMuted }
                    ]}>
                      {stats.todayTimeSlots === 0 ? 'JOBS PAUSED' : 'JOBS ACTIVE'}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color={colors.gray400} />
              </View>
            </TouchableOpacity>

            {/* Tomorrow's Date Card */}
            <TouchableOpacity
              style={clsx(
                styles.flex1,
                styles.bgWhite,
                styles.roundedLg,
                styles.p2,
                styles.shadowSm,
                styles.ml2,
                styles.border,
                { borderColor: stats.tomorrowTimeSlots === 0 ? colors.error : colors.gray200 }
              )}
              onPress={() => handleDateButtonPress(tomorrow)}
              activeOpacity={0.7}
            >
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textBase, styles.fontNormal, styles.textBlack)}>
                    {tomorrowFormatted.fullDate}
                  </Text>
                  <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt1)}>
                    <Icon 
                      name="pause-circle-filled" 
                      size={20} 
                      color={stats.tomorrowTimeSlots === 0 ? colors.error : colors.success} 
                      style={styles.mr2}
                    />
                    <Text style={[
                      clsx(styles.textSm, styles.fontMedium),
                      { color: stats.tomorrowTimeSlots === 0 ? colors.error : colors.textMuted }
                    ]}>
                      {stats.tomorrowTimeSlots === 0 ? 'JOBS PAUSED' : 'JOBS ACTIVE'}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color={colors.gray400} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Note or Info Text Below Date Cards */}
          {(stats.todayTimeSlots === 0 || stats.tomorrowTimeSlots === 0) && (
            <View style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.mt3,
              styles.p3,
              styles.roundedMd,
              { backgroundColor: colors.warning + '20' }
            )}>
              <Icon name="info" size={16} color={colors.warning} style={styles.mr2} />
              <Text style={clsx(styles.textSm, styles.fontMedium, { color: colors.warning })}>
                {stats.todayTimeSlots === 0 && stats.tomorrowTimeSlots === 0 
                  ? "Set your time slots to start receiving bookings" 
                  : "Some days have no time slots set"
                }
              </Text>
            </View>
          )}
        </View>

        {/* Performer of the Week Section */}
        <View style={clsx(styles.px4, styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb0)}>
            Performer of the Week
          </Text>
          
          {winnersOfWeek.length > 0 ? renderWinnersOfWeek() : (
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p6, styles.itemsCenter, styles.mt2)}>
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
            todayBookings.slice(0, 3).map((job) => {
              var originalData2 = job.originalData;
              // console.log('job',originalData2)
              // Function to handle card press
              const handleCardPress = () => {
                if (job.status === 'new') {
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
                          // First accept the booking
                          handleAcceptBooking(job.id, job);
                        }
                      }
                    ]
                  );
                } else {
                  // For other statuses, directly navigate to detail
                  navigation.navigate('BookingDetail', { booking: job.originalData });
                }
              };

              return (
                <TouchableOpacity
                  key={job.id}
                  style={clsx(
                    styles.bgWhite,
                    styles.roundedLg,
                    styles.p4,
                    styles.mb3,
                    styles.shadowSm
                  )}
                  onPress={handleCardPress}
                >
                  {/* Top Section - Service & Status */}
                  <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsStart, styles.mb3)}>
                    <View style={clsx(styles.flexRow, styles.itemsCenter, styles.flex1)}>
                      <View 
                        style={[
                          clsx(styles.roundedFull, styles.p2, styles.mr3), 
                          { backgroundColor: `${getStatusColor(job.status)}20` }
                        ]}
                      >
                        <Icon 
                          name={getServiceIcon(job.service)} 
                          size={20} 
                          color={getStatusColor(job.status)} 
                        />
                      </View>
                      <View style={clsx(styles.flex1)}>
                        <Text 
                          style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb1)} 
                          numberOfLines={1}
                        >
                          {originalData2?.bookingItems[0]?.service?.name}
                        </Text>
                        <Text style={clsx(styles.textSm, styles.textMuted)}>
                          Booking ID: {job.bookingId}
                        </Text>
                      </View>
                    </View>
                    <View style={clsx(
                      styles.px3,
                      styles.py1,
                      styles.roundedFull,
                      { backgroundColor: `${getStatusColor(job.status)}20` }
                    )}>
                      <Text style={clsx(
                        styles.textXs,
                        styles.fontMedium,
                        { color: getStatusColor(job.status) }
                      )} numberOfLines={1}>
                        {getStatusLabel(job.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Customer Details */}
                  <View style={clsx(styles.mb3)}>
                    <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                      <Icon name="person" size={16} color={colors.textMuted} style={clsx(styles.mr2)} />
                      <Text style={clsx(styles.textSm, styles.textBlack, styles.flex1)} numberOfLines={1}>
                        {job.customerName}
                      </Text>
                    </View>

                    {/* <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                      <Icon name="phone" size={16} color={colors.textMuted} style={clsx(styles.mr2)} />
                      <Text style={clsx(styles.textSm, styles.textBlack, styles.flex1)} numberOfLines={1}>
                        {job.mobile}
                      </Text>
                    </View> */}

                    {job.time && (
                      <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                        <Icon name="schedule" size={16} color={colors.textMuted} style={clsx(styles.mr2)} />
                        <Text style={clsx(styles.textSm, styles.textBlack, styles.flex1)} numberOfLines={1}>
                          {job.time}
                        </Text>
                      </View>
                    )}

                    {/* <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb2)}>
                      <Icon name="location-on" size={16} color={colors.textMuted} style={clsx(styles.mr2, styles.mt1)} />
                      <Text style={clsx(styles.textSm, styles.textBlack, styles.flex1)} numberOfLines={2}>
                        {job.address}
                      </Text>
                    </View> */}
                  </View>

                  {/* Bottom Section - Amount & Action Info */}
                  <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
                    <View>
                      {/* <Text style={clsx(styles.textSm, styles.textMuted, styles.mb1)}>
                        Total Amount
                      </Text>
                      <Text style={clsx(styles.textXl, styles.fontBold, styles.textPrimary)}>
                        ₹{job.amount}
                      </Text> */}
                    </View>
                    
                    {/* Status based instruction text */}
                    {job.status === 'new' ? (
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
                      <>
                        {/* <View style={clsx(
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
                        </View> */}
                      </>
                    )}
                  </View>
                  
                </TouchableOpacity>
              );
            })
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

      </ScrollView>
    </View> 
  );
};

export default DashboardScreen;