import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    age: '',
    gender: '',
    speciality: '',
    qualification: '',
    photo: null,
  });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [showListingForm, setShowListingForm] = useState(false);
  const [listingStatus, setListingStatus] = useState('none');
  const [rescheduleData, setRescheduleData] = useState({ id: '', date: '', time: '' });
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showUpdateProfileForm, setShowUpdateProfileForm] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userResponse.data.role !== 'doctor') {
        navigate('/login');
        return;
      }
      const listingResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/listing/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const appointmentResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userResponse.data);
      setListingStatus(listingResponse.data.listingStatus);
      setAppointments(appointmentResponse.data);
      setFormData({
        name: userResponse.data.name,
        email: userResponse.data.email,
        mobile: userResponse.data.mobile,
        age: userResponse.data.age,
        gender: userResponse.data.gender,
        speciality: userResponse.data.speciality || '',
        qualification: userResponse.data.qualification || '',
        photo: null,
      });
      setPreview(userResponse.data.photo);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to fetch user data');
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const validateName = (name) => name.length >= 2;
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateMobile = (mobile) => /^[6789][0-9]{9}$/.test(mobile);
  const validateAge = (age) => age >= 1 && age <= 120;
  const validateGender = (gender) => ['male', 'female', 'other'].includes(gender);
  const validateSpeciality = (speciality) => speciality.length > 0;
  const validateQualification = (qualification) => qualification.length > 0;
  const validatePhoto = (file) => !file || file.size <= 1 * 1024 * 1024;
  const validatePassword = (password) => password.length >= 6;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    } else if (name === 'mobile') {
      setErrors((prev) => ({
        ...prev,
        mobile: !value ? 'Mobile number is required' : !validateMobile(value) ? 'Invalid mobile number' : '',
      }));
    } else if (name === 'age') {
      setErrors((prev) => ({
        ...prev,
        age: !value ? 'Age is required' : !validateAge(value) ? 'Age must be between 1 and 120' : '',
      }));
    } else if (name === 'gender') {
      setErrors((prev) => ({
        ...prev,
        gender: !value ? 'Gender is required' : !validateGender(value) ? 'Invalid gender' : '',
      }));
    } else if (name === 'speciality') {
      setErrors((prev) => ({
        ...prev,
        speciality: !value ? 'Speciality is required' : !validateSpeciality(value) ? 'Speciality is required' : '',
      }));
    } else if (name === 'qualification') {
      setErrors((prev) => ({
        ...prev,
        qualification: !value ? 'Qualification is required' : !validateQualification(value) ? 'Qualification is required' : '',
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
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (name === 'currentPassword') {
      setErrors((prev) => ({
        ...prev,
        currentPassword: !value ? 'Current password is required' : '',
      }));
    } else if (name === 'newPassword') {
      setErrors((prev) => ({
        ...prev,
        newPassword: !value ? 'New password is required' : !validatePassword(value) ? 'Password must be at least 6 characters' : '',
      }));
    } else if (name === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== passwordData.newPassword ? 'Passwords do not match' : '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    if (Object.values(errors).some((error) => error) || Object.values(formData).some((v) => !v && v !== null)) {
      setApiError('Please fix all errors before submitting');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('mobile', formData.mobile);
      data.append('age', formData.age);
      data.append('gender', formData.gender);
      data.append('speciality', formData.speciality);
      data.append('qualification', formData.qualification);
      if (formData.photo) {
        data.append('photo', formData.photo);
      }
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/auth/update-profile`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
      setListingStatus(response.data.user.listingStatus);
      setApiSuccess('Profile updated successfully');
      setShowUpdateProfileForm(false);
      setTimeout(() => setApiSuccess(''), 3000);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    if (Object.values(errors).some((error) => error) || Object.values(passwordData).some((v) => !v)) {
      setApiError('Please fix errors before submitting');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/auth/update-password`, passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApiSuccess('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setApiSuccess(''), 3000);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to update password');
    }
  };

  const handleListingSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/listing`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApiSuccess('Listing submitted successfully');
      setListingStatus('accepted');
      setShowListingForm(false);
      setTimeout(() => setApiSuccess(''), 3000);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to submit listing');
    }
  };

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/appointments/${id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(appointments.map((appt) => appt._id === id ? response.data.appointment : appt));
      setApiSuccess('Appointment confirmed');
      setTimeout(() => setApiSuccess(''), 3000);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to confirm appointment');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/appointments/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(appointments.map((appt) => appt._id === id ? response.data.appointment : appt));
      setApiSuccess('Appointment rejected');
      setTimeout(() => setApiSuccess(''), 3000);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to reject appointment');
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleData.date || !rescheduleData.time) {
      setApiError('Date and time are required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/appointments/${rescheduleData.id}/reschedule`, {
        date: rescheduleData.date,
        time: rescheduleData.time,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(appointments.map((appt) => appt._id === rescheduleData.id ? response.data.appointment : appt));
      setApiSuccess('Appointment rescheduled');
      setShowRescheduleModal(false);
      setRescheduleData({ id: '', date: '', time: '' });
      setTimeout(() => setApiSuccess(''), 3000);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to reschedule appointment');
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-black">
      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-blue-400 border-opacity-80"></div>
      <span className="ml-4 text-lg sm:text-xl text-gray-100 font-semibold animate-pulse">Loading...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-black pt-16 sm:pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 lg:space-y-20">
        <header className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl opacity-50 transform scale-110"></div>
          <h2 className="relative text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 tracking-tight animate-slide-in pt-16">Doctor Dashboard</h2>
          <p className="relative mt-3 text-base sm:text-lg lg:text-xl text-gray-200 max-w-3xl mx-auto font-light leading-relaxed">Effortlessly manage your profile, appointments, and professional listings with a sleek, modern interface.</p>
        </header>

        {apiError && (
          <div className="mx-auto w-full max-w-3xl p-4 sm:p-5 bg-red-950/90 text-red-100 rounded-2xl shadow-lg flex items-center animate-slide-in border border-red-800/50 backdrop-blur-md">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm sm:text-base lg:text-lg font-medium">{apiError}</span>
          </div>
        )}
        {apiSuccess && (
          <div className="mx-auto w-full max-w-3xl p-4 sm:p-5 bg-green-950/90 text-green-100 rounded-2xl shadow-lg flex items-center animate-slide-in border border-green-800/50 backdrop-blur-md">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm sm:text-base lg:text-lg font-medium">{apiSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          <section className="bg-gray-900/70 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg border border-gray-800/30 backdrop-blur-lg transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-6 sm:mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text ">Doctor Details</h3>
            <div className="space-y-4 sm:space-y-5">
              {[
                { label: 'Name', value: user.name, isBold: true },
                { label: 'Email', value: user.email },
                { label: 'Mobile', value: user.mobile },
                { label: 'Age', value: user.age },
                { label: 'Gender', value: user.gender },
                { label: 'Speciality', value: user.speciality || 'N/A' },
                { label: 'Qualification', value: user.qualification || 'N/A' },
              ].map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-600/40 py-3 sm:py-4 hover:bg-gray-800/30 transition-all duration-200 group">
                  <span className="font-medium text-sm sm:text-base text-gray-400 sm:w-2/5">{item.label}</span>
                  <span className={`text-white ${item.isBold ? 'font-semibold' : 'font-medium'} mt-1 sm:mt-0 text-sm sm:text-base group-hover:text-blue-400 transition-all duration-300`}>{item.value}</span>
                </div>
              ))}
              {user.photo && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between group">
                  <span className="font-medium text-sm sm:text-base text-gray-400 sm:w-2/5">Photo</span>
                  <img src={user.photo} alt="Profile" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full shadow-sm mt-2 sm:mt-0 border-2 border-blue-600/20 group-hover:scale-105 group-hover:border-blue-500/40 transition-all duration-300" />
                </div>
              )}
            </div>
            <button
              onClick={() => setShowUpdateProfileForm(!showUpdateProfileForm)}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 font-semibold text-sm sm:text-base shadow-sm hover:shadow-md animate-pulse-hover"
            >
              {showUpdateProfileForm ? 'Cancel' : 'Update Your Profile'}
            </button>
            {showUpdateProfileForm && (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:space-y-6">
                {[
                  { name: 'name', label: 'Name', type: 'text', placeholder: 'Enter your name' },
                  { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
                  { name: 'mobile', label: 'Mobile Number', type: 'text', placeholder: 'Enter your mobile number' },
                  { name: 'age', label: 'Age', type: 'number', placeholder: 'Enter your age' },
                  { name: 'speciality', label: 'Speciality', type: 'text', placeholder: 'Enter your speciality' },
                  { name: 'qualification', label: 'Qualification', type: 'text', placeholder: 'Enter your qualification' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm sm:text-base font-medium text-gray-200 mb-2 sm:mb-3">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className={`w-full p-3 sm:p-4 rounded-lg focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 bg-gray-800/30 text-white placeholder-gray-400/70 text-sm sm:text-base ${errors[field.name] ? 'border-red-500 focus:ring-red-400/30' : 'border-gray-600 hover:border-blue-400'} border shadow-sm hover:shadow-md`}
                      placeholder={field.placeholder}
                    />
                    {errors[field.name] && <p className="text-red-400 text-xs sm:text-sm mt-2 animate-pulse">{errors[field.name]}</p>}
                  </div>
                ))}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-200 mb-2 sm:mb-3">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full p-3 sm:p-4 rounded-lg focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 bg-gray-800/30 text-white text-sm sm:text-base ${errors.gender ? 'border-red-500 focus:ring-red-400/30' : 'border-gray-600 hover:border-blue-400'} border shadow-sm hover:shadow-md`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-400 text-xs sm:text-sm mt-2 animate-pulse">{errors.gender}</p>}
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-200 mb-2 sm:mb-3">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-3 sm:p-4 rounded-lg bg-gray-800/30 text-white border border-gray-600/50 text-sm sm:text-base file:mr-4 file:py-2 file:px-3 sm:file:py-3 sm:file:px-4 file:rounded-sm file:border-0 file:text-sm file:bg-blue-500/70 file:text-white file:cursor-pointer hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                  {preview && <img src={preview} alt="Preview" className="mt-4 w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl shadow-sm border-2 border-blue-600/20 hover:border-blue-600/30 transition-all duration-300" />}
                  {errors.photo && <p className="text-red-400 text-xs sm:text-sm mt-2 animate-pulse">{errors.photo}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-lg hover:from-blue-500 hover:to-purple-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-sm sm:text-base shadow-sm hover:shadow-md animate-pulse-hover"
                  disabled={Object.values(errors).some((error) => error)}
                >
                  Update Profile
                </button>
              </form>
            )}
          </section>

          <section className="bg-gray-900/70 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg border border-gray-800/30 backdrop-blur-lg transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-6 sm:mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text ">Listing Status</h3>
            <p className="text-white text-sm sm:text-base mb-6 sm:mb-8">
              Current Status: <span className={`inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${listingStatus === 'accepted' ? 'bg-green-600/20 text-green-300' : 'bg-yellow-600/20 text-yellow-300'} shadow-sm`}>{listingStatus.charAt(0).toUpperCase() + listingStatus.slice(1)}</span>
            </p>
            {listingStatus !== 'accepted' && (
              <button
                onClick={() => setShowListingForm(!showListingForm)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 font-semibold text-sm sm:text-base shadow-sm hover:shadow-md animate-pulse-hover"
              >
                {showListingForm ? 'Cancel' : 'List Yourself'}
              </button>
            )}
            {showListingForm && (
              <form onSubmit={handleListingSubmit} className="mt-6 space-y-4 sm:space-y-6">
                <p className="text-sm sm:text-base text-gray-400 font-light">Ensure your profile is complete and up-to-date before submitting your listing.</p>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 font-semibold text-sm sm:text-base shadow-sm hover:shadow-md animate-pulse-hover"
                >
                  Submit Listing
                </button>
              </form>
            )}
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-8 sm:mt-10 mb-6 sm:mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text ">Update Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6">
              {[
                { name: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                { name: 'newPassword', label: 'New Password', placeholder: 'Enter new password' },
                { name: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Confirm new password' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm sm:text-base font-medium text-gray-200 mb-2 sm:mb-3">{field.label}</label>
                  <div className="relative group">
                    <input
                      type={showPassword[field.name.replace('Password', '').toLowerCase()] ? 'text' : 'password'}
                      name={field.name}
                      value={passwordData[field.name]}
                      onChange={handlePasswordChange}
                      className={`w-full p-3 sm:p-4 rounded-lg focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 bg-gray-800/30 text-white placeholder-gray-400/70 text-sm sm:text-base ${errors[field.name] ? 'border-red-500 focus:ring-red-400/30' : 'border-gray-600 hover:border-blue-400'} border shadow-sm hover:shadow-md`}
                      placeholder={field.placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, [field.name.replace('Password', '').toLowerCase()]: !showPassword[field.name.replace('Password', '').toLowerCase()] })}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                    >
                      {showPassword[field.name.replace('Password', '').toLowerCase()] ? <FiEyeOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <FiEye className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>
                  </div>
                  {errors[field.name] && <p className="text-red-400 text-xs sm:text-sm mt-2 animate-pulse">{errors[field.name]}</p>}
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-lg hover:from-blue-500 hover:to-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-sm sm:text-base shadow-sm hover:shadow-md animate-pulse-hover"
                disabled={Object.values(errors).some((error) => error)}
              >
                Update Password
              </button>
            </form>
          </section>
        </div>

        <section className="bg-gray-900/70 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg border border-gray-800/30 backdrop-blur-lg">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-6 sm:mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text ">Appointments</h3>
          {appointments.length === 0 ? (
            <p className="text-gray-400 text-center py-8 sm:py-10 text-sm sm:text-base font-medium">No appointments scheduled.</p>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {appointments.map((appt) => (
                <div key={appt._id} className="border border-gray-600/40 p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <p className="text-white text-sm sm:text-base"><strong className="font-semibold text-blue-300">Patient:</strong> <span className="font-semibold">{appt.patientId.name}</span></p>
                      <p className="text-white text-sm sm:text-base"><strong className="font-semibold">Name:</strong> {appt.name}</p>
                      <p className="text-white text-sm sm:text-base"><strong className="font-semibold">Age:</strong> {appt.age}</p>
                      <p className="text-white text-sm sm:text-base"><strong className="font-semibold">Gender:</strong> {appt.gender}</p>
                      <p className="text-white text-sm sm:text-base"><strong className="font-semibold">Email:</strong> {appt.email}</p>
                      <p className="text-white text-sm sm:text-base"><strong className="font-semibold">Mobile:</strong> {appt.mobile}</p>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <p className="text-white text-sm sm:text-base"><strong className="font-semibold">Address:</strong> {appt.address}</p>
                      <p className="text-white text-sm sm:text-base"><strong className="font-semibold">Date:</strong> {new Date(appt.date).toLocaleDateString()}</p>
                      <p className="text-white text-sm sm:text-base"><strong className="font-semibold">Time:</strong> {appt.time}</p>
                      <p className="text-white text-sm sm:text-base"><strong className="font-semibold">Reason:</strong> {appt.reason}</p>
                      <p className="text-white text-sm sm:text-base"><strong className="font-semibold">Previous Treatment:</strong> {appt.previousTreatment || 'None'}</p>
                      <p className="text-white text-sm sm:text-base"><strong className="font-semibold">Remarks:</strong> {appt.remarks || 'None'}</p>
                      {appt.medicalCertificate ? (
                        <div className="space-y-2">
                          <p className="text-white text-sm sm:text-base">
                            <strong className="font-semibold">Medical Certificate:</strong>{' '}
                            <a href={appt.medicalCertificate} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                              View Certificate
                            </a>
                          </p>
                          <img
                            src={appt.medicalCertificate}
                            alt="Medical Certificate"
                            className="mt-2 w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl shadow-sm border-2 border-blue-600/20 hover:border-blue-600/30 transition-all duration-300"
                            onError={(e) => { e.target.src = '/placeholder.png'; }}
                          />
                        </div>
                      ) : (
                        <p className="text-white text-sm sm:text-base"><strong className="font-semibold">Medical Certificate:</strong> None</p>
                      )}
                      <p className="text-white text-sm sm:text-base">
                        <strong className="font-semibold">Status:</strong>{' '}
                        <span className={`inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${appt.status === 'pending' ? 'bg-yellow-600/20 text-yellow-300' : appt.status === 'rescheduled' ? 'bg-blue-600/20 text-blue-300' : 'bg-green-600/20 text-green-300'} shadow-sm`}>
                          {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                  {(appt.status === 'pending' || appt.status === 'rescheduled') && (
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                      {[
                        { action: () => handleAccept(appt._id), label: 'Accept', color: 'from-green-600 to-green-700', hover: 'hover:from-green-500 hover:to-green-600' },
                        { action: () => handleReject(appt._id), label: 'Reject', color: 'from-red-600 to-red-700', hover: 'hover:from-red-500 hover:to-red-600' },
                        { action: () => { setRescheduleData({ id: appt._id, date: appt.date.split('T')[0], time: appt.time }); setShowRescheduleModal(true); }, label: 'Reschedule', color: 'from-yellow-600 to-yellow-700', hover: 'hover:from-yellow-500 hover:to-yellow-600' },
                      ].map((button, index) => (
                        <button
                          key={index}
                          onClick={button.action}
                          className={`w-full sm:w-auto bg-gradient-to-r ${button.color} text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg ${button.hover} transition-all duration-300 font-medium text-sm sm:text-base shadow-sm hover:shadow-md`}
                        >
                          {button.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {showRescheduleModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-900/80 p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md sm:max-w-lg border border-gray-600/40 backdrop-blur-lg transform transition-all duration-300 scale-95 sm:scale-100">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-6 sm:mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text ">Reschedule Appointment</h3>
              <div className="space-y-4 sm:space-y-6">
                {[
                  { name: 'date', label: 'New Date', type: 'date', value: rescheduleData.date, onChange: (e) => setRescheduleData({ ...rescheduleData, date: e.target.value }), min: new Date().toISOString().split('T')[0], max: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0] },
                  { name: 'time', label: 'New Time', type: 'time', value: rescheduleData.time, onChange: (e) => setRescheduleData({ ...rescheduleData, time: e.target.value }) },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm sm:text-base font-medium text-gray-200 mb-2 sm:mb-3">{field.label}</label>
                    <input
                      type={field.type}
                      value={field.value}
                      onChange={field.onChange}
                      min={field.min}
                      max={field.max}
                      className="w-full p-3 sm:p-4 border rounded-lg focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 bg-gray-800/30 text-white text-sm sm:text-base border-gray-600 hover:border-blue-400 shadow-sm hover:shadow-md"
                    />
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  {[
                    { action: handleReschedule, label: 'Submit', color: 'from-blue-600 to-purple-600', hover: 'hover:from-blue-500 hover:to-purple-500' },
                    { action: () => setShowRescheduleModal(false), label: 'Cancel', color: 'from-gray-600 to-gray-700', hover: 'hover:from-gray-500 hover:to-gray-600' },
                  ].map((button, index) => (
                    <button
                      key={index}
                      onClick={button.action}
                      className={`w-full bg-gradient-to-r ${button.color} text-white p-3 sm:p-4 rounded-lg ${button.hover} transition-all duration-300 font-medium text-sm sm:text-base shadow-sm hover:shadow-md`}
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.6s ease-in-out;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-in-out;
        }
        .animate-pulse-hover:hover {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default DoctorDashboard;