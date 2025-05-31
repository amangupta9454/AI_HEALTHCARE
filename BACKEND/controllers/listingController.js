const DoctorListing = require('../models/DoctorListing');
const User = require('../models/User');
const { v2: cloudinary } = require('cloudinary');

// Create or update doctor listing
exports.createOrUpdateListing = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create listings' });
    }

    const { name, email, mobile, age, gender, speciality, qualification, photo } = user;

    // Check if listing already exists
    let listing = await DoctorListing.findOne({ doctorId: user._id });

    if (listing) {
      if (listing.status === 'accepted') {
        return res.status(400).json({ message: 'Listing already accepted, cannot modify' });
      }
      // Update existing listing
      listing.name = name;
      listing.email = email;
      listing.mobile = mobile;
      listing.age = age;
      listing.gender = gender;
      listing.speciality = speciality;
      listing.qualification = qualification;
      listing.photo = photo;
      listing.status = 'accepted'; // Auto-accept listing
    } else {
      // Create new listing
      listing = new DoctorListing({
        doctorId: user._id,
        name,
        email,
        mobile,
        age,
        gender,
        speciality,
        qualification,
        photo,
        status: 'accepted', // Auto-accept listing
      });
    }

    await listing.save();
    user.listingStatus = 'accepted';
    await user.save();

    res.status(200).json({ message: 'Listing submitted successfully' });
  } catch (error) {
    console.error('Create/Update listing error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get accepted listings (for Doctor.jsx)
exports.getAcceptedListings = async (req, res) => {
  try {
    const listings = await DoctorListing.find({ status: 'accepted' });
    res.json(listings);
  } catch (error) {
    console.error('Get accepted listings error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};