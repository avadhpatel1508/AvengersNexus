import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';

function MissionsPage() {
    const [missions, setMissions] = useState([]);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Fetch missions and avenger details from API
        const fetchMissions = async () => {
            try {
                // Fetch all missions
                const missionResponse = await axiosClient.get('/mission/getAllMission');
                const missionData = missionResponse.data;
                console.log('Fetched Missions:', missionData);

                // Fetch Avenger details for each mission
                const missionsWithAvengers = await Promise.all(
                    missionData.map(async (mission) => {
                        if (mission.avengersAssigned?.length > 0) {
                            // Fetch Avenger details for each ID in avengersAssigned
                            const avengerPromises = mission.avengersAssigned.map(async (avengerId) => {
                                try {
                                    const avengerResponse = await axiosClient.get(`/mission/${avengerId}`);
                                    return avengerResponse.data; // Assuming API returns { _id, firstName, lastName, ... }
                                } catch (error) {
                                    console.error(`Error fetching avenger ${avengerId}:`, error.response?.data || error.message);
                                    return null; // Handle cases where avenger fetch fails
                                }
                            });
                            const avengers = (await Promise.all(avengerPromises)).filter((avenger) => avenger !== null);
                            return { ...mission, avengersAssigned: avengers };
                        }
                        return { ...mission, avengersAssigned: [] }; // No avengers assigned
                    })
                );

                setMissions(missionsWithAvengers);
                setIsLoaded(true); // Set loaded state after data is fetched
            } catch (error) {
                console.error('Error fetching missions:', error.response?.data || error.message);
                setIsLoaded(true); // Ensure preloader stops even if there's an error
            }
        };

        fetchMissions();

        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Animation variants for container and items
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

    // Preloader animation variants
    const preloaderVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } },
        exit: { opacity: 0, transition: { duration: 0.5 } },
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
                
                {/* Animated Grid */}
                <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full" style={{
                        backgroundImage: `
                            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                        animation: 'grid-move 20s linear infinite',
                    }}></div>
                </div>

                {/* Floating Orbs */}
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

            {/* Preloader */}
            {!isLoaded && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm"
                    variants={preloaderVariants}
                    initial="visible"
                    animate="visible"
                    exit="hidden"
                >
                    <div className="flex flex-col items-center space-y-6">
                        {/* Loading Spinner */}
                        <motion.div
                            className="relative w-24 h-24"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        >
                            <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-purple-400 border-b-pink-400 border-l-transparent rounded-full"></div>
                        </motion.div>
                        {/* Loading Text */}
                        <motion.p
                            className="text-2xl font-mono text-cyan-400"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            Initializing Mission Data...
                        </motion.p>
                        {/* Scanning Effect */}
                        <div className="w-64 h-2 bg-cyan-400/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                                animate={{ x: [-256, 256] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            />
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
                                {/* Tech UI Elements */}
                                <div className="absolute top-2 left-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                                <div className="absolute top-2 right-2 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-500"></div>
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
                                                      .map((avenger) => avenger.firstName)
                                                      .join(', ')
                                                : 'None'}
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

                                {/* Scan Lines */}
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
            `}</style>
        </div>
    );
}

export default MissionsPage;