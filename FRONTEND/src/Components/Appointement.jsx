import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Appointment = () => {
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    mobile: '',
    address: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    previousTreatment: '',
    remarks: '',
    medicalCertificate: null,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [loading, setLoading] = useState(false);
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
        if (userResponse.data.role !== 'patient') {
          navigate('/login');
          return;
        }
        setUser(userResponse.data);
        setFormData((prev) => ({ ...prev, email: userResponse.data.email }));
        const doctorResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/listings/accepted`);
        setDoctors(doctorResponse.data);
      } catch (error) {
        setApiError(error.response?.data?.message || 'Failed to fetch data');
        console.error('Fetch error:', error.response?.data || error.message);
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const validateName = (name) => name.length >= 2;
  const validateAge = (age) => age >= 1 && age <= 120;
  const validateGender = (gender) => ['male', 'female', 'other'].includes(gender);
  const validateMobile = (mobile) => /^[6789][0-9]{9}$/.test(mobile);
  const validateAddress = (address) => address.length >= 5;
  const validateDoctorId = (doctorId) => doctorId !== '';
  const validateDate = (date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 2);
    return selectedDate >= today && selectedDate <= maxDate;
  };
  const validateTime = (time) => time !== '';
  const validateReason = (reason) => reason.length >= 5;
  const validateMedicalCertificate = (file) => !file || (file.size <= 1 * 1024 * 1024 && ['image/jpeg', 'image/png'].includes(file.type));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'name') {
      setErrors((prev) => ({
        ...prev,
        name: !value ? 'Name is required' : !validateName(value) ? 'Name must be at least 2 characters' : '',
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
    } else if (name === 'mobile') {
      setErrors((prev) => ({
        ...prev,
        mobile: !value ? 'Mobile number is required' : !validateMobile(value) ? 'Invalid mobile number (10 digits, starts with 6-9)' : '',
      }));
    } else if (name === 'address') {
      setErrors((prev) => ({
        ...prev,
        address: !value ? 'Address is required' : !validateAddress(value) ? 'Address must be at least 5 characters' : '',
      }));
    } else if (name === 'doctorId') {
      setErrors((prev) => ({
        ...prev,
        doctorId: !value ? 'Please select a doctor' : !validateDoctorId(value) ? 'Invalid doctor selection' : '',
      }));
    } else if (name === 'date') {
      setErrors((prev) => ({
        ...prev,
        date: !value ? 'Date is required' : !validateDate(value) ? 'Date must be within 2 months from today' : '',
      }));
    } else if (name === 'time') {
      setErrors((prev) => ({
        ...prev,
        time: !value ? 'Time is required' : !validateTime(value) ? 'Invalid time' : '',
      }));
    } else if (name === 'reason') {
      setErrors((prev) => ({
        ...prev,
        reason: !value ? 'Reason is required' : !validateReason(value) ? 'Reason must be at least 5 characters' : '',
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validateMedicalCertificate(file)) {
      setFormData({ ...formData, medicalCertificate: file });
      setErrors((prev) => ({ ...prev, medicalCertificate: '' }));
      console.log('Selected file:', {
        name: file.name,
        size: file.size,
        type: file.type,
      });
    } else {
      setErrors((prev) => ({ ...prev, medicalCertificate: 'Invalid file: must be JPEG/PNG, max 1MB' }));
      setFormData({ ...formData, medicalCertificate: null });
      console.error('Invalid file selected');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    const newErrors = {
      name: !formData.name ? 'Name is required' : !validateName(formData.name) ? 'Invalid name' : '',
      age: !formData.age ? 'Age is required' : !validateAge(parseInt(formData.age)) ? 'Invalid age' : '',
      gender: !formData.gender ? 'Gender is required' : !validateGender(formData.gender) ? 'Invalid gender' : '',
      mobile: !formData.mobile ? 'Mobile number is required' : !validateMobile(formData.mobile) ? 'Invalid mobile number' : '',
      address: !formData.address ? 'Address is required' : !validateAddress(formData.address) ? 'Invalid address' : '',
      doctorId: !formData.doctorId ? 'Please select a doctor' : !validateDoctorId(formData.doctorId) ? 'Invalid doctor' : '',
      date: !formData.date ? 'Date is required' : !validateDate(formData.date) ? 'Invalid date' : '',
      time: !formData.time ? 'Time is required' : !validateTime(formData.time) ? 'Invalid time' : '',
      reason: !formData.reason ? 'Reason is required' : !validateReason(formData.reason) ? 'Invalid reason' : '',
      medicalCertificate: formData.medicalCertificate && !validateMedicalCertificate(formData.medicalCertificate) ? 'Invalid file' : '',
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) {
      setApiError('Please fix all errors before submitting');
      console.error('Form validation errors:', newErrors);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', formData.name);
      data.append('age', formData.age);
      data.append('gender', formData.gender);
      data.append('email', formData.email);
      data.append('mobile', formData.mobile);
      data.append('address', formData.address);
      data.append('doctorId', formData.doctorId);
      data.append('date', formData.date);
      data.append('time', formData.time);
      data.append('reason', formData.reason);
      data.append('previousTreatment', formData.previousTreatment);
      data.append('remarks', formData.remarks);
      if (formData.medicalCertificate) {
        data.append('medicalCertificate', formData.medicalCertificate);
        console.log('Sending file:', {
          name: formData.medicalCertificate.name,
          size: formData.medicalCertificate.size,
          type: formData.medicalCertificate.type,
        });
      } else {
        console.log('No medical certificate included');
      }

      for (let [key, value] of data.entries()) {
        console.log(`FormData: ${key}=${value instanceof File ? value.name : value}`);
      }

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/appointment/book-appointment`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type manually for FormData
        },
      });
      setApiSuccess('Appointment booked successfully! Redirecting...');
      console.log('Appointment response:', response.data);
      setTimeout(() => navigate('/user-dashboard'), 2000);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to book appointment');
      console.error('Submission error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
        <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950  pt-10 xs:pt-12 sm:pt-16 md:pt-20 lg:pt-24 xl:pt-28 px-4 xs:px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
      <div className="relative bg-gray-900/15 backdrop-blur-xl p-5 xs:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 rounded-3xl shadow-2xl w-full max-w-[95%] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl border border-gray-800/30 transform hover:scale-[1.01] transition-transform duration-500 ease-out">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 to-purple-700/20 rounded-3xl opacity-80"></div>
        <h2 className="relative text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-center mb-5 xs:mb-6 sm:mb-7 md:mb-8 lg:mb-10 xl:mb-12 text-white tracking-tight drop-shadow-lg animate-fade-in pt-16">
          Book Appointment
        </h2>
        {apiError && (
          <div className="relative mb-5 xs:mb-6 sm:mb-7 md:mb-8 p-3 xs:p-4 bg-red-900/80 text-red-100 rounded-xl text-center text-xs xs:text-sm sm:text-base md:text-lg shadow-inner animate-pulse">
            {apiError}
          </div>
        )}
        {apiSuccess && (
          <div className="relative mb-5 xs:mb-6 sm:mb-7 md:mb-8 p-3 xs:p-4 bg-green-900/80 text-green-100 rounded-xl text-center text-xs xs:text-sm sm:text-base md:text-lg shadow-inner animate-pulse">
            {apiSuccess}
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8">
          <div>
            <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 w-full p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-gray-900/60 border ${errors.name ? 'border-red-500' : 'border-gray-700/60'} rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base`}
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-400 text-xs xs:text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`mt-1 w-full p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-gray-900/60 border ${errors.age ? 'border-red-500' : 'border-gray-700/60'} rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base`}
              placeholder="Enter your age"
            />
            {errors.age && <p className="text-red-400 text-xs xs:text-sm mt-1">{errors.age}</p>}
          </div>
          <div>
            <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`mt-1 w-full p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-gray-900/60 border ${errors.gender ? 'border-red-500' : 'border-gray-700/60'} rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-red-400 text-xs xs:text-sm mt-1">{errors.gender}</p>}
          </div>
          <div>
            <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="mt-1 w-full p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-gray-800/50 border border-gray-700/60 rounded-xl text-gray-400 text-xs xs:text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className={`mt-1 w-full p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-gray-900/60 border ${errors.mobile ? 'border-red-500' : 'border-gray-700/60'} rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base`}
              placeholder="Enter your mobile number"
            />
            {errors.mobile && <p className="text-red-400 text-xs xs:text-sm mt-1">{errors.mobile}</p>}
          </div>
          <div>
            <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`mt-1 w-full p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-gray-900/60 border ${errors.address ? 'border-red-500' : 'border-gray-700/60'} rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base resize-y min-h-[80px] sm:min-h-[100px]`}
              placeholder="Enter your address"
            />
            {errors.address && <p className="text-red-400 text-xs xs:text-sm mt-1">{errors.address}</p>}
          </div>
          <div>
            <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Medical Certificate (Optional, JPEG/PNG, Max 1MB)</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="mt-1 w-full p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-gray-900/60 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base"
            />
            {errors.medicalCertificate && <p className="text-red-400 text-xs xs:text-sm mt-1">{errors.medicalCertificate}</p>}
          </div>
          <div>
            <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Select Doctor</label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              className={`mt-1 w-full p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-gray-900/60 border ${errors.doctorId ? 'border-red-500' : 'border-gray-700/60'} rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base`}
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor.doctorId}>
                  {doctor.name} ({doctor.speciality})
                </option>
              ))}
            </select>
            {errors.doctorId && <p className="text-red-400 text-xs xs:text-sm mt-1">{errors.doctorId}</p>}
          </div>
          <div>
            <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]}
              className={`mt-1 w-full p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-gray-900/60 border ${errors.date ? 'border-red-500' : 'border-gray-700/60'} rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base`}
            />
            {errors.date && <p className="text-red-400 text-xs xs:text-sm mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={`mt-1 w-full p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-gray-900/60 border ${errors.time ? 'border-red-500' : 'border-gray-700/60'} rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base`}
            />
            {errors.time && <p className="text-red-400 text-xs xs:text-sm mt-1">{errors.time}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Reason for Appointment</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={`mt-1 w-full p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-gray-900/60 border ${errors.reason ? 'border-red-500' : 'border-gray-700/60'} rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base resize-y min-h-[100px] sm:min-h-[120px]`}
              placeholder="Enter reason for appointment"
            />
            {errors.reason && <p className="text-red-400 text-xs xs:text-sm mt-1">{errors.reason}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Previous Treatment (if any)</label>
            <textarea
              name="previousTreatment"
              value={formData.previousTreatment}
              onChange={handleChange}
              className="mt-1 w-full p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-gray-900/60 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base resize-y min-h-[100px] sm:min-h-[120px]"
              placeholder="Enter any previous treatment details"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-gray-100">Remarks (if any)</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="mt-1 w-full p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-gray-900/60 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 focus:outline-none transition-all duration-300 hover:border-blue-400/60 text-xs xs:text-sm sm:text-base resize-y min-h-[100px] sm:min-h-[120px]"
              placeholder="Enter any remarks"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 xs:p-3 sm:p-3.5 md:p-4 lg:p-4.5 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-600 flex items-center justify-center transition-all duration-300 font-semibold text-xs xs:text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl"
              disabled={loading || Object.values(errors).some((error) => error)}
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Appointment;