import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';
import { navigate, reset } from '../../../navigation/navigationService';

const TrainingScheduleScreen = ({ navigation, route }) => {
  const {
    Toast,
    Urls,
    postData,
    fetchProfile,
    userProfile,
    user,
  } = useContext(AppContext);

  const type = route?.params?.type;
  // useEffect(() => {
  //   const backAction = () => {
  //       if(type=='new')
  //       {
  //         BackHandler.exitApp()
  //         return true;
  //       }
  //   };  
  //   const backHandler = BackHandler.addEventListener(
  //     "hardwareBackPress",
  //     backAction
  //   );  
  //   return () => backHandler.remove();
  // }, []);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [noTrainingFound, setNoTrainingFound] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isFetchingDateData, setIsFetchingDateData] = useState(false);
  
  // Initial schedule data
  const [scheduleData, setScheduleData] = useState({
    trainingDate: null,
    status: 'pending', // 'pending', 'scheduled', 'cancelled', 'rescheduled'
    originalDate: null,
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

  // Format date to yyyy-mm-dd
  const formatDateToYYYYMMDD = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch training schedule data
  const fetchTrainingData = async (date = null) => {
    setLoading(true);
    setNoTrainingFound(false);
    
    try {
      // Prepare query parameters
      let params = {};
      if (date) {
        const dateStr = formatDateToYYYYMMDD(date);
        params = { date: dateStr };
      }
      console.log('API Params:', params);
      
      const response = await postData(params, Urls.trainingSchedule, 'GET', { 
        showErrorMessage: false, showSuccessMessage: false 
      });
      
      if (response?.success) {
        const apiData = response.data || {};
        console.log('API Data:', apiData);
        
        // Check if trainer data exists
        if (!apiData.trainer) {
          setNoTrainingFound(true);
          setDefaultData();
          return;
        }
        
        // Extract training details from trainer object
        const trainer = apiData.trainer;
        setTrainingDetails({
          title: trainer.subject || 'AC Home Appliance Repair And Services',
          instructor: trainer.fullName || 'Suneel Kumar',
          duration: `${formatTime(trainer.startTime) || '16:16'} - ${formatTime(trainer.endTime) || '22:12'}`,
          startTime: trainer.startTime || '16:16',
          endTime: trainer.endTime || '22:12',
          location: trainer.location || 'Delhi',
          type: 'Classroom',
          description: trainer.description || 'This training covers the basics of AC and home appliance repair, including installation, troubleshooting, maintenance, and safety practices. Technicians will learn common fault diagnosis, proper tool usage, and customer service standards to deliver quality and reliable service.',
          maxParticipant: trainer.maxParticipant || '2',
          trainingId: apiData._id || '',
        });
        
        // Process available dates from dates array
        if (apiData.dates && apiData.dates.length > 0) {
          const dates = apiData.dates.map(dateStr => {
            // Parse date string and create Date object
            const dateObj = new Date(dateStr);
            // Set time to noon to avoid timezone issues
            dateObj.setHours(12, 0, 0, 0);
            return dateObj;
          });
          
          // Sort dates in ascending order
          dates.sort((a, b) => a - b);
          
          setAvailableDates(dates);
          
          // For first load, set selected date to first available date
          let dateToSelect = dates[0];
          if (date) {
            // If date parameter is provided, use it
            dateToSelect = date;
          } else if (selectedDate) {
            // Keep previously selected date if available
            dateToSelect = selectedDate;
          }
          
          // Make sure selected date is valid and in available dates
          const isValidDate = dateToSelect instanceof Date && !isNaN(dateToSelect.getTime());
          const isInAvailableDates = dates.some(d => 
            d.toDateString() === dateToSelect.toDateString()
          );
          
          if (!isValidDate || !isInAvailableDates) {
            dateToSelect = dates[0];
          }
          
          setSelectedDate(dateToSelect);
          
          // Check if there is existing schedule in API response
          // In new API response, there's no trainigSubmit object
          // So we need to check if schedule exists from previous calls or context
          
          // For now, set as pending since no schedule exists in this response
          setScheduleData({
            trainingDate: dateToSelect,
            status: 'pending',
            originalDate: new Date(dateToSelect),
            scheduleId: null,
          });
          
          setNoTrainingFound(false);
        } else {
          // No dates available
          setNoTrainingFound(true);
          setDefaultData();
        }
      } else {
        // API success false - No training found
        setNoTrainingFound(true);
        setDefaultData();
      }
    } catch (error) {
      console.error('Error fetching training data:', error);
      setNoTrainingFound(true);
      setDefaultData();
    } finally {
      setLoading(false);
      setDataLoaded(true);
      setRefreshing(false);
      setIsFetchingDateData(false);
    }
  };

  // Handle date selection
  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setIsFetchingDateData(true);
    
    // Call API with selected date
    await fetchTrainingData(date);
  };

  // Helper function to set default data
  const setDefaultData = () => {
    // Set default values
    setTrainingDetails({
      title: 'AC Home Appliance Repair And Services',
      instructor: 'Suneel Kumar',
      duration: '16:16 - 22:12',
      startTime: '16:16', 
      endTime: '22:12',
      location: 'Delhi',
      type: 'Classroom',
      description: 'This training covers the basics of AC and home appliance repair, including installation, troubleshooting, maintenance, and safety practices. Technicians will learn common fault diagnosis, proper tool usage, and customer service standards to deliver quality and reliable service.',
      maxParticipant: '2',
      trainingId: '',
    });
    
    // Set default date to first available date or tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setScheduleData({
      trainingDate: tomorrow,
      status: 'pending',
      originalDate: new Date(tomorrow),
      scheduleId: null,
    });
    
    setSelectedDate(tomorrow);
  };

  useEffect(() => {
    fetchTrainingData();
  }, []);

  // Refresh function
  const onRefresh = () => {
    setRefreshing(true);
    fetchTrainingData(selectedDate);
  };

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

  const formatTime = (timeString) => {
    // If timeString is already a Date object
    if (timeString instanceof Date && !isNaN(timeString.getTime())) {
      return timeString.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    
    // If timeString is in "HH:mm" format (e.g., "14:30")
    if (typeof timeString === 'string' && timeString.includes(':')) {
      try {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        
        return date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } catch (error) {
        console.error('Error formatting time:', error);
        return timeString;
      }
    }
    
    // Return as is if can't parse
    return timeString;
  };

  const isScheduleModified = () => {
    if (!scheduleData.originalDate) return false;
    
    if (!(scheduleData.trainingDate instanceof Date) || !(scheduleData.originalDate instanceof Date)) {
      return false;
    }
    
    return scheduleData.trainingDate.toDateString() !== scheduleData.originalDate.toDateString();
  };

  const validateSchedule = () => {
    if (!selectedDate) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Date',
        text2: 'Please select a date',
      });
      return false;
    }

    const now = new Date();
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if selected date is in the past
    if (selectedDateOnly < today) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Date',
        text2: 'Please select a future date',
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
      // Format date as yyyy-mm-dd
      const formattedDate = formatDateToYYYYMMDD(selectedDate);
      
      // Format time as HH:mm (from API)
      const formattedTime = trainingDetails.startTime || "16:16";

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
        // Toast.show({
        //   type: 'success',
        //   text1: 'Success',
        //   text2: scheduleData.scheduleId ? 'Schedule updated successfully!' : 'Training scheduled successfully!',
        // });
        
        // Update local state with new schedule
        const newSchedule = response.data?.trainigSubmit || response.data;
        
        if (newSchedule) {
          // Create Date object from new schedule
          let newDate = new Date();
          if (newSchedule.scheduleDate) {
            newDate = new Date(newSchedule.scheduleDate);
          }
          
          setScheduleData(prev => ({
            ...prev,
            trainingDate: newDate,
            originalDate: new Date(newDate),
            status: 'scheduled',
            scheduleId: newSchedule._id,
          }));
          
          // Update selected date
          setSelectedDate(newDate);
        }
        
        await fetchProfile();
        if(type=='new') reset('TrainingStatus',{type:type});
        else navigate('TrainingStatus',{type:type});
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

  const confirmReschedule = async () => {
    if (!validateSchedule()) {
      return;
    }

    setLoading(true);

    try {
      // Format date as yyyy-mm-dd
      const formattedDate = formatDateToYYYYMMDD(selectedDate);
      
      // Format time as HH:mm (from API)
      const formattedTime = trainingDetails.startTime || "16:16";

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
        // Toast.show({
        //   type: 'success',
        //   text1: 'Success',
        //   text2: 'Training rescheduled successfully!',
        // });
        
        // Update local state
        const newSchedule = response.data?.trainigSubmit || response.data;
        
        if (newSchedule) {
          let newDate = new Date();
          if (newSchedule.scheduleDate) {
            newDate = new Date(newSchedule.scheduleDate);
          }
          
          setScheduleData(prev => ({
            ...prev,
            trainingDate: newDate,
            originalDate: new Date(newDate),
            status: 'rescheduled',
          }));
          
          // Update selected date
          setSelectedDate(newDate);
        }
        
        await fetchProfile();
        navigate('TrainingStatus',{type:type});
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
        // Toast.show({
        //   type: 'success',
        //   text1: 'Success',
        //   text2: 'Training cancelled successfully',
        // });
        
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
          `New schedule: ${formatDate(selectedDate)} at ${formatTime(trainingDetails.startTime)}`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                // Reset to original schedule
                setScheduleData(prev => ({
                  ...prev,
                  trainingDate: prev.originalDate,
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
  }, [selectedDate, scheduleData.trainingDate]);

  // Date item component
  const DateItem = ({ date, index }) => {
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const dateStr = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
    const dayStr = date.toLocaleDateString('en-IN', {
      weekday: 'short',
    });

    return (
      <TouchableOpacity
        style={clsx(
          styles.p3,
          styles.px6,
          styles.mr3,
          styles.itemsCenter,
          styles.roundedMd,
          styles.border,
          isSelected ? styles.borderPrimary : styles.borderGray,
          isSelected ? styles.bgPrimaryLight : styles.bgWhite
        )}
        onPress={() => handleDateSelect(date)}
        disabled={isFetchingDateData || scheduleData.status === 'cancelled' || scheduleData.status === 'completed'}
      >
        <Text style={clsx(
          styles.textSm,
          isSelected ? styles.textWhite : styles.textMuted
        )}>
          {dayStr}
        </Text>
        <Text style={clsx(
          styles.textLg,
          styles.fontBold,
          styles.mt1,
          isSelected ? styles.textWhite : styles.textBlack
        )}>
          {dateStr.split(' ')[0]}
        </Text>
        <Text style={clsx(
          styles.textSm,
          isSelected ? styles.textWhite : styles.textMuted
        )}>
          {dateStr.split(' ')[1]}
        </Text>
      </TouchableOpacity>
    );
  };

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
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="Pull to refresh"
            titleColor={colors.textMuted}
          />
        }
      >
        {noTrainingFound ? (
          // Show message when no training found
          <View style={clsx(styles.flex1, styles.justifyCenter, styles.itemsCenter, styles.mt10)}>
            <View style={clsx(styles.bgWhite, styles.p6, styles.roundedLg, styles.shadowSm, styles.itemsCenter)}>
              <Icon name="school" size={60} color={colors.textMuted} />
              <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack, styles.mt4, styles.mb2)}>
                No Upcoming Training
              </Text>
              <Text style={clsx(styles.textBase, styles.textMuted, styles.textCenter, styles.mb6)}>
                You don't have any upcoming training scheduled at the moment.
              </Text>
              
              <TouchableOpacity
                style={clsx(styles.buttonOutline, styles.flexRow, styles.justifyCenter, styles.itemsCenter)}
                onPress={onRefresh}
              >
                <Icon name="refresh" size={20} color={colors.primary} style={clsx(styles.mr2)} />
                <Text style={clsx(styles.buttonOutlineText)}>
                  Refresh
                </Text>
              </TouchableOpacity>
              
              <Text style={clsx(styles.textSm, styles.textMuted, styles.mt6, styles.textCenter)}>
                Please check back later or contact your administrator.
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* Available Dates Selector */}
            {availableDates.length > 0 && (
              <View style={clsx(styles.mb6)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
                  Select Training Date
                </Text>
                
                {isFetchingDateData && (
                  <View style={clsx(styles.mb3, styles.flexRow, styles.itemsCenter)}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={clsx(styles.textSm, styles.textMuted, styles.ml2)}>
                      Loading training details...
                    </Text>
                  </View>
                )}
                
                <FlatList
                  horizontal
                  data={availableDates}
                  renderItem={({ item, index }) => (
                    <DateItem date={item} index={index} />
                  )}
                  keyExtractor={(item, index) => index.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={clsx(styles.py2)}
                />
              </View>
            )}

            

            {/* Training Details Card */}
            <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm, styles.mb6)}>
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
                <Icon name="school" size={18} color={colors.primary} style={clsx(styles.mr2)} />
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
                  <Icon
                    name="location-on"
                    size={18}
                    color={colors.textMuted}
                    style={clsx(styles.mr2)}
                  />

                  <Text
                    style={clsx(
                      styles.textBase,
                      styles.textBlack,
                      styles.flexWrap,
                      { flex: 1, flexShrink: 1 }
                    )}
                  >
                    Location:{" "}
                    <Text style={styles.fontMedium}>
                      {trainingDetails.location}
                    </Text>
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
            <View style={clsx(styles.bgWhite, styles.p0, styles.roundedLg, styles.shadowSm)}>
              

              

              {/* Action Buttons */}
              <View style={clsx(styles.mt0)}>
                {/* Cancel Button (only for scheduled/rescheduled status) */}
                {(scheduleData.status === 'scheduled' || scheduleData.status === 'rescheduled') && (
                  <TouchableOpacity
                    style={clsx(
                      styles.buttonError,
                      styles.mb3
                    )}
                    onPress={handleCancelTraining}
                    disabled={loading}
                  >
                    <View style={clsx(styles.flexRow, styles.justifyCenter, styles.itemsCenter)}>
                      <Icon name="cancel" size={20} color={colors.white} style={clsx(styles.mr2)} />
                      <Text style={clsx(styles.buttonText)}>
                        Cancel Training
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

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
                    onPress={() => {
                      // User can select a new date from available dates
                    }}
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

          
              
            {/* Contact Support */}
            <TouchableOpacity
              style={clsx(
                styles.mt6,
                styles.p4,
                styles.border,
                styles.borderPrimary,
                styles.roundedLg,
                styles.itemsCenter,
                styles.flexRow,
                styles.justifyCenter
              )}
              onPress={() => navigation.navigate('Support')}
              disabled={refreshing}
            >
              <Icon name="help" size={20} color={colors.primary} />
              <Text style={clsx(styles.textBase, styles.textPrimary, styles.ml2)}>
                Need Help? Contact Support
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default TrainingScheduleScreen;