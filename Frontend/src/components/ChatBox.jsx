import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '../socket/socket';
import { ArrowLeft, ArrowDown } from 'lucide-react';
import Loader from '../pages/Loader';

const ChatBox = ({ selectedChat, user, setIsSidebarOpen }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);

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

  useEffect(() => {
    if (!selectedChat?.mission?._id || !socket) {
      setLoading(false);
      return;
    }

    const missionId = selectedChat.mission._id;

    const fetchMessages = async () => {
      try {
        const res = await axiosClient.get(`/chat/message/${missionId}`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error('❌ Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    socket.emit('joinMissionRoom', missionId);
    console.log(`📡 Joined room: ${missionId}`);

    const handleReceiveMessage = (msg) => {
      console.log('📥 Received message:', msg);
      if (msg?.missionId === missionId) {
        setMessages((prev) => [...prev, msg]);
        if (chatContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
          if (scrollHeight > scrollTop + clientHeight + 100) {
            setShowScrollArrow(true);
          }
        }
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
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setShowScrollArrow(false);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setShowScrollArrow(false);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      className="w-full flex flex-col bg-gradient-to-br from-slate-800/60 via-black to-slate-800/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden"
      style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
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

      <div className="relative z-10 flex flex-col h-full">
        {!selectedChat ? (
          <motion.div
            className="flex items-center justify-center text-gray-400 text-lg bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-white/20"
            style={{ height: 'calc(100vh - 120px - 70px)' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Select a group to start chatting
          </motion.div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-4 border-b border-white/20 flex items-center gap-4 h-[60px] shadow-2xl">
              <button
                className="md:hidden text-white p-2 hover:bg-slate-700/80 rounded-full transition"
                onClick={() => setIsSidebarOpen(true)}
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <div className="font-semibold text-lg bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
                  {selectedChat.groupName}
                </div>
                <div className="text-sm text-gray-400">
                  {selectedChat.mission?.Location || 'No location'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              className="overflow-y-auto p-6 space-y-4 bg-transparent"
              ref={chatContainerRef}
              style={{ height: 'calc(100vh - 120px - 130px)', maxHeight: 'calc(100vh - 120px - 130px)' }}
            >
              <AnimatePresence>
                {messages.map((msg, index) => {
                  const isOwn = msg.sender?._id === user._id;
                  const isShortMessage = msg.message.length <= 10;
                  return (
                    <motion.div
                      key={msg._id || index}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className={`p-3 rounded-2xl shadow-lg border border-white/20 perspective-1000 ${
                        isOwn
                          ? 'ml-auto bg-gradient-to-br from-green-600/80 to-green-700/80 text-white'
                          : 'mr-auto bg-gradient-to-br from-slate-700/80 to-slate-800/80 text-white'
                      }`}
                      style={{
                        maxWidth: isShortMessage ? 'min(40%, 250px)' : 'min(70%, 400px)',
                        width: 'fit-content',
                        transformStyle: 'preserve-3d',
                      }}
                      whileHover={{ scale: 1.05, rotateY: 2, rotateX: 1 }}
                    >
                      <div className="text-xs font-medium mb-1 text-gray-200">
                        {msg.sender?.firstName || (isOwn ? user.firstName : 'Unknown')}
                      </div>
                      <div className="text-base break-words">{msg.message}</div>
                      {msg.timestamp && (
                        <div className="text-xs text-gray-400 mt-1 text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <motion.div
              className="p-4 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-t border-white/20 flex gap-4 items-center"
              style={{ minHeight: '70px', paddingBottom: 'max(env(safe-area-inset-bottom, 15px), 15px)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-full bg-slate-900/80 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 10px), 10px)' }}
              />
              <motion.button
                onClick={handleSend}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-full font-semibold text-base hover:bg-blue-700 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send
              </motion.button>
            </motion.div>

            {/* Scroll to Bottom Arrow */}
            {showScrollArrow && (
              <motion.button
                onClick={scrollToBottom}
                className="absolute bottom-6 right-6 bg-slate-700/80 text-white p-3 rounded-full shadow-lg hover:bg-slate-600/80 transition"
                style={{ zIndex: 20 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowDown size={24} />
              </motion.button>
            )}
          </>
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

export default ChatBox;