import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    mobile: '',
    address: '',
    gender: '',
    qualification: '',
    specialization: '',
    experience: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
    fetchAppointments();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.role !== 'Doctor') {
        navigate('/');
        return;
      }
      setUser(response.data);
      setFormData({
        name: response.data.name,
        age: response.data.age,
        mobile: response.data.mobile,
        address: response.data.address,
        gender: response.data.gender,
        qualification: response.data.qualification || '',
        specialization: response.data.specialization || '',
        experience: response.data.experience || '',
        image: null,
      });
      setImagePreview(response.data.image);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch details');
      setLoading(false);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/appointments/doctor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(response.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

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
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImageToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
      formData.append('folder', 'healthcare/doctors');

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      throw new Error('Image upload failed: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let imageUrl = user.image;
      if (formData.image) {
        imageUrl = await uploadImageToCloudinary(formData.image);
      }

      const updateData = {
        name: formData.name,
        age: formData.age,
        mobile: formData.mobile,
        address: formData.address,
        gender: formData.gender,
        qualification: formData.qualification,
        specialization: formData.specialization,
        experience: formData.experience,
        image: imageUrl,
      };

      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditing(false);
      fetchUserDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update details');
    }
  };

  const handleListYourself = () => {
    setIsListing(true);
    setError('');
  };

  const handleSubmitListing = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/users/list-doctor`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsListing(false);
      fetchUserDetails();
      alert('You are now listed as a doctor!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list yourself');
    }
  };

  const handleAccept = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/appointments/${appointmentId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Appointment accepted!');
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept');
    }
  };

  const handleReject = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to reject this appointment?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/appointments/${appointmentId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Appointment rejected!');
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleReschedule = async (appointmentId, newDate, newTime) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/appointments/${appointmentId}/reschedule`,
        { date: newDate, time: newTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Appointment rescheduled successfully!');
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule');
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setError('');
    setImageError('');
    setImagePreview(user.image);
    setFormData({ ...formData, image: null });
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-950 to-gray-950 py-10 px-4 pt-20">
      <div className="max-w-4xl mx-auto rounded-lg shadow-lg p-8 bg-gray-200/10 backdrop-blur-md   border-cyan-400 border-2">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Doctor Dashboard</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {!isEditing ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-600 text-center">Profile Details</h3>
              {user?.image && (
                <div className="flex justify-center">
                  <img
                    src={user.image}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-yellow-500">Name</p>
                  <p className="text-lg font-normal text-white">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-500">Age</p>
                  <p className="text-lg font-normal text-white">{user?.age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-500">Email</p>
                  <p className="text-lg font-normal text-white">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-500">Mobile</p>
                  <p className="text-lg font-normal text-white">{user?.mobile}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-500">Address</p>
                  <p className="text-lg font-normal text-white">{user?.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-500">Gender</p>
                  <p className="text-lg font-normal text-white">{user?.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-500">Qualification</p>
                  <p className="text-lg font-normal text-white">{user?.qualification || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-500">Specialization</p>
                  <p className="text-lg font-normal text-white">{user?.specialization || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-500">Experience (Years)</p>
                  <p className="text-lg font-normal text-white">{user?.experience || 'N/A'}</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={toggleEdit}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                >
                  Edit Details
                </button>
                {!user?.isListed && (
                  <button
                    onClick={handleListYourself}
                    className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition"
                  >
                    List Yourself
                  </button>
                )}
              </div>
              {isListing && (
                <button
                  onClick={handleSubmitListing}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition mt-4"
                >
                  Submit
                </button>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-600 text-center">Appointments</h3>
              {appointments.length === 0 ? (
                <p className="text-center text-gray-600">No appointments scheduled.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-transparent border">
                    <thead>
                      <tr className="bg-transparent text-white">
                        <th className="py-2 px-4 border">Patient</th>
                        <th className="py-2 px-4 border">Date</th>
                        <th className="py-2 px-4 border">Time</th>
                        <th className="py-2 px-4 border">Status</th>
                        <th className="py-2 px-4 border">Prescription</th>
                        <th className="py-2 px-4 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt._id}>
                          <td className="py-2 px-4 border text-white">{appt.patientName}</td>
                          <td className="py-2 px-4 border text-white">{new Date(appt.date).toLocaleDateString()}</td>
                          <td className="py-2 px-4 border text-white">{appt.time}</td>
                          <td className="py-2 px-4 border text-white">{appt.status}</td>
                          <td className="py-2 px-4 border text-white">
                            {appt.prescription ? (
                              <a href={appt.prescription} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                View
                              </a>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="py-2 px-4 border space-x-2 text-white">
                            {appt.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleAccept(appt._id)}
                                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReject(appt._id)}
                                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {['Pending', 'Accepted'].includes(appt.status) && (
                              <button
                                onClick={() => {
                                  const newDate = prompt('Enter new date (YYYY-MM-DD):', appt.date.split('T')[0]);
                                  const newTime = prompt('Enter new time (HH:MM):', appt.time);
                                  if (newDate && newTime) handleReschedule(appt._id, newDate, newTime);
                                }}
                                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                              >
                                Reschedule
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="flex justify-center">
              <img
                src={imagePreview || 'https://via.placeholder.com/150'}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload New Image (Max 1MB)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full"
              />
              {imageError && <p className="text-red-500 text-sm mt-1">{imageError}</p>}
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
            <div className="flex space-x-4">
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={toggleEdit}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;