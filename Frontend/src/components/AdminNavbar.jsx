import { NavLink } from 'react-router'; // fixed 'react-router' to 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { motion } from 'framer-motion';
import { useState } from 'react';

function AdminNavbar() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logoutUser());
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

    return (
        <>
            <motion.nav
                className="relative z-50 bg-black/50 backdrop-blur-xl border-b border-cyan-400/20 px-4 py-4 sm:px-8"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <NavLink to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-black rounded-sm"></div>
                            </div>
                            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AvengersNexus</span>
                        </motion.div>
                    </NavLink>

                    {/* Mobile Toggle */}
                    <button 
                        className="md:hidden text-cyan-400 focus:outline-none"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
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
                                    className="relative px-3 py-2 text-gray-300 hover:text-cyan-400 transition-all duration-300 group"
                                >
                                    {item.label}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                                </NavLink>
                            </motion.div>
                        ))}

                        {/* User Dropdown */}
                        <div className="relative group">
                            <motion.div 
                                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-400/30 rounded-lg text-cyan-400 font-semibold hover:bg-gradient-to-r hover:from-cyan-600/30 hover:to-purple-600/30 transition-all duration-300"
                                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)" }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {user?.firstName || 'Agent'}
                            </motion.div>
                            <ul className="absolute right-0 mt-2 bg-black/90 backdrop-blur-xl text-white rounded-lg shadow-2xl py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 w-48 border border-cyan-400/20">
                                <li><NavLink to="/your-reward" className="block px-4 py-2 hover:bg-cyan-600/20 transition-colors">Your Reward</NavLink></li>
                                <li><NavLink to="/attendaceupdations" className="block px-4 py-2 hover:bg-cyan-600/20 transition-colors">Start Attendance</NavLink></li>
                                <li><NavLink to="/missionupdations" className="block px-4 py-2 hover:bg-cyan-600/20 transition-colors">Create Mission</NavLink></li>
                                <li><NavLink to="/postupdations" className="block px-4 py-2 hover:bg-cyan-600/20 transition-colors">Create post</NavLink></li>

                                <li><button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-red-600/20 transition-colors">Logout</button></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                <motion.div 
                    className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} mt-4 bg-black/90 backdrop-blur-xl rounded-lg border border-cyan-400/20`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: isMobileMenuOpen ? 'auto' : 0, opacity: isMobileMenuOpen ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {[
                        { to: "/posts", label: "Posts" },
                        { to: "/missions", label: "Missions" },
                        { to: "/attendance", label: "Attendance" },
                        { to: "/avengers", label: "Avengers" },
                        { to: "/your-reward", label: "Your Reward" },
                        { to: "/attendance-summary", label: "Attendance" },
                        { to: "/your-missions", label: "Your Missions" },
                    ].map((item) => (
                        <NavLink 
                            key={item.to}
                            to={item.to} 
                            className="block px-4 py-3 text-gray-300 hover:bg-cyan-600/20 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                    <button 
                        onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                        className="block w-full text-left px-4 py-3 hover:bg-red-600/20 transition-colors"
                    >
                        Logout
                    </button>
                </motion.div>
            </motion.nav>
        </>
    );
}

export default AdminNavbar;
