// services/notificationService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import Sound from 'react-native-sound';

// Enable audio in silence mode
Sound.setCategory('Playback');

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.unreadCount = 0;
    this.isSoundEnabled = true;
    this.sounds = {};
    this.currentlyPlaying = null;
    this.initialized = false;
    
    // Sound types configuration
    this.soundTypes = {
      bookingOtherZone: 'bookingOtherZone',
      bookingSameZone: 'bookingSameZone',
      alert: 'alert',
      default: 'default'
    };
  }

  // ============ INITIALIZATION ============

  // Initialize notification service
  initialize = async () => {
    try {
      if (this.initialized) {
        console.log('Notification service already initialized');
        return;
      }

      console.log('Initializing notification service...');
      
      await this.loadFromStorage();
      await this.setupPushNotifications();
      await this.subscribeToTopic('serviceman');
      
      // Load sound preference
      const soundPref = await AsyncStorage.getItem('notification_sound_enabled');
      if (soundPref !== null) {
        this.isSoundEnabled = JSON.parse(soundPref);
      }
      
      // Initialize sounds
      this.initializeSounds();
      
      this.initialized = true;
      console.log('✅ Notification service initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
    }
  }

  // Initialize sounds based on platform
  initializeSounds = () => {
    console.log(`🎵 Initializing sounds for ${Platform.OS.toUpperCase()}...`);
    
    if (Platform.OS === 'android') {
      this.initializeAndroidSounds();
    } else {
      this.initializeIOSSounds();
    }
  }

  // Android sounds initialization
  initializeAndroidSounds = () => {
    console.log('🤖 Loading Android sounds...');
    
    const androidSoundConfig = {
      bookingOtherZone: 'other_zone',  // raw/other_zone (no extension)
      bookingSameZone: 'working_zone',        // raw/alert
      alert: 'alert',                  // raw/alert
      default: 'notification'               // raw/default 
    };

    Object.keys(androidSoundConfig).forEach(soundKey => {
      const rawFileName = androidSoundConfig[soundKey];
      
      console.log(`📁 Loading: ${rawFileName} -> ${soundKey}`);
      
      this.sounds[soundKey] = new Sound(
        rawFileName, 
        Sound.MAIN_BUNDLE, 
        (error) => {
          if (error) {
            console.error(`❌ Failed to load ${soundKey} (${rawFileName}):`, error.message);
            // Try to load default as fallback
            if (soundKey !== 'default') {
              setTimeout(() => this.loadAndroidFallback(soundKey), 100);
            }
          } else {
            console.log(`✅ ${soundKey} sound loaded successfully`);
            this.configureSound(soundKey);
          }
        }
      );
    });
  }

  // Load Android fallback sound
  loadAndroidFallback = (soundKey) => {
    console.log(`🔄 Loading fallback for ${soundKey}`);
    
    try {
      this.sounds[soundKey] = new Sound(
        'default',
        Sound.MAIN_BUNDLE,
        (error) => {
          if (error) {
            console.error(`❌ Fallback failed for ${soundKey}:`, error.message);
          } else {
            console.log(`✅ Fallback loaded for ${soundKey}`);
            this.configureSound(soundKey);
          }
        }
      );
    } catch (error) {
      console.error(`❌ Error loading fallback for ${soundKey}:`, error);
    }
  }

  // iOS sounds initialization
  initializeIOSSounds = () => {
    console.log('🍎 Loading iOS sounds...');
    
    try {
      // Try to load from assets folder
      const iosSoundConfig = {
        bookingOtherZone: require('../../assets/sounds/other_zone.wav'),
        bookingSameZone: require('../../assets/sounds/working_zone.wav'),
        alert: require('../../assets/sounds/alert.wav'),
        default: require('../../assets/sounds/notification.wav')
      };

      Object.keys(iosSoundConfig).forEach(soundKey => {
        const soundFile = iosSoundConfig[soundKey];
        
        console.log(`📁 Loading iOS sound: ${soundKey}`);
        
        this.sounds[soundKey] = new Sound(soundFile, (error) => {
          if (error) {
            console.error(`❌ Failed to load iOS ${soundKey}:`, error.message);
            // Try to load default as fallback
            if (soundKey !== 'default' && iosSoundConfig.default) {
              setTimeout(() => this.loadIOSFallback(soundKey), 100);
            }
          } else {
            console.log(`✅ iOS ${soundKey} sound loaded`);
            this.configureSound(soundKey);
          }
        });
      });
      
    } catch (error) {
      console.error('❌ Error loading iOS sounds:', error);
    }
  }

  // Load iOS fallback sound
  loadIOSFallback = (soundKey) => {
    console.log(`🔄 Loading iOS fallback for ${soundKey}`);
    
    try {
      const defaultSound = require('../../assets/sounds/notification.wav');
      this.sounds[soundKey] = new Sound(defaultSound, (error) => {
        if (error) {
          console.error(`❌ iOS fallback failed for ${soundKey}:`, error);
        } else {
          console.log(`✅ iOS fallback loaded for ${soundKey}`);
          this.configureSound(soundKey);
        }
      });
    } catch (error) {
      console.error(`❌ Error loading iOS fallback:`, error);
    }
  }

  // Configure sound properties
  configureSound = (soundKey) => {
    const sound = this.sounds[soundKey];
    if (sound) {
      try {
        // ALWAYS set volume to maximum (1.0)
        sound.setVolume(1.0);
        sound.setNumberOfLoops(0);
        
        // Force volume on Android (optional)
        if (Platform.OS === 'android') {
          // Some Android devices need additional volume control
          sound.setVolume(1.0, 1.0); // Left and right channels both max
        }
        
        console.log(`🔊 ${soundKey} volume set to MAX`);
      } catch (error) {
        console.error(`❌ Error configuring ${soundKey}:`, error);
      }
    }
  }

  // ============ SOUND PLAYBACK ============

  // Play notification sound
  playNotificationSound = (notificationType) => {
    try {
      if (!this.isSoundEnabled) {
        console.log('🔇 Sound is disabled');
        return;
      }

      console.log(`▶️ Playing sound for: ${notificationType}`);
      
      // Stop current sound if playing
      if (this.currentlyPlaying) {
        this.stopCurrentSound();
      }

      // Get sound key
      const soundKey = this.soundTypes[notificationType] || notificationType || 'default';
      console.log(`🔑 Sound key: ${soundKey}`);
      
      const sound = this.sounds[soundKey];
      
      if (!sound) {
        console.log(`❌ Sound not found: ${soundKey}`);
        // Try default sound
        if (soundKey !== 'default' && this.sounds.default) {
          console.log('🔄 Trying default sound...');
          this.playSound('default');
        }
        return;
      }

      // Play the sound
      this.playSound(soundKey);
      
    } catch (error) {
      console.error('❌ Error in playNotificationSound:', error);
    }
  }

  // Play specific sound
  playSound = (soundKey) => {
    const sound = this.sounds[soundKey];
    if (!sound) return;

    try {
      // AGAIN force volume to maximum before playing
      sound.setVolume(1.0);
      
      // For Android, also try setting system volume related properties
      if (Platform.OS === 'android') {
        sound.setVolume(1.0, 1.0); // Stereo channels both max
      }
      
      sound.setCurrentTime(0);
      sound.play((success) => {
        if (success) {
          console.log(`✅ ${soundKey} sound played at MAX volume`);
        } else {
          console.log(`❌ Failed to play ${soundKey} sound`);
          // Try to play default sound as fallback
          if (soundKey !== 'default' && this.sounds.default) {
            console.log('🔄 Trying default sound...');
            this.playSound('default');
          }
        }
        this.currentlyPlaying = null;
      });
      
      this.currentlyPlaying = sound;
      
      // For iOS, we might need to handle audio session
      if (Platform.OS === 'ios') {
        // iOS specific: Ensure audio plays even in silent mode
        Sound.setCategory('Playback', true); // mixWithOthers = true
        Sound.setMode('Default');
        Sound.setActive(true);
      }
      
    } catch (error) {
      console.error(`❌ Error playing ${soundKey}:`, error);
      this.currentlyPlaying = null;
    }
  }

  // Stop current sound
  stopCurrentSound = () => {
    if (this.currentlyPlaying) {
      try {
        this.currentlyPlaying.stop();
        this.currentlyPlaying.setCurrentTime(0);
        console.log('⏹️ Stopped current sound');
      } catch (error) {
        console.error('❌ Error stopping sound:', error);
      }
      this.currentlyPlaying = null;
    }
  }

  // Test specific sound
  testSound = (soundType = 'default') => {
    console.log(`🧪 Testing sound: ${soundType}`);
    this.playNotificationSound(soundType);
  }

  // ============ NOTIFICATION MANAGEMENT ============

  // Load notifications from storage
  loadFromStorage = async () => {
    try {
      const data = await AsyncStorage.getItem('app_notifications');
      if (data) {
        const parsed = JSON.parse(data);
        this.notifications = parsed.notifications || [];
        this.unreadCount = parsed.unreadCount || 0;
        this.notifyListeners();
        console.log(`📂 Loaded ${this.notifications.length} notifications from storage`);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    }
  }

  // Save to storage
  saveToStorage = async () => {
    try {
      await AsyncStorage.setItem('app_notifications', JSON.stringify({
        notifications: this.notifications,
        unreadCount: this.unreadCount,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('❌ Error saving notifications:', error);
    }
  }

  // Setup push notifications
  setupPushNotifications = async () => {
    try {
      if (Platform.OS === 'ios') {
        await this.requestIOSPermission();
      }

      // Get FCM token
      const token = await messaging().getToken();
      console.log('🔑 FCM Token:', token);
      await this.sendTokenToServer(token);

      // Handle foreground messages
      this.unsubscribeForeground = messaging().onMessage(async remoteMessage => {
        console.log('📱 Foreground message received');
        this.handlePushNotification(remoteMessage);
      });

      // Handle background/quit state messages
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('📱 Background message received');
        this.handlePushNotification(remoteMessage);
      });

      // Handle notification opened from quit state
      messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
          console.log('📱 Notification opened from quit state');
          this.handlePushNotification(remoteMessage, true);
        }
      });

      console.log('✅ Push notifications setup complete');

    } catch (error) {
      console.error('❌ Error setting up push notifications:', error);
    }
  }

  // Request iOS permission
  requestIOSPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log(`🍎 iOS Permission: ${enabled ? 'GRANTED ✅' : 'DENIED ❌'}`);
      return enabled;
    } catch (error) {
      console.error('❌ Error requesting iOS permission:', error);
      return false;
    }
  }

  // Send token to server
  sendTokenToServer = async (token) => {
    try {
      await AsyncStorage.setItem('fcm_token', token);
      console.log('💾 Token saved locally');
      
      // TODO: Implement your backend API call
      // await api.sendFCMToken(token);
      
    } catch (error) {
      console.error('❌ Error sending token:', error);
    }
  }

  // Subscribe to topic
  subscribeToTopic = async (topic) => {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`✅ Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`❌ Topic subscribe error:`, error);
    }
  }

  // Unsubscribe from topic
  unsubscribeFromTopic = async (topic) => {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`✅ Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`❌ Topic unsubscribe error:`, error);
    }
  }

  // Handle push notification
  handlePushNotification = (remoteMessage, fromBackground = false) => {
    try {
      const notification = remoteMessage.notification;
      const data = remoteMessage.data || {};

      const newNotification = {
        id: Date.now().toString(),
        title: notification?.title || data.title || 'Notification',
        message: notification?.body || data.message || '',
        type: data.type || 'alert',
        time: this.formatTime(new Date()),
        isRead: false,
        data: data,
        fromPush: true,
        timestamp: new Date().toISOString()
      };

      console.log(`📩 New push notification: ${newNotification.title}`);
      
      this.addNotification(newNotification);

      // Play sound if app is in foreground
      const shouldPlaySound = !fromBackground || Platform.OS === 'android';
      if (shouldPlaySound && this.isSoundEnabled) {
        this.playNotificationSound(newNotification.type);
      }

      // If opened from background, trigger action
      if (fromBackground) {
        this.handleNotificationTap(newNotification);
      }
    } catch (error) {
      console.error('❌ Error handling push notification:', error);
    }
  }

  // Add notification
  addNotification = (notification, playSound = true) => {
    this.notifications.unshift(notification);
    
    if (!notification.isRead) {
      this.unreadCount++;
    }
    
    this.saveToStorage();
    this.notifyListeners();
    
    console.log(`📝 Added notification: ${notification.title}`);
    
    if (playSound && this.isSoundEnabled && !notification.fromPush) {
      setTimeout(() => {
        this.playNotificationSound(notification.type);
      }, 100);
    }
  }

  // Add custom notification
  addLocalNotification = (title, message, type = 'alert', data = {}, playSound = true) => {
    const newNotification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      time: this.formatTime(new Date()),
      isRead: false,
      data,
      fromPush: false,
      timestamp: new Date().toISOString()
    };
    
    this.addNotification(newNotification, playSound);
  }

  // ============ NOTIFICATION TYPES ============

  showBookingNotificationOtherZone = (bookingData) => {
    this.addLocalNotification(
      bookingData.title || 'New Booking - Other Zone',
      bookingData.message || `New booking from ${bookingData.customerName || 'Customer'}`,
      'bookingOtherZone',
      bookingData
    );
  }

  showBookingNotificationSameZone = (bookingData) => {
    this.addLocalNotification(
      bookingData.title || 'New Booking - Same Zone',
      bookingData.message || `New booking from ${bookingData.customerName || 'Customer'}`,
      'bookingSameZone',
      bookingData
    );
  }

  showAlertNotification = (alertData) => {
    this.addLocalNotification(
      alertData.title || 'Alert',
      alertData.message || 'Important notification',
      'alert',
      alertData
    );
  }

  showDefaultNotification = (title, message, data = {}) => {
    this.addLocalNotification(
      title,
      message,
      'default',
      data
    );
  }

  // ============ NOTIFICATION OPERATIONS ============

  // Mark as read
  markAsRead = (id) => {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1 && !this.notifications[index].isRead) {
      this.notifications[index].isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.saveToStorage();
      this.notifyListeners();
      console.log(`✅ Marked notification as read: ${id}`);
    }
  }

  // Mark all as read
  markAllAsRead = () => {
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
    this.unreadCount = 0;
    this.saveToStorage();
    this.notifyListeners();
    console.log('✅ Marked all notifications as read');
  }

  // Delete notification
  deleteNotification = (id) => {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveToStorage();
    this.notifyListeners();
    console.log(`🗑️ Deleted notification: ${id}`);
  }

  // Clear all
  clearAll = () => {
    this.notifications = [];
    this.unreadCount = 0;
    this.saveToStorage();
    this.notifyListeners();
    console.log('🗑️ Cleared all notifications');
  }

  // Get notifications
  getNotifications = () => {
    return this.notifications;
  }

  // Get unread count
  getUnreadCount = () => {
    return this.unreadCount;
  }

  // ============ LISTENERS ============

  // Add listener
  addListener = (callback) => {
    this.listeners.push(callback);
    
    // Immediately notify with current state
    callback({
      notifications: this.notifications,
      unreadCount: this.unreadCount
    });
    
    console.log(`👂 Added listener, total: ${this.listeners.length}`);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
      console.log(`👂 Removed listener, remaining: ${this.listeners.length}`);
    };
  }

  // Notify listeners
  notifyListeners = () => {
    this.listeners.forEach(callback => {
      try {
        callback({
          notifications: this.notifications,
          unreadCount: this.unreadCount
        });
      } catch (error) {
        console.error('❌ Error notifying listener:', error);
      }
    });
  }

  // Handle notification tap
  handleNotificationTap = (notification) => {
    console.log('👆 Notification tapped:', notification.title);
    
    // Mark as read
    this.markAsRead(notification.id);
    
    // TODO: Add navigation logic
    // Example: navigation.navigate('BookingDetails', { id: notification.data.id });
  }

  // ============ SOUND CONTROLS ============

  // Toggle sound on/off
  toggleSound = async (enabled) => {
    this.isSoundEnabled = enabled;
    await AsyncStorage.setItem('notification_sound_enabled', JSON.stringify(enabled));
    
    if (!enabled && this.currentlyPlaying) {
      this.stopCurrentSound();
    }
    
    console.log(`🔊 Sound ${enabled ? 'ENABLED ✅' : 'DISABLED 🔇'}`);
    return enabled;
  }

  // Get sound status
  getSoundStatus = () => {
    const loadedSounds = {};
    Object.keys(this.sounds).forEach(key => {
      loadedSounds[key] = !!this.sounds[key];
    });
    
    return {
      isEnabled: this.isSoundEnabled,
      isInitialized: this.initialized,
      platform: Platform.OS,
      soundTypes: this.soundTypes,
      loadedSounds: loadedSounds,
      totalSounds: Object.keys(this.sounds).length
    };
  }

  // Test notification
  testNotification = (type = 'default') => {
    this.addLocalNotification(
      'Test Notification',
      `This is a test notification of type: ${type}`,
      type,
      { 
        test: true,
        timestamp: new Date().toISOString(),
        randomId: Math.random().toString(36).substring(7)
      }
    );
  }

  // ============ UTILITIES ============

  // Format time for display
  formatTime = (date) => {
    if (!date) return 'Just now';
    
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return new Date(date).toLocaleDateString();
  }

  // Get service status
  getStatus = () => {
    return {
      initialized: this.initialized,
      notificationsCount: this.notifications.length,
      unreadCount: this.unreadCount,
      listenersCount: this.listeners.length,
      soundEnabled: this.isSoundEnabled,
      platform: Platform.OS
    };
  }

  // ============ CLEANUP ============

  // Cleanup sounds
  cleanupSounds = () => {
    this.stopCurrentSound();
    
    // Release all sounds
    Object.values(this.sounds).forEach(sound => {
      if (sound && typeof sound.release === 'function') {
        try {
          sound.release();
          console.log('🔇 Released sound');
        } catch (error) {
          console.error('❌ Error releasing sound:', error);
        }
      }
    });
    
    this.sounds = {};
    console.log('🧹 Sounds cleaned up');
  }

  // Complete cleanup
  cleanup = () => {
    this.cleanupSounds();
    
    // Unsubscribe from push notifications
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
      console.log('🔌 Unsubscribed from foreground messages');
    }
    
    this.listeners = [];
    this.initialized = false;
    console.log('🧹 Notification service cleaned up');
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();
export default notificationService;