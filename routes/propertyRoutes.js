const express = require('express');

const authController = require('../controllers/authController');
const propertyController = require('../controllers/propertiesController');

const router = express.Router();

router.use(authController.protect);

router.post(
  '/AddPropertyFromAdmin',
  authController.restrictTo('مسؤول النظام'),
  propertyController.uploadPhoto,
  propertyController.resizePhotosAndUpload,
  propertyController.addPropertyFromAdmin,
);
router.post(
  '/AddPropertyFromEditor',
  authController.restrictTo('محرر'),
  propertyController.uploadPhoto,
  propertyController.resizePhotosAndUpload,
  propertyController.addPropertyFromEditor,
);
router.get('/getAllProperties', propertyController.getAllProperties);
router.get('/getPropertyById/:id', propertyController.getPropertyById);

router.patch(
  '/updateProperty/:id',
  authController.restrictTo('مسؤول النظام', 'محرر'),
  propertyController.updateProperty,
);
router.delete(
  '/deleteProperty/:id',
  authController.restrictTo('مسؤول النظام', 'محرر'),
  propertyController.deleteProperty,
);

module.exports = router;
