import { NavLink, useNavigate } from 'react-router'; // Added useNavigate
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { useState } from 'react';
import { resetSocket } from '../socket/socket'; // Assuming this import

function AdminNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    resetSocket();
    navigate('/login');
  };

  const menuItems = [
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/posts', label: 'Posts' },
    { to: '/missions', label: 'Missions' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/avengers', label: 'Avengers' },
    { to: '/feedbacks', label: 'Feedback' },
    { to: '/chats', label: 'Chat' },
  ];

  const adminLinks = [
    { to: '/admin-reward', label: 'Your Reward' },
    { to: '/attendaceupdations', label: 'Start Attendance' },
    { to: '/missionupdations', label: 'Create Mission' },
    { to: '/postupdations', label: 'Create Post' },
  ];

  return (
    <nav
      className="relative z-50 flex justify-between items-center p-4 sm:p-6 backdrop-blur-xl bg-black/20 border-b border-white/10"
      aria-label="Primary Navigation"
    >
      {/* Logo */}
      <NavLink
        to="/"
        className="flex items-center space-x-3"
        onClick={() => setIsMobileMenuOpen(false)}
        aria-label="Go to homepage"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 via-white to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-black font-black text-xl">⚡</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full blur opacity-40"></div>
          </div>
          <div className="hidden sm:block">
            <div className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-400 via-white to-purple-500 bg-clip-text text-transparent select-none">
              ADMIN PANEL
            </div>
            <div className="text-xs text-gray-400 tracking-widest select-none">
              AVENGERS HQ
            </div>
          </div>
        </div>
      </NavLink>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative text-white font-bold tracking-wider hover:text-cyan-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 rounded ${
                isActive
                  ? 'underline underline-offset-4 decoration-2 decoration-gradient-to-r from-cyan-400 to-purple-500'
                  : ''
              }`
            }
            tabIndex={0}
          >
            {item.label}
          </NavLink>
        ))}

        {/* Admin Dropdown */}
        <div className="relative group">
          <button
            aria-haspopup="true"
            aria-expanded="false"
            className="cursor-pointer px-4 py-2 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-white/20 rounded-lg text-white font-semibold hover:bg-gradient-to-r hover:from-cyan-600/30 hover:to-purple-600/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1"
          >
            {user?.firstName || 'Director'}
          </button>
          <ul className="absolute right-0 mt-2 bg-black/90 backdrop-blur-xl text-white rounded-lg shadow-2xl py-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300 z-10 w-52 border border-white/10 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
            {adminLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `block px-4 py-2 hover:bg-cyan-600/20 transition-colors focus:outline-none focus:bg-cyan-600/30 ${
                      isActive
                        ? 'underline underline-offset-4 decoration-2 decoration-gradient-to-r from-cyan-400 to-purple-500'
                        : ''
                    }`
                  }
                  tabIndex={0}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-red-600/20 transition-colors focus:outline-none focus:bg-red-600/30"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Toggle */}
      <button
        className="md:hidden relative z-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 rounded"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileMenuOpen}
      >
        <div className="w-8 h-8 flex flex-col justify-center space-y-1">
          <span
            className={`block h-0.5 bg-white transform transition duration-300 ease-in-out ${
              isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
            }`}
          ></span>
          <span
            className={`block h-0.5 bg-white transition duration-300 ease-in-out ${
              isMobileMenuOpen ? 'opacity-0' : ''
            }`}
          ></span>
          <span
            className={`block h-0.5 bg-white transform transition duration-300 ease-in-out ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
            }`}
          ></span>
        </div>
      </button>

      {/* Mobile Menu */}
      <div
        className={`fixed top-full left-0 right-0 md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 rounded-b-lg overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-in-out z-40 ${
          isMobileMenuOpen
            ? 'max-h-screen opacity-100 py-4'
            : 'max-h-0 opacity-0 py-0 pointer-events-none'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        {[...menuItems, ...adminLinks].map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-6 py-3 text-white hover:bg-cyan-600/20 transition-colors focus:outline-none focus:bg-cyan-600/30 ${
                isActive
                  ? 'underline underline-offset-4 decoration-2 decoration-gradient-to-r from-cyan-400 to-purple-500'
                  : ''
              }`
            }
            onClick={() => setIsMobileMenuOpen(false)}
            tabIndex={isMobileMenuOpen ? 0 : -1}
          >
            {link.label}
          </NavLink>
        ))}
        <button
          onClick={() => {
            handleLogout();
            setIsMobileMenuOpen(false);
          }}
          className="block w-full text-left px-6 py-3 hover:bg-red-600/20 transition-colors focus:outline-none focus:bg-red-600/30"
          tabIndex={isMobileMenuOpen ? 0 : -1}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AdminNavbar;
