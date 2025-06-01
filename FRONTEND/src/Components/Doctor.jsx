import { useState, useEffect } from 'react';
import axios from 'axios';

const Doctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListedDoctors();
  }, []);

  const fetchListedDoctors = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/listed-doctors`);
      setDoctors(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctors');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">Our Doctors</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {doctors.length === 0 ? (
          <p className="text-center text-gray-600">No doctors listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
              >
                {doctor.image && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-center text-blue-600">{doctor.name}</h3>
                <div className="space-y-2 mt-4">
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Specialization:</span>{' '}
                    {doctor.specialization || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Qualification:</span>{' '}
                    {doctor.qualification || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Experience:</span>{' '}
                    {doctor.experience ? `${doctor.experience} years` : 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Email:</span> {doctor.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Mobile:</span> {doctor.mobile}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Address:</span> {doctor.address}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Gender:</span> {doctor.gender}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Age:</span> {doctor.age}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctor;