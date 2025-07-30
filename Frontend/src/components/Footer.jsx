import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.footer
      className="relative z-20 bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl text-white py-10 border-t border-white/20 mt-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent tracking-widest"
          whileHover={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}
        >
          Avengers Operations Dashboard
        </motion.h2>

        <p className="text-lg font-semibold text-gray-300 mb-8">Designed & Developed by</p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-12 mb-8">
          <div className="text-center">
            <p className="text-red-400 font-semibold mb-2">Avadh Nandasana</p>
            <div className="flex gap-5 justify-center text-2xl">
              <a
                href="https://github.com/avadhpatel1508"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-300 hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] transition duration-300"
                aria-label="GitHub - Avadh"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/avadh-nandasana-256674295/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-300 hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] transition duration-300"
                aria-label="LinkedIn - Avadh"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://instagram.com/avadh_1508"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-300 hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] transition duration-300"
                aria-label="Instagram - Avadh"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          <div className="text-center">
            <p className="text-blue-400 font-semibold mb-2">Radha Patel</p>
            <div className="flex gap-5 justify-center text-2xl">
              <a
                href="https://github.com/RADHA2504"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.7)] transition duration-300"
                aria-label="GitHub - Radha"
              >
                <FaGithub />
              </a>
              <a
                href="https://linkedin.com/in/radha-patel"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.7)] transition duration-300"
                aria-label="LinkedIn - Radha"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://instagram.com/radha.patel"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.7)] transition duration-300"
                aria-label="Instagram - Radha"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Avengers Ops Platform. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;