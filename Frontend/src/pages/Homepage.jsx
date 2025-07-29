import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import firstImg from '../assets/first.jpg?w=800&h=600&fit=crop'
import secondImg from '../assets/second.jpg?w=800&h=600&fit=crop'
import thirdImg from '../assets/third.jpg?w=800&h=600&fit=crop'
const Homepage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
  {
    image: firstImg,
    title: "STEVE ROGERS",
    subtitle: "THE MAN BEHIND THE SHIELD",
    description: "Steve Rogers started as a humble kid from Brooklyn with a brave heart, long before he wore the red, white, and blue."
  },
  {
    image: secondImg,
    title: "CAPTAIN AMERICA",
    subtitle: "THE SYMBOL OF FREEDOM",
    description: "As Captain America, Steve led the Avengers and became a beacon of hope, justice, and resilience across generations."
  },
    {
      image: thirdImg,
      title: "THE SHIELD",
      subtitle: "VIBRANIUM LEGACY",
      description: "Forged from vibranium, Captain America's shield is both his primary weapon and symbol of justice."
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
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
        ease: "easeOut",
      },
    },
  };

  const slideVariants = {
    enter: { x: 1000, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -1000, opacity: 0 }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background */}
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

        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-red-500/30 via-transparent to-transparent transform rotate-12 animate-pulse"></div>
          <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-blue-500/30 via-transparent to-transparent transform -rotate-12 animate-pulse delay-1000"></div>
          <div className="absolute top-0 left-2/3 w-1 h-full bg-gradient-to-b from-white/20 via-transparent to-transparent transform rotate-6 animate-pulse delay-2000"></div>
        </div>

        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, rgba(37, 99, 235, 0.06) 50%, transparent 70%)',

          }}
          transition={{ type: "spring", stiffness: 20, damping: 30 }}
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

      <UserNavbar />

      <div className="relative z-10 min-h-screen flex items-center py-10 px-4 sm:px-6">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
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
                  <motion.span className="block text-white" whileHover={{ textShadow: "0 0 20px rgba(255,255,255,0.5)" }}>
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
          </motion.div>

          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <div className="relative group perspective-1000">


              <motion.div
                className="relative bg-gradient-to-br from-slate-800/60 via-transparent to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl"
                whileHover={{ rotateY: 5, rotateX: 2 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute top-6 left-6 w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute top-6 right-6 w-4 h-4 sm:w-6 sm:h-6 bg-blue-500 rounded-full animate-ping delay-300"></div>
                <div className="absolute bottom-6 left-6 w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full animate-ping delay-600"></div>
                <div className="absolute bottom-6 right-6 w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full animate-ping delay-900"></div>

                <div className="relative overflow-hidden rounded-2xl">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentSlide}
                      src={heroSlides[currentSlide].image}
                      alt="Captain America"
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
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0, rotate: -360 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 2.5, duration: 1, type: "spring" }}
      >
        
      </motion.div>

      <style jsx>{`
        @keyframes spin-very-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-very-slow {
          animation: spin-very-slow 60s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default Homepage;
