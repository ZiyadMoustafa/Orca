const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const User = require('../models/userModel');
const Property = require('../models/propertyModel');

exports.getAllClients = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const existClients = await User.find({ accountType: 'عميل' })
    .skip(skip)
    .limit(limit);

  if (!existClients || existClients.length === 0)
    return next(new AppError('لا يوجد عملاء في الوقت الحالي', 404));

  res.status(200).json({
    status: 'success',
    result: existClients.length,
    Clients: existClients,
  });
});

exports.getAllEditors = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const existEditors = await User.find({ accountType: 'محرر' })
    .skip(skip)
    .limit(limit);

  if (!existEditors || existEditors.length === 0)
    return next(new AppError('لا يوجد محررين في الوقت الحالي', 404));

  res.status(200).json({
    status: 'success',
    result: existEditors.length,
    Editors: existEditors,
  });
});

exports.getAllRequestsOfCreateAdminAcc = catchAsync(async (req, res, next) => {
  const suspendedAdmin = await User.find({
    accountType: 'مسؤول النظام',
    status: 'pending',
  });

  if (!suspendedAdmin || suspendedAdmin.length === 0)
    return next(
      new AppError('لا يوجد مسؤولين نظام مسجلين في الوقت الحالي', 404),
    );

  res.status(200).json({
    status: 'success',
    result: suspendedAdmin.length,
    Admins: suspendedAdmin,
  });
});

exports.respondOfRequests = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const existAdmin = await User.findById(req.params.id);

  if (!existAdmin) return next(new AppError('لا يوجد هذا المستخدم', 404));

  existAdmin.status = status;

  if (existAdmin.status === 'reject') {
    await User.findByIdAndDelete(req.params.id);
  } else {
    await existAdmin.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: 'success',
  });
});

exports.getTotalNum = catchAsync(async (req, res, next) => {
  const existClients = await User.countDocuments({ accountType: 'عميل' });
  const existEditors = await User.countDocuments({ accountType: 'محرر' });
  const existAdmin = await User.countDocuments({
    accountType: 'مسؤول النظام',
    status: 'accept',
  });
  const waitAdmin = await User.countDocuments({
    accountType: 'مسؤول النظام',
    status: 'pending',
  });

  const allProperties = await Property.countDocuments();

  res.status(200).json({
    status: 'success',
    Clients: existClients,
    Editors: existEditors,
    Admins: existAdmin,
    SuspendedAdmin: waitAdmin,
    Properties: allProperties,
  });
});
