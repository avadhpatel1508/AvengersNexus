import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import axiosClient from '../utils/axiosClient';

// Updated schema with strong password validation
const signupSchema = z.object({
  firstName: z.string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  emailId: z.string().email("Please enter a valid email address"),
  passWord: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
    ),
});

function Signup() {
  const [showpassWord, setShowpassWord] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(signupSchema) });

  const emailValue = watch('emailId');
  const firstNameValue = watch('firstName');

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

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const checkUsernameUnique = async (username) => {
    try {
      const response = await axiosClient.post('/user/check-username', { firstName: username });
      return response.data.isUnique;
    } catch (err) {
      return false;
    }
  };

  const onSubmit = async (data) => {
    if (!isEmailVerified) {
      setErrorMessage('Please verify your email before signing up.');
      return;
    }

    // Check username uniqueness
    const isUsernameUnique = await checkUsernameUnique(data.firstName);
    if (!isUsernameUnique) {
      setError('firstName', { type: 'manual', message: 'This username is already taken. Please choose a unique username.' });
      return;
    }

    try {
      const resultAction = await dispatch(registerUser({
        ...data,
        emailId: data.emailId.trim().toLowerCase()
      }));
      if (registerUser.fulfilled.match(resultAction)) {
        setErrorMessage('');
        alert("✅ Account created successfully!");
        navigate('/login');
      } else {
        const errMsg = resultAction.payload?.message || "Signup failed.";
        if (errMsg.includes('Email is already registered')) {
          setError('emailId', { type: 'manual', message: 'This email is already registered.' });
        } else if (errMsg.includes('valid email')) {
          setError('emailId', { type: 'manual', message: 'Please enter a valid email address.' });
        } else if (errMsg.includes('Username')) {
          setError('firstName', { type: 'manual', message: errMsg });
        } else if (errMsg.includes('Password')) {
          setError('passWord', { type: 'manual', message: errMsg });
        } else {
          setErrorMessage(errMsg);
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  const sendOtp = async () => {
    if (resendCooldown > 0) {
      setErrorMessage(`Please wait ${resendCooldown} seconds before resending OTP.`);
      return;
    }
    try {
      if (!emailValue) {
        setError('emailId', { type: 'manual', message: 'Please enter a valid email address.' });
        return;
      }
      const normalizedEmail = emailValue.trim().toLowerCase();
      const res = await axiosClient.post('/user/send-otp', { emailId: normalizedEmail });
      if (res.status === 200) {
        setOtpSent(true);
        setOtp(['', '', '', '']);
        setErrorMessage('OTP sent to your email! Please check your inbox.');
        setResendCooldown(30);
      }
    } catch (err) {
      console.error("Send OTP failed:", err);
      const errMsg = err.response?.data?.message || "Failed to send OTP.";
      if (errMsg.includes('already registered')) {
        setError('emailId', { type: 'manual', message: 'This email is already registered.' });
      } else if (errMsg.includes('valid email')) {
        setError('emailId', { type: 'manual', message: 'Please enter a valid email address.' });
      } else {
        setErrorMessage(errMsg);
      }
    }
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
    if (!value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 4) {
      setErrorMessage("Please enter all 4 digits of the OTP.");
      return;
    }
    try {
      setVerifyingOtp(true);
      const normalizedEmail = emailValue.trim().toLowerCase();
      const res = await axiosClient.post('/user/verify-otp', {
        emailId: normalizedEmail,
        otp: fullOtp,
      });
      if (res.data.verified) {
        setIsEmailVerified(true);
        setErrorMessage("Email verified successfully!");
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setErrorMessage(err.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setVerifyingOtp(false);
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
              <motion.h2
                variants={itemVariants}
                className="text-3xl sm:text-4xl font-black text-center mb-8 bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent"
                whileHover={{ textShadow: "0 0 20px rgba(255,255,255,0.5)" }}
              >
                Join AvengersNexus
              </motion.h2>

              <div className="space-y-6">
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-gray-200 text-sm font-light">Username</label>
                  <input
                    type="text"
                    placeholder="Steve_Rogers"
                    {...register('firstName')}
                    className={`w-full p-3 rounded-lg bg-black/70 text-white border ${errors.firstName ? 'border-red-500' : 'border-white/30'} focus:outline-none focus:border-cyan-400 transition-all duration-300`}
                  />
                  {errors.firstName && <span className="text-red-400 text-sm">{errors.firstName.message}</span>}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-gray-200 text-sm font-light">Email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="tony@starkindustries.com"
                      {...register('emailId')}
                      disabled={isEmailVerified}
                      className={`flex-1 p-3 rounded-lg bg-black/70 text-white border ${errors.emailId ? 'border-red-500' : 'border-white/30'} focus:outline-none focus:border-cyan-400 transition-all duration-300`}
                    />
                    {!isEmailVerified && (
                      <motion.button
                        type="button"
                        onClick={sendOtp}
                        disabled={resendCooldown > 0 || isEmailVerified}
                        className={`px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold ${resendCooldown > 0 || isEmailVerified ? 'opacity-50' : ''} shadow-lg`}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255,255,255,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {otpSent && resendCooldown > 0 ? `Resend (${resendCooldown}s)` : otpSent ? 'Resend OTP' : 'Verify'}
                      </motion.button>
                    )}
                    {isEmailVerified && (
                      <span className="px-4 py-2 text-green-400 font-semibold">Verified</span>
                    )}
                  </div>
                  {errors.emailId && <span className="text-red-400 text-sm">{errors.emailId.message}</span>}
                </motion.div>

                {otpSent && !isEmailVerified && (
                  <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-gray-200 text-sm font-light">Enter OTP</label>
                    <div className="flex gap-2 justify-center">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          className="w-12 p-3 rounded-lg bg-black/70 text-white text-center text-xl border border-white/30 focus:outline-none focus:border-cyan-400 transition-all duration-300"
                        />
                      ))}
                    </div>
                    <motion.button
                      type="button"
                      onClick={verifyOtp}
                      disabled={verifyingOtp}
                      className="w-full p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold disabled:opacity-50 shadow-lg"
                      whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255,255,255,0.3)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {verifyingOtp ? "Verifying..." : "Submit OTP"}
                    </motion.button>
                  </motion.div>
                )}

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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.passWord && <span className="text-red-400 text-sm">{errors.passWord.message}</span>}
                </motion.div>

                {errorMessage && (
                  <motion.p
                    className={`text-sm ${errorMessage.includes('successfully') ? 'text-cyan-400' : 'text-red-400'} text-center`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {errorMessage}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  className={`w-full p-3 rounded-lg bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold ${loading ? 'opacity-50' : ''} shadow-lg`}
                  disabled={loading}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  variants={itemVariants}
                >
                  {loading ? 'Signing Up...' : 'Sign Up'}
                </motion.button>

                <motion.p variants={itemVariants} className="text-sm text-center text-gray-200">
                  Already have an account?{' '}
                  <NavLink to="/login" className="text-cyan-400 hover:underline font-medium">
                    Login
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

export default Signup;