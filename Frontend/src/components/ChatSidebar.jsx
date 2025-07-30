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
    <motion.div className="w-1/4 border-r border-white/10 overflow-y-auto p-4 bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-white">Chats</h2>

      {loading ? (
        <p className="text-gray-400">Loading chats...</p>
      ) : chats.length === 0 ? (
        <p className="text-gray-400">No chats available</p>
      ) : (
        <ul className="space-y-3">
          {chats.map((chat) => (
            <li
              key={chat._id}
              title={`Mission at ${chat.mission?.Location || 'Unknown'}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedChat(chat)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedChat(chat)}
              className={`p-3 rounded-lg cursor-pointer transition-colors outline-none ${
                selectedChat?._id === chat._id
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <div className="font-medium">{chat.groupName}</div>
              <div className="text-sm text-gray-300">
                {chat.mission?.Location || 'No location'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default ChatSidebar;
