import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';

const SupportScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const supportCategories = [
    { id: 'technical', label: 'Technical Issue', icon: 'settings-applications' },
    { id: 'booking', label: 'Booking Related', icon: 'assignment' },
    { id: 'payment', label: 'Payment Issue', icon: 'payment' },
    { id: 'account', label: 'Account Issue', icon: 'person' },
    { id: 'service', label: 'Service Related', icon: 'handyman' },
    { id: 'other', label: 'Other', icon: 'help-outline' },
  ];

  const faqs = [
    {
      question: 'How do I update my service rates?',
      answer: 'Go to Profile → My Services → Edit Service Rates. You can update rates for each service individually.',
    },
    {
      question: 'Why is my withdrawal pending?',
      answer: 'Withdrawals take 2-3 business days to process. Make sure your bank details are verified in your profile.',
    },
    {
      question: 'How can I get more bookings?',
      answer: 'Complete your profile, maintain good ratings, and be available during peak hours. Consider adding more services.',
    },
    {
      question: 'What if I need to cancel a booking?',
      answer: 'Go to the booking details and click "Cancel". Please inform the customer and provide a valid reason.',
    },
  ];

  const contactOptions = [
    {
      id: 'call',
      label: 'Call Support',
      icon: 'phone',
      color: colors.primary,
      action: () => Linking.openURL('tel:+919876543210'),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: 'whatsapp',
      color: '#25D366',
      action: () => Linking.openURL('https://wa.me/919876543210'),
    },
    {
      id: 'email',
      label: 'Email Us',
      icon: 'email',
      color: colors.warning,
      action: () => Linking.openURL('mailto:support@serviceprovider.com'),
    },
    {
      id: 'chat',
      label: 'Live Chat',
      icon: 'chat',
      color: colors.success,
      action: () => Alert.alert('Live Chat', 'Our agents are available 9 AM - 6 PM'),
    },
  ];

  const handleSubmit = () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Success',
        'Your support request has been submitted. We will get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      setMessage('');
      setSelectedCategory('');
    }, 1500);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

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
            Help & Support
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SupportHistory')}>
            <Icon name="history" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={clsx(styles.pb6)}>
        {/* Quick Contact Options */}
        <View style={clsx(styles.px4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Quick Contact
          </Text>
          <View style={clsx(styles.flexRow, styles.flexWrap, styles.justifyBetween)}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={clsx(
                  styles.bgWhite,
                  styles.roundedLg,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.p3,
                  styles.mb3,
                  { width: '48%' }
                )}
                onPress={option.action}
              >
                <View style={[clsx(styles.roundedFull, styles.p3), { backgroundColor: `${option.color}20` }]}>
                  <Icon2 name={option.icon} size={24} color={option.color} />
                </View>
                <Text style={clsx(styles.fontMedium, styles.textBase, styles.textBlack, styles.mt2)}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={clsx(styles.px4, styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Frequently Asked Questions
          </Text>
          
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
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

        {/* Support Ticket Form */}
        <View style={clsx(styles.px4, styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Submit a Request
          </Text>
          
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadowSm)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
              Select Category
            </Text>
            
            <View style={clsx(styles.flexRow, styles.flexWrap, styles.gap2)}>
              {supportCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={clsx(
                    styles.flexRow,
                    styles.itemsCenter,
                    styles.px3,
                    styles.py2,
                    styles.roundedFull,
                    styles.mb2,
                    selectedCategory === category.id ? styles.bgPrimary : styles.bgGray100
                  )}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Icon 
                    name={category.icon} 
                    size={18} 
                    color={selectedCategory === category.id ? colors.white : colors.textMuted} 
                  />
                  <Text style={clsx(
                    styles.ml2,
                    styles.textSm,
                    selectedCategory === category.id ? styles.textWhite : styles.textBlack
                  )}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={clsx(styles.mt4)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                Describe your issue
              </Text>
              <TextInput
                style={clsx(
                  styles.bgGray100,
                  styles.roundedLg,
                  styles.p4,
                  styles.textBase,
                  styles.textBlack,
                  { height: 120, textAlignVertical: 'top' }
                )}
                placeholder="Please provide detailed information about your issue..."
                placeholderTextColor={colors.textMuted}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
              />
            </View>

            <TouchableOpacity
              style={clsx(
                styles.bgPrimary,
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.mt4,
                isSubmitting && styles.opacity50
              )}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                {isSubmitting ? (
                  <Icon name="hourglass-empty" size={20} color={colors.white} style={clsx(styles.mr2)} />
                ) : (
                  <Icon name="send" size={20} color={colors.white} style={clsx(styles.mr2)} />
                )}
                <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Information */}
        <View style={clsx(styles.px4, styles.mt6)}>
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadowSm)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Support Information
            </Text>
            
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
              <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), { backgroundColor: `${colors.primary}20` }]}>
                <Icon name="access-time" size={24} color={colors.primary} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                  Working Hours
                </Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  24/7 Support Available
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Quick Response: 9 AM - 6 PM
                </Text>
              </View>
            </View>

            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
              <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), { backgroundColor: `${colors.success}20` }]}>
                <Icon name="location-on" size={24} color={colors.success} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                  Office Address
                </Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  ServiceProvider Pvt. Ltd.
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  123 Business Street, Delhi, India - 110001
                </Text>
              </View>
            </View>

            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), { backgroundColor: `${colors.info}20` }]}>
                <Icon name="info" size={24} color={colors.info} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                  Support Channels
                </Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  Email: support@serviceprovider.com
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Phone: +91 98765 43210
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SupportScreen;