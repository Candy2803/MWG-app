import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const ChatContext = createContext();

export const useChat = () => {
  return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('https://welfare-api-kappa.vercel.app');

    socket.current.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const sendMessage = (message) => {
    socket.current.emit('sendMessage', message);
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};