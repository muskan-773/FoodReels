const foodPartnerModel = require('../models/foodpartner.model');
const foodModel = require('../models/food.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function getFoodPartnerById(req, res) {
    try {
        const foodPartnerId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(foodPartnerId)) {
            return res.status(404).json({ message: "Invalid food partner ID" });
        }

        const foodPartner = await foodPartnerModel.findById(foodPartnerId).select('-password');
        if (!foodPartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        const foodItemsByFoodPartner = await foodModel.find({ foodPartner: foodPartnerId }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Food partner retrieved successfully",
            foodPartner: {
                ...foodPartner.toObject(),
                foodItems: foodItemsByFoodPartner
            }
        });
    } catch (err) {
        console.error("Get food partner error:", err);
        res.status(500).json({ message: "Server error while fetching food partner profile" });
    }
}

async function updateFoodPartner(req, res) {
    try {
        const foodPartner = req.foodPartner; // set by auth middleware
        const { name, contactName, phone, address, currentPassword, newPassword } = req.body;

        const updates = {};
        if (name?.trim())        updates.name        = name.trim();
        if (contactName?.trim()) updates.contactName = contactName.trim();
        if (phone?.trim())       updates.phone       = phone.trim();
        if (address?.trim())     updates.address     = address.trim();

        // password change — requires current password verification
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to set a new password" });
            }
            // Need password field from DB
            const partnerWithPass = await foodPartnerModel.findById(foodPartner._id);
            const isValid = await bcrypt.compare(currentPassword, partnerWithPass.password);
            if (!isValid) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters" });
            }
            updates.password = await bcrypt.hash(newPassword, 10);
        }

        const updated = await foodPartnerModel.findByIdAndUpdate(
            foodPartner._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            message: "Profile updated successfully",
            foodPartner: updated
        });
    } catch (err) {
        console.error("Update food partner error:", err);
        res.status(500).json({ message: "Server error while updating profile" });
    }
}

module.exports = {
    getFoodPartnerById,
    updateFoodPartner,
};
