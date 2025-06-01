const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage(); // Use memory storage for Cloudinary

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images only (jpeg, jpg, png)'));
    }
  },
});

module.exports = { upload };