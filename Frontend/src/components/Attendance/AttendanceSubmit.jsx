import React, { useEffect, useState } from 'react';
import { initializeSocket, getSocket } from '../../socket/socket';
import { motion } from 'framer-motion';
import { FaShieldAlt } from 'react-icons/fa';
import AdminNavbar from '../AdminNavbar';
import UserNavbar from '../UserNavbar';
import { useSelector } from 'react-redux';
import Footer from '../Footer';
// Mock attendance history data (replace with actual API data)
const mockHistory = [
  { id: 1, date: '2025-07-19 10:00 AM', sessionId: 'session-123', status: 'Success', otp: '3921' },
  { id: 2, date: '2025-07-18 09:30 AM', sessionId: 'session-124', status: 'Failed', otp: '4832' },
  { id: 3, date: '2025-07-17 11:15 AM', sessionId: 'session-125', status: 'Success', otp: '7503' },
];

const AttendanceSubmit = ({ userId, token, role }) => {
  const [otp, setOtp] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [otpSession, setOtpSession] = useState('');
  const [otpActive, setOtpActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Initialize socket
  useEffect(() => {
    initializeSocket(token);
    const socket = getSocket();
    if (!socket) return;

    console.log("✅ Socket connected:", socket.id);

    socket.on('attendance-started', (data) => {
      setReceivedOtp(data.otp);
      setOtpSession(data.sessionId);
      setOtpActive(true);
      setTimer(data.expiresIn || 60);
      setMessage('');
      setError('');
      setSubmitted(false);
    });

    socket.on('attendance-success', (data) => {
      setMessage(data.message || 'Attendance marked successfully!');
      setSubmitted(true);
    });

    socket.on('attendance-failed', (err) => {
      setError(err.message || 'Failed to mark attendance.');
    });

    return () => {
      socket.off('attendance-started');
      socket.off('attendance-success');
      socket.off('attendance-failed');
    };
  }, [token]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setOtpActive(false);
    }
  }, [timer]);

  // Handle mouse movement for background effect
  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle OTP submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const socket = getSocket();
    if (!socket) {
      setError('Socket not connected');
      return;
    }

    socket.emit('submit-otp', {
      userId,
      sessionId: otpSession,
      otp: otp.trim(),
    });
  };

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dynamic Navbar */}
      <div className="relative z-20">
        {role === 'admin' ? <AdminNavbar /> : <UserNavbar />}
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
        <motion.div
          className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          style={{ left: mousePosition.x - 192, top: mousePosition.y - 192 }}
          transition={{ type: 'spring', stiffness: 50, damping: 30 }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Form & History */}
      <div className="relative z-10 p-4 sm:p-8 flex flex-col items-center justify-center min-h-screen gap-6">
        <motion.div
          className="w-full max-w-md bg-black/40 backdrop-blur-md p-6 rounded-xl border border-cyan-400/20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-center uppercase tracking-widest mb-6"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Captain America Attendance
            </span>
          </motion.h2>

          {!otpActive ? (
            <motion.p className="text-center text-gray-400" variants={itemVariants}>
              <FaShieldAlt className="inline mr-2" /> Waiting for admin to start attendance...
            </motion.p>
          ) : submitted ? (
            <motion.p className="text-center text-green-400 font-semibold" variants={itemVariants}>
              {message}
            </motion.p>
          ) : (
            <motion.form onSubmit={handleSubmit} className="flex flex-col items-center gap-4" variants={itemVariants}>
              <div className="w-full">
                <label className="block text-gray-300 mb-2 font-semibold">Enter OTP:</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 bg-black/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  required
                />
              </div>
              <motion.button
                type="submit"
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg flex items-center gap-2"
                variants={itemVariants}
              >
                <FaShieldAlt className="text-xl" /> Mark Attendance
              </motion.button>
              {error && (
                <motion.p className="text-center text-red-400" variants={itemVariants}>
                  {error}
                </motion.p>
              )}
              <motion.div className="text-sm text-gray-400" variants={itemVariants}>
                <FaShieldAlt className="inline mr-2" /> Time left: {timer}s
              </motion.div>
            </motion.form>
          )}
        </motion.div>

        {/* Attendance History Section */}
        <motion.div
          className="w-full max-w-4xl bg-black/40 backdrop-blur-md p-6 rounded-xl border border-cyan-400/20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h3
            className="text-xl sm:text-2xl font-bold text-center text-white mb-6"
            variants={itemVariants}
          >
            Attendance History
          </motion.h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm sm:text-base">
              <thead>
                <tr className="bg-cyan-900/50 text-white">
                  <th className="px-2 py-2 sm:px-4 sm:py-2">Date</th>
                  <th className="px-2 py-2 sm:px-4 sm:py-2">Session ID</th>
                  <th className="px-2 py-2 sm:px-4 sm:py-2">Status</th>
                  <th className="px-2 py-2 sm:px-4 sm:py-2">OTP Used</th>
                </tr>
              </thead>
              <tbody>
                {mockHistory.map((record) => (
                  <motion.tr
                    key={record.id}
                    className="border-b border-cyan-400/20 hover:bg-cyan-900/20"
                    variants={itemVariants}
                  >
                    <td className="px-2 py-2 sm:px-4 sm:py-2 text-gray-300">{record.date}</td>
                    <td className="px-2 py-2 sm:px-4 sm:py-2 text-gray-300">{record.sessionId}</td>
                    <td className="px-2 py-2 sm:px-4 sm:py-2">
                      <span
                        className={`font-semibold ${
                          record.status === 'Success' ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 sm:px-4 sm:py-2 text-gray-300">{record.otp}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
      <Footer/>
    </div>
  );
};

export default AttendanceSubmit;
