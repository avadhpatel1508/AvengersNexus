import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';
import { useSelector } from 'react-redux';

function AdminFeedbackPage() {
  const user = useSelector((state) => state.auth?.user);
  const [feedbacks, setFeedbacks] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axiosClient.get('/feedback/getall');
        const feedbackData = Array.isArray(response.data.feedbacks) ? response.data.feedbacks : [];

        const feedbacksWithUserInfo = await Promise.all(
          feedbackData.map(async (feedback) => {
            if (feedback.user) {
              try {
                const userRes = await axiosClient.get(`/user/getUser/${feedback.user}`);
                return { ...feedback, user: userRes.data };
              } catch {
                return { ...feedback, user: null };
              }
            }
            return feedback;
          })
        );

        setFeedbacks(feedbacksWithUserInfo);
        if (feedbacksWithUserInfo.length === 0) {
          setError('No feedbacks found.');
        }
      } catch (error) {
        console.error('Error fetching feedbacks:', error.response?.data || error.message);
        setError('Failed to load feedbacks.');
        setFeedbacks([]);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchFeedbacks();

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleMarkAsSeen = async (id) => {
    try {
      await axiosClient.delete(`/feedback/delete/${id}`);
      setFeedbacks((prev) => prev.filter((fb) => fb._id !== id));
    } catch (error) {
      console.error('Error marking feedback as seen:', error.response?.data || error.message);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <AdminNavbar />

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
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
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8">
        <motion.h2
          className="text-5xl md:text-7xl font-black text-center uppercase tracking-widest mb-12"
          variants={itemVariants}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
        >
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Feedbacks
          </span>
        </motion.h2>

        {error ? (
          <motion.p
            className="text-center text-lg text-red-400 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
          >
            {feedbacks.map((fb) => (
              <motion.div
                key={fb._id}
                className="relative bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-cyan-400/30 hover:scale-105 transition-transform duration-300"
                variants={itemVariants}
              >
                <div className="absolute top-2 left-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="absolute top-2 right-2 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-500"></div>

                <h3 className="text-xl font-bold mb-2 text-cyan-400">
                  From: {fb.user?.firstName || 'Anonymous'}
                </h3>
                <p className="text-gray-300 mb-4">{fb.message || 'No message provided.'}</p>

                <p className="text-sm text-gray-500 mt-2">
                  <strong>Submitted:</strong>{' '}
                  {new Date(fb.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>

                <button
                  onClick={() => handleMarkAsSeen(fb._id)}
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm transition"
                >
                  Mark as Seen
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
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

export default AdminFeedbackPage;
