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

    // Listen for booking updates - YAHI SE API CALL HOGA
    this.socket.on('bookingUpdated', (data) => {
      console.log('📢 Booking update received:', data);
      this.emit('bookingUpdate', data);
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
}

export default new SocketService();