import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import responsive from '../../utils/responsive';
import { colors } from '../../styles/colors';

const TodayJobsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const filters = [
    { id: 'all', label: 'All Jobs' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];

  const allJobs = [
    {
      id: '1',
      jobId: 'UC-2024-001',
      customerName: 'Rahul Sharma',
      service: 'AC Service',
      time: '10:00 AM',
      address: 'Sector 15, Noida',
      status: 'upcoming',
      amount: 1499,
      duration: '2 hours',
      phone: '+91 9876543210',
      notes: 'Split AC, 1.5 ton',
    },
    {
      id: '2',
      jobId: 'UC-2024-002',
      customerName: 'Priya Singh',
      service: 'Deep Cleaning',
      time: '12:30 PM',
      address: 'GK-1, Delhi',
      status: 'in-progress',
      amount: 1999,
      duration: '4 hours',
      phone: '+91 9876543211',
      notes: '2BHK apartment',
    },
    {
      id: '3',
      jobId: 'UC-2024-003',
      customerName: 'Amit Verma',
      service: 'Plumbing Repair',
      time: '3:00 PM',
      address: 'Pitampura, Delhi',
      status: 'completed',
      amount: 1299,
      duration: '1.5 hours',
      phone: '+91 9876543212',
      notes: 'Bathroom leakage',
    },
    {
      id: '4',
      jobId: 'UC-2024-004',
      customerName: 'Sonia Mehta',
      service: 'Refrigerator Repair',
      time: '5:00 PM',
      address: 'Rohini, Delhi',
      status: 'upcoming',
      amount: 1799,
      duration: '2 hours',
      phone: '+91 9876543213',
      notes: 'Not cooling properly',
    },
    {
      id: '5',
      jobId: 'UC-2024-005',
      customerName: 'Vikram Patel',
      service: 'Washing Machine Repair',
      time: '11:00 AM',
      address: 'Dwarka, Delhi',
      status: 'completed',
      amount: 1599,
      duration: '2.5 hours',
      phone: '+91 9876543214',
      notes: 'Drainage issue',
    },
  ];

  const filteredJobs = selectedFilter === 'all' 
    ? allJobs 
    : allJobs.filter(job => job.status === selectedFilter);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return colors.success;
      case 'in-progress': return colors.warning;
      case 'upcoming': return colors.primary;
      default: return colors.textMuted;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return 'check-circle';
      case 'in-progress': return 'play-circle';
      case 'upcoming': return 'schedule';
      default: return 'help';
    }
  };

  const renderJobCard = ({ item }) => (
    <TouchableOpacity
      style={clsx(
        styles.bgWhite,
        styles.roundedLg,
        styles.p4,
        styles.mb3,
        styles.shadow
      )}
      onPress={() => navigation.navigate('JobDetails', { job: item })}
    >
      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
        <View>
          <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted)}>
            {item.jobId}
          </Text>
          <Text style={clsx(styles.textXl, styles.fontBold, styles.textBlack)}>
            {item.service}
          </Text>
        </View>
        <View style={clsx(
          styles.flexRow,
          styles.itemsCenter,
          styles.px3,
          styles.py1,
          styles.roundedFull,
          { backgroundColor: `${getStatusColor(item.status)}20` }
        )}>
          <Icon 
            name={getStatusIcon(item.status)} 
            size={14} 
            color={getStatusColor(item.status)} 
          />
          <Text style={clsx(
            styles.textSm,
            styles.fontMedium,
            styles.ml1,
            { color: getStatusColor(item.status) }
          )}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={clsx(styles.mb3)}>
        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
          <Icon name="person" size={16} color={colors.textLight} />
          <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2)}>
            {item.customerName}
          </Text>
          <TouchableOpacity style={clsx(styles.ml2)}>
            <Icon name="phone" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb2)}>
          <Icon name="schedule" size={16} color={colors.textLight} />
          <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2)}>
            {item.time} • {item.duration}
          </Text>
        </View>
        
        <View style={clsx(styles.flexRow, styles.itemsStart, styles.mb2)}>
          <Icon name="location-on" size={16} color={colors.textLight} style={clsx(styles.mt1)} />
          <Text style={clsx(styles.textBase, styles.textBlack, styles.ml2, styles.flex1)}>
            {item.address}
          </Text>
        </View>
        
        {item.notes && (
          <View style={clsx(styles.flexRow, styles.itemsStart)}>
            <Icon name="note" size={16} color={colors.textLight} style={clsx(styles.mt1)} />
            <Text style={clsx(styles.textSm, styles.textMuted, styles.ml2, styles.flex1)}>
              {item.notes}
            </Text>
          </View>
        )}
      </View>

      <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
        <Text style={clsx(styles.text2xl, styles.fontBold, styles.textPrimary)}>
          ₹{item.amount}
        </Text>
        
        <View style={clsx(styles.flexRow)}>
          <TouchableOpacity style={clsx(
            styles.flexRow,
            styles.itemsCenter,
            styles.px3,
            styles.py2,
            styles.mr2,
            styles.border,
            styles.borderPrimary,
            styles.roundedFull
          )}>
            <Icon name="directions" size={16} color={colors.primary} />
            <Text style={clsx(styles.textPrimary, styles.fontMedium, styles.ml1)}>
              Navigate
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={clsx(
            styles.flexRow,
            styles.itemsCenter,
            styles.px3,
            styles.py2,
            styles.bgPrimary,
            styles.roundedFull
          )}>
            <Icon 
              name={item.status === 'upcoming' ? 'play-arrow' : 
                    item.status === 'in-progress' ? 'check' : 'visibility'} 
              size={16} 
              color={colors.white} 
            />
            <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
              {item.status === 'upcoming' ? 'Start' : 
               item.status === 'in-progress' ? 'Complete' : 'View'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      {/* Header */}
      <View style={clsx(styles.bgWhite, styles.px4, styles.pt6, styles.pb4, styles.shadowSm)}>
        <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb3)}>
          <TouchableOpacity 
            style={clsx(styles.mr3)}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
              Today's Jobs
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted)}>
              {allJobs.length} jobs • {allJobs.filter(j => j.status === 'completed').length} completed
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={clsx(styles.mt2)}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={clsx(
                styles.px4,
                styles.py2,
                styles.mr2,
                styles.roundedFull,
                selectedFilter === filter.id ? styles.bgPrimary : styles.bgGray
              )}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={clsx(
                styles.fontMedium,
                selectedFilter === filter.id ? styles.textWhite : styles.textBlack
              )}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Jobs List */}
      <FlatList
        data={filteredJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={clsx(styles.p4)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={clsx(styles.centerAll, styles.p8)}>
            <Icon name="assignment" size={64} color={colors.textLight} />
            <Text style={clsx(styles.textLg, styles.fontMedium, styles.textBlack, styles.mt4)}>
              No jobs found
            </Text>
            <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2, styles.textCenter)}>
              {selectedFilter === 'all' 
                ? "You don't have any jobs today" 
                : `No ${selectedFilter} jobs found`}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 1000);
            }}
          />
        }
      />
    </View>
  );
};

export default TodayJobsScreen;