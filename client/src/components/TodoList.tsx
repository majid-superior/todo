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
    page: 1,
    limit: 10,
  });
  const [showTodoForm, setShowTodoForm] = useState<boolean>(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  useEffect(() => {
    getTodos(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof TodoFilters, value: string): void => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage: number): void => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTodoCreated = (): void => {
    setShowTodoForm(false);
    // Refresh the todo list
    getTodos(filters);
  };

  const handleEditTodo = (todoId: string): void => {
    setEditingTodoId(todoId);
  };

  const handleTodoUpdated = (): void => {
    setEditingTodoId(null);
    // Refresh the todo list
    getTodos(filters);
  };

  const handleCancelEdit = (): void => {
    setEditingTodoId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="capitalize text-4xl">Loading your todos...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex flex-col w-4/5">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 py-2 shadow-md xl:gap-4 xl:py-4">
          <h1 className="text-2xl font-bold text-blue-500 xl:text-4xl">
            My Todos
          </h1>
          <p className="capitalize text-2xl xl:text-4xl">
            total todo{pagination.total !== 1 ? "s" : ""} {pagination.total}
          </p>
          <button
            className="td-button-blue"
            onClick={() => setShowTodoForm(true)}
            disabled={showTodoForm}
          >
            Add Todo
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex justify-center items-center p-2 text-red-500 text-xl xl:text-2xl xl:p-4">
            {error}
          </div>
        )}

        {/* Todo Form */}
        {showTodoForm && (
          <div className="slide-in">
            <TodoForm
              onSuccess={handleTodoCreated}
              onCancel={() => setShowTodoForm(false)}
            />
          </div>
        )}

        {/* Filters */}
        <div className="todo-filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filters.completed}
              onChange={(e) => handleFilterChange("completed", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Completed</option>
              <option value="false">Pending</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priority-filter">Priority</label>
            <select
              id="priority-filter"
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-filter">Sort By</label>
            <select
              id="sort-filter"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="order-filter">Order</label>
            <select
              id="order-filter"
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="limit-filter">Items per page</label>
            <select
              id="limit-filter"
              value={filters.limit}
              onChange={(e) => handleFilterChange("limit", e.target.value)}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* Active Filters Info */}
        {(filters.completed || filters.priority) && (
          <div className="active-filters">
            <h4>Active Filters:</h4>
            <div className="filter-tags">
              {filters.completed && (
                <span className="filter-tag">
                  Status:{" "}
                  {filters.completed === "true" ? "Completed" : "Pending"}
                  <button
                    onClick={() => handleFilterChange("completed", "")}
                    className="filter-remove"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.priority && (
                <span className="filter-tag">
                  Priority: {filters.priority}
                  <button
                    onClick={() => handleFilterChange("priority", "")}
                    className="filter-remove"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Todo List */}
        <div className="todo-list">
          {todos.length === 0 ? (
            <div className="empty-state">
              {Object.values(filters).some(
                (filter) => filter !== "" && filter !== "1" && filter !== "10"
              )
                ? "No todos match your current filters. Try adjusting your search criteria."
                : "No todos yet. Create your first todo to get started!"}
              {Object.values(filters).some(
                (filter) => filter !== "" && filter !== "1" && filter !== "10"
              ) && (
                <button
                  className="clear-filters-btn"
                  onClick={() =>
                    setFilters({
                      completed: "",
                      priority: "",
                      sortBy: "createdAt",
                      sortOrder: "desc",
                      page: 1,
                      limit: 10,
                    })
                  }
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            todos.map((todo) =>
              editingTodoId === todo._id ? (
                <TodoForm
                  key={todo._id}
                  todo={todo}
                  onSuccess={handleTodoUpdated}
                  onCancel={handleCancelEdit}
                  isEditing={true}
                />
              ) : (
                <TodoItem key={todo._id} todo={todo} onEdit={handleEditTodo} />
              )
            )
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="pagination-btn"
            >
              ← Previous
            </button>

            <div className="pagination-info">
              <span>
                Page {pagination.current} of {pagination.pages}
              </span>
              <span className="pagination-total">
                ({pagination.total} items)
              </span>
            </div>

            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        )}

        {/* Quick Stats */}
        {todos.length > 0 && (
          <div className="todo-stats">
            <div className="stat-item">
              <span className="stat-number">
                {todos.filter((todo) => todo.completed).length}
              </span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {todos.filter((todo) => !todo.completed).length}
              </span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {todos.filter((todo) => todo.priority === "high").length}
              </span>
              <span className="stat-label">High Priority</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
