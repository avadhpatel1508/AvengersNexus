import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';

const Success = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const missionId = new URLSearchParams(location.search).get('missionId');

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const res = await axiosClient.post('/payment/confirm-payment', {
          missionId,
        });

        if (res.data.success) {
          setMessage('🎉 Payment successful and mission status updated!');
        } else {
          setMessage('⚠️ Payment success, but failed to confirm mission.');
        }
      } catch (err) {
        setMessage('❌ Payment processed but backend confirmation failed.');
      } finally {
        setLoading(false);
      }
    };

    if (missionId) confirmPayment();
    else {
      setMessage('No mission ID found. Redirecting...');
      setTimeout(() => navigate('/missions'), 2000);
    }
  }, [missionId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">Payment Success</h1>
      <p className="text-lg">{loading ? 'Processing confirmation...' : message}</p>
      <button
        onClick={() => navigate('/missions')}
        className="mt-8 bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded text-white"
      >
        Go to Missions
      </button>
    </div>
  );
};

export default Success;
