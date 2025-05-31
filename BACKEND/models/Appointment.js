const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  previousTreatment: {
    type: String,
  },
  remarks: {
    type: String,
  },
  medicalCertificate: {
    type: String, // Store Cloudinary URL
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'rescheduled'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);