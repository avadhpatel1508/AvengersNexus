import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Star, CheckCircle, Users, DollarSign, Calendar, BarChart3, Zap } from 'lucide-react';
import Footer from '../components/Footer'; 
import Loader from './Loader';
import axiosClient from '../utils/axiosClient'; 
import firstImg from '../assets/first.jpg?w=800&h=600&fit=crop';
import secondImg from '../assets/second.jpg?w=800&h=600&fit=crop';
import thirdImg from '../assets/third.jpg?w=800&h=600&fit=crop';

const Features = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('');

  const heroSlides = [
    {
      image: firstImg,
      title: 'AVENGERS ASSEMBLE',
      subtitle: 'EARTH’S MIGHTIEST HEROES',
      description: 'Unite with the Avengers to protect the world from cosmic threats and villains.',
    },
    {
      image: secondImg,
      title: 'COMMAND CENTER',
      subtitle: 'MISSION CONTROL',
      description: 'Manage missions, track payments, and coordinate heroes with precision.',
    },
    {
      image: thirdImg,
      title: 'THE SHIELD',
      subtitle: 'SYMBOL OF JUSTICE',
      description: 'Lead with strength and honor, just like the iconic vibranium shield.',
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(slideInterval);
      clearTimeout(timer);
    };
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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const slideVariants = {
    enter: { x: 1000, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -1000, opacity: 0 },
  };

 

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleSignup = () => {
    window.location.href = '/signup';
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-[1000] bg-black"
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      {isLoaded && (
        <>
          {/* Background Effects */}
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-blue-950"></div>
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
                  </pattern>
                  <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
                <rect width="100" height="100" fill="url(#heroGrad)" />
              </svg>
            </div>
            <motion.div
              className="absolute w-96 h-96 rounded-full pointer-events-none"
              style={{
                left: mousePosition.x - 192,
                top: mousePosition.y - 192,
                background:
                  'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, rgba(37, 99, 235, 0.06) 50%, transparent 70%)',
              }}
              transition={{ type: 'spring', stiffness: 20, damping: 30 }}
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
              <div className="w-[60vw] max-w-[350px] h-[60vw] max-h-[350px] border-8 border-white rounded-full flex items-center justify-center animate-spin-very-slow">
                <div className="w-64 h-64 border-8 border-red-500 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 border-8 border-blue-500 rounded-full flex items-center justify-center">
                    <div className="text-4xl sm:text-6xl text-white">★</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          

          {/* Hero Section */}
          <div className="relative z-10 min-h-screen flex items-center py-10 px-4 sm:px-6">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Text Block */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-10 text-center md:text-left"
              >
                <motion.div variants={itemVariants} className="space-y-6">
                  <AnimatePresence mode="wait">
                    <motion.h1
                      key={currentSlide}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight"
                    >
                      <motion.span className="block text-white" whileHover={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
                        {heroSlides[currentSlide].title}
                      </motion.span>
                      <motion.span className="block bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent" whileHover={{ scale: 1.02 }}>
                        {heroSlides[currentSlide].subtitle}
                      </motion.span>
                    </motion.h1>
                  </AnimatePresence>
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentSlide}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="text-gray-300 text-md sm:text-lg md:text-xl font-light leading-relaxed max-w-xl mx-auto md:mx-0"
                  >
                    {heroSlides[currentSlide].description}
                  </motion.p>
                </AnimatePresence>
                <motion.div variants={itemVariants} className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                  {heroSlides.map((_, index) => (
                    <motion.button
                      key={index}
                      className={`relative h-3 rounded-full transition-all duration-500 ${
                        index === currentSlide
                          ? 'bg-gradient-to-r from-red-500 to-blue-500 w-12 shadow-lg'
                          : 'bg-white/30 w-3 hover:bg-white/50'
                      }`}
                      onClick={() => setCurrentSlide(index)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {index === currentSlide && (
                        <motion.div
                          className="absolute inset-0 bg-white/30 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  ))}
                  <div className="text-gray-400 text-sm ml-2">0{currentSlide + 1} / 0{heroSlides.length}</div>
                </motion.div>
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button
                    onClick={handleSignup}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-400 hover:to-blue-400 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-red-500/30 flex items-center justify-center space-x-2"
                  >
                    <Star className="w-5 h-5" />
                    <span>Become an Avenger</span>
                  </button>
                  <button
                    onClick={handleLogin}
                    className="px-8 py-4 bg-slate-800/50 hover:bg-slate-700/70 border border-white/10 hover:border-blue-400 rounded-lg text-lg font-semibold transition-all duration-300"
                  >
                    Access Command Center
                  </button>
                </motion.div>
              </motion.div>
              {/* Image Card */}
              <motion.div
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <div className="relative group perspective-1000">
                  <motion.div
                    className="relative bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl"
                    whileHover={{ rotateY: 5, rotateX: 2 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="relative overflow-hidden rounded-2xl">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentSlide}
                          src={heroSlides[currentSlide].image}
                          alt="Avengers"
                          className="w-full max-w-full h-64 sm:h-80 md:h-96 object-cover rounded-2xl shadow-2xl"
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                        />
                      </AnimatePresence>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Features Section */}
          <section className="relative z-10 py-16 px-4 sm:px-6 bg-transparent border-t border-white/10">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h3 className="text-4xl font-bold mb-4 text-white">Platform Features</h3>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Everything you need to lead Earth's Mightiest Heroes effectively
                </p>
              </motion.div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Users className="w-8 h-8 text-blue-400 mr-3" />,
                    title: 'Team Management',
                    features: [
                      'Send money to teammates (₹10,000 limit)',
                      'View transaction history',
                      'Submit mission feedback',
                      'View assigned missions',
                    ],
                  },
                  {
                    icon: <Shield className="w-8 h-8 text-red-400 mr-3" />,
                    title: 'Command Control',
                    features: [
                      'Distribute salaries & payments',
                      'Assign & track missions',
                      'Manage team members',
                      'Post announcements',
                    ],
                  },
                  {
                    icon: <Calendar className="w-8 h-8 text-yellow-400 mr-3" />,
                    title: 'Smart Attendance',
                    features: [
                      '6-digit code system',
                      '1-minute time window',
                      'Real-time pop-up alerts',
                      'Attendance history',
                    ],
                  },
                  {
                    icon: <DollarSign className="w-8 h-8 text-green-400 mr-3" />,
                    title: 'Secure Payments',
                    features: [
                      'Trial payment gateway',
                      'Advanced payment modes',
                      'Bulk salary distribution',
                      'Transaction tracking',
                    ],
                  },
                  {
                    icon: <BarChart3 className="w-8 h-8 text-purple-400 mr-3" />,
                    title: 'Analytics Dashboard',
                    features: [
                      'Attendance statistics',
                      'Interactive charts',
                      'Performance metrics',
                      'Mission success rates',
                    ],
                  },
                  {
                    icon: <Zap className="w-8 h-8 text-yellow-400 mr-3" />,
                    title: 'Communication Hub',
                    features: [
                      'Email notifications',
                      'Important alerts',
                      'Feedback system',
                      'Team announcements',
                    ],
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-red-400/50 transition-all duration-300 hover:transform hover:scale-105"
                  >
                    <div className="flex items-center mb-4">
                      {feature.icon}
                      <h4 className="text-xl font-semibold text-white">{feature.title}</h4>
                    </div>
                    <ul className="space-y-2 text-gray-300">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

         

          <Footer />
        </>
      )}

      <style jsx>{`
        @keyframes spin-very-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-very-slow {
          animation: spin-very-slow 60s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Features;