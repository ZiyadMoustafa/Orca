const express = require('express');

const authController = require('../controllers/authController');
const favoriteController = require('../controllers/favoriteController');

const router = express.Router();

router.use(authController.protect);

router.post('/addToFavorites/:id', favoriteController.addToFavorites);
router.get('/myFavorites', favoriteController.getMyFavorites);
router.delete('/remove/:id', favoriteController.removeFromFavorites);

module.exports = router;
