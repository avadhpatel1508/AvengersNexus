import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';
import { getSocket } from '../socket/socket';

const ChatBox = ({ selectedChat, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Wait for socket to be ready
  useEffect(() => {
    const checkSocket = () => {
      const s = getSocket();
      if (s) {
        console.log('✅ Socket ready in ChatBox');
        setSocket(s);
      } else {
        console.log('🔁 Waiting for socket...');
        setTimeout(checkSocket, 500);
      }
    };
    checkSocket();
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages and set up socket listeners
  useEffect(() => {
    if (!selectedChat?.mission?._id || !socket) return;

    const missionId = selectedChat.mission._id;

    const fetchMessages = async () => {
      try {
        const res = await axiosClient.get(`/chat/message/${missionId}`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error('❌ Error fetching messages:', err);
      }
    };

    fetchMessages();
    socket.emit('joinMissionRoom', missionId);
    console.log(`📡 Joined room: ${missionId}`);

    const handleReceiveMessage = (msg) => {
      console.log('📥 Received message:', msg);
      if (msg?.missionId === missionId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.emit('leaveRoom', missionId);
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [selectedChat, socket]);

  const handleSend = () => {
    if (!input.trim()) return;

    if (!socket || !selectedChat?.mission?._id) {
      console.warn('❗ Cannot send message - socket or mission missing');
      return;
    }

    const payload = {
      missionId: selectedChat.mission._id,
      senderId: user._id,
      message: input.trim(),
    };

    socket.emit('sendMessage', payload);
    setInput('');
  };

  return (
    <motion.div
      className="w-3/4 flex flex-col justify-between bg-transparent p-6 rounded-xl shadow-lg"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {!selectedChat ? (
        <div className="text-center text-gray-400 text-lg">Select a group to start chatting</div>
      ) : (
        <>
          <div className="overflow-y-auto flex-1 pr-2 space-y-3 max-h-[70vh]">
            {messages.map((msg, index) => {
              const isOwn = msg.sender?._id === user._id;
              return (
                <motion.div
                  key={msg._id || index}
                  className={`p-3 rounded-xl max-w-[75%] shadow-md ${
                    isOwn
                      ? 'ml-auto bg-purple-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-sm font-semibold mb-1">
                    {msg.sender?.firstName || (isOwn ? user.firstName : 'Unknown')}
                  </div>
                  <div className="text-base break-words">{msg.message}</div>
                  {msg.timestamp && (
                    <div className="text-xs text-gray-300 mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-6 flex gap-3 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <motion.button
              onClick={handleSend}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-purple-700"
              whileTap={{ scale: 0.95 }}
            >
              Send
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ChatBox;
