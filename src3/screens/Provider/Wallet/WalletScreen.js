import React, { useState, useEffect } from 'react';
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

const WalletScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    total: 0,
  });

  // Sample earning data from API
  const sampleEarningData = [
    {
      "_id": "692a9733dd95ad94ee8a9d4d",
      "categoryId": "691c1bfae53e3e7330a90928",
      "earningHour1": 4,
      "earningPrice1": 5000,
      "earningHour2": 6,
      "earningPrice2": 8000,
      "earningHour3": 8,
      "earningPrice3": 12000,
      "earningHour4": 12,
      "earningPrice4": 25000,
      "status": true,
      "createdBy": "68e617f638867a5a737b161f",
      "updatedBy": null,
      "createdAt": "2025-11-29T06:48:19.784Z",
      "updatedAt": "2025-11-29T06:48:19.784Z",
      "__v": 0,
      "category": {
        "_id": "691c1bfae53e3e7330a90928",
        "name": "Kitchen Appliances Repair & Services",
        "image": "uploads/category/1763449850546-392715050.jpg",
        "icon": "uploads/category/1763449850547-106991991.svg",
        "fullDescription": "Kitchen Appliances Repair & Services",
        "status": true,
        "createdBy": "68e617f638867a5a737b161f",
        "updatedBy": null,
        "createdAt": "2025-11-18T07:10:50.550Z",
        "updatedAt": "2025-11-18T07:10:50.669Z",
        "__v": 0,
        "slug": "kitchen-appliances-repair-services"
      }
    },
    {
      "_id": "69159e53760d365effa921ec",
      "categoryId": "691c1abfe53e3e7330a908fa",
      "earningHour1": 4,
      "earningPrice1": 6000,
      "earningHour2": 6,
      "earningPrice2": 8000,
      "earningHour3": 8,
      "earningPrice3": 15000,
      "earningHour4": 12,
      "earningPrice4": 25000,
      "status": true,
      "createdBy": "68e617f638867a5a737b161f",
      "updatedBy": "68e617f638867a5a737b161f",
      "createdAt": "2025-11-13T09:01:07.202Z",
      "updatedAt": "2025-11-20T11:47:27.680Z",
      "__v": 0,
      "category": {
        "_id": "691c1abfe53e3e7330a908fa",
        "name": "AC Home Appliance Repair & Services",
        "image": "uploads/category/1764762961931-852835782.svg",
        "icon": "uploads/category/1763449535084-626930616.svg",
        "fullDescription": "AC Home Appliance Repair & Services",
        "status": true,
        "createdBy": "68e617f638867a5a737b161f",
        "updatedBy": "68e617f638867a5a737b161f",
        "createdAt": "2025-11-18T07:05:35.091Z",
        "updatedAt": "2025-12-03T11:56:01.935Z",
        "__v": 0,
        "slug": "ac-home-appliance-repair-services"
      }
    }
  ];

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use sample data
      setEarnings(sampleEarningData);
      
      // Calculate total earnings
      calculateTotalEarnings(sampleEarningData);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch earnings data');
      console.error('Fetch earnings error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateTotalEarnings = (earningsData) => {
    // Calculate totals based on your business logic
    // This is a sample calculation - adjust according to your needs
    let dailyTotal = 0;
    let weeklyTotal = 0;
    let monthlyTotal = 0;
    let overallTotal = 0;

    earningsData.forEach(item => {
      // Example: Sum of all earning prices for different time periods
      overallTotal += item.earningPrice1 + item.earningPrice2 + item.earningPrice3 + item.earningPrice4;
    });

    // For demo purposes, set some sample values
    dailyTotal = overallTotal * 0.1; // 10% of total as daily
    weeklyTotal = overallTotal * 0.3; // 30% of total as weekly
    monthlyTotal = overallTotal * 0.6; // 60% of total as monthly

    setTotalEarnings({
      daily: dailyTotal,
      weekly: weeklyTotal,
      monthly: monthlyTotal,
      total: overallTotal,
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderEarningCard = (earning) => {
    return (
      <View key={earning._id} style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm, styles.mb4)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
            {earning.category.name}
          </Text>
          <View style={clsx(styles.px2, styles.py1, styles.bgSuccessLight, styles.roundedFull)}>
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textSuccess)}>
              Active
            </Text>
          </View>
        </View>

        <View style={clsx(styles.mb4)}>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted, styles.mb2)}>
            Earning Structure
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
              {new Date(earning.updatedAt).toLocaleDateString('en-IN')}
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
    Alert.alert(
      'Withdraw Earnings',
      'Are you sure you want to withdraw your earnings?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Withdraw',
          onPress: () => {
            // Handle withdrawal logic
            Alert.alert('Success', 'Withdrawal request submitted successfully!');
          },
        },
      ]
    );
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
          title="Wallet"
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
        <View style={clsx(styles.mb6)}>
          <View style={clsx(styles.bgPrimary, styles.p4, styles.roundedLg, styles.shadowSm)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textWhite, styles.mb2)}>
              Total Earnings
            </Text>
            <Text style={clsx(styles.text3xl, styles.fontBold, styles.textWhite, styles.mb4)}>
              {formatCurrency(totalEarnings.total)}
            </Text>
            
            <View style={clsx(styles.flexRow, styles.justifyBetween)}>
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.textXs, styles.textWhite)}>
                  Today
                </Text>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textWhite)}>
                  {formatCurrency(totalEarnings.daily)}
                </Text>
              </View>
              
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.textXs, styles.textWhite)}>
                  This Week
                </Text>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textWhite)}>
                  {formatCurrency(totalEarnings.weekly)}
                </Text>
              </View>
              
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.textXs, styles.textWhite)}>
                  This Month
                </Text>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textWhite)}>
                  {formatCurrency(totalEarnings.monthly)}
                </Text>
              </View>
            </View>
          </View>

          
        </View>

        

        {/* Transaction History Link */}
        <TouchableOpacity
          style={clsx(
            styles.bgWhite,
            styles.p4,
            styles.roundedLg,
            styles.shadowSm,
            styles.flexRow,
            styles.justifyBetween,
            styles.itemsCenter,
            styles.mb4
          )}
          onPress={() => navigation.navigate('TransactionHistory')}
        >
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <Icon name="history" size={24} color={colors.primary} style={clsx(styles.mr3)} />
            <View>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                Transaction History
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                View all your transactions
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Help Section */}
        <View style={clsx(styles.bgInfoLight, styles.p4, styles.roundedLg)}>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo, styles.mb2)}>
            Need Help?
          </Text>
          <Text style={clsx(styles.textSm, styles.textInfo)}>
            • Earnings are calculated based on completed services
            {'\n'}• Withdrawal takes 2-3 business days
            {'\n'}• For any discrepancy, contact support
            {'\n'}• Minimum withdrawal amount: ₹500
          </Text>
          
          <TouchableOpacity
            style={clsx(styles.mt4, styles.flexRow, styles.itemsCenter)}
            onPress={() => navigation.navigate('Support')}
          >
            <Icon name="support-agent" size={18} color={colors.info} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textInfo)}>
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default WalletScreen;