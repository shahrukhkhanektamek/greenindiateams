import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

const ServiceAvailabilityScreen = () => {
  const {
    Toast,
    Urls,
    postData,
    user,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form states
  const [weekDates, setWeekDates] = useState([]);
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [initialState, setInitialState] = useState([]);

  // Fixed time slots
  const timeSlots = [
    { id: '1', time: '08:00', label: '8:00 AM', endTime: '10:00' },
    { id: '2', time: '10:00', label: '10:00 AM', endTime: '12:00' },
    { id: '3', time: '12:00', label: '12:00 PM', endTime: '14:00' },
    { id: '4', time: '14:00', label: '2:00 PM', endTime: '16:00' },
    { id: '5', time: '16:00', label: '4:00 PM', endTime: '18:00' },
    { id: '6', time: '18:00', label: '6:00 PM', endTime: '20:00' }
  ];

  // Get next 7 days from selected start date
  const getWeekDatesFromStartDate = (selectedStartDate) => {
    const dates = [];
    const start = new Date(selectedStartDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const shortDayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = date.getDate();
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      // Check if this date exists in existing schedules
      const existingSchedule = existingSchedules.find(schedule => {
        const scheduleDate = schedule.date.split('T')[0];
        return scheduleDate === dateStr;
      });

      // Initialize time slots based on existing data or default to inactive
      const initializedTimeSlots = timeSlots.map(slot => {
        if (existingSchedule) {
          const existingSlot = existingSchedule.times.find(t => t.from === slot.time);
          return {
            ...slot,
            isActive: existingSlot ? existingSlot.status : false
          };
        }
        return {
          ...slot,
          isActive: false
        };
      });
      
      dates.push({
        id: dateStr,
        date: dateStr,
        dateObj: date,
        dayName: dayName,
        shortDayName: shortDayName,
        dayNum: dayNum,
        monthName: monthName,
        formattedDate: formattedDate,
        isSelected: true, // All dates are selected by default
        timeSlots: initializedTimeSlots,
        hasExistingSchedule: !!existingSchedule,
        scheduleId: existingSchedule?._id
      });
    }
    
    return dates;
  };

  // Initialize week dates when startDate changes
  useEffect(() => {
    const dates = getWeekDatesFromStartDate(startDate);
    setWeekDates(dates);
    // Save initial state for comparison
    const initial = dates.map(day => ({
      id: day.id,
      timeSlots: day.timeSlots.map(slot => ({
        id: slot.id,
        isActive: slot.isActive
      }))
    }));
    setInitialState(initial);
    // Set first date as active tab
    if (dates.length > 0) {
      setActiveTab(dates[0].id);
    }
  }, [startDate, existingSchedules]);

  // Format time for display
  const formatTimeForDisplay = (time24h) => {
    if (!time24h) return '';
    
    const [hoursStr, minutesStr] = time24h.split(':');
    const hours = parseInt(hoursStr);
    const minutes = minutesStr || '00';
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
  };

  // Handle start date change
  const handleStartDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  // Check if any changes were made
  const checkForChanges = useCallback(() => {
    if (!weekDates.length || !initialState.length) return false;
    
    const hasChangesMade = weekDates.some(day => {
      const initialDay = initialState.find(d => d.id === day.id);
      if (!initialDay) return false;
      
      return day.timeSlots.some((slot, index) => {
        const initialSlot = initialDay.timeSlots[index];
        return initialSlot && initialSlot.isActive !== slot.isActive;
      });
    });
    
    return hasChangesMade;
  }, [weekDates, initialState]);

  // Toggle time slot for specific date
  const toggleTimeSlot = (dateId, slotId) => {
    setWeekDates(prev => {
      const newWeekDates = prev.map(day => {
        if (day.id === dateId) {
          const updatedTimeSlots = day.timeSlots.map(slot => {
            if (slot.id === slotId) {
              return {
                ...slot,
                isActive: !slot.isActive
              };
            }
            return slot;
          });
          
          return {
            ...day,
            timeSlots: updatedTimeSlots
          };
        }
        return day;
      });
      
      return newWeekDates;
    });
  };

  // Select all time slots for a specific date
  const selectAllTimeSlotsForDate = (dateId) => {
    setWeekDates(prev => {
      const newWeekDates = prev.map(day => {
        if (day.id === dateId) {
          const updatedTimeSlots = day.timeSlots.map(slot => ({
            ...slot,
            isActive: true
          }));
          
          return {
            ...day,
            timeSlots: updatedTimeSlots
          };
        }
        return day;
      });
      
      return newWeekDates;
    });
  };

  // Clear all time slots for a specific date
  const clearAllTimeSlotsForDate = (dateId) => {
    setWeekDates(prev => {
      const newWeekDates = prev.map(day => {
        if (day.id === dateId) {
          const updatedTimeSlots = day.timeSlots.map(slot => ({
            ...slot,
            isActive: false
          }));
          
          return {
            ...day,
            timeSlots: updatedTimeSlots
          };
        }
        return day;
      });
      
      return newWeekDates;
    });
  };

  // Select ALL dates and ALL time slots
  const selectAllDatesAndTimes = () => {
    setWeekDates(prev => {
      const newWeekDates = prev.map(day => {
        const updatedTimeSlots = day.timeSlots.map(slot => ({
          ...slot,
          isActive: true
        }));
        
        return {
          ...day,
          timeSlots: updatedTimeSlots
        };
      });
      
      return newWeekDates;
    });
    
    Toast.show({
      type: 'success',
      text1: 'All Selected',
      text2: 'All dates and time slots have been selected',
    });
  };

  // Update hasChanges when weekDates changes
  useEffect(() => {
    if (weekDates.length && initialState.length) {
      const changesExist = checkForChanges();
      setHasChanges(changesExist);
    }
  }, [weekDates, initialState, checkForChanges]);

  // Get selected slots for API - MODIFIED: Always send all 6 time slots
  const getSelectedSlotsForApi = () => {
    const allSlots = [];
    
    weekDates.forEach(day => {
      // Always send all 6 time slots with their current status
      const times = timeSlots.map(slot => {
        const daySlot = day.timeSlots.find(s => s.id === slot.id);
        return {
          from: slot.time,
          to: slot.endTime,
          status: daySlot ? daySlot.isActive : false
        };
      });
      
      allSlots.push({
        date: day.date,
        times: times,
        _id: day.scheduleId // Include existing schedule ID for updates
      });
    });
    
    return allSlots;
  };

  // Save availability to API - MODIFIED: Allow all slots OFF
  const saveAvailabilitySlots = async () => {
    const selectedSlots = getSelectedSlotsForApi();
    
    // Check if user has made any changes
    if (!hasChanges) {
      Toast.show({
        type: 'info',
        text1: 'No Changes',
        text2: 'No changes detected to save',
      });
      return;
    }

    setIsSaving(true);
    try {
      const addData = {
        selectedSlots: selectedSlots
      };
      
      console.log('Saving data:', addData);
      const response = await postData(addData, Urls.addAvailability, 'POST');

      if (response && response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Schedule updated successfully!',
        });
        
        // Update initial state after successful save
        const updatedInitial = weekDates.map(day => ({
          id: day.id,
          timeSlots: day.timeSlots.map(slot => ({
            id: slot.id,
            isActive: slot.isActive
          }))
        }));
        setInitialState(updatedInitial);
        setHasChanges(false);
        
        loadAvailability();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to save schedule',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save schedule. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Load availability data from API
  const loadAvailability = async () => {
    setLoading(true);
    
    try {
      const response = await postData({}, Urls.serviceAvailability, 'GET');
      
      if (response && response.success && response.data) {
        setExistingSchedules(response.data);
      } else {
        setExistingSchedules([]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load schedule. Please try again.',
      });
      setExistingSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadAvailability();
  }, []);

  // Refresh function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAvailability();
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Render date pills
  const renderDatePills = () => {
    return (
      <View style={clsx(styles.mb4, styles.mt8)}>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={clsx(styles.mb2)}
          contentContainerStyle={clsx(styles.pb2)}
        >
          {weekDates.map((day, index) => {
            const isActive = activeTab === day.id;
            const hasActiveSlots = day.timeSlots.some(slot => slot.isActive);
            const activeSlotsCount = day.timeSlots.filter(slot => slot.isActive).length;
            
            return (
              <TouchableOpacity
                key={day.id}
                style={clsx(
                  styles.mr2,
                  styles.p3,
                  styles.roundedLg,
                  styles.border,
                  styles.itemsCenter,
                  styles.justifyCenter,
                  isActive ? styles.bgPrimary : styles.bgWhite,
                  isActive ? styles.borderPrimary : styles.borderGray,
                  hasActiveSlots && styles.borderSuccess,
                  { minWidth: 80 }
                )}
                onPress={() => setActiveTab(day.id)}
                activeOpacity={0.7}
              >
                <Text style={clsx(
                  styles.textSm,
                  styles.fontBold,
                  isActive ? styles.textWhite : styles.textBlack
                )}>
                  {day.shortDayName}
                </Text>
                <Text style={clsx(
                  styles.textXs,
                  isActive ? styles.textWhite : styles.textMuted,
                  styles.mt1
                )}>
                  {day.monthName} {day.dayNum}
                </Text>
                {hasActiveSlots && (
                  <View style={clsx(
                    styles.mt1,
                    styles.px2,
                    styles.py1,
                    styles.roundedFull,
                    styles.bgSuccess
                  )}>
                    <Text style={clsx(
                      styles.textXs,
                      styles.fontBold,
                      styles.textWhite
                    )}>
                      {activeSlotsCount} ON
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Render time slots for active date
  const renderTimeSlotsForActiveDate = () => {
    if (!activeTab) return null;

    const activeDay = weekDates.find(day => day.id === activeTab);
    if (!activeDay) return null;

    const activeSlotsCount = activeDay.timeSlots.filter(slot => slot.isActive).length;
    const hasActiveSlots = activeSlotsCount > 0;
    
    return (
      <View style={clsx(styles.mb4)}>
        {/* Day Header */}
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
          <View>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              {activeDay.dayName}, {activeDay.monthName} {activeDay.dayNum}
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              {activeSlotsCount} of {timeSlots.length} slots {hasActiveSlots ? 'ON' : 'OFF'}
            </Text>
          </View>
          
          <View style={clsx(styles.flexRow)}>
            <TouchableOpacity
              style={clsx(
                styles.px3,
                styles.py1,
                styles.bgPrimary,
                styles.roundedFull,
                styles.mr2
              )}
              onPress={() => selectAllTimeSlotsForDate(activeDay.id)}
              activeOpacity={0.7}
            >
              <Text style={clsx(styles.textXs, styles.textWhite)}>
                All ON
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Slots */}
        <View style={clsx(styles.bgWhite, styles.roundedLg, styles.border, styles.borderGrayLight)}>
          {activeDay.timeSlots.map((slot) => (
            <View 
              key={slot.id} 
              style={clsx(
                styles.flexRow,
                styles.justifyBetween,
                styles.itemsCenter,
                styles.px4,
                styles.py4,
                styles.borderB,
                styles.borderGrayLight,
                { borderBottomWidth: slot.id === activeDay.timeSlots[activeDay.timeSlots.length - 1].id ? 0 : 1 }
              )}
            >
              <View style={clsx(styles.flex1)}>
                <Text style={clsx(
                  styles.textBase,
                  styles.fontMedium,
                  slot.isActive ? styles.textSuccess : styles.textBlack
                )}>
                  {slot.label} to {formatTimeForDisplay(slot.endTime)}
                  {slot.isActive && (
                    <Text style={clsx(styles.textXs, styles.textSuccess, styles.ml2)}>
                      ✓
                    </Text>
                  )}
                </Text>
              </View>
              
              <Switch
                value={slot.isActive}
                onValueChange={() => toggleTimeSlot(activeDay.id, slot.id)}
                trackColor={{ false: colors.grayLight, true: colors.success }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.grayLight}
              />
            </View>
          ))}
        </View>

      
      </View>
    );
  };


  if (loading && existingSchedules.length === 0) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading schedule...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Service Availability"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        showProfile={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={clsx(styles.px4, styles.pb6)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >

        {/* Select All Dates Button */}
        <View style={clsx(styles.mt4, styles.mb3)}>
          <TouchableOpacity
            style={clsx(
              styles.bgInfo,
              styles.px4,
              styles.py3,
              styles.roundedLg,
              styles.flexRow,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.border,
              styles.borderInfo
            )}
            onPress={() => selectAllDatesAndTimes()}
            activeOpacity={0.7}
          >
            <Icon 
              name="check-circle" 
              size={20} 
              color={colors.white}
              style={clsx(styles.mr2)}
            />
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textWhite)}>
              Select All Dates & Times
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Pills */}
        {renderDatePills()}

        {/* Time Slots for Active Date */}
        {renderTimeSlotsForActiveDate()} 

        <TouchableOpacity
            style={clsx(
              hasChanges ? styles.bgPrimary : styles.bgGray,
              styles.px3,
              styles.py4,
              styles.mt4,
              styles.rounded,
              styles.itemsCenter,
              styles.justifyCenter
            )}
            onPress={saveAvailabilitySlots}
            disabled={isSaving || !hasChanges}
            activeOpacity={hasChanges ? 0.7 : 1}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={clsx(
                styles.text2xl, 
                styles.fontBold, 
                hasChanges ? styles.textWhite : styles.textMuted
              )}>
                Save Update And Calender
              </Text>
            )}
          </TouchableOpacity>

      
      </ScrollView>
    </View>
  );
};

export default ServiceAvailabilityScreen;