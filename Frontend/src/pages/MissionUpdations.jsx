import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import Loader from './Loader'; // Assuming Loader component is in this path

const modes = {
  CREATE: 'create',
  UPDATE: 'complete',
  DELETE: 'delete',
};

const MissionUpdations = () => {
  const user = useSelector((state) => state.auth?.user);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [mode, setMode] = useState(modes.CREATE);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    Location: '',
    avengersAssigned: [],
    difficulty: 'easy',
    amount: '',
    isCompleted: false,
    completedAt: null,
    completedBy: null,
  });
  const [users, setUsers] = useState([]);
  const [allMissions, setAllMissions] = useState([]);
  const [selectedMissionId, setSelectedMissionId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);

    // Mouse position tracking
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Fetch users for CREATE mode
    if (mode === modes.CREATE) {
      axiosClient
        .get('/user/users')
        .then((res) => {
          const validUsers = (res.data.users || []).filter(
            (user) => user._id && user.firstName && user.role === 'user'
          );
          setUsers(validUsers);
        })
        .catch(() => setError('Failed to fetch users.'));
    }

    // Fetch missions
    axiosClient
      .get('/mission/getAllMission')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.missions;
        const filtered = mode === modes.UPDATE ? data.filter((m) => !m.isCompleted) : data;
        setAllMissions(filtered || []);
      })
      .catch(() => setError('Failed to fetch missions.'));

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, [mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCheckboxChange = (userId) => {
    setFormData((prev) => {
      const updated = prev.avengersAssigned.includes(userId)
        ? prev.avengersAssigned.filter((id) => id !== userId)
        : [...prev.avengersAssigned, userId];
      return { ...prev, avengersAssigned: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (mode === modes.CREATE) {
        if (formData.avengersAssigned.length === 0) {
          setError('Assign at least one Avenger.');
          setIsSubmitting(false);
          return;
        }

        if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
          setError('Enter a valid amount.');
          setIsSubmitting(false);
          return;
        }

        const { title, description, Location, avengersAssigned, difficulty, amount } = formData;

        await axiosClient.post('/mission/create', {
          title,
          description,
          Location,
          avengersAssigned,
          difficulty,
          amount: Number(amount),
        });

        setSuccess('✅ Mission created!');
        setFormData({
          title: '',
          description: '',
          Location: '',
          avengersAssigned: [],
          difficulty: 'easy',
          amount: '',
          isCompleted: false,
          completedAt: null,
          completedBy: null,
        });
      }

      if (mode === modes.UPDATE && selectedMissionId) {
        const mission = allMissions.find((m) => m._id === selectedMissionId);
        await axiosClient.patch(`/mission/complete/${selectedMissionId}`, {
          amount: mission?.amount || 0,
        });
        setSuccess('✅ Mission marked as complete!');
      }

      setTimeout(() => navigate('/missions'), 1500);
    } catch (err) {
      setError('❌ ' + (err.response?.data?.error || err.message || 'Submission failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMissionId) {
      setError('Select a mission to delete');
      return;
    }
    setIsSubmitting(true);
    try {
      await axiosClient.delete(`/mission/${selectedMissionId}`);
      setSuccess('🗑️ Mission deleted!');
      setAllMissions((prev) => prev.filter((m) => m._id !== selectedMissionId));
      setSelectedMissionId('');
    } catch (err) {
      setError('❌ ' + (err.response?.data?.message || 'Delete failed.'));
    } finally {
      setIsSubmitting(false);
    }
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

  // Fallback Loader component
  const FallbackLoader = () => (
    <div className="flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-t-4 border-white border-opacity-50 rounded-full animate-spin"></div>
      <p className="mt-4 text-white text-lg">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
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

          {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

          {/* Mission Form Section */}
          <div className="relative z-10 min-h-screen flex items-center py-10 px-4 sm:px-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="container mx-auto max-w-3xl text-center"
            >
              <motion.h2
                variants={itemVariants}
                className="text-3xl sm:text-4xl font-bold text-white mb-6"
              >
                {mode === modes.CREATE
                  ? 'Create New Avengers Mission'
                  : mode === modes.UPDATE
                  ? 'Complete a Mission'
                  : 'Delete a Mission'}
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-gray-400 mb-8 text-lg"
              >
                Manage Avengers missions by creating, completing, or deleting them.
              </motion.p>
              <motion.div
                className="flex justify-center gap-4 mb-6"
                variants={itemVariants}
              >
                {Object.values(modes).map((m) => (
                  <motion.button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setError('');
                      setSuccess('');
                      setFormData({
                        title: '',
                        description: '',
                        Location: '',
                        avengersAssigned: [],
                        difficulty: 'easy',
                        amount: '',
                        isCompleted: false,
                        completedAt: null,
                        completedBy: null,
                      });
                      setSelectedMissionId('');
                    }}
                    className={`px-4 py-2 rounded-lg text-white font-semibold ${
                      mode === m
                        ? 'bg-gradient-to-r from-red-500 to-blue-500'
                        : 'bg-slate-800 border border-white/10 hover:bg-slate-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {m === 'complete' ? 'Complete Mission' : m.charAt(0).toUpperCase() + m.slice(1)}
                  </motion.button>
                ))}
              </motion.div>
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6 bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl"
                variants={itemVariants}
              >
                {(mode === modes.UPDATE || mode === modes.DELETE) && (
                  <motion.select
                    value={selectedMissionId}
                    onChange={(e) => setSelectedMissionId(e.target.value)}
                    className="w-full p-4 rounded-lg bg-slate-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    variants={itemVariants}
                  >
                    <option value="">Select a mission</option>
                    {allMissions.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title}
                      </option>
                    ))}
                  </motion.select>
                )}

                {error && (
                  <motion.p
                    variants={itemVariants}
                    className="text-red-400 text-sm"
                  >
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p
                    variants={itemVariants}
                    className="text-green-400 text-sm"
                  >
                    {success}
                  </motion.p>
                )}

                {mode === modes.CREATE && (
                  <>
                    <motion.input
                      name="title"
                      placeholder="Mission Title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full p-4 rounded-lg bg-slate-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      variants={itemVariants}
                    />
                    <motion.textarea
                      name="description"
                      placeholder="Mission Description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="w-full p-4 rounded-lg bg-slate-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                      variants={itemVariants}
                    />
                    <motion.input
                      name="Location"
                      placeholder="Location"
                      value={formData.Location}
                      onChange={handleChange}
                      required
                      className="w-full p-4 rounded-lg bg-slate-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      variants={itemVariants}
                    />
                    <motion.input
                      type="number"
                      name="amount"
                      placeholder="Amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full p-4 rounded-lg bg-slate-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      variants={itemVariants}
                    />
                    <motion.div variants={itemVariants}>
                      <label className="block mb-1 text-left text-gray-300">Assign Avengers:</label>
                      <div className="bg-slate-800 border border-white/10 rounded-lg p-2 max-h-40 overflow-y-auto">
                        {users.map((user) => (
                          <label key={user._id} className="block text-white py-1 px-2">
                            <input
                              type="checkbox"
                              checked={formData.avengersAssigned.includes(user._id)}
                              onChange={() => handleCheckboxChange(user._id)}
                              className="mr-2"
                            />
                            {user.firstName}
                          </label>
                        ))}
                      </div>
                    </motion.div>
                    <motion.select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="w-full p-4 rounded-lg bg-slate-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      variants={itemVariants}
                    >
                      {['easy', 'medium', 'hard'].map((diff) => (
                        <option key={diff} value={diff}>
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </option>
                      ))}
                    </motion.select>
                  </>
                )}

                {(mode === modes.CREATE || mode === modes.UPDATE) && (
                  <motion.button
                    type="submit"
                    disabled={(mode === modes.UPDATE && !selectedMissionId) || isSubmitting}
                    className={`w-full bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-lg ${
                      isSubmitting || (mode === modes.UPDATE && !selectedMissionId)
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-105 transition-transform duration-300'
                    }`}
                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                    variants={itemVariants}
                  >
                    {isSubmitting
                      ? mode === modes.CREATE
                        ? 'Deploying...'
                        : 'Completing...'
                      : mode === modes.CREATE
                      ? 'Deploy Mission'
                      : 'Complete Mission'}
                  </motion.button>
                )}

                {mode === modes.DELETE && (
                  <motion.button
                    onClick={handleDelete}
                    disabled={!selectedMissionId || isSubmitting}
                    className={`w-full bg-red-600 text-white font-semibold px-6 py-3 rounded-lg ${
                      isSubmitting || !selectedMissionId
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-105 transition-transform duration-300'
                    }`}
                    whileHover={{ scale: isSubmitting || !selectedMissionId ? 1 : 1.05 }}
                    whileTap={{ scale: isSubmitting || !selectedMissionId ? 1 : 0.95 }}
                    variants={itemVariants}
                  >
                    {isSubmitting ? 'Deleting...' : 'Delete Mission'}
                  </motion.button>
                )}
              </motion.form>
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
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default MissionUpdations;