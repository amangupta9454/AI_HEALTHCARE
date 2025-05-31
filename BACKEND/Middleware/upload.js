const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
require('dotenv').config();
// Validate environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Cloudinary environment variables missing');
  throw new Error('Cloudinary configuration is incomplete. Check .env file.');
}

// Configure Cloudinary
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured successfully:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  });
} catch (error) {
  console.error('Cloudinary configuration error:', error.message);
  throw error;
}

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    console.log('File filter triggered:', file);
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.split('.').pop().toLowerCase());
    if (mimetype && extname) {
      console.log(`File ${file.originalname} accepted`);
      return cb(null, true);
    }
    console.error(`File ${file.originalname} rejected: invalid format`);
    cb(new Error('Only JPEG and PNG images are allowed'));
  },
}).single('medicalCertificate');

// Middleware to handle file upload to Cloudinary
const uploadMiddleware = async (req, res, next) => {
  console.log('Upload middleware called');
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      console.log('No file uploaded');
      return next();
    }

    try {
      console.log('Uploading to Cloudinary:', req.file.originalname);
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'medical_certificates',
          public_id: `certificate_${Date.now()}_${req.file.originalname}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error.message);
            return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
          }
          console.log('Cloudinary upload success:', {
            url: result.secure_url,
            public_id: result.public_id,
          });
          req.file.path = result.secure_url; // Store URL in req.file.path
          next();
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    } catch (error) {
      console.error('Upload processing error:', error.message);
      res.status(500).json({ message: 'Upload processing failed', error: error.message });
    }
  });
};

module.exports = uploadMiddleware;