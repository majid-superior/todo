// File: routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/userController");

/**
 * @route   POST /api/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", loginUser);

module.exports = router;
