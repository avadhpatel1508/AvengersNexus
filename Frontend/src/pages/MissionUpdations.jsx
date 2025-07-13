
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';

const MissionUpdations = () => {
  const navigate = useNavigate();
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvengersDropdownOpen, setIsAvengersDropdownOpen] = useState(false);
  const [isDifficultyDropdownOpen, setIsDifficultyDropdownOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Fetch users with role === 'user'
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get('/user/users');
        console.log('API Response:', response.data);

        const usersArray = Array.isArray(response.data.users) ? response.data.users : [];
        const validUsers = usersArray.filter(
          user => user._id && user.firstName && user.firstName.trim() !== '' && user.role === 'user'
        );

        setUsers(validUsers);

        if (validUsers.length === 0) {
          setError('No users with role "user" found. Please check the API or add users.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users. Please ensure the API server is running.');
        setUsers([]);
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle mouse movement for background effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      setError('Please assign at least one Avenger to the mission');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axiosClient.post('/mission/create', {
        ...formData,
        avengersAssigned: formData.avengersAssigned
      });
      console.log('Mission Creation Response:', response.data);
      setSuccess('✅ Mission created successfully!');
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
      console.error('Mission Creation Error:', err.response?.data);
      setError('❌ ' + (err.response?.data?.message || 'Failed to create mission'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>

        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite',
          }}></div>
        </div>

        <motion.div
          className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
        />

        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <motion.form
          onSubmit={handleSubmit}
          className="bg-black/50 backdrop-blur-md p-8 rounded-lg border border-cyan-400/20 shadow-lg w-full max-w-lg flex flex-col gap-5"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent text-center">
            Create New Avengers Mission
          </h2>

          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}
          {success && (
            <p className="text-center text-sm text-green-400">{success}</p>
          )}

          <input
            type="text"
            name="title"
            placeholder="Mission Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="border border-cyan-400/30 bg-black/20 p-3 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition"
          />

          <textarea
            name="description"
            placeholder="Description (10 - 100 characters)"
            value={formData.description}
            onChange={handleChange}
            minLength={10}
            maxLength={100}
            required
            className="border border-cyan-400/30 bg-black/20 p-3 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition h-32"
          />

          <input
            type="text"
            name="Location"
            placeholder="Mission Location (2-15 characters)"
            value={formData.Location}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={15}
            className="border border-cyan-400/30 bg-black/20 p-3 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAvengersDropdownOpen(!isAvengersDropdownOpen)}
              disabled={isLoading || users.length === 0}
              className="w-full border border-cyan-400/30 bg-black/20 p-3 rounded text-white text-left focus:outline-none focus:border-cyan-400 transition disabled:opacity-50"
            >
              {isLoading ? 'Loading heroes...' : 
               users.length === 0 ? 'No heroes available' : 
               formData.avengersAssigned.length === 0 ? 'Select heroes' : 
               `${formData.avengersAssigned.length} hero${formData.avengersAssigned.length > 1 ? 'es' : ''} selected`}
            </button>
            {isAvengersDropdownOpen && !isLoading && users.length > 0 && (
              <div className="absolute z-20 mt-2 w-full bg-black/50 backdrop-blur-md border border-cyan-400/30 rounded shadow-lg max-h-60 overflow-y-auto">
                {users.map(user => (
                  <label
                    key={user._id}
                    className="flex items-center p-3 hover:bg-cyan-400/20 cursor-pointer text-white"
                  >
                    <input
                      type="checkbox"
                      checked={formData.avengersAssigned.includes(user._id)}
                      onChange={() => handleCheckboxChange(user._id)}
                      className="mr-2 accent-cyan-400"
                    />
                    {user.firstName}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDifficultyDropdownOpen(!isDifficultyDropdownOpen)}
              className="w-full border border-cyan-400/30 bg-black/50 p-3 rounded text-white text-left focus:outline-none focus:border-cyan-400 transition"
            >
              {formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1) || 'Select difficulty'}
            </button>
            {isDifficultyDropdownOpen && (
              <div className="absolute z-20 mt-2 w-full bg-black/50 backdrop-blur-md border border-cyan-400/30 rounded shadow-lg">
                {['easy', 'medium', 'hard'].map(difficulty => (
                  <div
                    key={difficulty}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, difficulty }));
                      setIsDifficultyDropdownOpen(false);
                    }}
                    className="p-3 hover:bg-cyan-400/20 cursor-pointer text-white"
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`bg-gradient-to-r from-cyan-500 to-purple-600 p-3 rounded text-white font-semibold transition-all ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'
            }`}
            whileHover={isSubmitting ? {} : { scale: 1.05 }}
            whileTap={isSubmitting ? {} : { scale: 0.95 }}
          >
            {isSubmitting ? 'Deploying...' : 'Deploy Mission'}
          </motion.button>
        </motion.form>
      </div>

      {/* Custom Keyframes */}
      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};

export default MissionUpdations;
