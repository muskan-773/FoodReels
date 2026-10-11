const userModel = require("../models/user.model");
const foodPartnerModel = require("../models/foodpartner.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'foodreels-secure-secret-2026';
const JWT_OPTIONS = { expiresIn: '7d' };

const getCookieOptions = () => {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
};

async function registerUser(req, res) {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Full name, email, and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const isUserAlreadyExists = await userModel.findOne({ email: normalizedEmail });
        if (isUserAlreadyExists) {
            return res.status(400).json({ message: "An account with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, JWT_OPTIONS);

        res.cookie("userToken", token, getCookieOptions());

        res.status(201).json({
            message: "User registered successfully",
            token,
            role: 'user',
            user: { _id: user._id, email: user.email, fullName: user.fullName }
        });
    } catch (err) {
        console.error("Register user error:", err);
        res.status(500).json({ message: "Server error during registration. Please try again." });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await userModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, JWT_OPTIONS);

        res.cookie("userToken", token, getCookieOptions());

        res.status(200).json({
            message: "User logged in successfully",
            token,
            role: 'user',
            user: { _id: user._id, email: user.email, fullName: user.fullName }
        });
    } catch (err) {
        console.error("Login user error:", err);
        res.status(500).json({ message: "Server error during login. Please try again." });
    }
}

function logoutUser(req, res) {
    res.clearCookie("userToken", getCookieOptions());
    res.status(200).json({ message: "User logged out successfully" });
}

async function registerFoodPartner(req, res) {
    try {
        const { name, email, password, phone, address, contactName } = req.body;

        if (!name || !email || !password || !phone || !address || !contactName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const isAccountAlreadyExists = await foodPartnerModel.findOne({ email: normalizedEmail });
        if (isAccountAlreadyExists) {
            return res.status(400).json({ message: "A food partner with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const foodPartner = await foodPartnerModel.create({
            name: name.trim(),
            contactName: contactName.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            address: address.trim(),
            password: hashedPassword
        });

        const token = jwt.sign({ id: foodPartner._id, role: 'foodPartner' }, JWT_SECRET, JWT_OPTIONS);

        res.cookie("foodPartnerToken", token, getCookieOptions());

        res.status(201).json({
            message: "Food partner registered successfully",
            token,
            role: 'foodPartner',
            foodPartner: {
                _id: foodPartner._id,
                email: foodPartner.email,
                name: foodPartner.name,
                contactName: foodPartner.contactName,
                address: foodPartner.address,
                phone: foodPartner.phone
            }
        });
    } catch (err) {
        console.error("Register food partner error:", err);
        res.status(500).json({ message: "Server error during partner registration. Please try again." });
    }
}

async function loginFoodPartner(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const foodPartner = await foodPartnerModel.findOne({ email: normalizedEmail });
        if (!foodPartner) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, foodPartner.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: foodPartner._id, role: 'foodPartner' }, JWT_SECRET, JWT_OPTIONS);

        res.cookie("foodPartnerToken", token, getCookieOptions());

        res.status(200).json({
            message: "Food partner logged in successfully",
            token,
            role: 'foodPartner',
            foodPartner: {
                _id: foodPartner._id,
                email: foodPartner.email,
                name: foodPartner.name,
                contactName: foodPartner.contactName,
                address: foodPartner.address,
                phone: foodPartner.phone
            }
        });
    } catch (err) {
        console.error("Login food partner error:", err);
        res.status(500).json({ message: "Server error during partner login. Please try again." });
    }
}

function logoutFoodPartner(req, res) {
    res.clearCookie("foodPartnerToken", getCookieOptions());
    res.status(200).json({ message: "Food partner logged out successfully" });
}

function getMe(req, res) {
    const user = req.user;
    res.status(200).json({
        role: 'user',
        user: { _id: user._id, fullName: user.fullName, email: user.email }
    });
}

function getFoodPartnerMe(req, res) {
    const fp = req.foodPartner;
    res.status(200).json({
        role: 'foodPartner',
        foodPartner: {
            _id: fp._id,
            name: fp.name,
            contactName: fp.contactName,
            email: fp.email,
            phone: fp.phone,
            address: fp.address
        }
    });
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    registerFoodPartner,
    loginFoodPartner,
    logoutFoodPartner,
    getFoodPartnerMe
};
