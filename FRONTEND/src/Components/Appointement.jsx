import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Appointement = () => {
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

    // Validate all fields
    const isValid = Object.keys(formData).every((key) => validateField(key, formData[key]));
    if (!isValid) {
      setSubmitError('Please fix the errors in the form');
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
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 pt-20">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Book an Appointment</h2>
        {submitError && <p className="text-red-500 text-center mb-4">{submitError}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : ''}`}
              required
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.age ? 'border-red-500' : ''}`}
              required
            />
            {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : ''}`}
              required
              readOnly
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.mobile ? 'border-red-500' : ''}`}
              required
            />
            {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Appointment</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.date ? 'border-red-500' : ''}`}
              required
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time of Appointment</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.time ? 'border-red-500' : ''}`}
              required
            />
            {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Doctor</label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.doctorId ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} ({doctor.specialization})
                </option>
              ))}
            </select>
            {errors.doctorId && <p className="text-red-500 text-sm">{errors.doctorId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Prescription (Max 1MB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full"
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
            )}
            {errors.prescription && <p className="text-red-500 text-sm">{errors.prescription}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Previous Treatment</label>
            <textarea
              name="previousTreatment"
              value={formData.previousTreatment}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Appointement;