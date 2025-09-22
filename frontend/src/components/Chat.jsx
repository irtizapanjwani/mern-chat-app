import { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import socketService from '../services/socketService';

const Chat = () => {
  const { user, messages, addMessage, setAllMessages, logoutUser } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log('Connecting to socket...');
    
    // Connect to socket
    const socket = socketService.connect();
    
    // Check connection immediately
    if (socket.connected) {
      console.log('Already connected!');
      setIsConnected(true);
      socketService.getMessages();
    }

    // Set up event listeners
    socketService.onConnect(() => {
      console.log('Socket connected!');
      setIsConnected(true);
      socketService.getMessages(); // Get previous messages
      
      // Test if socket is working by sending a test event
      console.log('Testing socket connection...');
    });

    socketService.onPreviousMessages((previousMessages) => {
      console.log('Received previous messages:', previousMessages);
      setAllMessages(previousMessages);
    });

    socketService.onNewMessage((message) => {
      console.log('Received new message:', message);
      addMessage(message);
    });

    socketService.onDisconnect(() => {
      console.log('Socket disconnected!');
      setIsConnected(false);
    });

    // Listen for typing events
    socketService.onUserTyping((data) => {
      if (data.username !== user) {
        setTypingUsers(prev => 
          prev.includes(data.username) ? prev : [...prev, data.username]
        );
      }
    });

    socketService.onUserStopTyping((data) => {
      setTypingUsers(prev => prev.filter(username => username !== data.username));
    });

    // Cleanup on unmount
    return () => {
      socketService.off('connect');
      socketService.off('previous messages');
      socketService.off('new message');
      socketService.off('disconnect');
      socketService.off('user typing');
      socketService.off('user stop typing');
    };
  }, [user]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      socketService.sendTyping(user);
    }
    
    // Clear typing indicator after 1 second of no typing
    clearTimeout(window.typingTimer);
    window.typingTimer = setTimeout(() => {
      setIsTyping(false);
      socketService.sendStopTyping(user);
    }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    console.log('Trying to send message:', newMessage);
    console.log('Is connected:', isConnected);
    console.log('User:', user);
    console.log('Current messages count:', messages.length);
    
    if (newMessage.trim() && isConnected) {
      // Stop typing when sending message
      setIsTyping(false);
      socketService.sendStopTyping(user);
      clearTimeout(window.typingTimer);
      
      console.log('Sending message via socket:', { user, message: newMessage.trim() });
      socketService.sendMessage(user, newMessage.trim());
      setNewMessage('');
      console.log('Message sent via socket!');
    } else {
      console.log('Cannot send message - not connected or empty message');
    }
  };

  const handleLogout = () => {
    socketService.disconnect();
    logoutUser();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <h1 className="text-2xl font-bold text-gray-800">Chat Room</h1>
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, <strong>{user}</strong></span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-140px)] flex flex-col">
        <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 mb-4 overflow-hidden flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <p className="text-lg">No messages yet...</p>
                <p className="text-sm">Be the first to say hello! 👋</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.username === user ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.username === user
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.username !== user && (
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        {message.username}
                      </div>
                    )}
                    <div className="break-words">{message.message}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.username === user ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl max-w-xs">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">
                      {typingUsers.length === 1 
                        ? `${typingUsers[0]} is typing` 
                        : `${typingUsers.join(', ')} are typing`
                      }...
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 bg-white"
            disabled={!isConnected}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;