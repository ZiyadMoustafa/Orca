const multer = require('multer');
const sharp = require('sharp');
const cloud = require('../utils/cloud');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// ***********************************************************************************
const multerStorage = multer.memoryStorage();

// File filter to allow only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only images are allowed!', 404), false);
  }
};

// Multer configuration
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.array('photos');

const uploadToCloudinary = (buffer, filename, folderPath) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloud.uploader.upload_stream(
      {
        folder: folderPath,
        public_id: filename,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );
    uploadStream.end(buffer);
  });

// Middleware to Process and Upload Image to Cloudinary
exports.resizePhotosAndUpload = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  const type = req.body.type;

  const folderPath = `Orca/العقارات/${type}`;

  const uploadPromises = req.files.map(async (file) => {
    const imageBuffer = await sharp(file.buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const result = await uploadToCloudinary(
      imageBuffer,
      file.originalname,
      folderPath,
    );

    return result.secure_url;
  });

  const uploadedImages = await Promise.all(uploadPromises);

  // Add image URLs to req.body
  req.body.photos = uploadedImages;

  next();
});
// ***********************************************************************************

// Create properties
// Read all properties
// get one property by id
// update a property
// delete a property
