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
  },
  region: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  typeOfProcess: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  totalPrice: {
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
    required: true,
  },
  landArea: {
    type: String,
  },
  buildingArea: {
    type: String,
  },
  numOfBedrooms: {
    type: String,
    required: true,
  },
  numOfBathrooms: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
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
    validate: {
      validator: function (el) {
        return validator.isMobilePhone(el, 'ar-EG');
      },
      message: 'Invalid Egyptian phone number format',
    },
  },
  codeOfProperty: {
    type: String,
  },
});

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;
