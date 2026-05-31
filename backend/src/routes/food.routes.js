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
/*         USER ROUTES           */
/* ============================= */

// Like food → Only logged in user
router.post("/like",
    authMiddleware.authUserMiddleware,
    foodController.likeFood
);

// Save / unsave food → Only logged in user
router.post("/save",
    authMiddleware.authUserMiddleware,
    foodController.saveFood
);

// Get saved foods → Only logged in user  (must be before /:id)
router.get("/save",
    authMiddleware.authUserMiddleware,
    foodController.getSaveFood
);


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
/*   PARAMETERISED PUBLIC ROUTE  */
/* ============================= */

// GET /api/food/:id  → Public (single food item) — must be LAST
router.get("/:id", foodController.getFoodItemById);


module.exports = router;
