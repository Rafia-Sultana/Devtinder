const express = require("express");
const router  = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  validateTokenController,
} = require("../controllers/password.controller");

// ── Public routes (no auth needed) ───────────────────
router.post("/forgot-password",               forgotPasswordController);
router.post("/reset-password/:token",         resetPasswordController);
router.get ("/reset-password/:token/validate",validateTokenController);

// ── Protected route (must be logged in) ──────────────
router.post("/change-password", authMiddleware, changePasswordController);

module.exports = router;