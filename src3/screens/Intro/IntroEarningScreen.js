import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Header from '../../components/Common/Header';
import { AppContext } from '../../Context/AppContext';
import { navigate } from '../../navigation/navigationService';

const IntroEarningScreen = ({ navigation }) => {
  const {
    Toast,
    Urls,
    postData,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState([]);
  const [selectedHours, setSelectedHours] = useState(4); // Default to 4 hours

  // Hourly rates based on hours (like in the image)
  const hourlyRates = {
    4: { monthly: 10000, daily: 333, weekly: 2500 }, // ₹333 daily = ₹10,000 monthly
    6: { monthly: 15000, daily: 500, weekly: 3750 }, // ₹500 daily = ₹15,000 monthly
    8: { monthly: 20000, daily: 667, weekly: 5000 }, // ₹667 daily = ₹20,000 monthly
    12: { monthly: 30000, daily: 1000, weekly: 7500 }, // ₹1,000 daily = ₹30,000 monthly
  };

  // Fetch earnings data
  const fetchEarnings = async () => {
    try {
      setLoading(true);
      
      const response = await postData({}, Urls.earnings, 'GET', { 
        showErrorMessage: false,
        showSuccessMessage: false 
      });
      
      if (response?.success) {
        console.log('Earnings API Response:', response);
        
        const earningsData = response.data || [];
        setEarnings(earningsData);
        
        // Show success message if data loaded
        if (earningsData.length > 0) {
          // Toast.show({
          //   type: 'success',
          //   text1: 'Success',
          //   text2: 'Earnings data loaded successfully',
          // });
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

  // Render hour selection buttons like in the image
  const renderHourButtons = () => {
    const hoursOptions = [4, 6, 8, 12];
    
    return (
      <View style={[
        clsx(
          styles.flexRow,
          styles.justifyBetween,
          styles.itemsCenter,
          styles.mb8
        ),
        { width: '100%', paddingHorizontal: 20 }
      ]}>
        {hoursOptions.map((hour) => (
          <TouchableOpacity
            key={hour}
            style={[
              clsx(
                styles.itemsCenter,
                styles.justifyCenter,
                selectedHours === hour ? 
                  clsx(styles.bgPrimary, styles.border2, styles.borderPrimary) : 
                  clsx(styles.bgWhite, styles.border2, styles.borderGrayLight),
                { 
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: selectedHours === hour ? 0.2 : 0.1,
                  shadowRadius: 4,
                  elevation: selectedHours === hour ? 5 : 2,
                }
              )
            ]}
            onPress={() => setSelectedHours(hour)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                clsx(
                  styles.textLg,
                  styles.fontBold,
                  selectedHours === hour ? styles.textWhite : styles.textBlack
                ),
                { fontSize: 20 }
              ]}
            >
              {hour}
            </Text>
            <Text
              style={[
                clsx(
                  styles.textSm,
                  selectedHours === hour ? styles.textWhite : styles.textMuted
                ),
                { fontSize: 12, marginTop: -2 }
              ]}
            >
              hrs
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleContinue = () => {
    // Navigate to ProfileUpdate
    navigate('ProfileUpdate',{type:'new'});
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
    <View style={[
      clsx(styles.flex1, styles.bgSurface),
      { backgroundColor: '#f8f9fa' }
    ]}>
      
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
        contentContainerStyle={[
          clsx(styles.itemsCenter, styles.pb10),
          { paddingTop: 50 }
        ]}
      >
        {/* Main Earning Card - Like in image */}
        <View style={[
          {
            width: '90%',
            backgroundColor: '#4CAF50', // Green color from image
            borderRadius: 20,
            padding: 30,
            marginBottom: 40,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 8,
          }
        ]}>
          <Text style={[
            clsx(styles.textWhite),
            {
              fontSize: 24,
              fontWeight: '600',
              marginBottom: 10,
              textAlign: 'center',
              lineHeight: 30,
            }
          ]}>
            You can earn upto
          </Text>
          
          <Text style={[
            {
              color: '#fff',
              fontSize: 48,
              fontWeight: 'bold',
              marginBottom: 20,
              textAlign: 'center',
              lineHeight: 52,
              textShadowColor: 'rgba(0, 0, 0, 0.2)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }
          ]}>
            {formatCurrency(hourlyRates[selectedHours].monthly)}
          </Text>
          
          <Text style={[
            clsx(styles.textWhite),
            {
              fontSize: 24,
              fontWeight: '600',
              marginBottom: 30,
              textAlign: 'center',
              lineHeight: 30,
            }
          ]}>
            Per Month
          </Text>
          
          <View style={[
            {
              backgroundColor: '#fff',
              paddingHorizontal: 25,
              paddingVertical: 15,
              borderRadius: 50,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }
          ]}>
            <Text style={[
              {
                color: '#333',
                fontSize: 18,
                fontWeight: '600',
                textAlign: 'center',
              }
            ]}>
              You work every day for {selectedHours} Hours
            </Text>
          </View>
        </View>

        {/* Hour Selection Section */}
        <Text style={[
          clsx(styles.textBlack),
          {
            fontSize: 20,
            fontWeight: '600',
            marginBottom: 30,
            textAlign: 'center',
            color: '#333',
            width: '100%',
          }
        ]}>
          Select your working hours per day:
        </Text>
        
        {renderHourButtons()}
       
        {/* Continue Button */}
        <TouchableOpacity
          style={[
            {
              backgroundColor: '#4CAF50',
              paddingVertical: 18,
              paddingHorizontal: 80,
              borderRadius: 50,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
              marginTop: 20,
            }
          ]}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={[
            {
              color: '#fff',
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              letterSpacing: 0.5,
            }
          ]}>
            Continue
          </Text>
        </TouchableOpacity> 

        

      </ScrollView>
    </View>
  ); 
};

export default IntroEarningScreen;