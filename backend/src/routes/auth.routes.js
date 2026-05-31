const express = require('express');
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")

const router = express.Router();

// user auth APIs
router.post('/user/register', authController.registerUser)
router.post('/user/login', authController.loginUser)
router.get('/user/logout', authController.logoutUser)
router.get('/user/me', authMiddleware.authUserMiddleware, authController.getMe)

// food partner auth APIs
router.post('/food-partner/register', authController.registerFoodPartner)
router.post('/food-partner/login', authController.loginFoodPartner)
router.get('/food-partner/logout', authController.logoutFoodPartner)
router.get('/food-partner/me', authMiddleware.authFoodPartnerMiddleware, authController.getFoodPartnerMe)

module.exports = router;