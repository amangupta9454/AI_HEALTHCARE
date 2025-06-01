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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900/50 text-white text-xl">
      <div className="flex items-center space-x-3 animate-pulse">
        <svg className="animate-spin h-8 w-8 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span className="font-semibold">Loading Doctors...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900/50 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-teal-300 mb-12 animate-slide-in-down tracking-tight drop-shadow-md pt-16">
          Meet Our Expert Doctors
        </h2>
        {error && (
          <p className="text-red-400 text-center mb-8 text-base sm:text-lg animate-fade-in bg-gray-800/60 backdrop-blur-md rounded-lg py-4 px-6 max-w-md mx-auto shadow-lg">
            {error}
          </p>
        )}
        {doctors.length === 0 ? (
          <p className="text-center text-gray-300 text-base sm:text-lg animate-fade-in bg-gray-800/60 backdrop-blur-md rounded-lg py-4 px-6 max-w-md mx-auto shadow-lg">
            No doctors listed yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {doctors.map((doctor, index) => (
              <div
                key={doctor._id}
                className="relative bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-teal-500/20 transform hover:scale-105 hover:shadow-2xl transition-all duration-500 ease-out animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {doctor.image && (
                  <div className="flex justify-center mb-6 relative">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-teal-500/80 shadow-lg transform transition-all duration-700 hover:scale-110 hover:-rotate-6"
                    />
                    <div className="absolute inset-0 rounded-full bg-teal-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                )}
                <h3 className="text-xl sm:text-2xl font-bold text-center text-teal-300 mb-4 tracking-wide drop-shadow-sm">
                  {doctor.name}
                </h3>
                <div className="space-y-3 text-gray-200 text-sm sm:text-base">
                  <p className="flex justify-between items-center">
                    <span className="font-semibold text-teal-400">Specialization:</span>
                    <span className="ml-2 truncate">{doctor.specialization || 'N/A'}</span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="font-semibold text-teal-400">Qualification:</span>
                    <span className="ml-2 truncate">{doctor.qualification || 'N/A'}</span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="font-semibold text-teal-400">Experience:</span>
                    <span className="ml-2">{doctor.experience ? `${doctor.experience} years` : 'N/A'}</span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="font-semibold text-teal-400">Email:</span>
                    <span className="ml-2 truncate max-w-[60%]">{doctor.email}</span>
                  </p>
                  {/* <p className="flex justify-between items-center">
                    <span className="font-semibold text-teal-400">Mobile:</span>
                    <span className="ml-2">{doctor.mobile}</span>
                  </p> */}
                  <p className="flex justify-between items-center">
                    <span className="font-semibold text-teal-400">Address:</span>
                    <span className="ml-2 truncate max-w-[60%]">{doctor.address}</span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="font-semibold text-teal-400">Gender:</span>
                    <span className="ml-2">{doctor.gender}</span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="font-semibold text-teal-400">Age:</span>
                    <span className="ml-2">{doctor.age}</span>
                  </p>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-teal-500/15 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-teal-400 animate-ping"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctor;