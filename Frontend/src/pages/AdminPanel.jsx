import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

function AdminPanel() {
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

    const handleLogout = () => {
        dispatch(logoutUser());
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

            {/* Navigation */}
            <motion.nav
                className="relative z-50 bg-black/50 backdrop-blur-xl border-b border-cyan-400/20 px-8 py-4"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="flex justify-between items-center">
                    <motion.div 
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                            <div className="w-6 h-6 bg-black rounded-sm"></div>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            AvengersNexus
                        </span>
                    </motion.div>

                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { to: "/posts", label: "Posts" },
                            { to: "/missions", label: "Missions" },
                            { to: "/attendance", label: "Attendance" },
                            { to: "/avengers", label: "Avengers" }
                        ].map((item, index) => (
                            <motion.div
                                key={item.to}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.1 }}
                            >
                                <NavLink 
                                    to={item.to} 
                                    className="relative px-4 py-2 text-gray-300 hover:text-cyan-400 transition-all duration-300 group"
                                >
                                    {item.label}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                                </NavLink>
                            </motion.div>
                        ))}

                        <div className="relative group">
                            <motion.div 
                                className="cursor-pointer px-6 py-2 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-400/30 rounded-lg text-cyan-400 font-semibold hover:bg-gradient-to-r hover:from-cyan-600/30 hover:to-purple-600/30 transition-all duration-300"
                                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)" }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {user?.firstName || 'Agent'}
                            </motion.div>
                            <ul className="absolute right-0 mt-2 bg-black/90 backdrop-blur-xl text-white rounded-lg shadow-2xl py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 w-48 border border-cyan-400/20">
                                <li><NavLink to="/missionupdations" className="block px-4 py-3 hover:bg-cyan-600/20 transition-colors">Create Mission</NavLink></li>
                                <li><NavLink to="/postupdations" className="block px-4 py-3 hover:bg-cyan-600/20 transition-colors">Create Post</NavLink></li>
                                <li><NavLink to="/attendaceupdations" className="block px-4 py-3 hover:bg-cyan-600/20 transition-colors">Start attendace</NavLink></li>
                                <li><button onClick={handleLogout} className="block w-full text-left px-4 py-3 hover:bg-red-600/20 transition-colors">Logout</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 text-center">
                <motion.div
                    className="mb-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isLoaded ? "visible" : "hidden"}
                >
                    <motion.div 
                        className="text-cyan-400 text-sm font-semibold tracking-widest mb-4"
                        variants={itemVariants}
                    >
                        [ CLASSIFIED OPERATION ]
                    </motion.div>
                    
                    <motion.h1
                        className="text-6xl md:text-8xl font-black mb-6 leading-tight"
                        variants={itemVariants}
                    >
                        <span className="text-white">THE</span>
                        <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            FUTURE
                        </span>
                        <br />
                        <span className="text-white">IS HERE</span>
                    </motion.h1>

                    <motion.p
                        className="text-xl text-gray-   400 max-w-2xl mx-auto mb-8 leading-relaxed"
                        variants={itemVariants}
                    >
                        Advanced technology meets superhuman abilities. Join the next generation of heroes in an ever-evolving digital battlefield.
                    </motion.p>
                </motion.div>

                {/* Central Hero Image */}
                <motion.div
                    className="relative mb-12"
                    variants={heroVariants}
                    initial="hidden"
                    animate={isLoaded ? "visible" : "hidden"}
                >
                    <div className="relative group">
                        {/* Glowing Frame */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
                        
                        {/* Tech Border */}
                        <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-cyan-400/30">
                            <div className="absolute top-2 left-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                            <div className="absolute top-2 right-2 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-500"></div>
                            <div className="absolute bottom-2 left-2 w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-1000"></div>
                            <div className="absolute bottom-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-1500"></div>
                            
                            <img
                                src="https://wallpaperaccess.com/full/54684.jpg"
                                alt="Captain America"
                                className="w-full max-w-2xl rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-105"
                            />
                            
                            {/* Scan Lines */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-pulse"></div>
                        </div>

                        {/* Tech UI Elements */}
                        <div className="absolute -top-8 left-8 bg-black/80 backdrop-blur-sm px-3 py-1 rounded text-cyan-400 text-xs font-mono border border-cyan-400/30">
                            STATUS: ACTIVE
                        </div>
                        <div className="absolute -bottom-8 right-8 bg-black/80 backdrop-blur-sm px-3 py-1 rounded text-purple-400 text-xs font-mono border border-purple-400/30">
                            LEVEL: CLASSIFIED
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Floating Action Button */}
            <motion.div
                className="fixed bottom-8 right-8 z-50"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 2, duration: 0.8 }}
            >
                <motion.button
                    className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white font-bold text-2xl"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    ⚡
                </motion.button>
            </motion.div>

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
    
export default AdminPanel;