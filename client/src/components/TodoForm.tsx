import React, { useState } from "react";
import { useTodos } from "../contexts/TodoContext";
import { CreateTodoData } from "../types";

const TodoForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateTodoData>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });
  const { createTodo, error, setError } = useTodos();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const result = await createTodo(formData);
    if (result.success) {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
      });
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button className="add-todo-btn" onClick={() => setIsOpen(true)}>
        + Add Todo
      </button>
    );
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <h3>Add New Todo</h3>

      {error && <div className="error-message">{error}</div>}

      <input
        type="text"
        name="title"
        placeholder="Title*"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        rows={3}
      />

      <select name="priority" value={formData.priority} onChange={handleChange}>
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>

      <input
        type="datetime-local"
        name="dueDate"
        value={formData.dueDate}
        onChange={handleChange}
      />

      <div className="form-actions">
        <button type="submit">Add Todo</button>
        <button type="button" onClick={() => setIsOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TodoForm;
