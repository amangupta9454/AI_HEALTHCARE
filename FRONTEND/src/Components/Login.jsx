import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient',
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation
    if (name === 'email') {
      setErrors((prev) => ({
        ...prev,
        email: !value ? 'Email is required' : !validateEmail(value) ? 'Invalid email format' : '',
      }));
    } else if (name === 'password') {
      setErrors((prev) => ({
        ...prev,
        password: !value ? 'Password is required' : !validatePassword(value) ? 'Password must be at least 6 characters' : '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Final validation
    const newErrors = {
      email: !formData.email ? 'Email is required' : !validateEmail(formData.email) ? 'Invalid email format' : '',
      password: !formData.password ? 'Password is required' : !validatePassword(formData.password) ? 'Password must be at least 6 characters' : '',
      role: !formData.role ? 'Role is required' : '',
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) return;

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, formData);
      
      if (formData.role === 'admin' && response.data.message === 'OTP sent for admin login') {
        setOtpSent(true);
        setApiError('');
      } else {
        localStorage.setItem('token', response.data.token);
        const dashboardRoute = formData.role === 'patient' ? '/user-dashboard' : formData.role === 'doctor' ? '/doctor-dashboard' : '/admin-dashboard';
        navigate(dashboardRoute);
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`, {
        email: formData.email,
        otp,
        role: formData.role,
        password: formData.password,
      });

      localStorage.setItem('token', response.data.token);
      navigate('/admin-dashboard');
    } catch (error) {
      setApiError(error.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900  pt-8 sm:pt-12 md:pt-16 lg:pt-20 xl:pt-24 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <div className="relative bg-gray-800/20 backdrop-blur-2xl p-5 xs:p-6 sm:p-8 md:p-10 lg:p-12 rounded-3xl shadow-2xl w-full max-w-[95%] xs:max-w-[360px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[520px] xl:max-w-[560px] border border-gray-700/30 transform hover:scale-[1.02] transition-transform duration-500 ease-out">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/15 to-purple-600/15 rounded-3xl opacity-70"></div>
        <h2 className="relative text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-center mb-5 xs:mb-6 sm:mb-7 md:mb-8 lg:mb-10 text-white tracking-tight drop-shadow-lg animate-fade-in">
          Login
        </h2>
        {apiError && (
          <div className="relative mb-5 xs:mb-6 sm:mb-7 md:mb-8 p-3 xs:p-4 bg-red-900/70 text-red-100 rounded-xl text-center text-xs xs:text-sm sm:text-base md:text-lg shadow-inner animate-pulse">
            {apiError}
          </div>
        )}
        {!otpSent ? (
          <div className="relative space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-7 lg:space-y-8">
            <div>
              <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 w-full p-2 xs:p-3 sm:p-3.5 md:p-4 bg-gray-900/70 border border-gray-600/60 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="text-red-400 text-xs xs:text-sm mt-1">{errors.role}</p>}
            </div>
            <div>
              <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 w-full p-2 xs:p-3 sm:p-3.5 md:p-4 bg-gray-900/70 border ${errors.email ? 'border-red-500' : 'border-gray-600/60'} rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-400 text-xs xs:text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 w-full p-2 xs:p-3 sm:p-3.5 md:p-4 bg-gray-900/70 border ${errors.password ? 'border-red-500' : 'border-gray-600/60'} rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 xs:right-3 sm:right-3.5 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                >
                  {showPassword ? <FiEyeOff size={16} className="xs:h-5 xs:w-5" /> : <FiEye size={16} className="xs:h-5 xs:w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs xs:text-sm mt-1">{errors.password}</p>}
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 xs:p-3 sm:p-3.5 md:p-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-600 flex items-center justify-center transition-all duration-300 font-semibold text-xs xs:text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl"
              disabled={Object.values(errors).some((error) => error) || loading}
            >
              {loading ? (
                <svg className="animate-spin h-4 xs:h-5 w-4 xs:w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              Login
            </button>
          </div>
        ) : (
          <div className="relative space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-7 lg:space-y-8">
            <div>
              <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 w-full p-2 xs:p-3 sm:p-3.5 md:p-4 bg-gray-900/70 border border-gray-600/60 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base"
                placeholder="Enter OTP"
              />
            </div>
            <button
              onClick={handleOtpSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 xs:p-3 sm:p-3.5 md:p-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-600 flex items-center justify-center transition-all duration-300 font-semibold text-xs xs:text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-4 xs:h-5 w-4 xs:w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              Verify OTP
            </button>
          </div>
        )}
        <p className="relative mt-5 xs:mt-6 sm:mt-7 md:mt-8 text-center text-xs xs:text-sm sm:text-base md:text-lg text-gray-300">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;