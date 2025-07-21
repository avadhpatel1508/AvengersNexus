import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { initializeSocket, getSocket } from '../../socket/socket';
import { FaBolt, FaClock } from 'react-icons/fa';
import Footer from '../Footer'
import AdminNavbar from '../AdminNavbar';
import UserNavbar from '../UserNavbar';
import { useSelector } from 'react-redux';


const AttendanceStart = ({ adminId, token, role }) => {

  const user = useSelector((state) => state.auth?.user); // ✅ Won’t crash if auth is undefined

  const [generatedOtp, setGeneratedOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(0);
  const [attendanceStarted, setAttendanceStarted] = useState(false);
  const [attendanceOver, setAttendanceOver] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    initializeSocket(token);
    const socket = getSocket();

    if (socket) {
      socket.off('otp-generated');
      socket.off('attendance-session-failed');

      socket.on('otp-generated', (data) => {
        setGeneratedOtp(data.otp);
        setSessionId(data.sessionId);
        setTimer(data.expiresIn || 60);
        setAttendanceStarted(true);
        setAttendanceOver(false); // Reset on new session
      });

      socket.on('attendance-session-failed', (err) => {
        setError(err.message || 'Attendance session failed');
      });

      return () => {
        socket.off('otp-generated');
        socket.off('attendance-session-failed');
      };
    }
  }, [token]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((t) => {
          if (t === 1) {
            setAttendanceOver(true);
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleStartAttendance = () => {
    try {
      const socket = getSocket();
      if (!socket) throw new Error('Socket not connected');
      socket.emit('start-attendance', { adminId });
    } catch (err) {
      setError('Socket connection failed');
    }
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
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dynamic Navbar */}
     {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
        <motion.div
          className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          style={{ left: mousePosition.x - 192, top: mousePosition.y - 192 }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Attendance Panel */}
      <div className="relative z-10 p-4 sm:p-8 flex flex-col items-center justify-center min-h-screen gap-6">
        <motion.div
          className="w-full max-w-md bg-black/40 backdrop-blur-md p-6 rounded-xl border border-cyan-400/20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-3xl sm:text-4xl font-black text-center uppercase tracking-widest mb-6"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Start Attendance
            </span>
          </motion.h2>

          {!attendanceStarted ? (
            <motion.button
              onClick={handleStartAttendance}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              variants={itemVariants}
            >
              <FaBolt className="text-xl" /> Start Attendance
            </motion.button>
          ) : (
            <motion.div className="flex flex-col items-center gap-4" variants={itemVariants}>
              <div className="text-center">
                <p className="text-gray-400 mb-2">OTP for this session:</p>
                <div className="text-4xl tracking-widest bg-cyan-700/20 px-8 py-3 rounded-lg font-mono text-cyan-300 shadow-md">
                  {generatedOtp}
                </div>
                <p className="mt-2 text-sm text-gray-400">Session ID: {sessionId}</p>
              </div>

              {attendanceOver ? (
                <div className="text-lg font-semibold text-red-500 text-center mt-2">
                  Attendance is over.
                </div>
              ) : (
                <div className="text-lg font-semibold text-red-400 flex items-center gap-2">
                  <FaClock /> {timer}s left
                </div>
              )}
            </motion.div>
          )}

          {error && (
            <motion.p className="mt-4 text-center text-red-500" variants={itemVariants}>
              {error}
            </motion.p>
          )}
        </motion.div>
      </div>
      <Footer/>
    </div>
  );
};

export default AttendanceStart;
