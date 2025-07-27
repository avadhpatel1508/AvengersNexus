import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import { useSelector } from 'react-redux';

function UserReward() {
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
        setIsLoaded(true);
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const renderTransactionCard = (entry, idx) => {
    const relatedMission = missionMap[entry.missionId];

    return (
      <motion.div
        key={idx}
        className="relative bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-cyan-400/30 hover:scale-105 transition-transform duration-300 group"
        variants={itemVariants}
        whileHover={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)' }}
      >
        {/* UI tech dots */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-500"></div>

        <h3 className="text-xl font-bold mb-2 text-cyan-300">
          🛰️ {entry.title || relatedMission?.title || 'Unknown Mission'}
        </h3>
        <p className="text-yellow-300 mb-1">💰 ₹{entry.amount}</p>
        <p className="text-sm text-white">
          Status:{' '}
          <span className={entry.status === 'succeeded' ? 'text-green-400' : 'text-red-400'}>
            {entry.status}
          </span>
        </p>
        {relatedMission && (
          <p className="text-sm text-gray-400 mt-1">
            {relatedMission.difficulty} | {relatedMission.Location}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Date:{' '}
          {entry.paidAt
            ? new Date(entry.paidAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'N/A'}
        </p>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-pulse"></div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'grid-move 20s linear infinite',
            }}
          ></div>
        </div>
        <motion.div
          className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          style={{ left: mousePosition.x - 192, top: mousePosition.y - 192 }}
          transition={{ type: 'spring', stiffness: 50, damping: 30 }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8">
        <motion.h2
          className="text-5xl md:text-7xl font-black text-center uppercase tracking-widest mb-12"
          variants={itemVariants}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
        >
          <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
            Your Rewards
          </span>
        </motion.h2>

        {/* Total Reward */}
        <motion.div
          className="max-w-3xl mx-auto mb-10"
          variants={itemVariants}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
        >
          <div className="bg-[#0f172a] p-6 rounded-xl shadow-lg border border-green-500/30">
            <h3 className="text-3xl font-bold mb-4 text-center text-green-300">🏅 Total Reward</h3>
            <p className="text-center text-4xl font-extrabold text-yellow-400">
              ₹ {totalReward ?? '...'}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
        >
          {/* Paid Rewards */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-green-400 text-center">✅ Paid Rewards</h3>
            {paidTransactions.length === 0 ? (
              <p className="text-center text-gray-400">No paid rewards yet.</p>
            ) : (
              <div className="space-y-4">
                {paidTransactions.map((entry, idx) => renderTransactionCard(entry, idx))}
              </div>
            )}
          </div>

          {/* Pending Rewards */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-red-400 text-center">⏳ Pending Rewards</h3>
            {pendingTransactions.length === 0 ? (
              <p className="text-center text-gray-400">No pending rewards.</p>
            ) : (
              <div className="space-y-4">
                {pendingTransactions.map((entry, idx) => renderTransactionCard(entry, idx))}
              </div>
            )}
          </div>
        </motion.div>
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
}

export default UserReward;
