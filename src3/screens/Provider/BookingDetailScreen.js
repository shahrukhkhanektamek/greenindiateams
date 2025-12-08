import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  Linking,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';

const BookingDetailScreen = ({ navigation, route }) => {
  const { booking } = route.params || {};
  
  // Sample booking data if not provided
  const bookingData = booking || {
    id: 'BK001',
    customerName: 'Rahul Sharma',
    service: 'AC Service & Repair',
    date: '15 Dec 2023',
    time: '10:00 AM - 12:00 PM',
    address: 'H-123, Sector 15, Noida, Uttar Pradesh - 201301',
    status: 'confirmed',
    amount: 1499,
    serviceType: 'ac',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@gmail.com',
    customerSince: 'Jan 2022',
    previousServices: 3,
    serviceDetails: 'AC gas refill, cleaning, and basic service',
    specialInstructions: 'Please bring AC cover. Pet friendly home.',
    assignedTechnician: 'Self',
    estimatedDuration: '2 hours',
    priority: 'high',
    paymentStatus: 'paid',
    paymentMethod: 'Online (UPI)',
    scheduledAt: '2023-12-15T10:00:00Z',
    createdAt: '2023-12-10T14:30:00Z',
    notes: 'Customer mentioned AC is not cooling properly.',
  };

  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'confirmed': return colors.primary;
      case 'upcoming': return colors.warning;
      case 'cancelled': return colors.error;
      case 'in-progress': return colors.info;
      default: return colors.gray;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'completed': return colors.successLight;
      case 'confirmed': return colors.primaryLight;
      case 'upcoming': return colors.warningLight;
      case 'cancelled': return colors.errorLight;
      case 'in-progress': return colors.infoLight;
      default: return colors.gray100;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.gray;
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'ac': return 'ac-unit';
      case 'cleaning': return 'cleaning-services';
      case 'plumbing': return 'plumbing';
      case 'electrical': return 'electrical-services';
      case 'water': return 'water-drop';
      default: return 'home-repair-service';
    }
  };

  const handleCallCustomer = () => {
    Linking.openURL(`tel:${bookingData.phone}`);
  };

  const handleMessageCustomer = () => {
    Linking.openURL(`sms:${bookingData.phone}`);
  };

  const handleUpdateStatus = (newStatus) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to mark this booking as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => {
            setIsLoading(true);
            // Simulate API call
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert('Success', `Booking status updated to ${newStatus}`);
              navigation.goBack();
            }, 1000);
          },
        },
      ]
    );
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setIsLoading(true);
            // Simulate API call
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert('Cancelled', 'Booking has been cancelled successfully');
              navigation.goBack();
            }, 1000);
          },
        },
      ]
    );
  };

  const handleShareBooking = async () => {
    try {
      await Share.share({
        message: `Booking Details:\nID: ${bookingData.id}\nService: ${bookingData.service}\nCustomer: ${bookingData.customerName}\nDate: ${bookingData.date}\nTime: ${bookingData.time}\nAddress: ${bookingData.address}`,
        title: 'Booking Details',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share booking details');
    }
  };

  const handleNavigateToCustomer = () => {
    navigation.navigate('CustomerProfile', { customerPhone: bookingData.phone });
  };

  const handleNavigateToAddress = () => {
    // Open in Google Maps or other navigation app
    const address = encodeURIComponent(bookingData.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
  };

  const ActionButton = ({ icon, label, color, onPress, outlined = false }) => (
    <TouchableOpacity
      style={clsx(
        styles.flexRow,
        styles.itemsCenter,
        styles.justifyCenter,
        styles.px4,
        styles.py3,
        outlined ? styles.border : null,
        outlined ? styles.borderPrimary : null,
        outlined ? styles.bgWhite : null,
        !outlined ? styles.bgPrimary : null,
        styles.roundedLg,
        styles.flex1,
        styles.mx1
      )}
      onPress={onPress}
      disabled={isLoading}
    >
      <Icon 
        name={icon} 
        size={20} 
        color={outlined ? colors.primary : colors.white} 
        style={clsx(styles.mr2)}
      />
      <Text style={clsx(
        styles.fontMedium,
        outlined ? styles.textPrimary : styles.textWhite
      )}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const InfoCard = ({ title, value, icon, onPress }) => (
    <TouchableOpacity
      style={clsx(
        styles.flexRow,
        styles.itemsCenter,
        styles.p3,
        styles.bgWhite,
        styles.roundedLg,
        styles.mb2,
        styles.shadowSm
      )}
      onPress={onPress}
      disabled={!onPress}
    >
      {icon && (
        <View style={[clsx(styles.roundedFull, styles.p2, styles.mr3), { backgroundColor: `${colors.primary}10` }]}>
          <Icon name={icon} size={20} color={colors.primary} />
        </View>
      )}
      <View style={clsx(styles.flex1)}>
        <Text style={clsx(styles.textSm, styles.textMuted)}>
          {title}
        </Text>
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
          {value}
        </Text>
      </View>
      {onPress && (
        <Icon name="chevron-right" size={20} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );

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
            Booking Details
          </Text>
          <TouchableOpacity onPress={handleShareBooking}>
            <Icon name="share" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Booking ID and Status */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
          <View>
            <Text style={clsx(styles.textWhite, styles.textBase, styles.opacity75)}>
              Booking ID
            </Text>
            <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
              {bookingData.id}
            </Text>
          </View>
          <View style={clsx(
            styles.px4,
            styles.py2,
            styles.roundedFull,
            { backgroundColor: getStatusBgColor(bookingData.status) }
          )}>
            <Text style={clsx(
              styles.fontBold,
              { color: getStatusColor(bookingData.status) }
            )}>
              {bookingData.status.charAt(0).toUpperCase() + bookingData.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.pb24)}
      >
        {/* Service Card */}
        <View style={clsx(styles.px4, styles.pt6)}>
          <View style={clsx(
            styles.bgWhite,
            styles.roundedLg,
            styles.p4,
            styles.shadowSm
          )}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb4)}>
              <View style={[clsx(styles.roundedFull, styles.p3, styles.mr3), 
                { backgroundColor: `${getStatusColor(bookingData.status)}20` }
              ]}>
                <Icon name={getServiceIcon(bookingData.serviceType)} size={28} color={getStatusColor(bookingData.status)} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
                  {bookingData.service}
                </Text>
                <Text style={clsx(styles.textBase, styles.textPrimary, styles.fontMedium)}>
                  ₹{bookingData.amount}
                </Text>
              </View>
            </View>

            {/* Service Details */}
            <View style={clsx(styles.mb4)}>
              <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
                Service Details
              </Text>
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                {bookingData.serviceDetails}
              </Text>
            </View>

            {/* Special Instructions */}
            {bookingData.specialInstructions && (
              <View style={clsx(styles.mb4, styles.p3, styles.bgWarningLight, styles.roundedLg)}>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb1)}>
                  <Icon name="info" size={16} color={colors.warning} /> Special Instructions
                </Text>
                <Text style={clsx(styles.textBase, styles.textBlack)}>
                  {bookingData.specialInstructions}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Customer Information */}
        <View style={clsx(styles.px4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Customer Information
          </Text>
          
          <TouchableOpacity
            style={clsx(
              styles.bgWhite,
              styles.roundedLg,
              styles.p4,
              styles.shadowSm
            )}
            onPress={handleNavigateToCustomer}
          >
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
              <View style={[clsx(styles.roundedFull, styles.overflowHidden), { width: 50, height: 50 }]}>
                <Image
                  source={{ uri: 'https://picsum.photos/200?random=customer' }}
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
              <View style={clsx(styles.ml3, styles.flex1)}>
                <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                  {bookingData.customerName}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Customer since {bookingData.customerSince}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.textLight} />
            </View>

            <View style={clsx(styles.flexRow, styles.flexWrap, styles.mb3)}>
              <View style={clsx(styles.px3, styles.py1, styles.bgGray100, styles.roundedFull, styles.mr2, styles.mb2)}>
                <Text style={clsx(styles.textSm, styles.textBlack)}>
                  📞 {bookingData.phone}
                </Text>
              </View>
              <View style={clsx(styles.px3, styles.py1, styles.bgGray100, styles.roundedFull, styles.mr2, styles.mb2)}>
                <Text style={clsx(styles.textSm, styles.textBlack)}>
                  ✉️ {bookingData.email}
                </Text>
              </View>
              <View style={clsx(styles.px3, styles.py1, styles.bgGray100, styles.roundedFull, styles.mb2)}>
                <Text style={clsx(styles.textSm, styles.textBlack)}>
                  🔄 {bookingData.previousServices} previous services
                </Text>
              </View>
            </View>

            {/* Contact Buttons */}
            <View style={clsx(styles.flexRow, styles.gap2)}>
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.flex1,
                  styles.bgPrimary,
                  styles.py2,
                  styles.roundedLg
                )}
                onPress={handleCallCustomer}
              >
                <Icon name="call" size={20} color={colors.white} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textWhite, styles.fontMedium)}>
                  Call
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.flex1,
                  styles.bgSuccess,
                  styles.py2,
                  styles.roundedLg
                )}
                onPress={handleMessageCustomer}
              >
                <Icon name="message" size={20} color={colors.white} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.textWhite, styles.fontMedium)}>
                  Message
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Service Details Section */}
        <View style={clsx(styles.px4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Service Details
          </Text>

          <InfoCard
            title="Date & Time"
            value={`${bookingData.date} • ${bookingData.time}`}
            icon="calendar-today"
          />

          <InfoCard
            title="Address"
            value={bookingData.address}
            icon="location-on"
            onPress={handleNavigateToAddress}
          />

          <InfoCard
            title="Assigned Technician"
            value={bookingData.assignedTechnician}
            icon="engineering"
          />

          <InfoCard
            title="Estimated Duration"
            value={bookingData.estimatedDuration}
            icon="schedule"
          />

          <InfoCard
            title="Priority"
            value={
              <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                <View 
                  style={[clsx(styles.w2, styles.h2, styles.roundedFull, styles.mr2), 
                    { backgroundColor: getPriorityColor(bookingData.priority) }
                  ]} 
                />
                <Text style={clsx(
                  styles.textBase,
                  styles.fontMedium,
                  { color: getPriorityColor(bookingData.priority) }
                )}>
                  {bookingData.priority.charAt(0).toUpperCase() + bookingData.priority.slice(1)}
                </Text>
              </View>
            }
            icon="flag"
          />
        </View>

        {/* Payment Information */}
        <View style={clsx(styles.px4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Payment Information
          </Text>

          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadowSm)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb3)}>
              <View>
                <Text style={clsx(styles.textBase, styles.textMuted)}>
                  Service Charge
                </Text>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
                  ₹{bookingData.amount}
                </Text>
              </View>
              <View style={clsx(
                styles.px3,
                styles.py1,
                styles.roundedFull,
                bookingData.paymentStatus === 'paid' ? styles.bgSuccessLight : styles.bgWarningLight
              )}>
                <Text style={clsx(
                  styles.fontMedium,
                  bookingData.paymentStatus === 'paid' ? styles.textSuccess : styles.textWarning
                )}>
                  {bookingData.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </Text>
              </View>
            </View>

            <View style={clsx(styles.flexRow, styles.justifyBetween)}>
              <View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Payment Method
                </Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {bookingData.paymentMethod}
                </Text>
              </View>
              <View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Booking Created
                </Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {new Date(bookingData.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Additional Notes */}
        {bookingData.notes && (
          <View style={clsx(styles.px4, styles.mt4)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
              Additional Notes
            </Text>
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadowSm)}>
              <Text 
                style={clsx(styles.textBase, styles.textBlack)}
                numberOfLines={isNotesExpanded ? undefined : 3}
              >
                {bookingData.notes}
              </Text>
              {bookingData.notes.length > 150 && (
                <TouchableOpacity
                  style={clsx(styles.mt2)}
                  onPress={() => setIsNotesExpanded(!isNotesExpanded)}
                >
                  <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                    {isNotesExpanded ? 'Show Less' : 'Read More'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={clsx(styles.px4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Timeline
          </Text>
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadowSm)}>
            {[
              { label: 'Booking Created', time: 'Dec 10, 2:30 PM', icon: 'add-circle', color: colors.primary },
              { label: 'Payment Received', time: 'Dec 10, 3:00 PM', icon: 'payment', color: colors.success },
              { label: 'Booking Confirmed', time: 'Dec 11, 10:00 AM', icon: 'check-circle', color: colors.primary },
              { label: 'Service Scheduled', time: 'Dec 11, 11:00 AM', icon: 'schedule', color: colors.info },
              { label: bookingData.status === 'completed' ? 'Service Completed' : 'Service Scheduled', 
                time: bookingData.date, 
                icon: bookingData.status === 'completed' ? 'done-all' : 'event-available',
                color: bookingData.status === 'completed' ? colors.success : colors.warning 
              },
            ].map((item, index) => (
              <View key={index} style={clsx(styles.flexRow, styles.itemsStart, styles.mb3)}>
                <View style={clsx(styles.itemsCenter, styles.mr3)}>
                  <View style={[clsx(styles.roundedFull, styles.p2), { backgroundColor: `${item.color}20` }]}>
                    <Icon name={item.icon} size={20} color={item.color} />
                  </View>
                  {index < 4 && (
                    <View style={[clsx(styles.w1, styles.flex1, styles.mt2), { backgroundColor: colors.gray200 }]} />
                  )}
                </View>
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {item.label}
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    {item.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Spacer for bottom buttons */}
        <View style={clsx(styles.h24)} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[
        clsx(
          styles.bgWhite,
          styles.px4,
          styles.py3,
          styles.borderTop,
          styles.borderLight,
          styles.flexRow,
          styles.justifyBetween,
          styles.itemsCenter
        ),
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }
      ]}>
        {bookingData.status === 'confirmed' || bookingData.status === 'upcoming' ? (
          <>
            <ActionButton
              icon="cancel"
              label="Cancel"
              outlined={true}
              onPress={handleCancelBooking}
            />
            <ActionButton
              icon="play-arrow"
              label="Start Service"
              onPress={() => handleUpdateStatus('in-progress')}
            />
          </>
        ) : bookingData.status === 'in-progress' ? (
          <ActionButton
            icon="check-circle"
            label="Mark Complete"
            onPress={() => handleUpdateStatus('completed')}
          />
        ) : null}
      </View>
    </View>
  );
};

export default BookingDetailScreen;