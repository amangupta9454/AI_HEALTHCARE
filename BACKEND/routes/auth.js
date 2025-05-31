const express = require('express');
const router = express.Router();
const { loginUser, registerUser, sendOtp, verifyOtpAndLogin, getUserProfile, updateUserProfile, updatePassword, checkListingStatus } = require('../controllers/authController');
const { createOrUpdateListing, getAcceptedListings } = require('../controllers/listingController');
const { bookAppointment, getUserAppointments, acceptAppointment, rejectAppointment, rescheduleAppointment } = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
});

router.post('/login', loginUser);
router.post('/register', upload.single('photo'), registerUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtpAndLogin);
router.get('/me', authMiddleware, getUserProfile);
router.put('/update-profile', authMiddleware, upload.single('photo'), updateUserProfile);
router.put('/update-password', authMiddleware, updatePassword);
router.post('/listing', authMiddleware, createOrUpdateListing);
router.get('/listings/accepted', getAcceptedListings);
router.get('/listing/status', authMiddleware, checkListingStatus);
router.post('/book-appointment', authMiddleware, upload.single('medicalCertificate'), bookAppointment);
router.get('/appointments', authMiddleware, getUserAppointments);
router.post('/appointments/:id/accept', authMiddleware, acceptAppointment);
router.post('/appointments/:id/reject', authMiddleware, rejectAppointment);
router.post('/appointments/:id/reschedule', authMiddleware, rescheduleAppointment);

module.exports = router;