import React, { useEffect, useState } from 'react';
import axiosClient from '../../utils/axiosClient';
import { initializeSocket, getSocket } from '../../socket/socket';
import { motion } from 'framer-motion';
import { FaShieldAlt } from 'react-icons/fa';
import AdminNavbar from '../AdminNavbar';
import UserNavbar from '../UserNavbar';
import Footer from '../Footer';
import { useSelector } from 'react-redux';

const AttendanceSubmit = () => {
  const user = useSelector((state) => state.auth?.user);
  const userId = user?._id;
  const role = user?.role;

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [otp, setOtp] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [otpSession, setOtpSession] = useState('');
  const [otpActive, setOtpActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const formatDateTime = (isoDate) => {
    const dateObj = new Date(isoDate);
    const date = dateObj.toLocaleDateString('en-IN');
    const time = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return { date, time };
  };

  const fetchAttendance = async () => {
    try {
      const { data } = await axiosClient.get(`/attendance/${userId}`);
      if (data?.success) {
        setAttendanceHistory(data.attendance || []);
      } else {
        setError('Failed to fetch attendance history.');
      }
    } catch (err) {
      console.error('❌ Error fetching attendance:', err);
      setError('Something went wrong fetching attendance.');
    }
  };

  // Load active session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('activeAttendanceSession');
    if (saved) {
      const { otp, sessionId, expiresAt } = JSON.parse(saved);
      const now = Date.now();
      const remaining = Math.floor((expiresAt - now) / 1000);
      if (remaining > 0) {
        setReceivedOtp(otp);
        setOtpSession(sessionId);
        setOtpActive(true);
        setTimer(remaining);
        setSubmitted(false);
      } else {
        localStorage.removeItem('activeAttendanceSession');
      }
    }
  }, []);

  useEffect(() => {
    initializeSocket();
    const socket = getSocket();
    if (!socket) return;

    socket.on('attendance-started', ({ otp, sessionId, expiresIn }) => {
      const expiresAt = Date.now() + expiresIn * 1000;
      setReceivedOtp(otp);
      setOtpSession(sessionId);
      setOtpActive(true);
      setTimer(expiresIn || 60);
      setMessage('');
      setError('');
      setSubmitted(false);

      localStorage.setItem(
        'activeAttendanceSession',
        JSON.stringify({ otp, sessionId, expiresAt })
      );
    });

    socket.on('attendance-success', (data) => {
      setMessage(data.message || 'Attendance marked successfully!');
      setSubmitted(true);
      fetchAttendance();
    });

    socket.on('attendance-failed', (err) => {
      setError(err.message || 'Failed to mark attendance.');
    });

    socket.emit('get-active-session');

    socket.on('active-session-data', ({ otp, sessionId, expiresAt }) => {
      const now = Date.now();
      const remainingTime = Math.floor((expiresAt - now) / 1000);
      if (remainingTime > 0) {
        setReceivedOtp(otp);
        setOtpSession(sessionId);
        setOtpActive(true);
        setTimer(remainingTime);
        setMessage('');
        setError('');
        setSubmitted(false);

        localStorage.setItem(
          'activeAttendanceSession',
          JSON.stringify({ otp, sessionId, expiresAt })
        );
      }
    });

    return () => {
      socket.off('attendance-started');
      socket.off('attendance-success');
      socket.off('attendance-failed');
      socket.off('active-session-data');
    };
  }, []);

  // Timer logic same as AttendanceStart
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            setOtpActive(false);
            localStorage.removeItem('activeAttendanceSession');
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  useEffect(() => {
    const handleMouseMove = (e) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAttendance();
    }
  }, [userId]);

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
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="relative z-20">
        {role === 'admin' ? <AdminNavbar /> : <UserNavbar />}
      </div>

      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
        <motion.div
          className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          style={{ left: mousePosition.x - 192, top: mousePosition.y - 192 }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-8 flex flex-col items-center justify-center min-h-screen gap-6">
        {/* OTP Form */}
        <motion.div
          className="w-full max-w-md bg-black/40 backdrop-blur-md p-6 rounded-xl border border-cyan-400/20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 className="text-4xl font-black text-center uppercase tracking-widest mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" variants={itemVariants}>
            Captain America Attendance
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
            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col items-center gap-4"
              variants={itemVariants}
            >
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

        {/* Attendance Table */}
        <motion.div
          className="w-full max-w-4xl bg-black/40 backdrop-blur-md p-6 rounded-xl border border-cyan-400/20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h3 className="text-2xl font-bold text-center text-white mb-6" variants={itemVariants}>
            Attendance History
          </motion.h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm sm:text-base">
              <thead>
                <tr className="bg-cyan-900/50 text-white">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Session ID</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-red-400 py-4">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  attendanceHistory.map((record) => {
                    const { date, time } = formatDateTime(record.date);
                    return (
                      <tr key={record._id}>
                        <td className="px-4 py-2">{date}</td>
                        <td className="px-4 py-2">{time}</td>
                        <td className="px-4 py-2">{record.otpSessionId}</td>
                        <td className="px-4 py-2">{record.status}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default AttendanceSubmit;
