import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminAttendance = () => {
  const [otp, setOtp] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [presentUsers, setPresentUsers] = useState([]);

  const handleStartAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/attendance/start');
      setOtp(res.data.otp); // only show in dev mode
      setExpiresAt(res.data.expiresAt);
      fetchPresentUsers(); // refresh present users after starting
    } catch (error) {
      alert("Failed to start attendance");
    } finally {
      setLoading(false);
    }
  };

  const fetchPresentUsers = async () => {
    try {
      const today = new Date();
      const start = new Date(today.setHours(0, 0, 0, 0));
      const end = new Date(today.setHours(23, 59, 59, 999));

      const res = await axios.get('/api/users/present', {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      });

      setPresentUsers(res.data.users);
    } catch (err) {
      console.error('Error fetching present users:', err);
    }
  };

  // Refresh present list every 10 seconds
  useEffect(() => {
    fetchPresentUsers();
    const interval = setInterval(fetchPresentUsers, 10000); // optional
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Admin Panel - Start Attendance</h2>

      <button
        onClick={handleStartAttendance}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        {loading ? 'Starting...' : 'Start Attendance'}
      </button>

      {otp && (
        <div className="mt-4 bg-gray-100 p-3 rounded text-sm">
          <p><strong>OTP:</strong> {otp}</p>
          <p><strong>Valid Until:</strong> {new Date(expiresAt).toLocaleTimeString()}</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Present Today</h3>
        {presentUsers.length > 0 ? (
          <ul className="list-disc ml-5">
            {presentUsers.map(user => (
              <li key={user._id}>
                {user.firstName} {user.lastName}
              </li>
            ))}
          </ul>
        ) : (
          <p>No users marked present yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;
