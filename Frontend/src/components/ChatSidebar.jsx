import React, { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';

const ChatSidebar = ({ user, setSelectedChat, selectedChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axiosClient.get('/chat/groups');
        setChats(res.data.chats || []);
      } catch (err) {
        console.error('❌ Failed to fetch chats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
      className="w-full md:w-1/4 border-r border-white/10 overflow-y-auto p-4 bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl border border-purple-600 rounded-r-xl"
    >
      <h2 className="text-xl font-bold mb-6 text-white tracking-wide">💬 Chats</h2>

      {loading ? (
        <p className="text-gray-400 animate-pulse">Loading chats...</p>
      ) : chats.length === 0 ? (
        <p className="text-gray-400">No chats available</p>
      ) : (
        <ul className="space-y-3">
          {chats.map((chat) => (
            <motion.li
              layout
              key={chat._id}
              title={`Mission at ${chat.mission?.Location || 'Unknown'}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedChat(chat)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedChat(chat)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`p-4 rounded-xl shadow-md cursor-pointer outline-none transition-all duration-200 ease-in-out text-white ${
                selectedChat?._id === chat._id
                ? 'bg-purple-700 border border-purple-400'
                : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
              }`}
            >
              <div className="font-semibold text-lg">{chat.groupName}</div>
              <div className="text-sm text-gray-300 italic">
                {chat.mission?.Location || 'No location'}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default ChatSidebar;
