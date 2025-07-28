import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeOut' } },
  };

  return (
    <motion.footer
      className="relative z-20 bg-black/40 backdrop-blur-md text-white py-10 border-t border-cyan-400/30 mt-16 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 -z-10">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              i % 3 === 0 ? 'bg-red-500/40' : i % 3 === 1 ? 'bg-blue-500/40' : 'bg-white/40'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.h2 className="text-2xl md:text-3xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent tracking-wide">
          Avengers Operations Dashboard
        </motion.h2>

        <p className="text-lg font-semibold text-gray-300 mb-8">Designed & Developed by</p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-12 mb-10">
          <div className="text-center">
            <p className="text-cyan-400 font-semibold mb-2">Avadh Nandasana</p>
            <div className="flex gap-5 justify-center text-2xl">
              <a href="https://github.com/avadhpatel1508" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 hover:drop-shadow-[0_0_6px_cyan] transition duration-300" aria-label="GitHub - Avadh">
                <FaGithub />
              </a>
              <a href="https://www.linkedin.com/in/avadh-nandasana-256674295/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 hover:drop-shadow-[0_0_6px_cyan] transition duration-300" aria-label="LinkedIn - Avadh">
                <FaLinkedin />
              </a>
              <a href="https://instagram.com/avadh_1508" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 hover:drop-shadow-[0_0_6px_cyan] transition duration-300" aria-label="Instagram - Avadh">
                <FaInstagram />
              </a>
            </div>
          </div>

          <div className="text-center">
            <p className="text-purple-400 font-semibold mb-2">Radha Patel</p>
            <div className="flex gap-5 justify-center text-2xl">
              <a href="https://github.com/RADHA2504" target="_blank" rel="noopener noreferrer" className="hover:text-purple-300 hover:drop-shadow-[0_0_6px_purple] transition duration-300" aria-label="GitHub - Radha">
                <FaGithub />
              </a>
              <a href="https://linkedin.com/in/radha-patel" target="_blank" rel="noopener noreferrer" className="hover:text-purple-300 hover:drop-shadow-[0_0_6px_purple] transition duration-300" aria-label="LinkedIn - Radha">
                <FaLinkedin />
              </a>
              <a href="https://instagram.com/radha.patel" target="_blank" rel="noopener noreferrer" className="hover:text-purple-300 hover:drop-shadow-[0_0_6px_purple] transition duration-300" aria-label="Instagram - Radha">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} Avengers Ops Platform. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
