import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';
import { navigate } from '../../../navigation/navigationService';

const TrainingScheduleScreen = ({ navigation, route }) => {
  const {
    Toast,
    Urls,
    postData,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Initial schedule data
  const [scheduleData, setScheduleData] = useState({
    trainingDate: new Date(),
    trainingTime: new Date(),
    status: 'pending', // 'pending', 'scheduled', 'cancelled', 'rescheduled'
    originalDate: null,
    originalTime: null,
    scheduleId: null,
  });

  // Training details state
  const [trainingDetails, setTrainingDetails] = useState({
    title: '',
    instructor: '',
    duration: '',
    location: '',
    type: '',
    description: '',
    trainingId: '',
  });

  // Fetch training schedule data
  const fetchTrainingData = async () => {
    setLoading(true);
    try {
      const response = await postData({}, Urls.trainingSchedule, 'GET', { 
        showErrorMessage: false 
      });
      
      if (response?.success) {
        const apiData = response.data || {};
        console.log('API Data:', apiData);
        
        // Extract training details from trainingId object
        if (apiData.trainingId) {
          const training = apiData.trainingId;
          setTrainingDetails({
            title: training.subject || 'Technical Training',
            instructor: training.fullName || 'Trainer Name',
            duration: training.duration || '2 hours',
            location: training.location || 'Training Center',
            type: training.type || 'Classroom',
            description: training.description || 'Technical training session',
            trainingId: training._id || '',
          });
        }
        
        // Set schedule data if exists
        if (apiData._id) {
          // Create Date objects from scheduleDate and scheduleTime
          let trainingDate = new Date();
          let trainingTime = new Date();
          
          if (apiData.scheduleDate) {
            // Parse date string (e.g., "2026-01-01T00:00:00.000Z")
            trainingDate = new Date(apiData.scheduleDate);
            
            // If we have scheduleTime, combine with date
            if (apiData.scheduleTime) {
              // Parse time string (e.g., "14:45")
              const [hours, minutes] = apiData.scheduleTime.split(':').map(Number);
              trainingDate.setHours(hours, minutes, 0, 0);
              trainingTime = new Date(trainingDate);
            } else {
              trainingTime = new Date(trainingDate);
              trainingTime.setHours(10, 0, 0, 0); // Default time 10:00 AM
            }
          }
          
          // Determine status based on API data
          let status = 'pending';
          if (apiData.status === true) {
            status = 'scheduled';
          } else if (apiData.status === false) {
            status = 'cancelled';
          } else if (apiData.status === 'completed') {
            status = 'completed';
          } else if (apiData.status === 'rescheduled') {
            status = 'rescheduled';
          }
          
          console.log('Setting schedule data:', {
            trainingDate,
            trainingTime,
            status,
            scheduleId: apiData._id,
          });
          
          setScheduleData({
            trainingDate: trainingDate,
            trainingTime: trainingTime,
            status: status,
            originalDate: new Date(trainingDate),
            originalTime: new Date(trainingTime),
            scheduleId: apiData._id,
          });
        } else {
          // No schedule exists, set as pending
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          setScheduleData({
            trainingDate: tomorrow,
            trainingTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
            status: 'pending',
            originalDate: new Date(tomorrow),
            originalTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
            scheduleId: null,
          });
        }
      } else {
        // API success false
        setDefaultData();
      }
    } catch (error) {
      console.error('Error fetching training data:', error);
      setDefaultData();
    } finally {
      setLoading(false);
      setDataLoaded(true);
    }
  };

  // Helper function to set default data
  const setDefaultData = () => {
    // Set default values
    setTrainingDetails({
      title: 'Technical Training',
      instructor: 'Trainer Name',
      duration: '2 hours',
      location: 'Training Center',
      type: 'Classroom',
      description: 'Technical training session',
      trainingId: '',
    });
    
    // Set default date to tomorrow with pending status
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleData({
      trainingDate: tomorrow,
      trainingTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
      status: 'pending',
      originalDate: new Date(tomorrow),
      originalTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
      scheduleId: null,
    });
  };

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Select Date';
    }
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Select Time';
    }
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

  const isScheduleModified = () => {
    if (!scheduleData.originalDate || !scheduleData.originalTime) return false;
    
    if (!(scheduleData.trainingDate instanceof Date) || !(scheduleData.originalDate instanceof Date)) {
      return false;
    }
    
    const dateChanged = scheduleData.trainingDate.toDateString() !== scheduleData.originalDate.toDateString();
    const timeChanged = formatTime(scheduleData.trainingTime) !== formatTime(scheduleData.originalTime);
    
    return dateChanged || timeChanged;
  };

  const validateSchedule = () => {
    const now = new Date();
    const selectedDateTime = new Date(scheduleData.trainingDate);
    selectedDateTime.setHours(
      scheduleData.trainingTime.getHours(),
      scheduleData.trainingTime.getMinutes(),
      0,
      0
    );

    // Check if selected date is in the past
    if (selectedDateTime < now) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Schedule',
        text2: 'Please select a future date and time',
      });
      return false;
    }

    // Check if date is at least tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const selectedDateOnly = new Date(scheduleData.trainingDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    
    if (selectedDateOnly < tomorrow) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Date',
        text2: 'Please select a date from tomorrow onwards',
      });
      return false;
    }

    return true;
  };

  // API to confirm/schedule training
  const handleConfirmSchedule = async () => {
    if (!validateSchedule()) {
      return;
    }

    setLoading(true);

    try {
      // Format date as YYYY-MM-DD
      const year = scheduleData.trainingDate.getFullYear();
      const month = String(scheduleData.trainingDate.getMonth() + 1).padStart(2, '0');
      const day = String(scheduleData.trainingDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      // Format time as HH:mm
      const hours = String(scheduleData.trainingTime.getHours()).padStart(2, '0');
      const minutes = String(scheduleData.trainingTime.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;

      // Prepare data for API
      const submitData = {
        scheduleDate: formattedDate,
        scheduleTime: formattedTime,
        status: true, // true for scheduled
        trainingId: trainingDetails.trainingId,
      };

      // Add scheduleId if exists (for update)
      // if (scheduleData.scheduleId) {
      //   submitData.scheduleId = scheduleData.scheduleId;
      // }

      console.log('Submitting training schedule:', submitData);

      const response = await postData(submitData, Urls.trainingScheduleUpdate, 'POST', { 
        showErrorMessage: true 
      });
      
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: scheduleData.scheduleId ? 'Schedule updated successfully!' : 'Training scheduled successfully!',
        });
        
        // Update local state with new schedule
        setScheduleData(prev => ({
          ...prev,
          originalDate: new Date(scheduleData.trainingDate),
          originalTime: new Date(scheduleData.trainingTime),
          status: 'scheduled',
          scheduleId: response.data?._id || scheduleData.scheduleId,
        }));
        
        // Navigate back after delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        Alert.alert('Error', response?.message || 'Failed to schedule training');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to schedule training. Please try again.',
      });
      console.error('Schedule error:', error);
    } finally {
      setLoading(false);
    }
  };

  // API to reschedule training
  const handleReschedule = () => {
    // navigate('ProviderDashboard')
    navigate('TrainingStatus')
    // First show date/time pickers for rescheduling
    // Alert.alert(
    //   'Reschedule Training',
    //   'Select new date and time for training',
    //   [
    //     {
    //       text: 'Cancel',
    //       style: 'cancel',
    //     },
    //     {
    //       text: 'Select Date',
    //       onPress: () => setShowDatePicker(true),
    //     },
    //     {
    //       text: 'Select Time',
    //       onPress: () => setShowTimePicker(true),
    //     },
    //   ]
    // );
  };

  const confirmReschedule = async () => {
    if (!validateSchedule()) {
      return;
    }

    setLoading(true);

    try {
      // Format date as YYYY-MM-DD
      const year = scheduleData.trainingDate.getFullYear();
      const month = String(scheduleData.trainingDate.getMonth() + 1).padStart(2, '0');
      const day = String(scheduleData.trainingDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      // Format time as HH:mm
      const hours = String(scheduleData.trainingTime.getHours()).padStart(2, '0');
      const minutes = String(scheduleData.trainingTime.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;

      // Prepare data for API
      const submitData = {
        scheduleDate: formattedDate,
        scheduleTime: formattedTime,
        status: true, // true for scheduled
        scheduleId: scheduleData.scheduleId,
        rescheduled: true, // flag for rescheduling
      };

      console.log('Rescheduling training:', submitData);

      const response = await postData(submitData, Urls.trainingScheduleUpdate, 'POST', { 
        showErrorMessage: true 
      });
      
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Training rescheduled successfully!',
        });
        
        // Update local state
        setScheduleData(prev => ({
          ...prev,
          originalDate: new Date(scheduleData.trainingDate),
          originalTime: new Date(scheduleData.trainingTime),
          status: 'rescheduled',
        }));
        
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        Alert.alert('Error', response?.message || 'Failed to reschedule training');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to reschedule training. Please try again.',
      });
      console.error('Reschedule error:', error);
    } finally {
      setLoading(false);
    }
  };

  // API to cancel training
  const handleCancelTraining = () => {
    Alert.alert(
      'Cancel Training',
      'Are you sure you want to cancel this training?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: cancelTrainingAPI,
        },
      ]
    );
  };

  const cancelTrainingAPI = async () => {
    setLoading(true);
    try {
      const submitData = {
        status: false, // false for cancelled
        scheduleId: scheduleData.scheduleId,
      };

      const response = await postData(
        submitData, 
        Urls.trainingScheduleUpdate, 
        'POST', 
        { showErrorMessage: true }
      );
      
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Training cancelled successfully',
        });
        navigation.goBack();
      } else {
        Alert.alert('Error', response?.message || 'Failed to cancel training');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to cancel training',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get status color and text
  const getStatusInfo = () => {
    switch(scheduleData.status) {
      case 'pending':
        return { color: colors.warning, text: 'Pending', bg: styles.bgWarningLight, icon: 'schedule' };
      case 'scheduled':
        return { color: colors.success, text: 'Scheduled', bg: styles.bgSuccessLight, icon: 'check-circle' };
      case 'rescheduled':
        return { color: colors.info, text: 'Rescheduled', bg: styles.bgInfoLight, icon: 'update' };
      case 'cancelled':
        return { color: colors.error, text: 'Cancelled', bg: styles.bgErrorLight, icon: 'cancel' };
      case 'completed':
        return { color: colors.primary, text: 'Completed', bg: styles.bgPrimaryLight, icon: 'done-all' };
      default:
        return { color: colors.textMuted, text: 'Unknown', bg: styles.bgGray, icon: 'help' };
    }
  };

  const statusInfo = getStatusInfo();

  // Auto show confirm dialog when schedule is modified
  useEffect(() => {
    if (isScheduleModified() && scheduleData.status === 'scheduled') {
      const timer = setTimeout(() => {
        Alert.alert(
          'Confirm Reschedule',
          `New schedule: ${formatDate(scheduleData.trainingDate)} at ${formatTime(scheduleData.trainingTime)}`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                // Reset to original schedule
                setScheduleData(prev => ({
                  ...prev,
                  trainingDate: prev.originalDate,
                  trainingTime: prev.originalTime,
                }));
              }
            },
            {
              text: 'Confirm',
              onPress: confirmReschedule,
            },
          ]
        );
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [scheduleData.trainingDate, scheduleData.trainingTime]);

  if (!dataLoaded && loading) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading training data...
        </Text>
      </View>
    );
  }

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
        onRightActionPress={() => navigate('Settings')}
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
              <Icon name="location-on" size={18} color={colors.textMuted} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                Location: <Text style={styles.fontMedium}>{trainingDetails.location}</Text>
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow)}>
              <Icon name="description" size={18} color={colors.textMuted} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                Description: <Text style={styles.fontMedium}>{trainingDetails.description}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Schedule Section */}
        <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
            Training Schedule
          </Text>

          {/* Status Display */}
          <View style={clsx(styles.p3, statusInfo.bg, styles.rounded, styles.mb4, styles.flexRow, styles.itemsCenter)}>
            <Icon name={statusInfo.icon} size={20} color={statusInfo.color} />
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.ml2, { color: statusInfo.color })}>
              Status: {statusInfo.text}
            </Text>
          </View>

          {/* Date Selection */}
          <View style={clsx(styles.mb4)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
              Training Date
            </Text>
            
            <TouchableOpacity
              style={clsx(
                styles.input,
                styles.flexRow,
                styles.justifyBetween,
                styles.itemsCenter,
                styles.p3
              )}
              onPress={() => setShowDatePicker(true)}
              disabled={loading || scheduleData.status === 'cancelled' || scheduleData.status === 'completed'}
            >
              <View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>Selected Date</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mt1)}>
                  {formatDate(scheduleData.trainingDate)}
                </Text>
              </View>
              <Icon name="calendar-today" size={24} color={colors.primary} />
            </TouchableOpacity>

            <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
              Please select a future date (from tomorrow onwards)
            </Text>
          </View>

          {/* Time Selection */}
          <View style={clsx(styles.mb6)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
              Training Time
            </Text>
            
            <TouchableOpacity
              style={clsx(
                styles.input,
                styles.flexRow,
                styles.justifyBetween,
                styles.itemsCenter,
                styles.p3
              )}
              onPress={() => setShowTimePicker(true)}
              disabled={loading || scheduleData.status === 'cancelled' || scheduleData.status === 'completed'}
            >
              <View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>Selected Time</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mt1)}>
                  {formatTime(scheduleData.trainingTime)}
                </Text>
              </View>
              <Icon name="access-time" size={24} color={colors.primary} />
            </TouchableOpacity>
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

          {/* Action Buttons */}
          <View style={clsx(styles.mt4)}>
            {/* Reschedule Button (only for scheduled/rescheduled status) */}
            {(scheduleData.status === 'scheduled' || scheduleData.status === 'rescheduled') && !isScheduleModified() && (
              <TouchableOpacity
                style={clsx(
                  styles.buttonOutline,
                  styles.mb3,
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

            {/* Cancel Button (only for scheduled/rescheduled/pending status) */}
            {(scheduleData.status === 'scheduled' || scheduleData.status === 'rescheduled' || scheduleData.status === 'pending') && (
              <TouchableOpacity
                style={clsx(
                  styles.buttonOutline,
                  styles.mb3,
                  styles.borderError,
                  styles.flexRow,
                  styles.justifyCenter,
                  styles.itemsCenter
                )}
                onPress={handleCancelTraining}
                disabled={loading}
              >
                <Icon name="cancel" size={20} color={colors.error} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.buttonOutlineText, styles.textError)}>
                  Cancel Training
                </Text>
              </TouchableOpacity>
            )}

            {/* Confirm/Schedule Button (for pending status or when modified) */}
            {(scheduleData.status === 'pending' || isScheduleModified()) && (
              <TouchableOpacity
                style={clsx(
                  styles.button,
                  loading && styles.opacity50
                )}
                onPress={scheduleData.status === 'pending' ? handleConfirmSchedule : confirmReschedule}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <View style={clsx(styles.flexRow, styles.justifyCenter, styles.itemsCenter)}>
                    <Icon 
                      name={scheduleData.status === 'pending' ? "check-circle" : "update"} 
                      size={20} 
                      color={colors.white} 
                      style={clsx(styles.mr2)} 
                    />
                    <Text style={clsx(styles.buttonText)}>
                      {scheduleData.status === 'pending' ? 'Confirm Schedule' : 'Update Schedule'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* View Only Mode (for completed/cancelled status) */}
            {(scheduleData.status === 'completed' || scheduleData.status === 'cancelled') && (
              <View style={clsx(styles.p4, styles.bgGray, styles.rounded, styles.mb3)}>
                <Text style={clsx(styles.textBase, styles.textCenter, styles.textMuted)}>
                  This training has been {scheduleData.status}. No further actions available.
                </Text>
              </View>
            )}

            {/* Back Button */}
            <TouchableOpacity
              style={clsx(
                styles.buttonOutline,
                styles.mt3
              )}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={clsx(styles.buttonOutlineText)}>
                Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Important Notes */}
        <View style={clsx(styles.mt6, styles.p4, styles.bgInfoLight, styles.roundedLg)}>
          <Text style={clsx(styles.textBase, styles.fontBold, styles.textInfo, styles.mb2)}>
            Important Notes:
          </Text>
          <Text style={clsx(styles.textSm, styles.textInfo)}>
            • Training duration: {trainingDetails.duration}
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
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
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