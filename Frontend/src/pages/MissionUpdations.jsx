import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';

const modes = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

const MissionUpdations = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(modes.CREATE);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    Location: '',
    avengersAssigned: [],
    difficulty: 'easy',
    isCompleted: false,
    completedAt: null,
    completedBy: null
  });
  const [users, setUsers] = useState([]);
  const [allMissions, setAllMissions] = useState([]);
  const [selectedMissionId, setSelectedMissionId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosClient.get('/user/users');
        const usersArray = Array.isArray(response.data.users) ? response.data.users : [];
        const validUsers = usersArray.filter(
          user => user._id && user.firstName && user.role === 'user'
        );
        setUsers(validUsers);
        if (validUsers.length === 0) {
          setError('No users with role "user" found.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users.');
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (mode !== modes.CREATE) {
      axiosClient.get('/mission/getAllMission')
        .then(res => {
          const data = Array.isArray(res.data) ? res.data : res.data.missions;
          setAllMissions(data || []);
        })
        .catch(() => setError('Failed to fetch missions.'));
    }
  }, [mode]);

  useEffect(() => {
    if (mode === modes.UPDATE && selectedMissionId) {
      axiosClient.get(`/mission/${selectedMissionId}`)
        .then(res => {
          const data = res.data.mission;
          setFormData({
            title: data.title || '',
            description: data.description || '',
            Location: data.Location || '',
            avengersAssigned: data.avengersAssigned || [],
            difficulty: data.difficulty || 'easy',
            isCompleted: data.isCompleted || false,
            completedAt: data.completedAt || null,
            completedBy: data.completedBy || null
          });
        })
        .catch(() => setError('Failed to fetch mission data.'));
    }
  }, [selectedMissionId]);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCheckboxChange = (userId) => {
    setFormData(prev => {
      const avengersAssigned = prev.avengersAssigned.includes(userId)
        ? prev.avengersAssigned.filter(id => id !== userId)
        : [...prev.avengersAssigned, userId];
      return { ...prev, avengersAssigned };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (formData.avengersAssigned.length === 0) {
      setError('Assign at least one Avenger');
      setIsSubmitting(false);
      return;
    }

    const updatedFormData = { ...formData };

    if (updatedFormData.isCompleted && !updatedFormData.completedAt) {
      updatedFormData.completedAt = new Date().toISOString();
    }

    if (updatedFormData.isCompleted && !updatedFormData.completedBy) {
      updatedFormData.completedBy = "System"; // Or currentUser._id if available
    }

    try {
      if (mode === modes.CREATE) {
        await axiosClient.post('/mission/create', updatedFormData);
        setSuccess('✅ Mission created!');
      } else if (mode === modes.UPDATE && selectedMissionId) {
        await axiosClient.patch(`/mission/${selectedMissionId}`, updatedFormData);
        setSuccess('✅ Mission updated!');
      }

      setFormData({
        title: '',
        description: '',
        Location: '',
        avengersAssigned: [],
        difficulty: 'easy',
        isCompleted: false,
        completedAt: null,
        completedBy: null
      });

      setTimeout(() => navigate('/missions'), 1500);
    } catch (err) {
      setError('❌ ' + (err.response?.data?.message || 'Submission failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMissionId) {
      setError("Select a mission to delete");
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
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
        <motion.div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          style={{ left: mousePosition.x - 192, top: mousePosition.y - 192 }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-lg">
          {/* Mode Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            {Object.values(modes).map(m => (
              <button key={m} onClick={() => {
                setMode(m);
                setError('');
                setSuccess('');
                setFormData({
                  title: '',
                  description: '',
                  Location: '',
                  avengersAssigned: [],
                  difficulty: 'easy',
                  isCompleted: false,
                  completedAt: null,
                  completedBy: null
                });
              }} className={`px-4 py-2 rounded ${mode === m ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Dropdown for update/delete */}
          {mode !== modes.CREATE && (
            <select
              value={selectedMissionId}
              onChange={(e) => setSelectedMissionId(e.target.value)}
              className="w-full p-3 bg-black/20 border border-cyan-400/30 text-white rounded mb-4"
            >
              <option value="">Select a mission</option>
              {allMissions.map(m => (
                <option key={m._id} value={m._id}>{m.title}</option>
              ))}
            </select>
          )}

          {/* Form for create/update */}
          {mode !== modes.DELETE && (
            <motion.form
              onSubmit={handleSubmit}
              className="bg-black/50 backdrop-blur-md p-8 rounded-lg border border-cyan-400/20 shadow-lg flex flex-col gap-5"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {mode === modes.UPDATE ? 'Update Mission' : 'Create New Avengers Mission'}
              </h2>

              {error && <p className="text-center text-sm text-red-400">{error}</p>}
              {success && <p className="text-center text-sm text-green-400">{success}</p>}

              <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required className="bg-black/20 border border-cyan-400/30 p-3 rounded text-white" />
              <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="bg-black/20 border border-cyan-400/30 p-3 rounded text-white h-32" />
              <input name="Location" placeholder="Location" value={formData.Location} onChange={handleChange} required className="bg-black/20 border border-cyan-400/30 p-3 rounded text-white" />

              <div>
                <label className="block mb-1">Assign Avengers:</label>
                <div className="bg-black/20 border border-cyan-400/30 rounded p-2 max-h-40 overflow-y-auto">
                  {users.map(user => (
                    <label key={user._id} className="block text-white">
                      <input type="checkbox" checked={formData.avengersAssigned.includes(user._id)} onChange={() => handleCheckboxChange(user._id)} className="mr-2" />
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

              <label className="text-white">
                <input type="checkbox" name="isCompleted" checked={formData.isCompleted} onChange={handleChange} className="mr-2" />
                Mark as Completed
              </label>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`bg-gradient-to-r from-cyan-500 to-purple-600 p-3 rounded text-white font-semibold ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                {isSubmitting ? 'Processing...' : (mode === modes.UPDATE ? 'Update Mission' : 'Deploy Mission')}
              </motion.button>
            </motion.form>
          )}

          {/* Delete Button */}
          {mode === modes.DELETE && (
            <motion.button
              onClick={handleDelete}
              disabled={isSubmitting}
              className={`w-full bg-red-600 p-3 rounded text-white font-semibold mt-4 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Mission'}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionUpdations;


