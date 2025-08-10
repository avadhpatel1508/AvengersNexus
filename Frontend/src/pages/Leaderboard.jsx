import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import Loader from './Loader';
import axiosClient from '../utils/axiosClient';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosClient.get('/user/leaderboard'); 
        setUsers(response.data.users);
        setIsLoaded(true);
      } catch (err) {
        setError('Failed to load leaderboard data.');
        console.error(err);
        setIsLoaded(true);
      }
    };

    fetchUsers();

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const trophyVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { scale: 1, rotate: 0, transition: { duration: 0.8, type: 'spring' } }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500 text-xl">
        {error}
      </div>
    );
  }

  const topThree = users.slice(0, 3);
  const remainingUsers = users.slice(3);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-blue-950" />

        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
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

        <motion.div
          className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none"
          style={{
            left: mousePosition.x - 144,
            top: mousePosition.y - 144,
            background:
              'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, rgba(37, 99, 235, 0.06) 50%, transparent 70%)',
          }}
          transition={{ type: 'spring', stiffness: 20, damping: 30 }}
        />
      </div>

      <UserNavbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h1
          className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500 mb-12 text-center"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Leaderboard
        </motion.h1>

        {topThree.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex justify-center items-end mb-16 space-x-4 md:space-x-8 relative"
          >
            {/* Trophy behind the first place */}
            {topThree[0] && (
              <motion.div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl opacity-50 z-0"
                variants={trophyVariants}
              >
                🏆
              </motion.div>
            )}

            {/* Second Place */}
            {topThree[1] && (
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center"
              >
                <div className="text-6xl md:text-7xl mb-2">🦸‍♂️</div>
                <div className="w-24 h-24 md:w-32 md:h-32 bg-silver rounded-full flex items-center justify-center mb-2 border-4 border-silver">
                  <span className="text-4xl md:text-5xl font-bold text-white">2</span>
                </div>
                <div className="text-center bg-white/10 p-4 rounded-lg w-32 md:w-48 shadow-lg">
                  <p className="font-bold text-lg">{topThree[1].firstName} {topThree[1].lastName || ''}</p>
                  <p className="text-sm text-gray-300">EXP: {topThree[1].exp ?? 0}</p>
                  <p className="text-sm text-gray-300">Reward: {topThree[1].totalReward ?? 0}</p>
                  <p className="text-sm text-gray-300">Missions: {topThree[1].missionCompleted ? topThree[1].missionCompleted.length : 0}</p>
                </div>
                <div className="w-32 md:w-48 h-24 bg-silver/70 rounded-t-lg shadow-md"></div>
              </motion.div>
            )}

            {/* First Place */}
            {topThree[0] && (
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center relative z-10"
              >
                <div className="text-7xl md:text-8xl mb-2">🦸‍♂️</div>
                <div className="w-28 h-28 md:w-36 md:h-36 bg-gold rounded-full flex items-center justify-center mb-2 border-4 border-gold">
                  <span className="text-5xl md:text-6xl font-bold text-white">1</span>
                </div>
                <div className="text-center bg-white/10 p-4 rounded-lg w-36 md:w-56 shadow-lg">
                  <p className="font-bold text-lg">{topThree[0].firstName} {topThree[0].lastName || ''}</p>
                  <p className="text-sm text-gray-300">EXP: {topThree[0].exp ?? 0}</p>
                  <p className="text-sm text-gray-300">Reward: {topThree[0].totalReward ?? 0}</p>
                  <p className="text-sm text-gray-300">Missions: {topThree[0].missionCompleted ? topThree[0].missionCompleted.length : 0}</p>
                </div>
                <div className="w-36 md:w-56 h-32 bg-gold/70 rounded-t-lg shadow-md"></div>
              </motion.div>
            )}

            {/* Third Place */}
            {topThree[2] && (
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center"
              >
                <div className="text-6xl md:text-7xl mb-2">🦸‍♂️</div>
                <div className="w-24 h-24 md:w-32 md:h-32 bg-bronze rounded-full flex items-center justify-center mb-2 border-4 border-bronze">
                  <span className="text-4xl md:text-5xl font-bold text-white">3</span>
                </div>
                <div className="text-center bg-white/10 p-4 rounded-lg w-32 md:w-48 shadow-lg">
                  <p className="font-bold text-lg">{topThree[2].firstName} {topThree[2].lastName || ''}</p>
                  <p className="text-sm text-gray-300">EXP: {topThree[2].exp ?? 0}</p>
                  <p className="text-sm text-gray-300">Reward: {topThree[2].totalReward ?? 0}</p>
                  <p className="text-sm text-gray-300">Missions: {topThree[2].missionCompleted ? topThree[2].missionCompleted.length : 0}</p>
                </div>
                <div className="w-32 md:w-48 h-20 bg-bronze/70 rounded-t-lg shadow-md"></div>
              </motion.div>
            )}
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="overflow-x-auto rounded-lg border border-white/20 shadow-lg"
        >
          <table className="min-w-full table-fixed text-left border-collapse">
            <thead className="bg-gradient-to-r from-red-600 to-blue-700 text-white sticky top-0 z-20">
              <tr>
                <th className="px-3 py-2 text-xs sm:text-sm md:px-6 md:py-3">Rank</th>
                <th className="px-3 py-2 text-xs sm:text-sm md:px-6 md:py-3">Name</th>
                <th className="hidden sm:table-cell px-3 py-2 text-xs sm:text-sm md:px-6 md:py-3">Email</th>
                <th className="px-3 py-2 text-xs sm:text-sm md:px-6 md:py-3">EXP</th>
                <th className="px-3 py-2 text-xs sm:text-sm md:px-6 md:py-3">Total Reward</th>
                <th className="px-3 py-2 text-xs sm:text-sm md:px-6 md:py-3">Missions Completed</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {remainingUsers.length === 0 && users.length > 0 && (
                  <motion.tr
                    key="no-remaining"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <td colSpan="6" className="text-center py-10 text-gray-400">
                      No additional users.
                    </td>
                  </motion.tr>
                )}
                {remainingUsers.length === 0 && users.length === 0 && (
                  <motion.tr
                    key="no-users"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <td colSpan="6" className="text-center py-10 text-gray-400">
                      No users found.
                    </td>
                  </motion.tr>
                )}
                {remainingUsers.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className={`border-t border-white/10 ${
                      idx % 2 === 0 ? 'bg-white/5' : 'bg-transparent'
                    }`}
                  >
                    <td className="px-3 py-2 text-xs sm:text-sm md:px-6 md:py-3 font-semibold">{idx + 4}</td>
                    <td className="px-3 py-2 text-xs sm:text-sm md:px-6 md:py-3">
                      {user.firstName} {user.lastName || ''}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-xs sm:text-sm md:px-6 md:py-3 lowercase">{user.emailId}</td>
                    <td className="px-3 py-2 text-xs sm:text-sm md:px-6 md:py-3 font-mono">{user.exp ?? 0}</td>
                    <td className="px-3 py-2 text-xs sm:text-sm md:px-6 md:py-3 font-mono">{user.totalReward ?? 0}</td>
                    <td className="px-3 py-2 text-xs sm:text-sm md:px-6 md:py-3 font-mono">
                      {user.missionCompleted ? user.missionCompleted.length : 0}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      </main>

      <Footer />

      <style jsx>{`
        ::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #dc2626, #2563eb);
          border-radius: 20px;
        }
        .bg-gold {
          background-color: #ffd700;
        }
        .border-gold {
          border-color: #ffd700;
        }
        .bg-silver {
          background-color: #c0c0c0;
        }
        .border-silver {
          border-color: #c0c0c0;
        }
        .bg-bronze {
          background-color: #cd7f32;
        }
        .border-bronze {
          border-color: #cd7f32;
        }
        .bg-gold\/70 {
          background-color: rgba(255, 215, 0, 0.7);
        }
        .bg-silver\/70 {
          background-color: rgba(192, 192, 192, 0.7);
        }
        .bg-bronze\/70 {
          background-color: rgba(205, 127, 50, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;