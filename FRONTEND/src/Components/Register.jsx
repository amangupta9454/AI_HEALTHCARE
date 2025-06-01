import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [role, setRole] = useState('Patient');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    mobile: '',
    address: '',
    gender: '',
    password: '',
    remark: '',
    previousTreatment: '',
    qualification: '',
    specialization: '',
    experience: '',
    image: null,
  });
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 1024 * 1024) {
      setImageError('Image size must be less than 1MB');
      return;
    }
    setImageError('');
    setFormData({ ...formData, image: file });
  };

  const uploadImageToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
      formData.append('folder', 'healthcare/doctors');

      console.log('Uploading to Cloudinary with preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      console.log('Cloud name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      console.log('Cloudinary response:', response.data);
      return response.data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error.response?.data || error.message);
      throw new Error('Image upload failed: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/send-otp`, { email: formData.email });
      if (response.data.message === 'OTP sent to your email') {
        setShowOtp(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let imageUrl = null;
      if (role === 'Doctor' && formData.image) {
        imageUrl = await uploadImageToCloudinary(formData.image);
        console.log('Image URL:', imageUrl);
      }

      const data = {
        role,
        name: formData.name,
        age: formData.age,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        gender: formData.gender,
        password: formData.password,
        remark: role === 'Patient' ? formData.remark : undefined,
        previousTreatment: role === 'Patient' ? formData.previousTreatment : undefined,
        qualification: role === 'Doctor' ? formData.qualification : undefined,
        specialization: role === 'Doctor' ? formData.specialization : undefined,
        experience: role === 'Doctor' ? formData.experience : undefined,
        image: imageUrl,
        otp,
      };

      console.log('Sending registration data:', data);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/register`, data);
      if (response.data.message === 'User registered successfully') {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification or registration failed');
      console.error('Registration error:', err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {!showOtp ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              >
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>
            {role === 'Patient' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Remark</label>
                  <textarea
                    name="remark"
                    value={formData.remark}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  ></textarea>
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
              </>
            )}
            {role === 'Doctor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload Image (Max 1MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full"
                  />
                  {imageError && <p className="text-red-500 text-sm mt-1">{imageError}</p>}
                </div>
              </>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Verify OTP and Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;