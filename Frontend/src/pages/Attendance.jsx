import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCalendarAlt } from 'react-icons/fa';
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import { useSelector } from 'react-redux';
import Footer from '../components/Footer';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const Attendance = () => {
  const user = useSelector((state) => state.auth?.user);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState('calendar');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const formatDate = (date) => {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().split('T')[0];
  };

  const fetchAttendance = async () => {
    const formattedDate = formatDate(selectedDate);
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `http://localhost:4000/attendance/date/${formattedDate}`,
        {
          withCredentials: true,
        }
      );
      setAttendanceData(response.data.attendance || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMonthlyAttendance = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/attendance/monthly-summary?month=${month + 1}&year=${year}`,
          { withCredentials: true }
        );
        setMonthlyData(res.data.summary || []);
      } catch (err) {
        console.error('Error fetching monthly data:', err);
      }
    };

    if (viewMode === 'graph') {
      fetchMonthlyAttendance();
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
      {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

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

      <div className="relative z-10 p-8">
        <motion.h2
          className="text-5xl md:text-6xl font-black text-center uppercase tracking-widest mb-12"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Attendance Viewer
          </span>
        </motion.h2>

        <div className="flex justify-center gap-6 mb-8">
          <button
            className={`px-6 py-3 rounded-lg font-semibold ${
              viewMode === 'calendar'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold ${
              viewMode === 'graph'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => setViewMode('graph')}
          >
            Graph View
          </button>
        </div>

        {viewMode === 'calendar' && (
          <>
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg"
              >
                <FaCalendarAlt /> Select Date
              </button>
              <button
                onClick={fetchAttendance}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg"
              >
                Get Attendance
              </button>
            </div>

            {showCalendar && (
              <div className="flex justify-center mb-6">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  className="rounded-lg p-4 bg-white text-black"
                />
              </div>
            )}

            <p className="text-center text-gray-300 mb-8 text-lg">
              <strong>Selected Date:</strong> {selectedDate.toDateString()}
            </p>

            <motion.div
              className="max-w-4xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {loading ? (
                <motion.p className="text-center text-cyan-400" variants={itemVariants}>
                  Loading...
                </motion.p>
              ) : error ? (
                <motion.p className="text-center text-red-400" variants={itemVariants}>
                  {error}
                </motion.p>
              ) : attendanceData.length === 0 ? (
                <motion.p className="text-center text-gray-400" variants={itemVariants}>
                  No attendance records found.
                </motion.p>
              ) : (
                <motion.ul className="space-y-4" variants={containerVariants}>
                  {attendanceData.map((entry) => (
                    <motion.li
                      key={entry._id}
                      className="flex justify-between items-center bg-black/40 backdrop-blur-md p-4 rounded-xl border border-cyan-400/20 hover:scale-[1.02] transition-transform"
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
          </>
        )}

        {viewMode === 'graph' && (
          <>
            <div className="flex justify-center gap-4 mb-8">
  <div className="relative">
    <select
      value={month}
      onChange={(e) => setMonth(parseInt(e.target.value))}
      className="appearance-none px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg focus:outline-none"
    >
      {Array.from({ length: 12 }, (_, i) => (
        <option key={i} value={i}>
          {new Date(0, i).toLocaleString('default', { month: 'long' })}
        </option>
      ))}
    </select>
  </div>

  <div className="relative">
    <input
      type="number"
      value={year}
      onChange={(e) => setYear(parseInt(e.target.value))}
      className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg w-32 text-center focus:outline-none appearance-none"
      min="2000"
      max="2100"
    />
  </div>
</div>


            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="userName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="daysPresent" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
      <Footer />
    </div>
  );
};

export default Attendance;
