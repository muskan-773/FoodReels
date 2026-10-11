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

        const { name, description, cuisine, dietaryTags, price, videoUrl } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Food name is required" });
        }

        let uploadedVideoUrl = videoUrl;

        if (req.file) {
            const fileUploadResult = await storageService.uploadFile(
                req.file.buffer,
                req.file.originalname,
                req
            );
            uploadedVideoUrl = fileUploadResult.url;
        }

        if (!uploadedVideoUrl) {
            return res.status(400).json({ message: "Video file or videoUrl is required" });
        }

        // Parse dietaryTags if sent as comma-separated or JSON
        let parsedTags = [];
        if (Array.isArray(dietaryTags)) {
            parsedTags = dietaryTags;
        } else if (typeof dietaryTags === 'string' && dietaryTags.trim()) {
            try {
                parsedTags = JSON.parse(dietaryTags);
            } catch (e) {
                parsedTags = dietaryTags.split(',').map(t => t.trim()).filter(Boolean);
            }
        }

        const foodItem = await foodModel.create({
            name: name.trim(),
            description: (description || '').trim(),
            cuisine: (cuisine || 'General').trim(),
            dietaryTags: parsedTags,
            price: Number(price) || 0,
            video: uploadedVideoUrl,
            foodPartner: req.foodPartner._id
        });

        res.status(201).json({
            message: "Food reel created successfully",
            food: foodItem
        });
    } catch (error) {
        console.error("Create food error:", error);
        res.status(500).json({ message: "Server error while creating food reel" });
    }
}

async function getFoodItems(req, res) {
    try {
        const { cuisine, search, limit = 30, page = 1 } = req.query;
        const queryFilter = {};

        if (cuisine && cuisine !== 'All') {
            queryFilter.cuisine = new RegExp(`^${cuisine}$`, 'i');
        }

        if (search && search.trim()) {
            queryFilter.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } },
                { cuisine: { $regex: search.trim(), $options: 'i' } },
                { dietaryTags: { $in: [new RegExp(search.trim(), 'i')] } }
            ];
        }

        const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(50, parseInt(limit));
        const foodItems = await foodModel
            .find(queryFilter)
            .populate('foodPartner', 'name address phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Math.min(50, parseInt(limit)));

        // Enrich with user like/save states if authenticated
        let userLikedIds = new Set();
        let userSavedIds = new Set();

        if (req.user && req.user._id) {
            const foodIds = foodItems.map(f => f._id);
            const [likes, saves] = await Promise.all([
                likeModel.find({ user: req.user._id, food: { $in: foodIds } }),
                saveModel.find({ user: req.user._id, food: { $in: foodIds } })
            ]);
            userLikedIds = new Set(likes.map(l => l.food.toString()));
            userSavedIds = new Set(saves.map(s => s.food.toString()));
        }

        const enrichedItems = foodItems.map(item => {
            const obj = item.toObject();
            return {
                ...obj,
                isLiked: userLikedIds.has(item._id.toString()),
                isSaved: userSavedIds.has(item._id.toString())
            };
        });

        res.status(200).json({
            message: "Food items fetched successfully",
            total: enrichedItems.length,
            foodItems: enrichedItems
        });
    } catch (error) {
        console.error("Get food items error:", error);
        res.status(500).json({ message: "Server error while fetching food items" });
    }
}

