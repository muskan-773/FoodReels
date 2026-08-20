const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");
const aiService = require("../services/ai.service");


async function createFood(req, res) {
    try {
        if (!req.foodPartner) {
            return res.status(401).json({ message: "Food partner not authenticated" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Video file is required" });
        }

        const fileUploadResult = await storageService.uploadFile(
            req.file.buffer,
            req.file.originalname
        );

        const foodItem = await foodModel.create({
            name: req.body.name,
            description: req.body.description || '',
            video: fileUploadResult.url,
            foodPartner: req.foodPartner._id
        });

        res.status(201).json({
            message: "Food created successfully",
            food: foodItem
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}


async function getFoodItems(req, res) {
    try {
        const foodItems = await foodModel
            .find({})
            .populate('foodPartner', 'name address')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Food items fetched successfully",
            foodItems
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}


async function likeFood(req, res) {
    try {
        const { foodId } = req.body;
        const user = req.user;

        if (!foodId) {
            return res.status(400).json({ message: "foodId is required" });
        }

        const isAlreadyLiked = await likeModel.findOne({ user: user._id, food: foodId });

        if (isAlreadyLiked) {
            await likeModel.deleteOne({ user: user._id, food: foodId });
            await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: -1 } });
            return res.status(200).json({ message: "Food unliked successfully", like: false });
        }

        await likeModel.create({ user: user._id, food: foodId });
        await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: 1 } });

        res.status(201).json({ message: "Food liked successfully", like: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}


async function saveFood(req, res) {
    try {
        const { foodId } = req.body;
        const user = req.user;

        if (!foodId) {
            return res.status(400).json({ message: "foodId is required" });
        }

        const isAlreadySaved = await saveModel.findOne({ user: user._id, food: foodId });

        if (isAlreadySaved) {
            await saveModel.deleteOne({ user: user._id, food: foodId });
            await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: -1 } });
            return res.status(200).json({ message: "Food unsaved successfully", save: false });
        }

        await saveModel.create({ user: user._id, food: foodId });
        await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: 1 } });

        res.status(201).json({ message: "Food saved successfully", save: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}


async function getSaveFood(req, res) {
    try {
        const user = req.user;
        const savedFoods = await saveModel.find({ user: user._id }).populate('food');

        // Return empty array — not a 404
        res.status(200).json({
            message: "Saved foods retrieved successfully",
            savedFoods: savedFoods || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}


async function getFoodItemById(req, res) {
    try {
        const food = await foodModel
            .findById(req.params.id)
            .populate('foodPartner', 'name address');

        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        res.status(200).json({ message: "Food item fetched successfully", food });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}


async function generateDescription(req, res) {
    try {
        const { foodName, category } = req.body;

        if (!foodName || !foodName.trim()) {
            return res.status(400).json({ message: "foodName is required" });
        }

        const description = await aiService.generateFoodDescription(
            foodName.trim(),
            category?.trim() || ""
        );

        res.status(200).json({ description });

    } catch (error) {
        console.error("AI generation error:", error.message);

        // Surface a clean message — never expose raw API errors
        if (error.message.includes("GEMINI_API_KEY")) {
            return res.status(500).json({ message: "AI service is not configured on this server." });
        }

        res.status(500).json({ message: "Failed to generate description. Please try again." });
    }
}


module.exports = {
    createFood,
    getFoodItems,
    getFoodItemById,
    generateDescription,
    likeFood,
    saveFood,
    getSaveFood
}
