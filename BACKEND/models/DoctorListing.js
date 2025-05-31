const mongoose = require('mongoose');

const doctorListingSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  speciality: { type: String, required: true },
  qualification: { type: String, required: true },
  photo: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'accepted' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DoctorListing', doctorListingSchema);