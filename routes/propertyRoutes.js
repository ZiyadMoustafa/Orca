const express = require('express');

const authController = require('../controllers/authController');
const propertyController = require('../controllers/propertiesController');

const router = express.Router();

router.use(authController.protect);

router.post(
  '/AddProperty',
  authController.restrictTo('مسؤول النظام', 'محرر'),
  propertyController.uploadPhoto,
  propertyController.resizePhotosAndUpload,
  propertyController.addProperty,
);

router.get('/getAllProperties', propertyController.getAllProperties);
router.get('/getPropertyById/:id', propertyController.getPropertyById);

router.patch(
  '/updateProperty/:id',
  authController.restrictTo('مسؤول النظام'),
  propertyController.updateProperty,
);
router.delete(
  '/deleteProperty/:id',
  authController.restrictTo('مسؤول النظام'),
  propertyController.deleteProperty,
);

module.exports = router;
