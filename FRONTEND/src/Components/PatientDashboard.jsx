import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    mobile: '',
    address: '',
    gender: '',
    remark: '',
    previousTreatment: '',
  });
  const [error, setError] = useState('');
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
      if (response.data.role !== 'Patient') {
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
        remark: response.data.remark || '',
        previousTreatment: response.data.previousTreatment || '',
      });
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/appointments/patient`, {
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditing(false);
      fetchUserDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update details');
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

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Appointment cancelled successfully!');
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setError('');
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 py-10 px-4 pt-20">
      <div className="max-w-4xl mx-auto rounded-lg shadow-lg p-8 bg-gray-200/10 backdrop-blur-md   border-cyan-400 border-2">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6 underline hover:text-yellow-400">Patient Dashboard</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {!isEditing ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-600 text-center underline hover:text-green-400">Profile Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-white">Name</p>
                  <p className="text-lg font-normal text-white">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Age</p>
                  <p className="text-lg font-semibold text-white">{user?.age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Email</p>
                  <p className="text-lg font-semibold text-white">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Mobile</p>
                  <p className="text-lg font-semibold text-white">{user?.mobile}</p>
                </div>
                <div>
                  <p className="text-sm font-medium  text-white">Address</p>
                  <p className="text-lg font-semibold text-white">{user?.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Gender</p>
                  <p className="text-lg font-semibold text-white">{user?.gender}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Remark</p>
                <p className="text-lg font-semibold text-white">{user?.remark || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Previous Treatment</p>
                <p className="text-lg font-semibold text-white">{user?.previousTreatment || 'N/A'}</p>
              </div>
              <button
                onClick={toggleEdit}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
              >
                Edit Details
              </button>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-600 text-center hover:text-red-500 underline">Appointments</h3>
              {appointments.length === 0 ? (
                <p className="text-center text-white">No appointments booked.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-transparent border">
                    <thead>
                      <tr className="bg-transparent">
                        <th className="py-2 px-4 border text-white border-green-500">Doctor</th>
                        <th className="py-2 px-4 border text-white border-green-500">Date</th>
                        <th className="py-2 px-4 border text-white border-green-500">Time</th>
                        <th className="py-2 px-4 border text-white border-green-500">Status</th>
                        <th className="py-2 px-4 border text-white border-green-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt._id}>
                          <td className="py-2 px-4 border border-green-500 text-white">{appt.doctorName}</td>
                          <td className="py-2 px-4 border border-green-500 text-white">{new Date(appt.date).toLocaleDateString()}</td>
                          <td className="py-2 px-4 border border-green-500 text-white">{appt.time}</td>
                          <td className="py-2 px-4 border border-green-500 text-white">{appt.status}</td>
                          <td className="py-2 px-4 border space-x-2 border-green-500 text-white">
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
                            {['Pending', 'Accepted'].includes(appt.status) && (
                              <button
                                onClick={() => handleCancel(appt._id)}
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                              >
                                Cancel
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

export default PatientDashboard;