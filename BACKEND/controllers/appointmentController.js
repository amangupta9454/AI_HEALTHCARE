const Appointment = require('../models/Appointment');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { uploadImage } = require('../utils/cloudinary');

// Configure Nodemailer
const configureTransporter = () => {
  if (!process.env.NODEMAILER_EMAIL || !process.env.NODEMAILER_PASS) {
    console.error('Nodemailer credentials missing.');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });
};

// Book appointment
exports.bookAppointment = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      email,
      mobile,
      address,
      doctorId,
      date,
      time,
      reason,
      previousTreatment,
      remarks,
    } = req.body;

    const medicalCertificateFile = req.files?.medicalCertificate;

    // Validate required fields
    const requiredFields = { name, age, gender, email, mobile, address, doctorId, date, time, reason };
    if (Object.values(requiredFields).some((field) => !field)) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Additional validations
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!/^[6789][0-9]{9}$/.test(mobile)) {
      return res.status(400).json({ message: 'Invalid mobile number' });
    }
    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      return res.status(400).json({ message: 'Age must be between 1 and 120' });
    }
    if (!['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender' });
    }
    if (address.length < 5) {
      return res.status(400).json({ message: 'Address must be at least 5 characters' });
    }
    const selectedDate = new Date(date);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 2);
    if (selectedDate < today || selectedDate > maxDate) {
      return res.status(400).json({ message: 'Date must be within 2 months from today' });
    }
    if (!time) {
      return res.status(400).json({ message: 'Time is required' });
    }
    if (reason.length < 5) {
      return res.status(400).json({ message: 'Reason must be at least 5 characters' });
    }
    if (medicalCertificateFile && medicalCertificateFile.size > 1 * 1024 * 1024) {
      return res.status(400).json({ message: 'Medical certificate must be less than 1MB' });
    }
    if (medicalCertificateFile && !['image/jpeg', 'image/png'].includes(medicalCertificateFile.mimetype)) {
      return res.status(400).json({ message: 'Medical certificate must be JPEG or PNG' });
    }

    // Verify patient and doctor
    const patient = await User.findById(req.user.id);
    if (!patient || patient.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can book appointments' });
    }
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor' || doctor.listingStatus !== 'accepted') {
      return res.status(400).json({ message: 'Invalid or unlisted doctor' });
    }

    // Upload medical certificate to Cloudinary if provided
    let medicalCertificateUrl = '';
    if (medicalCertificateFile) {
      medicalCertificateUrl = await uploadImage(medicalCertificateFile.data);
    }

    // Create appointment
    const appointment = new Appointment({
      patientId: patient._id,
      doctorId,
      name,
      age: parsedAge,
      gender,
      email,
      mobile,
      address,
      medicalCertificate: medicalCertificateUrl,
      date: selectedDate,
      time,
      reason,
      previousTreatment,
      remarks,
      status: 'pending',
    });

    await appointment.save();

    // Update patient and doctor with appointment reference
    patient.appointments.push(appointment._id);
    doctor.appointments.push(appointment._id);
    await patient.save();
    await doctor.save();

    // Send email notifications
    const transporter = configureTransporter();
    if (transporter) {
      try {
        // Email to patient
        await transporter.sendMail({
          from: process.env.NODEMAILER_EMAIL,
          to: patient.email,
          subject: 'Appointment Booking Confirmation',
          text: `Hello ${patient.name},\n\nYour appointment with Dr. ${doctor.name} has been booked successfully.\n\nDetails:\nName: ${name}\nAge: ${age}\nGender: ${gender}\nEmail: ${email}\nMobile: ${mobile}\nAddress: ${address}\nDate: ${new Date(date).toLocaleDateString()}\nTime: ${time}\nReason: ${reason}\nPrevious Treatment: ${previousTreatment || 'None'}\nRemarks: ${remarks || 'None'}\nMedical Certificate: ${medicalCertificateUrl || 'None'}\nDoctor: ${doctor.name} (${doctor.speciality})\n\nBest regards,\nHealthcare Team`,
        });

        // Email to doctor
        await transporter.sendMail({
          from: process.env.NODEMAILER_EMAIL,
          to: doctor.email,
          subject: 'New Appointment Booking',
          text: `Hello Dr. ${doctor.name},\n\nA new appointment has been booked by ${patient.name}.\n\nDetails:\nName: ${name}\nAge: ${age}\nGender: ${gender}\nEmail: ${email}\nMobile: ${mobile}\nAddress: ${address}\nDate: ${new Date(date).toLocaleDateString()}\nTime: ${time}\nReason: ${reason}\nPrevious Treatment: ${previousTreatment || 'None'}\nRemarks: ${remarks || 'None'}\nMedical Certificate: ${medicalCertificateUrl || 'None'}\n\nBest regards,\nHealthcare Team`,
        });
        console.log('Appointment emails sent to:', patient.email, doctor.email);
      } catch (emailError) {
        console.error('Nodemailer error:', emailError.message);
      }
    }

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get appointments for a user (patient or doctor)
exports.getUserAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const appointments = await Appointment.find({
      $or: [{ patientId: user._id }, { doctorId: user._id }],
    })
      .populate('patientId', 'name email')
      .populate('doctorId', 'name speciality');

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Accept appointment
exports.acceptAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email speciality');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user || (user.role === 'doctor' && appointment.doctorId._id.toString() !== user._id.toString()) ||
        (user.role === 'patient' && appointment.patientId._id.toString() !== user._id.toString())) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (appointment.status !== 'pending' && appointment.status !== 'rescheduled') {
      return res.status(400).json({ message: 'Appointment cannot be accepted in current state' });
    }

    appointment.status = 'confirmed';
    await appointment.save();

    // Send email notifications
    const transporter = configureTransporter();
    if (transporter) {
      try {
        // Email to patient
        await transporter.sendMail({
          from: process.env.NODEMAILER_EMAIL,
          to: appointment.patientId.email,
          subject: 'Appointment Confirmed',
          text: `Hello ${appointment.patientId.name},\n\nYour appointment with Dr. ${appointment.doctorId.name} has been confirmed.\n\nDetails:\nDate: ${new Date(appointment.date).toLocaleDateString()}\nTime: ${appointment.time}\nDoctor: ${appointment.doctorId.name} (${appointment.doctorId.speciality})\n\nBest regards,\nHealthcare Team`,
        });

        // Email to doctor
        if (user.role === 'patient') {
          await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: appointment.doctorId.email,
            subject: 'Patient Confirmed Appointment',
            text: `Hello Dr. ${appointment.doctorId.name},\n\n${appointment.patientId.name} has confirmed the appointment.\n\nDetails:\nDate: ${new Date(appointment.date).toLocaleDateString()}\nTime: ${appointment.time}\n\nBest regards,\nHealthcare Team`,
          });
        }
      } catch (emailError) {
        console.error('Nodemailer error:', emailError.message);
      }
    }

    res.json({ message: 'Appointment confirmed', appointment });
  } catch (error) {
    console.error('Accept appointment error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Reject appointment
exports.rejectAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email speciality');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user || (user.role === 'doctor' && appointment.doctorId._id.toString() !== user._id.toString()) ||
        (user.role === 'patient' && appointment.patientId._id.toString() !== user._id.toString())) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (appointment.status !== 'pending' && appointment.status !== 'rescheduled') {
      return res.status(400).json({ message: 'Appointment cannot be rejected in current state' });
    }

    appointment.status = 'rejected';
    await appointment.save();

    // Send email notifications
    const transporter = configureTransporter();
    if (transporter) {
      try {
        // Email to patient
        await transporter.sendMail({
          from: process.env.NODEMAILER_EMAIL,
          to: appointment.patientId.email,
          subject: 'Appointment Rejected',
          text: `Hello ${appointment.patientId.name},\n\nYour appointment with Dr. ${appointment.doctorId.name} has been rejected.\n\nDetails:\nDate: ${new Date(appointment.date).toLocaleDateString()}\nTime: ${appointment.time}\nDoctor: ${appointment.doctorId.name} (${appointment.doctorId.speciality})\n\nBest regards,\nHealthcare Team`,
        });

        // Email to doctor
        if (user.role === 'patient') {
          await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: appointment.doctorId.email,
            subject: 'Patient Rejected Appointment',
            text: `Hello Dr. ${appointment.doctorId.name},\n\n${appointment.patientId.name} has rejected the appointment.\n\nDetails:\nDate: ${new Date(appointment.date).toLocaleDateString()}\nTime: ${appointment.time}\n\nBest regards,\nHealthcare Team`,
          });
        }
      } catch (emailError) {
        console.error('Nodemailer error:', emailError.message);
      }
    }

    res.json({ message: 'Appointment rejected', appointment });
  } catch (error) {
    console.error('Reject appointment error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email speciality');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user || (user.role === 'doctor' && appointment.doctorId._id.toString() !== user._id.toString()) ||
        (user.role === 'patient' && appointment.patientId._id.toString() !== user._id.toString())) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required' });
    }

    const selectedDate = new Date(date);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 2);
    if (selectedDate < today || selectedDate > maxDate) {
      return res.status(400).json({ message: 'Date must be within 2 months from today' });
    }

    appointment.date = selectedDate;
    appointment.time = time;
    appointment.status = 'rescheduled';
    await appointment.save();

    // Send email notifications
    const transporter = configureTransporter();
    if (transporter) {
      try {
        // Email to patient
        await transporter.sendMail({
          from: process.env.NODEMAILER_EMAIL,
          to: appointment.patientId.email,
          subject: 'Appointment Rescheduled',
          text: `Hello ${appointment.patientId.name},\n\nYour appointment with Dr. ${appointment.doctorId.name} has been rescheduled.\n\nDetails:\nNew Date: ${new Date(appointment.date).toLocaleDateString()}\nNew Time: ${appointment.time}\nDoctor: ${appointment.doctorId.name} (${appointment.doctorId.speciality})\n\nBest regards,\nHealthcare Team`,
        });

        // Email to doctor
        await transporter.sendMail({
          from: process.env.NODEMAILER_EMAIL,
          to: appointment.doctorId.email,
          subject: user.role === 'patient' ? 'Patient Rescheduled Appointment' : 'Appointment Rescheduled',
          text: `Hello Dr. ${appointment.doctorId.name},\n\n${user.role === 'patient' ? `${appointment.patientId.name} has` : 'You have'} rescheduled the appointment.\n\nDetails:\nNew Date: ${new Date(appointment.date).toLocaleDateString()}\nNew Time: ${appointment.time}\n\nBest regards,\nHealthcare Team`,
        });
      } catch (emailError) {
        console.error('Nodemailer error:', emailError.message);
      }
    }

    res.json({ message: 'Appointment rescheduled', appointment });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};