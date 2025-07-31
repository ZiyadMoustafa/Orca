const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const User = require('../models/userModel');
const Property = require('../models/propertyModel');

exports.getAllClients = catchAsync(async (req, res, next) => {
  const existClients = await User.find({ accountType: 'عميل' });

  if (!existClients || existClients.length === 0)
    return next(new AppError('لا يوجد عملاء في الوقت الحالي', 404));

  res.status(200).json({
    status: 'success',
    result: existClients.length,
    Clients: existClients,
  });
});

exports.getAllEditors = catchAsync(async (req, res, next) => {
  const existEditors = await User.find({ accountType: 'محرر' });

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
  const existClients = await User.find({ accountType: 'عميل' });
  const existEditors = await User.find({ accountType: 'محرر' });
  const existAdmin = await User.find({
    accountType: 'مسؤول النظام',
    status: 'accept',
  });
  const waitAdmin = await User.find({
    accountType: 'مسؤول النظام',
    status: 'pending',
  });

  const allProperties = await Property.find();

  res.status(200).json({
    status: 'success',
    Clients: existClients.length,
    Editors: existEditors.length,
    Admins: existAdmin.length,
    SuspendedAdmin: waitAdmin.length,
    Properties: allProperties.length,
  });
});
