import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import { useSelector } from 'react-redux';
import Footer from '../components/Footer';

function MissionsPage() {
  const user = useSelector((state) => state.auth?.user);
  const [missions, setMissions] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const missionResponse = await axiosClient.get('/mission/getAllMission');
        const missionData = Array.isArray(missionResponse.data) ? missionResponse.data : [];

        const missionsWithAvengers = await Promise.all(
          missionData.map(async (mission) => {
            if (Array.isArray(mission.avengersAssigned) && mission.avengersAssigned.length > 0) {
              const avengerPromises = mission.avengersAssigned.map(async (avengerId) => {
                try {
                  const avengerResponse = await axiosClient.get(`/user/getUser/${avengerId}`);
                  const avenger = avengerResponse.data;
                  return avenger && avenger._id ? avenger : null;
                } catch {
                  return null;
                }
              });
              const avengers = (await Promise.all(avengerPromises)).filter(Boolean);
              return { ...mission, avengersAssigned: avengers };
            }
            return { ...mission, avengersAssigned: [] };
          })
        );

        setMissions(missionsWithAvengers);
        if (missionsWithAvengers.length === 0) {
          setError('No missions found.');
        }
      } catch (error) {
        console.error('Error fetching missions:', error.response?.data || error.message);
        setError('Failed to load missions.');
        setMissions([]);
      } finally {
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
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

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
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
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
            Avengers Missions
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
            {missions.map((mission) => (
              <motion.div
                key={mission._id}
                className="relative bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-cyan-400/30 hover:scale-105 transition-transform duration-300 group"
                variants={itemVariants}
                whileHover={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)' }}
              >
                {/* UI markers */}
                <div className="absolute top-2 left-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="absolute top-2 right-2 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-500"></div>

                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {mission.title}
                </h3>
                <p className="text-gray-300 mb-4">{mission.description}</p>

                <div className="text-sm space-y-2">
                  <p>
                    <strong>📍 Location:</strong> {mission.Location}
                  </p>
                  <p>
                    <strong>⚙️ Difficulty:</strong> {mission.difficulty}
                  </p>
                  <p>
                    <strong>🦸 Assigned Avengers:</strong>{' '}
                    {mission.avengersAssigned.map((a) => a.firstName).join(', ') || 'None'}
                  </p>
                  <p>
                    <strong>🚩 Status:</strong>{' '}
                    {mission.isCompleted ? (
                      <span className="text-green-400 font-bold">Completed</span>
                    ) : (
                      <span className="text-yellow-400 font-bold">In Progress</span>
                    )}
                  </p>
                </div>

                {/* Scan Lines */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-pulse"></div>
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

export default MissionsPage;
