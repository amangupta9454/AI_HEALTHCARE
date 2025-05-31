const User = require('../models/User');
const DoctorListing = require('../models/DoctorListing');

const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { v2: cloudinary } = require('cloudinary');

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

// Generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Store OTPs temporarily (in-memory; use Redis or DB in production)
const otpStore = new Map();

// Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required' });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate role
    if (!['patient', 'doctor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if email already exists for registration to prevent duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = generateOtp();
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min expiry

    const transporter = configureTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.NODEMAILER_EMAIL,
          to: email,
          subject: 'Your OTP for Healthcare System Registration',
          text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
        });
        console.log('OTP sent to:', email);
        res.status(200).json({ message: 'OTP sent successfully' });
      } catch (emailError) {
        console.error('Nodemailer error:', emailError.message);
        res.status(500).json({ message: 'Failed to send OTP' });
      }
    } else {
      res.status(500).json({ message: 'Email service not configured' });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Verify OTP and login
exports.verifyOtpAndLogin = async (req, res) => {
  try {
    const { email, otp, role, password } = req.body;
    if (!email || !otp || !role) {
      return res.status(400).json({ message: 'Email, OTP, and role are required' });
    }

    const storedOtp = otpStore.get(email);
    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or role' });
    }

    if (role === 'patient') {
      if (!password) {
        return res.status(400).json({ message: 'Password is required for patient' });
      }
      if (!await user.matchPassword(password)) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const transporter = configureTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.NODEMAILER_EMAIL,
          to: user.email,
          subject: 'Login Alert',
          text: `Hello ${user.name},\n\nYou have successfully logged in as a ${role} at ${new Date().toLocaleString()}.\n\nBest regards,\nHealthcare Team`,
        });
        console.log('Login email sent to:', user.email);
      } catch (emailError) {
        console.error('Nodemailer error:', emailError.message);
      }
    }

    otpStore.delete(email); // Clear OTP

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        listingStatus: user.listingStatus,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Register user
exports.registerUser = async (req, res) => {
  try {
    // Check if req.body is defined
    if (!req.body) {
      console.error('req.body is undefined');
      return res.status(400).json({ message: 'Request body is missing' });
    }

    // Destructure fields from req.body with defaults to avoid undefined errors
    const {
      name = '',
      email = '',
      password = '',
      mobile = '',
      age = '',
      gender = '',
      address = '',
      speciality = '',
      qualification = '',
      otp = '',
      role = ''
    } = req.body;

    // Get photo from req.body (base64) or req.file (if multer handles file)
    const photo = req.body.photo || (req.file ? req.file.buffer.toString('base64') : '');

    // Log received data for debugging
    console.log('Received registration data:', { name, email, mobile, age, gender, role, hasPhoto: !!photo });

    // Validate OTP
    const storedOtp = otpStore.get(email);
    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Validate required fields based on role
    const requiredFields = role === 'patient'
      ? { name, email, password, mobile, age, gender, address }
      : { name, email, mobile, age, gender, speciality, qualification };
    if (Object.values(requiredFields).some(field => !field)) {
      console.error('Missing required fields:', requiredFields);
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
    if (role === 'patient' && password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (role === 'doctor' && (!speciality || !qualification)) {
      return res.status(400).json({ message: 'Speciality and qualification are required for doctors' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Validate JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Configure Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing');
      return res.status(500).json({ message: 'Cloudinary configuration missing' });
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Validate and upload photo if provided
    let photoUrl = '';
    if (photo) {
      try {
        const buffer = Buffer.from(photo.split(',')[1] || photo, 'base64');
        if (buffer.length > 1 * 1024 * 1024) {
          return res.status(400).json({ message: 'Photo must be less than 1MB' });
        }
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: `healthcare/${role}s` },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });
        photoUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError.message);
        return res.status(500).json({ message: 'Failed to upload photo' });
      }
    }

    // Create user
    const user = new User({
      name,
      email,
      password: role === 'patient' ? password : undefined,
      role,
      mobile,
      age: parsedAge,
      gender,
      address: role === 'patient' ? address : undefined,
      photo: photoUrl,
      speciality: role === 'doctor' ? speciality : undefined,
      qualification: role === 'doctor' ? qualification : undefined,
      listingStatus: role === 'doctor' ? 'accepted' : 'none', // Auto-accept doctor listings
    });

    await user.save();
    otpStore.delete(email); // Clear OTP

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Send confirmation email
    const transporter = configureTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.NODEMAILER_EMAIL,
          to: user.email,
          subject: `Welcome to Healthcare System as ${role}`,
          text: `Hello ${user.name},\n\nYour registration as a ${role} is successful!\n\nBest regards,\nHealthcare Team`,
        });
        console.log('Registration email sent to:', user.email);
      } catch (emailError) {
        console.error('Nodemailer error:', emailError.message);
      }
    }

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        listingStatus: user.listingStatus,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    console.log('Login attempt: Email:', email, 'Role:', role);

    const user = await User.findOne({ email, role });
    if (!user) {
      console.error('User not found: Email:', email, 'Role:', role);
      return res.status(401).json({ message: 'Invalid email or role' });
    }

    console.log('Found user:', { id: user._id, email: user.email, role: user.role });

    if (role === 'patient' && !await user.matchPassword(password)) {
      console.error('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid password' });
    }

    console.log('Password verified for role:', role);

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const transporter = configureTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.NODEMAILER_EMAIL,
          to: user.email,
          subject: 'Login Alert',
          text: `Hello ${user.name},\n\nYou have successfully logged in as a ${role} at ${new Date().toLocaleString()}.\n\nBest regards,\nHealthcare Team`,
        });
        console.log('Login email sent to:', user.email);
      } catch (emailError) {
        console.error('Nodemailer error:', emailError.message);
      }
    }

    console.log('Login successful for:', email);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        listingStatus: user.listingStatus,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    const {
      name = user.name,
      email = user.email,
      mobile = user.mobile,
      age = user.age,
      gender = user.gender,
      speciality = user.speciality,
      qualification = user.qualification,
      address = user.address,
    } = req.body || {};

    const requiredFields = user.role === 'patient'
      ? { name, email, mobile, age, gender, address }
      : { name, email, mobile, age, gender, speciality, qualification };
    if (Object.values(requiredFields).some(field => !field)) {
      console.error('Missing required fields:', requiredFields);
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!/^[6789][0-9]{9}$/.test(mobile)) {
      return res.status(400).json({ message: 'Invalid mobile number' });
    }
    if (age < 1 || age > 120) {
      return res.status(400).json({ message: 'Age must be between 1 and 120' });
    }
    if (!['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender' });
    }
    if (user.role === 'doctor' && (!speciality || !qualification)) {
      return res.status(400).json({ message: 'Speciality and qualification are required for doctors' });
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing');
      return res.status(500).json({ message: 'Cloudinary configuration missing' });
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    let photoUrl = user.photo;
    if (req.file) {
      if (req.file.size > 1 * 1024 * 1024) {
        return res.status(400).json({ message: 'Photo must be less than 1MB' });
      }
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: `healthcare/${user.role}s` },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        photoUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError.message);
        return res.status(500).json({ message: 'Failed to upload photo' });
      }
    }

    user.name = name;
    user.email = email;
    user.mobile = mobile;
    user.age = parseInt(age);
    user.gender = gender;
    if (user.role === 'patient') {
      user.address = address;
    }
    if (user.role === 'doctor') {
      user.speciality = speciality;
      user.qualification = qualification;
    }
    user.photo = photoUrl;

    const listing = await DoctorListing.findOne({ doctorId: user._id });
    if (!listing) {
      user.listingStatus = 'none';
    } else if (listing.status !== user.listingStatus) {
      user.listingStatus = listing.status;
    }

    await user.save();

    if (user.role === 'doctor' && listing && listing.status !== 'accepted') {
      listing.name = user.name;
      listing.email = user.email;
      listing.mobile = user.mobile;
      listing.age = user.age;
      listing.gender = user.gender;
      listing.speciality = user.speciality;
      listing.qualification = user.qualification;
      listing.photo = user.photo;
      listing.status = 'accepted'; // Auto-accept doctor listings
      await listing.save();
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        age: user.age,
        gender: user.gender,
        speciality: user.speciality,
        qualification: user.qualification,
        photo: user.photo,
        listingStatus: user.listingStatus,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'patient' && !await user.matchPassword(currentPassword)) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    if (user.role === 'patient') {
      user.password = newPassword;
      await user.save();
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Check listing status
exports.checkListingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can check listing status' });
    }

    const listing = await DoctorListing.findOne({ doctorId: user._id });
    if (!listing) {
      if (user.listingStatus !== 'none') {
        user.listingStatus = 'none';
        await user.save();
      }
      return res.json({ listingStatus: 'none' });
    }

    if (user.listingStatus !== listing.status) {
      user.listingStatus = listing.status;
      await user.save();
    }

    res.json({ listingStatus: listing.status });
  } catch (error) {
    console.error('Check listing status error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};