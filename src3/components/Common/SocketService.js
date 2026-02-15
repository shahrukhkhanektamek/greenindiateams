import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connected = false;
  }

  // Connect to server
  connect(serverUrl = '') {
    if (this.socket) return;

    this.socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.connected = true;
      this.emit('connectionStatus', { connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.connected = false;
      this.emit('connectionStatus', { connected: false });
    });

    // Listen for booking updates
    this.socket.on('bookingUpdated', (data) => {
      console.log('📢 Booking update received:', data);
      this.emit('bookingUpdate', data);
    });

    // NEW: Listen for booking list updates - API CALL YAHAN SE HOGA
    this.socket.on('bookingUpdatedList', (data) => {
      console.log('📋 Booking list update received:', data);
      this.emit('bookingUpdatedList', data);
      
      // Agar specific action ho toh alag se emit karo
      if (data.action === 'new') {
        this.emit('newBookingAdded', data.booking);
      } else if (data.action === 'update') {
        this.emit('bookingListItemUpdated', data.booking);
      } else if (data.action === 'delete') {
        this.emit('bookingRemoved', data.bookingId);
      }
    });

    // NEW: Listen for bulk booking updates
    this.socket.on('bookingsBulkUpdated', (data) => {
      console.log('📦 Bulk booking update received:', data);
      this.emit('bookingsBulkUpdate', data);
    });
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  // Emit internal events
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  // Send update from app (optional)
  sendUpdate(bookingId, status, message = '') {
    if (!this.socket?.connected) return false;
    this.socket.emit('updateBooking', { bookingId, status, message });
    return true;
  }

  // NEW: Request booking list
  requestBookingList(filters = {}) {
    if (!this.socket?.connected) return false;
    this.socket.emit('requestBookingList', filters);
    return true;
  }

  // NEW: Send booking list update
  sendBookingListUpdate(action, data) {
    if (!this.socket?.connected) return false;
    this.socket.emit('updateBookingList', { action, data });
    return true;
  }

  // NEW: Add new booking to list
  addNewBooking(bookingData) {
    if (!this.socket?.connected) return false;
    this.socket.emit('addBookingToList', bookingData);
    return true;
  }

  // NEW: Remove booking from list
  removeBookingFromList(bookingId) {
    if (!this.socket?.connected) return false;
    this.socket.emit('removeBookingFromList', { bookingId });
    return true;
  }

  // NEW: Request specific booking details
  requestBookingDetails(bookingId) {
    if (!this.socket?.connected) return false;
    this.socket.emit('requestBookingDetails', { bookingId });
    return true;
  }

  // NEW: Listen for specific booking details
  onBookingDetails(callback) {
    this.socket?.on('bookingDetails', (data) => {
      console.log('📄 Booking details received:', data);
      callback(data);
    });
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      this.connected = false;
    }
  }

  // Check connection
  isConnected() {
    return this.connected;
  }

  // NEW: Get socket ID
  getSocketId() {
    return this.socket?.id;
  }

  // NEW: Join booking room
  joinBookingRoom(bookingId) {
    if (!this.socket?.connected) return false;
    this.socket.emit('joinBookingRoom', { bookingId });
    return true;
  }

  // NEW: Leave booking room
  leaveBookingRoom(bookingId) {
    if (!this.socket?.connected) return false;
    this.socket.emit('leaveBookingRoom', { bookingId });
    return true;
  }
}

export default new SocketService();