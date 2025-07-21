// --- Updated Signup.jsx ---
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import axiosClient from '../utils/axiosClient';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  passWord: z.string().min(8, "Password is too weak"),
});

function Signup() {
  const [showpassWord, setShowpassWord] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const emailValue = watch('emailId');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    if (!isEmailVerified) {
      alert('Please verify your email before signing up.');
      return;
    }
    dispatch(registerUser(data));
  };

  const sendOtp = async () => {
    try {
      if (!emailValue) {
        alert("Please enter a valid email first.");
        return;
      }
      const normalizedEmail = emailValue.trim().toLowerCase();
      const res = await axiosClient.post('/user/send-otp', { emailId: normalizedEmail });
      if (res.status === 200) {
        setOtpSent(true);
        setOtp(['', '', '', '']);
        setOtpMessage('OTP sent to your email!');
      }
    } catch (err) {
      console.error("Send OTP failed:", err);
      setOtpMessage('Failed to send OTP.');
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
      setOtpMessage("Enter all 4 digits.");
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
        setOtpMessage("✅ Email verified successfully!");
      } else {
        setOtpMessage("❌ Invalid OTP. Try again.");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setOtpMessage("OTP verification failed.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900 text-white p-4">
      <div className="card w-full max-w-md bg-black/70 backdrop-blur-md border border-cyan-500 rounded-xl shadow-2xl p-6">
        <h2 className="text-3xl text-center font-bold mb-6 tracking-widest text-cyan-300">AvengersNexus</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-control mb-4">
            <label className="label-text mb-1">First Name</label>
            <input type="text" placeholder="Steve" {...register('firstName')}
              className={`input input-bordered w-full bg-black text-white border-cyan-500 ${errors.firstName ? 'border-red-500' : ''}`} />
            {errors.firstName && <span className="text-red-400 text-sm mt-1">{errors.firstName.message}</span>}
          </div>

          <div className="form-control mb-4">
            <label className="label-text mb-1">Email</label>
            <div className="flex gap-2">
              <input type="email" placeholder="tony@starkindustries.com" {...register('emailId')} disabled={isEmailVerified}
                className={`input input-bordered flex-1 bg-black text-white border-cyan-500 ${errors.emailId ? 'border-red-500' : ''}`} />
              <button type="button" onClick={sendOtp} disabled={isEmailVerified}
                className="btn btn-outline btn-sm border-cyan-500 text-cyan-300">
                {isEmailVerified ? "Verified" : "Verify"}
              </button>
            </div>
            {errors.emailId && <span className="text-red-400 text-sm mt-1">{errors.emailId.message}</span>}
          </div>

          {otpSent && !isEmailVerified && (
            <div className="form-control mb-4">
              <label className="label-text mb-1">Enter OTP</label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input key={index} id={`otp-${index}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="input input-bordered w-12 text-center text-xl bg-black border-cyan-500 text-white" />
                ))}
              </div>
              <button type="button" onClick={verifyOtp} disabled={verifyingOtp} className="btn btn-success btn-sm mt-2">
                {verifyingOtp ? "Verifying..." : "Submit OTP"}
              </button>
              {otpMessage && <p className="text-info text-sm mt-2">{otpMessage}</p>}
            </div>
          )}

          <div className="form-control mb-6">
            <label className="label-text mb-1">Password</label>
            <div className="relative">
              <input type={showpassWord ? "text" : "password"} placeholder="••••••••" {...register('passWord')}
                className={`input input-bordered w-full pr-10 bg-black text-white border-cyan-500 ${errors.passWord ? 'border-red-500' : ''}`} />
              <button type="button" className="absolute top-1/2 right-3 transform -translate-y-1/2"
                onClick={() => setShowpassWord(!showpassWord)}>
                {showpassWord ? (
                  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7s-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.passWord && <span className="text-red-400 text-sm mt-1">{errors.passWord.message}</span>}
          </div>

          <div className="form-control">
            <button type="submit"
              className={`btn btn-primary bg-cyan-700 text-white hover:bg-cyan-600 ${loading ? 'loading' : ''}`}
              disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <NavLink to="/login" className="text-cyan-300 hover:underline">
            Login
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Signup;