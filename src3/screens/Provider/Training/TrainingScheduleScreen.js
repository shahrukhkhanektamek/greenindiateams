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
    fetchProfile,
    userProfile,
    user,
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
    startTime: '',
    endTime: '',
    maxParticipant: '',
  });

  // Fetch training schedule data
  const fetchTrainingData = async () => {
    setLoading(true);
    try {
      const response = await postData({}, Urls.trainingSchedule, 'GET', { 
        showErrorMessage: false, showSuccessMessage: false 
      });
      
      if (response?.success) {
        const apiData = response.data || {};
        console.log('API Data:', apiData);
        
        // Extract training details from trainer object
        if (apiData.trainer) {
          const trainer = apiData.trainer;
          setTrainingDetails({
            title: trainer.subject || 'Technical Training',
            instructor: trainer.fullName || 'Trainer Name',
            duration: `${trainer.startTime || '10:00'} - ${trainer.endTime || '12:00'}`,
            startTime: trainer.startTime || '10:00',
            endTime: trainer.endTime || '12:00',
            location: trainer.location || 'Training Center',
            type: 'Classroom',
            description: trainer.description || 'Technical training session',
            maxParticipant: trainer.maxParticipant || '50',
            trainingId: apiData._id || '',
          });
        }
        
        // Set schedule data if exists (from trainigSubmit object)
        if (apiData.trainigSubmit && apiData.trainigSubmit._id) {
          const schedule = apiData.trainigSubmit;
          
          // Create Date objects from scheduleDate and scheduleTime
          let trainingDate = new Date();
          let trainingTime = new Date();
          
          if (schedule.scheduleDate) {
            // Parse date string
            trainingDate = new Date(schedule.scheduleDate);
            
            // If we have scheduleTime, combine with date
            if (schedule.scheduleTime) {
              // Parse time string (e.g., "15:30")
              const [hours, minutes] = schedule.scheduleTime.split(':').map(Number);
              trainingDate.setHours(hours, minutes, 0, 0);
              trainingTime = new Date(trainingDate);
            } else {
              trainingTime = new Date(trainingDate);
              trainingTime.setHours(10, 0, 0, 0); // Default time 10:00 AM
            }
          }
          
          // Determine status based on API data 
          let status = 'pending';
          console.log(schedule)
          if (schedule.trainingScheduleStatus === 'New' || schedule.status === true) {
            status = 'scheduled';
          } else if (schedule.status === false) {
            status = 'cancelled';
          }
          
          console.log('Setting schedule data:', {
            trainingDate,
            trainingTime,
            status,
            scheduleId: schedule._id,
          });
          
          setScheduleData({
            trainingDate: trainingDate,
            trainingTime: trainingTime,
            status: status,
            originalDate: new Date(trainingDate),
            originalTime: new Date(trainingTime),
            scheduleId: schedule._id,
          });
        } else {
          // No schedule exists, set as pending
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const defaultTime = new Date(tomorrow);
          defaultTime.setHours(10, 0, 0, 0);
          
          setScheduleData({
            trainingDate: tomorrow,
            trainingTime: defaultTime,
            status: 'pending',
            originalDate: new Date(tomorrow),
            originalTime: new Date(defaultTime),
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
      duration: '10:00 - 12:00',
      startTime: '10:00',
      endTime: '12:00',
      location: 'Training Center',
      type: 'Classroom',
      description: 'Technical training session',
      maxParticipant: '50',
      trainingId: '',
    });
    
    // Set default date to tomorrow with pending status
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultTime = new Date(tomorrow);
    defaultTime.setHours(10, 0, 0, 0);
    
    setScheduleData({
      trainingDate: tomorrow,
      trainingTime: defaultTime,
      status: 'pending',
      originalDate: new Date(tomorrow),
      originalTime: new Date(defaultTime),
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
      // Format date as ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
      const year = scheduleData.trainingDate.getFullYear();
      const month = String(scheduleData.trainingDate.getMonth() + 1).padStart(2, '0');
      const day = String(scheduleData.trainingDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}T00:00:00.000Z`;
      
      // Format time as HH:mm
      const hours = String(scheduleData.trainingTime.getHours()).padStart(2, '0');
      const minutes = String(scheduleData.trainingTime.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;

      // Prepare data for API based on your response structure
      const submitData = {
        scheduleDate: formattedDate,
        scheduleTime: formattedTime,
        status: true, // true for scheduled
        trainingScheduleStatus: 'New',
        trainingId: trainingDetails.trainingId,
        // Add user and provider ID from context/profile if available
        ...(userProfile?.id && { user: userProfile.id }),
        ...(userProfile?.providerId && { providerId: userProfile.providerId }),
      };

      // If updating existing schedule, add scheduleId
      if (scheduleData.scheduleId) {
        submitData.scheduleId = scheduleData.scheduleId;
      }

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
        const newSchedule = response.data?.trainigSubmit || response.data;
        
        if (newSchedule) {
          // Create Date objects from new schedule
          let newDate = new Date();
          let newTime = new Date();
          
          if (newSchedule.scheduleDate) {
            newDate = new Date(newSchedule.scheduleDate);
            
            if (newSchedule.scheduleTime) {
              const [hours, minutes] = newSchedule.scheduleTime.split(':').map(Number);
              newDate.setHours(hours, minutes, 0, 0);
              newTime = new Date(newDate);
            }
          }
          
          setScheduleData(prev => ({
            ...prev,
            trainingDate: newDate,
            trainingTime: newTime,
            originalDate: new Date(newDate),
            originalTime: new Date(newTime),
            status: 'scheduled',
            scheduleId: newSchedule._id,
          }));
        }
        
        await fetchProfile();
        navigate('TrainingStatus');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to schedule training',
        });
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
    // First show date/time pickers for rescheduling
    Alert.alert(
      'Reschedule Training',
      'Select new date and time for training',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Select Date',
          onPress: () => setShowDatePicker(true),
        },
        {
          text: 'Select Time',
          onPress: () => setShowTimePicker(true),
        },
      ]
    );
  };

  const confirmReschedule = async () => {
    if (!validateSchedule()) {
      return;
    }

    setLoading(true);

    try {
      // Format date as ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
      const year = scheduleData.trainingDate.getFullYear();
      const month = String(scheduleData.trainingDate.getMonth() + 1).padStart(2, '0');
      const day = String(scheduleData.trainingDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}T00:00:00.000Z`;
      
      // Format time as HH:mm
      const hours = String(scheduleData.trainingTime.getHours()).padStart(2, '0');
      const minutes = String(scheduleData.trainingTime.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;

      // Prepare data for API
      const submitData = {
        scheduleDate: formattedDate,
        scheduleTime: formattedTime,
        status: true,
        trainingScheduleStatus: 'New',
        scheduleId: scheduleData.scheduleId, 
        trainingId: trainingDetails.trainingId, 
        rescheduled: true,
        ...(userProfile?.id && { user: userProfile.id }),
        ...(userProfile?.providerId && { providerId: userProfile.providerId }),
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
        const newSchedule = response.data?.trainigSubmit || response.data;
        
        if (newSchedule) {
          let newDate = new Date();
          let newTime = new Date();
          
          if (newSchedule.scheduleDate) {
            newDate = new Date(newSchedule.scheduleDate);
            
            if (newSchedule.scheduleTime) {
              const [hours, minutes] = newSchedule.scheduleTime.split(':').map(Number);
              newDate.setHours(hours, minutes, 0, 0);
              newTime = new Date(newDate);
            }
          }
          
          setScheduleData(prev => ({
            ...prev,
            trainingDate: newDate,
            trainingTime: newTime,
            originalDate: new Date(newDate),
            originalTime: new Date(newTime),
            status: 'rescheduled',
          }));
        }
        
        await fetchProfile();
        navigate('TrainingStatus');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to reschedule training',
        });
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
        status: false,
        scheduleId: scheduleData.scheduleId,
        trainingScheduleStatus: 'Cancelled',
        trainingId: trainingDetails.trainingId,
        ...(userProfile?.id && { user: userProfile.id }),
        ...(userProfile?.providerId && { providerId: userProfile.providerId }),
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
        
        // Update local status
        setScheduleData(prev => ({
          ...prev,
          status: 'cancelled',
        }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to cancel training',
        });
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
              <Icon name="schedule" size={18} color={colors.textMuted} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                Training Time: <Text style={styles.fontMedium}>{trainingDetails.duration}</Text>
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.mb2)}>
              <Icon name="location-on" size={18} color={colors.textMuted} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                Location: <Text style={styles.fontMedium}>{trainingDetails.location}</Text>
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.mb2)}>
              <Icon name="people" size={18} color={colors.textMuted} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.textBlack)}>
                Max Participants: <Text style={styles.fontMedium}>{trainingDetails.maxParticipant}</Text>
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow)}>
              <Icon name="description" size={18} color={colors.textMuted} style={clsx(styles.mr2)} />
              <Text style={clsx(styles.textBase, styles.textBlack, styles.flex1)}>
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
              // onPress={() => setShowDatePicker(true)}
              disabled={loading || scheduleData.status === 'cancelled' || scheduleData.status === 'completed'}
            >
              <View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>Selected Date</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mt1)}>
                  {formatDate(scheduleData.trainingDate)}
                </Text>
              </View>
              {/* <Icon name="calendar-today" size={24} color={colors.primary} /> */}
            </TouchableOpacity>
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
              // onPress={() => setShowTimePicker(true)}
              disabled={loading || scheduleData.status === 'cancelled' || scheduleData.status === 'completed'}
            >
              <View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>Selected Time</Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mt1)}>
                  {formatTime(scheduleData.trainingTime)}
                </Text>
              </View>
              {/* <Icon name="access-time" size={24} color={colors.primary} /> */}
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
                onPress={confirmReschedule}
                disabled={loading}
              >
                <Icon name="update" size={20} color={colors.primary} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.buttonOutlineText)}>
                  Reschedule Training
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
            {'\n'}• Maximum participants: {trainingDetails.maxParticipant}
            {'\n'}• Rescheduling is allowed up to 24 hours before training
            {'\n'}• Location: {trainingDetails.location}
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