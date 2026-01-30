import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { AppContext } from '../../../Context/AppContext';
import { colors } from '../../../styles/colors';
import styles, { clsx } from '../../../styles/globalStyles';
import Header from '../../../components/Common/Header';

const { width } = Dimensions.get('window');

const TargetScreen = ({ navigation }) => {
  const { postData, Urls, Toast, user } = useContext(AppContext);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [targetData, setTargetData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const fetchTargetData = async (month = selectedMonth, year = selectedYear) => {
    try {
      setLoading(true);
      
      // API call to fetch target data for selected month/year
      const response = await postData(
        { month, year },
        Urls.targetEndpoint, // Replace with your actual endpoint
        'GET',
        { showErrorMessage: false, showSuccessMessage: false }
      );

      if (response?.success) {
        setTargetData(response);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to load target data',
        });
      }
    } catch (error) {
      console.error('Error fetching target data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load target data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargetData();
  }, []);

  useEffect(() => {
    fetchTargetData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTargetData().finally(() => {
      setRefreshing(false);
      Toast.show({
        type: 'success',
        text1: 'Refreshed',
        text2: 'Target data updated',
      });
    });
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return colors.success;
    if (percentage >= 50) return colors.primary;
    return colors.warning;
  };

  // Calculate completion rate
  const calculateCompletionRate = () => {
    if (!targetData) return 0;
    const total = targetData.new + targetData.accept + targetData.complete + targetData.cancel;
    if (total === 0) return 0;
    return (targetData.complete / total) * 100;
  };

  // Calculate acceptance rate
  const calculateAcceptanceRate = () => {
    if (!targetData) return 0;
    const totalBookings = targetData.new + targetData.accept + targetData.complete + targetData.cancel;
    if (totalBookings === 0) return 0;
    return ((targetData.accept + targetData.complete) / totalBookings) * 100;
  };

  // Calculate total bookings
  const calculateTotalBookings = () => {
    if (!targetData) return 0;
    return targetData.new + targetData.accept + targetData.complete + targetData.cancel;
  };

  // Calculate success rate
  const calculateSuccessRate = () => {
    if (!targetData) return 0;
    const totalCompleted = targetData.complete + targetData.cancel;
    if (totalCompleted === 0) return 0;
    return (targetData.complete / totalCompleted) * 100;
  };

  const renderStatCard = (title, value, icon, color, subtitle = '') => (
    <View style={[localStyles.statCard, { backgroundColor: `${color}15` }]}>
      <View style={localStyles.statHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={[localStyles.statValue, { color }]}>{value}</Text>
      </View>
      <Text style={localStyles.statTitle}>{title}</Text>
      {subtitle ? <Text style={localStyles.statSubtitle}>{subtitle}</Text> : null}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading performance data...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Performance Targets"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        rightActionIcon="refresh"
        showProfile={false}
      />
      
      {/* Month/Year Selector */}
      <View style={clsx(styles.bgPrimary, styles.px4, styles.pt2, styles.pb4)}>
        <View style={localStyles.selectorContainer}>
          <View style={localStyles.pickerWrapper}>
            <Text style={localStyles.pickerLabel}>Month:</Text>
            <View style={localStyles.pickerContainer}>
              <Picker
                selectedValue={selectedMonth}
                onValueChange={(itemValue) => setSelectedMonth(itemValue)}
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
                onValueChange={(itemValue) => setSelectedYear(itemValue)}
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
        contentContainerStyle={clsx(styles.px4, styles.pb6, styles.pt8)}
      >
        {/* Performance Overview Card */}
        <View style={localStyles.mainCard}>
          <Text style={localStyles.cardTitle}>
            Performance Overview - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </Text>
          
          <View style={localStyles.achievementContainer}>
            <View style={localStyles.targetCircle}>
              <Text style={localStyles.targetPercentage}>
                {calculateCompletionRate().toFixed(1)}%
              </Text>
              <Text style={localStyles.targetLabel}>Completion Rate</Text>
            </View>
            
            <View style={localStyles.targetDetails}>
              <View style={localStyles.targetRow}>
                <Text style={localStyles.targetDetailLabel}>Total Bookings:</Text>
                <Text style={localStyles.targetDetailValue}>
                  {calculateTotalBookings()}
                </Text>
              </View>
              <View style={localStyles.targetRow}>
                <Text style={localStyles.targetDetailLabel}>Completed:</Text>
                <Text style={[localStyles.targetDetailValue, { color: colors.success }]}>
                  {targetData?.complete || 0}
                </Text>
              </View>
              {/* <View style={localStyles.targetRow}>
                <Text style={localStyles.targetDetailLabel}>Acceptance Rate:</Text>
                <Text style={[localStyles.targetDetailValue, { color: getPerformanceColor(calculateAcceptanceRate()) }]}>
                  {calculateAcceptanceRate().toFixed(1)}%
                </Text>
              </View> */}
            </View>
          </View>

          {/* Performance Summary */}
          {/* <View style={localStyles.summaryContainer}>
            <View style={localStyles.summaryItem}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={localStyles.summaryText}>
                Success Rate: {calculateSuccessRate().toFixed(1)}%
              </Text>
            </View>
            <View style={localStyles.summaryItem}>
              <Icon name="schedule" size={20} color={colors.primary} />
              <Text style={localStyles.summaryText}>
                Active Hours: {targetData?.totalActiveHours || 0} hrs
              </Text>
            </View>
          </View> */}
        </View>

        {/* Booking Status Stats */}
        <Text style={localStyles.sectionTitle}>Booking Statistics</Text>
        <View style={localStyles.statsGrid}>
          {renderStatCard(
            'New Bookings',
            targetData?.new?.toString() || '0',
            'fiber-new',
            colors.info,
            'Pending acceptance'
          )}
          
          {renderStatCard(
            'Accepted',
            targetData?.accept?.toString() || '0',
            'check-circle',
            colors.primary,
            'In progress'
          )}
          
          {renderStatCard(
            'Completed',
            targetData?.complete?.toString() || '0',
            'task-alt',
            colors.success,
            'Successful deliveries'
          )}
          
          {renderStatCard(
            'Cancelled',
            targetData?.cancel?.toString() || '0',
            'cancel',
            colors.error,
            'Lost opportunities'
          )}
        </View>

        
        <View style={localStyles.timeStatsContainer}>
          <View style={localStyles.timeCard}>
            <View style={[localStyles.timeIconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <Icon name="timer" size={24} color={colors.primary} />
            </View>
            <View style={localStyles.timeContent}>
              <Text style={localStyles.timeValue}>{targetData?.totalActiveHours || 0} hrs</Text>
              <Text style={localStyles.timeLabel}>Active Hours</Text>
              <Text style={localStyles.timeSubtitle}>Productive work time</Text>
            </View>
          </View>
          
          <View style={localStyles.timeCard}>
            <View style={[localStyles.timeIconContainer, { backgroundColor: `${colors.warning}20` }]}>
              <Icon name="beach-access" size={24} color={colors.warning} />
            </View>
            <View style={localStyles.timeContent}>
              <Text style={localStyles.timeValue}>{targetData?.totalLeaveHours || 0} hrs</Text>
              <Text style={localStyles.timeLabel}>Leave Hours</Text>
              <Text style={localStyles.timeSubtitle}>Time off / Break</Text>
            </View>
          </View>
        </View>
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
  mainCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  targetCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: colors.primary,
    marginRight: 20,
  },
  targetPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  targetLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  targetDetails: {
    flex: 1,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  targetDetailLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  targetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 13,
    color: colors.textDark,
    marginLeft: 8,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  statSubtitle: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  timeStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContent: {
    marginLeft: 12,
    flex: 1,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  timeLabel: {
    fontSize: 14,
    color: colors.textDark,
    marginTop: 2,
  },
  timeSubtitle: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  efficiencyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  efficiencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 15,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  tipsCard: {
    backgroundColor: colors.info + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.textDark,
    marginLeft: 8,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 6,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default TargetScreen;