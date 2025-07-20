import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { initializeSocket, getSocket } from '../../socket/socket';

const AttendanceStart = ({ adminId, token }) => {
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(0);
  const [attendanceStarted, setAttendanceStarted] = useState(false);

  // Initialize socket on mount
  useEffect(() => {
    initializeSocket(token);
    const socket = getSocket();

    if (socket) {
      // Clean up previous listeners to avoid duplicates
      socket.off('otp-generated');
      socket.off('attendance-session-failed');

      // Handle OTP received
      socket.on('otp-generated', (data) => {
        console.log("✅ OTP Received:", data);
        setGeneratedOtp(data.otp);
        setSessionId(data.sessionId);
        setTimer(data.expiresIn || 60);
        setAttendanceStarted(true);
      });

      // Handle errors
      socket.on('attendance-session-failed', (err) => {
        setError(err.message || 'Attendance session failed');
      });

      // Clean up listeners on unmount
      return () => {
        socket.off('otp-generated');
        socket.off('attendance-session-failed');
      };
    }
  }, [token]);

  // Countdown Timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  // Start Attendance Handler
  const handleStartAttendance = () => {
    try {
      const socket = getSocket();
      if (!socket) throw new Error('Socket not connected');

      socket.emit('start-attendance', { adminId });
      console.log('📢 start-attendance emitted');
    } catch (err) {
      console.error(err);
      setError('❌ Socket connection failed');
    }
  };

  return (
    <motion.div
      className="max-w-md mx-auto mt-10 p-6 bg-white shadow-2xl rounded-2xl border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-4">
        Admin Attendance Panel
      </h2>

      {!attendanceStarted ? (
        <button
          onClick={handleStartAttendance}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
        >
          🎯 Start Attendance
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2 mt-4">
          <p className="text-gray-600">OTP for this session:</p>
          <div className="bg-indigo-100 text-indigo-800 px-6 py-2 rounded-lg text-3xl tracking-widest font-mono">
            {generatedOtp}
          </div>
          <p className="text-gray-500 text-sm mt-1">Session ID: {sessionId}</p>
          <div className="mt-4 text-lg text-red-600 font-bold">
            ⏳ {timer}s left to mark attendance
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 mt-4 text-center">{error}</p>
      )}
    </motion.div>
  );
};

export default AttendanceStart;
