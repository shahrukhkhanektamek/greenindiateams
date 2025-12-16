import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

const EarningDetailsScreen = ({ navigation, route }) => {
  const {
    Toast,
    Urls,
    postData,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [earning, setEarning] = useState(null);
  const [stats, setStats] = useState(null);

  // Get earning ID from params or use the passed earning object
  const earningId = route.params?.earningId || route.params?.earning?._id;
  const initialEarning = route.params?.earning;

  const fetchEarningDetails = async () => {
    try {
      setLoading(true);
      
      if (earningId) {
        // Fetch specific earning details by ID
        const response = await postData(
          {}, 
          `${Urls.earningDetails}/${earningId}`, 
          'GET', 
          { showErrorMessage: false }
        );
        
        if (response?.success) {
          setEarning(response.data);
          calculateStats(response.data);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: response?.message || 'Failed to fetch earning details',
          });
          setEarning(initialEarning);
          if (initialEarning) calculateStats(initialEarning);
        }
      } else if (initialEarning) {
        // Use the passed earning object
        setEarning(initialEarning);
        calculateStats(initialEarning);
      } else {
        Alert.alert('Error', 'No earning data available');
        navigation.goBack();
      }
      
    } catch (error) {
      console.error('Fetch earning details error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch earning details',
      });
      
      if (initialEarning) {
        setEarning(initialEarning);
        calculateStats(initialEarning);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (earningData) => {
    if (!earningData) return;

    const slabs = [
      { hours: earningData.earningHour1, price: earningData.earningPrice1 },
      { hours: earningData.earningHour2, price: earningData.earningPrice2 },
      { hours: earningData.earningHour3, price: earningData.earningPrice3 },
      { hours: earningData.earningHour4, price: earningData.earningPrice4 },
    ];

    const totalEarnings = slabs.reduce((sum, slab) => sum + slab.price, 0);
    const totalHours = slabs.reduce((sum, slab) => sum + slab.hours, 0);
    const averageHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0;
    const maxEarning = Math.max(...slabs.map(slab => slab.price));
    const minEarning = Math.min(...slabs.map(slab => slab.price));

    setStats({
      totalEarnings,
      totalHours,
      averageHourlyRate,
      maxEarning,
      minEarning,
      slabCount: slabs.length,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarningDetails();
  };

  useEffect(() => {
    fetchEarningDetails();
  }, [earningId]);

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const earningSlabs = earning ? [
    {
      hours: earning.earningHour1,
      price: earning.earningPrice1,
      label: 'Basic Service',
      icon: 'star-border',
    },
    {
      hours: earning.earningHour2,
      price: earning.earningPrice2,
      label: 'Standard Service',
      icon: 'star-half',
    },
    {
      hours: earning.earningHour3,
      price: earning.earningPrice3,
      label: 'Premium Service',
      icon: 'star',
    },
    {
      hours: earning.earningHour4,
      price: earning.earningPrice4,
      label: 'Extended Service',
      icon: 'stars',
    },
  ] : [];

  if (loading && !refreshing && !earning) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textMuted, styles.mt3)}>
          Loading earning details...
        </Text>
      </View>
    );
  }

  if (!earning) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface)}>
        <Header
          title="Earning Details"
          showBack
          showNotification={false}
          type="white"
          rightAction={false}
          showProfile={false}
        />
        
        <View style={clsx(styles.flex1, styles.justifyCenter, styles.itemsCenter, styles.p4)}>
          <Icon name="error" size={48} color={colors.error} />
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textError, styles.mt3)}>
            Earning details not found
          </Text>
          <TouchableOpacity
            style={clsx(styles.mt4, styles.px4, styles.py2, styles.bgPrimary, styles.roundedFull)}
            onPress={() => navigation.goBack()}
          >
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textWhite)}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Earning Details"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        showProfile={false}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.px4, styles.pb6, styles.pt2)}
      >
        {/* Category Info */}
        <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm, styles.mb6)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
            <View style={clsx(styles.p2, styles.bgPrimaryLight, styles.roundedFull, styles.mr3)}>
              <Icon name="category" size={24} color={colors.primary} />
            </View>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)} numberOfLines={2}>
              {earning.category?.name || 'Category'}
            </Text>
          </View>
          
          {earning.category?.fullDescription && (
            <Text style={clsx(styles.textSm, styles.textMuted, styles.mb3)}>
              {earning.category.fullDescription}
            </Text>
          )}
          
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyBetween)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Icon 
                name={earning.status ? "check-circle" : "cancel"} 
                size={16} 
                color={earning.status ? colors.success : colors.error} 
                style={clsx(styles.mr2)} 
              />
              <Text style={clsx(styles.textSm, earning.status ? styles.textSuccess : styles.textError)}>
                {earning.status ? 'Active' : 'Inactive'}
              </Text>
            </View>
            
            <View style={clsx(styles.px3, styles.py1, styles.bgGray, styles.roundedFull)}>
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                ID: {earning.categoryId?.substring(0, 8)}...
              </Text>
            </View>
          </View>
        </View>

        {/* Earning Slabs */}
        <View style={clsx(styles.mb6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Earning Slabs
          </Text>
          
          {earningSlabs.map((slab, index) => (
            <View 
              key={index} 
              style={clsx(
                styles.bgWhite,
                styles.p4,
                styles.roundedLg,
                styles.shadowSm,
                index === earningSlabs.length - 1 ? styles.mb0 : styles.mb4
              )}
            >
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                  <Icon name={slab.icon} size={20} color={colors.primary} style={clsx(styles.mr2)} />
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                    {slab.label}
                  </Text>
                </View>
                <View style={clsx(styles.px3, styles.py1, styles.bgPrimaryLight, styles.roundedFull)}>
                  <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary)}>
                    {slab.hours} Hours
                  </Text>
                </View>
              </View>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
                <View>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Earning Amount
                  </Text>
                  <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess)}>
                    {formatCurrency(slab.price)}
                  </Text>
                </View>
                
                <View>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Per Hour Rate
                  </Text>
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                    {formatCurrency(slab.price / slab.hours)}/hr
                  </Text>
                </View>
              </View>
              
              <View style={clsx(styles.bgGray, styles.p2, styles.rounded, styles.mt2)}>
                <Text style={clsx(styles.textXs, styles.textCenter, styles.textMuted)}>
                  Complete {slab.hours} hours of service to earn {formatCurrency(slab.price)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Stats Summary */}
        {stats && (
          <View style={clsx(styles.bgPrimaryLight, styles.p4, styles.roundedLg, styles.mb6)}>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary, styles.mb3)}>
              Earnings Summary
            </Text>
            
            <View style={clsx(styles.mb3)}>
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
                <Text style={clsx(styles.textSm, styles.textBlack)}>
                  Total Potential Earnings
                </Text>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
                  {formatCurrency(stats.totalEarnings)}
                </Text>
              </View>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
                <Text style={clsx(styles.textSm, styles.textBlack)}>
                  Total Service Hours
                </Text>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                  {stats.totalHours} hours
                </Text>
              </View>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
                <Text style={clsx(styles.textSm, styles.textBlack)}>
                  Average Hourly Rate
                </Text>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
                  {formatCurrency(stats.averageHourlyRate)}/hr
                </Text>
              </View>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                <Text style={clsx(styles.textSm, styles.textBlack)}>
                  Highest Earning Slab
                </Text>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textSuccess)}>
                  {formatCurrency(stats.maxEarning)}
                </Text>
              </View>
            </View>
            
            <View style={clsx(styles.bgPrimary, styles.p2, styles.rounded)}>
              <Text style={clsx(styles.textXs, styles.textCenter, styles.textWhite)}>
                Average ₹{Math.round(stats.averageHourlyRate)} per hour across all slabs
              </Text>
            </View>
          </View>
        )}

        {/* Additional Information */}
        <View style={clsx(styles.bgGray, styles.p4, styles.roundedLg, styles.mb6)}>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb3)}>
            Additional Information
          </Text>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Created On
            </Text>
            <Text style={clsx(styles.textSm, styles.textBlack)}>
              {formatDate(earning.createdAt)}
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Last Updated
            </Text>
            <Text style={clsx(styles.textSm, styles.textBlack)}>
              {formatDate(earning.updatedAt || earning.createdAt)}
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb2)}>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Category Status
            </Text>
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Icon 
                name={earning.status ? "check-circle" : "cancel"} 
                size={14} 
                color={earning.status ? colors.success : colors.error} 
                style={clsx(styles.mr1)} 
              />
              <Text style={clsx(styles.textSm, earning.status ? styles.textSuccess : styles.textError)}>
                {earning.status ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween)}>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Earning Slabs
            </Text>
            <Text style={clsx(styles.textSm, styles.textBlack)}>
              {stats?.slabCount || 4} Slabs
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={clsx(styles.mb6)}>
          <TouchableOpacity
            style={clsx(
              styles.button,
              styles.flexRow,
              styles.justifyCenter,
              styles.itemsCenter,
              styles.mb3
            )}
            onPress={() => {
              // Navigate to jobs or services for this category
              Toast.show({
                type: 'info',
                text1: 'Coming Soon',
                text2: 'Jobs for this category feature coming soon',
              });
            }}
          >
            <Icon name="work" size={20} color={colors.white} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.buttonText)}>
              View Category Jobs
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={clsx(
              styles.buttonOutline,
              styles.flexRow,
              styles.justifyCenter,
              styles.itemsCenter
            )}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={20} color={colors.primary} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.buttonOutlineText)}>
              Back to Earnings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Message */}
        <View style={clsx(styles.p3, styles.bgInfoLight, styles.roundedLg)}>
          <View style={clsx(styles.flexRow, styles.mb1)}>
            <Icon name="info" size={16} color={colors.info} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textInfo)}>
              Important Notes
            </Text>
          </View>
          <Text style={clsx(styles.textXs, styles.textInfo)}>
            • Earnings are calculated per completed job
            {'\n'}• Service hours are based on actual work time
            {'\n'}• Rates may vary based on location and complexity
            {'\n'}• Contact support for any earning-related queries
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default EarningDetailsScreen;