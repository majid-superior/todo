// File: controllers/userController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../dbConfig");

// Validation constants
const MIN_PASSWORD_LENGTH = 6;
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 30;

/**
 * Validate user registration input
 * @param {string} username - Username to validate
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
const validateRegistration = (username, password) => {
  const errors = [];

  if (!username || username.trim().length < MIN_USERNAME_LENGTH) {
    errors.push(
      `Username must be at least ${MIN_USERNAME_LENGTH} characters long`
    );
  }

  if (username.length > MAX_USERNAME_LENGTH) {
    errors.push(`Username cannot exceed ${MAX_USERNAME_LENGTH} characters`);
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    errors.push(
      "Username can only contain lowercase letters, numbers, and underscores"
    );
  }

  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    errors.push(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Register a new user
 * @route POST /api/register
 * @access Public
 */
const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    const validation = validateRegistration(username, password);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      username: username.toLowerCase().trim(),
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username: username.toLowerCase().trim(),
      password: hashedPassword,
    });

    await user.save();

    // ✅ FIXED: Generate JWT token for immediate login after registration
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        issuer: "todo-app-api",
      }
    );

    // ✅ FIXED: Return token and user data (same format as login)
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

/**
 * Login user
 * @route POST /api/login
 * @access Public
 */
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      username: username.toLowerCase().trim(),
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        issuer: "todo-app-api",
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

module.exports = { registerUser, loginUser };
