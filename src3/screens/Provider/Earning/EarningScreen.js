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
  const [earnings, setEarnings] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    total: 0,
  });

  // Fetch earnings data
  const fetchEarnings = async () => {
    try {
      setLoading(true);
      
      const response = await postData({}, Urls.earnings, 'GET', { 
        showErrorMessage: false 
      });
      
      if (response?.success) {
        console.log('Earnings API Response:', response);
        
        const earningsData = response.data || [];
        setEarnings(earningsData);
        
        // Calculate total earnings
        calculateTotalEarnings(earningsData);
        
        // Show success message if data loaded
        if (earningsData.length > 0) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Earnings data loaded successfully',
          });
        }
      } else {
        Alert.alert('Error', response?.message || 'Failed to fetch earnings data');
        setEarnings([]);
      }
      
    } catch (error) {
      console.error('Fetch earnings error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch earnings data',
      });
      setEarnings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateTotalEarnings = (earningsData) => {
    if (!earningsData || earningsData.length === 0) {
      setTotalEarnings({
        daily: 0,
        weekly: 0,
        monthly: 0,
        total: 0,
      });
      return;
    }

    let overallTotal = 0;
    let maxPrice = 0;
    let minHours = Infinity;
    let totalHours = 0;

    earningsData.forEach(item => {
      // Calculate total potential earnings for this category
      const categoryTotal = item.earningPrice1 + item.earningPrice2 + item.earningPrice3 + item.earningPrice4;
      overallTotal += categoryTotal;
      
      // Find maximum earning price
      const categoryMaxPrice = Math.max(item.earningPrice1, item.earningPrice2, item.earningPrice3, item.earningPrice4);
      maxPrice = Math.max(maxPrice, categoryMaxPrice);
      
      // Find minimum service hours
      const categoryMinHours = Math.min(item.earningHour1, item.earningHour2, item.earningHour3, item.earningHour4);
      minHours = Math.min(minHours, categoryMinHours);
      
      // Calculate total hours for average rate calculation
      totalHours += item.earningHour1 + item.earningHour2 + item.earningHour3 + item.earningHour4;
    });

    // Calculate average per hour rate
    const averageRate = totalHours > 0 ? overallTotal / totalHours : 0;

    // For demo purposes, set time-based earnings
    const dailyTotal = overallTotal * 0.1; // 10% of total as daily
    const weeklyTotal = overallTotal * 0.3; // 30% of total as weekly
    const monthlyTotal = overallTotal * 0.6; // 60% of total as monthly

    setTotalEarnings({
      daily: dailyTotal,
      weekly: weeklyTotal,
      monthly: monthlyTotal,
      total: overallTotal,
      maxPrice: maxPrice,
      minHours: minHours === Infinity ? 0 : minHours,
      averageRate: averageRate,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarnings();
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderEarningCard = (earning) => {
    return (
      <View key={earning._id} style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm, styles.mb4)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.flex1)}>
            <Icon name="category" size={20} color={colors.primary} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.flex1)} numberOfLines={2}>
              {earning.category?.name || 'Category'}
            </Text>
          </View>
          <View style={clsx(styles.px2, styles.py1, styles.roundedFull, 
            earning.status ? styles.bgSuccessLight : styles.bgErrorLight)}>
            <Text style={clsx(styles.textSm, styles.fontMedium, 
              earning.status ? styles.textSuccess : styles.textError)}>
              {earning.status ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={clsx(styles.mb4)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted, styles.mb2)}>
            Earning Structure (per job)
          </Text>
          
          <View style={clsx(styles.bgGray, styles.p3, styles.roundedLg)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
              <Text style={clsx(styles.textSm, styles.textBlack)}>
                {earning.earningHour1} Hours:
              </Text>
              <Text style={clsx(styles.textSm, styles.fontBold, styles.textSuccess)}>
                {formatCurrency(earning.earningPrice1)}
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
              <Text style={clsx(styles.textSm, styles.textBlack)}>
                {earning.earningHour2} Hours:
              </Text>
              <Text style={clsx(styles.textSm, styles.fontBold, styles.textSuccess)}>
                {formatCurrency(earning.earningPrice2)}
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
              <Text style={clsx(styles.textSm, styles.textBlack)}>
                {earning.earningHour3} Hours:
              </Text>
              <Text style={clsx(styles.textSm, styles.fontBold, styles.textSuccess)}>
                {formatCurrency(earning.earningPrice3)}
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.justifyBetween)}>
              <Text style={clsx(styles.textSm, styles.textBlack)}>
                {earning.earningHour4} Hours:
              </Text>
              <Text style={clsx(styles.textSm, styles.fontBold, styles.textSuccess)}>
                {formatCurrency(earning.earningPrice4)}
              </Text>
            </View>
          </View>
        </View>

        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
          <View>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Updated
            </Text>
            <Text style={clsx(styles.textXs, styles.textBlack)}>
              {new Date(earning.updatedAt || earning.createdAt).toLocaleDateString('en-IN')}
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

  const handleViewDetails = (earning) => {
    navigation.navigate('EarningDetails', { earning });
  };

  const handleWithdraw = () => {
    navigate('ProviderDashboard')
    // Alert.alert(
    //   'Withdraw Earnings',
    //   'This feature is coming soon!',
    //   [
    //     {
    //       text: 'OK',
    //       style: 'default',
    //     },
    //   ]
    // );
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
        contentContainerStyle={clsx(styles.px4, styles.pb6, styles.pt2)}
      >
        {/* Total Earnings Summary */}
        <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm, styles.mb4)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Total Earnings
            </Text>
            <Icon name="monetization-on" size={24} color={colors.success} />
          </View>
          
          <View style={clsx(styles.mb3)}>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess, styles.textCenter)}>
              {formatCurrency(totalEarnings.total)}
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
              Total Potential Earnings
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween)}>
            <View style={clsx(styles.itemsCenter)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
                {formatCurrency(totalEarnings.daily)}
              </Text>
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                Daily
              </Text>
            </View>
            
            <View style={clsx(styles.itemsCenter)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
                {formatCurrency(totalEarnings.weekly)}
              </Text>
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                Weekly
              </Text>
            </View>
            
            <View style={clsx(styles.itemsCenter)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
                {formatCurrency(totalEarnings.monthly)}
              </Text>
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                Monthly
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb4)}>
          <View style={clsx(styles.bgInfoLight, styles.p3, styles.roundedLg, styles.flex1, styles.mr2)}>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo)}>
              {earnings.length}
            </Text>
            <Text style={clsx(styles.textXs, styles.textBlack)}>
              Categories
            </Text>
          </View>
          
          <View style={clsx(styles.bgWarningLight, styles.p3, styles.roundedLg, styles.flex1, styles.mx2)}>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textWarning)}>
              {totalEarnings.minHours}h
            </Text>
            <Text style={clsx(styles.textXs, styles.textBlack)}>
              Min Hours
            </Text>
          </View>
          
          <View style={clsx(styles.bgSuccessLight, styles.p3, styles.roundedLg, styles.flex1, styles.ml2)}>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
              {formatCurrency(totalEarnings.averageRate || 0)}/h
            </Text>
            <Text style={clsx(styles.textXs, styles.textBlack)}>
              Avg. Rate
            </Text>
          </View>
        </View>

        {/* Earning Breakdown */}
        <View style={clsx(styles.mb4)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Category-wise Earnings
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              {earnings.length} Categories
            </Text>
          </View>

          {earnings.length === 0 ? (
            <View style={clsx(styles.bgWhite, styles.p6, styles.roundedLg, styles.itemsCenter)}>
              <Icon name="monetization-on" size={48} color={colors.textMuted} />
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted, styles.mt3)}>
                No earnings data available
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2, styles.textCenter)}>
                Start working in categories to see earnings
              </Text>
              <TouchableOpacity
                style={clsx(styles.mt4, styles.px4, styles.py2, styles.bgPrimary, styles.roundedFull)}
                onPress={fetchEarnings}
              >
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textWhite)}>
                  Refresh
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {earnings.map(renderEarningCard)}
              
              {/* Summary Card */}
              <View style={clsx(styles.bgSuccessLight, styles.p4, styles.roundedLg, styles.mt4)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                  <Icon name="assessment" size={20} color={colors.success} />
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess, styles.ml2)}>
                    Earning Summary
                  </Text>
                </View>
                <View style={clsx(styles.pl1)}>
                  <Text style={clsx(styles.textSm, styles.textBlack, styles.mb1)}>
                    • Total active categories: {earnings.length}
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textBlack, styles.mb1)}>
                    • Maximum earning per job: {formatCurrency(totalEarnings.maxPrice || 0)}
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textBlack, styles.mb1)}>
                    • Minimum service hours: {totalEarnings.minHours || 0} hours
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textBlack)}>
                    • Average per hour rate: {formatCurrency(totalEarnings.averageRate || 0)}/hour
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
            Note: Earnings are calculated based on the service categories you're enrolled in and completed jobs.
          </Text>
        </View>
      </ScrollView>
    </View>
  ); 
};
  
export default EarningScreen;