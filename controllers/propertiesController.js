const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const cloud = require('../utils/cloud');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Property = require('../models/propertyModel');
const Counter = require('../models/counterModel');

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
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
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
  const { fileTypeFromBuffer } = await import('file-type');

  if (!req.files || req.files.length === 0) return next();

  const { category } = req.body;

  const folderPath = `Orca/العقارات/${category}`;

  const uploadPromises = req.files.map(async (file) => {
    // 1) تحقق من نوع الملف عن طريق تحليل محتوي الملف
    const fileType = await fileTypeFromBuffer(file.buffer);
    if (!fileType || !['image/jpeg', 'image/png'].includes(fileType.mime)) {
      throw new AppError('نوع الصورة غير مدعوم', 400);
    }

    // 2) نظف الصورة
    const imageBuffer = await sharp(file.buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toBuffer();

    // 3) اسم عشوائي آمن
    const uniqueFileName = uuidv4();

    const result = await uploadToCloudinary(
      imageBuffer,
      uniqueFileName,
      folderPath,
    );

    return result.secure_url;
  });

  const uploadedImages = await Promise.allSettled(uploadPromises);

  // Add image URLs to req.body
  req.body.photos = uploadedImages
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);

  next();
});
// ***********************************************************************************

// Create property
exports.addProperty = catchAsync(async (req, res, next) => {
  const exists = await Property.findOne({
    userId: req.user.id,
    region: req.body.region.toLowerCase(),
    unit: req.body.unit.toLowerCase(),
    floor: req.body.floor,
    price: req.body.price,
  });
  if (exists) {
    return res.status(400).json({
      status: 'fail',
      message: 'هذا العقار مضاف مسبقاً.',
    });
  }

  const counter = await Counter.findOneAndUpdate(
    { name: 'propertyNumber' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  const property = await Property.create({
    userId: req.user.id,
    propertyNumber: counter.seq,
    ...req.body,
  });

  res.status(201).json({
    status: 'success',
    data: {
      property,
    },
  });
});

// get all properties for home
exports.getAllProperties = catchAsync(async (req, res, next) => {
  const properties = await Property.find()
    .select(
      'description location category typeOfProcess price area propertyNumber numOfBedrooms numOfBathrooms userId',
    )
    .populate({
      path: 'userId',
      select: 'fullName',
    });

  res.status(200).json({
    status: 'success',
    results: properties.length,
    data: properties,
  });
});

// get one property by id
exports.getPropertyById = catchAsync(async (req, res, next) => {
  const userRole = req.user.accountType;

  let query = Property.findById(req.params.id).populate({
    path: 'userId',
    select: 'fullName',
  });

  if (userRole === 'عميل' || userRole === 'محرر') {
    query = query.select('-unit -region -ownerNumber -secondOwnerNumber');
  }

  const property = await query;

  if (!property) {
    return res.status(404).json({
      status: 'fail',
      message: 'العقار غير موجود',
    });
  }

  res.status(200).json({
    status: 'success',
    data: property,
  });
});

// update a property
exports.updateProperty = catchAsync(async (req, res, next) => {
  const propertyId = req.params.id;

  const updatedProperty = await Property.findByIdAndUpdate(
    propertyId,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedProperty) {
    return res.status(404).json({
      status: 'fail',
      message: 'العقار غير موجود',
    });
  }

  res.status(200).json({
    status: 'success',
    data: updatedProperty,
  });
});

// delete a property
exports.deleteProperty = catchAsync(async (req, res, next) => {
  const propertyId = req.params.id;

  const deleted = await Property.findByIdAndDelete(propertyId);

  if (!deleted) {
    return res.status(404).json({
      status: 'fail',
      message: 'العقار غير موجود',
    });
  }

  res.status(204).json({
    status: 'success',
    message: 'تم حذف العقار بنجاح',
  });
});
