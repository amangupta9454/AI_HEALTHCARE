const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  prescription: { type: String },
  previousTreatment: { type: String },
  comments: { type: String },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Rescheduled'], default: 'Pending' },
  doctorName: { type: String, required: true },
  doctorEmail: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);