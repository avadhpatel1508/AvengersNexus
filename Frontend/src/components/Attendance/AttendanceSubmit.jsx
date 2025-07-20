import React, { useEffect, useState } from 'react';
import { initializeSocket, getSocket } from '../../socket/socket';
import { motion } from 'framer-motion';

const AttendanceSubmit = ({ userId, token }) => {
  const [otp, setOtp] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [otpSession, setOtpSession] = useState('');
  const [otpActive, setOtpActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Initialize socket
  useEffect(() => {
    initializeSocket(token);
    const socket = getSocket();
    if (!socket) return;

    console.log("✅ Socket connected:", socket.id);

    // ✅ Listen for attendance session started
    socket.on('attendance-started', (data) => {
      console.log("✅ OTP Received:", data);
      setReceivedOtp(data.otp);
      setOtpSession(data.sessionId);
      setOtpActive(true);
      setTimer(data.expiresIn || 60);
      setMessage('');
      setError('');
      setSubmitted(false);
    });

    socket.on('attendance-success', (data) => {
      setMessage(data.message || '🎉 Attendance marked successfully!');
      setSubmitted(true);
    });

    socket.on('attendance-failed', (err) => {
      setError(err.message || '❌ Failed to mark attendance.');
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
      otp: otp.trim()
    });
  };

  return (
    <motion.div
      className="max-w-md mx-auto mt-10 p-6 bg-white shadow-2xl rounded-2xl border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-extrabold text-center text-indigo-700 mb-4">
        Submit Attendance
      </h2>

      {!otpActive ? (
        <p className="text-center text-gray-500">⏳ Waiting for admin to start attendance...</p>
      ) : submitted ? (
        <p className="text-center text-green-600 font-semibold">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <div className="w-full">
            <label className="block mb-1 text-gray-600">Enter OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-indigo-400"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            ✅ Mark Attendance
          </button>
          {error && <p className="text-red-600">{error}</p>}
          <div className="text-sm text-gray-600">⏳ Time left: {timer}s</div>
        </form>
      )}
    </motion.div>
  );
};

export default AttendanceSubmit;
