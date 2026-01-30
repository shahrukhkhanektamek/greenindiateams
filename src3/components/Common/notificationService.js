// services/notificationService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.unreadCount = 0;
  }

  // Initialize notification service
  async initialize() {
    await this.loadFromStorage();
    await this.setupPushNotifications();
  }

  // Load notifications from storage
  async loadFromStorage() {
    try {
      const data = await AsyncStorage.getItem('app_notifications');
      if (data) {
        const parsed = JSON.parse(data);
        this.notifications = parsed.notifications || [];
        this.unreadCount = parsed.unreadCount || 0;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  // Save to storage
  async saveToStorage() {
    try {
      await AsyncStorage.setItem('app_notifications', JSON.stringify({
        notifications: this.notifications,
        unreadCount: this.unreadCount,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Setup push notifications
  async setupPushNotifications() {
    if (Platform.OS === 'ios') {
      await this.requestIOSPermission();
    }

    // Get FCM token
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      // Send token to your backend
      await this.sendTokenToServer(token);
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }

    // Handle foreground messages
    this.unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message:', remoteMessage);
      this.handlePushNotification(remoteMessage);
    });

    // Handle background/quit state messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message:', remoteMessage);
      this.handlePushNotification(remoteMessage);
    });

    // Handle notification opened from quit state
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification opened from quit state:', remoteMessage);
        this.handlePushNotification(remoteMessage, true);
      }
    });
  }

  // Request iOS permission
  async requestIOSPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log('iOS Permission status:', enabled);
    return enabled;
  }

  // Send token to server
  async sendTokenToServer(token) {
    // Implement API call to send token to your backend
    console.log('Sending token to server:', token);
  }

  // Handle push notification
  handlePushNotification(remoteMessage, fromBackground = false) {
    const notification = remoteMessage.notification;
    const data = remoteMessage.data || {};

    const newNotification = {
      id: Date.now().toString(),
      title: notification?.title || data.title || 'Notification',
      message: notification?.body || data.message || '',
      type: data.type || 'info',
      time: 'Just now',
      isRead: false,
      data: data,
      fromPush: true
    };

    this.addNotification(newNotification);

    // If opened from background, trigger action
    if (fromBackground) {
      this.handleNotificationTap(newNotification);
    }
  }

  // Add notification
  addNotification(notification) {
    this.notifications.unshift(notification);
    if (!notification.isRead) {
      this.unreadCount++;
    }
    this.saveToStorage();
    this.notifyListeners();
  }

  // Mark as read
  markAsRead(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1 && !this.notifications[index].isRead) {
      this.notifications[index].isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  // Mark all as read
  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
    this.unreadCount = 0;
    this.saveToStorage();
    this.notifyListeners();
  }

  // Delete notification
  deleteNotification(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  // Clear all
  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
    this.saveToStorage();
    this.notifyListeners();
  }

  // Get notifications
  getNotifications() {
    return this.notifications;
  }

  // Get unread count
  getUnreadCount() {
    return this.unreadCount;
  }

  // Add listener
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        notifications: this.notifications,
        unreadCount: this.unreadCount
      });
    });
  }

  // Handle notification tap
  handleNotificationTap(notification) {
    // Implement navigation logic based on notification type
    console.log('Notification tapped:', notification);
    
    // Mark as read
    this.markAsRead(notification.id);
    
    // You can add navigation logic here
    // Example: navigation.navigate('BookingDetails', { id: notification.data.bookingId });
  }
}

export default new NotificationService();