const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// const crypto = require('crypto');
const _ = require('lodash');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please enter your full name'],
      trim: true,
    },
    username: { type: String },
    email: {
      type: String,
      required: true,
      validate: [validator.isEmail, 'Please enter a valid email'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      validate: {
        validator: function (el) {
          return validator.isMobilePhone(el);
        },
        message: 'Invalid phone number format',
      },
    },

    password: {
      type: String,
      required: [true, 'fill password field'],
      minlength: [8, 'Password must be above 8 characters'],
      maxlength: [20, 'Password must be below 20 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'fill passwordConfirm field'],
      validate: {
        validator: function (el) {
          return el === this.password; // --> return false or true
        },
        message: 'Passwords are not the same',
      },
    },
    accountType: {
      type: String,
      required: true,
      enum: ['عميل', 'محرر', 'مسؤول النظام'],
    },
    status: {
      type: String,
      enum: ['pending', 'accept', 'reject'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        return _.omit(ret, ['__v', 'password', 'passwordChangedAt']);
      },
    },
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.pre('save', function (next) {
  this.username = this.fullName.split(' ')[0];
  next();
});

userSchema.methods.correctPassword = async function (
  bodyPassword,
  userPassword,
) {
  return await bcrypt.compare(bodyPassword, userPassword);
};
userSchema.methods.changePasswordAfter = function (JWTTimestamps) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamps < changedTimestamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
