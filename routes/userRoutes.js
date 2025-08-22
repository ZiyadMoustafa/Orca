const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.use(authController.protect);

router.get(
  '/getAllClients',
  authController.restrictTo('مسؤول النظام'),
  userController.getAllClients,
);
router.get(
  '/getAllEditors',
  authController.restrictTo('مسؤول النظام'),
  userController.getAllEditors,
);
router.get(
  '/getAllSuspendedAdmins',
  authController.restrictTo('مسؤول النظام'),
  userController.getAllRequestsOfCreateAdminAcc,
);
router.patch(
  '/respondOfRequests/:id',
  authController.restrictTo('مسؤول النظام'),
  userController.respondOfRequests,
);
router.get(
  '/totalNum',
  authController.restrictTo('مسؤول النظام'),
  userController.getTotalNum,
);

router.delete(
  '/deleteAccount/:id',
  authController.restrictTo('مسؤول النظام'),
  userController.deleteAccount,
);

module.exports = router;
