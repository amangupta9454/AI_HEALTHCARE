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
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/send-otp`, { email: formData.email });
      if (response.data.message === 'OTP sent to your email') {
        setShowOtp(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="relative bg-gray-800/30 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-4xl border border-teal-500/30 ring-1 ring-teal-500/20 transition-all duration-500 hover:ring-2 hover:ring-teal-500/50 hover:shadow-teal-500/20 animate-fade-in-up z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-teal-300 mb-8 tracking-tight drop-shadow-lg animate-slide-in-down">
          Register
        </h2>
        {error && (
          <p className="text-red-400 text-center mb-6 text-base sm:text-lg bg-gray-800/70 backdrop-blur-sm rounded-lg py-3 px-6 max-w-lg mx-auto shadow-md animate-fade-in">
            {error}
          </p>
        )}
        {!showOtp ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="role" className="block text-sm sm:text-base font-semibold text-gray-200">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                </select>
              </div>
              <div>
                <label htmlFor="name" className="block text-sm sm:text-base font-semibold text-gray-200">Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm sm:text-base font-semibold text-gray-200">Age</label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                  placeholder="Enter your age"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm sm:text-base font-semibold text-gray-200">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label htmlFor="mobile" className="block text-sm sm:text-base font-semibold text-gray-200">Mobile Number</label>
                <input
                  id="mobile"
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                  placeholder="Enter your mobile number"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="address" className="block text-sm sm:text-base font-semibold text-gray-200">Address</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                  placeholder="Enter your address"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm sm:text-base font-semibold text-gray-200">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-sm sm:text-base font-semibold text-gray-200">Password</label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-400 hover:text-teal-400 transition-colors duration-200 z-30 focus:outline-none"
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
              {role === 'Patient' && (
                <>
                  <div>
                    <label htmlFor="remark" className="block text-sm sm:text-base font-semibold text-gray-200">Remark</label>
                    <textarea
                      id="remark"
                      name="remark"
                      value={formData.remark}
                      onChange={handleInputChange}
                      className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                      rows="4"
                      placeholder="Any remarks"
                    ></textarea>
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
                      placeholder="Describe previous treatments"
                    ></textarea>
                  </div>
                </>
              )}
              {role === 'Doctor' && (
                <>
                  <div>
                    <label htmlFor="qualification" className="block text-sm sm:text-base font-semibold text-gray-200">Qualification</label>
                    <input
                      id="qualification"
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      required
                      className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                      placeholder="Enter your qualification"
                    />
                  </div>
                  <div>
                    <label htmlFor="specialization" className="block text-sm sm:text-base font-semibold text-gray-200">Specialization</label>
                    <input
                      id="specialization"
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      required
                      className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                      placeholder="Enter your specialization"
                    />
                  </div>
                </>
              )}
            </div>
            {role === 'Doctor' && (
              <div className="md:col-span-2 space-y-6">
                <div>
                  <label htmlFor="experience" className="block text-sm sm:text-base font-semibold text-gray-200">Experience (Years)</label>
                  <input
                    id="experience"
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                    placeholder="Enter years of experience"
                  />
                </div>
                <div>
                  <label htmlFor="image" className="block text-sm sm:text-base font-semibold text-gray-200">Image (Max 1MB)</label>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-teal-500 file:text-white file:font-semibold file:hover:bg-teal-400 file:transition-colors file:duration-200 z-20"
                  />
                  {imageError && <p className="text-red-400 text-sm mt-1 animate">{imageError}</p>}
                </div>
              </div>
            )}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-teal-500 text-white py-3 rounded-xl text-md font-semibold hover:bg-teal-600 focus:ring-4 focus:ring-teal-400/50 transition-all duration-300 hover:shadow-teal-500/30  text-center  ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white text-center" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-40" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span className='text-center'>Sending OTP...</span>
                  </div>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm sm:text-base font-semibold text-gray-200">Enter OTP</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="mt-2 block w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-gray-900/80 transition-all duration-300 z-20"
                placeholder="Enter OTP"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center animate-fade-in">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-teal-500 text-white py-3 rounded-xl text-md font-semibold hover:bg-teal-600 focus:ring-4 focus:ring-teal-400/50 transition-all duration-300 hover:shadow-teal-500/30 z-20 flex items-center justify-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-40" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>
        )}
        
      </div>
    </div>
  );
};

export default Register;