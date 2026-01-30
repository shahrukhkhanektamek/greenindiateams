import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppContext } from '../../../Context/AppContext';
import { colors } from '../../../styles/colors';
import styles, { clsx } from '../../../styles/globalStyles';
import Header from '../../../components/Common/Header';
import notificationService from '../../../components/Common/notificationService';

const NotificationScreen = ({ navigation }) => {
  const { user, Toast } = useContext(AppContext);
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Notification types configuration
  const notificationTypes = {
    info: { icon: 'info', color: colors.info, bgColor: `${colors.info}15` },
    success: { icon: 'check-circle', color: colors.success, bgColor: `${colors.success}15` },
    warning: { icon: 'warning', color: colors.warning, bgColor: `${colors.warning}15` },
    error: { icon: 'error', color: colors.error, bgColor: `${colors.error}15` },
    system: { icon: 'notifications', color: colors.primary, bgColor: `${colors.primary}15` },
    booking: { icon: 'calendar-today', color: colors.secondary, bgColor: `${colors.secondary}15` },
    payment: { icon: 'payment', color: colors.success, bgColor: `${colors.success}15` },
    message: { icon: 'message', color: colors.info, bgColor: `${colors.info}15` },
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Load from service
      const serviceNotifications = notificationService.getNotifications();
      const serviceUnreadCount = notificationService.getUnreadCount();
      
      setNotifications(serviceNotifications);
      setUnreadCount(serviceUnreadCount);
      
      // If no notifications in service, show sample data
      if (serviceNotifications.length === 0) {
        const sampleNotifications = generateSampleNotifications();
        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Show sample data on error
      const sampleNotifications = generateSampleNotifications();
      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter(n => !n.isRead).length);
    } finally {
      setLoading(false);
    }
  };

  // Generate sample notifications
  const generateSampleNotifications = () => {
    return [
      {
        id: '1',
        title: 'Welcome to Delivery App! 🎉',
        message: 'Complete your profile setup to start accepting delivery requests.',
        type: 'info',
        time: '2 hours ago',
        isRead: true,
        data: { action: 'complete_profile' }
      },
      {
        id: '2',
        title: 'New Booking Available 📦',
        message: 'A new delivery request is available in your area. Tap to view details.',
        type: 'booking',
        time: '30 minutes ago',
        isRead: false,
        data: { 
          bookingId: 'ORD-2024-00123',
          pickup: 'Mumbai Central',
          drop: 'Andheri West',
          amount: '₹250'
        }
      },
      {
        id: '3',
        title: 'Payment Received 💰',
        message: '₹1,250 has been credited to your wallet for completed deliveries.',
        type: 'payment',
        time: '2 hours ago',
        isRead: false,
        data: { amount: 1250, transactionId: 'TXN-789456' }
      },
      {
        id: '4',
        title: 'Account Verification Required',
        message: 'Please upload your driving license for verification.',
        type: 'warning',
        time: '1 day ago',
        isRead: true,
        data: { document: 'driving_license' }
      },
      {
        id: '5',
        title: 'System Maintenance',
        message: 'App will be under maintenance tonight from 2 AM to 4 AM.',
        type: 'system',
        time: '2 days ago',
        isRead: true,
        data: { maintenanceTime: '2 AM - 4 AM' }
      },
      {
        id: '6',
        title: 'Rating Received ⭐',
        message: 'Customer John D. gave you 5 stars for your delivery service.',
        type: 'success',
        time: '3 days ago',
        isRead: true,
        data: { rating: 5, customer: 'John D.' }
      },
      {
        id: '7',
        title: 'Weekly Performance',
        message: 'You completed 15 deliveries this week. Great job!',
        type: 'info',
        time: '1 week ago',
        isRead: true,
        data: { deliveries: 15, week: '15-21 Jan' }
      },
    ];
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications().finally(() => {
      setRefreshing(false);
      Toast.show({
        type: 'success',
        text1: 'Refreshed',
        text2: 'Notifications updated',
      });
    });
  };

  // Handle notification press
  const handleNotificationPress = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Show detail modal
    setSelectedNotification(notification);
    setDetailModalVisible(true);
  };

  // Mark as read
  const markAsRead = (id) => {
    notificationService.markAsRead(id);
    const updatedNotifications = notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          style: 'destructive',
          onPress: () => {
            notificationService.markAllAsRead();
            const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
            setNotifications(updatedNotifications);
            setUnreadCount(0);
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'All notifications marked as read',
            });
          }
        }
      ]
    );
  };

  // Delete notification
  const deleteNotification = (id) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            notificationService.deleteNotification(id);
            const updatedNotifications = notifications.filter(n => n.id !== id);
            setNotifications(updatedNotifications);
            
            // Update unread count
            const deleted = notifications.find(n => n.id === id);
            if (deleted && !deleted.isRead) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
            
            Toast.show({
              type: 'success',
              text1: 'Deleted',
              text2: 'Notification removed',
            });
          }
        }
      ]
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            notificationService.clearAll();
            setNotifications([]);
            setUnreadCount(0);
            Toast.show({
              type: 'success',
              text1: 'Cleared',
              text2: 'All notifications removed',
            });
          }
        }
      ]
    );
  };

  // Format time
  const formatTime = (timeString) => {
    return timeString;
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    return notificationTypes[type] || notificationTypes.info;
  };

  // Render notification item
  const renderNotificationItem = ({ item }) => {
    const typeConfig = getNotificationIcon(item.type);
    
    return (
      <TouchableOpacity
        style={[
          localStyles.notificationItem,
          !item.isRead && localStyles.unreadItem,
          { backgroundColor: typeConfig.bgColor }
        ]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => deleteNotification(item.id)}
        activeOpacity={0.7}
      >
        <View style={localStyles.notificationLeft}>
          <View style={[localStyles.iconContainer, { backgroundColor: typeConfig.color + '30' }]}>
            <Icon name={typeConfig.icon} size={24} color={typeConfig.color} />
          </View>
          
          {!item.isRead && (
            <View style={localStyles.unreadDot}>
              <Icon name="circle" size={8} color={typeConfig.color} />
            </View>
          )}
        </View>

        <View style={localStyles.notificationContent}>
          <Text style={localStyles.notificationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={localStyles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={localStyles.notificationTime}>
            {formatTime(item.time)}
          </Text>
        </View>

        <TouchableOpacity
          style={localStyles.deleteButton}
          onPress={() => deleteNotification(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close" size={18} color={colors.gray400} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={localStyles.emptyContainer}>
      <Icon name="notifications-off" size={80} color={colors.gray300} />
      <Text style={localStyles.emptyTitle}>No Notifications Yet</Text>
      <Text style={localStyles.emptyMessage}>
        You're all caught up! When you get notifications, they'll appear here.
      </Text>
      <TouchableOpacity
        style={localStyles.refreshButton}
        onPress={onRefresh}
      >
        <Icon name="refresh" size={20} color={colors.primary} />
        <Text style={localStyles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  // Render header actions
  const renderHeaderActions = () => (
    <View style={localStyles.headerActions}>
      {unreadCount > 0 && (
        <TouchableOpacity
          style={localStyles.headerActionButton}
          onPress={markAllAsRead}
        >
          <Icon name="drafts" size={22} color={colors.primary} />
          <Text style={localStyles.headerActionText}>Mark all read</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={localStyles.headerActionButton}
        onPress={clearAllNotifications}
      >
        <Icon name="delete-sweep" size={22} color={colors.error} />
        <Text style={localStyles.headerActionText}>Clear all</Text>
      </TouchableOpacity>
    </View>
  );

  // Initialize
  useEffect(() => {
    loadNotifications();
    
    // Subscribe to notification service
    const unsubscribe = notificationService.addListener((data) => {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    });
    
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={clsx(styles.flex1, styles.bgSurface, styles.justifyCenter, styles.itemsCenter)}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={clsx(styles.textBase, styles.textBlack, styles.mt4)}>
          Loading notifications...
        </Text>
      </View>
    );
  }

  return (
    <View style={clsx(styles.flex1, styles.bgSurface)}>
      <Header
        title="Notifications"
        showBack
        showNotification={false}
        type="white"
        rightAction={false}
        showProfile={false}
      />
      
      {/* Header Stats */}
      <View style={localStyles.headerStats}>
        <View style={localStyles.statItem}>
          <Text style={localStyles.statValue}>{notifications.length}</Text>
          <Text style={localStyles.statLabel}>Total</Text>
        </View>
        <View style={localStyles.statDivider} />
        <View style={localStyles.statItem}>
          <Text style={[localStyles.statValue, { color: colors.primary }]}>{unreadCount}</Text>
          <Text style={localStyles.statLabel}>Unread</Text>
        </View>
        <View style={localStyles.statDivider} />
        <View style={localStyles.statItem}>
          <Text style={localStyles.statValue}>
            {notifications.length > 0 
              ? Math.round((unreadCount / notifications.length) * 100) 
              : 0}%
          </Text>
          <Text style={localStyles.statLabel}>Unread %</Text>
        </View>
      </View>
      
      {/* Header Actions */}
      {renderHeaderActions()}
      
      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
      
      {/* Notification Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContainer}>
            {selectedNotification && (
              <>
                <View style={localStyles.modalHeader}>
                  <View style={localStyles.modalIconContainer}>
                    <Icon
                      name={getNotificationIcon(selectedNotification.type).icon}
                      size={30}
                      color={getNotificationIcon(selectedNotification.type).color}
                    />
                  </View>
                  <View style={localStyles.modalTitleContainer}>
                    <Text style={localStyles.modalTitle}>{selectedNotification.title}</Text>
                    <Text style={localStyles.modalTime}>{selectedNotification.time}</Text>
                  </View>
                  <TouchableOpacity
                    style={localStyles.modalCloseButton}
                    onPress={() => setDetailModalVisible(false)}
                  >
                    <Icon name="close" size={24} color={colors.textDark} />
                  </TouchableOpacity>
                </View>
                
                <View style={localStyles.modalContent}>
                  <Text style={localStyles.modalMessage}>{selectedNotification.message}</Text>
                  
                  {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
                    <View style={localStyles.dataContainer}>
                      <Text style={localStyles.dataTitle}>Details:</Text>
                      {Object.entries(selectedNotification.data).map(([key, value]) => (
                        <View key={key} style={localStyles.dataRow}>
                          <Text style={localStyles.dataKey}>{key.replace(/_/g, ' ')}:</Text>
                          <Text style={localStyles.dataValue}>{String(value)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                
                <View style={localStyles.modalFooter}>
                  {selectedNotification.type === 'booking' && (
                    <TouchableOpacity
                      style={[localStyles.modalButton, localStyles.primaryButton]}
                      onPress={() => {
                        setDetailModalVisible(false);
                        // navigation.navigate('BookingDetails', { id: selectedNotification.data.bookingId });
                        Toast.show({
                          type: 'info',
                          text1: 'Redirecting to booking...'
                        });
                      }}
                    >
                      <Text style={localStyles.modalButtonText}>View Booking Details</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={localStyles.modalButton}
                    onPress={() => setDetailModalVisible(false)}
                  >
                    <Text style={[localStyles.modalButtonText, { color: colors.textDark }]}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const localStyles = StyleSheet.create({
  // Header Stats
  headerStats: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray200,
    height: '80%',
    alignSelf: 'center',
  },
  
  // Header Actions
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerActionText: {
    fontSize: 12,
    color: colors.textDark,
    marginLeft: 5,
    fontWeight: '500',
  },
  
  // List Container
  listContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: 30,
  },
  
  // Notification Item
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationLeft: {
    position: 'relative',
    marginRight: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.gray400,
  },
  deleteButton: {
    padding: 4,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  modalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  modalTime: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 24,
    marginBottom: 20,
  },
  dataContainer: {
    backgroundColor: colors.gray50,
    borderRadius: 8,
    padding: 15,
  },
  dataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 10,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  dataKey: {
    fontSize: 14,
    color: colors.textLight,
    textTransform: 'capitalize',
  },
  dataValue: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '500',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default NotificationScreen;