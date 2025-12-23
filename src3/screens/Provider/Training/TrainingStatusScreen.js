import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

const TrainingStatusScreen = ({ navigation }) => {
  const {
    Toast,
    Urls,
    postData,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trainingData, setTrainingData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchTrainingStatus = async () => {
    try {
      const response = await postData({}, Urls.trainingScheduleDetail, 'GET', { 
        showErrorMessage: false, showSuccessMessage: false
      });
      
      if (response?.success && response.data) {
        const apiData = response.data || {};
        // console.log('Training API Data:', apiData);
        
        // Format training data
        let formattedData = {
          id: apiData._id || '',
          subject: '',
          description: '',
          fullName: '',
          duration: '',
          location: '',
          type: '',
          date: '',
          dateDisplay: '',
          time: '',
          timeDisplay: '',
          status: 'pending',
          statusMessage: '',
          scheduledDate: null,
          scheduledTime: null,
          trainingScheduleStatus: apiData.trainingScheduleStatus || 'New',
          attendanceStatus: apiData.attendanceStatus || null,
          testStatus: apiData.testStatus || null
        };

        // Extract from training object if exists
        if (apiData.training) {
          const training = apiData.training;
          formattedData = {
            ...formattedData,
            subject: training.subject || 'Technical Training',
            description: training.description || 'Technical training session',
            fullName: training.fullName || 'Trainer Name',
            location: training.location || 'Training Center',
            type: training.type || 'Classroom',
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
            formattedData.duration = '2 hours';
          }
        }

        // Extract schedule info
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
          formattedData.scheduledDate = scheduleDate;
        }

        if (apiData.scheduleTime) {
          const timeStr = apiData.scheduleTime;
          const [hours, minutes] = timeStr.split(':').map(Number);
          formattedData.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          
          // Add AM/PM format
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const hour12 = hours % 12 || 12;
          formattedData.timeDisplay = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
          
          formattedData.scheduledTime = timeStr;
        }

        // Determine status based on trainingScheduleStatus enum
        switch (apiData.trainingScheduleStatus) {
          case 'New':
            formattedData.status = 'pending';
            formattedData.statusMessage = 'Training request submitted. Waiting for confirmation.';
            break;
            
          case 'Confirm':
            formattedData.status = 'scheduled';
            formattedData.statusMessage = 'Training confirmed and scheduled.';
            break;
            
          case 'Reject':
            formattedData.status = 'rejected';
            formattedData.statusMessage = 'Training request has been rejected by admin.';
            break;
            
          case 'Present':
            formattedData.status = 'attended';
            formattedData.statusMessage = 'Attendance marked as Present. Training completed successfully.';
            break;
            
          case 'Absent':
            formattedData.status = 'absent';
            formattedData.statusMessage = 'Attendance marked as Absent. Training not attended.';
            break;
            
          case 'Fail':
            formattedData.status = 'failed';
            formattedData.statusMessage = 'Training test failed. Please retake the test.';
            break;
            
          case 'Complete':
            formattedData.status = 'completed';
            formattedData.statusMessage = 'Training successfully completed and passed.';
            break;
            
          default:
            formattedData.status = 'pending';
            formattedData.statusMessage = 'Training status unknown.';
        }

        // console.log('Formatted Training Data:', formattedData);
        setTrainingData(formattedData);
        setLastUpdated(new Date());
        return { success: true, data: formattedData };
      } else if (response?.success && !response.data) {
        // No training data found
        const noData = {
          status: 'no-training',
          message: 'No training scheduled',
          trainingScheduleStatus: 'none'
        };
        setTrainingData(noData);
        setLastUpdated(new Date());
        return { success: false, data: noData };
      } else {
        // API error
        const errorData = {
          status: 'error',
          message: response?.message || 'Failed to load training status',
          trainingScheduleStatus: 'error'
        };
        setTrainingData(errorData);
        setLastUpdated(new Date());
        return { success: false, data: errorData };
      }
    } catch (error) {
      console.error('Error fetching training status:', error);
      const errorData = {
        status: 'error',
        message: 'Failed to load training status',
        trainingScheduleStatus: 'error'
      };
      setTrainingData(errorData);
      setLastUpdated(new Date());
      return { success: false, data: errorData };
    }
  };

  useEffect(() => {
    loadTrainingStatus();
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
      Toast.show({
        type: 'success',
        text1: 'Status refreshed',
        text2: 'Latest training status loaded',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } else if (result.data.status === 'no-training') {
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
      Toast.show({
        type: 'success',
        text1: 'Status updated',
        text2: 'Training information refreshed',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  const getStatusConfig = (status, trainingData) => {
    const customMessage = trainingData?.statusMessage || '';
    
    switch (status) {
      case 'scheduled':
        return {
          icon: 'event-available',
          iconColor: colors.success,
          title: 'Training Scheduled',
          subtitle: trainingData?.trainingScheduleStatus === 'Confirm' 
            ? '(Confirmed)' 
            : '',
          message: customMessage || 'Your training session has been scheduled.',
          bgColor: colors.successLight,
          textColor: colors.success,
          buttonText: 'Reschedule Training',
          buttonAction: () => navigation.navigate('Training'),
        };
      
      case 'pending':
        return {
          icon: trainingData?.trainingScheduleStatus === 'New' ? 'hourglass-empty' : 'pending',
          iconColor: colors.warning,
          title: trainingData?.trainingScheduleStatus === 'New' 
            ? 'Training Request Submitted' 
            : 'Training Pending',
          subtitle: '',
          message: customMessage || 'Please schedule your training session.',
          bgColor: colors.warningLight,
          textColor: colors.warning,
          buttonText: trainingData?.trainingScheduleStatus === 'New' 
            ? 'Check Status' 
            : 'Schedule Now',
          buttonAction: () => handleManualRefresh(),
        };
      
      case 'completed':
        return {
          icon: 'check-circle',
          iconColor: colors.success,
          title: 'Training Completed',
          subtitle: trainingData?.trainingScheduleStatus === 'Complete' ? '(Passed)' : '',
          message: customMessage || 'You have successfully completed the training.',
          bgColor: colors.successLight,
          textColor: colors.success,
          buttonText: 'Go To Dashboard',
          buttonAction: () => navigation.navigate('ProviderDashboard'),
        };
      
      case 'attended':
        return {
          icon: 'check',
          iconColor: colors.success,
          title: 'Training Attended',
          subtitle: trainingData?.trainingScheduleStatus === 'Present' ? '(Present)' : '',
          message: customMessage || 'You have attended the training session.',
          bgColor: colors.successLight,
          textColor: colors.success,
          buttonText: 'View Results',
          buttonAction: () => navigation.navigate('TrainingResults'),
        };
      
      case 'failed':
        return {
          icon: 'cancel',
          iconColor: colors.error,
          title: 'Training Failed',
          subtitle: trainingData?.trainingScheduleStatus === 'Fail' ? '(Test Failed)' : '',
          message: customMessage || 'You failed the training test.',
          bgColor: colors.errorLight,
          textColor: colors.error,
          buttonText: 'Retake Test',
          buttonAction: () => navigation.navigate('TrainingTest'),
        };
      
      case 'absent':
        return {
          icon: 'person-off',
          iconColor: colors.error,
          title: 'Absent',
          subtitle: trainingData?.trainingScheduleStatus === 'Absent' ? '(Missed Training)' : '',
          message: customMessage || 'You were absent for the training session.',
          bgColor: colors.errorLight,
          textColor: colors.error,
          buttonText: 'Reschedule',
          buttonAction: () => navigation.navigate('TrainingSchedule'),
        };
      
      case 'rejected':
        return {
          icon: 'block',
          iconColor: colors.error,
          title: 'Training Rejected',
          subtitle: trainingData?.trainingScheduleStatus === 'Reject' ? '(By Admin)' : '',
          message: customMessage || 'Your training request has been rejected.',
          bgColor: colors.errorLight,
          textColor: colors.error,
          buttonText: 'Contact Support',
          buttonAction: () => navigation.navigate('Support'),
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

  const status = trainingData?.status || 'no-training';
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

  const calculateCountdown = () => {
    if (!trainingData?.scheduledDate) return { days: 0, hours: 0, minutes: 0 };
    
    const now = new Date();
    const scheduledDate = new Date(trainingData.scheduledDate);
    
    // Add time if available
    if (trainingData.scheduledTime) {
      const [hours, minutes] = trainingData.scheduledTime.split(':').map(Number);
      scheduledDate.setHours(hours, minutes, 0, 0);
    }
    
    const diffMs = scheduledDate - now;
    
    if (diffMs <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  };

  const countdown = calculateCountdown();

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Training Status"
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
        contentContainerStyle={clsx(styles.px4, styles.py6, styles.flexGrow)}
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
          styles.mt4,
          styles.p6,
          styles.roundedXl,
          styles.itemsCenter,
          { backgroundColor: statusConfig.bgColor }
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
              size={64} 
              color={statusConfig.iconColor} 
            />
          </View>

          {/* Status Title */}
          <View style={clsx(styles.itemsCenter)}>
            <Text style={clsx(
              styles.text2xl,
              styles.fontBold,
              styles.mb1,
              { color: statusConfig.textColor }
            )}>
              {statusConfig.title}
            </Text>
            {statusConfig.subtitle ? (
              <Text style={clsx(
                styles.textBase,
                styles.fontMedium,
                styles.mb3,
                { color: statusConfig.textColor }
              )}>
                {statusConfig.subtitle}
              </Text>
            ) : null}
          </View>

          {/* Status Message */}
          <Text style={clsx(
            styles.textBase,
            styles.textCenter,
            styles.textGray,
            styles.mb6
          )}>
            {statusConfig.message}
          </Text>

          {/* Training Details (if available) */}
          {trainingData && trainingData.subject && status !== 'no-training' && status !== 'error' && (
            <View style={clsx(styles.wFull, styles.mb6)}>
              <View style={clsx(styles.p4, styles.bgWhite, styles.roundedLg, styles.mb4)}>
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb2)}>
                  {trainingData.subject}
                </Text>
                <Text style={clsx(styles.textBase, styles.textGray, styles.mb3)}>
                  {trainingData.description}
                </Text>
                
                <View style={clsx(styles.mt2)}>
                  <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                    <Icon name="person" size={16} color={colors.textMuted} />
                    <Text style={clsx(styles.textSm, styles.textBlack, styles.ml2)}>
                      Trainer: {trainingData.fullName}
                    </Text>
                  </View>
                  
                  {trainingData.location && (
                    <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                      <Icon name="location-on" size={16} color={colors.textMuted} />
                      <Text style={clsx(styles.textSm, styles.textBlack, styles.ml2)}>
                        Location: {trainingData.location}
                      </Text>
                    </View>
                  )}
                  
                  {trainingData.duration && (
                    <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                      <Icon name="access-time" size={16} color={colors.textMuted} />
                      <Text style={clsx(styles.textSm, styles.textBlack, styles.ml2)}>
                        Duration: {trainingData.duration}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Schedule Details (for scheduled/attended/completed status) */}
              {(status === 'scheduled' || status === 'attended' || status === 'completed') && (trainingData.date || trainingData.timeDisplay) && (
                <View style={clsx(styles.p4, styles.bgPrimaryLight, styles.roundedLg)}>
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary, styles.mb3)}>
                    Schedule Details:
                  </Text>
                  
                  {trainingData.date && (
                    <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                      <Icon name="event" size={20} color={colors.primary} />
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                        Date: {trainingData.dateDisplay || trainingData.date}
                      </Text>
                    </View>
                  )}
                  
                  {(trainingData.timeDisplay || trainingData.time) && (
                    <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                      <Icon name="schedule" size={20} color={colors.primary} />
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                        Time: {trainingData.timeDisplay || trainingData.time}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Last Updated */}
          <View style={clsx(styles.mb6, styles.itemsCenter)}>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Last updated: {formatLastUpdated()}
            </Text>            
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={clsx(
              styles.button,
              styles.px6,
              { backgroundColor: statusConfig.iconColor, opacity: refreshing ? 0.7 : 1 }
            )}
            onPress={statusConfig.buttonAction}
            disabled={refreshing}
          >
            <Text style={clsx(styles.buttonText)}>
              {refreshing ? 'Loading...' : statusConfig.buttonText}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Important Information */}
        <View style={clsx(styles.mt8, styles.p4, styles.bgInfoLight, styles.roundedLg)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textInfo, styles.mb3)}>
            Training Information
          </Text>
          
          {status === 'pending' && trainingData?.trainingScheduleStatus === 'New' && (
            <Text style={clsx(styles.textBase, styles.textInfo)}>
              • Your training request has been submitted
              {'\n'}• Status: Awaiting confirmation from admin
              {'\n'}• You'll be notified once it's confirmed
              {'\n'}• For queries, contact support
            </Text>
          )}
          
          {status === 'pending' && trainingData?.trainingScheduleStatus !== 'New' && (
            <Text style={clsx(styles.textBase, styles.textInfo)}>
              • Please schedule your training at your earliest convenience
              {'\n'}• Training is mandatory for account activation
              {'\n'}• You can schedule from the schedule button above
              {'\n'}• Duration: 2 hours approximately
            </Text>
          )}
          
          {status === 'scheduled' && (
            <Text style={clsx(styles.textBase, styles.textInfo)}>
              • Training Status: Confirmed ✓
              {'\n'}• Please arrive 15 minutes before the scheduled time
              {'\n'}• Bring your ID proof and notebook
              {'\n'}• Training duration: {trainingData?.duration || '2 hours'}
              {trainingData?.location && `\n• Location: ${trainingData.location}`}
              {'\n'}• For rescheduling/cancellation, visit Schedule screen
            </Text>
          )}
          
          {status === 'completed' && (
            <Text style={clsx(styles.textBase, styles.textInfo)}>
              • Congratulations! You have completed the training
              {'\n'}• Status: Completed & Passed ✓
              {'\n'}• Your certificate is now available
              {'\n'}• You can now access all platform features
              {'\n'}• For any queries, contact support
            </Text>
          )}
          
          {status === 'attended' && (
            <Text style={clsx(styles.textBase, styles.textInfo)}>
              • Training Attendance: Present ✓
              {'\n'}• You have successfully attended the training
              {'\n'}• Test results will be available shortly
              {'\n'}• Check your training results for updates
              {'\n'}• For any queries, contact support
            </Text>
          )}
          
          {status === 'failed' && (
            <Text style={clsx(styles.textBase, styles.textInfo)}>
              • Training Status: Failed
              {'\n'}• You need to retake the training test
              {'\n'}• Click the button above to retake test
              {'\n'}• Passing score is required for completion
              {'\n'}• Contact support for assistance
            </Text>
          )}
          
          {status === 'absent' && (
            <Text style={clsx(styles.textBase, styles.textInfo)}>
              • Attendance Status: Absent
              {'\n'}• You missed the scheduled training
              {'\n'}• Please reschedule for another session
              {'\n'}• Training is mandatory for activation
              {'\n'}• Click above to reschedule
            </Text>
          )}
          
          {status === 'rejected' && (
            <Text style={clsx(styles.textBase, styles.textInfo)}>
              • Your training request has been rejected
              {'\n'}• Status: Rejected by admin
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
      </ScrollView>
    </View>
  );
};

export default TrainingStatusScreen;