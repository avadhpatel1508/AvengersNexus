import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import { useSelector } from 'react-redux';
import Footer from '../components/Footer';
import Loader from './Loader';

function PostsPage() {
  const user = useSelector((state) => state.auth?.user);
  const [posts, setPosts] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('all');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postResponse = await axiosClient.get('/post/');
        const postData = Array.isArray(postResponse.data) ? postResponse.data : [];

        const postsWithAvengers = await Promise.all(
          postData.map(async (post) => {
            if (Array.isArray(post.avengersAssigned) && post.avengersAssigned.length > 0) {
              const avengerPromises = post.avengersAssigned.map(async (avengerId) => {
                try {
                  const avengerResponse = await axiosClient.get(`/user/getUser/${avengerId}`);
                  const avenger = avengerResponse.data;
                  return avenger && avenger._id ? avenger : null;
                } catch {
                  return null;
                }
              });
              const avengers = (await Promise.all(avengerPromises)).filter(Boolean);
              return { ...post, avengersAssigned: avengers };
            }
            return { ...post, avengersAssigned: [] };
          })
        );

        setPosts(postsWithAvengers);
        if (postsWithAvengers.length === 0) {
          setError('No posts found.');
        }
      } catch (error) {
        console.error('Error fetching posts:', error.response?.data || error.message);
        setError('Failed to load posts.');
        setPosts([]);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchPosts();

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Sorting function
  const sortedPosts = () => {
    if (sortBy === 'all') return posts;
    return posts.filter((post) =>
      post.importance &&
      post.importance.trim().toLowerCase() === sortBy
    );
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

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

      {/* Loader */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-blue-950"></div>

        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
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

        {/* Rotating Star */}
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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen pt-10 px-4 sm:px-6"> {/* Added pt-24 for fixed header spacing */}
        {/* Fixed Sorting Controls */}
        <div className=" top-24 left-0 right-0 z-20 py-4">
          <div className="container mx-auto flex justify-center space-x-4 px-4">
            <button
              onClick={() => setSortBy('all')}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-300 ${
                sortBy === 'all'
                  ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setSortBy('important')}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-300 ${
                sortBy === 'important'
                  ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Important
            </button>
            <button
              onClick={() => setSortBy('not-important')}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-300 ${
                sortBy === 'not-important'
                  ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Not Important
            </button>
          </div>
        </div>

        <div className="container mx-auto mt-4"> {/* Small margin to keep posts close to buttons */}
          {error && sortedPosts().length === 0 ? (
            <motion.p
              className="text-center text-lg text-red-400"
              variants={itemVariants}
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
            >
              {error}
            </motion.p>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
            >
              {sortedPosts().map((post) => (
                <motion.div
                  key={post._id}
                  className="relative bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl perspective-1000"
                  variants={itemVariants}
                  whileHover={{ rotateY: 5, rotateX: 2, scale: 1.05 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Conditionally Render Importance Badge */}
                  {post.importance &&
                    post.importance.trim().toLowerCase() !== 'not-important' &&
                    post.importance.trim() !== '' && (
                      <div
                        className="absolute -top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded text-xs font-mono border border-white/20"
                        style={{ color: 'yellow' }}
                      >
                        {post.importance.charAt(0).toUpperCase() + post.importance.slice(1).toLowerCase()}
                      </div>
                    )}

                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
                    {post.title}
                  </h3>
                  <p className="text-gray-300 mb-6">{post.description}</p>

                  <div className="space-y-2 text-md">
                    <p>
                      <span className="text-white font-semibold">🕒 Posted on:</span>{' '}
                      <span className="text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </p>
                    <p>
                      <span className="text-white font-semibold">🦸 Assigned Avengers:</span>{' '}
                      <span className="text-gray-400">
                        {post.avengersAssigned.map((a) => a.firstName).join(', ') || 'None'}
                      </span>
                    </p>
                  </div>

                  {/* Scan Lines */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-pulse"></div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <Footer />

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
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

export default PostsPage;