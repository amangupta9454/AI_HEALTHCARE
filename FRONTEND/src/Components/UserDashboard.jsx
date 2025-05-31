import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [rescheduleData, setRescheduleData] = useState({ id: '', date: '', time: '' });
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
        setUser(userResponse.data);

        const appointmentResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(appointmentResponse.data);
      } catch (error) {
        setApiError(error.response?.data?.message || 'Failed to fetch user data');
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const validatePassword = (password) => password.length >= 6;
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });

    if (name === 'newPassword') {
      setErrors((prev) => ({
        ...prev,
        newPassword: !value ? 'New password is required' : !validatePassword(value) ? 'Password must be at least 6 characters' : '',
      }));
    } else if (name === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: !value ? 'Confirm password is required' : value !== passwordData.newPassword ? 'Passwords do not match' : '',
      }));
    } else if (name === 'currentPassword') {
      setErrors((prev) => ({
        ...prev,
        currentPassword: !value ? 'Current password is required' : '',
      }));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    const newErrors = {
      currentPassword: !passwordData.currentPassword ? 'Current password is required' : '',
      newPassword: !passwordData.newPassword ? 'New password is required' : !validatePassword(passwordData.newPassword) ? 'Password must be at least 6 characters' : '',
      confirmPassword: !passwordData.confirmPassword ? 'Confirm password is required' : passwordData.newPassword !== passwordData.confirmPassword ? 'Passwords do not match' : '',
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/auth/update-password`, passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApiSuccess('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to update password');
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
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to reschedule appointment');
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-blue-500"></div>
      <span className="ml-4 text-lg sm:text-xl text-gray-200 font-medium">Loading...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-16 sm:pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[90rem] mx-auto space-y-12 sm:space-y-16">
        <header className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl opacity-60"></div>
          <h2 className="relative text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight animate-slide-in pt-16">Patient Dashboard</h2>
          <p className="relative mt-4 text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto">Seamlessly manage your profile, appointments, and security settings with a modern, intuitive interface.</p>
        </header>

        {apiError && (
          <div className="mx-auto w-full max-w-3xl sm:max-w-4xl p-4 sm:p-6 bg-red-900/95 text-red-100 rounded-2xl shadow-2xl flex items-center animate-slide-in border border-red-700/60">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-3 sm:mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm sm:text-base lg:text-lg">{apiError}</span>
          </div>
        )}
        {apiSuccess && (
          <div className="mx-auto w-full max-w-3xl sm:max-w-4xl p-4 sm:p-6 bg-green-900/95 text-green-100 rounded-2xl shadow-2xl flex items-center animate-slide-in border border-green-700/60">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-3 sm:mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm sm:text-base lg:text-lg">{apiSuccess}</span>
          </div>
        )}

        <div className="grid gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-2">
          <section className="bg-gray-800/80 p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl border border-gray-700/60 backdrop-blur-lg transform hover:scale-[1.01] transition-transform duration-500 ease-out">
            <h3 className="text-2xl sm:text-3xl lg:text-3xl font-semibold text-white mb-6 sm:mb-8 lg:mb-10">Profile Details</h3>
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-600/50 pb-4 hover:bg-gray-700/30 transition-colors duration-300 rounded-lg px-3 sm:px-4">
                <span className="font-medium text-gray-300 sm:w-1/3 text-sm sm:text-base lg:text-lg">Name</span>
                <span className="text-white font-medium mt-2 sm:mt-0">{user.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-600/50 pb-4 hover:bg-gray-700/30 transition-colors duration-300 rounded-lg px-3 sm:px-4">
                <span className="font-medium text-gray-300 sm:w-1/3 text-sm sm:text-base lg:text-lg">Email</span>
                <span className="text-white mt-2 sm:mt-0">{user.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-600/50 pb-4 hover:bg-gray-700/30 transition-colors duration-300 rounded-lg px-3 sm:px-4">
                <span className="font-medium text-gray-300 sm:w-1/3 text-sm sm:text-base lg:text-lg">Mobile</span>
                <span className="text-white mt-2 sm:mt-0">{user.mobile}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-600/50 pb-4 hover:bg-gray-700/30 transition-colors duration-300 rounded-lg px-3 sm:px-4">
                <span className="font-medium text-gray-300 sm:w-1/3 text-sm sm:text-base lg:text-lg">Age</span>
                <span className="text-white mt-2 sm:mt-0">{user.age}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-600/50 pb-4 hover:bg-gray-700/30 transition-colors duration-300 rounded-lg px-3 sm:px-4">
                <span className="font-medium text-gray-300 sm:w-1/3 text-sm sm:text-base lg:text-lg">Gender</span>
                <span className="text-white mt-2 sm:mt-0">{user.gender}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-600/50 pb-4 hover:bg-gray-700/30 transition-colors duration-300 rounded-lg px-3 sm:px-4">
                <span className="font-medium text-gray-300 sm:w-1/3 text-sm sm:text-base lg:text-lg">Address</span>
                <span className="text-white mt-2 sm:mt-0">{user.address}</span>
              </div>
              {user.photo && (
                <div className="flex flex-col sm:flex-row sm:items-center group">
                  <span className="font-medium text-gray-300 sm:w-1/3 text-sm sm:text-base lg:text-lg">Photo</span>
                  <img src={user.photo} alt="Profile" className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-cover rounded-full shadow-lg border-2 border-blue-500/40 mt-2 sm:mt-0 group-hover:scale-110 group-hover:border-blue-500/60 transition-all duration-300" />
                </div>
              )}
            </div>
          </section>

          <section className="bg-gray-800/80 p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl border border-gray-700/60 backdrop-blur-lg transform hover:scale-[1.01] transition-transform duration-500 ease-out">
            <h3 className="text-2xl sm:text-3xl lg:text-3xl font-semibold text-white mb-6 sm:mb-8 lg:mb-10">Update Password</h3>
            <div className="space-y-6 sm:space-y-8 lg:space-y-10">
              <div>
                <label className="block text-sm sm:text-base lg:text-lg font-medium text-gray-300 mb-2 sm:mb-3">Current Password</label>
                <div className="relative group">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full p-3 sm:p-4 lg:p-5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-gray-900/70 text-white placeholder-gray-400/80 text-sm sm:text-base lg:text-lg ${errors.currentPassword ? 'border-red-500 focus:ring-red-400' : 'border-gray-600 hover:border-gray-500'}`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-200 transition-colors duration-200"
                  >
                    {showPassword.current ? <FiEyeOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <FiEye className="w-5 h-5 sm:w-6 sm:h-6" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-red-400 text-sm mt-2 sm:mt-3 animate-fade-in">{errors.currentPassword}</p>}
              </div>
              <div>
                <label className="block text-sm sm:text-base lg:text-lg font-medium text-gray-300 mb-2 sm:mb-3">New Password</label>
                <div className="relative group">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full p-3 sm:p-4 lg:p-5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-gray-900/70 text-white placeholder-gray-400/80 text-sm sm:text-base lg:text-lg ${errors.newPassword ? 'border-red-500 focus:ring-red-400' : 'border-gray-600 hover:border-gray-500'}`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-200 transition-colors duration-200"
                  >
                    {showPassword.new ? <FiEyeOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <FiEye className="w-5 h-5 sm:w-6 sm:h-6" />}
                  </button>
        </div>
        {errors.newPassword && <p className="text-red-400 text-sm mt-2 sm:mt-3 animate-fade-in">{errors.newPassword}</p>}
      </div>
      <div>
        <label className="block text-sm sm:text-base lg:text-lg font-medium text-gray-300 mb-2 sm:mb-3">Confirm New Password</label>
        <div className="relative group">
          <input
            type={showPassword.confirm ? 'text' : 'password'}
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            className={`w-full p-3 sm:p-4 lg:p-5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-gray-900/70 text-white placeholder-gray-400/80 text-sm sm:text-base lg:text-lg ${errors.confirmPassword ? 'border-red-500 focus:ring-red-400' : 'border-gray-600 hover:border-gray-500'}`}
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-200 transition-colors duration-200"
          >
            {showPassword.confirm ? <FiEyeOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <FiEye className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-400 text-sm mt-2 sm:mt-3 animate-fade-in">{errors.confirmPassword}</p>}
      </div>
      <button
        onClick={handlePasswordUpdate}
        className="w-full bg-blue-600 text-white p-3 sm:p-4 lg:p-5 rounded-lg hover:bg-blue-700 disabled:bg-blue-400/50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl animate-pulse-hover text-sm sm:text-base lg:text-lg"
        disabled={Object.values(errors).some((error) => error)}
      >
        Update Password
      </button>
    </div>
  </section>
</div>

<section className="bg-gray-800/80 p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl border border-gray-700/60 backdrop-blur-lg">
  <h3 className="text-2xl sm:text-3xl lg:text-3xl font-semibold text-white mb-6 sm:mb-8 lg:mb-10">Booked Appointments</h3>
  {appointments.length === 0 ? (
    <p className="text-gray-300 text-center py-8 sm:py-10 lg:py-12 text-base sm:text-lg lg:text-xl">No appointments booked.</p>
  ) : (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {appointments.map((appt) => (
        <div key={appt._id} className="border border-gray-600/50 p-5 sm:p-6 lg:p-8 rounded-xl shadow-lg bg-gray-900/50 hover:bg-gray-900/70 transition-all duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="space-y-3 sm:space-y-4 lg:space-y-5">
              <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Doctor:</strong> <span className="font-medium">{appt.doctorId.name}</span> <span className="text-gray-400">({appt.doctorId.speciality})</span></p>
              <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Name:</strong> {appt.name}</p>
              <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Age:</strong> {appt.age}</p>
              <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Gender:</strong> {appt.gender}</p>
              <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Email:</strong> {appt.email}</p>
              <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Mobile:</strong> {appt.mobile}</p>
            </div>
            <div className="space-y-3 sm:space-y-4 lg:space-y-5">
              <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Address:</strong> {appt.address}</p>
              <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Date:</strong> {new Date(appt.date).toLocaleDateString()}</p>
              <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Time:</strong> {appt.time}</p>
              <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Reason:</strong> {appt.reason}</p>
              <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Previous Treatment:</strong> {appt.previousTreatment || 'None'}</p>
              <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Remarks:</strong> {appt.remarks || 'None'}</p>
              {appt.medicalCertificate && (
                <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Medical Certificate:</strong> <a href={appt.medicalCertificate} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">View</a></p>
              )}
              <p className="text-white text-sm sm:text-base lg:text-lg"><strong>Status:</strong> <span className={`inline-block px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm lg:text-base font-medium ${appt.status === 'pending' ? 'bg-yellow-500/30 text-yellow-300' : appt.status === 'rescheduled' ? 'bg-blue-500/30 text-blue-300' : 'bg-green-500/30 text-green-300'}`}>{appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}</span></p>
            </div>
          </div>
          {(appt.status === 'pending' || appt.status === 'rescheduled') && (
            <div className="mt-5 sm:mt-6 lg:mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <button
                onClick={() => handleReject(appt._id)}
                className="w-full sm:w-auto bg-red-600 text-white px-5 sm:px-6 lg:px-8 py-3 sm:py-3 lg:py-4 rounded-lg hover:bg-red-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl animate-pulse-hover text-sm sm:text-base lg:text-lg"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setRescheduleData({ id: appt._id, date: appt.date.split('T')[0], time: appt.time });
                  setShowRescheduleModal(true);
                }}
                className="w-full sm:w-auto bg-yellow-600 text-white px-5 sm:px-6 lg:px-8 py-3 sm:py-3 lg:py-4 rounded-lg hover:bg-yellow-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl animate-pulse-hover text-sm sm:text-base lg:text-lg"
              >
                Reschedule
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</section>

{showRescheduleModal && (
  <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 animate-fade-in">
    <div className="bg-gray-800/90 p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg lg:max-w-xl border border-gray-700/60 backdrop-blur-lg transform transition-all duration-300 scale-90 sm:scale-95 lg:scale-100">
      <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-6 sm:mb-8 lg:mb-10">Reschedule Appointment</h3>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <div>
          <label className="block text-sm sm:text-base lg:text-lg font-medium text-gray-300 mb-2 sm:mb-3">New Date</label>
          <input
            type="date"
            value={rescheduleData.date}
            onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            max={new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]}
            className="w-full p-3 sm:p-4 lg:p-5 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-gray-900/70 text-white text-sm sm:text-base lg:text-lg"
          />
        </div>
        <div>
          <label className="block text-sm sm:text-base lg:text-lg font-medium text-gray-300 mb-2 sm:mb-3">New Time</label>
          <input
            type="time"
            value={rescheduleData.time}
            onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
            className="w-full p-3 sm:p-4 lg:p-5 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-gray-900/70 text-white text-sm sm:text-base lg:text-lg"
          />
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleReschedule}
            className="w-full bg-blue-600 text-white p-3 sm:p-4 lg:p-5 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl animate-pulse-hover text-sm sm:text-base lg:text-lg"
          >
            Submit
          </button>
          <button
            onClick={() => setShowRescheduleModal(false)}
            className="w-full bg-gray-600 text-white p-3 sm:p-4 lg:p-5 rounded-lg hover:bg-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl animate-pulse-hover text-sm sm:text-base lg:text-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}
</div>
<style jsx>{`
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(-30px);
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
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6);
    }
    70% {
      box-shadow: 0 0 0 15px rgba(59, 130, 246, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }
  .animate-slide-in {
    animation: slide-in 0.7s ease-out;
  }
  .animate-fade-in {
    animation: fade-in 0.7s ease-out;
  }
  .animate-pulse-hover:hover {
    animation: pulse 1.8s infinite;
  }
`}</style>
</div>
);
};

export default UserDashboard;