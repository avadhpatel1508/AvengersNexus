import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';

function AvengersPage() {
  const [avengers, setAvengers] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
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
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 30 }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Page Header */}
      <motion.h2
        className="text-5xl md:text-7xl font-black text-center uppercase tracking-widest mt-24 mb-12 relative z-10"
        variants={itemVariants}
        initial="hidden"
        animate={isLoaded ? 'visible' : 'hidden'}
      >
        <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Avengers Roster
        </span>
      </motion.h2>

      {/* Error */}
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

      {/* Cards Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto p-8 relative z-10"
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
              className="relative bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-cyan-400/30 hover:scale-105 transition-transform duration-300 group"
              variants={itemVariants}
              whileHover={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)' }}
            >
              <div className="absolute top-2 left-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="absolute top-2 right-2 w-3 h-2 bg-purple-400 rounded-full animate-pulse delay-500"></div>

              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {avenger.firstName}
              </h3>
              <p className="text-gray-300 mb-3">{avenger.emailId}</p>

              <div className="text-sm space-y-2">
                <p>
                  <span className="font-semibold text-white">🆔 ID:</span>{' '}
                  <span className="text-gray-300">{avenger._id}</span>
                </p>
                <p>
                  <span className="font-semibold text-white">🕵️ Role:</span>{' '}
                  <span className={`capitalize font-bold ${
                    avenger.role === 'admin' ? 'text-purple-400' : 'text-cyan-400'
                  }`}>
                    {avenger.role}
                  </span>
                </p>
              </div>

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-pulse"></div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Custom Styles */}
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
