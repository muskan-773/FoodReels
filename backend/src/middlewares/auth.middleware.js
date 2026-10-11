const foodPartnerModel = require("../models/foodpartner.model");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "foodreels-secure-secret-2026";

function extractToken(req, cookieName) {
    // 1. Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.split(" ")[1].trim();
    }
    // 2. HTTP-only cookie
    if (req.cookies && req.cookies[cookieName]) {
        return req.cookies[cookieName];
    }
    return null;
}

async function authFoodPartnerMiddleware(req, res, next) {
    const token = extractToken(req, "foodPartnerToken");

    if (!token) {
        return res.status(401).json({
            message: "Authentication required. Please log in as a food partner."
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const foodPartner = await foodPartnerModel.findById(decoded.id).select("-password");

        if (!foodPartner) {
            return res.status(401).json({
                message: "Food partner account not found. Please log in again."
            });
        }

        req.foodPartner = foodPartner;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired session. Please log in again."
        });
    }
}

async function authUserMiddleware(req, res, next) {
    const token = extractToken(req, "userToken");

    if (!token) {
        return res.status(401).json({
            message: "Authentication required. Please log in."
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User account not found. Please log in again."
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired session. Please log in again."
        });
    }
}

// Optional user auth: if logged in, attaches req.user; otherwise proceeds with req.user = null
async function optionalAuthUserMiddleware(req, res, next) {
    const token = extractToken(req, "userToken");

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("-password");
        req.user = user || null;
    } catch (err) {
        req.user = null;
    }
    next();
}

module.exports = {
    authFoodPartnerMiddleware,
    authUserMiddleware,
    optionalAuthUserMiddleware
};