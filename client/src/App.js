import React, { useEffect, useState } from "react";
import "./App.css";
import Notification from "./Notification";
import useNotification from "./useNotification";

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const { notification, showNotification } = useNotification();

  // Use the environment variable for the API URL
  const API_URL = process.env.REACT_APP_API_URL;

  // Function to fetch todos
  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/todos`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Check for duplicate tasks
  const isDuplicate = (title) => {
    return todos.some(
      (todo) => todo.title.toLowerCase() === title.toLowerCase().trim()
    );
  };

  // Function to create a new todo
  const handleCreateTodo = async (e) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) {
      showNotification("Task cannot be empty.", "error");
      return;
    }

    if (isDuplicate(newTodoTitle)) {
      showNotification("This task already exists.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTodoTitle }),
      });
      if (response.ok) {
        setNewTodoTitle("");
        fetchTodos();
        showNotification("Task added successfully!", "success");
      } else {
        showNotification("Failed to add task.", "error");
      }
    } catch (error) {
      console.error("Error creating todo:", error);
      showNotification("An error occurred.", "error");
    }
  };

  // Function to update a todo (toggle completed)
  const handleUpdateTodo = async (id, completed) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !completed }),
      });
      if (response.ok) {
        fetchTodos();
        showNotification(
          `Task marked as ${!completed ? "completed" : "incomplete"}!`,
          "success"
        );
      } else {
        showNotification("Failed to update task.", "error");
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      showNotification("An error occurred.", "error");
    }
  };

  // Function to delete a todo
  const handleDeleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchTodos();
        showNotification("Task deleted successfully!", "success");
      } else {
        showNotification("Failed to delete task.", "error");
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
      showNotification("An error occurred.", "error");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
        />
        <h1>My Todo List</h1>
        <form onSubmit={handleCreateTodo} className="todo-form">
          <input
            type="text"
            placeholder="Add a new todo..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
          />
          <button type="submit">Add Todo</button>
        </form>

        {loading ? (
          <p>Loading todos...</p>
        ) : todos.length > 0 ? (
          <ul className="todo-list">
            {todos.map((todo, index) => (
              <li key={todo._id} className="todo-item">
                <span className="serial-number">{index + 1}.</span>
                <span
                  style={{
                    textDecoration: todo.completed ? "line-through" : "none",
                  }}
                >
                  {todo.title}
                </span>
                <div className="todo-actions">
                  <button
                    onClick={() => handleUpdateTodo(todo._id, todo.completed)}
                  >
                    {todo.completed ? "Undo" : "Complete"}
                  </button>
                  <button onClick={() => handleDeleteTodo(todo._id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No todos found. Add some using the form above!</p>
        )}
      </header>
    </div>
  );
}

export default App;
