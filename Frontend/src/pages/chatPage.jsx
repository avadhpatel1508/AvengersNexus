import React, { useEffect, useState } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatBox from '../components/ChatBox';
import { initializeSocket } from '../socket/socket';
import { useSelector } from 'react-redux';
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import {  X } from 'lucide-react';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to true for mobile group list
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  if (!user) {
    return (
      <motion.div
        className="min-h-screen bg-gray-900 text-white flex items-center justify-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center text-gray-300 text-xl bg-gray-800/80 p-6 rounded-xl border border-white/20">
          🔒 Please login to access the chat.
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

      {/* Mobile Sidebar Toggle Button (hidden when chat is open) */}
      <button
        onClick={toggleSidebar}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-full text-white ${
          selectedChat ? 'block' : 'hidden'
        }`}
      >
      
      </button>

      {/* Main Content */}
      <motion.div
        className="relative z-10 flex flex-col md:flex-row max-w-7xl mx-auto"
        style={{ minHeight: 'calc(100vh - 120px)', height: '100%' }} // Fixed height minus navbar (60px) and footer (60px)
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Sidebar */}
        <motion.div
          className={`md:w-1/4 w-full bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-lg shadow-lg border-r border-gray-700 z-40 ${
            isSidebarOpen ? 'block' : 'hidden md:block'
          }`}
          style={{ height: 'calc(100vh - 120px)', overflow: 'hidden' }} // Match chatbox height
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ChatSidebar
            user={user}
            selectedChat={selectedChat}
            setSelectedChat={(chat) => {
              setSelectedChat(chat);
              setIsSidebarOpen(false);
            }}
          />
        </motion.div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && !selectedChat && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* ChatBox */}
        <motion.div
          className={`md:w-3/4 w-full px-6 pt-2 pb-6 md:pb-6 ${!isSidebarOpen && selectedChat ? 'block' : 'hidden md:flex'}`} // Reduced pt-6 to pt-2 to minimize gap
          style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }} // Fixed height with auto overflow
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ChatBox
            socket={socket}
            selectedChat={selectedChat}
            user={user}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default ChatPage;