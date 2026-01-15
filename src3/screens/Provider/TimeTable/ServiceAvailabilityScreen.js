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
  Alert
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
  const [availabilityData, setAvailabilityData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [editingDate, setEditingDate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form states
  const [weekDates, setWeekDates] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingTimeInfo, setEditingTimeInfo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState(null);
  const [dateToDelete, setDateToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      
      dates.push({
        id: dateStr,
        date: dateStr,
        dateObj: date,
        dayName: dayName,
        shortDayName: shortDayName,
        dayNum: dayNum,
        monthName: monthName,
        formattedDate: formattedDate,
        isSelected: false,
        timeSlots: [{
          id: `${dateStr}_${Date.now()}`,
          from: '08:00',
          to: '20:00',
          isAllDay: false
        }]
      });
    }
    
    return dates;
  };

  // Initialize week dates when startDate changes
  useEffect(() => {
    const dates = getWeekDatesFromStartDate(startDate);
    setWeekDates(dates);
  }, [startDate]);

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

  // Format date from API
  const formatDateFromApi = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  // Format time picker value to string
  const formatTimeToString = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Parse time string to Date object
  const parseTimeString = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date;
  };

  // Toggle day selection - BOTH ADD AND EDIT MODE
  const toggleDaySelection = (date) => {
    setWeekDates(prev => {
      return prev.map(day => {
        if (day.date === date.date) {
          const updatedDay = {
            ...day,
            isSelected: !day.isSelected
          };
          
          if (updatedDay.isSelected && updatedDay.timeSlots.length === 0) {
            updatedDay.timeSlots = [{
              id: `${date.date}_${Date.now()}`,
              from: '08:00',
              to: '20:00',
              isAllDay: false
            }];
          }
          
          return updatedDay;
        }
        return day;
      });
    });
  };

  // Select all days - ONLY IN ADD MODE
  const selectAllDays = () => {
    if (editingDate) return; // Don't allow in edit mode
    
    setWeekDates(prev => {
      return prev.map(day => ({
        ...day,
        isSelected: true,
        timeSlots: day.timeSlots.length === 0 ? [{
          id: `${day.date}_${Date.now()}`,
          from: '08:00',
          to: '20:00',
          isAllDay: false
        }] : day.timeSlots
      }));
    });
  };

  // Clear all days - ONLY IN ADD MODE
  const clearAllDays = () => {
    if (editingDate) return; // Don't allow in edit mode
    
    setWeekDates(prev => {
      return prev.map(day => ({
        ...day,
        isSelected: false
      }));
    });
  };

  // Add new time slot - BOTH MODES
  const addTimeSlot = (date) => {
    setWeekDates(prev => {
      return prev.map(day => {
        if (day.date === date.date) {
          const newTimeSlot = {
            id: `${date.date}_${Date.now()}`,
            from: '14:00',
            to: '16:00',
            isAllDay: false
          };
          
          return {
            ...day,
            timeSlots: [...day.timeSlots, newTimeSlot]
          };
        }
        return day;
      });
    });
  };

  // Remove time slot - BOTH MODES
  const removeTimeSlot = (date, timeSlotId) => {
    setWeekDates(prev => {
      return prev.map(day => {
        if (day.date === date.date) {
          const updatedTimeSlots = day.timeSlots.filter(slot => slot.id !== timeSlotId);
          
          if (updatedTimeSlots.length === 0 && day.isSelected) {
            return {
              ...day,
              timeSlots: [{
                id: `${date.date}_${Date.now()}`,
                from: '08:00',
                to: '20:00',
                isAllDay: false
              }]
            };
          }
          
          return {
            ...day,
            timeSlots: updatedTimeSlots
          };
        }
        return day;
      });
    });
  };

  // Update time slot
  const updateTimeSlot = (date, timeSlotId, field, value) => {
    setWeekDates(prev => {
      return prev.map(day => {
        if (day.date === date.date) {
          const updatedTimeSlots = day.timeSlots.map(slot => {
            if (slot.id === timeSlotId) {
              return {
                ...slot,
                [field]: value
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
    });
  };

  // Open modal for adding new slots
  const openAddModal = () => {
    const dates = getWeekDatesFromStartDate(startDate);
    setWeekDates(dates);
    setEditingDate(null); // Set to null for add mode
    setShowAddModal(true);
  };

  // Open modal for editing a date
  const openEditModal = (dateItem) => {
    setSelectedDateId(dateItem._id);
    
    // Set start date to the date being edited
    const editStartDate = new Date(dateItem.date);
    setStartDate(editStartDate);
    
    // After startDate is set, update weekDates
    setTimeout(() => {
      const dates = getWeekDatesFromStartDate(editStartDate);
      const updatedDates = dates.map(day => {
        if (day.date === dateItem.date) {
          // Convert API time slots to frontend format
          const timeSlots = dateItem.slots.map(slot => ({
            id: slot._id || slot.id,
            from: slot.from,
            to: slot.to,
            isAllDay: false
          }));
          
          return {
            ...day,
            isSelected: true, // Auto-select the editing date
            timeSlots: timeSlots.length > 0 ? timeSlots : [{
              id: `${day.date}_${Date.now()}`,
              from: '08:00',
              to: '20:00',
              isAllDay: false
            }]
          };
        }
        return {
          ...day,
          isSelected: false // Unselect other dates
        };
      });
      
      setWeekDates(updatedDates);
      setEditingDate(dateItem);
      setShowAddModal(true);
    }, 100);
  };

  // Handle time change
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime && editingTimeInfo) {
      const timeStr = formatTimeToString(selectedTime);
      updateTimeSlot(
        editingTimeInfo.date,
        editingTimeInfo.timeSlotId,
        editingTimeInfo.field,
        timeStr
      );
    }
    setEditingTimeInfo(null);
  };

  // Handle start date change - ONLY IN ADD MODE
  const handleStartDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && !editingDate) { // Only allow in add mode
      setStartDate(selectedDate);
    }
  };

  // Validate time slots
  const validateTimeSlots = () => {
    const selectedDaysList = weekDates.filter(day => day.isSelected);
    
    if (selectedDaysList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Select Days',
        text2: 'Please select at least one day',
      });
      return false;
    }

    for (const day of selectedDaysList) {
      for (const timeSlot of day.timeSlots) {
        const startHour = parseInt(timeSlot.from.split(':')[0]);
        const endHour = parseInt(timeSlot.to.split(':')[0]);
        
        if (startHour >= endHour) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Time',
            text2: `${day.dayName}: End time must be after start time`,
          });
          return false;
        }
      }
    }

    return true;
  };

  // Get selected slots for API
  const getSelectedSlotsForApi = () => {
    const allSlots = [];
    
    weekDates.forEach(day => {
      if (day.isSelected) {
        const timesArray = day.timeSlots.map(timeSlot => ({
          from: timeSlot.from,
          to: timeSlot.to,
          _id: timeSlot.id // Send _id only for existing slots
        }));
        
        allSlots.push({
          date: day.date,
          times: timesArray
        });
      }
    });
    
    return allSlots;
  };

  // Save availability to API
  const saveAvailabilitySlots = async () => {
    if (!validateTimeSlots()) return;

    setIsSaving(true);
    try {
      const selectedSlots = getSelectedSlotsForApi();
      
      let response;
      let successMsg = '';
      
      if (editingDate) {
        // Update mode - update only the editing date
        const updateData = {
          date: editingDate.date,
          times: selectedSlots.find(slot => slot.date === editingDate.date)?.times || []
        };
        console.log({selectedSlots:updateData,date:editingDate.date});
        response = await postData({selectedSlots:updateData,date:editingDate.date}, Urls.updateAvailability+'/'+selectedDateId, 'POST');
        successMsg = 'Schedule updated successfully!';
      } else {
        // Add mode - send all selected slots 
        const addData = {
          selectedSlots: selectedSlots
        };
        console.log('Add data:', addData);
        response = await postData(addData, Urls.addAvailability, 'POST');
        successMsg = `Added ${selectedSlots.length} date(s) with time slots`;
      }

      if (response && response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: successMsg,
        });
        setShowAddModal(false);
        loadAvailability();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to save time slots',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save time slots. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete entire date via API
  const deleteDateSchedule = async () => {
    if (!dateToDelete) return;

    setIsDeleting(true);
    try {
      const deleteData = {
        date: dateToDelete.date
      };
      
      const response = await postData(deleteData, Urls.deleteAvailability+'/'+selectedDateId, 'POST');

      if (response && response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Date schedule deleted successfully',
        });
        loadAvailability();
        setShowDeleteModal(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to delete date schedule',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete date schedule. Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setDateToDelete(null);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (dateItem) => {
    setDateToDelete(dateItem);
    setSelectedDateId(dateItem._id);
    setShowDeleteModal(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDateToDelete(null);
  };

  // Load availability data from API
  const loadAvailability = async () => {
    setLoading(true);
    
    try {
      const response = await postData({}, Urls.serviceAvailability, 'GET');
      
      if (response && response.success && response.data) {
        // Process API data as is
        const apiDataArray = response.data.map(item => {
          if (item.date && item.times && Array.isArray(item.times)) {
            const dateStr = formatDateFromApi(item.date);
            const dateObj = new Date(dateStr);
            
            return {
              date: dateStr,
              dateObj: {
                date: dateStr,
                dayName: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
                shortDayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: dateObj.getDate(),
                monthName: dateObj.toLocaleDateString('en-US', { month: 'short' }),
                formattedDate: dateObj.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }),
                isToday: dateStr === new Date().toISOString().split('T')[0]
              },
              slots: item.times.map(timeSlot => ({
                id: timeSlot._id,
                _id: timeSlot._id,
                date: item.date,
                formattedDate: dateStr,
                from: timeSlot.from,
                to: timeSlot.to,
                isAllDay: false
              })),
              isAvailable: true,
              _id: item._id
            };
          }
          return null;
        }).filter(item => item !== null);

        setAvailabilityData(apiDataArray);
      } else {
        setAvailabilityData([]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load schedule. Please try again.',
      });
      setAvailabilityData([]);
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

  // Render delete confirmation modal
  const renderDeleteModal = () => {
    return (
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closeDeleteModal}
      >
        <View style={[
          clsx(styles.flex1, styles.justifyCenter, styles.itemsCenter),
          { backgroundColor: 'rgba(0,0,0,0.5)' }
        ]}>
          <View style={[
            clsx(styles.bgWhite, styles.roundedLg, styles.p5),
            { width: '90%', maxWidth: 400 }
          ]}>
            <View style={clsx(styles.itemsCenter, styles.mb-4)}>
              <View style={clsx(
                styles.w16,
                styles.h16,
                styles.roundedFull,
                styles.bgErrorLight,
                styles.justifyCenter,
                styles.itemsCenter,
                styles.mb4
              )}>
                <Icon name="delete-outline" size={32} color={colors.error} />
              </View>
              
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb2, styles.textCenter)}>
                Delete Schedule
              </Text>
              
              <Text style={clsx(styles.textBase, styles.textGray, styles.mb4, styles.textCenter)}>
                This will delete all time slots for {dateToDelete?.dateObj?.formattedDate || 'this date'}. 
                This action cannot be undone.
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.justifyBetween)}>
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.bgGrayLight,
                  styles.py3,
                  styles.rounded,
                  styles.mr3,
                  styles.itemsCenter,
                  isDeleting && styles.opacity50
                )}
                onPress={closeDeleteModal}
                disabled={isDeleting}
                activeOpacity={0.7}
              >
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={clsx(
                  styles.flex1,
                  styles.bgError,
                  styles.py3,
                  styles.rounded,
                  styles.itemsCenter,
                  isDeleting && styles.opacity50
                )}
                onPress={deleteDateSchedule}
                disabled={isDeleting}
                activeOpacity={0.7}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textWhite)}>
                    Delete
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render date card
  const renderDateCard = ({ item }) => {
    const hasSlots = item.slots.length > 0;

    if (!hasSlots) return null;

    return (
      <View style={clsx(styles.bgWhite, styles.card, styles.mb3)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <View style={clsx(
              styles.w12,
              styles.h12,
              styles.roundedFull,
              styles.justifyCenter,
              styles.itemsCenter,
              item.dateObj.isToday ? styles.bgPrimary : styles.bgGrayLight,
              styles.mr3
            )}>
              <Text style={clsx(
                styles.textXs,
                styles.fontBold,
                item.dateObj.isToday ? styles.textWhite : styles.textBlack
              )}>
                {item.dateObj.shortDayName}
              </Text>
              <Text style={clsx(
                styles.textLg,
                styles.fontBold,
                item.dateObj.isToday ? styles.textWhite : styles.textBlack
              )}>
                {item.dateObj.dayNum}
              </Text>
              <Text style={clsx(
                styles.textXs,
                item.dateObj.isToday ? styles.textWhite : styles.textMuted
              )}>
                {item.dateObj.monthName}
              </Text>
            </View>
            
            <View>
              <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
                {item.dateObj.dayName}
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                {item.dateObj.formattedDate}
              </Text>
            </View>
          </View>
          
          <View style={clsx(styles.flexRow, styles.itemsCenter)}>
            <View style={clsx(
              styles.px2,
              styles.py1,
              styles.roundedFull,
              styles.bgSuccessLight,
              styles.mr2
            )}>
              <Text style={clsx(styles.textXs, styles.fontMedium, styles.textSuccess)}>
                {item.slots.length} slot(s)
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow)}>
              <TouchableOpacity
                style={clsx(styles.p2, styles.mr1)}
                onPress={() => openEditModal(item)}
              >
                <Icon name="edit" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={clsx(styles.p2)}
                onPress={() => openDeleteModal(item)}
              >
                <Icon name="delete" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View>
          {item.slots.map((slot, slotIndex) => (
            <View
              key={slot._id || slot.id || slotIndex}
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyBetween,
                styles.p3,
                styles.mb2,
                styles.bgGrayLight,
                styles.rounded,
                slotIndex !== item.slots.length - 1 && styles.borderB,
                styles.borderGray
              )}
            >
              <View style={clsx(styles.flex1)}>
                <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb1)}>
                  <Icon name="access-time" size={16} color={colors.primary} style={clsx(styles.mr1)} />
                  <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                    {formatTimeForDisplay(slot.from)} - {formatTimeForDisplay(slot.to)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render day card in modal - DIFFERENT FOR ADD AND EDIT MODE
  const renderDayCard = (day) => {
    const isSelected = day.isSelected;
    const isEditingMode = editingDate !== null;
    
    // In edit mode, only show the date being edited
    if (isEditingMode && day.date !== editingDate?.date) {
      return null;
    }
    
    return (
      <View
        key={day.id}
        style={clsx(
          styles.mb3,
          styles.p3,
          styles.roundedLg,
          styles.border,
          isSelected ? styles.bgPrimaryLight : styles.bgGrayLight,
          isSelected ? styles.borderPrimary : styles.borderGray
        )}
      >
        {/* Day Header - Different for add vs edit mode */}
        {isEditingMode ? (
          // EDIT MODE: Date is fixed, show as read-only
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <View style={clsx(
                styles.w6,
                styles.h6,
                styles.roundedSm,
                styles.justifyCenter,
                styles.itemsCenter,
                styles.mr3,
                isSelected ? styles.bgPrimary : styles.bgGray,
                styles.borderGray
              )}>
                {isSelected && (
                  <Icon name="check" size={14} color={colors.white} />
                )}
              </View>
              
              <View>
                <Text style={clsx(
                  styles.textBase,
                  styles.fontBold,
                  isSelected ? styles.textPrimary : styles.textGray
                )}>
                  {day.dayName}
                </Text>
                <Text style={clsx(
                  styles.textSm,
                  isSelected ? styles.textPrimary : styles.textGray
                )}>
                  {day.formattedDate} (Editing)
                </Text>
              </View>
            </View>
            
            <Text style={clsx(
              styles.textSm,
              isSelected ? styles.textPrimary : styles.textGray
            )}>
              Editing
            </Text>
          </View>
        ) : (
          // ADD MODE: User can select/deselect dates
          <TouchableOpacity
            style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}
            onPress={() => toggleDaySelection(day)}
            activeOpacity={0.7}
          >
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <View style={clsx(
                styles.w6,
                styles.h6,
                styles.roundedSm,
                styles.justifyCenter,
                styles.itemsCenter,
                styles.mr3,
                isSelected ? styles.bgPrimary : styles.bgWhite,
                isSelected ? styles.borderPrimary : styles.borderGray,
                styles.border
              )}>
                {isSelected && (
                  <Icon name="check" size={14} color={colors.white} />
                )}
              </View>
              
              <View>
                <Text style={clsx(
                  styles.textBase,
                  styles.fontBold,
                  isSelected ? styles.textPrimary : styles.textBlack
                )}>
                  {day.dayName}
                </Text>
                <Text style={clsx(
                  styles.textSm,
                  isSelected ? styles.textPrimary : styles.textMuted
                )}>
                  {day.formattedDate}
                </Text>
              </View>
            </View>
            
            <Text style={clsx(
              styles.textSm,
              isSelected ? styles.textPrimary : styles.textMuted
            )}>
              {isSelected ? 'Selected' : 'Tap to Select'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Time Slots for this day - SAME FOR BOTH MODES */}
        {isSelected && (
          <View>
            <Text style={clsx(styles.textSm, styles.textBlack, styles.fontMedium, styles.mb2)}>
              Time Slots ({day.timeSlots.length})
            </Text>
            
            {day.timeSlots.map((timeSlot, index) => (
              <View
                key={timeSlot.id}
                style={clsx(
                  styles.mb2,
                  styles.p3,
                  styles.bgWhite,
                  styles.rounded,
                  styles.border,
                  styles.borderGray
                )}
              >
                <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb2)}>
                  <Text style={clsx(styles.textSm, styles.fontMedium, styles.textBlack)}>
                    Slot {index + 1}
                  </Text>
                  {day.timeSlots.length > 1 && (
                    <TouchableOpacity onPress={() => removeTimeSlot(day, timeSlot.id)}>
                      <Icon name="close" size={18} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                  <View style={clsx(styles.flex1, styles.mr2)}>
                    <Text style={clsx(styles.textXs, styles.textBlack, styles.mb1)}>
                      From (Start Time)
                    </Text>
                    <TouchableOpacity
                      style={clsx(
                        styles.input,
                        styles.flexRow,
                        styles.justifyBetween,
                        styles.itemsCenter,
                        styles.bgWhite
                      )}
                      onPress={() => {
                        setEditingTimeInfo({
                          date: day,
                          timeSlotId: timeSlot.id,
                          field: 'from'
                        });
                        setShowTimePicker(true);
                      }}
                    >
                      <Text style={clsx(styles.textBase, styles.textBlack)}>
                        {formatTimeForDisplay(timeSlot.from)}
                      </Text>
                      <Icon name="access-time" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={clsx(styles.flex1)}>
                    <Text style={clsx(styles.textXs, styles.textBlack, styles.mb1)}>
                      To (End Time)
                    </Text>
                    <TouchableOpacity
                      style={clsx(
                        styles.input,
                        styles.flexRow,
                        styles.justifyBetween,
                        styles.itemsCenter,
                        styles.bgWhite
                      )}
                      onPress={() => {
                        setEditingTimeInfo({
                          date: day,
                          timeSlotId: timeSlot.id,
                          field: 'to'
                        });
                        setShowTimePicker(true);
                      }}
                    >
                      <Text style={clsx(styles.textBase, styles.textBlack)}>
                        {formatTimeForDisplay(timeSlot.to)}
                      </Text>
                      <Icon name="access-time" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            
            {/* Add More Time Button - SAME FOR BOTH MODES */}
            <TouchableOpacity
              style={clsx(
                styles.flexRow,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.py2,
                styles.mt2,
                styles.bgPrimaryLight,
                styles.rounded,
                styles.border,
                styles.borderPrimary
              )}
              onPress={() => addTimeSlot(day)}
              activeOpacity={0.7}
            >
              <Icon name="add" size={18} color={colors.primary} />
              <Text style={clsx(styles.textSm, styles.fontMedium, styles.textPrimary, styles.ml1)}>
                Add More Time for {day.shortDayName}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Add/Edit Slot Modal
  const renderAddSlotModal = () => {
    const selectedDays = weekDates.filter(day => day.isSelected);
    const selectedDaysCount = selectedDays.length;
    const selectedSlots = getSelectedSlotsForApi();
    const totalTimeSlots = selectedSlots.reduce((sum, slot) => sum + slot.times.length, 0);
    const isEditingMode = editingDate !== null;
    
    return (
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex1}
        >
          <View style={[
            clsx(styles.flex1, styles.justifyEnd),
            { backgroundColor: 'rgba(0,0,0,0.5)' }
          ]}>
            <View style={[
              clsx(styles.bgWhite, styles.roundedTLg, styles.roundedTRg),
              { maxHeight: '90%' }
            ]}>
              <View style={clsx(
                styles.bgPrimary,
                styles.p4,
                styles.flexRow,
                styles.justifyBetween,
                styles.itemsCenter
              )}>
                <Text style={clsx(styles.textLg, styles.fontBold, styles.textWhite)}>
                  {isEditingMode ? `Edit Schedule - ${editingDate.dateObj.formattedDate}` : 'Add Time Slots'}
                </Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Icon name="close" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={clsx(styles.p4)} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={clsx(styles.pb4)}
              >
                {/* Start Date Selection - ONLY FOR ADD MODE */}
                {!isEditingMode && (
                  <View style={clsx(styles.mb4)}>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb2)}>
                      Select Week Start Date
                    </Text>
                    <TouchableOpacity
                      style={clsx(
                        styles.input,
                        styles.flexRow,
                        styles.justifyBetween,
                        styles.itemsCenter,
                        styles.bgWhite
                      )}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={clsx(styles.textBase, styles.textBlack)}>
                        {startDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                      <Icon name="calendar-today" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Instructions - DIFFERENT FOR ADD VS EDIT */}
                <View style={clsx(
                  styles.bgInfoLight,
                  styles.p3,
                  styles.rounded,
                  styles.mb4,
                  styles.border,
                  styles.borderInfo
                )}>
                  <Text style={clsx(styles.textSm, styles.textInfo)}>
                    {isEditingMode 
                      ? `• Editing schedule for ${editingDate.dateObj.formattedDate}\n• Update time slots as needed\n• Add or remove time slots\n• Click "Update Schedule" to save changes`
                      : '• Select start date for the week\n• Select days by tapping on them\n• Each day can have multiple time slots\n• Click "Add More Time" for additional slots\n• Default time: 8:00 AM - 8:00 PM'
                    }
                  </Text>
                </View>

                {/* Select All / Clear All Buttons - ONLY FOR ADD MODE */}
                {!isEditingMode && (
                  <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb4)}>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                      Week from {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({selectedDaysCount} selected)
                    </Text>
                    <View style={clsx(styles.flexRow)}>
                      <TouchableOpacity
                        style={clsx(
                          styles.px3,
                          styles.py1,
                          styles.bgPrimary,
                          styles.roundedFull,
                          styles.mr2
                        )}
                        onPress={selectAllDays}
                        activeOpacity={0.7}
                      >
                        <Text style={clsx(styles.textSm, styles.textWhite)}>
                          Select All
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={clsx(
                          styles.px3,
                          styles.py1,
                          styles.bgGray,
                          styles.roundedFull
                        )}
                        onPress={clearAllDays}
                        activeOpacity={0.7}
                      >
                        <Text style={clsx(styles.textSm, styles.textBlack)}>
                          Clear All
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Days List */}
                <View style={clsx(styles.mb4)}>
                  {weekDates.map(day => renderDayCard(day))}
                </View>

                {/* Preview Section */}
                {selectedDaysCount > 0 && (
                  <View style={clsx(styles.mb4)}>
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
                      {isEditingMode ? 'Updated Schedule' : 'Preview'} 
                      ({totalTimeSlots} {isEditingMode ? 'updated' : 'new'} slots)
                    </Text>
                    
                    <View style={clsx(
                      styles.bgSuccessLight,
                      styles.p3,
                      styles.rounded,
                      styles.border,
                      styles.borderSuccess
                    )}>
                      {isEditingMode ? (
                        <>
                          <Text style={clsx(styles.textSm, styles.textSuccess, styles.fontMedium, styles.mb1)}>
                            Editing Date:
                          </Text>
                          <Text style={clsx(styles.textSm, styles.textSuccess)}>
                            {editingDate.dateObj.formattedDate}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={clsx(styles.textSm, styles.textSuccess, styles.fontMedium, styles.mb1)}>
                            Selected Days ({selectedDaysCount}):
                          </Text>
                          <Text style={clsx(styles.textSm, styles.textSuccess)}>
                            {selectedDays.map(day => day.dayName).join(', ')}
                          </Text>
                        </>
                      )}
                      <Text style={clsx(styles.textSm, styles.textSuccess, styles.mt2)}>
                        Total Time Slots: {totalTimeSlots}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={clsx(styles.flexRow, styles.mt4)}>
                  <TouchableOpacity
                    style={clsx(
                      styles.flex1,
                      styles.bgGray,
                      styles.py3,
                      styles.rounded,
                      styles.mr2,
                      styles.itemsCenter
                    )}
                    onPress={() => setShowAddModal(false)}
                    disabled={isSaving}
                    activeOpacity={0.7}
                  >
                    <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack)}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={clsx(
                      styles.flex1,
                      styles.bgPrimary,
                      styles.py3,
                      styles.rounded,
                      styles.itemsCenter,
                      (selectedDaysCount === 0 || isSaving) && styles.opacity50
                    )}
                    onPress={saveAvailabilitySlots}
                    disabled={selectedDaysCount === 0 || isSaving}
                    activeOpacity={0.7}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={clsx(styles.textBase, styles.fontMedium, styles.textWhite)}>
                        {isEditingMode ? 'Update Schedule' : 'Save Slots'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Date Picker - ONLY FOR ADD MODE */}
        {showDatePicker && !isEditingMode && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="spinner"
            onChange={handleStartDateChange}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && editingTimeInfo && (
          <DateTimePicker
            value={parseTimeString(
              editingTimeInfo.field === 'from' 
                ? weekDates.find(d => d.date === editingTimeInfo.date.date)?.timeSlots
                    .find(t => t.id === editingTimeInfo.timeSlotId)?.from || '08:00'
                : weekDates.find(d => d.date === editingTimeInfo.date.date)?.timeSlots
                    .find(t => t.id === editingTimeInfo.timeSlotId)?.to || '20:00'
            )}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
          />
        )}
      </Modal>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    return (
      <View style={clsx(styles.py8, styles.itemsCenter)}>
        <Icon name="schedule" size={60} color={colors.textMuted} />
        <Text style={clsx(styles.textLg, styles.textMuted, styles.mt4, styles.fontMedium)}>
          No Schedule Added Yet
        </Text>
        <Text style={clsx(styles.textBase, styles.textMuted, styles.mt2, styles.textCenter)}>
          Add your availability by clicking the button below
        </Text>
      </View>
    );
  };

  if (loading && !availabilityData.length) {
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
        {/* Summary Card */}
        <View style={clsx(
          styles.bgPrimary,
          styles.roundedLg,
          styles.p4,
          styles.mb4,
          styles.shadowMd,
          styles.mt2
        )}>
          <Text style={clsx(styles.textLg, styles.fontBold, styles.textWhite, styles.mb3)}>
            Service Availability
          </Text>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween)}>
            <View style={clsx(styles.itemsCenter)}>
              <Icon 
                name="calendar-today" 
                size={32} 
                color={colors.white}
                style={clsx(styles.mb1)}
              />
              <Text style={clsx(styles.textSm, styles.textWhite)}>
                Schedule
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={clsx(
              styles.mt4,
              styles.bgWhite,
              styles.py3,
              styles.rounded,
              styles.itemsCenter,
              styles.flexRow,
              styles.justifyCenter
            )}
            onPress={openAddModal}
            activeOpacity={0.7}
          >
            <Icon name="add" size={20} color={colors.primary} style={clsx(styles.mr2)} />
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textPrimary)}>
              Add Availability
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Schedule */}
        <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack, styles.mb3)}>
          Your Schedule
        </Text>

        {/* Show only if data exists */}
        {availabilityData.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={availabilityData}
            keyExtractor={(item, index) => item.date + index}
            renderItem={renderDateCard}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>

      {/* Add Slot Modal */}
      {renderAddSlotModal()}

      {/* Delete Confirmation Modal */}
      {renderDeleteModal()}
    </View>
  );
};

export default ServiceAvailabilityScreen;