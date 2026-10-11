const express = require('express');
const foodController = require('../controllers/food.controllers');
const authMiddleware = require("../middlewares/auth.middleware");
const multer = require('multer');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB video limit
});

/* ============================= */
/*          PUBLIC ROUTES        */
/* ============================= */

// GET /api/food  → Public (home page food list with optional user like/save enrichment)
router.get("/", authMiddleware.optionalAuthUserMiddleware, foodController.getFoodItems);

// POST /api/food/recommend → AI-Powered Recommendation Engine
router.post("/recommend", authMiddleware.optionalAuthUserMiddleware, foodController.getRecommendations);

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

// POST /api/food/generate-description → AI description (food partner only, must be before /:id)
router.post("/generate-description",
    authMiddleware.authFoodPartnerMiddleware,
    foodController.generateDescription
);

const handleUpload = (req, res, next) => {
    upload.single("video")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: "Video file exceeds 100MB limit. Please choose a smaller video." });
            }
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: err.message || "File upload failed" });
        }
        next();
    });
};

// POST /api/food  → Only Food Partner can create food
router.post("/",
    authMiddleware.authFoodPartnerMiddleware,
    handleUpload,
    foodController.createFood
);

/* ============================= */
/*   PARAMETERISED PUBLIC ROUTE  */
/* ============================= */

// GET /api/food/:id  → Public (single food item) — must be LAST
router.get("/:id", authMiddleware.optionalAuthUserMiddleware, foodController.getFoodItemById);

module.exports = router;
