import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Picker } from '@react-native-picker/picker';
import { AppContext } from '../../../Context/AppContext';
import { colors } from '../../../styles/colors';
import styles, { clsx, scaleSize } from '../../../styles/globalStyles';
import Header from '../../../components/Common/Header';

const { width } = Dimensions.get('window');

const WinnersHistoryScreen = ({ navigation }) => {
  const { postData, Urls, Toast, user, imageCheck } = useContext(AppContext);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [winnersData, setWinnersData] = useState([]);
  
  // Month/Year selectors
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Filtered data based on selected month/year
  const [filteredWeeks, setFilteredWeeks] = useState([]);

  // Months array for dropdown
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Years array
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  const fetchWinnersHistory = async (month = selectedMonth, year = selectedYear) => {
    try {
      setLoading(true);
      
      const response = await postData(
        { month, year },
        Urls.WinnersHistoryEndpoint,
        'GET',
        { showErrorMessage: false, showSuccessMessage: false }
      );

      if (response?.success) {
        const data = response.data || [];
        setWinnersData(data);
        
        // Filter weeks for selected month/year
        filterWeeksByMonthYear(data, month, year);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to load winners history',
        });
      }
    } catch (error) {
      console.error('Error fetching winners history:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load winners history',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterWeeksByMonthYear = (data, month, year) => {
    if (!data || data.length === 0) {
      setFilteredWeeks([]);
      return;
    }

    const filtered = data.filter(week => {
      const weekStart = new Date(week.weekStart);
      const weekEnd = new Date(week.weekEnd);
      
      // Check if the week overlaps with the selected month/year
      const weekStartMonth = weekStart.getMonth() + 1;
      const weekStartYear = weekStart.getFullYear();
      const weekEndMonth = weekEnd.getMonth() + 1;
      const weekEndYear = weekEnd.getFullYear();
      
      return (
        (weekStartYear === year && weekStartMonth === month) ||
        (weekEndYear === year && weekEndMonth === month)
      );
    });

    setFilteredWeeks(filtered);
  };

  useEffect(() => {
    fetchWinnersHistory();
  }, []);

  useEffect(() => {
    // Re-filter when month/year changes
    filterWeeksByMonthYear(winnersData, selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWinnersHistory(selectedMonth, selectedYear).finally(() => {
      setRefreshing(false);
      // Toast.show({
      //   type: 'success',
      //   text1: 'Refreshed',
      //   text2: 'Winners history updated',
      // });
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getWeekRange = (week) => {
    if (!week) return '';
    const start = formatDate(week.weekStart);
    const end = formatDate(week.weekEnd);
    return `${start} - ${end}`;
  };

  const getMonthName = (monthNumber) => {
    return months.find(m => m.value === monthNumber)?.label || '';
  };

  const renderWinnerItem = (winner, index) => {
    const isCurrentUser = winner.servicemanId === user?._id;
    
    // Position specific styling
    let containerStyle, imageStyle, nameStyle, positionStyle, containerWidth;
    
    switch (index) {
      case 0: // First place (center)
        containerWidth = '35%';
        containerStyle = { marginHorizontal: '5%' };
        imageStyle = localStyles.firstPlaceImage;
        nameStyle = localStyles.firstPlaceName;
        positionStyle = localStyles.firstPosition;
        break;
      case 1: // Second place (left)
        containerWidth = '30%';
        imageStyle = localStyles.secondPlaceImage;
        nameStyle = localStyles.secondPlaceName;
        positionStyle = localStyles.secondPosition;
        break;
      case 2: // Third place (right)
        containerWidth = '30%';
        imageStyle = localStyles.thirdPlaceImage;
        nameStyle = localStyles.thirdPlaceName;
        positionStyle = localStyles.thirdPosition;
        break;
      default: // Other positions (4+)
        containerWidth = '28%';
        imageStyle = localStyles.otherPlaceImage;
        nameStyle = localStyles.otherPlaceName;
        positionStyle = localStyles.otherPosition;
    }

    return (
      <View style={[localStyles.winnerContainer, { width: containerWidth }, containerStyle]}>
        {/* Position Badge */}
        <View style={[localStyles.positionStyle, positionStyle]}>
          <FontAwesome5 
            name={index === 0 ? 'crown' : index === 1 ? 'medal' : index === 2 ? 'award' : 'trophy'} 
            size={index === 0 ? 20 : index === 1 ? 18 : index === 2 ? 16 : 14} 
            color={index === 0 ? colors.warning : index === 1 ? colors.gray500 : index === 2 ? colors.secondary : colors.primary} 
          />
          <Text style={localStyles.positionText}>#{index + 1}</Text>
        </View>
        
        {/* Profile Image */}
        <View style={localStyles.imageContainer}>
          <Image
            source={{
              uri: imageCheck(winner.profileImage, 'user.png')
            }}
            style={imageStyle}
            defaultSource={require('../../../assets/img/user.png')}
          />
          {isCurrentUser && (
            <View style={localStyles.youBadge}>
              <Text style={localStyles.youText}>YOU</Text>
            </View>
          )}
        </View>
        
        {/* Name */}
        <Text style={nameStyle} numberOfLines={1}>
          {winner.name}
        </Text>
        
        {/* Rating */}
        <View style={localStyles.ratingContainer}>
          <Icon name="star" size={14} color={colors.warning} />
          <Text style={localStyles.ratingText}>{winner.avgRating?.toFixed(1) || '0.0'}</Text>
        </View>
        
        {/* Stats */}
        <View style={localStyles.statsRow}>
          <View style={localStyles.statItem}>
            <Text style={localStyles.statNumber}>{winner.completedBookings}</Text>
            <Text style={localStyles.statLabel}>Done</Text>
          </View>
          <View style={localStyles.divider} />
          <View style={localStyles.statItem}>
            <Text style={localStyles.statNumber}>{winner.activeHours}</Text>
            <Text style={localStyles.statLabel}>Hrs</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderWinnersOfWeek = (winners) => {
    if (winners.length === 0) {
      return (
        <View style={localStyles.noWinnersContainer}>
          <FontAwesome5 name="trophy" size={40} color={colors.gray300} />
          <Text style={clsx(styles.textBase, styles.textBlack, styles.mt3)}>
            No winners data available
          </Text>
        </View>
      );
    }
  
    // Take only first 3 winners
    const winnersToShow = winners.slice(0, 3);
    
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
      <View style={localStyles.winnersContainer}>
        {/* Left Winner (Second Position) */}
        <View style={localStyles.winnerCard}>
          {orderedWinners[0] ? (
            <>
              <Image
                source={{
                  uri: imageCheck(orderedWinners[0].profileImage, 'user.png')
                }}
                style={localStyles.secondPlaceImage}
                defaultSource={require('../../../assets/img/user.png')}
              />
              <View style={localStyles.nameContainer}>
                <Text style={localStyles.secondPlaceName} numberOfLines={1}>
                  {orderedWinners[0].name}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={localStyles.placeholderImage}>
                <Icon name="person" size={24} color={colors.gray400} />
              </View>
              <Text style={localStyles.placeholderName}>Coming Soon</Text>
            </>
          )}
        </View>
  
        {/* Center Winner (First Position) */}
        <View style={[localStyles.winnerCard, localStyles.firstPlaceCard]}>
          {orderedWinners[1] ? (
            <>
              <Image
                source={{
                  uri: imageCheck(orderedWinners[1].profileImage, 'user.png')
                }}
                style={localStyles.firstPlaceImage}
                defaultSource={require('../../../assets/img/user.png')}
              />
              <View style={localStyles.nameContainer}>
                <Text style={localStyles.firstPlaceName} numberOfLines={1}>
                  {orderedWinners[1].name}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={[localStyles.placeholderImage, localStyles.firstPlaceholderImage]}>
                <Icon name="person" size={36} color={colors.gray400} />
              </View>
              <Text style={localStyles.placeholderName}>Coming Soon</Text>
            </>
          )}
        </View>
  
        {/* Right Winner (Third Position) */}
        <View style={localStyles.winnerCard}>
          {orderedWinners[2] ? (
            <>
              <Image
                source={{
                  uri: imageCheck(orderedWinners[2].profileImage, 'user.png')
                }}
                style={localStyles.thirdPlaceImage}
                defaultSource={require('../../../assets/img/user.png')}
              />
              <View style={localStyles.nameContainer}>
                <Text style={localStyles.thirdPlaceName} numberOfLines={1}>
                  {orderedWinners[2].name}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={localStyles.placeholderImage}>
                <Icon name="person" size={24} color={colors.gray400} />
              </View>
              <Text style={localStyles.placeholderName}>Coming Soon</Text>
            </>
          )}
        </View>
      </View>
    );
  };


  const renderWeekSection = (week) => (
    <View style={localStyles.weekSection}>
      {/* Week Header */}
      <View style={localStyles.weekHeader}>
        <View style={localStyles.weekTitleContainer}>
          <Text style={localStyles.weekTitle}>Week {week.weekNumber}</Text>
          <Text style={localStyles.weekDate}>{getWeekRange(week)}</Text>
        </View>
        <Text style={localStyles.weekWinnerCount}>
          {week.winners?.length || 0} Winners
        </Text>
      </View>
      
      {/* Winners Display */}
      {renderWinnersOfWeek(week.winners || [])}
      
      {/* Other Winners (positions 4+) */}
      {week.winners && week.winners.length > 3 && (
        <View style={localStyles.otherWinnersContainer}>
          <Text style={localStyles.otherWinnersTitle}>Other Top Performers</Text>
          <View style={localStyles.otherWinnersGrid}>
            {week.winners.slice(3).map((winner, index) => (
              <View key={winner.servicemanId} style={[localStyles.otherWinnerItem]}>
                {renderWinnerItem(winner, index + 3)}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading winners history...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Winners of the Week"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        showProfile={false}
      />
      
      {/* Month/Year Selector */}
      <View style={clsx(styles.bgPrimary, styles.px4, styles.pt, styles.pb4)}>
        <View style={localStyles.selectorContainer}>
          <View style={localStyles.pickerWrapper}>
            <Text style={localStyles.pickerLabel}>Month:</Text>
            <View style={localStyles.pickerContainer}>
              <Picker
                selectedValue={selectedMonth}
                onValueChange={(itemValue) => {
                  setSelectedMonth(itemValue);
                  fetchWinnersHistory(itemValue, selectedYear);
                }}
                style={localStyles.picker}
                dropdownIconColor={colors.primary}
              >
                {months.map((month) => (
                  <Picker.Item
                    key={month.value}
                    label={month.label}
                    value={month.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={localStyles.pickerWrapper}>
            <Text style={localStyles.pickerLabel}>Year:</Text>
            <View style={localStyles.pickerContainer}>
              <Picker
                selectedValue={selectedYear}
                onValueChange={(itemValue) => {
                  setSelectedYear(itemValue);
                  fetchWinnersHistory(selectedMonth, itemValue);
                }}
                style={localStyles.picker}
                dropdownIconColor={colors.primary}
              >
                {years.map((year) => (
                  <Picker.Item
                    key={year}
                    label={year.toString()}
                    value={year}
                  />
                ))}
              </Picker>
            </View>
          </View>
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
        {winnersData.length === 0 ? (
          <View style={localStyles.emptyContainer}>
            <FontAwesome5 name="trophy" size={60} color={colors.gray300} />
            <Text style={localStyles.emptyTitle}>No Winners History</Text>
            <Text style={localStyles.emptyText}>
              Weekly winners data will appear here
            </Text>
            <TouchableOpacity
              style={localStyles.refreshButton}
              onPress={onRefresh}
            >
              <Icon name="refresh" size={20} color={colors.white} />
              <Text style={localStyles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : filteredWeeks.length === 0 ? (
          <View style={localStyles.emptyContainer}>
            <FontAwesome5 name="calendar-times" size={60} color={colors.gray300} />
            <Text style={localStyles.emptyTitle}>No Data for Selected Month</Text>
            <Text style={localStyles.emptyText}>
              No winners found for {getMonthName(selectedMonth)} {selectedYear}
            </Text>
            <Text style={localStyles.emptySubtext}>
              Try selecting a different month or year
            </Text>
          </View>
        ) : (
          <View style={localStyles.contentContainer}>
            {/* Render all weeks one after another */}
            {filteredWeeks.map((week) => (
              <View key={week.weekNumber}>
                {renderWeekSection(week)}
                {/* Add separator between weeks except for last one */}
                {filteredWeeks.indexOf(week) < filteredWeeks.length - 1 && (
                  <View style={localStyles.weekSeparator} />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 6,
  },
  pickerLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  picker: {
    height: 55,
    color: colors.textDark,
  },
  contentContainer: {
    padding: 16,
  },
  weekSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weekTitleContainer: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  weekDate: {
    fontSize: 14,
    color: colors.textLight,
  },
  weekWinnerCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    backgroundColor: colors.secondary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weekSeparator: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: 16,
  },
  winnersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  winnerCard: {
    alignItems: 'center',
    width: '30%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.winner,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: scaleSize(145),
    // minHeight: 180,
    justifyContent: 'center',
  },
  firstPlaceCard: {
    width: '35%',
    marginHorizontal: '2.5%',
  },
  firstPlaceImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.warning,
  },
  secondPlaceImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: colors.gray300,
  },
  thirdPlaceImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.gray300,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray300,
    borderStyle: 'dashed',
  },
  firstPlaceholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.gray300,
    borderStyle: 'dashed',
  },
  nameContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  firstPlaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textBlack,
    textAlign: 'center',
  },
  secondPlaceName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textBlack,
    textAlign: 'center',
  },
  thirdPlaceName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textBlack,
    textAlign: 'center',
  },
  placeholderName: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  winnerContainer: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.winner,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  positionStyle: {
    position: 'absolute',
    top: -15,
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  firstPosition: {
    backgroundColor: colors.warning + '20',
    borderWidth: 2,
    borderColor: colors.warning,
  },
  secondPosition: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  thirdPosition: {
    backgroundColor: colors.secondary + '20',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  otherPosition: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  positionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textDark,
    marginTop: 2,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  firstPlaceImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.warning,
  },
  secondPlaceImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: colors.gray500,
  },
  thirdPlaceImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  otherPlaceImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  firstPlaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  secondPlaceName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  thirdPlaceName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  otherPlaceName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: 8,
    padding: 6,
    width: '100%',
    justifyContent: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.gray300,
  },
  youBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  youText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  otherWinnersContainer: {
    marginTop: 20,
  },
  otherWinnersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  otherWinnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  otherWinnerItem: {
    width: '48%',
    marginBottom: 16,
  },
  noWinnersContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 20,
  },
  noWinnersText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginTop: 20,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.gray400,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 20,
  },
  refreshButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default WinnersHistoryScreen;