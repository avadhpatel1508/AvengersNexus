import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { motion } from 'framer-motion';
import { useState } from 'react';

function UserNavbar() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    const menuItems = [
        { to: '/posts', label: 'Posts' },
        { to: '/missions', label: 'Missions' },
        { to: '/attendance', label: 'Attendance' },
        { to: '/avengers', label: 'Avengers' },
    ];

    const userLinks = [
        { to: '/your-reward', label: 'Your Reward' },
        { to: '/attendance-summary', label: 'Attendance' },
        { to: '/your-missions', label: 'Your Missions' },
    ];

    return (
        <motion.nav
            className="relative z-50 flex justify-between items-center p-6 backdrop-blur-xl bg-black/20 border-b border-white/10"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
        >
            {/* Logo */}
            <NavLink to="/" className="flex items-center space-x-3" onClick={() => setIsMobileMenuOpen(false)}>
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-600 via-white to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                            <span className="text-black font-black text-xl">★</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-blue-600 rounded-full blur opacity-40 animate-pulse"></div>
                    </div>
                    <div>
                        <div className="text-2xl font-black bg-gradient-to-r from-red-400 via-white to-blue-400 bg-clip-text text-transparent">
                            AVENGERS
                        </div>
                        <div className="text-xs text-gray-400 tracking-widest">INITIATIVE</div>
                    </div>
                </motion.div>
            </NavLink>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
                {menuItems.map((item, index) => (
                    <motion.div
                        key={item.to}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.1 }}
                    >
                        <NavLink
                            to={item.to}
                            className="relative text-white font-bold tracking-wider hover:text-red-400 transition-all duration-300 group"
                        >
                            {item.label}
                            <motion.div
                                className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-red-500 to-blue-500"
                                initial={{ width: 0 }}
                                whileHover={{ width: '100%' }}
                                transition={{ duration: 0.3 }}
                            />
                        </NavLink>
                    </motion.div>
                ))}

                {/* User Dropdown */}
                <div className="relative group">
                    <motion.div
                        className="cursor-pointer px-4 py-2 bg-gradient-to-r from-red-600/20 to-blue-600/20 border border-white/20 rounded-lg text-white font-semibold hover:bg-gradient-to-r hover:from-red-600/30 hover:to-blue-600/30 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {user?.firstName || 'Agent'}
                    </motion.div>
                    <ul className="absolute right-0 mt-2 bg-black/90 backdrop-blur-xl text-white rounded-lg shadow-2xl py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 w-48 border border-white/10">
                        {userLinks.map(link => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    className="block px-4 py-2 hover:bg-red-600/20 transition-colors"
                                >
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                        <li>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 hover:bg-red-600/20 transition-colors"
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Mobile Toggle */}
            <motion.button
                className="md:hidden relative group"
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <div className="w-8 h-8 flex flex-col justify-center space-y-1">
                    <motion.div className="w-full h-0.5 bg-white origin-center" whileHover={{ scaleX: 1.2 }}></motion.div>
                    <motion.div className="w-full h-0.5 bg-white origin-center" whileHover={{ scaleX: 0.8 }}></motion.div>
                    <motion.div className="w-full h-0.5 bg-white origin-center" whileHover={{ scaleX: 1.2 }}></motion.div>
                </div>
            </motion.button>

            {/* Mobile Menu */}
            <motion.div
                className={`absolute top-full left-0 right-0 md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 rounded-b-lg overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: isMobileMenuOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            >
                {[...menuItems, ...userLinks].map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className="block px-4 py-3 text-white hover:bg-red-600/20 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {link.label}
                    </NavLink>
                ))}
                <button
                    onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 hover:bg-red-600/20 transition-colors"
                >
                    Logout
                </button>
            </motion.div>
        </motion.nav>
    );
}

export default UserNavbar;
