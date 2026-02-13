const express = require('express');
const foodController = require('../controllers/food.controllers');
const authMiddleware = require("../middlewares/auth.middleware");
const multer = require('multer');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
});

/* ============================= */
/*          PUBLIC ROUTES        */
/* ============================= */

// GET /api/food  → Public (home page food list)
router.get("/", foodController.getFoodItems);


/* ============================= */
/*      FOOD PARTNER ROUTES     */
/* ============================= */

// POST /api/food  → Only Food Partner can create food
router.post("/",
    authMiddleware.authFoodPartnerMiddleware,
    upload.single("video"),
    foodController.createFood
);


/* ============================= */
/*         USER ROUTES           */
/* ============================= */

// Like food → Only logged in user
router.post("/like",
    authMiddleware.authUserMiddleware,
    foodController.likeFood
);

// Save food → Only logged in user
router.post("/save",
    authMiddleware.authUserMiddleware,
    foodController.saveFood
);

// Get saved foods → Only logged in user
router.get("/save",
    authMiddleware.authUserMiddleware,
    foodController.getSaveFood
);

module.exports = router;
