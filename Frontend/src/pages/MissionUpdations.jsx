import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';

const MissionUpdations = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    Location: '',
    avengersAssigned: '',
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

  // Fetch users with role === 'user'
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:4000/user/users');
        console.log('API Response:', response.data);

        // ✅ Filter users where role is 'user'
        const validUsers = Array.isArray(response.data.users)
          ? response.data.users.filter(
              user => user._id && user.firstName && user.firstName.trim() !== '' && user.role === 'user'
            )
          : [];

        setUsers(validUsers);

        if (validUsers.length === 0) {
          setError('No users found with role "user"');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
        setUsers([]);
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!formData.avengersAssigned) {
      setError('Please assign at least one Avenger to the mission');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post('/mission/create', {
        ...formData,
        avengersAssigned: [formData.avengersAssigned] // Send as array
      });
      console.log('Mission Creation Response:', response.data);
      setSuccess('Mission created successfully!');
      setFormData({
        title: '',
        description: '',
        Location: '',
        avengersAssigned: '',
        difficulty: 'easy',
        isCompleted: false,
        completedAt: null,
        completedBy: null
      });
      setTimeout(() => navigate('/missions'), 1500);
    } catch (err) {
      console.error('Mission Creation Error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to create mission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-indigo-500/50">
        <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-8 tracking-tight">
          Create New Avengers Mission
        </h1>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 animate-pulse">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 animate-pulse">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800">Mission Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 transition-all duration-200"
              placeholder="Enter mission title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              minLength={10}
              maxLength={100}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 transition-all duration-200"
              placeholder="Describe the mission (10-100 characters)"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">Location</label>
            <input
              type="text"
              name="Location"
              value={formData.Location}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={15}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 transition-all duration-200"
              placeholder="Enter mission location (2-15 characters)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">Avengers Assigned</label>
            {isLoading ? (
              <p className="text-gray-600 mt-2">Loading heroes...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-600 mt-2">No heroes available</p>
            ) : (
              <select
                name="avengersAssigned"
                value={formData.avengersAssigned}
                onChange={handleChange}
                required
                className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 transition-all duration-200"
              >
                <option value="">Select a hero</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              required
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 transition-all duration-200"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-200 active:scale-95 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Deploying...' : 'Deploy Mission'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MissionUpdations;
