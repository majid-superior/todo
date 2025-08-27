import React, { useState } from "react";
import { useTodos } from "../contexts/TodoContext";
import { Todo, UpdateTodoData } from "../types";

interface TodoItemProps {
  todo: Todo;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editData, setEditData] = useState<UpdateTodoData>({
    title: todo.title,
    description: todo.description || "",
    priority: todo.priority,
    dueDate: todo.dueDate
      ? new Date(todo.dueDate).toISOString().slice(0, 16)
      : "",
    completed: todo.completed,
  });
  const { updateTodo, deleteTodo } = useTodos();

  const handleUpdate = async (updates: UpdateTodoData): Promise<void> => {
    const result = await updateTodo(todo._id, updates);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleToggleComplete = (): void => {
    handleUpdate({ completed: !todo.completed });
  };

  const handleEditSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    handleUpdate(editData);
  };

  const handleDelete = (): void => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      deleteTodo(todo._id);
    }
  };

  const priorityColors: { [key: string]: string } = {
    high: "#ff4757",
    medium: "#ffa502",
    low: "#2ed573",
  };

  if (isEditing) {
    return (
      <form className="todo-item editing" onSubmit={handleEditSubmit}>
        <input
          type="text"
          value={editData.title || ""}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          required
        />
        <textarea
          value={editData.description || ""}
          onChange={(e) =>
            setEditData({ ...editData, description: e.target.value })
          }
          rows={2}
        />
        <select
          value={editData.priority}
          onChange={(e) =>
            setEditData({
              ...editData,
              priority: e.target.value as "low" | "medium" | "high",
            })
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="datetime-local"
          value={editData.dueDate || ""}
          onChange={(e) =>
            setEditData({ ...editData, dueDate: e.target.value })
          }
        />
        <div className="todo-actions">
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <div className="todo-content">
        <div className="todo-header">
          <h3>{todo.title}</h3>
          <span
            className="priority-badge"
            style={{ backgroundColor: priorityColors[todo.priority] }}
          >
            {todo.priority}
          </span>
        </div>

        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}

        {todo.dueDate && (
          <p className="todo-due-date">
            Due: {new Date(todo.dueDate).toLocaleString()}
          </p>
        )}

        <p className="todo-date">
          Created: {new Date(todo.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="todo-actions">
        <button
          onClick={handleToggleComplete}
          className={todo.completed ? "completed-btn" : "complete-btn"}
        >
          {todo.completed ? "Undo" : "Complete"}
        </button>
        <button onClick={() => setIsEditing(true)}>Edit</button>
        <button onClick={handleDelete} className="delete-btn">
          Delete
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
