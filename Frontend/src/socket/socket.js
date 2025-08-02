import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000', {
      withCredentials: true,
      transports: ['websocket'], // ✅ Force WebSocket
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
  }
};

export const getSocket = () => {
  if (!socket) {
    console.warn('⚠️ getSocket called before initialization');
  }
  return socket;
};

export const resetSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔄 Socket reset');
  }
};
