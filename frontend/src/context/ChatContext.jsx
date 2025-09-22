import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const setAllMessages = (messages) => {
    setMessages(messages);
  };

  const loginUser = (username) => {
    setUser(username);
  };

  const logoutUser = () => {
    setUser(null);
    setMessages([]);
    setIsConnected(false);
  };

  const value = {
    user,
    messages,
    isConnected,
    setIsConnected,
    addMessage,
    setAllMessages,
    loginUser,
    logoutUser
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};