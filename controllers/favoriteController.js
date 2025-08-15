const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Property = require('../models/propertyModel');
const Favorite = require('../models/favoriteModel');

exports.addToFavorites = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  //   check if property exist
  const property = await Property.findById(req.params.id);
  if (!property) return next(new AppError('العقار غير موجود', 404));

  //   check if property added
  const alreadyExists = await Favorite.findOne({
    user: userId,
    property: req.params.id,
  });
  if (alreadyExists)
    return next(new AppError('تمت إضافة هذا العقار إلى المفضلة مسبقًا', 400));

  // add certain prpoerty to fav
  await Favorite.create({
    user: userId,
    property: req.params.id,
  });

  res.status(201).json({
    status: 'success',
    message: 'تمت إضافة العقار إلى المفضلة',
  });
});

exports.getMyFavorites = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const favorites = await Favorite.find({ user: userId })
    .populate({
      path: 'property',
      select:
        'description location category typeOfProcess price area CodeOfProperty numOfBedrooms numOfBathrooms',
    })
    .populate({
      path: 'user',
      select: 'fullName',
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

  const deleted = await Favorite.findOneAndDelete({
    user: userId,
    property: req.params.id,
  });

  if (!deleted) {
    return next(new AppError('العقار غير موجود في المفضلة', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'تمت إزالة العقار من المفضلة',
  });
});
