import React, { useState, useEffect } from "react";
import { useTodos } from "../contexts/TodoContext";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";
import { TodoFilters } from "../types";

const TodoList: React.FC = () => {
  const { todos, loading, error, getTodos, pagination } = useTodos();
  const [filters, setFilters] = useState<TodoFilters>({
    completed: "",
    priority: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    getTodos(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof TodoFilters, value: string): void => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className="todo-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your todos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="todo-page">
      <div className="container">
        <div className="todo-container fade-in">
          <div className="todo-header">
            <h1>My Todos</h1>
            <button
              className="add-todo-btn"
              onClick={() => {
                /* Add logic to show form */
              }}
            >
              ＋ Add New Todo
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Filters */}
          <div className="todo-filters">
            <select
              value={filters.completed}
              onChange={(e) => handleFilterChange("completed", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Completed</option>
              <option value="false">Pending</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <option value="createdAt">Created Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>

            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Todo Form (you'll need to implement the toggle logic) */}
          {/* <TodoForm /> */}

          {/* Todo List */}
          <div className="todo-list">
            {todos.length === 0 ? (
              <div className="empty-state">
                {Object.values(filters).some((filter) => filter !== "")
                  ? "No todos match your current filters"
                  : "No todos yet. Create your first todo to get started!"}
              </div>
            ) : (
              todos.map((todo) => <TodoItem key={todo._id} todo={todo} />)
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              {/* Add pagination controls here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoList;
