import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';
import styles, { clsx } from '../../styles/globalStyles';
import responsive from '../../utils/responsive';
import { colors } from '../../styles/colors';

const ScheduleScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'

  // Mock schedule data
  const scheduleData = {
    '2024-01-15': [
      { id: '1', time: '10:00 AM', service: 'AC Service', customer: 'Rahul Sharma', status: 'confirmed' },
      { id: '2', time: '12:30 PM', service: 'Deep Cleaning', customer: 'Priya Singh', status: 'confirmed' },
      { id: '3', time: '3:00 PM', service: 'Plumbing Repair', customer: 'Amit Verma', status: 'confirmed' },
      { id: '4', time: '5:00 PM', service: 'Refrigerator Repair', customer: 'Sonia Mehta', status: 'pending' },
    ],
    '2024-01-16': [
      { id: '5', time: '9:00 AM', service: 'Washing Machine Repair', customer: 'Vikram Patel', status: 'confirmed' },
      { id: '6', time: '2:00 PM', service: 'AC Service', customer: 'Rohan Kumar', status: 'confirmed' },
    ],
    '2024-01-17': [
      { id: '7', time: '11:00 AM', service: 'Deep Cleaning', customer: 'Anjali Gupta', status: 'confirmed' },
      { id: '8', time: '4:00 PM', service: 'Painting Work', customer: 'Sanjay Mehra', status: 'tentative' },
    ],
  };

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', 
    '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'
  ];

  const markedDates = {
    '2024-01-15': { marked: true, dotColor: colors.primary, selected: selectedDate === '2024-01-15' },
    '2024-01-16': { marked: true, dotColor: colors.primary, selected: selectedDate === '2024-01-16' },
    '2024-01-17': { marked: true, dotColor: colors.primary, selected: selectedDate === '2024-01-17' },
    [selectedDate]: { selected: true, selectedColor: colors.primary }
  };

  const todaysSchedule = scheduleData[selectedDate] || [];

  const renderTimeSlot = (time) => {
    const job = todaysSchedule.find(j => j.time === time);
    
    if (job) {
      return (
        <TouchableOpacity
          style={clsx(
            styles.bgWhite,
            styles.roundedLg,
            styles.p3,
            styles.mb2,
            styles.shadowSm,
            job.status === 'confirmed' && styles.borderL2,
            job.status === 'confirmed' && styles.borderSuccess,
            job.status === 'pending' && styles.borderL2,
            job.status === 'pending' && styles.borderWarning,
            job.status === 'tentative' && styles.borderL2,
            job.status === 'tentative' && styles.borderSecondary
          )}
          onPress={() => navigation.navigate('JobDetails', { job: { ...job, date: selectedDate } })}
        >
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb1)}>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack)}>
              {time}
            </Text>
            <View style={clsx(
              styles.px2,
              styles.py1,
              styles.roundedFull,
              job.status === 'confirmed' ? styles.bgSuccessLight : 
              job.status === 'pending' ? styles.bgWarningLight : 
              styles.bgSecondaryLight
            )}>
              <Text style={clsx(
                styles.textXs,
                styles.fontMedium,
                job.status === 'confirmed' ? styles.textSuccess : 
                job.status === 'pending' ? styles.textWarning : 
                styles.textSecondary
              )}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb1)}>
            {job.service}
          </Text>
          <Text style={clsx(styles.textBase, styles.textMuted)}>
            {job.customer}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={clsx(
          styles.bgGray,
          styles.roundedLg,
          styles.p3,
          styles.mb2,
          styles.itemsCenter,
          styles.justifyCenter
        )}
        onPress={() => navigation.navigate('AddSlot', { date: selectedDate, time })}
      >
        <Text style={clsx(styles.textBase, styles.textMuted)}>
          {time} - Available
        </Text>
        <Text style={clsx(styles.textSm, styles.textPrimary)}>
          Tap to add job
        </Text>
      </TouchableOpacity>
    );
  };

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
          <Text style={clsx(styles.text2xl, styles.fontBold, styles.textBlack)}>
            My Schedule
          </Text>
        </View>

        {/* View Mode Tabs */}
        <View style={clsx(styles.flexRow, styles.bgGray, styles.roundedFull, styles.p1, styles.mb3)}>
          {['day', 'week', 'month'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={clsx(
                styles.flex1,
                styles.px3,
                styles.py2,
                styles.roundedFull,
                viewMode === mode && styles.bgPrimary
              )}
              onPress={() => setViewMode(mode)}
            >
              <Text style={clsx(
                styles.textCenter,
                styles.fontMedium,
                viewMode === mode ? styles.textWhite : styles.textBlack
              )}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.overflowHidden, styles.shadow)}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              theme={{
                backgroundColor: colors.white,
                calendarBackground: colors.white,
                textSectionTitleColor: colors.text,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.white,
                todayTextColor: colors.primary,
                dayTextColor: colors.text,
                textDisabledColor: colors.textMuted,
                dotColor: colors.primary,
                selectedDotColor: colors.white,
                arrowColor: colors.primary,
                monthTextColor: colors.text,
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '400',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '500',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 14,
              }}
            />
          </View>
        </View>

        {/* Selected Date Info */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p4, styles.shadow)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
              <View>
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                  {new Date(selectedDate).toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
                <Text style={clsx(styles.textBase, styles.textMuted)}>
                  {todaysSchedule.length} jobs scheduled
                </Text>
              </View>
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.px3,
                  styles.py2,
                  styles.bgPrimary,
                  styles.roundedFull
                )}
                onPress={() => navigation.navigate('AddJob', { date: selectedDate })}
              >
                <Icon name="add" size={20} color={colors.white} />
                <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
                  Add Job
                </Text>
              </TouchableOpacity>
            </View>

            {/* Schedule Summary */}
            <View style={clsx(styles.flexRow, styles.justifyBetween)}>
              <View style={clsx(styles.itemsCenter)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                  <View style={clsx(styles.bgSuccess, styles.roundedFull, { width: 8, height: 8 }, styles.mr1)} />
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {todaysSchedule.filter(j => j.status === 'confirmed').length}
                  </Text>
                </View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Confirmed
                </Text>
              </View>
              <View style={clsx(styles.itemsCenter)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                  <View style={clsx(styles.bgWarning, styles.roundedFull, { width: 8, height: 8 }, styles.mr1)} />
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {todaysSchedule.filter(j => j.status === 'pending').length}
                  </Text>
                </View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Pending
                </Text>
              </View>
              <View style={clsx(styles.itemsCenter)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                  <View style={clsx(styles.bgSecondary, styles.roundedFull, { width: 8, height: 8 }, styles.mr1)} />
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {todaysSchedule.filter(j => j.status === 'tentative').length}
                  </Text>
                </View>
                <Text style={clsx(styles.textSm, styles.textMuted)}>
                  Tentative
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Time Slots */}
        <View style={clsx(styles.mx4, styles.mt4)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Time Slots
          </Text>
          
          {todaysSchedule.length > 0 ? (
            <FlatList
              data={timeSlots}
              renderItem={({ item }) => renderTimeSlot(item)}
              keyExtractor={(item) => item}
              scrollEnabled={false}
            />
          ) : (
            <View style={clsx(styles.bgWhite, styles.roundedLg, styles.p6, styles.itemsCenter, styles.justifyCenter)}>
              <Icon name="schedule" size={64} color={colors.textLight} />
              <Text style={clsx(styles.textLg, styles.fontMedium, styles.textBlack, styles.mt4)}>
                No jobs scheduled
              </Text>
              <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2, styles.textCenter)}>
                You don't have any jobs scheduled for this date
              </Text>
              <TouchableOpacity
                style={clsx(
                  styles.flexRow,
                  styles.itemsCenter,
                  styles.mt4,
                  styles.px4,
                  styles.py2,
                  styles.bgPrimary,
                  styles.roundedFull
                )}
                onPress={() => navigation.navigate('AddJob', { date: selectedDate })}
              >
                <Icon name="add" size={20} color={colors.white} />
                <Text style={clsx(styles.textWhite, styles.fontMedium, styles.ml1)}>
                  Add Your First Job
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={clsx(styles.mx4, styles.mt4, styles.mb6)}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
            Quick Actions
          </Text>
          
          <View style={clsx(styles.flexRow, styles.flexWrap, styles.justifyBetween)}>
            {[
              { icon: 'file-copy', label: 'Copy Week', color: colors.primary },
              { icon: 'sync', label: 'Sync Calendar', color: colors.success },
              { icon: 'notifications', label: 'Set Reminder', color: colors.warning },
              { icon: 'block', label: 'Block Time', color: colors.error },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={clsx(
                  styles.bgWhite,
                  styles.roundedLg,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  styles.p3,
                  styles.mb3,
                  { width: responsive.wp(48) }
                )}
              >
                <View style={clsx(styles.roundedFull, styles.p3, { backgroundColor: `${action.color}20` })}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={clsx(styles.fontMedium, styles.textBase, styles.textBlack, styles.mt2)}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ScheduleScreen;