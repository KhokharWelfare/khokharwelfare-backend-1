const express = require('express');
const Donation = require('../models/Donation');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

const cors = require('cors');
app.use(cors({
  origin: ['https://khokhar-welfarefoundation.vercel.app', 'https://www.khokharwelfarefoundaion.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.error('Error: Missing Cloudinary environment variables. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.');
    throw new Error('Cloudinary configuration missing');
  }
  return config;
};

try {
  cloudinary.config(validateCloudinaryConfig());
  // Test Cloudinary connectivity
  cloudinary.api.ping((error, result) => {
    if (error) {
      console.error('Cloudinary connectivity test failed:', error);
    } else {
      console.log('Cloudinary connected successfully:', result);
    }
  });
} catch (error) {
  console.error('Cloudinary initialization failed:', error);
  process.exit(1); // Exit in development; handle gracefully in production
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file) {
      console.error('No file uploaded');
      return cb(new Error('No file provided'));
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.error('Invalid file type:', file.mimetype);
      return cb(new Error('Only JPEG, PNG, or JPG images are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single('imageString');

router.post('/', authMiddleware, (req, res) => {
  console.log('Donation request received:', {
    body: { name: req.body.name, amount: req.body.amount },
    hasFile: !!req.file,
    headers: { authorization: req.headers.authorization?.substring(0, 20) + '...' },
  });

  upload(req, res, async (multerError) => {
    if (multerError) {
      console.error('Multer error:', { message: multerError.message, stack: multerError.stack });
      return res.status(400).json({ message: multerError.message });
    }

    const { name, amount } = req.body;
    try {
      console.log('Processing donation:', { name, amount });

      if (!name || !name.trim()) {
        console.error('Validation error: Name is missing or empty');
        return res.status(400).json({ message: 'Please provide a valid name' });
      }
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        console.error('Validation error: Invalid amount', amount);
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }

      let imageString = '';
      if (req.file) {
        if (!req.file.buffer || req.file.buffer.length === 0) {
          console.error('Invalid file buffer:', req.file);
          return res.status(400).json({ message: 'Uploaded file is empty or invalid' });
        }
        console.log('Uploading file to Cloudinary:', {
          mimetype: req.file.mimetype,
          size: req.file.size,
        });
        try {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'donation-proofs' },
              (err, result) => {
                if (err) {
                  console.error('Cloudinary upload error:', err);
                  reject(err);
                } else {
                  resolve(result);
                }
              }
            );
            stream.on('error', (error) => {
              console.error('Cloudinary stream error:', error);
              reject(error);
            });
            stream.end(req.file.buffer);
          });
          imageString = result.secure_url;
          console.log('Cloudinary upload successful:', imageString);
        } catch (error) {
          console.error('Cloudinary upload failed:', {
            message: error.message,
            error: error,
          });
          return res.status(500).json({
            message: 'Failed to upload image to Cloudinary',
            error: error.message || 'Unknown Cloudinary error',
          });
        }
      } else {
        console.error('No file uploaded');
        return res.status(400).json({ message: 'Image is required' });
      }

      const donation = new Donation({
        name: name.trim(),
        amount: parsedAmount,
        imageString,
      });

      try {
        await donation.save();
        console.log('Donation saved successfully:', {
          name: name.trim(),
          amount: parsedAmount,
          imageString,
        });
        res.status(201).json({ donation });
      } catch (mongoError) {
        console.error('MongoDB save error:', {
          message: mongoError.message,
          error: mongoError,
        });
        return res.status(500).json({
          message: 'Failed to save donation to database',
          error: mongoError.message || 'MongoDB error',
        });
      }
    } catch (err) {
      console.error('Donation route error:', {
        message: err.message,
        stack: err.stack,
      });
      res.status(500).json({
        message: 'Internal Server Error',
        error: err.message || 'Unknown error',
      });
    }
  });
});

module.exports = router;
