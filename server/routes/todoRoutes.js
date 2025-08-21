// File: routes/todoRoutes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} = require("../controllers/todoController");

// Apply authentication middleware to all todo routes
router.use(authMiddleware);

/**
 * @route   GET /api/todos
 * @desc    Get all todos for authenticated user
 * @access  Private
 */
router.get("/todos", getTodos);

/**
 * @route   POST /api/todos
 * @desc    Create a new todo
 * @access  Private
 */
router.post("/todos", createTodo);

/**
 * @route   PUT /api/todos/:id
 * @desc    Update a todo
 * @access  Private
 */
router.put("/todos/:id", updateTodo);

/**
 * @route   DELETE /api/todos/:id
 * @desc    Delete a todo
 * @access  Private
 */
router.delete("/todos/:id", deleteTodo);

module.exports = router;