async function likeFood(req, res) {
    try {
        const { foodId } = req.body;
        const user = req.user;

        if (!foodId) {
            return res.status(400).json({ message: "foodId is required" });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        const isAlreadyLiked = await likeModel.findOne({ user: user._id, food: foodId });

        if (isAlreadyLiked) {
            await likeModel.deleteOne({ user: user._id, food: foodId });
            const updated = await foodModel.findByIdAndUpdate(
                foodId,
                { $inc: { likeCount: -1 } },
                { new: true }
            );
            const count = Math.max(0, updated?.likeCount ?? 0);
            if (updated && updated.likeCount < 0) {
                await foodModel.findByIdAndUpdate(foodId, { $set: { likeCount: 0 } });
            }
            return res.status(200).json({ message: "Food unliked successfully", like: false, likeCount: count });
        }

        await likeModel.create({ user: user._id, food: foodId });
        const updated = await foodModel.findByIdAndUpdate(
            foodId,
            { $inc: { likeCount: 1 } },
            { new: true }
        );

        res.status(200).json({
            message: "Food liked successfully",
            like: true,
            likeCount: updated.likeCount
        });
    } catch (error) {
        console.error("Like food error:", error);
        res.status(500).json({ message: "Server error while toggling like" });
    }
}

async function saveFood(req, res) {
    try {
        const { foodId } = req.body;
        const user = req.user;

        if (!foodId) {
            return res.status(400).json({ message: "foodId is required" });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        const isAlreadySaved = await saveModel.findOne({ user: user._id, food: foodId });

        if (isAlreadySaved) {
            await saveModel.deleteOne({ user: user._id, food: foodId });
            const updated = await foodModel.findByIdAndUpdate(
                foodId,
                { $inc: { savesCount: -1 } },
                { new: true }
            );
            const count = Math.max(0, updated?.savesCount ?? 0);
            if (updated && updated.savesCount < 0) {
                await foodModel.findByIdAndUpdate(foodId, { $set: { savesCount: 0 } });
            }
            return res.status(200).json({ message: "Food removed from saved", save: false, savesCount: count });
        }

        await saveModel.create({ user: user._id, food: foodId });
        const updated = await foodModel.findByIdAndUpdate(
            foodId,
            { $inc: { savesCount: 1 } },
            { new: true }
        );

        res.status(200).json({
            message: "Food saved successfully",
            save: true,
            savesCount: updated.savesCount
        });
    } catch (error) {
        console.error("Save food error:", error);
        res.status(500).json({ message: "Server error while toggling save" });
    }
}

async function getSaveFood(req, res) {
    try {
        const user = req.user;
        const savedDocs = await saveModel
            .find({ user: user._id })
            .populate({
                path: 'food',
                populate: { path: 'foodPartner', select: 'name address phone' }
            })
            .sort({ createdAt: -1 });

        // Safely filter out records where the referenced food may have been deleted
        const validSavedFoods = savedDocs
            .filter(item => item && item.food)
            .map(item => ({
                _id: item.food._id,
                name: item.food.name,
                video: item.food.video,
                description: item.food.description,
                cuisine: item.food.cuisine || 'General',
                dietaryTags: item.food.dietaryTags || [],
                likeCount: item.food.likeCount || 0,
                savesCount: item.food.savesCount || 0,
                commentsCount: item.food.commentsCount || 0,
                foodPartner: item.food.foodPartner,
                isSaved: true,
                savedAt: item.createdAt
            }));

        res.status(200).json({
            message: "Saved foods retrieved successfully",
            savedFoods: validSavedFoods
        });
    } catch (error) {
        console.error("Get saved foods error:", error);
        res.status(500).json({ message: "Server error while fetching saved foods" });
    }
}

async function getFoodItemById(req, res) {
    try {
        const food = await foodModel
            .findById(req.params.id)
            .populate('foodPartner', 'name address phone contactName');

        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        let isLiked = false;
        let isSaved = false;

        if (req.user && req.user._id) {
            const [like, save] = await Promise.all([
                likeModel.findOne({ user: req.user._id, food: food._id }),
                saveModel.findOne({ user: req.user._id, food: food._id })
            ]);
            isLiked = Boolean(like);
            isSaved = Boolean(save);
        }

        res.status(200).json({
            message: "Food item fetched successfully",
            food: {
                ...food.toObject(),
                isLiked,
                isSaved
            }
        });
    } catch (error) {
        console.error("Get food item error:", error);
        res.status(500).json({ message: "Server error while fetching food item" });
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

        res.status(200).json({
            success: true,
            description
        });
    } catch (error) {
        console.error("AI description generation error:", error.message);
        res.status(500).json({ message: "Failed to generate description. Please try again." });
    }
}

/**
 * AI Recommendation Endpoint
 * POST /api/food/recommend
 * Body: { query?: string, dietaryPreferences?: string[], cuisine?: string }
 */
async function getRecommendations(req, res) {
    try {
        const { query = "", dietaryPreferences = [], cuisine = "" } = req.body;

        // Fetch current active foods from database
        const availableFoods = await foodModel
            .find({})
            .populate('foodPartner', 'name address')
            .sort({ likeCount: -1, createdAt: -1 })
            .limit(50);

        if (availableFoods.length === 0) {
            return res.status(200).json({
                success: true,
                recommendations: [],
                aiGenerated: false,
                summary: "No food reels available yet. Check back soon!"
            });
        }

        // Get user's liked foods if logged in for personalized context
        let userLikedFoods = [];
        if (req.user && req.user._id) {
            const userLikes = await likeModel.find({ user: req.user._id }).populate('food');
            userLikedFoods = userLikes.map(l => l.food).filter(Boolean);
        }

        const result = await aiService.recommendFoods({
            query,
            dietaryPreferences,
            cuisine,
            userLikedFoods,
            availableFoods
        });

        // Enrich with user like & save status if user is logged in
        let userLikedIds = new Set();
        let userSavedIds = new Set();
        if (req.user && req.user._id) {
            const [likes, saves] = await Promise.all([
                likeModel.find({ user: req.user._id }),
                saveModel.find({ user: req.user._id })
            ]);
            userLikedIds = new Set(likes.map(l => l.food.toString()));
            userSavedIds = new Set(saves.map(s => s.food.toString()));
        }

        const enrichedRecommendations = result.recommendations.map(food => ({
            ...food,
            isLiked: userLikedIds.has(food._id.toString()),
            isSaved: userSavedIds.has(food._id.toString())
        }));

        res.status(200).json({
            success: true,
            aiGenerated: result.aiGenerated,
            summary: result.summary,
            recommendations: enrichedRecommendations
        });
    } catch (error) {
        console.error("Recommendation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate food recommendations. Please try again."
        });
    }
}

module.exports = {
    createFood,
    getFoodItems,
    getFoodItemById,
    generateDescription,
    getRecommendations,
    likeFood,
    saveFood,
    getSaveFood
};
