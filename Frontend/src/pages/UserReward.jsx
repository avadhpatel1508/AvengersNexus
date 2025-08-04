import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import Loader from './Loader'; // Assuming Loader component exists

const UserReward = () => {
  const user = useSelector((state) => state.auth?.user);
  const [rewards, setRewards] = useState([]);
  const [missions, setMissions] = useState([]);
  const [totalReward, setTotalReward] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchRewardData = async () => {
      try {
        const [rewardRes, missionsRes] = await Promise.all([
          axiosClient.get(`/mission/getRewardsByUser/${user._id}`),
          axiosClient.get('/mission/getAllMission'),
        ]);

        setRewards(rewardRes.data.rewardHistory || []);
        setTotalReward(rewardRes.data.totalReward || 0);
        setMissions(missionsRes.data || []);
      } catch (err) {
        console.error('Error fetching reward data:', err);
      } finally {
        setTimeout(() => setIsLoaded(true), 2000); // Match Homepage loader timing
      }
    };

    if (user?._id) {
      fetchRewardData();
    }

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [user?._id]);

  const missionMap = Object.fromEntries(missions.map((m) => [m._id, m]));
  const paidTransactions = rewards.filter((entry) => entry.status === 'succeeded');
  const pendingTransactions = rewards.filter((entry) => {
    const relatedMission = missionMap[entry.missionId];
    return entry.status !== 'succeeded' && !relatedMission?.isCompleted;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const TransactionCard = ({ entry, idx }) => {
    const relatedMission = missionMap[entry.missionId];

    return (
      <motion.div
        key={idx}
        className="relative bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300"
        variants={itemVariants}
        whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(255,255,255,0.2)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl">
            {entry.status === 'succeeded' ? '✅' : '⏳'}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {entry.title || relatedMission?.title || 'Unknown Mission'}
            </h3>
            <p className="text-sm text-gray-400">
              {relatedMission ? `${relatedMission.difficulty} | ${relatedMission.Location}` : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Date: {entry.paidAt
                ? new Date(entry.paidAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-yellow-400">₹{entry.amount}</p>
            <p className={`text-sm ${entry.status === 'succeeded' ? 'text-green-400' : 'text-red-400'}`}>
              {entry.status}
            </p>
          </div>
        </div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-xl"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />

      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-[1000] bg-black"
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      {isLoaded && (
        <>
          {/* Background Effects */}
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-blue-950" />
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
                  </pattern>
                  <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
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
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, rgba(59, 130, 246, 0.06) 50%, transparent 70%)',
              }}
              transition={{ type: 'spring', stiffness: 20, damping: 30 }}
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
              <div className="w-[60vw] max-w-[350px] h-[60vw] max-h-[350px] border-8 border-white rounded-full flex items-center justify-center animate-spin-very-slow">
                <div className="w-64 h-64 border-8 border-cyan-500 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 border-8 border-blue-500 rounded-full flex items-center justify-center">
                    <div className="text-4xl sm:text-6xl text-white">★</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

          {/* Main Content */}
          <div className="relative z-10 px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl font-black text-center uppercase tracking-wider mb-12 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              Your Rewards
            </motion.h2>

            {/* Total Reward */}
            <motion.div
              className="max-w-2xl mx-auto mb-12"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="bg-gray-900/70 p-6 rounded-xl border border-cyan-500/30 shadow-xl">
                <h3 className="text-2xl font-semibold text-center text-cyan-300 mb-4">🏅 Total Reward</h3>
                <p className="text-center text-3xl font-bold text-yellow-400">
                  ₹ {totalReward ?? '...'}
                </p>
              </div>
            </motion.div>

            {/* Transactions */}
            <motion.div
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Paid Rewards */}
              <div>
                <h3 className="text-xl font-semibold text-green-400 text-center mb-4">✅ Paid Rewards</h3>
                {paidTransactions.length === 0 ? (
                  <p className="text-center text-gray-400">No paid rewards yet.</p>
                ) : (
                  <div className="space-y-4">
                    {paidTransactions.map((entry, idx) => (
                      <TransactionCard key={idx} entry={entry} idx={idx} />
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Rewards */}
              <div>
                <h3 className="text-xl font-semibold text-red-400 text-center mb-4">⏳ Pending Rewards</h3>
                {pendingTransactions.length === 0 ? (
                  <p className="text-center text-gray-400">No pending rewards.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingTransactions.map((entry, idx) => (
                      <TransactionCard key={idx} entry={entry} idx={idx} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <Footer />
        </>
      )}

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
      `}</style>
    </div>
  );
};

export default UserReward;