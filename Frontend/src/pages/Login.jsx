import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { loginUser } from '../authSlice';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  passWord: z.string().min(8, "Password is too weak")
});

function Login() {
  const [showpassWord, setShowpassWord] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    setIsLoaded(true);
    if (isAuthenticated) {
      navigate('/');
    }
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(resultAction)) {
      
        navigate('/');
      } else {
        const errMsg = resultAction.payload?.message || "Login failed.";
        alert(`❌ ${errMsg}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("❌ Something went wrong.");
    }
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

      <div className="relative z-10 min-h-screen flex items-center justify-center py-10 px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          className="w-full max-w-md"
        >
          <div className="relative group perspective-1000">
            <motion.div
              className="absolute -inset-12 bg-gradient-to-r from-red-500 via-white to-blue-500 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-1000"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="relative bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/30 shadow-2xl"
              whileHover={{ rotateY: 5, rotateX: 2 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute top-6 left-6 w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full animate-ping"></div>
              <div className="absolute top-6 right-6 w-4 h-4 sm:w-6 sm:h-6 bg-blue-500 rounded-full animate-ping delay-300"></div>
              <div className="absolute bottom-6 left-6 w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full animate-ping delay-600"></div>
              <div className="absolute bottom-6 right-6 w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full animate-ping delay-900"></div>

              <motion.h2
                variants={itemVariants}
                className="text-3xl sm:text-4xl font-black text-center mb-8 bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent"
                whileHover={{ textShadow: "0 0 20px rgba(255,255,255,0.5)" }}
              >
                AvengersNexus Login
              </motion.h2>

              <div className="space-y-6">
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-gray-200 text-sm font-light">Email</label>
                  <input
                    type="email"
                    placeholder="bruce@avengers.com"
                    {...register('emailId')}
                    className={`w-full p-3 rounded-lg bg-black/70 text-white border ${errors.emailId ? 'border-red-500' : 'border-white/30'} focus:outline-none focus:border-cyan-400 transition-all duration-300`}
                  />
                  {errors.emailId && <span className="text-red-400 text-sm">{errors.emailId.message}</span>}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-gray-200 text-sm font-light">Password</label>
                  <div className="relative">
                    <input
                      type={showpassWord ? "text" : "password"}
                      placeholder="••••••••"
                      {...register('passWord')}
                      className={`w-full p-3 rounded-lg bg-black/70 text-white border ${errors.passWord ? 'border-red-500' : 'border-white/30'} focus:outline-none focus:border-cyan-400 transition-all duration-300`}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 transform -translate-y-1/2"
                      onClick={() => setShowpassWord(!showpassWord)}
                    >
                      {showpassWord ? (
                        <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.passWord && <span className="text-red-400 text-sm">{errors.passWord.message}</span>}
                </motion.div>

                <motion.button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  className={`w-full p-3 rounded-lg bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold ${loading ? 'opacity-50' : ''} shadow-lg`}
                  disabled={loading}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  variants={itemVariants}
                >
                  {loading ? 'Logging In...' : 'Login'}
                </motion.button>

                <motion.p variants={itemVariants} className="text-sm text-center text-gray-200">
                  Don’t have an account?{' '}
                  <NavLink to="/signup" className="text-cyan-400 hover:underline font-medium">
                    Sign Up
                  </NavLink>
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

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
    </div>
  );
}

export default Login;