import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:5000');
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Send message to server
  sendMessage(username, message) {
    if (this.socket) {
      this.socket.emit('send message', { username, message });
    }
  }

  // Get previous messages
  getMessages() {
    if (this.socket) {
      this.socket.emit('get messages');
    }
  }

  // Listen for events
  onPreviousMessages(callback) {
    if (this.socket) {
      this.socket.on('previous messages', callback);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new message', callback);
    }
  }

  onConnect(callback) {
    if (this.socket) {
      this.socket.on('connect', callback);
    }
  }

  onDisconnect(callback) {
    if (this.socket) {
      this.socket.on('disconnect', callback);
    }
  }

  // Send typing indicator
  sendTyping(username) {
    if (this.socket) {
      this.socket.emit('typing', { username });
    }
  }

  sendStopTyping(username) {
    if (this.socket) {
      this.socket.emit('stop typing', { username });
    }
  }

  // Listen for typing events
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user typing', callback);
    }
  }

  // Send typing indicator
  sendTyping(username) {
    if (this.socket) {
      this.socket.emit('typing', { username });
    }
  }

  sendStopTyping(username) {
    if (this.socket) {
      this.socket.emit('stop typing', { username });
    }
  }

  // Listen for typing events
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user typing', callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user stop typing', callback);
    }
  }

  // Remove event listeners
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

const socketService = new SocketService();
export default socketService;