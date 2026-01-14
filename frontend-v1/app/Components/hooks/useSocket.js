import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

export function useSocket() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      console.log(message)
      setMessages((prev) => [...prev, message]);
    });
   
    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const sendMessage = (message) => {
    socket.emit('sendMessage', message);
  };

  return { messages, sendMessage };
}
