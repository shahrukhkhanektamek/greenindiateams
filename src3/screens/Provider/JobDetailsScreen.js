import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import styles, { clsx } from '../../styles/globalStyles';
import responsive from '../../utils/responsive';
import { colors } from '../../styles/colors';

const JobDetailsScreen = ({ navigation, route }) => {
  const { job } = route.params;
  const [jobStatus, setJobStatus] = useState(job.status);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const handleStartJob = () => {
    Alert.alert(
      'Start Job',
      'Are you sure you want to start this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Job', 
          onPress: () => {
            setJobStatus('in-progress');
            setStartTime(new Date().toLocaleTimeString());
            Alert.alert('Job Started', 'Job has been marked as in progress.');
          }
        }
      ]
    );
  };

  const handleCompleteJob = () => {
    Alert.alert(
      'Complete Job',
      'Have you completed all the work and received payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete Job', 
          onPress: () => {
            setJobStatus('completed');
            setEndTime(new Date().toLocaleTimeString());
            Alert.alert('Job Completed', 'Job has been marked as completed.');
          }
        }
      ]
    );
  };

  const handleCallCustomer = () => {
    Linking.openURL(`tel:${job.phone}`);
  };

  const handleNavigate = () => {
    const address = encodeURIComponent(job.address);
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${address}`);
  };

  const handleShareDetails = async () => {
    try {
      await Share.share({
        message: `Job Details:\nService: ${job.service}\nCustomer: ${job.customerName}\nAddress: ${job.address}\nTime: ${job.time}\nAmount: ₹${job.amount}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share job details');
    }
  };

  const jobActions = [
    { 
      icon: 'phone', 
      label: 'Call Customer', 
      color: colors.success,
      onPress: handleCallCustomer 
    },
    { 
      icon: 'directions', 
      label: 'Navigate', 
      color: colors.primary,
      onPress: handleNavigate 
    },
    { 
      icon: 'share', 
      label: 'Share', 
      color: colors.secondary,
      onPress: handleShareDetails 
    },
    { 
      icon: 'assignment', 
      label: 'Add Note', 
      color: colors.warning,
      onPress: () => navigation.navigate('AddNote', { jobId: job.id }) 
    },
  ];

  return (
    <ScrollView style={clsx(styles.flex1, styles.bgSurface)}>
      {/* Job Header */}
      <View style={clsx(styles.bgWhite, styles.px4, styles.pt6, styles.pb4)}>
        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb4)}>
          <TouchableOpacity 
            style={clsx(styles.mr3)}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={clsx(styles.flex1)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted)}>
              {job.jobId}
            </Text>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
              {job.service}
            </Text>
          </View>
          <View style={clsx(
            styles.px3,
            styles.py1,
            styles.roundedFull,
            jobStatus === 'completed' ? styles.bgSuccessLight : 
            jobStatus === 'in-progress' ? styles.bgWarningLight : 
            styles.bgPrimaryLight
          )}>
            <Text style={clsx(
              styles.textSm,
              styles.fontMedium,
              jobStatus === 'completed' ? styles.textSuccess : 
              jobStatus === 'in-progress' ? styles.textWarning : 
              styles.textPrimary
            )}>
              {jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)}
            </Text>
          </View>
        </View>

        {/* Amount and Time */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
          <View>
            <Text style={clsx(styles.text4xl, styles.fontBold, styles.textPrimary)}>
              ₹{job.amount}
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted)}>
              Service Fee
            </Text>
          </View>
          <View style={clsx(styles.itemsEnd)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              {job.time}
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted)}>
              Scheduled Time
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={clsx(styles.px4, styles.mt4)}
        contentContainerStyle={clsx(styles.pb2)}
      >
        {jobActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={clsx(
              styles.itemsCenter,
              styles.mr4
            )}
            onPress={action.onPress}
          >
            <View style={clsx(
              styles.roundedFull,
              styles.p3,
              styles.mb2,
              { backgroundColor: `${action.color}20` }
            )}>
              <Icon name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Customer Details Card */}
      <View style={clsx(styles.mx4, styles.mt4)}>
        <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Customer Details
          </Text>
          
          <View style={clsx(styles.mb4)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
              <View style={clsx(styles.bgGray, styles.roundedFull, styles.p2, styles.mr3)}>
                <Icon name="person" size={20} color={colors.text} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {job.customerName}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Customer
                </Text>
              </View>
              <TouchableOpacity
                style={clsx(styles.flexRow, styles.itemsCenter, styles.px3, styles.py2, styles.bgSuccess, styles.roundedFull)}
                onPress={handleCallCustomer}
              >
                <Icon name="phone" size={16} color={colors.white} />
                <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
                  Call
                </Text>
              </TouchableOpacity>
            </View>

            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
              <Icon name="phone" size={20} color={colors.textLight} style={clsx(styles.mr3)} />
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {job.phone}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Phone Number
                </Text>
              </View>
            </View>

            <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb3)}>
              <Icon name="location-on" size={20} color={colors.textLight} style={clsx(styles.mr3, styles.mt1)} />
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  {job.address}
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Service Address
                </Text>
              </View>
            </View>

            {job.notes && (
              <View style={clsx(styles.flexRow, styles.itemsStart)}>
                <Icon name="note" size={20} color={colors.textLight} style={clsx(styles.mr3, styles.mt1)} />
                <View style={clsx(styles.flex1)}>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {job.notes}
                  </Text>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Special Instructions
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Map View */}
      <View style={clsx(styles.mx4, styles.mt4)}>
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
          Location
        </Text>
        <View style={clsx(styles.bgWhite, styles.roundedLg, styles.overflowHidden, styles.shadow)}>
          <View style={clsx({ height: responsive.hp(25) })}>
            <MapView
              style={clsx(styles.flex1)}
              initialRegion={{
                latitude: 28.6139,
                longitude: 77.2090,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{ latitude: 28.6139, longitude: 77.2090 }}
                title={job.customerName}
                description={job.address}
              />
            </MapView>
          </View>
          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.p3,
              styles.bgPrimary
            )}
            onPress={handleNavigate}
          >
            <Icon name="directions" size={20} color={colors.white} />
            <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml2)}>
              Get Directions
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Service Details */}
      <View style={clsx(styles.mx4, styles.mt4)}>
        <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Service Details
          </Text>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb3)}>
            <View>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                Duration
              </Text>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                {job.duration}
              </Text>
            </View>
            <View>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                Service Type
              </Text>
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                {job.service}
              </Text>
            </View>
          </View>

          {startTime && (
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb3)}>
              <View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Started At
                </Text>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textSuccess)}>
                  {startTime}
                </Text>
              </View>
              {endTime && (
                <View>
                  <Text style={clsx(styles.textSm, styles.textMuted)}>
                    Completed At
                  </Text>
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textSuccess)}>
                    {endTime}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={clsx(styles.mx4, styles.mt4, styles.mb6)}>
        {jobStatus === 'upcoming' && (
          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.p4,
              styles.bgPrimary,
              styles.roundedLg,
              styles.mb3
            )}
            onPress={handleStartJob}
          >
            <Icon name="play-arrow" size={24} color={colors.white} />
            <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold, styles.ml2)}>
              Start Job
            </Text>
          </TouchableOpacity>
        )}

        {jobStatus === 'in-progress' && (
          <>
            <TouchableOpacity
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.p4,
                styles.bgSuccess,
                styles.roundedLg,
                styles.mb3
              )}
              onPress={handleCompleteJob}
            >
              <Icon name="check-circle" size={24} color={colors.white} />
              <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold, styles.ml2)}>
                Mark as Complete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.p4,
                styles.border,
                styles.borderError,
                styles.roundedLg
              )}
              onPress={() => Alert.alert('Report Issue', 'Report an issue with this job')}
            >
              <Icon name="report" size={24} color={colors.error} />
              <Text style={clsx(styles.textError, styles.textLg, styles.fontBold, styles.ml2)}>
                Report Issue
              </Text>
            </TouchableOpacity>
          </>
        )}

        {jobStatus === 'completed' && (
          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.p4,
              styles.bgSuccess,
              styles.roundedLg
            )}
            onPress={() => Alert.alert('Job Completed', 'This job has been completed successfully.')}
          >
            <Icon name="check-circle" size={24} color={colors.white} />
            <Text style={clsx(styles.textWhite, styles.textXl, styles.fontBold, styles.ml2)}>
              Job Completed
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={clsx(
            styles.flexRow,
            styles.itemsCenter,
            styles.justifyCenter,
            styles.p3,
            styles.mt3
          )}
          onPress={() => navigation.navigate('JobHistory', { customer: job.customerName })}
        >
          <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
            View Customer History
          </Text>
          <Icon name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default JobDetailsScreen;