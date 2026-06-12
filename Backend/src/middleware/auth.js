const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {

    // ── Step 1: Extract token ──────────────────────
    const token = req.cookies?.token || 
                  req.headers?.authorization?.replace("Bearer ", "");


    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // ── Step 2: Verify JWT signature ───────────────
    let decoded;
    try {
      decoded = jwt.verify(token, 
        process.env.JWT_SECRET
      );
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again.",
        });
      }
      return res.status(403).json({
        success: false,
        message: "Invalid token.",
      });
    }

    // ── Step 3: Find user in database ─────────────
    const user = await User.findById(decoded._id).select("-password -tokens");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // ── Step 5: Attach user & proceed ─────────────
    req.user = user;
    next();

  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = authMiddleware;