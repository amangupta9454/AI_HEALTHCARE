import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Appointment = () => {
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    mobile: '',
    date: '',
    time: '',
    doctorId: '',
    prescription: null,
    previousTreatment: '',
    comments: '',
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        // Fetch user profile
        const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userResponse.data.role !== 'Patient') {
          navigate('/');
          return;
        }
        setUser(userResponse.data);
        setFormData({
          ...formData,
          name: userResponse.data.name,
          age: userResponse.data.age,
          email: userResponse.data.email,
          mobile: userResponse.data.mobile,
        });

        // Fetch listed doctors
        const doctorsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/listed-doctors`);
        setDoctors(doctorsResponse.data);
        setLoading(false);
      } catch (err) {
        setSubmitError(err.response?.data?.message || 'Failed to load data');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchData();
  }, [navigate]);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'age':
        if (!value) error = 'Age is required';
        else if (value < 1 || value > 120) error = 'Age must be between 1 and 120';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'mobile':
        if (!value) error = 'Mobile number is required';
        else if (!/^\d{10}$/.test(value)) error = 'Mobile number must be 10 digits';
        break;
      case 'date':
        if (!value) error = 'Date is required';
        else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) error = 'Date must be today or in the future';
        }
        break;
      case 'time':
        if (!value) error = 'Time is required';
        break;
      case 'doctorId':
        if (!value) error = 'Please select a doctor';
        break;
      case 'prescription':
        if (value && value.size > 1024 * 1024) error = 'Prescription image must be less than 1MB';
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, prescription: file });
    validateField('prescription', file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const uploadImageToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
      formData.append('folder', 'healthcare/prescriptions');

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      throw new Error('Prescription upload failed: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    // Validate all fields
    const isValid = Object.keys(formData).every((key) => validateField(key, formData[key]));
    if (!isValid) {
      setSubmitError('Please fix the errors in the form');
      setIsSubmitting(false);
      return;
    }

    try {
      let prescriptionUrl = null;
      if (formData.prescription) {
        prescriptionUrl = await uploadImageToCloudinary(formData.prescription);
      }

      const appointmentData = {
        ...formData,
        prescription: prescriptionUrl,
      };

      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/users/appointments`, appointmentData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Appointment booked successfully!');
      navigate('/patient-dashboard');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-teal-900/50 to-gray-800 text-white text-xl">
      <div className="flex items-center space-x-4 animate-pulse">
        <svg className="animate-spin h-8 w-8 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span className="font-semibold text-lg sm:text-xl">Loading Appointment Form...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900/50 to-gray-800 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-gray-800/30 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-teal-500/30 ring-1 ring-teal-500/20 transition-all duration-500 hover:ring-2 hover:ring-teal-500/50 hover:shadow-teal-500/20 animate-fade-in-up z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-teal-300 mb-10 tracking-tight drop-shadow-lg animate-slide-in-down">
          Book Your Appointment
        </h2>
        {submitError && (
          <p className="text-red-400 text-center mb-8 text-base sm:text-lg bg-gray-800/70 backdrop-blur-sm rounded-lg py-3 px-6 max-w-lg mx-auto shadow-md animate-fade-in">
            {submitError}
          </p>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm sm:text-base font-semibold text-gray-200">Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-2 block w-full px-4 py-3 bg-gray-900/60 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20`}
                required
                placeholder="Enter your name"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1 animate-fade-in">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="age" className="block text-sm sm:text-base font-semibold text-gray-200">Age</label>
              <input
                id="age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={`mt-2 block w-full px-4 py-3 bg-gray-900/60 border ${errors.age ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20`}
                required
                placeholder="Enter your age"
              />
              {errors.age && <p className="text-red-400 text-sm mt-1 animate-fade-in">{errors.age}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm sm:text-base font-semibold text-gray-200">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-2 block w-full px-4 py-3 bg-gray-900/60 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20 opacity-75 cursor-not-allowed`}
                required
                readOnly
                placeholder="Your email"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1 animate-fade-in">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm sm:text-base font-semibold text-gray-200">Mobile Number</label>
              <input
                id="mobile"
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className={`mt-2 block w-full px-4 py-3 bg-gray-900/60 border ${errors.mobile ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20`}
                required
                placeholder="Enter your mobile number"
              />
              {errors.mobile && <p className="text-red-400 text-sm mt-1 animate-fade-in">{errors.mobile}</p>}
            </div>
            <div>
              <label htmlFor="date" className="block text-sm sm:text-base font-semibold text-gray-200">Date of Appointment</label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`mt-2 block w-full px-4 py-3 bg-gray-900/60 border ${errors.date ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20`}
                required
              />
              {errors.date && <p className="text-red-400 text-sm mt-1 animate-fade-in">{errors.date}</p>}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="time" className="block text-sm sm:text-base font-semibold text-gray-200">Time of Appointment</label>
              <input
                id="time"
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className={`mt-2 block w-full px-4 py-3 bg-gray-900/60 border ${errors.time ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20`}
                required
              />
              {errors.time && <p className="text-red-400 text-sm mt-1 animate-fade-in">{errors.time}</p>}
            </div>
            <div>
              <label htmlFor="doctorId" className="block text-sm sm:text-base font-semibold text-gray-200">Select Doctor</label>
              <select
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleInputChange}
                className={`mt-2 block w-full px-4 py-3 bg-gray-900/60 border ${errors.doctorId ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20`}
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name} ({doctor.specialization})
                  </option>
                ))}
              </select>
              {errors.doctorId && <p className="text-red-400 text-sm mt-1 animate-fade-in">{errors.doctorId}</p>}
            </div>
            <div>
              <label htmlFor="prescription" className="block text-sm sm:text-base font-semibold text-gray-200">Upload Prescription (Max 1MB)</label>
              <input
                id="prescription"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2 block w-full text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-teal-500 file:text-white file:font-semibold file:hover:bg-teal-600 file:transition-colors file:duration-200 z-20"
              />
              {imagePreview && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-xl shadow-lg transition-transform duration-500 hover:scale-110 z-20"
                  />
                </div>
              )}
              {errors.prescription && <p className="text-red-400 text-sm mt-1 animate-fade-in">{errors.prescription}</p>}
            </div>
            <div>
              <label htmlFor="previousTreatment" className="block text-sm sm:text-base font-semibold text-gray-200">Previous Treatment</label>
              <textarea
                id="previousTreatment"
                name="previousTreatment"
                value={formData.previousTreatment}
                onChange={handleInputChange}
                className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                rows="4"
                placeholder="Describe any previous treatments"
              ></textarea>
            </div>
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="comments" className="block text-sm sm:text-base font-semibold text-gray-200">Comments</label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
              rows="4"
              placeholder="Any additional comments"
            ></textarea>
          </div>
          <div className="lg:col-span-2 relative">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-teal-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-teal-600 focus:ring-4 focus:ring-teal-400/50 transition-all duration-300 hover:shadow-teal-500/30 z-20 flex items-center justify-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Appointment'
              )}
            </button>
          </div>
        </form>
        {/* <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-teal-500/15 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 z-0"></div> */}
      </div>
    </div>
  );
};

export default Appointment;