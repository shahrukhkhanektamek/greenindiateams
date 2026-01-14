import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Header from '../../components/Common/Header';
import { AppContext } from '../../Context/AppContext';

const SupportScreen = ({ navigation }) => {
  const { Toast, Urls, postData } = useContext(AppContext);

  // State for form inputs
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // State for API data
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [supportData, setSupportData] = useState({
    faqs: [],
    contactOptions: [],
    supportInfo: {},
  });

  // Helper function to get contact action based on type
  const getContactAction = (option) => {
    switch (option.type) {
      case 'phone':
        return () => Linking.openURL(`tel:${option.value}`);
      case 'whatsapp':
        return () => Linking.openURL(`https://wa.me/${option.value.replace(/\D/g, '')}`);
      case 'email':
        return () => Linking.openURL(`mailto:${option.value}`);
      default:
        return () => console.log('Contact action not defined');
    }
  };

  // Process API response and set state
  const processApiResponse = (apiData) => {
    // Extract contact options from API response
    const contactOptionsFromApi = [];
    
    // Add call option if available in API
    if (apiData.call) {
      contactOptionsFromApi.push({
        ...apiData.call,
        color: colors.primary,
        action: getContactAction(apiData.call)
      });
    }
    
    // Add email option if available in API
    if (apiData.email) {
      contactOptionsFromApi.push({
        ...apiData.email,
        color: colors.warning,
        action: getContactAction(apiData.email)
      });
    }
    
    // Add whatsapp option if available in API
    if (apiData.whatsapp) {
      contactOptionsFromApi.push({
        ...apiData.whatsapp,
        color: '#25D366',
        action: getContactAction(apiData.whatsapp)
      });
    }

    // Use FAQs from API or empty array
    const faqs = apiData.faqs || [];

    // Use supportInfo from API or empty object
    const supportInfo = apiData.supportInfo || {};

    return {
      faqs,
      contactOptions: contactOptionsFromApi,
      supportInfo,
    };
  };

  // Fetch support data from API
  const fetchSupportData = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      // Try to fetch data from API
      const response = await postData(
        {},
        Urls.supportData,
        'GET',
        { showErrorMessage: false, showSuccessMessage:false } 
      );

      if (response?.success && response?.data) {
        // Process API response
        const processedData = processApiResponse(response.data);
        setSupportData(processedData);
        
        if (isRefresh) {
          Toast.show({
            type: 'success',
            text1: 'Refreshed',
            text2: 'Support data updated',
          });
        }
      } else {
        // If API returns empty or no data, create empty structure
        const emptyData = processApiResponse({});
        setSupportData(emptyData);
      }
    } catch (error) {
      console.error('Error fetching support data:', error);
      
      // On error, create empty structure
      const emptyData = processApiResponse({});
      setSupportData(emptyData);
      
      if (!isRefresh) {
        Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: 'Unable to load support data',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle form submission to API
  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = {
        category: selectedCategory,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };

      // Try to submit to API
      const response = await postData(
        formData,
        Urls.submitSupport || '/api/support/submit',
        'POST'
      );

      if (response?.success) {
        Alert.alert(
          'Success',
          'Your support request has been submitted. We will get back to you within 24 hours.',
          [{ text: 'OK', onPress: () => {
            setMessage('');
            setSelectedCategory('');
          }}]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to submit your request. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error submitting support request:', error);
      
      Alert.alert(
        'Error',
        'Failed to submit your request. Please check your connection.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const onRefresh = () => {
    fetchSupportData(true);
  };

  useEffect(() => {
    fetchSupportData();
  }, []);

  if (loading) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface)}>
        <Header
          title="Help & Support"
          showBack
          showNotification={false}
          type="white"
          rightAction={false}
          showProfile={false}
        />
        <View style={clsx(styles.flex1, styles.justifyCenter, styles.itemsCenter)}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
            Loading support information...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Help & Support"
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
        contentContainerStyle={clsx(styles.pb6)}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Quick Contact Options - ONLY if API provides */}
        {supportData.contactOptions.length > 0 && (
          <View style={clsx(styles.px4, styles.mt4)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Quick Contact
            </Text>
            <View style={clsx(styles.flexRow, styles.flexWrap, styles.justifyBetween)}>
              {supportData.contactOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={clsx(
                    styles.bgWhite,
                    styles.roundedLg,
                    styles.itemsCenter,
                    styles.justifyCenter,
                    styles.p3,
                    styles.mb3,
                    { width: supportData.contactOptions.length === 1 ? '100%' : supportData.contactOptions.length === 2 ? '48%' : '48%' }
                  )}
                  onPress={option.action}
                >
                  <View style={[clsx(styles.roundedFull, styles.w16, styles.h16, styles.itemsCenter, styles.p3), { backgroundColor: `${option.color}20` }]}>
                    <Icon2 name={option.icon} size={35} color={option.color} />
                  </View>
                  {/* <Text style={clsx(styles.fontMedium, styles.textBase, styles.textBlack, styles.mt2)}>
                    {option.label}
                  </Text> */}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* FAQ Section - ONLY if API provides */}
        {supportData.faqs.length > 0 && (
          <View style={clsx(styles.px4, styles.mt6)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                Frequently Asked Questions
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                {supportData.faqs.length} FAQs
              </Text>
            </View>
            
            {supportData.faqs.map((faq, index) => (
              <TouchableOpacity
                key={faq.id || index}
                style={clsx(
                  styles.bgWhite,
                  styles.roundedLg,
                  styles.p4,
                  styles.mb3,
                  styles.shadowSm
                )}
                onPress={() => toggleFaq(index)}
              >
                <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.flex1)}>
                    {faq.question}
                  </Text>
                  <Icon 
                    name={expandedFaq === index ? "expand-less" : "expand-more"} 
                    size={24} 
                    color={colors.textMuted} 
                  />
                </View>
                
                {expandedFaq === index && (
                  <View style={clsx(styles.mt3, styles.pt3, styles.borderTop, styles.borderLight)}>
                    <Text style={clsx(styles.textBase, styles.textBlack)}>
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Support Information - ONLY if API provides and has data */}
        {supportData.supportInfo && Object.keys(supportData.supportInfo).length > 0 && (
          <View style={clsx(styles.px4, styles.mt6)}>
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadowSm)}>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
                Support Information
              </Text>
              
              {supportData.supportInfo.workingHours && (
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
                  <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), { backgroundColor: `${colors.primary}20` }]}>
                    <Icon name="access-time" size={24} color={colors.primary} />
                  </View>
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                      Working Hours
                    </Text>
                    <Text style={clsx(styles.textBase, styles.textBlack)}>
                      {supportData.supportInfo.workingHours}
                    </Text>
                    {supportData.supportInfo.quickResponseHours && (
                      <Text style={clsx(styles.textSm, styles.textMuted)}>
                        Quick Response: {supportData.supportInfo.quickResponseHours}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {supportData.supportInfo.officeName && (
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
                  <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), { backgroundColor: `${colors.success}20` }]}>
                    <Icon name="location-on" size={24} color={colors.success} />
                  </View>
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                      Office Address
                    </Text>
                    <Text style={clsx(styles.textBase, styles.textBlack)}>
                      {supportData.supportInfo.officeName}
                    </Text>
                    {supportData.supportInfo.address && (
                      <Text style={clsx(styles.textSm, styles.textMuted)}>
                        {supportData.supportInfo.address}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {(supportData.supportInfo.email || supportData.supportInfo.phone) && (
                <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                  <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), { backgroundColor: `${colors.info}20` }]}>
                    <Icon name="info" size={24} color={colors.info} />
                  </View>
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                      Support
                    </Text>
                    {supportData.supportInfo.email && (
                      <Text style={clsx(styles.textBase, styles.textBlack)}>
                        Email: {supportData.supportInfo.email}
                      </Text>
                    )}
                    {supportData.supportInfo.phone && (
                      <Text style={clsx(styles.textSm, styles.textMuted)}>
                        Phone: {supportData.supportInfo.phone}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Empty State - If no data from API */}
        {supportData.faqs.length === 0 && 
         supportData.contactOptions.length === 0 && 
         (!supportData.supportInfo || Object.keys(supportData.supportInfo).length === 0) && (
          <View style={clsx(styles.px4, styles.mt6)}>
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p6, styles.itemsCenter, styles.justifyCenter)}>
              <Icon name="support-agent" size={64} color={colors.textMuted} />
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mt4, styles.textCenter)}>
                No Support Data Available
              </Text>
              <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2, styles.textCenter)}>
                Support information is currently unavailable.
              </Text>
              <TouchableOpacity
                style={clsx(
                  styles.bgPrimary,
                  styles.roundedLg,
                  styles.px4,
                  styles.py3,
                  styles.mt4
                )}
                onPress={onRefresh}
              >
                <Text style={clsx(styles.textWhite, styles.textBase, styles.fontMedium)}>
                  Refresh
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SupportScreen;