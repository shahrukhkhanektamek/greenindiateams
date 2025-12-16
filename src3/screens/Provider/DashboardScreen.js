import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { AppContext } from '../../Context/AppContext';

const DashboardScreen = ({ navigation }) => {

  const {
        setUser,
        setLoading,
      } = useContext(AppContext);


  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todayJobs: 8,
    completed: 6,
    earningsToday: 4250,
    rating: 4.8,
    totalEarnings: 125430,
    activeSince: '120 days',
  });

  const todaysJobs = [
    {
      id: '1',
      customerName: 'Rahul Sharma',
      service: 'AC Service',
      time: '10:00 AM',
      address: 'Sector 15, Noida',
      status: 'upcoming',
      amount: 1499,
    },
    {
      id: '2',
      customerName: 'Priya Singh',
      service: 'Deep Cleaning',
      time: '12:30 PM',
      address: 'GK-1, Delhi',
      status: 'in-progress',
      amount: 1999,
    },
    {
      id: '3',
      customerName: 'Amit Verma',
      service: 'Plumbing Repair',
      time: '3:00 PM',
      address: 'Pitampura, Delhi',
      status: 'completed',
      amount: 1299,
    },
  ];

  const quickActions = [
    { id: '1', title: 'Start Day', icon: 'play-circle', color: colors.success },
    { id: '2', title: 'Check Schedule', icon: 'calendar-today', color: colors.primary },
    { id: '3', title: 'Add Break', icon: 'free-breakfast', color: colors.warning },
    { id: '4', title: 'End Day', icon: 'stop-circle', color: colors.error },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Custom inline styles for missing utility classes
  const customStyles = {
    // Width percentages for quick actions grid
    quickActionCard: {
      width: '48%',
      marginBottom: 16,
    },
    // Progress bar for earnings
    progressBar: {
      height: 8,
      width: '75%',
    },
    // Profile image
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
  };

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      
      {/* Header with Profile */}
      <View style={clsx(styles.bgPrimary, styles.px4, styles.pt2, styles.pb2)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb0)}>
          <View>
            <Text style={clsx(styles.textWhite, styles.textBase, styles.opacity75)}>
              Welcome back,
            </Text>
            <Text style={clsx(styles.textWhite, styles.text2xl, styles.fontBold)}>
              Rajesh Kumar
            </Text>
            <Text style={clsx(styles.textWhite, styles.textSm, styles.opacity75, styles.mt1)}>
              AC Repair Specialist • 4.8 ⭐
            </Text>
          </View>
          <TouchableOpacity 
            style={clsx(styles.bgWhite, styles.roundedFull, styles.p2)}
            // onPress={() => navigation.navigate('Profile')}
            onPress={() => setLoading('sideBar', true)}
          >
            <Image
              source={{ uri: 'https://picsum.photos/200?random=provider' }}
              style={customStyles.profileImage}
            />
          </TouchableOpacity>
        </View>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={clsx(styles.pb6)}
      >
        {/* Quick Actions */}
        <View style={clsx(styles.px4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Quick Actions
          </Text>
          <View style={[clsx(styles.flexRow, styles.flexWrap, styles.justifyBetween)]}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  clsx(
                    styles.bgWhite,
                    styles.roundedLg,
                    styles.itemsCenter,
                    styles.justifyCenter,
                    styles.p3,
                    styles.shadowSm
                  ),
                  customStyles.quickActionCard
                ]}
              >
                <View 
                  style={[
                    clsx(styles.roundedFull, styles.p3),
                    { backgroundColor: `${action.color}20` }
                  ]}
                >
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={clsx(styles.fontMedium, styles.textBase, styles.textBlack, styles.mt2)}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Jobs */}
        <View style={clsx(styles.px4, styles.mt6)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Today's Jobs
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('TodayJobs')}
            >
              <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {todaysJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={clsx(
                styles.bgWhite,
                styles.roundedLg,
                styles.p4,
                styles.mb3,
                styles.shadowSm
              )}
              onPress={() => navigation.navigate('JobDetails', { job })}
            >
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
                <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
                  {job.service}
                </Text>
                <View style={clsx(
                  styles.px3,
                  styles.py1,
                  styles.roundedFull,
                  job.status === 'completed' ? styles.bgSuccessLight : 
                  job.status === 'in-progress' ? styles.bgWarningLight : 
                  styles.bgPrimaryLight
                )}>
                  <Text style={clsx(
                    styles.textSm,
                    styles.fontMedium,
                    job.status === 'completed' ? styles.textSuccess : 
                    job.status === 'in-progress' ? styles.textWarning : 
                    styles.textPrimary
                  )}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Text>
                </View>
              </View>
              
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                <Icon name="person" size={16} color={colors.textLight} />
                <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2)}>
                  {job.customerName}
                </Text>
              </View>
              
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
                <Icon name="schedule" size={16} color={colors.textLight} />
                <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2)}>
                  {job.time}
                </Text>
              </View>
              
              <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
                <Icon name="location-on" size={16} color={colors.textLight} />
                <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2, styles.flex1)}>
                  {job.address}
                </Text>
              </View>
              
              <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
                  ₹{job.amount}
                </Text>
                <TouchableOpacity style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.px3,
                  styles.py2,
                  job.status === 'upcoming' ? styles.bgPrimary : 
                  job.status === 'in-progress' ? styles.bgSuccess : 
                  styles.bgSecondary,
                  styles.roundedFull
                )}>
                  <Text style={clsx(styles.textWhite, styles.fontMedium, styles.mr1)}>
                    {job.status === 'upcoming' ? 'Start' : 
                     job.status === 'in-progress' ? 'Complete' : 'View Details'}
                  </Text>
                  <Icon 
                    name={job.status === 'upcoming' ? 'play-arrow' : 
                          job.status === 'in-progress' ? 'check' : 'chevron-right'} 
                    size={16} 
                    color={colors.white} 
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Performance Overview */}
        <View style={clsx(styles.px4, styles.mt6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Performance Overview
          </Text>
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadowSm)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb4)}>
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.text3xl, styles.fontBold, styles.textPrimary)}>
                  98%
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Completion Rate
                </Text>
              </View>
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.text3xl, styles.fontBold, styles.textSuccess)}>
                  4.8
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Average Rating
                </Text>
              </View>
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.text3xl, styles.fontBold, styles.textSecondary)}>
                  24min
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Avg. Response
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={clsx(styles.flexRow, styles.itemsCenter, styles.justifyCenter)}
              onPress={() => navigation.navigate('Performance')}
            >
              <Text style={clsx(styles.textPrimary, styles.fontMedium, styles.mr1)}>
                View Detailed Report
              </Text>
              <Icon name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Earnings Summary */}
        <View style={clsx(styles.px4, styles.mt6)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Earnings Summary
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Earnings')}
            >
              <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadowSm)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb3)}>
              <View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Today's Earnings
                </Text>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textSuccess)}>
                  ₹{stats.earningsToday}
                </Text>
              </View>
              <View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  This Week
                </Text>
                <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
                  ₹28,500
                </Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={[clsx(styles.bgGray200, styles.roundedFull, styles.overflowHidden, styles.mb2), { height: 8 }]}>
              <View 
                style={[clsx(styles.bgPrimary, styles.hFull, styles.roundedFull), customStyles.progressBar]} 
              />
            </View>
            
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              ₹38,000 weekly target (75% achieved)
            </Text>
          </View>
        </View>

        {/* Upcoming Services */}
        <View style={clsx(styles.px4, styles.mt6)}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Upcoming Services
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Services')}
            >
              <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadowSm)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
              <View style={[clsx(styles.bgPrimaryLight, styles.roundedFull, styles.p3), { marginRight: 12 }]}>
                <Icon name="ac-unit" size={24} color={colors.primary} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                  AC Installation
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Tomorrow • 2:00 PM
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textLight} />
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <View style={[clsx(styles.bgSecondaryLight, styles.roundedFull, styles.p3), { marginRight: 12 }]}>
                <Icon name="plumbing" size={24} color={colors.secondary} />
              </View>
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
                  Pipe Repair
                </Text>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Day after • 10:00 AM
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textLight} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;