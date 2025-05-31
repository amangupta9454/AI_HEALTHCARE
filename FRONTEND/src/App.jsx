import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Navbar from "./Components/Navbar";
import Home from "./Components/Home";
import Doctor from "./Components/Doctor";
import Appointement from "./Components/Appointement";
import Login from "./Components/Login";
import Register from "./Components/Register";
import UserDashboard from "./Components/UserDashboard";
import DoctorDashboard from "./Components/DoctorDashboard";
import Footer from "./Components/Footer";
import Contact from './Components/Contact';
const App = () => {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctor-listing" element={<Doctor />} />
          <Route path="/appointement" element={<Appointement />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  )
}

export default App;