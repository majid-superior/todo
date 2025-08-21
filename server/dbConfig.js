// File: dbConfig.js
const mongoose = require("mongoose");

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await initializeSchemas();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-z0-9_]+$/,
      "Username can only contain lowercase letters, numbers, and underscores",
    ],
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [30, "Username cannot exceed 30 characters"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

// Todo Schema
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: {
      values: ["low", "medium", "high"],
      message: "Priority must be low, medium, or high",
    },
    default: "medium",
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function (date) {
        return !date || date > new Date();
      },
      message: "Due date must be in the future",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
});

// Update updatedAt timestamp before saving
todoSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better performance
todoSchema.index({ userId: 1, createdAt: -1 });
todoSchema.index({ userId: 1, completed: 1 });

const User = mongoose.model("User", userSchema);
const Todo = mongoose.model("Todo", todoSchema);

/**
 * Initialize database schemas and collections
 * @returns {Promise<void>}
 */
const initializeSchemas = async () => {
  try {
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((coll) => coll.name);

    if (!collectionNames.includes("users")) {
      console.log("⚠️  Users collection will be created on first insert");
    } else {
      console.log("✅ Users collection exists");
    }

    if (!collectionNames.includes("todos")) {
      console.log("⚠️  Todos collection will be created on first insert");
    } else {
      console.log("✅ Todos collection exists");
    }

    console.log("✅ Database schemas initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database schemas:", error.message);
  }
};

module.exports = { connectDB, User, Todo };
