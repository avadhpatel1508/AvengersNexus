import React, { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../pages/Loader';

const ChatSidebar = ({ user, setSelectedChat, selectedChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axiosClient.get('/chat/groups');
        setChats(res.data.chats || []);
        if (!res.data.chats || res.data.chats.length === 0) {
          setError('No chats available');
        }
      } catch (err) {
        console.error('❌ Failed to fetch chats', err);
        setError('Failed to load chats');
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      className="w-full h-full p-4 bg-gradient-to-br from-slate-800/60 via-black to-slate-800/60 backdrop-blur-xl border-r border-white/20 shadow-2xl rounded-r-xl overflow-y-auto relative"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
      style={{ maxHeight: 'calc(100vh - 120px)' }}
    >
      {/* Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-blue-950 opacity-50"></div>
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent tracking-wide">
          💬 Chats
        </h2>

        {error ? (
          <motion.p
            className="text-gray-400 text-md"
            variants={itemVariants}
            initial="hidden"
            animate={!loading ? 'visible' : 'hidden'}
          >
            {error}
          </motion.p>
        ) : (
          <motion.ul
            className="space-y-2"
            variants={containerVariants}
            initial="hidden"
            animate={!loading ? 'visible' : 'hidden'}
          >
            {chats.map((chat) => (
              <motion.li
                layout
                key={chat._id}
                title={`Mission at ${chat.mission?.Location || 'Unknown'}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedChat(chat)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedChat(chat)}
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotateY: 2, rotateX: 1 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg cursor-pointer outline-none transition-all duration-200 ease-in-out perspective-1000 ${
                  selectedChat?._id === chat._id
                    ? 'bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-white/30'
                    : 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/20 hover:bg-slate-700/80'
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="font-semibold text-base text-white">{chat.groupName}</div>
                <div className="text-xs text-gray-400 italic truncate">
                  {chat.mission?.Location || 'No location'}
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>

      <style jsx>{`
        @keyframes spin-very-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </motion.div>
  );
};

export default ChatSidebar;