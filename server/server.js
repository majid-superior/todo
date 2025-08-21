// File: server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const { connectDB } = require("./dbConfig");
const path = require("path");
const todoRoutes = require("./routes/todoRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingEnvVars.join(", ")
  );
  process.exit(1);
}

/* ----------------------------- Middleware ----------------------------- */

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration (handles preflight automatically)
const allowedOrigins = process.env.FRONTEND_ORIGINS
  ? process.env.FRONTEND_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("CORS blocked request from origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  const serverInfo = {
    server: "Express Todo API Server",
    port: PORT,
    status: "Running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  };

  // Define API routes information for the welcome page
  const apiRoutes = [
    {
      path: "/api/register",
      method: "POST",
      description: "Register a new user",
    },
    { path: "/api/login", method: "POST", description: "User login" },
    {
      path: "/api/todos",
      method: "GET",
      description: "Get all todos (requires auth)",
    },
    {
      path: "/api/todos",
      method: "POST",
      description: "Create a new todo (requires auth)",
    },
    {
      path: "/api/todos/:id",
      method: "PUT",
      description: "Update a todo (requires auth)",
    },
    {
      path: "/api/todos/:id",
      method: "DELETE",
      description: "Delete a todo (requires auth)",
    },
  ];

  res.render("welcome", { serverInfo, apiRoutes });
});

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", generalLimiter);
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);

/* ----------------------------- Routes ----------------------------- */

app.use("/api", userRoutes);
app.use("/api", todoRoutes);

// ✅ 404 handler (Express v5-safe)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* ------------------------- Error Handling Middleware ------------------------ */

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  if (error.message === "Not allowed by CORS") {
    return res
      .status(403)
      .json({ success: false, message: "Request not permitted" });
  }

  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);
    return res
      .status(400)
      .json({ success: false, message: "Validation failed", errors });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  res.status(500).json({ success: false, message: "Internal server error" });
});

/* ---------------------------- Graceful Shutdown ---------------------------- */

// Declare server variable at the top level
let server;

const gracefulShutdown = async () => {
  try {
    console.log("\n🛑 Received shutdown signal. Closing server gracefully...");

    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          console.log("✅ HTTP server closed.");
          resolve();
        });
      });
    }

    if (mongoose.connection.readyState !== 0) {
      // Check if MongoDB is connected
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

/* ---------------------------- Server Startup ---------------------------- */

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`
🚀 Server running on port ${PORT}
📍 Health check: http://localhost:${PORT}
        `);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
