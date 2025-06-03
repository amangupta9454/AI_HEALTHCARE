// import React from 'react'
// import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
// import Navbar from "./Components/Navbar";
// import Home from "./Components/Home";
// import Doctor from "./Components/Doctor";
// import Appointement from "./Components/Appointement";
// import Login from "./Components/Login";
// import Register from "./Components/Register";
// import PatientDashboard from "./Components/PatientDashboard";
// import DoctorDashboard from "./Components/DoctorDashboard";
// import Footer from "./Components/Footer";
// import Contact from './Components/Contact';
// const App = () => {
//   return (
//     <div>
//       <Router>
//         <Navbar />
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/doctor-listing" element={<Doctor />} />
//           <Route path="/appointement" element={<Appointement />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/patient-dashboard" element={<PatientDashboard />} />
//           <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
//           <Route path="/contact" element={<Contact />} />
//         </Routes>
//         <Footer />
//       </Router>
//     </div>
//   )
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from "./Components/Home";
import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import Contact from './Components/Contact';
import Register from './Components/Register';
import Appointement from './Components/Appointement';
import Login from './Components/Login';
import Review from './Components/Review';
import PatientDashboard from './Components/PatientDashboard';
import DoctorDashboard from './Components/DoctorDashboard';
import Doctor from './Components/Doctor';
import axios from 'axios';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ allowedRole }) => {
  const [auth, setAuth] = useState({ isAuthenticated: false, role: null, loading: true });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setAuth({ isAuthenticated: false, role: null, loading: false });
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuth({ isAuthenticated: true, role: response.data.role, loading: false });
      } catch (err) {
        console.error('Token verification failed:', err.response?.data || err.message);
        localStorage.removeItem('token');
        setAuth({ isAuthenticated: false, role: null, loading: false });
      }
    };

    verifyToken();
  }, [token]);

  if (auth.loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && auth.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/appointment" element={<Appointement/>}/>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/review" element={<Review />} />
        <Route path="/doctors" element={<Doctor />} />
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute allowedRole="Patient" />}>
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRole="Doctor" />}>
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        </Route>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;