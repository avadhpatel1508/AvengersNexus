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
                {users.length === 0 && (
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
                {users.map((user, idx) => (
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
                    <td className="px-3 py-2 text-xs sm:text-sm md:px-6 md:py-3 font-semibold">{idx + 1}</td>
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
      `}</style>
    </div>
  );
};

export default Leaderboard;
