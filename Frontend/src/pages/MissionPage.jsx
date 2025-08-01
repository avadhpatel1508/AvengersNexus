import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import AdminNavbar from '../components/AdminNavbar';
import UserNavbar from '../components/UserNavbar';
import { useSelector } from 'react-redux';
import Footer from '../components/Footer';
import Loader from './Loader';

function MissionsPage() {
  const user = useSelector((state) => state.auth?.user);
  const [missions, setMissions] = useState([]);
  const [filteredMissions, setFilteredMissions] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'All',
    difficulty: 'All',
    location: 'All',
  });

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
        setFilteredMissions(missionsWithAvengers);
        if (missionsWithAvengers.length === 0) {
          setError('No missions found.');
        }
      } catch (error) {
        console.error('Error fetching missions:', error.response?.data || error.message);
        setError('Failed to load missions.');
        setMissions([]);
        setFilteredMissions([]);
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

  useEffect(() => {
    let updatedMissions = [...missions];

    if (filters.status !== 'All') {
      updatedMissions = updatedMissions.filter((mission) =>
        filters.status === 'Completed' ? mission.isCompleted : !mission.isCompleted
      );
    }

    if (filters.difficulty !== 'All') {
      updatedMissions = updatedMissions.filter(
        (mission) => mission.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }

    if (filters.location !== 'All') {
      updatedMissions = updatedMissions.filter(
        (mission) => mission.Location.toLowerCase() === filters.location.toLowerCase()
      );
    }

    setFilteredMissions(updatedMissions);
    if (updatedMissions.length === 0 && missions.length > 0) {
      setError('No missions match the selected filters.');
    } else if (missions.length === 0) {
      setError('No missions found.');
    } else {
      setError('');
    }
  }, [filters, missions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
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

  const uniqueDifficulties = ['All', ...new Set(missions.map((m) => m.difficulty))];
  const uniqueLocations = ['All', ...new Set(missions.map((m) => m.Location))];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

      {/* Filter Options */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-2">
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center bg-gradient-to-r from-slate-800/60 to-slate-900/60 p-4 rounded-xl border border-white/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-sm text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="bg-slate-900/80 text-white border border-white/20 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-sm text-gray-300 mb-1">Difficulty</label>
            <select
              name="difficulty"
              value={filters.difficulty}
              onChange={handleFilterChange}
              className="bg-slate-900/80 text-white border border-white/20 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {uniqueDifficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-sm text-gray-300 mb-1">Location</label>
            <select
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="bg-slate-900/80 text-white border border-white/20 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </div>

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
      <div className="relative z-10 min-h-screen flex items-start pt-6 pb-10 px-4 sm:px-6">
        <div className="container mx-auto">
          {error ? (
            <motion.p
              className="text-center text-lg text-red-400 mb-10"
              variants={itemVariants}
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
            >
              {error}
            </motion.p>
          ) : (
            <motion.div
              className={`grid gap-10 mx-auto mb-10 ${
                filteredMissions.length === 1
                  ? 'grid-cols-1 max-w-xl place-items-center'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl'
              }`}
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
            >
              {filteredMissions.map((mission) => (
                <motion.div
                  key={mission._id}
                  className="relative bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl perspective-1000"
                  variants={itemVariants}
                  whileHover={{ rotateY: 5, rotateX: 2, scale: 1.05 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
                    {mission.title}
                  </h3>
                  <p className="text-gray-300 mb-6">{mission.description}</p>
                  <div className="space-y-2 text-md">
                    <p>
                      <span className="text-white font-semibold">📍 Location:</span>{' '}
                      <span className="text-gray-400">{mission.Location}</span>
                    </p>
                    <p>
                      <span className="text-white font-semibold">⚙️ Difficulty:</span>{' '}
                      <span className="text-gray-400">{mission.difficulty}</span>
                    </p>
                    <p>
                      <span className="text-white font-semibold">🦸 Assigned Avengers:</span>{' '}
                      <span className="text-gray-400">
                        {mission.avengersAssigned.map((a) => a.firstName).join(', ') || 'None'}
                      </span>
                    </p>
                    <p>
                      <span className="text-white font-semibold">🚩 Status:</span>{' '}
                      {mission.isCompleted ? (
                        <span className="text-green-400 font-bold">Completed</span>
                      ) : (
                        <span className="text-yellow-400 font-bold">In Progress</span>
                      )}
                    </p>
                  </div>
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

export default MissionsPage;
