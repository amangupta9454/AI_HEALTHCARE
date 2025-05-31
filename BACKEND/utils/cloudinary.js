const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (fileBuffer) => {
  try {
    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'medical_certificates' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
};

module.exports = { uploadImage };