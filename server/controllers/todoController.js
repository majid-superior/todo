// File: controllers/todoController.js
const { Todo } = require("../dbConfig");

/**
 * Get all todos for authenticated user
 * @route GET /api/todos
 * @access Private
 */
const getTodos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      completed,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { userId: req.user.userId };

    if (completed !== undefined) {
      filter.completed = completed === "true";
    }

    if (priority && ["low", "medium", "high"].includes(priority)) {
      filter.priority = priority;
    }

    // Build sort object
    const sort = {};
    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "dueDate",
      "priority",
      "title",
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const todos = await Todo.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v") // Exclude version key
      .lean();

    const total = await Todo.countDocuments(filter);

    res.json({
      success: true,
      data: {
        todos,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get todos error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch todos. Please try again later.",
    });
  }
};

/**
 * Create a new todo
 * @route POST /api/todos
 * @access Private
 */
const createTodo = async (req, res) => {
  try {
    const { title, description, completed, priority, dueDate } = req.body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const trimmedTitle = title.trim();

    // Check for duplicate todo title for this user
    const existingTodo = await Todo.findOne({
      title: trimmedTitle,
      userId: req.user.userId,
    });

    if (existingTodo) {
      return res.status(409).json({
        success: false,
        message: "Todo with this title already exists",
      });
    }

    // Validate due date if provided
    if (dueDate && new Date(dueDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Due date must be in the future",
      });
    }

    // Create new todo
    const todo = new Todo({
      title: trimmedTitle,
      description: description?.trim(),
      completed: completed || false,
      priority: priority || "medium",
      dueDate: dueDate || null,
      userId: req.user.userId,
    });

    await todo.save();

    res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: { todo },
    });
  } catch (error) {
    console.error("Create todo error:", error);

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
      message: "Failed to create todo. Please try again later.",
    });
  }
};

/**
 * Update a todo
 * @route PUT /api/todos/:id
 * @access Private
 */
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove immutable fields
    delete updates._id;
    delete updates.userId;
    delete updates.createdAt;

    // Validate due date if provided
    if (updates.dueDate && new Date(updates.dueDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Due date must be in the future",
      });
    }

    // Trim title and description if provided
    if (updates.title) {
      updates.title = updates.title.trim();
      if (updates.title.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }
    }

    if (updates.description) {
      updates.description = updates.description.trim();
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updates,
      {
        new: true,
        runValidators: true,
        lean: true,
      }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    res.json({
      success: true,
      message: "Todo updated successfully",
      data: { todo },
    });
  } catch (error) {
    console.error("Update todo error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid todo ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update todo. Please try again later.",
    });
  }
};

/**
 * Delete a todo
 * @route DELETE /api/todos/:id
 * @access Private
 */
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    res.json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.error("Delete todo error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid todo ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete todo. Please try again later.",
    });
  }
};

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};
