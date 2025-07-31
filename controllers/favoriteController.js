const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Property = require('../models/propertyModel');
const Favorite = require('../models/favoriteModel');

exports.addToFavorites = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { propertyId } = req.body;

  //   check if property exist
  const property = await Property.findById(propertyId);
  if (!property) return next(new AppError('العقار غير موجود', 404));

  //   check if property added
  const alreadyExists = await Favorite.findOne({
    user: userId,
    property: propertyId,
  });
  if (alreadyExists)
    return next(new AppError('تمت إضافة هذا العقار إلى المفضلة مسبقًا', 400));

  // add certain prpoerty to fav
  const favorite = await Favorite.create({
    user: userId,
    property: propertyId,
  });

  res.status(201).json({
    status: 'success',
    message: 'تمت إضافة العقار إلى المفضلة',
    data: {
      favorite,
    },
  });
});

exports.getMyFavorites = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const favorites = await Favorite.find({ user: userId }).populate({
    path: 'property',
    select: 'description price area numOfBedrooms numOfBathrooms city photos',
  });

  res.status(200).json({
    status: 'success',
    results: favorites.length,
    data: {
      favorites,
    },
  });
});

exports.removeFromFavorites = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { propertyId } = req.params;

  const deleted = await Favorite.findOneAndDelete({
    user: userId,
    property: propertyId,
  });

  if (!deleted) {
    return next(new AppError('العقار غير موجود في المفضلة', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'تمت إزالة العقار من المفضلة',
  });
});
