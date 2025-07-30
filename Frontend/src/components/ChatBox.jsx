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

    console.log('📤 Sending message:', payload);
    socket.emit('sendMessage', payload);
    setInput('');
  };

  return (
    <motion.div className="w-3/4 flex flex-col justify-between bg-gray-900 p-4 rounded-lg shadow-md">
      {!selectedChat ? (
        <div className="text-center text-gray-400">Select a group to start chatting</div>
      ) : (
        <>
          <div className="overflow-y-auto flex-1 space-y-2 pr-2 max-h-[70vh]">
            {messages.map((msg, index) => {
              const isOwn = msg.sender?._id === user._id;
              return (
                <div
                  key={msg._id || index}
                  className={`p-2 rounded-md w-fit max-w-[70%] ${
                    isOwn ? 'ml-auto bg-purple-600 text-white' : 'bg-gray-700 text-white'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {msg.sender?.name || (isOwn ? `${user.firstName} ${user.lastName}` : 'Someone')}
                  </div>
                  <div>{msg.message}</div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 rounded bg-gray-800 text-white outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
            >
              Send
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ChatBox;
    