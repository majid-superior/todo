const express = require("express");
const router = express.Router();
const {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} = require("../controllers/todoController");

// The GET route to fetch all todos
router.get("/todos", getTodos);

// The POST route to create a new todo
router.post("/todos", createTodo);

// The PUT route to update a todo by its ID
router.put("/todos/:id", updateTodo);

// The DELETE route to delete a todo by its ID
router.delete("/todos/:id", deleteTodo);

module.exports = router;
