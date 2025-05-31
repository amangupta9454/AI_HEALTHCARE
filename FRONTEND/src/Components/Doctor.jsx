import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Doctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/listings/accepted`);
        setDoctors(response.data);
      } catch (error) {
        setApiError(error.response?.data?.message || 'Failed to load doctors list');
      }
    };
    fetchDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 px-4 sm:px-6 md:px-8 lg:px-12 py-24 sm:py-16 md:py-20">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-10 sm:mb-12 md:mb-16 text-white tracking-tight">
        Our Doctors
      </h1>
      {apiError && (
        <div className="mb-8 p-4 bg-red-900/40 text-red-100 rounded-xl max-w-4xl mx-auto text-center text-sm sm:text-base shadow-md">
          {apiError}
        </div>
      )}
      {doctors.length === 0 ? (
        <p className="text-center text-gray-400 text-lg sm:text-xl md:text-2xl font-medium">
          No doctors listed yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-gray-800/80 p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out border border-gray-700/50"
            >
              {doctor.photo && (
                <img
                  src={doctor.photo}
                  alt="doctor-img"
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full mx-auto mb-4 object-cover ring-2 ring-gray-600/50"
                />
              )}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center mb-4 text-white truncate">
                {doctor.name}
              </h2>
              <div className="space-y-3 text-gray-300 text-sm sm:text-base">
                <p><span className="font-medium text-gray-100">Age:</span> {doctor.age}</p>
                <p><span className="font-medium text-gray-100">Gender:</span> {doctor.gender}</p>
                <p><span className="font-medium text-gray-100">Speciality:</span> {doctor.speciality}</p>
                <p><span className="font-medium text-gray-100">Qualification:</span> {doctor.qualification}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctor;