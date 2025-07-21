import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';

function Homepage() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
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

    const heroVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                duration: 1.2,
                ease: "easeOut",
            },
        },
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
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

                <motion.div
                    className="absolute w-48 h-48 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-3xl"
                    style={{
                        left: mousePosition.x - (window.innerWidth < 768 ? 96 : 192),
                        top: mousePosition.y - (window.innerWidth < 768 ? 96 : 192),
                    }}
                    transition={{ type: "spring", stiffness: 50, damping: 30 }}
                />
                <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-24 h-24 md:w-48 md:h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Replaced original navbar with custom component */}
            <UserNavbar />

            {/* Hero Section */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-8 text-center">
                <motion.div
                    className="mb-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isLoaded ? "visible" : "hidden"}
                >
                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
                        variants={itemVariants}
                    >
                        <span className="text-white">THE</span>
                        <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            AVENGERESNEXUS
                        </span>
                        <br />
                        <span className="text-white">IS HERE</span>
                    </motion.h1>

                    <motion.p
                        className="text-base sm:text-lg md:text-xl text-gray-400 max-w-lg sm:max-w-xl md:max-w-2xl mx-auto mb-8 leading-relaxed"
                        variants={itemVariants}
                    >
                        Advanced technology meets superhuman abilities. Join the next generation of heroes in an ever-evolving digital battlefield.
                    </motion.p>
                </motion.div>

                <motion.div
                    className="relative mb-12 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl"
                    variants={heroVariants}
                    initial="hidden"
                    animate={isLoaded ? "visible" : "hidden"}
                >
                    <div className="relative group">
                        <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
                        <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl p-2 sm:p-4 border border-cyan-400/30">
                            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 w-2 sm:w-3 h-2 sm:h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 w-2 sm:w-3 h-2 sm:h-3 bg-purple-400 rounded-full animate-pulse delay-500"></div>
                            <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 w-2 sm:w-3 h-2 sm:h-3 bg-pink-400 rounded-full animate-pulse delay-1000"></div>
                            <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-2 sm:w-3 h-2 sm:h-3 bg-yellow-400 rounded-full animate-pulse delay-1500"></div>

                            <img
                                src="https://wallpaperaccess.com/full/54684.jpg"
                                alt="Captain America"
                                className="w-full rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-pulse"></div>
                        </div>

                        <div className="absolute -top-4 sm:-top-8 left-4 sm:left-8 bg-black/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded text-cyan-400 text-xs font-mono border border-cyan-400/30">
                            STATUS: ACTIVE
                        </div>
                        <div className="absolute -bottom-4 sm:-bottom-8 right-4 sm:right-8 bg-black/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded text-purple-400 text-xs font-mono border border-purple-400/30">
                            LEVEL: CLASSIFIED
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div
                className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-50"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 2, duration: 0.8 }}
            >
                <motion.button
                    className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    ⚡
                </motion.button>
            </motion.div>

            <style jsx>{`
                @keyframes grid-move {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(50px, 50px); }
                }
                @media (max-width: 768px) {
                    .group:hover .opacity-0 {
                        opacity: 0 !important;
                    }
                }
            `}</style>
            <Footer/>
        </div>
    );
}

export default Homepage;
