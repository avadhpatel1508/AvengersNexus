import React, { useEffect, useState } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatBox from '../components/ChatBox';
import { initializeSocket } from '../socket/socket';
import { useSelector } from 'react-redux';
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    const socketInstance = initializeSocket();
    setSocket(socketInstance);
    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && selectedChat?._id) {
      socket.emit('joinMissionRoom', selectedChat._id);
    }
  }, [socket, selectedChat]);

  if (!user) {
    return (
      <div className="text-center text-white py-10">
        🔒 Please login to access the chat.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-blue-950"></div>
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dc2626" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            <rect width="100" height="100" fill="url(#heroGrad)" />
          </svg>
        </div>

        <motion.div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, rgba(37, 99, 235, 0.06) 50%, transparent 70%)',
          }}
          transition={{ type: 'spring', stiffness: 20, damping: 30 }}
        />

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
          <div className="w-[60vw] max-w-[350px] h-[60vw] max-h-[350px] border-8 border-white rounded-full flex items-center justify-center animate-spin-very-slow">
            <div className="w-64 h-64 border-8 border-red-500 rounded-full flex items-center justify-center">
              <div className="w-32 h-32 border-8 border-blue-500 rounded-full flex items-center justify-center">
                <div className="text-4xl sm:text-6xl text-white">★</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-screen px-4 sm:px-6 py-10 gap-6 max-w-7xl mx-auto">
        <ChatSidebar
          user={user}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />
        <ChatBox
          socket={socket}
          selectedChat={selectedChat}
          user={user}
        />
      </div>

      <Footer />

      <style jsx>{`
        @keyframes spin-very-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-very-slow {
          animation: spin-very-slow 60s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
