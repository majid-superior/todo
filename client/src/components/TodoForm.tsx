// src/components/TodoForm.tsx
import React, { useState } from "react";
import { useTodos } from "../contexts/TodoContext";
import { Todo, Priority } from "../types"; // Import Priority type if you have it

interface TodoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  todo?: Todo;
  isEditing?: boolean;
}

const TodoForm: React.FC<TodoFormProps> = ({
  onSuccess,
  onCancel,
  todo,
  isEditing = false,
}) => {
  const { createTodo, updateTodo } = useTodos();
  const [title, setTitle] = useState(todo?.title || "");
  const [description, setDescription] = useState(todo?.description || "");
  const [priority, setPriority] = useState<Priority>(
    todo?.priority || "medium"
  );
  const [dueDate, setDueDate] = useState(
    todo?.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : ""
  );
  const [completed, setCompleted] = useState(todo?.completed || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const todoData = {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        completed,
      };

      if (isEditing && todo) {
        await updateTodo(todo._id, todoData);
      } else {
        await createTodo(todoData);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as Priority);
  };

  return (
    <div className="todo-form-container">
      <form onSubmit={handleSubmit} className="todo-form">
        <h3>{isEditing ? "Edit Todo" : "Add New Todo"}</h3>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter todo title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter todo description (optional)"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={handlePriorityChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {isEditing && (
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              Completed
            </label>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !title.trim()}
          >
            {loading ? "Saving..." : isEditing ? "Update Todo" : "Add Todo"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TodoForm;
