const foodPartnerModel = require('../models/foodpartner.model');
const foodModel = require('../models/food.model');
const bcrypt = require('bcryptjs');

async function getFoodPartnerById(req, res) {
    try {
        const foodPartnerId = req.params.id;
        const foodPartner = await foodPartnerModel.findById(foodPartnerId);
        const foodItemsByFoodPartner = await foodModel.find({ foodPartner: foodPartnerId });

        if (!foodPartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        res.status(200).json({
            message: "Food partner retrieved successfully",
            foodPartner: {
                ...foodPartner.toObject(),
                password: undefined, // never expose password
                foodItems: foodItemsByFoodPartner
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
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
            const isValid = await bcrypt.compare(currentPassword, foodPartner.password);
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
        );

        res.status(200).json({
            message: "Profile updated successfully",
            foodPartner: {
                _id: updated._id,
                name: updated.name,
                contactName: updated.contactName,
                email: updated.email,
                phone: updated.phone,
                address: updated.address,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    getFoodPartnerById,
    updateFoodPartner,
};
