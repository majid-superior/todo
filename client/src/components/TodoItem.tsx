// src/components/TodoItem.tsx
import React, { useState } from "react";
import { useTodos } from "../contexts/TodoContext";
import { Todo } from "../types";

interface TodoItemProps {
  todo: Todo;
  onEdit?: (todoId: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onEdit }) => {
  const { updateTodo, deleteTodo } = useTodos();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleToggleComplete = async () => {
    setLoading(true);
    setError("");
    try {
      await updateTodo(todo._id, { completed: !todo.completed });
    } catch (err: any) {
      setError(err.message || "Failed to update todo");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this todo?")) return;

    setLoading(true);
    setError("");
    try {
      await deleteTodo(todo._id);
    } catch (err: any) {
      setError(err.message || "Failed to delete todo");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "priority-medium";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`todo-item ${todo.completed ? "completed" : ""}`}>
      {error && <div className="error-message">{error}</div>}

      <div className="todo-content">
        <div className="todo-header">
          <h3 className="todo-title">{todo.title}</h3>
          <span className={`priority-badge ${getPriorityColor(todo.priority)}`}>
            {todo.priority}
          </span>
        </div>

        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}

        <div className="todo-meta">
          {todo.dueDate && (
            <span className="due-date">Due: {formatDate(todo.dueDate)}</span>
          )}
          <span className="created-date">
            Created: {formatDate(todo.createdAt)}
          </span>
          {todo.updatedAt !== todo.createdAt && (
            <span className="updated-date">
              Updated: {formatDate(todo.updatedAt)}
            </span>
          )}
        </div>
      </div>

      <div className="todo-actions">
        <button
          onClick={handleToggleComplete}
          disabled={loading}
          className={`status-btn ${todo.completed ? "completed" : "pending"}`}
        >
          {todo.completed ? "Mark Pending" : "Mark Complete"}
        </button>

        {onEdit && (
          <button
            onClick={() => onEdit(todo._id)}
            disabled={loading}
            className="edit-btn"
          >
            Edit
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={loading}
          className="delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
