const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const Appointment = require('../models/Appointment');
const { sendOtp, generateOtp } = require('../utils/otp');
const { sendEmail } = require('../utils/email');
require('dotenv').config(); // Ensure you have dotenv to load environment variables
const register = async (req, res) => {
  const { name, age, email, mobile, address, gender, password, role, remark, previousTreatment, qualification, specialization, experience, image, otp } = req.body;
  try {
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      age,
      email,
      mobile,
      address,
      gender,
      password: hashedPassword,
      role,
      remark: role === 'Patient' ? remark : undefined,
      previousTreatment: role === 'Patient' ? previousTreatment : undefined,
      qualification: role === 'Doctor' ? qualification : undefined,
      specialization: role === 'Doctor' ? specialization : undefined,
      experience: role === 'Doctor' ? experience : undefined,
      image: role === 'Doctor' ? image : undefined,
      isVerified: true,
    });

    await user.save();
    await Otp.deleteOne({ email });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    console.log("error is", error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (!user.isVerified) return res.status(400).json({ message: 'Email not verified' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  const { name, age, mobile, address, gender, remark, previousTreatment, qualification, specialization, experience, image } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name;
    user.age = age;
    user.mobile = mobile;
    user.address = address;
    user.gender = gender;

    if (user.role === 'Patient') {
      user.remark = remark;
      user.previousTreatment = previousTreatment;
    } else if (user.role === 'Doctor') {
      user.qualification = qualification;
      user.specialization = specialization;
      user.experience = experience;
      user.image = image || user.image;
    }

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

const listDoctor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'Doctor') return res.status(403).json({ message: 'Only doctors can list themselves' });

    user.isListed = true;
    await user.save();
    res.json({ message: 'Doctor listed successfully' });
  } catch (error) {
    console.error('Error listing doctor:', error);
    res.status(500).json({ message: 'Error listing doctor', error: error.message });
  }
};

const getListedDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor', isListed: true }).select('-password');
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching listed doctors:', error);
    res.status(500).json({ message: 'Error fetching listed doctors', error: error.message });
  }
};

const createAppointment = async (req, res) => {
  const { name, age, email, mobile, date, time, doctorId, prescription, previousTreatment, comments } = req.body;
  try {
    const patient = await User.findById(req.user.id);
    if (!patient || patient.role !== 'Patient') return res.status(403).json({ message: 'Only patients can book appointments' });

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'Doctor' || !doctor.isListed) return res.status(400).json({ message: 'Invalid or unlisted doctor' });

    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      patientName: name,
      age,
      email,
      mobile,
      date,
      time,
      prescription,
      previousTreatment,
      comments,
      doctorName: doctor.name,
      doctorEmail: doctor.email,
    });

    await appointment.save();

    await sendEmail(
      [patient.email, doctor.email],
      'New Appointment Booked',
      appointment,
      'created'
    );

    res.json({ message: 'Appointment booked successfully' });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user.id });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

const acceptAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.doctorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (appointment.status !== 'Pending') return res.status(400).json({ message: 'Appointment cannot be accepted' });

    appointment.status = 'Accepted';
    await appointment.save();

    await sendEmail(
      [appointment.email, appointment.doctorEmail],
      'Appointment Accepted',
      appointment,
      'accepted'
    );

    res.json({ message: 'Appointment accepted successfully' });
  } catch (error) {
    console.error('Error accepting appointment:', error);
    res.status(500).json({ message: 'Error accepting appointment', error: error.message });
  }
};

const rejectAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.doctorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (appointment.status !== 'Pending') return res.status(400).json({ message: 'Appointment cannot be rejected' });

    appointment.status = 'Rejected';
    await appointment.save();

    await sendEmail(
      [appointment.email, appointment.doctorEmail],
      'Appointment Rejected',
      appointment,
      'rejected'
    );

    res.json({ message: 'Appointment rejected successfully' });
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    res.status(500).json({ message: 'Error rejecting appointment', error: error.message });
  }
};

const rescheduleAppointment = async (req, res) => {
  const { date, time } = req.body;
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const isDoctor = appointment.doctorId.toString() === req.user.id;
    const isPatient = appointment.patientId.toString() === req.user.id;
    if (!isDoctor && !isPatient) return res.status(403).json({ message: 'Unauthorized' });

    if (!['Pending', 'Accepted'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Appointment cannot be rescheduled' });
    }

    if (!date || !time) return res.status(400).json({ message: 'Date and time are required' });

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return res.status(400).json({ message: 'Date must be today or in the future' });

    appointment.date = date;
    appointment.time = time;
    appointment.status = 'Rescheduled';
    await appointment.save();

    await sendEmail(
      [appointment.email, appointment.doctorEmail],
      'Appointment Rescheduled',
      appointment,
      'rescheduled'
    );

    res.json({ message: 'Appointment rescheduled successfully' });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ message: 'Error rescheduling appointment', error: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patientId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (!['Pending', 'Accepted'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Appointment cannot be cancelled' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    await sendEmail(
      [appointment.email, appointment.doctorEmail],
      'Appointment Cancelled',
      appointment,
      'cancelled'
    );

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
  }
};

module.exports = {
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
};