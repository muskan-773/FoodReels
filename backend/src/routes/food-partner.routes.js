const express = require('express');
const foodPartnerController = require("../controllers/food-partner.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// PUT /api/food-partner/profile  — edit own profile (must be BEFORE /:id)
router.put("/profile",
    authMiddleware.authFoodPartnerMiddleware,
    foodPartnerController.updateFoodPartner
);

// GET /api/food-partner/:id  — public profile
router.get("/:id", foodPartnerController.getFoodPartnerById);

module.exports = router;
