import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SectionList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../../styles/globalStyles';
import { colors } from '../../../styles/colors';
import Header from '../../../components/Common/Header';
import { AppContext } from '../../../Context/AppContext';

const TrainingHistoryScreen = ({ navigation }) => {
  const { Toast, Urls, postData, user } = useContext(AppContext);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [trainings, setTrainings] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'Complete', 'Confirm', 'New', 'Reject', 'Fail'
  
  // Pagination states from API response
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });
  
  // Training summary states
  const [summary, setSummary] = useState({
    totalTrainings: 0,
    completed: 0,
    pending: 0,
    failed: 0,
  });

  // Fetch training history from API
  const fetchTrainingHistory = async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      // Prepare API parameters
      const currentPage = isLoadMore ? pagination.page + 1 : 1;
      const params = {
        page: currentPage,
        limit: pagination.limit
      };
      
      // Add status filter if not 'all'
      if (filter !== 'all') {
        params.trainingScheduleStatus = filter;
      }
      
    //   console.log('Training History API Params:', params);
      
      // Call API to get training history
      const response = await postData(
        params,
        Urls.trainingHistory, // You need to add this URL in your AppContext
        'GET'
      );

    //   console.log('Training History API Response:', response);

      if (response?.success && response.data) {
        // Format training data
        const formattedTrainings = response.data.map(item => {
          // Calculate duration
          let duration = '';
          if (item.training?.startTime && item.training?.endTime) {
            const startTime = new Date(`2000-01-01T${item.training.startTime}`);
            const endTime = new Date(`2000-01-01T${item.training.endTime}`);
            const diffMs = endTime - startTime;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            duration = `${diffHours}h ${diffMinutes}m`;
          }

          // Format schedule date
          let dateDisplay = '';
          if (item.scheduleDate) {
            const scheduleDate = new Date(item.scheduleDate);
            dateDisplay = scheduleDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
          }

          // Format schedule time
          let timeDisplay = '';
          if (item.scheduleTime) {
            const timeStr = item.scheduleTime;
            const [hours, minutes] = timeStr.split(':').map(Number);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hour12 = hours % 12 || 12;
            timeDisplay = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
          }

          return {
            ...item,
            duration: duration,
            dateDisplay: dateDisplay,
            timeDisplay: timeDisplay,
          };
        });

        if (isLoadMore) {
          // Append new data for load more
          setTrainings(prev => [...prev, ...formattedTrainings]);
        } else {
          // Set fresh data
          setTrainings(formattedTrainings);
        }
        
        // Update summary counts
        if (response.data.length > 0) {
          const completedCount = response.data.filter(item => 
            item.trainingScheduleStatus === 'Complete'
          ).length;
          
          const pendingCount = response.data.filter(item => 
            item.trainingScheduleStatus === 'New' || 
            item.trainingScheduleStatus === 'Confirm'
          ).length;
          
          const failedCount = response.data.filter(item => 
            item.trainingScheduleStatus === 'Fail' || 
            item.trainingScheduleStatus === 'Reject'
          ).length;
          
          setSummary({
            totalTrainings: response.total || response.data.length,
            completed: completedCount,
            pending: pendingCount,
            failed: failedCount,
          });
        }
        
        // Set pagination data from API response
        if (response.pagination) {
          setPagination({
            page: response.pagination.currentPage || currentPage,
            limit: response.pagination.limit || params.limit,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 1,
            hasPrevPage: response.pagination.hasPrevPage || false,
            hasNextPage: response.pagination.hasNextPage || false,
          });
        } else {
          // Set pagination from root level if not in pagination object
          setPagination({
            page: response.page || currentPage,
            limit: response.limit || params.limit,
            total: response.total || 0,
            totalPages: response.totalPages || 1,
            hasPrevPage: response.hasPrevPage || false,
            hasNextPage: response.hasNextPage || false,
          });
        }
        
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to load training history',
        });
        
        // For demo, use sample data if API fails
        if (!isLoadMore) {
          const sampleData = getSampleData();
          setTrainings(sampleData.trainings);
          setSummary(sampleData.summary);
          setPagination(sampleData.pagination);
        }
      }
      
    } catch (error) {
      console.error('Fetch training history error:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Failed to connect to server',
      });
      
      // For demo, use sample data
      if (!isLoadMore) {
        const sampleData = getSampleData();
        setTrainings(sampleData.trainings);
        setSummary(sampleData.summary);
        setPagination(sampleData.pagination);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Sample data for demo (using your API response format)
  const getSampleData = () => {
    const sampleTrainings = [];
    
    const summaryData = {
      totalTrainings: 3,
      completed: 2,
      pending: 1,
      failed: 0,
    };
    
    const paginationData = {
      page: 1,
      limit: 10,
      total: 3,
      totalPages: 1,
      hasPrevPage: false,
      hasNextPage: false,
    };
    
    return {
      trainings: sampleTrainings,
      summary: summaryData,
      pagination: paginationData
    };
  };

  const groupTrainingsByDate = () => {
    const grouped = {};
    
    trainings.forEach(training => {
      const date = new Date(training.scheduleDate || training.createdAt);
      const dateKey = date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(training);
    });
    
    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      return new Date(b) - new Date(a);
    });
    
    // Convert to array for SectionList
    return sortedDates.map(date => ({
      title: date,
      data: grouped[date],
    }));
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrainingHistory();
  };

  const handleLoadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchTrainingHistory(true);
    }
  };

  useEffect(() => {
    fetchTrainingHistory();
  }, [filter]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Complete':
        return colors.success;
      case 'Confirm':
        return colors.info;
      case 'New':
        return colors.warning;
      case 'Reject':
      case 'Fail':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const getAttendanceColor = (attendance) => {
    switch (attendance) {
      case 'Present':
        return colors.success;
      case 'Absent':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Complete':
        return 'check-circle';
      case 'Confirm':
        return 'done-all';
      case 'New':
        return 'schedule';
      case 'Reject':
        return 'block';
      case 'Fail':
        return 'cancel';
      default:
        return 'help';
    }
  };

  const getTrainingTypeIcon = (type) => {
    switch (type) {
      case 1:
      case '1':
        return 'school'; // Classroom
      case 2:
      case '2':
        return 'computer'; // Online
      default:
        return 'business';
    }
  };

  const getTrainingTypeText = (type) => {
    switch (type) {
      case 1:
      case '1':
        return 'Classroom';
      case 2:
      case '2':
        return 'Online';
      default:
        return 'Training';
    }
  };

  const renderTrainingItem = ({ item }) => {
    const statusColor = getStatusColor(item.trainingScheduleStatus);
    const attendanceColor = getAttendanceColor(item.attendanceStatus);
    
    return (
      <TouchableOpacity
        style={clsx(
          styles.bgWhite,
          styles.p4,
          styles.roundedLg,
          styles.shadowSm,
          styles.mb3
        )}
        onPress={() => navigation.navigate('TrainingStatus', { trainingId: item._id })}
      >
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsStart, styles.mb2)}>
          <View style={clsx(styles.flex1)}>
            <Text style={clsx(styles.textBase, styles.fontBold, styles.textBlack, styles.mb1)}>
              {item.training?.subject || 'Training'}
            </Text>
            
            <View style={clsx(styles.flexRow, styles.itemsCenter, styles.mb1)}>
              <Icon 
                name="person" 
                size={14} 
                color={colors.textMuted} 
                style={clsx(styles.mr1)}
              />
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                {item.training?.fullName || 'Trainer not assigned'}
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Icon 
                name="location-on" 
                size={14} 
                color={colors.textMuted} 
                style={clsx(styles.mr1)}
              />
              <Text style={clsx(styles.textSm, styles.textMuted)}>
                {item.training?.location || 'Location not specified'}
              </Text>
            </View>
          </View>
          
          <View style={clsx(styles.itemsEnd)}>
            <View style={clsx(
              styles.px2,
              styles.py1,
              styles.roundedFull,
              styles.mb1,
              { backgroundColor: `${statusColor}20` }
            )}>
              <Text style={clsx(
                styles.textXs,
                styles.fontBold,
                { color: statusColor }
              )}>
                {item.trainingScheduleStatus}
              </Text>
            </View>
            
            {item.attendanceStatus && (
              <View style={clsx(
                styles.px2,
                styles.py1,
                styles.roundedFull,
                { backgroundColor: `${attendanceColor}20` }
              )}>
                <Text style={clsx(
                  styles.textXs,
                  styles.fontMedium,
                  { color: attendanceColor }
                )}>
                  {item.attendanceStatus}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={clsx(
          styles.pt3,
          styles.mt2,
          styles.borderTop,
          styles.borderGray200
        )}>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Icon 
                name={getTrainingTypeIcon(item.type || item.training?.type)} 
                size={14} 
                color={colors.textMuted} 
                style={clsx(styles.mr1)}
              />
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                {getTrainingTypeText(item.type || item.training?.type)}
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Icon name="event" size={14} color={colors.textMuted} style={clsx(styles.mr1)} />
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                {item.dateDisplay}
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Icon name="access-time" size={14} color={colors.textMuted} style={clsx(styles.mr1)} />
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                {item.timeDisplay}
              </Text>
            </View>
          </View>
          
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mt2)}>
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Icon name="timer" size={14} color={colors.textMuted} style={clsx(styles.mr1)} />
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                {item.duration || 'Duration not specified'}
              </Text>
            </View>
            
            <View style={clsx(styles.flexRow, styles.itemsCenter)}>
              <Icon name="people" size={14} color={colors.textMuted} style={clsx(styles.mr1)} />
              <Text style={clsx(styles.textXs, styles.textMuted)}>
                {item.training?.maxParticipant || 0} participants
              </Text>
            </View>
            
            <TouchableOpacity
              style={clsx(
                styles.px2,
                styles.py1,
                styles.bgPrimaryLight,
                styles.roundedFull
              )}
              onPress={() => navigation.navigate('TrainingDetails', { trainingId: item._id })}
            >
              <Text style={clsx(styles.textXs, styles.fontMedium, styles.textPrimary)}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Remarks if available */}
        {item.remarks && (
          <View style={clsx(
            styles.mt3,
            styles.p2,
            styles.bgGray100,
            styles.rounded
          )}>
            <Text style={clsx(styles.textXs, styles.textMuted)}>
              Remarks: {item.remarks}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={clsx(styles.mb3, styles.mt2)}>
      <Text style={clsx(styles.textBase, styles.fontBold, styles.textMuted)}>
        {title}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!pagination.hasNextPage) {
      if (trainings.length === 0) {
        return null;
      }
      return (
        <View style={clsx(styles.py4, styles.itemsCenter)}>
          <Text style={clsx(styles.textSm, styles.textMuted)}>
            No more trainings to load
          </Text>
        </View>
      );
    }

    if (loadingMore) {
      return (
        <View style={clsx(styles.py4, styles.itemsCenter)}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={clsx(styles.textSm, styles.textMuted, styles.mt2)}>
            Loading more...
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={clsx(
          styles.py3,
          styles.itemsCenter,
          styles.bgWhite,
          styles.roundedLg,
          styles.mt2,
          styles.shadowSm
        )}
        onPress={handleLoadMore}
      >
        <Text style={clsx(styles.textBase, styles.fontMedium, styles.textPrimary)}>
          Load More Trainings
        </Text>
        <Text style={clsx(styles.textXs, styles.textMuted, styles.mt1)}>
          Showing {trainings.length} of {pagination.total}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textMuted, styles.mt3)}>
          Loading training history...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Training History"
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={clsx(styles.px4, styles.pb6, styles.pt2)}
      >

        {/* Training Summary */}
        <View style={clsx(styles.mb6)}>
          <View style={clsx(styles.bgPrimary, styles.p4, styles.roundedLg, styles.shadowSm)}>
            <View style={clsx(styles.flexRow, styles.justifyBetween, styles.mb4)}>
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textWhite)}>
                  Total
                </Text>
                <Text style={clsx(styles.text3xl, styles.fontBold, styles.textWhite)}>
                  {summary.totalTrainings}
                </Text>
              </View>
              
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textWhite)}>
                  Completed
                </Text>
                <Text style={clsx(styles.text3xl, styles.fontBold, styles.textWhite)}>
                  {summary.completed}
                </Text>
              </View>
              
              <View style={clsx(styles.itemsCenter)}>
                <Text style={clsx(styles.textBase, styles.fontMedium, styles.textWhite)}>
                  Pending
                </Text>
                <Text style={clsx(styles.text3xl, styles.fontBold, styles.textWhite)}>
                  {summary.pending}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={clsx(styles.mb6)}>
          <View style={clsx(styles.bgWhite, styles.p4, styles.roundedLg, styles.shadowSm)}>
            <Text style={clsx(styles.textBase, styles.fontMedium, styles.textBlack, styles.mb3)}>
              Filter by Status
            </Text>
            
            <View style={clsx(styles.flexRow, styles.flexWrap)}>
              {[
                { key: 'all', label: 'All', icon: 'list' },
                { key: 'Complete', label: 'Completed', icon: 'check-circle' },
                { key: 'New', label: 'New', icon: 'schedule' },
                { key: 'Reject', label: 'Rejected', icon: 'block' },
                { key: 'Reschedule', label: 'Rescheduled', icon: 'block' },
                { key: 'Fail', label: 'Failed', icon: 'cancel' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={clsx(
                    styles.px3,
                    styles.py2,
                    styles.mr2,
                    styles.mb2,
                    styles.roundedFull,
                    filter === item.key ? styles.bgPrimary : styles.bgGray
                  )}
                  onPress={() => setFilter(item.key)}
                >
                  <View style={clsx(styles.flexRow, styles.itemsCenter)}>
                    <Icon 
                      name={item.icon} 
                      size={16} 
                      color={filter === item.key ? colors.white : colors.text}
                      style={clsx(styles.mr1)}
                    />
                    <Text style={clsx(
                      styles.textSm,
                      styles.fontMedium,
                      filter === item.key ? styles.textWhite : styles.textBlack
                    )}>
                      {item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Trainings List */}
        <View>
          <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter, styles.mb3)}>
            <Text style={clsx(styles.textLg, styles.fontBold, styles.textBlack)}>
              Training History ({pagination.total})
            </Text>
            <Text style={clsx(styles.textSm, styles.textMuted)}>
              Page {pagination.page} of {pagination.totalPages}
            </Text>
          </View>

          {trainings.length === 0 ? (
            <View style={clsx(styles.bgWhite, styles.p6, styles.roundedLg, styles.itemsCenter)}>
              <Icon name="school" size={48} color={colors.textMuted} />
              <Text style={clsx(styles.textBase, styles.fontMedium, styles.textMuted, styles.mt3, styles.mb-2)}>
                No training history found
              </Text>
              <Text style={clsx(styles.textSm, styles.textMuted, styles.textCenter)}>
                {filter !== 'all' ? `No ${filter} trainings` : 'No trainings found'}
              </Text>
              <TouchableOpacity
                style={clsx(styles.mt4, styles.px4, styles.py2, styles.bgPrimary, styles.roundedFull)}
                onPress={() => setFilter('all')}
              >
                <Text style={clsx(styles.textSm, styles.fontMedium, styles.textWhite)}>
                  Clear Filter
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <SectionList
                sections={groupTrainingsByDate()}
                keyExtractor={(item) => item._id}
                renderItem={renderTrainingItem}
                renderSectionHeader={renderSectionHeader}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={clsx(styles.pb2)}
              />
              
              {/* Load More Footer */}
              {renderFooter()}
            </>
          )}
        </View>

      </ScrollView>
    </View> 
  );
};

export default TrainingHistoryScreen;