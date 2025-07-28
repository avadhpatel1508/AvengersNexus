import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';
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
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative overflow-hidden">
      {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-blue-950"></div>

        <div className="absolute inset-0 opacity-10">
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

        {/* Spotlight */}
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)',
          }}
          transition={{ type: 'spring', stiffness: 20, damping: 30 }}
        />

        {/* Light beams */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-1 h-full bg-gradient-to-b from-red-500/20 to-transparent animate-pulse rotate-12"></div>
          <div className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-blue-500/20 to-transparent animate-pulse -rotate-6 delay-1000"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col justify-start relative z-10">
        {/* Header */}
        <motion.h2
          className="text-5xl md:text-7xl font-black text-center uppercase tracking-widest mt-10 mb-12"
          variants={itemVariants}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
        >
          <span className="bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
            Avengers Roster
          </span>
        </motion.h2>

        {/* Error Message */}
        {error && (
          <motion.p
            className="text-center text-sm text-red-400 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.p>
        )}

        {/* Avengers Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto px-6 mb-20"
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
                className="relative bg-gradient-to-br from-slate-800/60 via-black/40 to-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-xl group hover:scale-105 transition duration-300"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full animate-ping delay-500"></div>

                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
                  {avenger.firstName}
                </h3>
                <p className="text-gray-300 mb-4 text-sm">{avenger.emailId}</p>

                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-white font-semibold">🆔 ID:</span>{' '}
                    <span className="text-gray-400">{avenger._id}</span>
                  </p>
                  <p>
                    <span className="text-white font-semibold">🛡️ Role:</span>{' '}
                    <span className={`font-bold ${avenger.role === 'admin' ? 'text-red-400' : 'text-blue-400'}`}>
                      {avenger.role}
                    </span>
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Custom Animations */}
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
    </div>
  );
}

export default AvengersPage;
