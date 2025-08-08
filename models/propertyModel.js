const mongoose = require('mongoose');
const validator = require('validator');

const propertySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  region: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  unit: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  typeOfProcess: {
    type: String,
    required: true,
  },
  detailsOfProcess: {
    type: String,
    required: true,
  },
  price: {
    type: String,
  },
  paidPrice: {
    type: String,
  },
  overPrice: {
    type: String,
  },
  area: {
    type: String,
  },
  landArea: {
    type: String,
  },
  buildingArea: {
    type: String,
  },
  numOfBedrooms: {
    type: String,
  },
  numOfBathrooms: {
    type: String,
  },
  floor: {
    type: String,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  photos: {
    type: [String],
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    validate: {
      validator: function (el) {
        return validator.isMobilePhone(el, 'ar-EG');
      },
      message: 'Invalid Egyptian phone number format',
    },
  },
  ownerNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    validate: {
      validator: function (el) {
        return validator.isMobilePhone(el, 'ar-EG');
      },
      message: 'Invalid Egyptian phone number format',
    },
  },
  secondOwnerNumber: {
    type: String,
    validate: {
      validator: function (el) {
        return validator.isMobilePhone(el, 'ar-EG');
      },
      message: 'Invalid Egyptian phone number format',
    },
  },
  propertyNumber: {
    type: Number,
  },
  CodeOfProperty: {
    type: Number,
  },
});

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;
