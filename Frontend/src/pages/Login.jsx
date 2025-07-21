import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { useEffect, useState } from 'react';
import { loginUser } from '../authSlice';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  passWord: z.string().min(8, "Password is too weak")
});

function Login() {
  const [showpassWord, setShowpassWord] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900 text-white p-4">
      <div className="card w-full max-w-md bg-black/70 backdrop-blur-md border border-cyan-500 rounded-xl shadow-2xl p-6">
        <h2 className="text-3xl text-center font-bold mb-6 tracking-widest text-cyan-300">AvengersNexus</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-control mb-4">
            <label className="label-text mb-1">Email</label>
            <input
              type="email"
              placeholder="bruce@avengers.com"
              {...register('emailId')}
              className={`input input-bordered w-full bg-black text-white border-cyan-500 ${errors.emailId ? 'border-red-500' : ''}`}
            />
            {errors.emailId && <span className="text-red-400 text-sm mt-1">{errors.emailId.message}</span>}
          </div>

          <div className="form-control mb-6">
            <label className="label-text mb-1">Password</label>
            <div className="relative">
              <input
                type={showpassWord ? "text" : "password"}
                placeholder="••••••••"
                {...register('passWord')}
                className={`input input-bordered w-full pr-10 bg-black text-white border-cyan-500 ${errors.passWord ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowpassWord(!showpassWord)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
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
            {errors.passWord && <span className="text-red-400 text-sm mt-1">{errors.passWord.message}</span>}
          </div>

          <div className="form-control">
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary bg-cyan-700 text-white hover:bg-cyan-600 ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </div>
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{' '}
          <NavLink to="/signup" className="text-cyan-300 hover:underline">
            Sign Up
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Login;
