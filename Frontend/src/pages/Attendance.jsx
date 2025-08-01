import React, { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt } from 'react-icons/fa';
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import { useSelector } from 'react-redux';
import Footer from '../components/Footer';
import Loader from './Loader';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

// Utility function to debounce events
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const Attendance = () => {
  const user = useSelector((state) => state.auth?.user);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [dailyCounts, setDailyCounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState('calendar');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleMouseMove = debounce((e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }, 50);
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const formatDate = (date) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate.toLocaleDateString('en-CA');
  };

  const fetchAttendance = async () => {
    const formattedDate = formatDate(selectedDate);
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `http://localhost:4000/attendance/date/${formattedDate}`,
        { withCredentials: true }
      );
      const data = Array.isArray(response.data.attendance) ? response.data.attendance : [];
      setAttendanceData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyCounts = async () => {
    setGraphLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:4000/attendance/daily-counts?month=${month + 1}&year=${year}`,
        { withCredentials: true }
      );
      console.log('Daily Counts API Response:', response.data); // Debug log
      const data = Array.isArray(response.data) ? response.data : [];
      setDailyCounts(data);
    } catch (err) {
      console.error('Error fetching daily counts:', err);
      setDailyCounts([]);
      setError(err.response?.data?.message || 'Failed to fetch daily counts');
    } finally {
      setGraphLoading(false);
    }
  };

  useEffect(() => {
    const fetchMonthlyAttendance = async () => {
      setGraphLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:4000/attendance/monthly-summary?month=${month + 1}&year=${year}`,
          { withCredentials: true }
        );
        console.log('Monthly Data API Response:', res.data); // Debug log
        const data = Array.isArray(res.data.summary) ? res.data.summary : [];
        setMonthlyData(data);
      } catch (err) {
        console.error('Error fetching monthly data:', err);
        setMonthlyData([]);
        setError(err.response?.data?.message || 'Failed to fetch monthly data');
      } finally {
        setGraphLoading(false);
        setIsLoaded(true);
      }
    };

    if (viewMode === 'graph') {
      fetchMonthlyAttendance();
      fetchDailyCounts();
      fetchAttendance();
    } else {
      setIsLoaded(true);
    }
  }, [viewMode, month, year]);

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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  // Memoize pieData to prevent unnecessary recalculations
  const pieData = useMemo(
    () =>
      [
        { name: 'Present', value: attendanceData.filter(entry => entry.status === 'Present').length },
        { name: 'Absent', value: attendanceData.filter(entry => entry.status === 'Absent').length },
      ].filter(item => item.value > 0),
    [attendanceData]
  );

  console.log('Pie Data:', pieData);

  return (
    <div className="bg-black text-white relative overflow-hidden">
      {/* Preloader */}
      <AnimatePresence>
        {(!isLoaded || graphLoading || loading) && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-blue-950"></div>
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.3)"
                  strokeWidth="0.5"
                />
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
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-red-500/30 via-transparent to-transparent transform rotate-12 animate-pulse"></div>
          <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-blue-500/30 via-transparent to-transparent transform -rotate-12 animate-pulse delay-1000"></div>
          <div className="absolute top-0 left-2/3 w-1 h-full bg-gradient-to-b from-white/20 via-transparent to-transparent transform rotate-6 animate-pulse delay-2000"></div>
        </div>
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background:
              'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)',
          }}
          transition={{ type: 'spring', stiffness: 20, damping: 30 }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
          <div className="w-[60vw] max-w-[350px] h-[60vw] max-h-[350px] border-8 border-white rounded-full flex items-center justify-center animate-spin-very-slow">
            <div className="w-64 h-64 border-8 border-red-500 rounded-full flex items-center justify-center">
              <div className="w-32 h-32 border-8 border-blue-500 rounded-full flex items-center justify-center">
                <div className="text-4xl sm:text-6xl text-white">★</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

      <div className="relative z-10 p-8 py-16 px-4 sm:px-6 min-h-[120vh]">
        <motion.div
          className="flex justify-center gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
        >
          <motion.button
            className={`relative px-6 py-3 rounded-lg font-semibold ${
              viewMode === 'calendar'
                ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-lg'
                : 'bg-white/30 text-gray-300 hover:bg-white/50'
            }`}
            onClick={() => setViewMode('calendar')}
            variants={itemVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Calendar View
            {viewMode === 'calendar' && (
              <motion.div
                className="absolute inset-0 bg-white/30 rounded-lg"
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>
          <motion.button
            className={`relative px-6 py-3 rounded-lg font-semibold ${
              viewMode === 'graph'
                ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-lg'
                : 'bg-white/30 text-gray-300 hover:bg-white/50'
            }`}
            onClick={() => setViewMode('graph')}
            variants={itemVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Graph View
            {viewMode === 'graph' && (
              <motion.div
                className="absolute inset-0 bg-white/30 rounded-lg"
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>
        </motion.div>

        {viewMode === 'calendar' && (
          <motion.div
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
          >
            <motion.div
              className="flex justify-center gap-4 mb-6"
              variants={itemVariants}
            >
              <motion.button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaCalendarAlt /> Select Date
              </motion.button>
              <motion.button
                onClick={fetchAttendance}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Attendance
              </motion.button>
            </motion.div>

            {showCalendar && (
              <motion.div
                className="flex justify-center mb-6"
                variants={itemVariants}
              >
                <div className="relative bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl perspective-1000">
                  <motion.div
                    className="relative"
                    whileHover={{ rotateY: 5, rotateX: 2 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <Calendar
                      onChange={setSelectedDate}
                      value={selectedDate}
                      className="rounded-lg p-4 bg-white text-black"
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}

            <motion.p
              className="text-center text-gray-300 mb-8 text-lg"
              variants={itemVariants}
            >
              <strong>Selected Date:</strong> {selectedDate.toDateString()}
            </motion.p>

            {loading ? (
              <motion.p
                className="text-center text-white"
                variants={itemVariants}
              >
                Loading...
              </motion.p>
            ) : error ? (
              <motion.p
                className="text-center text-red-400"
                variants={itemVariants}
              >
                {error}
              </motion.p>
            ) : attendanceData.length === 0 ? (
              <motion.p
                className="text-center text-gray-400"
                variants={itemVariants}
              >
                No attendance records found.
              </motion.p>
            ) : (
              <motion.ul
                className="space-y-4"
                variants={containerVariants}
              >
                {attendanceData.map((entry) => (
                  <motion.li
                    key={entry._id}
                    className="flex justify-between items-center bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl p-4 rounded-xl border border-white/20 hover:scale-[1.02] transition-transform"
                    variants={itemVariants}
                  >
                    <span className="font-semibold text-white">
                      {entry.user?.firstName || 'Unknown'} ({entry.user?.emailId})
                    </span>
                    <span
                      className={`font-bold ${
                        entry.status === 'Present' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </motion.div>
        )}

        {viewMode === 'graph' && (
          <motion.div
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
          >
            <motion.div
              className="flex justify-center gap-4 mb-8"
              variants={itemVariants}
            >
              <div className="relative">
                <motion.select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="appearance-none px-6 py-3 bg-gray-800 text-gray-200 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  whileHover={{ scale: 1.05 }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i} className="bg-gray-800 text-gray-200">
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </motion.select>
              </div>

              <div className="relative">
                <motion.input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="px-6 py-3 bg-gray-800 text-gray-200 font-semibold rounded-lg w-32 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  min="2000"
                  max="2100"
                  whileHover={{ scale: 1.05 }}
                />
              </div>
            </motion.div>

            {monthlyData.length > 0 ? (
              <motion.div
                className="relative bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl perspective-1000 mb-8"
                whileHover={{ rotateY: 5, rotateX: 2 }}
                style={{ transformStyle: 'preserve-3d' }}
                variants={itemVariants}
              >
                <h3 className="text-center text-white text-lg mb-4">Monthly Attendance Summary</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="userName" stroke="#ffffff" />
                    <YAxis stroke="#ffffff" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="daysPresent" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <motion.p
                className="text-center text-gray-400 mb-8"
                variants={itemVariants}
              >
                No monthly attendance data available.
              </motion.p>
            )}

            {dailyCounts.length > 0 ? (
              <motion.div
                className="relative bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl perspective-1000 mb-8"
                whileHover={{ rotateY: 5, rotateX: 2 }}
                style={{ transformStyle: 'preserve-3d' }}
                variants={itemVariants}
              >
                <h3 className="text-center text-white text-lg mb-4">Daily Attendance Counts</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={dailyCounts}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => date.split('-')[2]}
                      stroke="#ffffff"
                    />
                    <YAxis stroke="#ffffff" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="presentCount"
                      stroke="#3b82f6"
                      fill="rgba(59, 130, 246, 0.2)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <motion.p
                className="text-center text-gray-400 mb-8"
                variants={itemVariants}
              >
                No daily attendance data available.
              </motion.p>
            )}

            {pieData.length > 0 ? (
              <motion.div
                className="relative bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl perspective-1000"
                whileHover={{ rotateY: 5, rotateX: 2 }}
                style={{ transformStyle: 'preserve-3d' }}
                variants={itemVariants}
              >
                <h3 className="text-center text-white text-lg mb-4">
                  Attendance Status for {selectedDate.toDateString()}
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend
                      align="right"
                      verticalAlign="top"
                      layout="vertical"
                      wrapperStyle={{
                        padding: '10px',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderRadius: '4px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <motion.p
                className="text-center text-gray-400 mb-8"
                variants={itemVariants}
              >
                No attendance status data available for selected date.
              </motion.p>
            )}
          </motion.div>
        )}

        <div className="h-32"></div>
      </div>

      <style>{`
        @keyframes spin-very-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-very-slow {
          animation: spin-very-slow 60s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default Attendance;