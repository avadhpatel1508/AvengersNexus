import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import { useSelector } from 'react-redux';
import Footer from '../components/Footer';

function AvengersPage() {
  const [avengers, setAvengers] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    const fetchAvengers = async () => {
      try {
        const response = await axiosClient.get('/user/users');
        const data = response.data.users || [];
        setAvengers(data);
        setIsLoaded(true);
        if (data.length === 0) setError('No avengers found.');
      } catch (err) {
        setError('Failed to load avengers.');
        setIsLoaded(true);
        console.error(err);
      }
    };

    fetchAvengers();

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

      {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center py-4 px-4 sm:px-6"> {/* Reduced py-10 to py-4 */}
        <div className="container mx-auto">
        

          {/* Error Message */}
          {error && (
            <motion.p
              className="text-center text-lg text-red-400 mb-10"
              variants={itemVariants}
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
            >
              {error}
            </motion.p>
          )}

          {/* Avengers Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto mb-10"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
          >
            {avengers.length === 0 && isLoaded ? (
              <motion.p
                className="col-span-full text-center text-xl text-gray-400"
                variants={itemVariants}
              >
                No Avengers Found.
              </motion.p>
            ) : (
              avengers.map((avenger) => (
                <motion.div
                  key={avenger._id}
                  className="relative bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl perspective-1000"
                  variants={itemVariants}
                  whileHover={{ rotateY: 5, rotateX: 2, scale: 1.05 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                 
                  <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
                    {avenger.firstName}
                  </h3>
                  <p className="text-gray-300 mb-6 text-md">{avenger.emailId}</p>

                  <div className="space-y-2 text-md">
                    <p>
                      <span className="text-white font-semibold">🆔 ID:</span>{' '}
                      <span className="text-gray-400">{avenger._id}</span>
                    </p>
                    <p>
                      <span className="text-white font-semibold">🛡️ Role:</span>{' '}
                      <span
                        className={`font-bold ${
                          avenger.role === 'admin' ? 'text-red-400' : 'text-blue-400'
                        }`}
                      >
                        {avenger.role}
                      </span>
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
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

export default AvengersPage;