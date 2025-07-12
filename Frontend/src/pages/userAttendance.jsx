import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';

function UserAttendance() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isPresent, setIsPresent] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      try {
        const response = await axiosClient.get('/attendance/history', { params: { userId: user._id } });
        setAttendanceHistory(response.data);
      } catch (error) {
        console.error('Error fetching attendance history:', error);
      }
    };

    setIsLoaded(true);
    fetchAttendanceHistory();

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [user._id]);

  // Calculate attendance percentage
  const totalSessions = attendanceHistory.length;
  const presentCount = attendanceHistory.filter(entry => entry.status === 'present').length;
  const attendancePercentage = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : 0;

  // Handle OTP input
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to next input
      if (value && index < 3) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  // Submit OTP for attendance
  const handleSubmitOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length === 4) {
      try {
        const response = await axiosClient.post('/attendance/markAttendance', {
          userId: user._id,
          otp: otpValue,
        });
        setIsPresent(response.data.status === 'present');
        const updatedHistory = await axiosClient.get('/attendance/getHistory', { params: { userId: user._id } });
        setAttendanceHistory(updatedHistory.data);
      } catch (error) {
        console.error('Error marking attendance:', error);
        setIsPresent(false);
      }
    }
  };

  // Animation variants
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
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite',
          }}></div>
        </div>

        {/* Floating Orbs */}
        <motion.div
          className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8">
        {/* Attendance Percentage */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg text-lg font-bold text-cyan-300">
          Attendance: {attendancePercentage}%
        </div>

        <motion.h2
          className="text-5xl md:text-7xl font-black text-center uppercase tracking-widest mb-12"
          variants={itemVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Attendance
          </span>
        </motion.h2>

        {/* OTP Input Section */}
        <motion.div
          className="flex justify-center mb-8"
          variants={itemVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          <div className="flex space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                maxLength="1"
                className="w-12 h-12 text-center text-2xl font-mono bg-black/40 border border-cyan-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            ))}
          </div>
          <button
            onClick={handleSubmitOtp}
            className="ml-4 btn bg-gradient-to-r from-cyan-400 to-purple-400 text-white border-none hover:opacity-90"
          >
            Submit
          </button>
        </motion.div>
        {isPresent !== null && (
          <motion.p
            className={`text-center text-xl mb-4 ${isPresent ? 'text-green-400' : 'text-red-400'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isPresent ? 'Marked Present!' : 'Marked Absent!'}
          </motion.p>
        )}

        {/* Attendance History */}
        <motion.div
          className="overflow-x-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          <table className="table w-full bg-black/40 backdrop-blur-md border border-cyan-400/30">
            <thead>
              <tr className="text-cyan-200">
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map((entry, index) => (
                <motion.tr
                  key={index}
                  variants={itemVariants}
                  className="hover:bg-cyan-400/10"
                >
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>{new Date(entry.time).toLocaleTimeString()}</td>
                  <td className={entry.status === 'present' ? 'text-green-400' : 'text-red-400'}>
                    {entry.status}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}

export default UserAttendance;