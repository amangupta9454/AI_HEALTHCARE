// new
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    age: '',
    gender: '',
    address: '',
    photo: null,
    speciality: '',
    qualification: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [preview, setPreview] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validateName = (name) => name.length >= 2;
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;
  const validateMobile = (mobile) => /^[6789][0-9]{9}$/.test(mobile); // Indian mobile numbers
  const validateAge = (age) => age >= 1 && age <= 120;
  const validateGender = (gender) => ['male', 'female', 'other'].includes(gender);
  const validateAddress = (address) => address.length >= 5;
  const validatePhoto = (file) => !file || file.size <= 1 * 1024 * 1024; // 1MB
  const validateSpeciality = (speciality) => role === 'doctor' ? speciality.length > 0 : true;
  const validateQualification = (qualification) => role === 'doctor' ? qualification.length > 0 : true;
  const validateOtp = (otp) => otp.length === 6 && /^[0-9]+$/.test(otp);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation
    if (name === 'name') {
      setErrors((prev) => ({
        ...prev,
        name: !value ? 'Name is required' : !validateName(value) ? 'Name must be at least 2 characters' : '',
      }));
    } else if (name === 'email') {
      setErrors((prev) => ({
        ...prev,
        email: !value ? 'Email is required' : !validateEmail(value) ? 'Invalid email format' : '',
      }));
    } else if (name === 'password' && role === 'patient') {
      setErrors((prev) => ({
        ...prev,
        password: !value ? 'Password is required' : !validatePassword(value) ? 'Password must be at least 6 characters' : '',
      }));
    } else if (name === 'mobile') {
      setErrors((prev) => ({
        ...prev,
        mobile: !value ? 'Mobile is required' : !validateMobile(value) ? 'Invalid mobile number (10 digits, starts with 6-9)' : '',
      }));
    } else if (name === 'age') {
      setErrors((prev) => ({
        ...prev,
        age: !value ? 'Age is required' : !validateAge(parseInt(value)) ? 'Age must be between 1 and 120' : '',
      }));
    } else if (name === 'gender') {
      setErrors((prev) => ({
        ...prev,
        gender: !value ? 'Gender is required' : !validateGender(value) ? 'Invalid gender' : '',
      }));
    } else if (name === 'address' && role === 'patient') {
      setErrors((prev) => ({
        ...prev,
        address: !value ? 'Address is required' : !validateAddress(value) ? 'Address must be at least 5 characters' : '',
      }));
    } else if (name === 'speciality' && role === 'doctor') {
      setErrors((prev) => ({
        ...prev,
        speciality: !value ? 'Speciality is required' : '',
      }));
    } else if (name === 'qualification' && role === 'doctor') {
      setErrors((prev) => ({
        ...prev,
        qualification: !value ? 'Qualification is required' : '',
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validatePhoto(file)) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, photo: '' }));
    } else {
      setErrors((prev) => ({ ...prev, photo: 'Photo must be less than 1MB' }));
      setFormData({ ...formData, photo: null });
      setPreview(null);
    }
  };

  const handleSendOtp = async () => {
    setApiError('');
    setLoading(true);

    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: 'Invalid email format' }));
      setLoading(false);
      return;
    }

    if (!['patient', 'doctor'].includes(role)) {
      setApiError('Invalid role selected');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/send-otp`, {
        email: formData.email,
        role,
      });
      setOtpSent(true);
      setApiSuccess('OTP sent to your email!');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validate all fields
    const newErrors = {
      name: !formData.name ? 'Name is required' : !validateName(formData.name) ? 'Invalid name' : '',
      email: !formData.email ? 'Email is required' : !validateEmail(formData.email) ? 'Invalid email' : '',
      password: role === 'patient' ? !formData.password ? 'Password is required' : !validatePassword(formData.password) ? 'Invalid password' : '' : '',
      mobile: !formData.mobile ? 'Mobile is required' : !validateMobile(formData.mobile) ? 'Invalid mobile' : '',
      age: !formData.age ? 'Age is required' : !validateAge(parseInt(formData.age)) ? 'Invalid age' : '',
      gender: !formData.gender ? 'Gender is required' : !validateGender(formData.gender) ? 'Invalid gender' : '',
      address: role === 'patient' ? !formData.address ? 'Address is required' : !validateAddress(formData.address) ? 'Invalid address' : '' : '',
      speciality: role === 'doctor' ? !formData.speciality ? 'Speciality is required' : '' : '',
      qualification: role === 'doctor' ? !formData.qualification ? 'Qualification is required' : '' : '',
      photo: formData.photo && !validatePhoto(formData.photo) ? 'Photo must be less than 1MB' : '',
      otp: !otp ? 'OTP is required' : !validateOtp(otp) ? 'Invalid OTP' : '',
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) {
      setApiError('Please fix all errors before submitting');
      return;
    }

    if (!otpSent) {
      setApiError('Please request an OTP first');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      if (role === 'patient') data.append('password', formData.password);
      data.append('mobile', formData.mobile);
      data.append('age', formData.age);
      data.append('gender', formData.gender);
      if (role === 'patient') data.append('address', formData.address);
      if (role === 'doctor') {
        data.append('speciality', formData.speciality);
        data.append('qualification', formData.qualification);
      }
      if (formData.photo) {
        data.append('photo', formData.photo);
      }
      data.append('otp', otp);
      data.append('role', role);

      // Log FormData contents for debugging
      for (let [key, value] of data.entries()) {
        console.log(`FormData: ${key}=${value}`);
      }

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, data);
      localStorage.setItem('token', response.data.token);
      setApiSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate(role === 'patient' ? '/login' : '/login'), 2000);
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      setApiError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-violet-900 to-gray-800 flex items-center justify-center p-4 sm:p-6 lg:p-8  ">
      <div className="bg-transparent bg-opacity-95 p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl w-full max-w-5xl backdrop-blur-xl transition-all duration-500 ease-in-out ">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-white tracking-tight pt-16">Create Your Account</h2>
        {apiError && (
          <div className="mb-6 p-4 bg-red-200 text-red-800 rounded-xl border border-red-300 shadow-md animate-fade-in">
            {apiError}
          </div>
        )}
        {apiSuccess && (
          <div className="mb-6 p-4 bg-green-200 text-green-800 rounded-xl border border-green-300 shadow-md animate-fade-in">
            {apiSuccess}
          </div>
        )}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-white mb-2">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-300 hover:shadow-lg"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              } bg-white placeholder-gray-500`}
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-600 text-xs mt-1 animate-fade-in">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Email</label>
            <div className="flex">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 border rounded-l-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg ${
                  errors.email ? 'border-red-400' : 'border-gray-300'
                } bg-white placeholder-gray-500`}
                placeholder="Enter your email"
                disabled={otpSent}
              />
              {!otpSent && (
                <button
                  onClick={handleSendOtp}
                  className="p-3 bg-indigo-600 text-white rounded-r-xl hover:bg-indigo-700 disabled:bg-gray-500 transition-all duration-300 font-medium"
                  disabled={loading || !formData.email || errors.email}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              )}
            </div>
            {errors.email && <p className="text-red-600 text-xs mt-1 animate-fade-in">{errors.email}</p>}
          </div>
          {otpSent && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg ${
                  errors.otp ? 'border-red-400' : 'border-gray-300'
                } bg-white placeholder-gray-500`}
                placeholder="Enter OTP"
              />
              {errors.otp && <p className="text-red-600 text-xs mt-1 animate-fade-in">{errors.otp}</p>}
            </div>
          )}
          {role === 'patient' && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg ${
                    errors.password ? 'border-red-400' : 'border-gray-300'
                  } bg-white placeholder-gray-500`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-xs mt-1 animate-fade-in">{errors.password}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg ${
                errors.mobile ? 'border-red-400' : 'border-gray-300'
              } bg-white placeholder-gray-500`}
              placeholder="Enter mobile number"
            />
            {errors.mobile && <p className="text-red-600 text-xs mt-1 animate-fade-in">{errors.mobile}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg ${
                errors.age ? 'border-red-400' : 'border-gray-300'
              } bg-white placeholder-gray-500`}
              placeholder="Enter your age"
            />
            {errors.age && <p className="text-red-600 text-xs mt-1 animate-fade-in">{errors.age}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg ${
                errors.gender ? 'border-red-400' : 'border-gray-300'
              } bg-white placeholder-gray-500`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-red-600 text-xs mt-1 animate-fade-in">{errors.gender}</p>}
          </div>
          {role === 'patient' && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg ${
                  errors.address ? 'border-red-400' : 'border-gray-300'
                } bg-white placeholder-gray-500`}
                placeholder="Enter your address"
              />
              {errors.address && <p className="text-red-600 text-xs mt-1 animate-fade-in">{errors.address}</p>}
            </div>
          )}
          {role === 'doctor' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Speciality</label>
                <input
                  type="text"
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg ${
                    errors.speciality ? 'border-red-400' : 'border-gray-300'
                  } bg-white placeholder-gray-500`}
                  placeholder="Enter your speciality"
                />
                {errors.speciality && <p className="text-red-600 text-xs mt-1 animate-fade-in">{errors.speciality}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg ${
                    errors.qualification ? 'border-red-400' : 'border-gray-300'
                  } bg-white placeholder-gray-500`}
                  placeholder="Enter your qualification"
                />
                {errors.qualification && <p className="text-red-600 text-xs mt-1 animate-fade-in">{errors.qualification}</p>}
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 border-gray-300 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-all duration-300"
            />
            {errors.photo && <p className="text-red-600 text-xs mt-1 animate-fade-in">{errors.photo}</p>}
            {preview && <img src={preview} alt="Preview" className="mt-4 w-28 h-28 rounded-full object-cover border-2 border-gray-300 shadow-md transition-transform duration-300 hover:scale-105" />}
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="mt-8 w-full bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:bg-gray-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
          disabled={loading || Object.values(errors).some((error) => error)}
        >
          {loading ? 'Submitting...' : 'Register'}
        </button>
        <p className="mt-6 text-center text-sm text-white">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-500 hover:text-indigo-600 font-semibold transition-colors duration-200">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;