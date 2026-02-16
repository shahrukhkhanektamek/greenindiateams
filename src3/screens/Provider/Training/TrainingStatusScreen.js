import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';
import { reset } from '../../../navigation/navigationService';

const TrainingStatusScreen = ({ navigation, route }) => {
  const {
    Toast,
    Urls,
    postData,
    rootType,
  } = useContext(AppContext);

  const type = route?.params?.type || rootType;
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

  const id = route.params?.trainingId?route.params?.trainingId:"";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trainingData, setTrainingData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const countdownInterval = useRef(null);

  const fetchTrainingStatus = async () => {
    try {
      const response = await postData({}, Urls.trainingScheduleDetail+'/'+id, 'GET', { 
        showErrorMessage: false, showSuccessMessage: false
      });
      
      if (response?.success && response.data) {
        const apiData = response.data || {};
        
        // Format training data
        let formattedData = {
          id: apiData._id || '',
          userId: apiData.user || '',
          trainingId: apiData.trainingId || '',
          scheduleDate: apiData.scheduleDate || null,
          scheduleTime: apiData.scheduleTime || null,
          type: apiData.type || 1,
          providerId: apiData.providerId || '',
          trainingScheduleStatus: apiData.trainingScheduleStatus || 'New',
          attendanceStatus: apiData.attendanceStatus || 'Absent',
          status: apiData.status || true,
          createdBy: apiData.createdBy || '',
          updatedBy: apiData.updatedBy || null,
          createdAt: apiData.createdAt || '',
          updatedAt: apiData.updatedAt || '',
          
          // Training details
          training: apiData.training || null,
          
          // Formatted fields for display
          subject: '',
          description: '',
          trainerName: '',
          duration: '',
          location: '',
          trainingType: '',
          date: '',
          dateDisplay: '',
          time: '',
          timeDisplay: '',
          displayStatus: 'pending',
          statusMessage: '',
          startDate: '',
          endDate: '',
          maxParticipants: 0,
          currentStatus: 'pending'
        };

        // Extract from training object if exists
        if (apiData.training) {
          const training = apiData.training;
          formattedData = {
            ...formattedData,
            subject: training.subject || 'Technical Training',
            description: training.description || 'No description provided',
            trainerName: training.fullName || `${training.firstName || ''} ${training.lastName || ''}`.trim(),
            location: training.location || 'Not specified',
            trainingType: training.type || 'Not specified',
            startDate: training.startDate || null,
            startTime: training.startTime || null,
            endTime: training.endTime || null,
            maxParticipants: training.maxParticipant || 0,
            category: training.category || '',
            slug: training.slug || '',
            remarks: apiData.remarks || ''
          };
          
          // Calculate duration
          if (training.startTime && training.endTime) {
            const startTime = new Date(`2000-01-01T${training.startTime}`);
            const endTime = new Date(`2000-01-01T${training.endTime}`);
            const diffMs = endTime - startTime;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            formattedData.duration = `${diffHours}h ${diffMinutes}m`;
          } else {
            formattedData.duration = 'Duration not specified';
          }
        }

        // Format schedule date
        if (apiData.scheduleDate) {
          const scheduleDate = new Date(apiData.scheduleDate);
          formattedData.date = scheduleDate.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          formattedData.dateDisplay = scheduleDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        }

        // Format schedule time
        if (apiData.scheduleTime) {
          const timeStr = apiData.scheduleTime;
          const [hours, minutes] = timeStr.split(':').map(Number);
          formattedData.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          
          // Add AM/PM format
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const hour12 = hours % 12 || 12;
          formattedData.timeDisplay = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        }

        // Format start date from training
        if (formattedData.startDate) {
          const startDate = new Date(formattedData.startDate);
          formattedData.startDateFormatted = startDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        }

        // Determine display status based ONLY on trainingScheduleStatus
        // trainingScheduleStatus: ["New", "Reject", "Fail", "Complete", "Reschedule"]
        // attendanceStatus is only relevant for Complete/Fail status
        switch (apiData.trainingScheduleStatus) {
          case 'Complete':
            formattedData.displayStatus = 'completed';
            formattedData.currentStatus = 'completed';
            formattedData.statusMessage = 'Training completed successfully!';
            break;
            
          case 'Fail':
            formattedData.displayStatus = 'failed';
            formattedData.currentStatus = 'failed';
            formattedData.statusMessage = 'You failed the training test.';
            break;
            
          case 'Reject':
            formattedData.displayStatus = 'rejected';
            formattedData.currentStatus = 'rejected';
            formattedData.statusMessage = 'Training request rejected by admin.';
            break;
            
          case 'Reschedule':
            formattedData.displayStatus = 'rescheduled';
            formattedData.currentStatus = 'rescheduled';
            formattedData.statusMessage = 'Training has been rescheduled.';
            break;
            
          case 'New':
            formattedData.displayStatus = 'scheduled';
            formattedData.currentStatus = 'scheduled';
            formattedData.statusMessage = 'Training has been scheduled.';
            break;
            
          default:
            formattedData.displayStatus = 'pending';
            formattedData.currentStatus = 'pending';
            formattedData.statusMessage = 'Training status is being processed.';
        }

        setTrainingData(formattedData);
        setLastUpdated(new Date());
        
        // Start countdown if scheduled and status is New or Reschedule
        if (apiData.scheduleDate && (apiData.trainingScheduleStatus === 'New' || apiData.trainingScheduleStatus === 'Reschedule')) {
          startCountdown(apiData.scheduleDate, apiData.scheduleTime);
        } else {
          stopCountdown();
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
        
        if(apiData.trainingScheduleStatus=='Complete' && type=='new')
        {
          reset('ProviderDashboard');
        }

        return { success: true, data: formattedData };
      } else if (response?.success && !response.data) {
        // No training data found
        const noData = {
          displayStatus: 'no-training',
          statusMessage: 'No training scheduled',
          trainingScheduleStatus: 'none',
          attendanceStatus: 'none',
          currentStatus: 'no-training'
        };
        setTrainingData(noData);
        setLastUpdated(new Date());
        stopCountdown();
        return { success: false, data: noData };
      } else {

        navigation.navigate('Training',{type:type});

        // API error
        const errorData = {
          displayStatus: 'error',
          statusMessage: response?.message || 'Failed to load training status',
          trainingScheduleStatus: 'error',
          attendanceStatus: 'error',
          currentStatus: 'error'
        };
        setTrainingData(errorData);
        setLastUpdated(new Date());
        stopCountdown();
        return { success: false, data: errorData };
      }
    } catch (error) {
      console.error('Error fetching training status:', error);
      const errorData = {
        displayStatus: 'error',
        statusMessage: 'Failed to load training status',
        trainingScheduleStatus: 'error',
        attendanceStatus: 'error',
        currentStatus: 'error'
      };
      setTrainingData(errorData);
      setLastUpdated(new Date());
      stopCountdown();
      return { success: false, data: errorData };
    }
  };

  const startCountdown = (scheduleDate, scheduleTime) => {
    // Clear existing interval
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
    
    // Create scheduled datetime
    const scheduledDate = new Date(scheduleDate);
    if (scheduleTime) {
      const [hours, minutes] = scheduleTime.split(':').map(Number);
      scheduledDate.setHours(hours, minutes, 0, 0);
    }
    
    // Update countdown immediately
    updateCountdown(scheduledDate);
    
    // Update every second
    countdownInterval.current = setInterval(() => {
      updateCountdown(scheduledDate);
    }, 1000);
  };
  
  const updateCountdown = (scheduledDate) => {
    const now = new Date();
    const diffMs = scheduledDate - now;
    
    if (diffMs <= 0) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      stopCountdown();
      return;
    }
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    setCountdown({ days, hours, minutes, seconds });
  };
  
  const stopCountdown = () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
  };

  useEffect(() => {
    loadTrainingStatus();
    
    // Cleanup interval on unmount
    return () => {
      stopCountdown();
    };
  }, []);

  const loadTrainingStatus = async () => {
    setLoading(true);
    await fetchTrainingStatus();
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await fetchTrainingStatus();
    setRefreshing(false);
    
    if (result.success) {
      // Toast.show({
      //   type: 'success',
      //   text1: 'Status refreshed',
      //   text2: 'Latest training status loaded',
      //   position: 'bottom',
      //   visibilityTime: 2000,
      // });
    } else if (result.data.displayStatus === 'no-training') {
      Toast.show({
        type: 'info',
        text1: 'No training scheduled',
        text2: 'You have not scheduled any training yet',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to refresh training status',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    const result = await fetchTrainingStatus();
    setRefreshing(false);
    
    if (result.success) {
      // Toast.show({
      //   type: 'success',
      //   text1: 'Status updated',
      //   text2: 'Training information refreshed',
      //   position: 'top',
      //   visibilityTime: 2000,
      // });
    }
  };

  const getStatusConfig = (status, trainingData) => {
    const customMessage = trainingData?.statusMessage || '';
    
    switch (status) {
      case 'scheduled':
        const canReschedule = trainingData?.trainingScheduleStatus === 'New' || trainingData?.trainingScheduleStatus === 'Reschedule';
        return {
          icon: canReschedule ? 'hourglass-empty' : 'event-available',
          iconColor: canReschedule ? colors.warning : colors.success,
          title: canReschedule ? 'Training Scheduled' : 'Training Confirmed',
          subtitle: '', // No attendance for New/Reschedule status
          message: customMessage || 'Your training session has been scheduled.',
          bgColor: canReschedule ? colors.warningLight : colors.successLight,
          textColor: canReschedule ? colors.warning : colors.success,
          buttonText: canReschedule ? 'Reschedule Training' : 'View Details',
          buttonAction: canReschedule 
            ? () => navigation.navigate('Training',{type:''}) 
            : () => handleManualRefresh(),
          showRescheduleButton: canReschedule,
        };
      
      case 'rescheduled':
        return {
          icon: 'event-busy',
          iconColor: colors.info,
          title: 'Training Rescheduled',
          subtitle: '',
          message: customMessage || 'Your training has been rescheduled.',
          bgColor: colors.infoLight,
          textColor: colors.info,
          buttonText: 'View New Schedule',
          buttonAction: () => handleManualRefresh(),
          showRescheduleButton: true,
        };
      
      case 'completed':
        return {
          icon: 'check-circle',
          iconColor: colors.success,
          title: 'Training Completed',
          subtitle: trainingData?.attendanceStatus === 'Present' 
            ? '(Attendance: Present)' 
            : trainingData?.attendanceStatus === 'Absent'
            ? '(Attendance: Absent)'
            : '',
          message: customMessage || 'Training has been completed.',
          bgColor: colors.successLight,
          textColor: colors.success,
          buttonText: 'Go To Dashboard',
          buttonAction: () => navigation.navigate('ProviderDashboard'),
          showRescheduleButton: false,
        };
      
      case 'failed':
        return {
          icon: 'cancel',
          iconColor: colors.error,
          title: 'Training Failed',
          subtitle: '', // No attendance for Fail status
          message: customMessage || 'You failed the training test.',
          bgColor: colors.errorLight,
          textColor: colors.error,
          buttonText: 'Contact Support',
          buttonAction: () => navigation.navigate('Support'),
          showRescheduleButton: false,
        };
      
      case 'rejected':
        return {
          icon: 'block',
          iconColor: colors.error,
          title: 'Training Rejected',
          subtitle: '',
          message: customMessage || 'Your training request has been rejected.',
          bgColor: colors.errorLight,
          textColor: colors.error,
          buttonText: 'Contact Support',
          buttonAction: () => navigation.navigate('Support'),
          showRescheduleButton: false,
        };
      
      case 'pending':
        return {
          icon: 'hourglass-empty',
          iconColor: colors.warning,
          title: 'Training Pending',
          subtitle: '',
          message: customMessage || 'Training status is being processed.',
          bgColor: colors.warningLight,
          textColor: colors.warning,
          buttonText: 'Check Status',
          buttonAction: () => handleManualRefresh(),
          showRescheduleButton: false,
        };
      
      case 'no-training':
        return {
          icon: 'info',
          iconColor: colors.info,
          title: 'No Training Scheduled',
          subtitle: '',
          message: 'You have not scheduled any training yet.',
          bgColor: colors.infoLight,
          textColor: colors.info,
          buttonText: 'Schedule Training',
          buttonAction: () => navigation.navigate('TrainingSchedule'),
          showRescheduleButton: false,
        };
      
      case 'error':
      default:
        return {
          icon: 'error',
          iconColor: colors.error,
          title: 'Error Loading Status',
          subtitle: '',
          message: trainingData?.message || 'Unable to load training status.',
          bgColor: colors.errorLight,
          textColor: colors.error,
          buttonText: 'Try Again',
          buttonAction: handleRefresh,
          showRescheduleButton: false,
        };
    }
  };

  if (loading) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading training status...
        </Text>
        <TouchableOpacity
          onPress={handleRefresh}
          style={clsx(styles.mt6, styles.px4, styles.py2, styles.bgPrimary, styles.roundedFull)}
        >
          <Text style={clsx(styles.textWhite, styles.textSm)}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = trainingData?.currentStatus || 'no-training';
  const statusConfig = getStatusConfig(status, trainingData);

  const formatLastUpdated = () => {
    try {
      return lastUpdated.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return 'Just now';
    }
  };

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title={"Training Scheduled"}
        showBack
        showNotification={false}
        type="white"
        rightAction={true}
        rightActionIcon="refresh"
        showProfile={false}
        onRightActionPress={handleManualRefresh}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.px41,)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Refresh Status Indicator */}
        {refreshing && (
          <View style={clsx(
            styles.p3,
            styles.mb4,
            styles.bgPrimaryLight,
            styles.roundedLg,
            styles.itemsCenter,
            styles.flexRow,
            styles.justifyCenter
          )}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={clsx(styles.textSm, styles.textPrimary, styles.ml2)}>
              Refreshing training status...
            </Text>
          </View>
        )}

        {/* Status Card */}
        <View style={clsx(
          styles.p6,
          styles.itemsCenter,
        )}>
          {/* Status Icon */}
          <View style={clsx(
            styles.p4,
            styles.roundedFull,
            styles.mb4,
            { backgroundColor: `${statusConfig.iconColor}20` }
          )}>
            <Icon 
              name={statusConfig.icon} 
              size={30} 
              color={statusConfig.iconColor} 
            />
          </View>       

          {/* Training Details (if available) */}
          {trainingData && trainingData.subject && status !== 'no-training' && status !== 'error' && (
            <View style={clsx(styles.wFull, styles.mb2)}>

              {/* Schedule Details (for scheduled/rescheduled/completed status) */}
              {(status === 'scheduled' || status === 'completed' || status === 'rescheduled' || status === 'rejected') && (trainingData.date || trainingData.timeDisplay) && (
                <View style={clsx(styles.p4, styles.bgPrimaryLight, styles.roundedLg, styles.mb2)}>
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary, styles.mb3)}>
                    Schedule Details:
                  </Text>

                  <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb1)}>
                    {trainingData.subject}
                  </Text>

                  {/* Show description if available */}
                  {trainingData.description && trainingData.description !== 'No description provided' && (
                    <Text style={clsx(styles.textBase, styles.textBlack, styles.mb1)}>
                      {trainingData.description}
                    </Text>
                  )}
                  <View style={clsx(styles.mt2)}>
                  <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                    <Icon name="person" size={20} color={colors.primary} />
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                      Trainer: {trainingData.trainerName}
                    </Text>
                  </View>
                  
                  {trainingData.location && trainingData.location !== 'Not specified' && (
                    <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                      <Icon name="location-on" size={20} color={colors.primary} />
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                        Location: {trainingData.location}
                      </Text>
                    </View>
                  )}
                  
                  {trainingData.duration && trainingData.duration !== 'Duration not specified' && (
                    <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                      <Icon name="access-time" size={20} color={colors.primary} />
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                        Duration: {trainingData.duration}
                      </Text>
                    </View>
                  )}
                  
                  {trainingData.maxParticipants > 0 && (
                    <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                      <Icon name="people" size={20} color={colors.primary} />
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                        Capacity: {trainingData.maxParticipants} participants
                      </Text>
                    </View>
                  )}
                </View>
                  
                  {trainingData.dateDisplay && (
                    <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2, styles.mt2)}>
                      <Icon name="event" size={20} color={colors.primary} />
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                        Date: {trainingData.dateDisplay}
                      </Text>
                    </View>
                  )}
                  
                  {trainingData.timeDisplay && (
                    <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb1)}>
                      <Icon name="schedule" size={20} color={colors.primary} />
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                        Time: {trainingData.timeDisplay}
                      </Text>
                    </View>
                  )}
                  
                  {/* Running Countdown Timer (only for New/Reschedule status) */}
                  {(trainingData.trainingScheduleStatus === 'New') && trainingData.scheduleDate && (
                    <View style={clsx(styles.mt1, styles.p3, styles.bgWhite, styles.roundedLg)}>
                      <Text style={clsx(styles.textSm, styles.fontBold, styles.textPrimary, styles.mb2, styles.textCenter)}>
                        Training starts in:
                      </Text>
                      <View style={clsx(styles.flexRow, styles.justifyCenter, styles.itemsCenter)}>
                        <View style={clsx(styles.itemsCenter, styles.mx1)}>
                          <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary)}>
                            {countdown.days.toString().padStart(2, '0')}
                          </Text>
                          <Text style={clsx(styles.textXs, styles.textGray)}>Days</Text>
                        </View>
                        <Text style={clsx(styles.textLg, styles.textPrimary, styles.mx1)}>:</Text>
                        <View style={clsx(styles.itemsCenter, styles.mx1)}>
                          <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary)}>
                            {countdown.hours.toString().padStart(2, '0')}
                          </Text>
                          <Text style={clsx(styles.textXs, styles.textGray)}>Hours</Text>
                        </View>
                        <Text style={clsx(styles.textLg, styles.textPrimary, styles.mx1)}>:</Text>
                        <View style={clsx(styles.itemsCenter, styles.mx1)}>
                          <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary)}>
                            {countdown.minutes.toString().padStart(2, '0')}
                          </Text>
                          <Text style={clsx(styles.textXs, styles.textGray)}>Mins</Text>
                        </View>
                        <Text style={clsx(styles.textLg, styles.textPrimary, styles.mx1)}>:</Text>
                        <View style={clsx(styles.itemsCenter, styles.mx1)}>
                          <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary)}>
                            {countdown.seconds.toString().padStart(2, '0')}
                          </Text>
                          <Text style={clsx(styles.textXs, styles.textGray)}>Secs</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Status Details */}
              <View style={clsx(styles.p4, styles.bgGray100, styles.roundedLg)}>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb2)}>
                  Status Information:
                </Text>
                <View style={clsx(styles.flexRow, styles.justifyBetween)}>
                  <View>
                    <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary, styles.mt4)}>Schedule Status:</Text>
                    <Text style={clsx(
                      styles.textBase,
                      styles.textBlack,
                    )}>
                      {trainingData.trainingScheduleStatus!='New' && trainingData.trainingScheduleStatus!='Reschedule'?trainingData.trainingScheduleStatus:'Pending'}
                    </Text>
                  </View>
                  
                  {/* Only show attendance for Complete/Fail status */}
                  {(trainingData.trainingScheduleStatus === 'Complete' || trainingData.trainingScheduleStatus === 'Fail') && (
                    <View>
                      <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary, styles.mt4)}>Attendance:</Text>
                      <Text style={clsx(
                        styles.textBase,
                        styles.textBlack,
                      )}>
                        {trainingData.attendanceStatus}
                      </Text>
                    </View>
                  )}

                </View>

                {(trainingData?.remarks) && (
                  <View>
                    <Text style={clsx(styles.textLg, styles.fontBold, styles.textPrimary, styles.mt4)}>Remark:</Text>
                    <Text style={clsx(
                      styles.textBase,
                      styles.textBlack,
                    )}>{trainingData?.remarks}</Text>
                  </View>
                )}

              </View>
            </View>
          )}

          {!id && (
            <>
              {/* Action Button */}
              <TouchableOpacity
                style={clsx(
                  styles.button,
                  styles.px6,
                  styles.bgPrimary,
                  { opacity: refreshing ? 0.7 : 1 }
                )}
                onPress={statusConfig.buttonAction}
                disabled={refreshing}
              >
                <Text style={clsx(styles.buttonText)}>
                  {refreshing ? 'Loading...' : statusConfig.buttonText}
                </Text>
              </TouchableOpacity>  
            </>
           )}       
        </View>
          {!id && (
            <>
              {/* Important Information */}
              <View style={clsx(styles.mt1, styles.p4, styles.bgInfoLight, styles.roundedLg, styles.mx2)}>
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textInfo, styles.mb3)}>
                  Training Information
                </Text>
                
                {(trainingData?.trainingScheduleStatus === 'New' || trainingData?.trainingScheduleStatus === 'Reschedule') && (
                  <Text style={clsx(styles.textBase, styles.textInfo)}>
                    {'\n'}• Please come to the office with your KYC documents.
                    {'\n'}• Please arrive 30 minutes before the scheduled time
                    {'\n'}• You can reschedule using the button above
                  </Text>
                )}
                
                {trainingData?.trainingScheduleStatus === 'Complete' && (
                  <Text style={clsx(styles.textBase, styles.textInfo)}>
                    • Training Status: Complete
                    {trainingData?.attendanceStatus ? `\n• Attendance: ${trainingData.attendanceStatus}` : ''}
                    {'\n'}• Training has been successfully completed
                    {'\n'}• You can now access all platform features
                    {'\n'}• For any queries, contact support
                  </Text>
                )}
                
                {trainingData?.trainingScheduleStatus === 'Fail' && (
                  <Text style={clsx(styles.textBase, styles.textInfo)}>
                    • Training Status: Fail
                    {trainingData?.attendanceStatus ? `\n• Attendance: ${trainingData.attendanceStatus}` : ''}
                    {'\n'}• You need to retake the training test
                    {'\n'}• Click the button above contact support for assistance
                    {'\n'}• Passing score is required for completion
                  </Text>
                )}
                
                {trainingData?.trainingScheduleStatus === 'Reject' && (
                  <Text style={clsx(styles.textBase, styles.textInfo)}>
                    • Training Status: Reject
                    {'\n'}• Your training request has been rejected
                    {'\n'}• Please contact support for more details
                    {'\n'}• You may need to submit a new request
                  </Text>
                )}
                
                {status === 'no-training' && (
                  <Text style={clsx(styles.textBase, styles.textInfo)}>
                    • Training is required for account activation
                    {'\n'}• Please schedule your training session
                    {'\n'}• You can schedule from the button above
                    {'\n'}• Duration: 2 hours approximately
                    {'\n'}• Location: Training Center or Online
                  </Text>
                )}
                
                {status === 'error' && (
                  <Text style={clsx(styles.textBase, styles.textInfo)}>
                    • Unable to load training status
                    {'\n'}• Please check your internet connection
                    {'\n'}• Try refreshing the page
                    {'\n'}• If problem persists, contact support
                  </Text>
                )}
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
                  styles.justifyCenter,
                  styles.mx2
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

export default TrainingStatusScreen;