import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import Loader from './Loader';
import { logoutUser } from '../authSlice';
import { resetSocket } from '../socket/socket';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [missionStats, setMissionStats] = useState(null);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [attendanceError, setAttendanceError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Helper to format date/time like in AttendanceSubmit
  const formatDateTime = (isoDate) => {
    const dateObj = new Date(isoDate);
    const date = dateObj.toLocaleDateString('en-IN');
    const time = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return { date, time };
  };

  const fetchAttendance = async (userId) => {
    try {
      setAttendanceError('');
      const { data } = await axiosClient.get(`/attendance/${userId}`);
      if (data?.success) {
        setAttendanceHistory(data.attendance || []);
      } else {
        setAttendanceError('Failed to fetch attendance history.');
      }
    } catch (err) {
      console.error('❌ Error fetching attendance:', err);
      setAttendanceError('Something went wrong fetching attendance.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoaded(false);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token is missing');
          setIsLoaded(true);
          return;
        }

        // Fetch user profile
        const userResponse = await axiosClient.get('/user/check', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(userResponse.data.user);

        if (userResponse.data.user._id) {
          await fetchAttendance(userResponse.data.user._id);
        }

        // Fetch mission stats
        try {
          const missionStatsResponse = await axiosClient.get(
            `/mission/missionStats/${userResponse.data.user._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setMissionStats(missionStatsResponse.data);
        } catch (statsErr) {
          console.error(
            'Error fetching mission stats:',
            statsErr.response?.data || statsErr.message
          );
          setMissionStats({ assignedMissions: 0, completedMissions: 0, totalMissions: 0 });
        }

        // Fetch completed missions
        try {
          const missionsResponse = await axiosClient.get('/mission/missionCompletedByUser', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCompletedMissions(Array.isArray(missionsResponse.data) ? missionsResponse.data : []);
        } catch (missionsErr) {
          console.error(
            'Error fetching completed missions:',
            missionsErr.response?.data || missionsErr.message
          );
          setCompletedMissions([]);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load profile data.');
      } finally {
        setIsLoaded(true);
      }
    };

    fetchData();

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    resetSocket();
    navigate('/login');
  };

  const handleRewardClick = () => {
    navigate('/your-reward');
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

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <UserNavbar />

      {/* Loader */}
      <AnimatePresence>
        {!isLoaded && (
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

      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-blue-950"></div>
        <div className="absolute inset-0 opacity-20">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.3)"
                  strokeWidth="0.5"
                />
              </pattern>
              <linearGradient
                id="heroGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#dc2626" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            <rect width="100" height="100" fill="url(#heroGrad)" />
          </svg>
        </div>
        <motion.div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background:
              'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, rgba(37, 99, 235, 0.06) 50%, transparent 70%)',
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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-start pt-6 pb-10 px-4 sm:px-6">
        <div className="container mx-auto">
          {error ? (
            <motion.p
              className="text-center text-lg text-red-400 mb-10"
              variants={itemVariants}
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
            >
              {error}
            </motion.p>
          ) : (
            <motion.div
              className="grid gap-10 mx-auto mb-10 max-w-7xl"
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
            >
              {/* User Info */}
              <motion.div
                className="bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl perspective-1000"
                variants={itemVariants}
                whileHover={{ rotateY: 5, rotateX: 2, scale: 1.05 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
                  Profile
                </h3>
                {user && (
                  <div className="flex items-center mb-6">
                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mr-4">
                      {user.firstName[0]}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{user.firstName}</p>
                      <p className="text-gray-400">{user.emailId}</p>
                      <p className="text-gray-400">Role: {user.role}</p>
                      <p
                        className="text-gray-400 cursor-pointer hover:text-blue-400"
                        onClick={handleRewardClick}
                      >
                        Total Rewards: {user.totalReward || 0}
                      </p>
                      <button
                        onClick={handleLogout}
                        className="mt-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-pulse"></div>
              </motion.div>

              {/* Real Attendance History */}
              <motion.div
                className="bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl perspective-1000 overflow-x-auto"
                variants={itemVariants}
                whileHover={{ rotateY: 5, rotateX: 2, scale: 1.05 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
                  Attendance History
                </h3>

                {attendanceError && (
                  <p className="text-red-400 mb-4">{attendanceError}</p>
                )}

                <table className="w-full table-auto text-sm sm:text-base text-left">
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
                          <tr key={record._id} className="border-t border-white/20">
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
              </motion.div>

              {/* Mission Stats */}
              <motion.div
                className="bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl perspective-1000"
                variants={itemVariants}
                whileHover={{ rotateY: 5, rotateX: 2, scale: 1.05 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
                  Mission Stats
                </h3>
                {missionStats ? (
                  <div className="space-y-2">
                    <p>
                      <span className="text-white font-semibold">📋 Assigned Missions:</span>{' '}
                      <span className="text-gray-400">{missionStats.assignedMissions || 0}</span>
                    </p>
                    <p>
                      <span className="text-white font-semibold">🔄 Ongoing Missions:</span>{' '}
                      <span className="text-blue-400">
                        {(missionStats.assignedMissions || 0) -
                          (missionStats.completedMissions || 0)}
                      </span>
                    </p>
                    <p>
                      <span className="text-white font-semibold">✅ Completed Missions:</span>{' '}
                      <span className="text-green-400">{missionStats.completedMissions || 0}</span>
                    </p>
                    <p>
                      <span className="text-white font-semibold">📊 Total Missions:</span>{' '}
                      <span className="text-yellow-400">{missionStats.totalMissions || 0}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">No mission stats available</p>
                )}
                <h4 className="text-xl font-semibold mt-6 mb-2 bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
                  Completed Missions
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {completedMissions.length > 0 ? (
                    completedMissions.map((mission) => (
                      <div
                        key={mission._id}
                        className="bg-gray-700/50 p-4 rounded border border-white/20"
                      >
                        <p className="font-semibold text-white">{mission.title}</p>
                        <p className="text-gray-400">{mission.description}</p>
                        <p className="text-gray-400">
                          Completed At:{' '}
                          {mission.completedAt
                            ? new Date(mission.completedAt).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No completed missions</p>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-pulse"></div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />

      <style jsx>{`
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
    </div>
  );
};

export default UserProfile;
