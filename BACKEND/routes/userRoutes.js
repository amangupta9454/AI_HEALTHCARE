// const express = require('express');
//  const router = express.Router(); 
//  const { register, verifyOtp, login, getProfile, updateProfile, listDoctor, getListedDoctors, createAppointment, getPatientAppointments, getDoctorAppointments, acceptAppointment, rejectAppointment, rescheduleAppointment, cancelAppointment, } = require('../controllers/userController'); 
//  const authMiddleware = require('../Middleware/auth'); 
//  router.post('/register', register); 
//  router.post('/verify-otp', verifyOtp); 
//  router.post('/login', login); 
//  router.get('/profile', authMiddleware, getProfile); 
//  router.put('/profile', authMiddleware, updateProfile); 
//  router.post('/list-doctor', authMiddleware, listDoctor); 
//  router.get('/listed-doctors', getListedDoctors); 
//  router.post('/appointments', authMiddleware, createAppointment); 
//  router.get('/appointments/patient', authMiddleware, getPatientAppointments); 
//  router.get('/appointments/doctor', authMiddleware, getDoctorAppointments); 
//  router.put('/appointments/:id/accept', authMiddleware, acceptAppointment); 
//  router.put('/appointments/:id/reject', authMiddleware, rejectAppointment); 
//  router.put('/appointments/:id/reschedule', authMiddleware, rescheduleAppointment); 
//  router.delete('/appointments/:id', authMiddleware, cancelAppointment); 
//  module.exports = router;


const express = require('express');
const router = express.Router();
const {
  register,
  verifyOtp,
  login,
  getProfile,
  updateProfile,
  listDoctor,
  getListedDoctors,
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  acceptAppointment,
  rejectAppointment,
  rescheduleAppointment,
  cancelAppointment,
} = require('../controllers/userController');
const { sendOtp } = require('../utils/otp'); // Import sendOtp
const authMiddleware = require('../Middleware/auth');

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/list-doctor', authMiddleware, listDoctor);
router.get('/listed-doctors', getListedDoctors);
router.post('/appointments', authMiddleware, createAppointment);
router.get('/appointments/patient', authMiddleware, getPatientAppointments);
router.get('/appointments/doctor', authMiddleware, getDoctorAppointments);
router.put('/appointments/:id/accept', authMiddleware, acceptAppointment);
router.put('/appointments/:id/reject', authMiddleware, rejectAppointment);
router.put('/appointments/:id/reschedule', authMiddleware, rescheduleAppointment);
router.delete('/appointments/:id', authMiddleware, cancelAppointment);
router.post('/send-otp', sendOtp); // Add the send-otp route

module.exports = router;