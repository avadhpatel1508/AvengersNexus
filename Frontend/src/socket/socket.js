import { io } from 'socket.io-client';

let socket;

export const initializeSocket = (token) => {
  if (!socket) {
    socket = io('http://localhost:4000', {
      auth: { token },
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
  }
};

export const getSocket = () => socket;
