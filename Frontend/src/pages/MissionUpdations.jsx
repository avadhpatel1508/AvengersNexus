import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import { useSelector } from 'react-redux';
import Footer from '../components/Footer';

const modes = {
  CREATE: 'create',
  UPDATE: 'complete',
  DELETE: 'delete',
};

const MissionUpdations = () => {
  const user = useSelector((state) => state.auth?.user);
  const navigate = useNavigate();

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
    if (mode === modes.CREATE) {
      axiosClient.get('/user/users')
        .then(res => {
          const validUsers = (res.data.users || []).filter(
            user => user._id && user.firstName && user.role === 'user'
          );
          setUsers(validUsers);
        })
        .catch(() => setError('Failed to fetch users.'));
    }
  }, [mode]);

  useEffect(() => {
    axiosClient.get('/mission/getAllMission')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.missions;
        const filtered = mode === modes.UPDATE
          ? data.filter(m => !m.isCompleted)
          : data;
        setAllMissions(filtered || []);
      })
      .catch(() => setError('Failed to fetch missions.'));
  }, [mode]);

  useEffect(() => {
    const handleMouseMove = (e) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCheckboxChange = (userId) => {
    setFormData(prev => {
      const updated = prev.avengersAssigned.includes(userId)
        ? prev.avengersAssigned.filter(id => id !== userId)
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

      await axiosClient.post('/mission/create', {
        ...formData,
        amount: Number(formData.amount),
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
      const mission = allMissions.find(m => m._id === selectedMissionId);
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
      setAllMissions(prev => prev.filter(m => m._id !== selectedMissionId));
      setSelectedMissionId('');
    } catch (err) {
      setError('❌ ' + (err.response?.data?.message || 'Delete failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        <motion.div
          className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          style={{ left: mousePosition.x - 192, top: mousePosition.y - 192 }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-lg">
          <div className="flex justify-center gap-4 mb-6">
            {Object.values(modes).map((m) => (
              <button
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
                className={`px-4 py-2 rounded ${
                  mode === m ? 'bg-cyan-500' : 'bg-gray-700'
                }`}
              >
                {m === 'complete' ? 'Complete Mission' : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          <motion.div
            className="bg-black/50 backdrop-blur-md p-8 rounded-lg border border-cyan-400/20 shadow-lg flex flex-col gap-5"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {(mode === modes.UPDATE || mode === modes.DELETE) && (
              <select
                value={selectedMissionId}
                onChange={(e) => setSelectedMissionId(e.target.value)}
                className="w-full p-3 bg-black/20 border border-cyan-400/30 text-white rounded"
              >
                <option value="">Select a mission</option>
                {allMissions.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.title}
                  </option>
                ))}
              </select>
            )}

            {error && <p className="text-center text-sm text-red-400">{error}</p>}
            {success && <p className="text-center text-sm text-green-400">{success}</p>}

            {mode === modes.CREATE && (
              <>
                <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Create New Avengers Mission
                </h2>
                <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required className="bg-black/20 border border-cyan-400/30 p-3 rounded text-white" />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="bg-black/20 border border-cyan-400/30 p-3 rounded text-white h-32" />
                <input name="Location" placeholder="Location" value={formData.Location} onChange={handleChange} required className="bg-black/20 border border-cyan-400/30 p-3 rounded text-white" />
                <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} className="bg-black/20 border border-cyan-400/30 p-3 rounded text-white" />

                <div>
                  <label className="block mb-1">Assign Avengers:</label>
                  <div className="bg-black/20 border border-cyan-400/30 rounded p-2 max-h-40 overflow-y-auto">
                    {users.map(user => (
                      <label key={user._id} className="block text-white">
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
                </div>

                <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="bg-black/20 border border-cyan-400/30 p-2 rounded text-white">
                  {['easy', 'medium', 'hard'].map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </>
            )}

            {(mode === modes.CREATE || mode === modes.UPDATE) && (
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={(mode === modes.UPDATE && !selectedMissionId) || isSubmitting}
                className={`${
                  mode === modes.CREATE
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600'
                    : 'bg-green-600'
                } p-3 rounded text-white font-semibold ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
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
                className={`w-full bg-red-600 p-3 rounded text-white font-semibold ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Mission'}
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MissionUpdations;
