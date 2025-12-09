import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';

const TrainingScheduleScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // 'date' or 'time'
  
  // Initial schedule data
  const [scheduleData, setScheduleData] = useState({
    trainingDate: new Date(),
    trainingTime: new Date(),
    status: 'scheduled', // 'scheduled', 'completed', 'rescheduled'
    originalDate: null,
    originalTime: null,
  });

  // Available time slots
  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
  ];

  // Training details
  const trainingDetails = {
    title: 'Technical Training Session',
    instructor: 'John Doe',
    duration: '2 hours',
    location: 'Training Center, Sector 15',
    type: 'Classroom Training',
  };

  useEffect(() => {
    // If schedule data is passed via route params, use it
    if (route.params?.schedule) {
      const data = route.params.schedule;
      setScheduleData({
        ...data,
        trainingDate: data.trainingDate ? new Date(data.trainingDate) : new Date(),
        trainingTime: data.trainingTime ? new Date(data.trainingTime) : new Date(),
        originalDate: data.trainingDate ? new Date(data.trainingDate) : null,
        originalTime: data.trainingTime ? new Date(data.trainingTime) : null,
      });
    } else {
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduleData(prev => ({
        ...prev,
        trainingDate: tomorrow,
        originalDate: tomorrow,
        originalTime: new Date(),
      }));
    }
  }, [route.params]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setScheduleData({ ...scheduleData, trainingDate: selectedDate });
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setScheduleData({ ...scheduleData, trainingTime: selectedTime });
    }
  };

  const handleSelectTimeSlot = (timeSlot) => {
    const [time, period] = timeSlot.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const newTime = new Date(scheduleData.trainingDate);
    newTime.setHours(hours, minutes, 0, 0);
    
    setScheduleData({ ...scheduleData, trainingTime: newTime });
  };

  const isScheduleModified = () => {
    if (!scheduleData.originalDate || !scheduleData.originalTime) return false;
    
    return (
      scheduleData.trainingDate.toDateString() !== scheduleData.originalDate.toDateString() ||
      scheduleData.trainingTime.toTimeString() !== scheduleData.originalTime.toTimeString()
    );
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Prepare data for API
      const submitData = {
        trainingDate: scheduleData.trainingDate.toISOString().split('T')[0],
        trainingTime: scheduleData.trainingTime.toTimeString().split(' ')[0],
        status: isScheduleModified() ? 'rescheduled' : 'scheduled',
        submittedAt: new Date().toISOString(),
      };

      console.log('Submitting training schedule:', submitData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Success',
        isScheduleModified() 
          ? 'Training rescheduled successfully!' 
          : 'Training scheduled successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule training. Please try again.');
      console.error('Schedule error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = () => {
    Alert.alert(
      'Reschedule Training',
      'Are you sure you want to reschedule this training?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reschedule',
          onPress: () => {
            // Just reset to show pickers again
            setShowDatePicker(true);
          },
        },
      ]
    );
  };

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>

      <Header
          title="Training Schedule"
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
        contentContainerStyle={clsx(styles.px4, styles.pb6, styles.pt2)}
      >
        {/* Training Details Card */}
        <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm, styles.mb6)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
            <Icon name="school" size={24} color={colors.primary} />
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.ml3)}>
              {trainingDetails.title}
            </Text>
          </View>
          
          <View style={clsx(styles.mt3)}>
            <View style={clsx(styles.flexRow, styles.mb2)}>
              <Icon name="person" size={18} color={colors.textMuted} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                Instructor: <Text style={styles.fontMedium}>{trainingDetails.instructor}</Text>
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.mb2)}>
              <Icon name="access-time" size={18} color={colors.textMuted} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                Duration: <Text style={styles.fontMedium}>{trainingDetails.duration}</Text>
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.mb2)}>
              <Icon name="location-on" size={18} color={colors.textMuted} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                Location: <Text style={styles.fontMedium}>{trainingDetails.location}</Text>
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow)}>
              <Icon name="category" size={18} color={colors.textMuted} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                Type: <Text style={styles.fontMedium}>{trainingDetails.type}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Schedule Section */}
        <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Select Training Schedule
          </Text>

          {/* Current Schedule Display */}
          {scheduleData.status === 'scheduled' && !isScheduleModified() && (
            <View style={clsx(styles.mb6, styles.p3, styles.bgSuccessLight, styles.rounded)}>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textSuccess)}>
                Currently Scheduled
              </Text>
              <Text style={clsx(styles.textBase, styles.textSuccess, styles.mt1)}>
                {formatDate(scheduleData.trainingDate)} at {formatTime(scheduleData.trainingTime)}
              </Text>
            </View>
          )}

          {/* Date Selection */}
          <View style={clsx(styles.mb6)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
              Select Date
            </Text>
            
            <TouchableOpacity
              style={clsx(
                styles.input,
                styles.flexRow,
                styles.justifyBetween,
                styles.itemsCenter,
                styles.p3
              )}
              onPress={() => {
                setPickerMode('date');
                setShowDatePicker(true);
              }}
            >
              <View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>Training Date</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mt1)}>
                  {formatDate(scheduleData.trainingDate)}
                </Text>
              </View>
              <Icon name="calendar-today" size={24} color={colors.primary} />
            </TouchableOpacity>

            <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
              Please select a future date for training
            </Text>
          </View>

          {/* Time Selection */}
          <View style={clsx(styles.mb6)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
              Select Time
            </Text>
            
            {/* Time Picker Button */}
            <TouchableOpacity
              style={clsx(
                styles.input,
                styles.flexRow,
                styles.justifyBetween,
                styles.itemsCenter,
                styles.p3,
                styles.mb4
              )}
              onPress={() => {
                setPickerMode('time');
                setShowTimePicker(true);
              }}
            >
              <View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>Training Time</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mt1)}>
                  {formatTime(scheduleData.trainingTime)}
                </Text>
              </View>
              <Icon name="access-time" size={24} color={colors.primary} />
            </TouchableOpacity>

            {/* Quick Time Slots */}
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
              Or select from available slots:
            </Text>
            
            <View style={clsx(styles.flexRow, styles.flexWrap)}>
              {timeSlots.map((slot) => {
                const [hours, minutes] = slot.split(' ')[0].split(':').map(Number);
                const period = slot.split(' ')[1];
                let slotHours = hours;
                if (period === 'PM' && hours !== 12) slotHours += 12;
                if (period === 'AM' && hours === 12) slotHours = 0;
                
                const slotTime = new Date(scheduleData.trainingDate);
                slotTime.setHours(slotHours, minutes, 0, 0);
                
                const isSelected = 
                  scheduleData.trainingTime.getHours() === slotHours &&
                  scheduleData.trainingTime.getMinutes() === minutes;
                
                return (
                  <TouchableOpacity
                    key={slot}
                    style={clsx(
                      styles.px3,
                      styles.py2,
                      styles.mr2,
                      styles.mb2,
                      styles.roundedFull,
                      isSelected ? styles.bgPrimary : styles.bgGray
                    )}
                    onPress={() => handleSelectTimeSlot(slot)}
                  >
                    <Text style={clsx(
                      styles.textSm,
                      styles.fontMedium,
                      isSelected ? styles.textWhite : styles.textBlack
                    )}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected Schedule Summary */}
          <View style={clsx(styles.p4, styles.bgPrimaryLight, styles.roundedLg, styles.mb4)}>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary, styles.mb2)}>
              Selected Schedule:
            </Text>
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Icon name="event" size={20} color={colors.primary} />
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                {formatDate(scheduleData.trainingDate)}
              </Text>
            </View>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mt2)}>
              <Icon name="schedule" size={20} color={colors.primary} />
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                {formatTime(scheduleData.trainingTime)}
              </Text>
            </View>
          </View>

          {/* Reschedule Button (if already scheduled) */}
          {scheduleData.status === 'scheduled' && !isScheduleModified() && (
            <TouchableOpacity
              style={clsx(
                styles.buttonOutline,
                styles.mb4,
                styles.flexRow,
                styles.justifyCenter,
                styles.itemsCenter
              )}
              onPress={handleReschedule}
              disabled={loading}
            >
              <Icon name="update" size={20} color={colors.primary} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.buttonOutlineText)}>
                Reschedule Training
              </Text>
            </TouchableOpacity>
          )}

          {/* Submit/Update Button */}
          <TouchableOpacity
            style={clsx(
              styles.button,
              loading && styles.opacity50
            )}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <View style={clsx(styles.flexRow, styles.justifyCenter, styles.itemsCenter)}>
                <Icon 
                  name={isScheduleModified() ? "update" : "check-circle"} 
                  size={20} 
                  color={colors.white} 
                  style={clsx(styles.mr2)} 
                />
                <Text style={clsx(styles.buttonText)}>
                  {isScheduleModified() ? 'Update Schedule' : 'Confirm Schedule'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={clsx(
              styles.buttonOutline,
              styles.mt3
            )}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={clsx(styles.buttonOutlineText)}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        {/* Important Notes */}
        <View style={clsx(styles.mt6, styles.p4, styles.bgInfoLight, styles.roundedLg)}>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo, styles.mb2)}>
            Important Notes:
          </Text>
          <Text style={clsx(styles.textSm, styles.textInfo)}>
            • Training duration: 2 hours
            {'\n'}• Please arrive 15 minutes before scheduled time
            {'\n'}• Bring your ID proof and notebook
            {'\n'}• Rescheduling is allowed up to 24 hours before training
            {'\n'}• For any queries, contact support: +91-9876543210
          </Text>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={scheduleData.trainingDate}
          mode={pickerMode}
          display="default"
          onChange={pickerMode === 'date' ? handleDateChange : handleTimeChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={scheduleData.trainingTime}
          mode="time"
          display="spinner"
          onChange={handleTimeChange}
          is24Hour={false}
        />
      )}
    </View>
  );
};

export default TrainingScheduleScreen;