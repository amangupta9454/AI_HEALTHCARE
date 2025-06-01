import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, formData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      if (user.role === 'Patient') {
        navigate('/patient-dashboard');
      } else if (user.role === 'Doctor') {
        navigate('/doctor-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-teal-900/80 to-gray-800 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="relative bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md border border-teal-500/30 ring-1 ring-teal-500/20 transition-all duration-300 hover:ring-2 hover:ring-cyan-400/70 hover:shadow-cyan-300/20 animate-fade-in-up z-0">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-teal-300 mb-8 tracking-tight drop-shadow-md">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-200">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-2 block w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors duration-200 hover:border-teal-500/50 z-20"
              placeholder="your.email@example.com"
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-200">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="mt-2 block w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors duration-200 hover:border-teal-500/50 z-20"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 sm:top-10 text-gray-400 hover:text-teal-400 transition-colors duration-200 z-30 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-sm sm:text-base text-center bg-gray-800/60 backdrop-blur-sm rounded-lg py-2 px-4 animate-fade-in z-20">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-600 focus:ring-2 focus:ring-teal-400/50 transition-all duration-200 hover:shadow-teal-500/20 z-20"
          >
            Sign In
          </button>
          <p className="text-sm sm:text-base text-center text-gray-300 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 font-semibold hover:text-teal-300 hover:underline transition-colors duration-200 z-20">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;