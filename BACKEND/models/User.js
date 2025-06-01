const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  gender: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Patient', 'Doctor'] },
  remark: { type: String },
  previousTreatment: { type: String },
  qualification: { type: String },
  specialization: { type: String },
  experience: { type: Number },
  image: { type: String },
  isVerified: { type: Boolean, default: false },
  isListed: { type: Boolean, default: false }, // New field for doctor listing
});

module.exports = mongoose.model('User', userSchema);