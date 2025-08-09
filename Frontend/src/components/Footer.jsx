import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <motion.footer
      className="relative z-20 bg-transparent backdrop-blur-xl text-white py-8 border border-white/20 mt-8 mx-auto max-w-4xl rounded-3xl shadow-2xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 bg-transparent/60 rounded-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
        <motion.h2
          className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-4 bg-gradient-to-r from-teal-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent tracking-tight"
          whileHover={{ textShadow: '0 0 20px rgba(168, 255, 255, 0.7)' }}
        >
          Avengers Operations Dashboard
        </motion.h2>

        <p className="text-base font-medium text-gray-200 mb-6">
          Crafted with Valor by
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-6">
          {/* Avadh */}
          <div className="text-center">
            <p className="text-cyan-300 font-semibold mb-2">Avadh Nandasana</p>
            <div className="flex gap-4 justify-center text-xl">
              <a
                href="https://github.com/avadhpatel1508"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-cyan-900/30 hover:text-cyan-200 hover:shadow-[0_0_10px_rgba(34,211,238,0.7)] transition duration-300"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/avadh-nandasana-256674295/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-cyan-900/30 hover:text-cyan-200 hover:shadow-[0_0_10px_rgba(34,211,238,0.7)] transition duration-300"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://instagram.com/avadh_1508"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-cyan-900/30 hover:text-cyan-200 hover:shadow-[0_0_10px_rgba(34,211,238,0.7)] transition duration-300"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Radha */}
          <div className="text-center">
            <p className="text-purple-300 font-semibold mb-2">Radha Patel</p>
            <div className="flex gap-4 justify-center text-xl">
              <a
                href="https://github.com/RADHA2504"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-purple-900/30 hover:text-purple-200 hover:shadow-[0_0_10px_rgba(168,85,247,0.7)] transition duration-300"
              >
                <FaGithub />
              </a>
              <a
                href="https://linkedin.com/in/radha-patel"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-purple-900/30 hover:text-purple-200 hover:shadow-[0_0_10px_rgba(168,85,247,0.7)] transition duration-300"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://instagram.com/radha.patel"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-purple-900/30 hover:text-purple-200 hover:shadow-[0_0_10px_rgba(168,85,247,0.7)] transition duration-300"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-300">
          <p>
            &copy; {new Date().getFullYear()} Avengers Ops Platform. All rights
            reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
