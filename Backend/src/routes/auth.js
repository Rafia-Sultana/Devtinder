
const express = require("express");
const authRouter = express.Router();


const User = require("../models/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      emailId,
      password,
      age,
      gender,

    } = req.body;


    // ── 1. Validate required fields ──────────────
    if (!firstName || !lastName || !emailId || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and password are required.",
      });
    }

    // ── 2. Check if user already exists ──────────
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // ── 3. Hash the password ──────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── 4. Create & save user ─────────────────────
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      age,
      gender,
    });

    const savedUser = await user.save();

    // ── 5. Generate JWT token ─────────────────────
    const token = await savedUser.getJWT();

    // ── 6. Set cookie ─────────────────────────────
    res.cookie("token", token, {
      httpOnly: true,         // prevents XSS attacks
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "strict",     // prevents CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    // ── 7. Send response (never send password) ────
    const { password: _, ...userWithoutPassword } = savedUser.toObject();

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: userWithoutPassword,
    });

  } catch (err) {
    // Handle mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: messages,
      });
    }

    // Handle duplicate key error (emailId unique)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Signup error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    
    // ── 1. Validate required fields ──────────────
    if (!emailId || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // ── 2. Find user by email ─────────────────────
    const user = await User.findOne({ emailId });
    if (!user) {
      // Keep message vague to prevent user enumeration attack
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── 4. Compare password ───────────────────────
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts += 1;
      await user.save();

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── 5. Reset login attempts on success ────────
    user.loginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    // ── 6. Generate JWT token ─────────────────────
    const token = await user.getJWT();

    // ── 7. Set secure cookie ──────────────────────
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ── 8. Send response (never send password) ────
    const { password: _, tokens: __, ...userWithoutSensitiveData } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: userWithoutSensitiveData,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
});

module.exports = authRouter;
