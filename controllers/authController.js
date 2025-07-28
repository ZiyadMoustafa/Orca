// const fs = require('fs');
// const path = require('path');
const { promisify } = require('util');

// const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const User = require('../models/userModel');

// create token
const signToken = (id, accountType) =>
  jwt.sign({ userId: id, accountType: accountType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// send token in cookie
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.accountType);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: 'None',
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
      token,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const {
    fullName,
    email,
    mobileNumber,
    password,
    passwordConfirm,
    accountType,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError('المستخدم موجود بالفعل', 400));

  let newUser;
  if (accountType === 'عميل' || accountType === 'محرر') {
    newUser = await User.create({
      fullName,
      email,
      mobileNumber,
      password,
      passwordConfirm,
      accountType,
      status: 'accept',
    });

    createSendToken(newUser, 200, res);
  } else {
    newUser = await User.create({
      fullName,
      email,
      mobileNumber,
      password,
      passwordConfirm,
      accountType,
      status: 'pending',
    });

    res.status(201).json({
      status: 'success',
      message: 'تم إنشاء الحساب بنجاح. برجاء انتظار الموافقة من الإدارة.',
    });
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and passowrd exist
  if (!email || !password) {
    return next(new AppError('يرجى إدخال البريد الإلكتروني وكلمة المرور', 400));
  }

  // 2) check if client exist and password correct
  const user = await User.findOne({ email }).select('+password');

  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return next(
      new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401),
    );
  }

  // 3) check account type
  if (user.accountType === 'مسؤول النظام' && user.status === 'pending') {
    return next(
      new AppError(
        'لا يمكنك تسجيل الدخول حاليًا. حسابك قيد المراجعة من قبل الإدارة',
        400,
      ),
    );
  }

  // 4) if everything is ok , send response
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// function for Authoraization
exports.restrictTo =
  (...accountTypes) =>
  (req, res, next) => {
    if (!accountTypes.includes(req.user.accountType)) {
      return next(new AppError('ليس لديك الصلاحية للقيام بهذا الإجراء', 403));
    }
    next();
  };

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError(
        'لم تقم بتسجيل الدخول، من فضلك سجّل دخولك للوصول الي هذه الخدمة',
        401,
      ),
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exist
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) return next(new AppError('المستخدم لم يعد موجود', 400));

  // 4) check if password chaged after create token
  if (currentUser.changePasswordAfter(decoded.iat))
    return next(
      new AppError(
        'تم تغيير كلمة المرور من قريب , برجاء تسجيل الدخول مرة اخري',
        401,
      ),
    );

  req.user = currentUser;
  next();
});
