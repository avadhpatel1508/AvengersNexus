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
          setError('No missions found in the database.');
        }
      } catch (error) {
        console.error('Error fetching missions:', error.response?.data || error.message);
        setError('Failed to load missions. Please check the server connection.');
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
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const preloaderVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 1.2, transition: { duration: 0.5, ease: 'easeIn' } },
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* ✅ Navbar */}
      {user?.role === 'admin' ? <AdminNavbar /> : <UserNavbar />}

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        {/* ... gradient background omitted for brevity */}
      </div>

      {/* Preloader */}
      {!isLoaded && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/90 backdrop-blur-md"
          variants={preloaderVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* ... animated preloader content omitted for brevity */}
        </motion.div>
      )}

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
          animate={isLoaded ? 'visible' : 'hidden'}
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
              >
                {/* ... individual mission card content */}
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {mission.title}
                </h3>
                <p className="text-gray-300 mb-4">{mission.description}</p>
                <div className="text-sm space-y-2">
                  <p><strong>📍 Location:</strong> {mission.Location}</p>
                  <p><strong>⚙️ Difficulty:</strong> {mission.difficulty}</p>
                  <p><strong>🦸 Assigned Avengers:</strong> {mission.avengersAssigned.map((a) => a.firstName).join(', ') || 'None assigned'}</p>
                  <p><strong>🚩 Status:</strong> {mission.isCompleted ? (
                    <span className="text-green-400 font-bold">Completed</span>
                  ) : (
                    <span className="text-yellow-400 font-bold">In Progress</span>
                  )}</p>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
      <Footer/>
    </div>
  );
}

export default MissionsPage;
