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

  const fetchTrainingStatus = async () => {
    try {
      const response = await postData({}, Urls.trainingSchedule, 'GET', { 
        showErrorMessage: false 
      });
      
      if (response?.success) {
        const apiData = response.data || {};
        console.log('Training API Data:', apiData);
        
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
          time: '',
          status: 'pending', // pending, scheduled, completed, cancelled
          scheduledDate: null,
          scheduledTime: null,
        };

        // Extract from trainingId object if exists
        if (apiData.trainingId) {
          const training = apiData.trainingId;
          formattedData = {
            ...formattedData,
            subject: training.subject || 'Technical Training',
            description: training.description || 'Technical training session',
            fullName: training.fullName || 'Trainer Name',
            duration: training.duration || '2 hours',
            location: training.location || 'Training Center',
            type: training.type || 'Classroom',
          };
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
          formattedData.scheduledDate = scheduleDate;
        }

        if (apiData.scheduleTime) {
          const timeStr = apiData.scheduleTime;
          const [hours, minutes] = timeStr.split(':').map(Number);
          formattedData.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          formattedData.scheduledTime = timeStr;
        }

        apiData.status = 'completed';

        // Determine status
        if (apiData.status === true) {
          formattedData.status = 'scheduled';
        } else if (apiData.status === false) {
          formattedData.status = 'cancelled';
        } else if (apiData.status === 'completed') {
          formattedData.status = 'completed';
        } else if (apiData.status === 'rescheduled') {
          formattedData.status = 'scheduled'; // Treat rescheduled as scheduled
        }

        // If no schedule date but training exists, show pending
        if (!apiData.scheduleDate && apiData.trainingId) {
          formattedData.status = 'pending';
        }

        console.log('Formatted Training Data:', formattedData);
        setTrainingData(formattedData);
        return true;
      } else {
        // No training data found
        setTrainingData({
          status: 'no-training',
          message: 'No training scheduled'
        });
        return false;
      }
    } catch (error) {
      console.error('Error fetching training status:', error);
      setTrainingData({
        status: 'error',
        message: 'Failed to load training status'
      });
      return false;
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrainingStatus();
    setRefreshing(false);
    Toast.show({
      type: 'success',
      text1: 'Status refreshed',
      text2: 'Latest training status loaded',
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'scheduled':
        return {
          icon: 'event-available',
          iconColor: colors.success,
          title: 'Training Scheduled',
          message: 'Your training session has been scheduled.',
          bgColor: colors.successLight,
          textColor: colors.success,
          buttonText: 'View Schedule',
          buttonAction: () => navigation.navigate('TrainingSchedule'),
        };
      
      case 'pending':
        return {
          icon: 'pending',
          iconColor: colors.warning,
          title: 'Training Pending',
          message: 'Please schedule your training session.',
          bgColor: colors.warningLight,
          textColor: colors.warning,
          buttonText: 'Schedule Now',
          buttonAction: () => navigation.navigate('TrainingSchedule'),
        };
      
      case 'completed':
        return {
          icon: 'check-circle',
          iconColor: colors.primary,
          title: 'Training Completed',
          message: 'You have successfully completed the training.',
          bgColor: colors.primaryLight,
          textColor: colors.primary,
          buttonText: 'Go To Dashboard',
          buttonAction: () => navigation.navigate('ProviderDashboard'),
        };
      
      case 'cancelled':
        return {
          icon: 'cancel',
          iconColor: colors.error,
          title: 'Training Cancelled',
          message: 'Your training session has been cancelled.',
          bgColor: colors.errorLight,
          textColor: colors.error,
          buttonText: 'Reschedule',
          buttonAction: () => navigation.navigate('TrainingSchedule'),
        };
      
      case 'no-training':
        return {
          icon: 'info',
          iconColor: colors.info,
          title: 'No Training Scheduled',
          message: 'You have not scheduled any training yet.',
          bgColor: colors.infoLight,
          textColor: colors.info,
          buttonText: 'Schedule Training',
          buttonAction: () => navigation.navigate('TrainingSchedule'),
        };
      
      default:
        return {
          icon: 'error',
          iconColor: colors.error,
          title: 'Error',
          message: 'Unable to load training status.',
          bgColor: colors.errorLight,
          textColor: colors.error,
          buttonText: 'Try Again',
          buttonAction: onRefresh,
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
      </View>
    );
  }

  const status = trainingData?.status || 'no-training';
  const statusConfig = getStatusConfig(status);

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
        onRightActionPress={onRefresh}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.px4, styles.py6, styles.flexGrow)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Status Card */}
        <View style={clsx(
          styles.mt8,
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
          <Text style={clsx(
            styles.text2xl,
            styles.fontBold,
            styles.mb3,
            { color: statusConfig.textColor }
          )}>
            {statusConfig.title}
          </Text>

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
                  
                  <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                    <Icon name="location-on" size={16} color={colors.textMuted} />
                    <Text style={clsx(styles.textSm, styles.textBlack, styles.ml2)}>
                      Location: {trainingData.location}
                    </Text>
                  </View>
                  
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    <Icon name="access-time" size={16} color={colors.textMuted} />
                    <Text style={clsx(styles.textSm, styles.textBlack, styles.ml2)}>
                      Duration: {trainingData.duration}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Schedule Details (for scheduled/completed status) */}
              {(status === 'scheduled' || status === 'completed') && (
                <View style={clsx(styles.p4, styles.bgPrimaryLight, styles.roundedLg)}>
                  <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary, styles.mb3)}>
                    Schedule Details:
                  </Text>
                  
                  {trainingData.date && (
                    <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                      <Icon name="event" size={20} color={colors.primary} />
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                        Date: {trainingData.date}
                      </Text>
                    </View>
                  )}
                  
                  {trainingData.time && (
                    <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                      <Icon name="schedule" size={20} color={colors.primary} />
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.ml2)}>
                        Time: {trainingData.time}
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
              Last updated: {new Date().toLocaleDateString('en-IN')}
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={clsx(
              styles.button,
              styles.px6,
              { backgroundColor: statusConfig.iconColor }
            )}
            onPress={statusConfig.buttonAction}
            disabled={refreshing}
          >
            <Text style={clsx(styles.buttonText)}>
              {statusConfig.buttonText}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Training Progress (for scheduled status) */}
        {status === 'scheduled' && trainingData?.scheduledDate && (
          <View style={clsx(styles.mt8, styles.p4, styles.bgWhite, styles.roundedLg, styles.shadowSm)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb4)}>
              Training Countdown
            </Text>
            
            <View style={clsx(styles.flexRow, styles.justifyBetween)}>
              <View style={clsx(styles.itemsCenter)}>
                <View style={clsx(styles.p3, styles.bgPrimaryLight, styles.roundedFull)}>
                  <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
                    {trainingData.scheduledDate ? 
                      Math.max(0, Math.ceil((trainingData.scheduledDate - new Date()) / (1000 * 60 * 60 * 24))) 
                      : '0'}
                  </Text>
                </View>
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>Days</Text>
              </View>
              
              <View style={clsx(styles.itemsCenter)}>
                <View style={clsx(styles.p3, styles.bgWarningLight, styles.roundedFull)}>
                  <Text style={clsx(styles.text2xl, styles.fontBold, styles.textWarning)}>
                    {trainingData.scheduledDate ? 
                      Math.max(0, Math.ceil((trainingData.scheduledDate - new Date()) / (1000 * 60 * 60))) % 24 
                      : '0'}
                  </Text>
                </View>
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>Hours</Text>
              </View>
              
              <View style={clsx(styles.itemsCenter)}>
                <View style={clsx(styles.p3, styles.bgSuccessLight, styles.roundedFull)}>
                  <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess)}>
                    {trainingData.scheduledDate ? 
                      Math.max(0, Math.ceil((trainingData.scheduledDate - new Date()) / (1000 * 60))) % 60 
                      : '0'}
                  </Text>
                </View>
                <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>Minutes</Text>
              </View>
            </View>
          </View>
        )}

        {/* Important Information */}
        <View style={clsx(styles.mt8, styles.p4, styles.bgInfoLight, styles.roundedLg)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textInfo, styles.mb3)}>
            Training Information
          </Text>
          
          {status === 'pending' && (
            <Text style={clsx(styles.textBase, styles.textInfo)}>
              • Please schedule your training at your earliest convenience
              {'\n'}• Training is mandatory for account activation
              {'\n'}• You can schedule from the schedule button above
              {'\n'}• Duration: 2 hours approximately
            </Text>
          )}
          
          {status === 'scheduled' && (
            <Text style={clsx(styles.textBase, styles.textInfo)}>
              • Please arrive 15 minutes before the scheduled time
              {'\n'}• Bring your ID proof and notebook
              {'\n'}• Training duration: {trainingData?.duration || '2 hours'}
              {'\n'}• Location: {trainingData?.location || 'Training Center'}
              {'\n'}• For rescheduling/cancellation, visit Schedule screen
            </Text>
          )}
          
          {status === 'completed' && (
            <Text style={clsx(styles.textBase, styles.textInfo)}>
              • Congratulations! You have completed the training
              {'\n'}• Your certificate is now available
              {'\n'}• You can now access all platform features
              {'\n'}• For any queries, contact support
            </Text>
          )}
          
          {status === 'cancelled' && (
            <Text style={clsx(styles.textBase, styles.textInfo)}>
              • Your training has been cancelled
              {'\n'}• You can reschedule it anytime
              {'\n'}• Please schedule new training to proceed
              {'\n'}• For assistance, contact support
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
        >
          <Icon name="help" size={20} color={colors.primary} />
          <Text style={clsx(styles.textBase, styles.textPrimary, styles.ml2)}>
            Need Help? Contact Support
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Refresh Indicator */}
      {refreshing && (
        <View style={clsx(
          styles.absolute,
          styles.top16,
          styles.selfCenter,
          styles.p3,
          styles.bgWhite,
          styles.roundedFull,
          styles.shadowMd
        )}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

export default TrainingStatusScreen;