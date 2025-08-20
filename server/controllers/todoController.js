const Todo = require("../models/Todo");

// @desc    Get all todos
// @route   GET /api/todos
// @access  Public
const getTodos = async (req, res) => {
  try {
    // const todos = await Todo.find({});
    const todos = await Todo.find({}).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a new todo
// @route   POST /api/todos
// @access  Public
const createTodo = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }
  const todo = new Todo({
    title,
  });

  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Public
const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (todo) {
      todo.title = req.body.title || todo.title;
      todo.completed =
        req.body.completed !== undefined ? req.body.completed : todo.completed;

      const updatedTodo = await todo.save();
      res.json(updatedTodo);
    } else {
      res.status(404).json({ message: "Todo not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Public
const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (todo) {
      await Todo.deleteOne({ _id: req.params.id });
      res.json({ message: "Todo removed" });
    } else {
      res.status(404).json({ message: "Todo not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};
