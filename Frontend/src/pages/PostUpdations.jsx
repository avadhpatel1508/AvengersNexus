import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import Loader from './Loader'; // Assuming Loader component is in this path

const PostUpdations = () => {
  const user = useSelector((state) => state.auth?.user);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    importance: 'important',
  });
  const [message, setMessage] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);

    // Redirect non-admins
    if (user && user.role !== 'admin') {
      setMessage('❌ Access denied: Admins only.');
      setTimeout(() => navigate('/'), 2000);
    }

    // Mouse position tracking
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setMessage('⚠️ Title and description cannot be empty.');
      return;
    }

    try {
      setMessage('Sending...');
      const response = await axiosClient.post('/post/create', formData, {
        withCredentials: true,
      });

      if (formData.importance === 'important') {
        await axiosClient.post(
          '/post/notify-important-post',
          {
            title: formData.title,
            description: formData.description,
          },
          { withCredentials: true }
        );
      }

      if (response.status === 200 || response.status === 201) {
        setFormData({ title: '', description: '', importance: 'important' });
        setMessage('✅ Post created successfully!');
      } else {
        setMessage('❌ Something went wrong. Please try again later.');
      }
    } catch (error) {
      const errMsg = error.response?.data || error.message;
      console.error('Error creating post:', errMsg);
      setMessage('❌ ' + errMsg);
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

          {/* Form Section */}
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
                Create a Post
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-gray-400 mb-8 text-lg"
              >
                Share important updates or announcements with your audience.
              </motion.p>
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6 bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl"
                variants={itemVariants}
              >
                {message && (
                  <motion.p
                    variants={itemVariants}
                    className="text-green-400 text-sm"
                  >
                    {message}
                  </motion.p>
                )}
                <motion.input
                  type="text"
                  name="title"
                  placeholder="Post Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full p-4 rounded-lg bg-slate-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  variants={itemVariants}
                />
                <motion.textarea
                  name="description"
                  placeholder="Description (10 - 300 characters)"
                  value={formData.description}
                  onChange={handleChange}
                  minLength={10}
                  maxLength={300}
                  required
                  className="w-full p-4 rounded-lg bg-slate-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  variants={itemVariants}
                />
                <motion.select
                  name="importance"
                  value={formData.importance}
                  onChange={handleChange}
                  className="w-full p-4 rounded-lg bg-slate-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  variants={itemVariants}
                >
                  <option value="important">Important</option>
                  <option value="not-important">Not Important</option>
                </motion.select>
                <motion.button
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:scale-105 transition-transform duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variants={itemVariants}
                >
                  Submit Post
                </motion.button>
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
          animation: spin-very-slow 60 _

        s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
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

export default PostUpdations;