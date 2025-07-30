  import { useState } from 'react';
  import { motion } from 'framer-motion';
  import axiosClient from '../utils/axiosClient';

  const FeedbackForm = () => {
    const [userId, setUserId] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setStatus('');

      try {
        const response = await axiosClient.post('/feedback/feedback', {
          user: userId,
          message,
        });

        console.log('✅ Feedback sent successfully:', response.data);
        setStatus('✅ Feedback submitted successfully!');
        setMessage('');
        setUserId('');
      } catch (error) {
        console.error('❌ Error submitting feedback:', error);
        setStatus('❌ Failed to submit feedback');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-blue-950 p-6">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-lg rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl p-8 text-white"
        >
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-center mb-6 text-white/90"
          >
            ✉️ Share Your Feedback
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.input
              type="text"
              placeholder="Enter your User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              whileFocus={{ scale: 1.02 }}
            />

            <motion.textarea
              rows="4"
              placeholder="Write your feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              whileFocus={{ scale: 1.02 }}
            />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-blue-600 text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Feedback'}
            </motion.button>
          </form>

          {status && (
            <motion.p
              className={`mt-5 text-center ${
                status.startsWith('✅') ? 'text-green-400' : 'text-red-400'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {status}
            </motion.p>
          )}
        </motion.div>
      </div>
    );
  };

  export default FeedbackForm;
