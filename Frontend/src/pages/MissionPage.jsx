
import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';

function MissionsPage() {
  const [missions, setMissions] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch missions and user (avenger) details from API
    const fetchMissions = async () => {
      try {
        const missionResponse = await axiosClient.get('/mission/getAllMission');
        const missionData = Array.isArray(missionResponse.data) ? missionResponse.data : [];
        console.log('Fetched Missions:', missionData);

        const missionsWithAvengers = await Promise.all(
          missionData.map(async (mission) => {
            if (Array.isArray(mission.avengersAssigned) && mission.avengersAssigned.length > 0) {
              const avengerPromises = mission.avengersAssigned.map(async (avengerId) => {
                try {
                  const avengerResponse = await axiosClient.get(`/user/getUser/${avengerId}`);
                  const avenger = avengerResponse.data;
                  if (avenger && avenger._id && avenger.firstName) {
                    return avenger;
                  }
                  console.warn(`Invalid user data for ID ${avengerId}:`, avenger);
                  return null;
                } catch (error) {
                  console.error(`Error fetching user ${avengerId}:`, error.response?.data || error.message);
                  return null;
                }
              });
              const avengers = (await Promise.all(avengerPromises)).filter((avenger) => avenger !== null);
              return { ...mission, avengersAssigned: avengers };
            }
            return { ...mission, avengersAssigned: [] };
          })
        );

        setMissions(missionsWithAvengers);
        if (missionsWithAvengers.length === 0) {
          setError('No missions found in the database.');
        }
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching missions:', error.response?.data || error.message);
        setError('Failed to load missions. Please check the server connection.');
        setMissions([]);
        setIsLoaded(true);
      }
    };

    fetchMissions();

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const preloaderVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, scale: 1.2, transition: { duration: 0.5, ease: "easeIn" } },
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dynamic Background */}
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
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Avengers-Themed Preloader */}
      {!isLoaded && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/90 backdrop-blur-md"
          variants={preloaderVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="relative flex flex-col items-center justify-center">
            <motion.div
              className="relative w-64 h-64 rounded-full border-4 border-cyan-400/50 bg-black/50 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 10 L90 90 H60 L50 70 L40 90 H10 L50 10 Z" fill="url(#avengersGradient)" stroke="#22D3EE" strokeWidth="2" />
                  <circle cx="50" cy="50" r="40" stroke="#22D3EE" strokeWidth="2" fill="none" />
                  <defs>
                    <linearGradient id="avengersGradient" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#22D3EE" />
                      <stop offset="1" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
              <motion.div
                className="absolute inset-0 border-t-2 border-b-2 border-cyan-400/30"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              />
            </motion.div>

            <div className="relative w-80 h-4 mt-8 bg-black/50 rounded-full border border-cyan-400/30 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-scan"></div>
            </div>

            <motion.p
              className="mt-6 text-xl font-mono text-cyan-400 tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              S.H.I.E.L.D. DATABASE ACCESS...
            </motion.p>
            <motion.p
              className="mt-2 text-sm font-mono text-purple-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Scanning Mission Protocols...
            </motion.p>

            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-pulse"></div>
              <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-purple-400 rounded-full animate-ping delay-500"></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative z-10 p-8">
        <motion.h2
          className="text-5xl md:text-7xl font-black text-center uppercase tracking-widest mb-12"
          variants={itemVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Avengers Missions
          </span>
        </motion.h2>

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

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          {missions.length === 0 && isLoaded ? (
            <motion.p
              className="col-span-full text-center text-xl text-gray-400"
              variants={itemVariants}
            >
              No missions found.
            </motion.p>
          ) : (
            missions.map((mission) => (
              <motion.div
                key={mission._id}
                className="relative bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-cyan-400/30 hover:scale-105 transition-transform duration-300 group"
                variants={itemVariants}
                whileHover={{ boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)" }}
              >
                <div className="absolute top-2 left-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="absolute top-2 right-2 w-3 h-2 bg-purple-400 rounded-full animate-pulse delay-500"></div>
                <div className="absolute -top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded text-cyan-400 text-xs font-mono border border-cyan-400/30">
                  STATUS: {mission.isCompleted ? 'COMPLETED' : 'ACTIVE'}
                </div>

                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {mission.title}
                </h3>
                <p className="text-gray-300 mb-4">{mission.description}</p>

                <div className="text-sm space-y-2">
                  <p>
                    <span className="font-semibold text-white">📍 Location:</span>{" "}
                    <span className="text-gray-300">{mission.Location}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-white">⚙️ Difficulty:</span>{" "}
                    <span className="capitalize text-gray-300">{mission.difficulty}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-white">🦸 Assigned Avengers:</span>{" "}
                    <span className="text-gray-300">
                      {mission.avengersAssigned?.length > 0
                        ? mission.avengersAssigned
                            .map((avenger) => avenger.firstName || 'Unknown')
                            .join(', ')
                        : 'None assigned'}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-white">🚩 Status:</span>{" "}
                    {mission.isCompleted ? (
                      <span className="text-green-400 font-bold">Completed</span>
                    ) : (
                      <span className="text-yellow-400 font-bold">In Progress</span>
                    )}
                  </p>
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-pulse"></div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75% { transform: scale(2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default MissionsPage;
