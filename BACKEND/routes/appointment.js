const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../Middleware/upload');

// Book Appointment (Patient)
router.post('/book-appointment', (req, res, next) => {
  // console.log('Route /book-appointment hit'); // Debug log
  // console.log('Request headers:', req.headers); // Log headers
  // console.log('Request body:', req.body); // Log body
  next();
}, auth, upload, async (req, res) => {
  // console.log('POST /book-appointment processing');
  // console.log('Authenticated user:', req.user);
  // console.log('File received:', req.file); // Debug file

  if (req.user.role !== 'patient') {
    console.error('Access denied: User role:', req.user.role);
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const {
      name, age, gender, email, mobile, address, doctorId, date, time,
      reason, previousTreatment, remarks
    } = req.body;

    // console.log('Request body:', { name, age, gender, email, mobile, address, doctorId, date, time, reason });

    if (!name || !age || !gender || !email || !mobile || !address || !doctorId || !date || !time || !reason) {
      console.error('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      console.error(`Doctor not found: ${doctorId}`);
      return res.status(400).json({ message: 'Invalid doctor' });
    }

    let medicalCertificateUrl = '';
    if (req.file && req.file.path) {
      medicalCertificateUrl = req.file.path;
      // console.log('Medical certificate uploaded:', medicalCertificateUrl);
    } else {
      // console.log('No medical certificate uploaded');
    }

    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      name,
      age,
      gender,
      email,
      mobile,
      address,
      date,
      time,
      reason,
      previousTreatment,
      remarks,
      medicalCertificate: medicalCertificateUrl,
      status: 'pending',
    });

    await appointment.save();
    // console.log('Appointment saved:', {
    //   id: appointment._id,
    //   medicalCertificate: appointment.medicalCertificate,
    // });

    // console.log('Appointment emails sent to:', email, doctor.email);
    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error('Error booking appointment:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Appointments (Patient or Doctor)
router.get('/appointments', auth, async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'patient') {
      appointments = await Appointment.find({ patientId: req.user.id })
        .populate('doctorId', 'name speciality')
        .sort({ date: 1 });
    } else if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ doctorId: req.user.id })
        .populate('patientId', 'name email')
        .sort({ date: 1 });
    } else {
      console.error('Access denied: User role:', req.user.role);
      return res.status(403).json({ message: 'Access denied' });
    }
    // console.log(`Fetched ${appointments.length} appointments for ${req.user.role}`);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Other routes remain unchanged
router.post('/appointments/:id/accept', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      console.error(`Appointment not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (req.user.role === 'doctor' && appointment.doctorId.toString() === req.user.id) {
      appointment.status = 'confirmed';
      await appointment.save();
      // console.log(`Appointment ${req.params.id} confirmed`);
      res.json({ message: 'Appointment confirmed', appointment });
    } else {
      console.error('Access denied for accept:', req.user.id);
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.error('Error accepting appointment:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/appointments/:id/reject', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      console.error(`Appointment not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (
      (req.user.role === 'doctor' && appointment.doctorId.toString() === req.user.id) ||
      (req.user.role === 'patient' && appointment.patientId.toString() === req.user.id)
    ) {
      appointment.status = 'rejected';
      await appointment.save();
      // console.log(`Appointment ${req.params.id} rejected`);
      res.json({ message: 'Appointment rejected', appointment });
    } else {
      console.error('Access denied for reject:', req.user.id);
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.error('Error rejecting appointment:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/appointments/:id/reschedule', auth, async (req, res) => {
  try {
    const { date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      console.error(`Appointment not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (
      (req.user.role === 'doctor' && appointment.doctorId.toString() === req.user.id) ||
      (req.user.role === 'patient' && appointment.patientId.toString() === req.user.id)
    ) {
      if (!date || !time) {
        console.error('Reschedule failed: Missing date or time');
        return res.status(400).json({ message: 'Date and time are required' });
      }
      appointment.date = date;
      appointment.time = time;
      appointment.status = 'rescheduled';
      await appointment.save();
      // console.log(`Appointment ${req.params.id} rescheduled`);
      res.json({ message: 'Appointment rescheduled', appointment });
    } else {
      console.error('Access denied for reschedule:', req.user.id);
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.error('Error rescheduling appointment:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;