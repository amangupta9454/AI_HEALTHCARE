const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['doctor', 'patient'], default: 'patient' },
  mobile: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  address: { type: String },
  photo: { type: String },
  speciality: { type: String },
  qualification: { type: String },
  listingStatus: { type: String, enum: ['none', 'pending', 'accepted', 'rejected'], default: 'none' },
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }], // New field for appointments
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return true; // No password for doctors
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);